import { getScheduledEventExternalIds, getStaleLiveEventExternalIds } from "@challenger-fantasy/db";
import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "@challenger-fantasy/ingest-queue";
import type { parseUfcstatsEventsUpcomingPage } from "@challenger-fantasy/parsers";
import { enqueue } from "./utils.ts";

const redis = createRedisClient();

type EventsUpcomingParseResult = ReturnType<typeof parseUfcstatsEventsUpcomingPage>;

/**
 * @role {@link JobRole.ORCHESTRATION}
 * @description Gets parsed events from Redis. Merges with DB scheduled IDs. Triggers event-fetch for
 * stale events.
 */
export async function ufcstatsEventsUpcomingFanout(
  _data: JobData,
): Promise<{ eventCount: number; eventIds: string[] }> {
  const raw = await redis.get(RedisKeys.parsedEventsUpcoming);
  if (!raw) throw new Error("No parsed data in Redis for events-upcoming — re-queue parse");

  const parsed = JSON.parse(raw) as EventsUpcomingParseResult;

  /**
   * UPCOMING EVENTS FANOUT LOGIC
   * * 1. Get external IDs from...
   * 	* 1.1 parsed upcoming events.
   *  * 1.2 events in the DB marked as "scheduled".
   *  * 1.3 events in the DB marked as "live" and 24+ hours old (edge case - this is for stale live events).
   * * 2. Merge and dedupe IDs.
   * * 3. For each ID, if no fresh fetch data in Redis, enqueue event-fetch job.
   */

  const upcomingIds = parsed.events.map((e) => e.externalId);
  const scheduledIds = await getScheduledEventExternalIds();
  const staleLiveIds = await getStaleLiveEventExternalIds();

  const eventIds = Array.from(new Set([...upcomingIds, ...scheduledIds, ...staleLiveIds]));

  const queue = createQueue();
  for (const externalId of eventIds) {
    const ttl = await redis.ttl(RedisKeys.fetchEvent(externalId));
    if (ttl <= 0) {
      await enqueue(queue, "ufcstats-event-fetch", { externalId });
    }
  }

  return { eventCount: eventIds.length, eventIds };
}
