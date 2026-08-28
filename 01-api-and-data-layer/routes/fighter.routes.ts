import {
  errorResponseDtoSchema,
  fighterAnalyticsDtoSchema,
  fighterDtoSchema,
  fighterIdRequestParamsSchema,
  fighterScoringEntryDtoSchema,
  fighterScoringQueryParamsSchema,
  fighterSimpleDtoSchema,
  fightersDtoSchema,
  fightersQueryParamsSchema,
  idOrSlugRequestParamsSchema,
} from "../schemas";
import { createRoute } from "@hono/zod-openapi";
import { httpCache } from "../lib/middleware";

// TODO: TWO ROUTES
// 1. /fighters, which returns a list, and
// 2. /fighters/:idOrSlug which returns a single fighter

export const fightersRoute = createRoute({
  method: "get",
  path: "/fighters",
  request: {
    query: fightersQueryParamsSchema,
  },
  middleware: [httpCache(21600)],
  responses: {
    200: {
      content: { "application/json": { schema: fightersDtoSchema } },
      description: "Fighters list fetched successfully",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

// TODO: (as mentioned above) combine simple and full into one route with a ?kind=simple query param
export const singleSimpleFighterRoute = createRoute({
  method: "get",
  path: "/fighters/:idOrSlug/simple",
  request: {
    params: idOrSlugRequestParamsSchema,
  },
  middleware: [httpCache(86_400 * 4)],
  responses: {
    200: {
      content: { "application/json": { schema: fighterSimpleDtoSchema } },
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

export const singleFighterRoute = createRoute({
  method: "get",
  path: "/fighters/:idOrSlug",
  request: {
    params: idOrSlugRequestParamsSchema,
  },
  middleware: [httpCache(86_400 * 4)],
  responses: {
    200: {
      content: { "application/json": { schema: fighterDtoSchema } },
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

export const singleFighterAnalyticsRoute = createRoute({
  method: "get",
  path: "/fighters/:idOrSlug/analytics",
  request: {
    params: idOrSlugRequestParamsSchema,
  },
  middleware: [httpCache(86400)],
  responses: {
    200: {
      content: { "application/json": { schema: fighterAnalyticsDtoSchema } },
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

export const fighterScoringRoute = createRoute({
  method: "get",
  path: "/fighters/:fighterId/scoring",
  request: {
    params: fighterIdRequestParamsSchema,
    query: fighterScoringQueryParamsSchema,
  },
  responses: {
    200: {
      content: { "application/json": { schema: fighterScoringEntryDtoSchema } },
      description: "Fighter scoring breakdown fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Fighter scoring not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});
