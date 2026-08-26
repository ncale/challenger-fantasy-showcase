import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "@challenger-fantasy/ingest-queue";
import { enqueue, fetchWithPlaywright } from "./utils.ts";

const BASE_URL = "http://www.ufcstats.com/event-details/";
const TTL_SECONDS = 21_600; // 6 hours

const redis = createRedisClient();

/**
 * @role {@link JobRole.ACQUISITION}
 * @description Fetches raw HTML for a specific UFC event. Saves to Redis. Triggers parse job.
 */
export async function ufcstatsEventFetch(data: JobData): Promise<{ url: string; bytes: number }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const url = typeof data.url === "string" ? data.url : `${BASE_URL}${externalId}`;
  const html = await fetchWithPlaywright(url);
  await redis.set(RedisKeys.fetchEvent(externalId), html, "EX", TTL_SECONDS);

  const queue = createQueue();
  await enqueue(queue, "ufcstats-event-parse", {
    externalId,
    parentJobId: data.parentJobId,
    liveMode: data.liveMode,
  });

  return { url, bytes: html.length };
}
