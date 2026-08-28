import { lookupFighterId, upsertFighterStats } from "../db";
import {
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import type { parseUfcstatsFighterDetailsPage } from "../parsers";
import { type FighterStatsInsert, FighterStatsInsertSchema } from "../schemas";

const redis = createRedisClient();

type FighterParseResult = ReturnType<typeof parseUfcstatsFighterDetailsPage>;

/**
 * @role {@link JobRole.PERSISTENCE}
 * @description Gets parsed JSON from Redis. Writes fighter W/L/D/NC record to fighter_stats.
 * @boundary No fans out. No triggering of other jobs.
 */
export async function ufcstatsFighterStatsUpsert(
  data: JobData,
): Promise<{ wins: number; losses: number; draws: number; noContests: number }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const raw = await redis.get(RedisKeys.parsedFighter(externalId));
  if (!raw) throw new Error(`No parsed data in Redis for fighter ${externalId} — re-queue parse`);

  const parsed = JSON.parse(raw) as FighterParseResult;
  const { record } = parsed;

  const fighterId = await lookupFighterId(externalId);

  const validated = FighterStatsInsertSchema.parse({
    fighter_id: fighterId,
    wins: record.wins,
    losses: record.losses,
    draws: record.draws,
    no_contests: record.noContests,
  } satisfies FighterStatsInsert);

  await upsertFighterStats(validated);
  return {
    wins: record.wins,
    losses: record.losses,
    draws: record.draws,
    noContests: record.noContests,
  };
}
