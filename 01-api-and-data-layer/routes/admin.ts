import { errorResponseDtoSchema, idRequestParamsSchema } from "../schemas";
import { createRoute } from "@hono/zod-openapi";
import { requireAdminKey } from "../lib/middleware";

// TODO: attach auth middleware to the admin routes here, as well as at the route
// level to ensure an admin route is never exposed

// TODO: do we even need to return payloads for the content or is the description passed as well?

// TODO: figure out how to organize routes better for this!

export const scoreAllGamesRoute = createRoute({
  method: "post",
  path: "/events/:id/score-all",
  tags: ["Admin"],
  request: {
    params: idRequestParamsSchema,
  },
  middleware: [requireAdminKey],
  responses: {
    204: { description: "Event finalized successfully" },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid payload",
    },
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

export const addDefaultGamesRoute = createRoute({
  method: "post",
  path: "/events/:id/add-default-games",
  tags: ["Admin"],
  request: {
    params: idRequestParamsSchema,
  },
  middleware: [requireAdminKey],
  responses: {
    204: { description: "Default games added successfully" },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    401: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Unauthorized",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Event not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server error",
    },
  },
});
