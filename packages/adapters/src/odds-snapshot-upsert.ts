import { insertOddsSnapshot } from "@challenger-fantasy/db";
import { type JobData, JobRole } from "@challenger-fantasy/ingest-queue";
import { OddsSnapshotInsertSchema } from "@challenger-fantasy/schemas";

/**
 * @role {@link JobRole.PERSISTENCE}
 * @description Inserts a single odds snapshot row for one fighter in one fight.
 */
export async function oddsSnapshotUpsert(
  data: JobData,
): Promise<{ fightId: string; fighterId: string }> {
  const row = OddsSnapshotInsertSchema.parse({
    fight_id: data.fightId,
    fighter_id: data.fighterId,
    avg_decimal_odds: data.avgDecimalOdds,
    fair_probability: data.fairProbability,
    bookmaker_count: data.bookmakerCount,
  });

  await insertOddsSnapshot(row);
  return { fightId: row.fight_id, fighterId: row.fighter_id };
}
