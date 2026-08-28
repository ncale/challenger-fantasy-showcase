// Step 5: Hono's `hc<AppType>` turns the router's own type (every route, its
// zod input/output schemas — see 01-api-and-data-layer/app-type.ts and
// routers/) into a fully-typed RPC client. No separate client codegen step —
// the client is just the server's type, imported.
import { hc } from "hono/client";
import type { AppType } from "../../01-api-and-data-layer/app-type";

export const createApiClient = (url: string, bearerToken?: string) =>
  hc<AppType>(
    url,
    bearerToken
      ? {
          headers: { authorization: `Bearer ${bearerToken}` },
        }
      : undefined,
  );
