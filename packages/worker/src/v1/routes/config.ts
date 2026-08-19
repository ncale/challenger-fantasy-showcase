import {
  appConfigResponseDtoSchema,
  featureFlagsResponseDtoSchema,
} from "@challenger-fantasy/schemas";
import { createRoute } from "@hono/zod-openapi";
import { httpCache } from "../../lib/middleware";

export const featureFlagsRoute = createRoute({
  method: "get",
  path: "/config/flags",
  tags: ["Config"],
  middleware: [httpCache(86_400)],
  responses: {
    200: {
      content: { "application/json": { schema: featureFlagsResponseDtoSchema } },
      description: "Feature flags — keys and their enabled state",
    },
  },
});

export const appConfigRoute = createRoute({
  method: "get",
  path: "/config/app",
  tags: ["Config"],
  middleware: [httpCache(86_400)],
  responses: {
    200: {
      content: { "application/json": { schema: appConfigResponseDtoSchema } },
      description: "App remote configuration",
    },
  },
});
