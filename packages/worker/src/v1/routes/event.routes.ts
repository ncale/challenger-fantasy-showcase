import {
  errorResponseDtoSchema,
  eventCardDtoSchema,
  eventsCardQueryParamsSchema,
  eventsListDtoSchema,
  eventsListQueryParamsSchema,
  eventWithGamesDtoSchema,
  idOrSlugRequestParamsSchema,
} from "@challenger-fantasy/schemas";
import { createRoute } from "@hono/zod-openapi";
import { httpCache } from "../../lib/middleware";

export const singleEventRoute = createRoute({
  method: "get",
  path: "/events/:idOrSlug",
  request: {
    params: idOrSlugRequestParamsSchema,
  },
  middleware: [httpCache(21600)],
  responses: {
    200: {
      content: { "application/json": { schema: eventWithGamesDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Event not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const eventCardRoute = createRoute({
  method: "get",
  path: "/events/:idOrSlug/card",
  request: {
    params: idOrSlugRequestParamsSchema,
    query: eventsCardQueryParamsSchema,
  },
  middleware: [httpCache(21600)],
  responses: {
    200: {
      content: { "application/json": { schema: eventCardDtoSchema } },
      description: "Resource fetched successfully",
    },
    400: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Invalid input syntax",
    },
    404: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Event not found",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});

export const eventsListRoute = createRoute({
  method: "get",
  path: "/events",
  request: {
    query: eventsListQueryParamsSchema,
  },
  middleware: [httpCache(3600)],
  responses: {
    200: {
      content: { "application/json": { schema: eventsListDtoSchema } },
      description: "Events list fetched successfully",
    },
    500: {
      content: { "application/json": { schema: errorResponseDtoSchema } },
      description: "Server Error",
    },
  },
});
