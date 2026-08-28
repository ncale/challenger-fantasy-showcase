import { PG_ERROR_CODES } from "../data";
import { OpenAPIHono, z } from "@hono/zod-openapi";
import { codeInError } from "../lib/api-utils";
import { getGameService } from "../lib/data";
import { addDefaultGamesRoute, scoreAllGamesRoute } from "../routes/admin";
import { healthRoute } from "../routes/health";

const v1AdminRouter = new OpenAPIHono<{ Bindings: Env }>()
  .openapi(scoreAllGamesRoute, async (c) => {
    const { id } = c.req.valid("param");
    if (z.uuid().safeParse(id).error) return c.json({ message: "Invalid input syntax" }, 400);

    // await finalizeEvent(c.env, eventId);

    return c.body(null, 204);
  })
  .openapi(addDefaultGamesRoute, async (c) => {
    const { id } = c.req.valid("param");
    if (z.uuid().safeParse(id).error) return c.json({ message: "Invalid input syntax" }, 400);

    const gs = getGameService(c.env);
    try {
      await gs.addDefaultGames(id);

      return c.body(null, 204);
    } catch (error) {
      if (codeInError(error)) {
        switch (error.code) {
          case PG_ERROR_CODES.INVALID_INPUT_SYNTAX:
            return c.json({ message: "Invalid input syntax" }, 400);
          // TODO: test this endpoint to see what happens when you try for an event that doesn't exist
          case PG_ERROR_CODES.NOT_FOUND:
            return c.json({ message: "User not found" }, 404);
        }
      }

      return c.json({ message: `Failed to fetch: ${error}` }, 500);
    }
  })
  .openapi(healthRoute, async (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() }, 200);
  });

export { v1AdminRouter };
