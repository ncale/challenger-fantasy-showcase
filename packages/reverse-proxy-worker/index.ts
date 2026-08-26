/// <reference types="@cloudflare/workers-types" />
declare global {
  interface CacheStorage {
    readonly default: Cache;
  }
}

const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

async function handleRequest(req: Request, ctx: ExecutionContext) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const search = url.search;
  const pathWithParams = pathname + search;

  if (pathname.startsWith("/static/")) {
    return retrieveStatic(req, pathWithParams, ctx);
  } else {
    return forwardRequest(req, pathWithParams);
  }
}

async function retrieveStatic(req: Request, pathname: string, ctx: ExecutionContext) {
  const cache = caches.default;

  let response = await cache.match(req);
  if (!response) {
    response = await fetch(`https://${ASSET_HOST}${pathname}`);
    ctx.waitUntil(cache.put(req, response.clone()));
  }
  return response;
}

async function forwardRequest(req: Request, pathWithSearch: string) {
  const originRequest = new Request(req);
  originRequest.headers.delete("cookie");
  return await fetch(`https://${API_HOST}${pathWithSearch}`, originRequest);
}

export default {
  async fetch(req, _, ctx) {
    return handleRequest(req, ctx);
  },
} satisfies ExportedHandler<Env>;
