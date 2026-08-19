import {
  draftGroupDtoSchema,
  errorResponseDtoSchema,
  idRequestParamsSchema,
  singleSubmissionQueryParamsSchema,
  submissionDetailDtoSchema,
  submissionDraftGroupQueryParamsSchema,
  updateSubmissionNameBodySchema,
} from "@challenger-fantasy/schemas";
import { createRoute } from "@hono/zod-openapi";
import { httpCache, validateBearerToken } from "../../lib/middleware";

// TODO: TWO ROUTES
// 1. /<entity>, which returns a list, and
// 2. /<entity>/:idOrSlug which returns a single item

export const singleSubmissionRoute = createRoute({
  method: "get",
  path: "/submissions/:id",
  request: {
    params: idRequestParamsSchema,
    query: singleSubmissionQueryParamsSchema,
  },
  middleware: [httpCache(3600)],
  responses: {
    200: {
      content: { "application/json": { schema: submissionDetailDtoSchema } },
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

export const updateSubmissionNameRoute = createRoute({
  method: "patch",
  path: "/submissions/:id/name",
  request: {
    params: idRequestParamsSchema,
    body: {
      content: { "application/json": { schema: updateSubmissionNameBodySchema } },
      required: true,
    },
  },
  middleware: [validateBearerToken],
  responses: {
    204: { description: "Name updated successfully" },
    401: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Unauthorized",
    },
    403: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Forbidden",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Submission not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const submissionDraftGroupRoute = createRoute({
  method: "get",
  path: "/submissions/:id/draft-group",
  request: { params: idRequestParamsSchema, query: submissionDraftGroupQueryParamsSchema },
  middleware: [httpCache(1800)],
  responses: {
    200: {
      content: { "application/json": { schema: draftGroupDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});
