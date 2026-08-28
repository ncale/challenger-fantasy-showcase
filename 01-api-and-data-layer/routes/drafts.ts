import { errorResponseDtoSchema, joinDraftQueryParamsSchema } from "../schemas";
import { createRoute } from "@hono/zod-openapi";
import { validateBearerToken } from "../lib/middleware";

export const joinDraftRoute = createRoute({
  method: "get",
  path: "/drafts/join",
  middleware: [validateBearerToken] as const,
  request: { query: joinDraftQueryParamsSchema },
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
