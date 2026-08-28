import * as Sentry from "@sentry/cloudflare";
import { app } from "./app";

export default Sentry.withSentry(
  (_: Env) => ({
    dsn: "<SENTRY_DSN>", // STUBBED: originally a real Sentry project DSN

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

// DraftManager and DraftServer Durable Object exports live in 03-realtime-draft-engine/
// (this worker binds them via wrangler.jsonc; see that node for the class implementations)
