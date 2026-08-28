import {
  errorResponseDtoSchema,
  groupedSubmissionsDtoSchema,
  idRequestParamsSchema,
  pickRankingDtoSchema,
  pickRankingQueryParamsSchema,
  submissionsDtoSchema,
  upsertPickRankingBodySchema,
  userProfileDtoSchema,
  userProfileSnakeCaseDtoSchema,
  userStatsDtoSchema,
  userSubmissionCountsDtoSchema,
  userSubmissionCountsQueryParamsSchema,
  userSubmissionEventsDtoSchema,
  userSubmissionEventsQueryParamsSchema,
  userSubmissionsQueryParamsSchema,
} from "../schemas";

import { createRoute } from "@hono/zod-openapi";
import { httpCache, validateBearerToken } from "../lib/middleware";

// TODO: TWO ROUTES, only other route when returning a different entity, eg. submissions
// 1. /<entity>, which returns a list, and
// 2. /<entity>/:idOrSlug which returns a single item

export const userProfileRoute = createRoute({
  method: "get",
  path: "/users/:id/profile",
  request: {
    params: idRequestParamsSchema,
  },
  middleware: [httpCache(180)],
  responses: {
    200: {
      content: { "application/json": { schema: userProfileDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "User not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

// ! DEPRECATED - use /users/:id/profile instead
export const userProfileSnakeCaseRoute = createRoute({
  method: "get",
  path: "/users/profile/:id",
  request: {
    params: idRequestParamsSchema,
  },
  middleware: [httpCache(180)],
  responses: {
    200: {
      content: { "application/json": { schema: userProfileSnakeCaseDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "User not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const deleteMyAccountRoute = createRoute({
  method: "delete",
  path: "/users/me",
  middleware: [validateBearerToken],
  responses: {
    204: { description: "Account deleted successfully" },
    401: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Unauthorized",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server error",
    },
  },
});

export const userSubmissionCountsRoute = createRoute({
  method: "get",
  path: "/users/:id/submission-counts",
  request: { params: idRequestParamsSchema, query: userSubmissionCountsQueryParamsSchema },
  middleware: [httpCache(30)],
  responses: {
    200: {
      content: {
        "application/json": { schema: userSubmissionCountsDtoSchema },
      },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "User not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const userSubmissionsRoute = createRoute({
  method: "get",
  path: "/users/:id/submissions",
  request: {
    params: idRequestParamsSchema,
    query: userSubmissionsQueryParamsSchema,
  },
  middleware: [httpCache(300)],
  responses: {
    200: {
      content: { "application/json": { schema: submissionsDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "User not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const userStatsRoute = createRoute({
  method: "get",
  path: "/users/:id/stats",
  request: { params: idRequestParamsSchema },
  middleware: [httpCache(300)],
  responses: {
    200: {
      content: { "application/json": { schema: userStatsDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "User not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const getPickRankingRoute = createRoute({
  method: "get",
  path: "/users/me/pick-ranking",
  request: { query: pickRankingQueryParamsSchema },
  middleware: [validateBearerToken],
  responses: {
    200: {
      content: { "application/json": { schema: pickRankingDtoSchema.nullable() } },
      description: "Pick ranking fetched successfully",
    },
    401: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Unauthorized",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const upsertPickRankingRoute = createRoute({
  method: "put",
  path: "/users/me/pick-ranking",
  request: {
    body: { content: { "application/json": { schema: upsertPickRankingBodySchema } } },
  },
  middleware: [validateBearerToken],
  responses: {
    200: {
      content: { "application/json": { schema: pickRankingDtoSchema } },
      description: "Pick ranking upserted successfully",
    },
    401: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Unauthorized",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const userSubmissionEventsRoute = createRoute({
  method: "get",
  path: "/users/:id/submission-events",
  request: { params: idRequestParamsSchema, query: userSubmissionEventsQueryParamsSchema },
  middleware: [httpCache(300)],
  responses: {
    200: {
      content: { "application/json": { schema: userSubmissionEventsDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const userSubmissionsGroupedRoute = createRoute({
  method: "get",
  path: "/users/:id/submissions/grouped",
  request: {
    params: idRequestParamsSchema,
    query: userSubmissionsQueryParamsSchema,
  },
  middleware: [httpCache(300)],
  responses: {
    200: {
      content: { "application/json": { schema: groupedSubmissionsDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "User not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});
