import { CF_REGISTRY, DEFAULT_APP_CONFIG, PG_ERROR_CODES } from "../data";
import { createLogger } from "../logger";
import { getGameName, mapFightToDto, mapPreFightStatsToDto } from "../data/models";
import { isNullish } from "../data/utils";
import { OpenAPIHono } from "@hono/zod-openapi";
import { codeInError } from "../lib/api-utils";
import { getAppConfigService, getDataClient, getFeatureFlagService } from "../lib/data";
import { DraftProtocol, ROUTES } from "../lib/draft-protocol";
import type { Variables } from "../lib/types";
import { appConfigRoute, featureFlagsRoute } from "../routes/config";
import { draftGroupRoute } from "../routes/draft-groups";
import { preFightStatsRoute, singleFightRoute } from "../routes/fights";
import {
  allGameSubmissionCountsRoute,
  joinDemoGameRoute,
  joinGameRoute,
  singleGameRoute,
} from "../routes/games";
import { healthRoute } from "../routes/health";
import { joinDraftRoute } from "../routes/drafts";

// TODO: error catch block can be refactored to a common callback function in `@hono/zod-openapi` handler

const v1Router = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>()
  .openapi(healthRoute, (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() }, 200);
  })
  .openapi(featureFlagsRoute, async (c) => {
    try {
      const flags = await getFeatureFlagService(c.env).getPublic();
      return c.json(flags, 200);
    } catch {
      return c.json({}, 200); // fail open with empty flags — callers default to false
    }
  })
  .openapi(appConfigRoute, async (c) => {
    try {
      const config = await getAppConfigService(c.env).get();
      return c.json(config, 200);
    } catch {
      return c.json(DEFAULT_APP_CONFIG, 200);
    }
  })
  // --- DRAFTS --- //
  .openapi(joinDraftRoute, async (c) => {
    const logger = createLogger({ LOG_LEVEL: c.env.LOG_LEVEL, PRETTY_LOGS: c.env.PRETTY_LOGS });

    if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
      logger.ws.warn({ path: c.req.path }, "ws.upgrade.required");
      return c.json({ message: "Expected websocket upgrade" }, 426);
    }

    try {
      const user = c.get("user");
      const { gameId, draftGroupId } = c.req.valid("query");
      if (draftGroupId) {
        logger.ws.info({ userId: user.id, draftGroupId }, "draft.route.draftGroup");

        const stub = c.env.DRAFT_SERVER.getByName(
          CF_REGISTRY.draftServerDO.getName({ groupId: draftGroupId }),
        );

        // NOTE: DraftServer.getGameId() is an RPC method on the real class in
        // 03-realtime-draft-engine/durable-objects/draft-server.ts. Cloudflare's DO RPC
        // typing requires the concrete class as the stub's generic param (a branded
        // nominal type), which this node deliberately doesn't import — see that node's README.
        const gameId = await stub.getGameId();
        if (isNullish(gameId)) {
          logger.ws.warn({ userId: user.id, draftGroupId }, "draft.route.missing");
          return c.json(
            { message: "Failed to find a server with the provided draft group id" },
            404,
          );
        }

        return DraftProtocol.fetch(stub, ROUTES.join, c.req.raw, {
          gameId,
          draftGroupId,
          userId: user.id,
        });
      }
      if (gameId) {
        logger.ws.info({ userId: user.id, gameId }, "draft.route.game");
        const stub = c.env.DRAFT_MANAGER.getByName(CF_REGISTRY.draftManagerDO.getName({ gameId }));
        return DraftProtocol.fetch(stub, ROUTES.assign, c.req.raw, { gameId, userId: user.id });
      }
      throw new Error("This code should be unreachable");
    } catch (error) {
      logger.ws.error({ error: `${error}` }, "draft.route.failed");
      return c.json({ message: "Failed to join game", error: `${error}` }, 500);
    }
  })
  // --- GAMES --- //
  .openapi(singleGameRoute, async (c) => {
    const { id } = c.req.valid("param");

    const dataClient = getDataClient(c.env);
    try {
      const game = await dataClient.games.getOne(id);

      const dto = {
        id: game.id,
        eventId: game.event_id,
        name: getGameName(game.config, game.metadata),
        config: game.config,
        metadata: game.metadata,
      };

      return c.json(dto, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(joinGameRoute, async (c) => {
    if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
      return c.json({ message: "Expected websocket upgrade" }, 426);
    }

    try {
      const user = c.get("user");
      const { id: gameId } = c.req.valid("param");
      const stub = c.env.DRAFT_MANAGER.getByName(CF_REGISTRY.draftManagerDO.getName({ gameId }));

      return DraftProtocol.fetch(stub, ROUTES.assign, c.req.raw, { gameId, userId: user.id });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Failed to join game", error: `${error}` }, 500);
    }
  })
  .openapi(joinDemoGameRoute, async (c) => {
    const { id: gameId } = c.req.valid("param");
    const { username, userId } = c.req.valid("query");

    try {
      if (c.req.header("upgrade")?.toLowerCase() !== "websocket") {
        return c.json({ message: "Expected websocket upgrade" }, 426);
      }

      // Demo lobbies are namespaced separately from real sessions so they never mix
      const stub = c.env.DRAFT_MANAGER.getByName(
        CF_REGISTRY.draftManagerDO.getDemoName({ gameId }),
      );

      return DraftProtocol.fetch(stub, ROUTES.assign, c.req.raw, {
        gameId,
        userId,
        username,
        isDemo: true,
      });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Failed to join demo game", error: `${error}` }, 500);
    }
  })
  // --- FIGHTS --- //
  .openapi(singleFightRoute, async (c) => {
    const { idOrSlug } = c.req.valid("param");

    const dataClient = getDataClient(c.env);
    try {
      const fight = await dataClient.fights.getOne(idOrSlug);
      const dto = mapFightToDto(fight);
      return c.json(dto, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(preFightStatsRoute, async (c) => {
    const { idOrSlug } = c.req.valid("param");

    const dataClient = getDataClient(c.env);
    try {
      const preFightStats = await dataClient.fights.getPreFightStats(idOrSlug);
      const dto = mapPreFightStatsToDto(preFightStats);
      return c.json(dto, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Resource not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${JSON.stringify(error)}` }, 500);
    }
  })

  // --- GAMES --- //
  .openapi(allGameSubmissionCountsRoute, async (c) => {
    // const query = c.req.valid("query");
    // const status = query.status ?? "scheduled-or-live";

    // const dataClient = getDataClient(c.env);

    try {
      // const games = await dataClient.games.getAllSubmissionCounts(status);
      // return c.json({ games }, 200);

      return c.json({ message: "Not implemented" }, 500);
    } catch (error) {
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  // --- DRAFT GROUPS --- //
  .openapi(draftGroupRoute, async (c) => {
    return c.json({ message: `Not Implemented` }, 501);
  });

export { v1Router };
