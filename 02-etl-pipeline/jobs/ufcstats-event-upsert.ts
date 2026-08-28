import { UFC } from "../data";
import { upsertEvent } from "../db";
import {
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import type { parseUfcstatsEventDetailsPage } from "../parsers";
import { type EventInsert, EventInsertSchema } from "../schemas";
import { slugify } from "../data/utils";

const redis = createRedisClient();

type EventParseResult = ReturnType<typeof parseUfcstatsEventDetailsPage>;

/**
 * @role {@link JobRole.PERSISTENCE}
 * @description Gets parsed JSON from Redis. Writes to the DB.
 * @boundary No fans out. No triggering of other jobs.
 */
export async function ufcstatsEventUpsert(
  data: JobData,
): Promise<{ name: string; status: string }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const raw = await redis.get(RedisKeys.parsedEvent(externalId));
  if (!raw) throw new Error(`No parsed data in Redis for event ${externalId} — re-queue parse`);

  const parsed = JSON.parse(raw) as EventParseResult;

  /**
   * EVENT STATUS DERIVATION
   * Priority-based rules for determining the lifecycle of an event:
   * * 1. FINAL: Every fight has a result, and there is at least one fight.
   * * 2. LIVE: Some fights have results, but not all.
   * * 3. SCHEDULED: All other conditions.
   */
  const status = (() => {
    const fightsWithResults = parsed.fights.reduce((count, f) => (f.winner ? count + 1 : count), 0);
    if (fightsWithResults === parsed.fights.length && parsed.fights.length > 0) return "final";
    if (fightsWithResults > 0) return "live";
    return "scheduled";
  })();

  const orgId = process.env.UFC_ORG_ID ?? UFC.ORG_ID;
  if (!orgId) throw new Error("UFC_ORG_ID env var is required");

  const validated = EventInsertSchema.parse({
    ufcstats_external_id: externalId,
    slug: slugify(parsed.name),
    name: parsed.name,
    city: parsed.location?.city ?? null,
    state_or_region: parsed.location?.stateOrRegion ?? null,
    country: parsed.location?.country ?? null,
    status,
    event_date: parsed.eventDate.iso,
    org_id: orgId,
  } satisfies EventInsert);

  await upsertEvent({ ...validated, org_id: orgId });
  return { name: validated.name, status: validated.status };
}
