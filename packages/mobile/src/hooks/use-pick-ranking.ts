import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { pickRankingQuery } from "~/lib/init-queries";
import { useSupabase } from "./use-supabase";

export function usePickRanking(eventId: string | undefined) {
  const { userId, session } = useSupabase();

  const { data: pickRanking } = useSuspenseQuery(
    pickRankingQuery(userId ?? undefined, eventId, session?.access_token ?? ""),
  );

  const rankingMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!pickRanking) return map;
    pickRanking.fighterIds.forEach((id, index) => {
      map.set(id, index + 1);
    });
    return map;
  }, [pickRanking]);

  const getRank = useCallback((fighterId: string) => rankingMap.get(fighterId), [rankingMap]);
  const hasRankings = rankingMap.size > 0;

  return { getRank, hasRankings };
}
