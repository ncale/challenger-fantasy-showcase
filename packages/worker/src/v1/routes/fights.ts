import {
  errorResponseDtoSchema,
  fightDtoSchema,
  idOrSlugRequestParamsSchema,
  preFightStatsDtoSchema,
} from "@challenger-fantasy/schemas";
import { createRoute } from "@hono/zod-openapi";
import { httpCache } from "../../lib/middleware";

// TODO: TWO ROUTES
// 1. /fight, which returns a list, and
// 2. /fight/:idOrSlug which returns a single fight

export const singleFightRoute = createRoute({
  method: "get",
  path: "/fights/:idOrSlug",
  request: {
    params: idOrSlugRequestParamsSchema,
  },
  middleware: [httpCache(3600)],
  responses: {
    200: {
      content: { "application/json": { schema: fightDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Game not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const preFightStatsRoute = createRoute({
  method: "get",
  path: "/fights/:idOrSlug/pre-fight-stats",
  request: {
    params: idOrSlugRequestParamsSchema,
  },
  middleware: [httpCache(86400)], // (3 days)
  responses: {
    200: {
      content: { "application/json": { schema: preFightStatsDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Game not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});
