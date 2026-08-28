import { computeFighterAnalytics, type FightForAnalytics } from "../data";
import {
  getFighterRecentFightsWithResults,
  lookupFighterId,
  upsertFighterAnalytics,
} from "../db";
import { type JobData, JobRole } from "../queue";
import {
  ConsolidatedFightRoundSnapshotSchema,
  type FighterAnalyticsInsert,
  FighterAnalyticsInsertSchema,
} from "../schemas";
import {
  ANALYTICS_LOOKBACK_YEARS,
  roundTimeToSeconds,
  SECONDS_PER_FULL_ROUND,
} from "../data/shared";

/**
 * @role {@link JobRole.ORCHESTRATION}
 * @description Queries a fighter's completed fights from the last N years, aggregates fight_result
 * stats into per-5-minute rates and percentages, and upserts to fighter_analytics.
 * @boundary No fans out. No triggering of other jobs.
 */
export async function calculateFighterAnalytics(
  data: JobData,
): Promise<{ fighterId: string; computedAtFightCount: number }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  // TODO: a few things
  // 1) the lookup function should go into a `core` package repository class that maps the fetch to a domain model.
  // 2) the domain model should be passable directly into a shared domain function that calculates it.

  const fighterId = await lookupFighterId(externalId);
  const rawFights = await getFighterRecentFightsWithResults(fighterId, ANALYTICS_LOOKBACK_YEARS);

  const fights: FightForAnalytics[] = [];

  for (const fight of rawFights) {
    const result = fight.fight_result;
    if (!result?.round || !result.round_time) continue;

    const f1 = ConsolidatedFightRoundSnapshotSchema.safeParse(result.fighter_1_stats);
    const f2 = ConsolidatedFightRoundSnapshotSchema.safeParse(result.fighter_2_stats);
    if (!f1.success || !f2.success) continue;

    const isF1 = fight.fighter_1_id === fighterId;
    const totalFightSeconds =
      (result.round - 1) * SECONDS_PER_FULL_ROUND + roundTimeToSeconds(result.round_time);

    fights.push({
      weightClassKey: fight.weight_class_key,
      totalFightSeconds,
      rounds: [
        {
          fighterStats: isF1 ? f1.data : f2.data,
          opponentStats: isF1 ? f2.data : f1.data,
        },
      ],
    });
  }

  const analytics = computeFighterAnalytics(fights);

  const validated = FighterAnalyticsInsertSchema.parse({
    fighter_id: fighterId,
    sig_strikes_landed_per_5_mins: analytics.sigStrikesLandedPer5Mins,
    sig_strikes_absorbed_per_5_mins: analytics.sigStrikesAbsorbedPer5Mins,
    in_control_pct: analytics.inControlPct,
    under_control_pct: analytics.underControlPct,
    takedowns_attempted_per_5_mins: analytics.takedownsAttemptedPer5Mins,
    takedown_accuracy: analytics.takedownAccuracy,
    takedown_defence: analytics.takedownDefence,
    computed_at_fight_count: analytics.computedAtFightCount,
    lowest_weight_key: analytics.lowestWeightKey,
    highest_weight_key: analytics.highestWeightKey,
  } satisfies FighterAnalyticsInsert);

  await upsertFighterAnalytics(validated);
  return { fighterId, computedAtFightCount: analytics.computedAtFightCount };
}
