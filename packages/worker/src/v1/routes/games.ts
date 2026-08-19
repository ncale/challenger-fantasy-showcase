import {
  allGameSubmissionCountsDtoSchema,
  allGameSubmissionCountsRequestParamsSchema,
  errorResponseDtoSchema,
  gameDtoSchema,
  idRequestParamsSchema,
  joinGameQueryParamsSchema,
  singleGameQueryParamsSchema,
} from "@challenger-fantasy/schemas";
import { createRoute, z } from "@hono/zod-openapi";
import { httpCache, validateBearerToken } from "../../lib/middleware";

export const singleGameRoute = createRoute({
  method: "get",
  path: "/games/:id",
  request: {
    params: idRequestParamsSchema,
    query: singleGameQueryParamsSchema,
  },
  middleware: [httpCache(3600)],
  responses: {
    200: {
      content: { "application/json": { schema: gameDtoSchema } },
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

/** @deprecated Use the joinDraftRoute instead, as it adds ability to join by game id or draft group id */
export const joinGameRoute = createRoute({
  method: "get",
  path: "/games/:id/join",
  middleware: [validateBearerToken] as const,
  request: {
    params: idRequestParamsSchema,
    query: joinGameQueryParamsSchema,
  },
  responses: {
    101: { description: "WebSocket upgrade successful" },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Bad request",
    },
    426: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Upgrade required",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const joinDemoGameRoute = createRoute({
  method: "get",
  path: "/games/:id/join-demo",
  request: {
    params: idRequestParamsSchema,
    query: z.object({
      username: z.string().min(1).max(30),
      userId: z.uuid(),
    }),
  },
  responses: {
    101: { description: "WebSocket upgrade successful" },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Bad request",
    },
    426: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Upgrade required",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server error",
    },
  },
});

export const allGameSubmissionCountsRoute = createRoute({
  method: "get",
  path: "/games/all-submission-counts",
  request: {
    query: allGameSubmissionCountsRequestParamsSchema,
  },
  responses: {
    200: {
      content: { "application/json": { schema: allGameSubmissionCountsDtoSchema } },
      description: "Resource fetched successfully",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});
