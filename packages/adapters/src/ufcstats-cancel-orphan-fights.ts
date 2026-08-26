import {
  cancelFightsByExternalIds,
  getFightExternalIdsByEventId,
  lookupEventId,
} from "@challenger-fantasy/db";
import {
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "@challenger-fantasy/ingest-queue";
import type { parseUfcstatsEventDetailsPage } from "@challenger-fantasy/parsers";

const redis = createRedisClient();

type EventParseResult = ReturnType<typeof parseUfcstatsEventDetailsPage>;

/**
 * @role {@link JobRole.PERSISTENCE}
 * @description Gets parsed event JSON from Redis. Diffs against DB fight records for this event.
 * Marks any fights missing from the scraped data as cancelled.
 */
export async function ufcstatsCancelOrphanFights(
  data: JobData,
): Promise<{ cancelled: number; scrapedCount: number; dbCount: number }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const raw = await redis.get(RedisKeys.parsedEvent(externalId));
  if (!raw) throw new Error(`No parsed data in Redis for event ${externalId} — re-queue parse`);

  const parsed = JSON.parse(raw) as EventParseResult;

  /**
   * CANCEL ORPHAN FIGHTS LOGIC
   * * 1. Get fight external IDs from parsed event details.
   * * 2. Get fight external IDs from DB for this event.
   * * 3. Any DB IDs not in scraped IDs are orphans - mark cancelled in DB.
   */

  const scrapedFightExternalIds = new Set(parsed.fights.map((f) => f.externalId));

  const eventId = await lookupEventId(externalId);
  const dbFightExternalIds = await getFightExternalIdsByEventId(eventId);

  const orphanIds = dbFightExternalIds.filter((id) => !scrapedFightExternalIds.has(id));
  const cancelled = await cancelFightsByExternalIds(orphanIds);

  return {
    cancelled,
    scrapedCount: scrapedFightExternalIds.size,
    dbCount: dbFightExternalIds.length,
  };
}
