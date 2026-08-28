import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import {
  parseDocumentFromPage,
  parseUfcstatsEventsUpcomingPage,
} from "../parsers";
import { enqueue } from "./utils.ts";

const TTL_SECONDS = 21_600; // 6 hours

const redis = createRedisClient();

/**
 * @role {@link JobRole.TRANSFORMATION}
 * @description Gets HTML from Redis. Parses the upcoming events list and saves to Redis. Triggers fanout job.
 */
export async function ufcstatsEventsUpcomingParse(data: JobData): Promise<{ eventCount: number }> {
  const html = await redis.get(RedisKeys.fetchEventsUpcoming);
  if (!html) throw new Error("No fetch data in Redis for events-upcoming — re-queue fetch");

  const document = parseDocumentFromPage(html);
  const parsed = parseUfcstatsEventsUpcomingPage(document);

  await redis.set(RedisKeys.parsedEventsUpcoming, JSON.stringify(parsed), "EX", TTL_SECONDS);

  const queue = createQueue();
  await enqueue(queue, "ufcstats-events-upcoming-fanout", { parentJobId: data.parentJobId });

  return { eventCount: parsed.events.length };
}
