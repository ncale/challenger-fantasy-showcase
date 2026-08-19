import * as Sentry from "@sentry/cloudflare";
import { app } from "./app";

export default Sentry.withSentry(
  (_: Env) => ({
    dsn: "https://f75d7382eeb3a86b330b1029ef5502fc@o4511214875312128.ingest.us.sentry.io/4511233062207488",

    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
  }),
  {
    async fetch(req, env, ctx) {
      return app.fetch(req, env, ctx);
    },

    // This handler is invoked at
    // interval set in wrangler.jsonc triggers config
    async scheduled(event): Promise<void> {
      if (event.cron !== "0 * * * *") {
        throw new Error(`Unknown cron: ${event.cron}`);
      }
    },
  } satisfies ExportedHandler<Env>,
);

export { DraftManager } from "./durable-objects/draft-manager";
export { DraftServer } from "./durable-objects/draft-server";
