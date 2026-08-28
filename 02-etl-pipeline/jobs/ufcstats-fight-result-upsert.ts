import {
  lookupFightId,
  upsertFightResult,
  upsertFightRoundSnapshots,
} from "../db";
import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import type { parseUfcstatsFightDetailsPage } from "../parsers";
import {
  type FighterRoundStatsV1,
  type FightResultInsert,
  FightResultInsertSchema,
  type FightRoundSnapshotInsert,
  FightRoundSnapshotInsertSchema,
} from "../schemas";
import { mapWinner, secondsToRoundTime } from "./fight-helpers.ts";
import { enqueue } from "./utils.ts";

const redis = createRedisClient();

type FightParseResult = ReturnType<typeof parseUfcstatsFightDetailsPage>;
type CompletedFight = Extract<FightParseResult, { result: unknown }>;
type FighterGeneralStats = CompletedFight["generalStats"]["fighter1"];
type FighterStrikeStats = CompletedFight["strikesBreakdown"]["fighter1"];

function buildStats(
  general: FighterGeneralStats,
  strikes: FighterStrikeStats,
): FighterRoundStatsV1 {
  return {
    schemaVersion: 1,
    general: {
      knockdowns: general.knockdowns,
      significantStrikes: general.significantStrikes,
      significantStrikePercentage: general.significantStrikePercentage,
      totalStrikes: general.totalStrikes,
      takedowns: general.takedowns,
      takedownPercentage: general.takedownPercentage,
      submissionAttempts: general.submissionAttempts,
      reversals: general.reversals,
      controlTimeSeconds: general.controlTime.seconds,
    },
    strikes: {
      total: strikes.total,
      head: strikes.head,
      body: strikes.body,
      leg: strikes.leg,
      distance: strikes.distance,
      clinch: strikes.clinch,
      ground: strikes.ground,
    },
  } satisfies FighterRoundStatsV1;
}

/**
 * @role {@link JobRole.PERSISTENCE}
 * @description Gets parsed JSON from Redis. Writes fight result and round snapshots to the DB. Triggers score-games.
 */
export async function ufcstatsFightResultUpsert(data: JobData): Promise<{
  winner: string;
  method: string;
  round: number;
  roundSnapshots: number;
}> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const raw = await redis.get(RedisKeys.parsedFight(externalId));
  if (!raw) throw new Error(`No parsed data in Redis for fight ${externalId} — re-queue parse`);

  const parsed = JSON.parse(raw) as FightParseResult;
  if (!("result" in parsed))
    throw new Error(`Fight ${externalId} has no result — not a completed fight`);

  const completed = parsed as CompletedFight;

  if (!completed.generalStats || !completed.strikesBreakdown) {
    throw new Error(`Fight ${externalId} is missing stat data — re-queue parse`);
  }

  const fightId = await lookupFightId(externalId);

  const resultRow = FightResultInsertSchema.parse({
    fight_id: fightId,
    method: completed.result.method,
    round: completed.result.round,
    round_time: secondsToRoundTime(completed.result.time.seconds),
    details: completed.details,
    referee: completed.referee,
    result: mapWinner(completed.result.winner),
    fighter_1_stats: buildStats(
      completed.generalStats.fighter1,
      completed.strikesBreakdown.fighter1,
    ),
    fighter_2_stats: buildStats(
      completed.generalStats.fighter2,
      completed.strikesBreakdown.fighter2,
    ),
  } satisfies FightResultInsert);

  const roundSnapshots = completed.generalStatsByRound.map((stat) => {
    const strikeRow = completed.strikesBreakdownByRound.find((s) => s.round === stat.round);
    if (!strikeRow) {
      throw new Error(`Fight ${externalId} is missing strike data for round ${stat.round}`);
    }
    return FightRoundSnapshotInsertSchema.parse({
      fight_id: fightId,
      round: stat.round,
      fighter_1_stats: buildStats(stat.fighter1, strikeRow.fighter1),
      fighter_2_stats: buildStats(stat.fighter2, strikeRow.fighter2),
    } satisfies FightRoundSnapshotInsert);
  });

  await Promise.all([upsertFightResult(resultRow), upsertFightRoundSnapshots(roundSnapshots)]);

  // TODO: figure out a better way to trigger score recalcs without hardcoding "score-games" here
  const queue = createQueue();
  await Promise.all([
    enqueue(queue, "score-fighters", {
      eventExternalId: parsed.eventExternalId,
      parentJobId: data.parentJobId,
    }),
    enqueue(queue, "score-games", {
      eventExternalId: parsed.eventExternalId,
      parentJobId: data.parentJobId,
    }),
    enqueue(queue, "calculate-fighter-analytics", {
      externalId: completed.fighter1.externalId,
      parentJobId: data.parentJobId,
    }),
    enqueue(queue, "calculate-fighter-analytics", {
      externalId: completed.fighter2.externalId,
      parentJobId: data.parentJobId,
    }),
  ]);

  return {
    winner: mapWinner(completed.result.winner),
    method: completed.result.method,
    round: completed.result.round,
    roundSnapshots: roundSnapshots.length,
  };
}
