import { randJitter, sleep, USER_AGENT } from "@challenger-fantasy/core";

function buildUrl(u: string) {
  try {
    const url = new URL(u);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("bad protocol");
    return url;
  } catch {
    throw new Error("invalid url");
  }
}

export async function fetchProxy(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) return new Response("missing url", { status: 400 });

  let url: URL;
  try {
    url = buildUrl(target);
  } catch {
    return new Response("invalid url", { status: 400 });
  }

  // pass through conditional headers from caller if provided
  const ifNoneMatch = req.headers.get("if-none-match") ?? undefined;
  const ifModifiedSince = req.headers.get("if-modified-since") ?? undefined;

  await sleep(randJitter());

  const upstream = await fetch(url.toString(), {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ...(ifNoneMatch ? { "if-none-match": ifNoneMatch } : {}),
      ...(ifModifiedSince ? { "if-modified-since": ifModifiedSince } : {}),
    },
    cf: {
      cacheEverything: true,
      cacheTtlByStatus: { "200-299": 300, "304": 0, "404": 60, "500-599": 0 },
    },
  });

  // return 304 directly if unchanged
  if (upstream.status === 304) {
    return new Response(null, {
      status: 304,
      headers: {
        etag: upstream.headers.get("etag") ?? "",
        "last-modified": upstream.headers.get("last-modified") ?? "",
      },
    });
  }

  const body = await upstream.arrayBuffer();

  const headers = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "text/html; charset=utf-8",
    etag: upstream.headers.get("etag") ?? "",
    "last-modified": upstream.headers.get("last-modified") ?? "",
    "x-source-status": String(upstream.status),
  });

  return new Response(body, { status: 200, headers });
}
