import type {
  BustCacheOptions,
  EventCardOptions,
  PagePaginationOptions,
} from "@challenger-fantasy/types";
import { isNotNullish } from "@challenger-fantasy/utils";
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { createQueryFactory } from "./queries";

/**
 * Fetches upcoming events and pre-seeds the query cache with individual
 * event and game data so downstream queries resolve instantly.
 */
export function createHookFactory(queries: ReturnType<typeof createQueryFactory>) {
  return {
    useUpcomingEventsWithCacheSeed: ({
      page = 0,
      pageSize = 4,
      bustCache = false,
    }: PagePaginationOptions & BustCacheOptions = {}) => {
      const queryClient = useQueryClient();
      const query = useSuspenseQuery(
        queries.eventsQuery({ page, pageSize, status: "upcoming-or-live", bustCache }),
      );

      if (isNotNullish(query.data.events)) {
        for (const event of query.data.events) {
          queryClient.setQueryData(
            queries.singleEventQuery(event.id).queryKey,
            (existing) => existing ?? event,
          );
          for (const game of event.games) {
            queryClient.setQueryData(
              queries.singleGameQuery(game.id).queryKey,
              (existing) => existing ?? game,
            );
          }
        }
      }

      return query;
    },

    useEventCardWithCacheSeed: (
      eventId: string | undefined,
      { top, bustCache = false }: EventCardOptions & BustCacheOptions = {},
    ) => {
      const queryClient = useQueryClient();
      const query = useQuery(queries.eventCardQuery(eventId, { top, bustCache }));

      if (isNotNullish(query.data)) {
        const { fights } = query.data;

        for (const fight of fights) {
          queryClient.setQueryData(
            queries.singleFightQuery(fight.id).queryKey,
            (existing) => existing ?? fight,
          );
        }
      }

      return query;
    },
  };
}

/**
 * Ticking countdown in seconds until a target date.
 * Returns [secondsRemaining, running, reset].
 */
export function useCountdown(to: Date, enabled = true): [number, boolean, () => void] {
  const [now, setNow] = useState<Date>(new Date());
  const [expiry, setExpiry] = useState<Date>(to);

  useEffect(() => {
    setExpiry(to);
  }, [to]);

  useEffect(() => {
    if (expiry.getTime() <= now.getTime() || !enabled) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [expiry, now, enabled]);

  const timeRemaining = expiry.getTime() - now.getTime();
  const secondsRemaining = Math.max(0, Math.floor(timeRemaining / 1000));
  const running = secondsRemaining > 0;

  const reset = () => {
    setNow(new Date());
    setExpiry(to);
  };

  return [secondsRemaining, running, reset];
}
