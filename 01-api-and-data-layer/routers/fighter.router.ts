import { PG_ERROR_CODES } from "../data";
import {
  mapFighterToDto as mapFighterSupabaseTableToDto,
  mapFighterToSimpleDto,
} from "../data/models";
import { OpenAPIHono } from "@hono/zod-openapi";
import { codeInError } from "../lib/api-utils";
import {
  getDataClient,
  getFighterAnalyticsRepository,
  getFighterRepository,
  getFighterScoringService,
} from "../lib/data";
import type { Variables } from "../lib/types";
import { mapFighterToDto } from "../mappers/fighter.dto.mapper";
import { mapFighterAnalyticsToDto } from "../mappers/fighter-analytics.dto.mapper";
import {
  fighterScoringRoute,
  fightersRoute,
  singleFighterAnalyticsRoute,
  singleFighterRoute,
  singleSimpleFighterRoute,
} from "../routes/fighter.routes";

// TODO: error catch block can be refactored to a common callback function in `@hono/zod-openapi` handler

const v1FighterRouter = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>()
  .openapi(fightersRoute, async (c) => {
    const { kind } = c.req.valid("query");

    const dataClient = getDataClient(c.env);
    try {
      switch (kind) {
        case "popular": {
          const fighters = await dataClient.fighters.getPopular({ limit: 10 });
          return c.json(fighters.data.map(mapFighterSupabaseTableToDto), 200);
        }
        default: {
          const fighters = await dataClient.fighters.getMany();
          return c.json(fighters.data.map(mapFighterSupabaseTableToDto), 200);
        }
      }
    } catch (error) {
      return c.json({ message: `Failed to fetch: ${JSON.stringify(error)}` }, 500);
    }
  })
  .openapi(singleSimpleFighterRoute, async (c) => {
    const { idOrSlug } = c.req.valid("param");

    const dataClient = getDataClient(c.env);
    try {
      const fighter = await dataClient.fighters.getOneSimple(idOrSlug);
      const dto = mapFighterToSimpleDto(fighter);
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
  .openapi(singleFighterRoute, async (c) => {
    const { idOrSlug } = c.req.valid("param");

    const fighterRepository = getFighterRepository(c.env);
    try {
      const fighter = await fighterRepository.getById(idOrSlug);
      const dto = mapFighterToDto(fighter);
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
      if (error instanceof Error) {
        return c.json({ message: `Failed to fetch: ${error.message}` }, 500);
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(singleFighterAnalyticsRoute, async (c) => {
    const { idOrSlug } = c.req.valid("param");

    const fighterAnalyticsRepository = getFighterAnalyticsRepository(c.env);
    try {
      const fighter = await fighterAnalyticsRepository.getAnalyticsById(idOrSlug);
      const dto = mapFighterAnalyticsToDto(fighter);
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
  .openapi(fighterScoringRoute, async (c) => {
    const { fighterId } = c.req.valid("param");
    const { scoringProfile, fightId } = c.req.valid("query");

    const service = getFighterScoringService(c.env);
    try {
      const scoring = await service.getScoringByFightId(fighterId, fightId, scoringProfile);
      return c.json(scoring, 200);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "Fighter scoring not found" }, 404);
        }
      }
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  });

export { v1FighterRouter };
