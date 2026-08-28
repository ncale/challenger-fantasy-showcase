import { hc } from "hono/client";
import type { AppType } from "./app-type";

export const createApiClient = (url: string, bearerToken?: string) =>
  hc<AppType>(
    url,
    bearerToken
      ? {
          headers: { authorization: `Bearer ${bearerToken}` },
        }
      : undefined,
  );
