import { createLogger } from "@challenger-fantasy/logger";
import type { MiddlewareHandler } from "hono";
import { getSupabaseClient } from "./supabase";
import type { Variables } from "./types";

export const requireAdminKey: MiddlewareHandler<{ Bindings: Env }> = async (c, next) => {
  const auth = c.req.header("authorization");
  const expectedKey = c.env.ADMIN_KEY;
  const logger = createLogger({ LOG_LEVEL: c.env.LOG_LEVEL, PRETTY_LOGS: c.env.PRETTY_LOGS });

  if (!expectedKey) {
    logger.admin.error({ path: c.req.path }, "admin.key.unconfigured");
    return c.json({ message: "Admin key not configured" }, 500);
  }

  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    logger.admin.warn({ path: c.req.path }, "admin.auth.missing");
    return c.json({ message: "Unauthorized: Missing Bearer token" }, 401);
  }

  const token = auth.substring(7);
  if (token !== expectedKey) {
    logger.admin.warn({ path: c.req.path }, "admin.auth.invalid");
    return c.json({ message: "Unauthorized: Invalid admin key" }, 401);
  }

  logger.admin.info({ path: c.req.path }, "admin.auth.verified");
  await next();
};

export const httpCache = (ttl = 30): MiddlewareHandler<{ Bindings: Env }> => {
  return async (c, next) => {
    const cache = caches.default;
    const logger = createLogger({ LOG_LEVEL: c.env.LOG_LEVEL, PRETTY_LOGS: c.env.PRETTY_LOGS });

    const hit = await cache.match(c.req.raw);
    if (hit) {
      logger.api.debug({ path: c.req.path }, "cache.request.hit");
      return hit;
    }

    logger.api.debug({ path: c.req.path }, "cache.request.miss");
    await next();

    const res = c.res;
    if (!res) return;

    const cached = new Response(res.body, res);
    cached.headers.set("cache-control", `public, max-age=${ttl}`);

    c.executionCtx.waitUntil(cache.put(c.req.raw, cached.clone()));

    c.res = cached;
  };
};

export const validateBearerToken: MiddlewareHandler<{
  Bindings: Env;
  Variables: Variables;
}> = async (c, next) => {
  const authorization = c.req.header("authorization");
  const token = authorization?.split(" ")[1] ?? c.req.query("accessToken");

  const logger = createLogger({ LOG_LEVEL: c.env.LOG_LEVEL, PRETTY_LOGS: c.env.PRETTY_LOGS });

  if (!token) {
    logger.auth.warn({ path: c.req.path }, "auth.token.missing");
    return c.json({ message: "Unauthorized: Missing Bearer token" }, 401);
  }

  const supabase = getSupabaseClient(c.env);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    logger.auth.warn({ path: c.req.path, error }, "auth.token.invalid");
    return c.json({ message: "Unauthorized: Invalid bearer token" }, 401);
  }

  logger.auth.info({ path: c.req.path, userId: data.user.id }, "auth.user.verified");
  c.set("user", data.user);
  await next();
};
