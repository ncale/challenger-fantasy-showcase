import { healthResponseDtoSchema } from "../schemas";
import { createRoute } from "@hono/zod-openapi";
import { httpCache } from "../lib/middleware";

export const healthRoute = createRoute({
  method: "get",
  path: "/health",
  tags: ["Health"],
  middleware: [httpCache(30)],
  responses: {
    200: {
      content: { "application/json": { schema: healthResponseDtoSchema } },
      description: "Health check successful",
    },
  },
});
