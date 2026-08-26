import { useQuery } from "@tanstack/react-query";
import { preFightStatsQuery } from "@/lib/init-queries";
import { useParsedStats } from "./useParsedStats";

export function usePreFightStats(fightId: string, enabled = true) {
  const q = useQuery(preFightStatsQuery(enabled ? fightId : undefined));

  const { stats: f1OffStats } = useParsedStats(q.data?.fighter_1_offensive_stats);
  const { stats: f1DefStats } = useParsedStats(q.data?.fighter_1_defensive_stats);

  const { stats: f2OffStats } = useParsedStats(q.data?.fighter_2_offensive_stats);
  const { stats: f2DefStats } = useParsedStats(q.data?.fighter_2_defensive_stats);

  const f1Seconds = q.data?.fighter_1_total_seconds ?? null;
  const f2Seconds = q.data?.fighter_2_total_seconds ?? null;

  const f1Rounds = q.data?.fighter_1_total_rounds ?? null;
  const f2Rounds = q.data?.fighter_2_total_rounds ?? null;

  return {
    ...q,
    f1OffStats,
    f1DefStats,
    f2OffStats,
    f2DefStats,
    f1Seconds,
    f2Seconds,
    f1Rounds,
    f2Rounds,
  };
}
