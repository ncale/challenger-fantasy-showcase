import { LINKS } from "./data";
import { OpenAPIHono } from "@hono/zod-openapi";
import * as Sentry from "@sentry/cloudflare";
import type { Context } from "hono";
import { cors } from "hono/cors";
import { v1AdminRouter } from "./routers/admin";
import { v1EventRouter } from "./routers/event.router";
import { v1FighterRouter } from "./routers/fighter.router";
import { v1Router } from "./routers/index";
import { v1SubmissionRouter } from "./routers/submission.router";
import { v1UserRouter } from "./routers/user.router";

const captureSentryException = (error: unknown, c: Context) => {
  Sentry.captureException(error, { extra: { url: c.req.url, method: c.req.method } });
};

const app = new OpenAPIHono<{ Bindings: Env }>({
  defaultHook: (result, c) => {
    if (!result.success) {
      captureSentryException(result.error, c);
      return c.json({ success: false, errors: result.error.issues }, 422);
    }
  },
})
  .use(
    "*",
    cors({
      origin: (origin) => {
        const allowedOrigins = [
          LINKS.STATS_URL,
          LINKS.APP_URL,
          "http://localhost:5173",
          "http://localhost:8081",
        ];
        return allowedOrigins.includes(origin) ? origin : null;
      },
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  )
  .onError((err, c) => {
    captureSentryException(err, c);
    return c.json({ error: "Internal server error" }, 500);
  })
  .route("/v1", v1Router)
  .route("/v1", v1UserRouter)
  .route("/v1", v1EventRouter)
  .route("/v1", v1FighterRouter)
  .route("/v1", v1SubmissionRouter)
  .route("/v1/admin", v1AdminRouter);

export { app };
