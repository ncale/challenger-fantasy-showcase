import pino from "pino";
import type { AppLoggers, LoggerEnv } from "./types";

/**
 * Creates a set of named loggers for a Cloudflare Worker or backend service.
 *
 * Call this once at the entry point of your worker/DO, passing in the env
 * binding. Thread the relevant child logger into each service or handler.
 *
 * @example
 * // worker entry point
 * export default {
 *   fetch(request: Request, env: Env) {
 *     const logger = createLogger(env);
 *     const draftService = new DraftService({ logger: logger.draft });
 *   }
 * }
 *
 * @example
 * // durable object
 * export class DraftObject implements DurableObject {
 *   private logger: AppLoggers;
 *
 *   constructor(state: DurableObjectState, env: Env) {
 *     this.logger = createLogger(env);
 *   }
 * }
 */
export function createLogger(env: LoggerEnv): AppLoggers {
  const base = pino({
    level: env.LOG_LEVEL ?? "info",
    // pino-pretty only works locally via wrangler dev.
    // Set PRETTY_LOGS=true in your .dev.vars file, never in production.
    transport:
      env.PRETTY_LOGS === "true"
        ? { target: "pino-pretty", options: { colorize: true } }
        : undefined,
    // Required for Workers/browser-like environments that
    // don't have a writable stdout stream.
    browser: { asObject: true },
  });

  return {
    auth: base.child({ name: "auth" }),
    ws: base.child({ name: "ws" }),
    draft: base.child({ name: "draft" }),
    api: base.child({ name: "api" }),
    admin: base.child({ name: "admin" }),
    perf: base.child({ name: "perf" }),
    lifecycle: base.child({ name: "lifecycle" }),
    query: base.child({ name: "query" }),
  };
}
