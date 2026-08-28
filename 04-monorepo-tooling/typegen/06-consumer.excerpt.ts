// Step 6: the payoff — frontend query hooks call the typed client from step 5.
// `apiClient.v1.events[":idOrSlug"].$get(...)` is fully typed end-to-end back
// to the zod route schemas in 01-api-and-data-layer/routes/, with autocomplete
// on the URL path itself. Excerpted from packages/api-queries/src/queries.ts
// (a TanStack Query factory — the full file has ~30 more queries/mutations
// following the same pattern).
import type { EventCardOptions, EventListOptions, PagePaginationOptions } from "../../01-api-and-data-layer/types";
import { isNullish } from "../../01-api-and-data-layer/data/utils";
import type { createApiClient } from "./05-api-client";
import { queryOptions } from "@tanstack/react-query";

type BustCacheOptions = { bustCache?: boolean };

export const createQueryFactory = (apiClient: ReturnType<typeof createApiClient>) => {
  return {
    eventsQuery: (options?: EventListOptions & PagePaginationOptions & BustCacheOptions) =>
      queryOptions({
        queryKey: ["events", "list", options],
        queryFn: async () => {
          const res = await apiClient.v1.events.$get({
            query: {
              status: options?.status,
              page: options?.page?.toString(),
              pageSize: options?.pageSize?.toString(),
              timestamp: options?.bustCache ? Date.now().toString() : undefined,
            },
          });
          if (!res.ok) throw new Error("Failed to fetch events");
          return res.json();
        },
      }),
    singleEventQuery: (idOrSlug: string | undefined) =>
      queryOptions({
        queryKey: ["events", idOrSlug],
        queryFn: async () => {
          if (isNullish(idOrSlug)) throw new Error("idOrSlug is required");

          const res = await apiClient.v1.events[":idOrSlug"].$get({
            param: { idOrSlug },
          });
          if (!res.ok) throw new Error("Failed to fetch event");

          return await res.json();
        },
        enabled: Boolean(idOrSlug),
      }),
    eventCardQuery: (
      idOrSlug: string | undefined,
      { top, bustCache = false }: EventCardOptions & BustCacheOptions = {},
    ) =>
      queryOptions({
        queryKey: ["events", idOrSlug, "card"],
        queryFn: async () => {
          if (isNullish(idOrSlug)) throw new Error("idOrSlug is required");

          const res = await apiClient.v1.events[":idOrSlug"].card.$get({
            param: { idOrSlug },
            query: { top, timestamp: bustCache ? Date.now().toString() : undefined },
          });
          if (!res.ok) throw new Error("Failed to fetch event card");

          return await res.json();
        },
        enabled: Boolean(idOrSlug),
      }),
  };
};
