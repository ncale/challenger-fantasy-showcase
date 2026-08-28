import { PG_ERROR_CODES } from "../data";
import { getGameName, mapFightToDto } from "../data/models";
import type { EventCardDto, EventWithGamesDto } from "../schemas";
import { parseFullEventName } from "../data/shared";
import { isNullish } from "../data/utils";
import { OpenAPIHono } from "@hono/zod-openapi";
import { codeInError } from "../lib/api-utils";
import { getDataClient, getFighterAnalyticsRepository } from "../lib/data";
import type { Variables } from "../lib/types";
import { mapFighterAnalyticsToDto } from "../mappers/fighter-analytics.dto.mapper";
import { eventCardRoute, eventsListRoute, singleEventRoute } from "../routes/event.routes";

// TODO: error catch block can be refactored to a common callback function in `@hono/zod-openapi` handler

const v1EventRouter = new OpenAPIHono<{ Bindings: Env; Variables: Variables }>()
  .openapi(eventsListRoute, async (c) => {
    const { status, pageSize, page } = c.req.valid("query");
    const dataClient = getDataClient(c.env);

    try {
      const result = await dataClient.events.getList({
        status,
        page,
        pageSize,
      });

      const eventsWithGames = await Promise.all(
        result.data.map(async (event) => {
          const games = await dataClient.events.getGames(event.id);
          const { seriesName, headlineName } = parseFullEventName(event.name);

          return {
            id: event.id,
            name: event.name,
            seriesName,
            headlineName,
            slug: event.slug,
            status: event.status,
            eventDate: event.event_date,
            startTimeUtc: event.start_time,
            prelimsStartTimeUtc: event.prelims_start_time,
            mainCardStartTimeUtc: event.main_card_start_time,
            games: games.map((game) => ({
              id: game.id,
              eventId: game.event_id,
              name: getGameName(game.config, game.metadata),
              config: game.config,
              metadata: game.metadata,
            })),
          } satisfies EventWithGamesDto;
        }),
      );

      return c.json(
        {
          events: eventsWithGames,
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
        },
        200,
      );
    } catch (error) {
      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(singleEventRoute, async (c) => {
    const { idOrSlug } = c.req.valid("param");

    const dataClient = getDataClient(c.env);
    try {
      const event = await dataClient.events.getOne(idOrSlug);
      const games = await dataClient.events.getGames(event.id);

      const { seriesName, headlineName } = parseFullEventName(event.name);

      const dto = {
        id: event.id,
        name: event.name,
        seriesName,
        headlineName,
        slug: event.slug,
        status: event.status,
        eventDate: event.event_date,
        startTimeUtc: event.start_time,
        prelimsStartTimeUtc: event.prelims_start_time,
        mainCardStartTimeUtc: event.main_card_start_time,
        games: games.map((game) => ({
          id: game.id,
          eventId: game.event_id,
          name: getGameName(game.config, game.metadata),
          config: game.config,
          metadata: game.metadata,
        })),
      } satisfies EventWithGamesDto;

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
  .openapi(eventCardRoute, async (c) => {
    const dataClient = getDataClient(c.env);

    const { idOrSlug } = c.req.valid("param");
    const { top } = c.req.valid("query");

    try {
      const allFights = await dataClient.events.getFights(idOrSlug);
      const fights = isNullish(top) ? allFights : allFights.slice(0, top);

      const fightIds = fights.map((f) => f.fight_id);
      const oddsMap = await dataClient.events.getLatestOddsForFights(fightIds);

      const fighterFightsMap = new Map<string, (typeof fights)[number]>();
      for (const fight of fights) {
        fighterFightsMap.set(fight.fighter_1_id, fight);
        fighterFightsMap.set(fight.fighter_2_id, fight);
      }

      const fighters = fights.flatMap((f) => [
        { id: f.fighter_1_id, name: f.fighter_1_name, slug: f.fighter_1_slug },
        { id: f.fighter_2_id, name: f.fighter_2_name, slug: f.fighter_2_slug },
      ]);

      const fighterIds = fighters.map((f) => f.id);
      const analyticsRepo = getFighterAnalyticsRepository(c.env);
      const analyticsModels = await analyticsRepo.getAnalyticsByIds(fighterIds);

      const dto = {
        fights: fights.map(mapFightToDto),
        fighters,
        fighterEventInfo: fighters.map((fighter) => {
          const fight = fighterFightsMap.get(fighter.id);
          const isF1 = fight?.fighter_1_id === fighter.id;
          return {
            fighterId: fighter.id,
            // TODO: implement projected points calculation
            projectedPoints: 0,
            opponent: {
              id: isF1 ? (fight?.fighter_2_id ?? "") : (fight?.fighter_1_id ?? ""),
              name: isF1 ? (fight?.fighter_2_name ?? "") : (fight?.fighter_1_name ?? ""),
              slug: isF1 ? (fight?.fighter_2_slug ?? "") : (fight?.fighter_1_slug ?? ""),
            },
            fightStatus: fight?.status ?? "cancelled",
            fightWeight: fight?.weight_class ?? "n/a",
            // TODO: this is non-nullable, so there doesn't need to be a fallback.
            fightWeightKey: fight?.weight_class_key ?? "n/a",
            winProbability: oddsMap.get(fighter.id) ?? null,
            recentForm: undefined,
          };
        }),
        fighterAnalytics: analyticsModels.map(mapFighterAnalyticsToDto),
      } satisfies EventCardDto;

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
  });

export { v1EventRouter };
