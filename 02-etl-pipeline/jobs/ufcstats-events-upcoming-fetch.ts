import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import { enqueue, fetchWithPlaywright } from "./utils.ts";

const DEFAULT_URL = "http://www.ufcstats.com/statistics/events/upcoming";
const TTL_SECONDS = 21_600; // 6 hours

const redis = createRedisClient();

/**
 * @role {@link JobRole.ACQUISITION}
 * @description Fetches the ufcstats upcoming events page. Saves HTML to Redis. Triggers parse job.
 */
export async function ufcstatsEventsUpcomingFetch(
  data: JobData,
): Promise<{ url: string; bytes: number }> {
  const url = typeof data.url === "string" ? data.url : DEFAULT_URL;
  const html = await fetchWithPlaywright(url);
  await redis.set(RedisKeys.fetchEventsUpcoming, html, "EX", TTL_SECONDS);

  const queue = createQueue();
  await enqueue(queue, "ufcstats-events-upcoming-parse", { parentJobId: data.parentJobId });

  return { url, bytes: html.length };
}
