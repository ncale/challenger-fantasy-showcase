import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import { enqueue, fetchWithPlaywright } from "./utils.ts";

const BASE_URL = "http://www.ufcstats.com/fight-details/";
const TTL_SECONDS = 21600; // 6 hours

const redis = createRedisClient();

/**
 * @role {@link JobRole.ACQUISITION}
 * @description Fetches raw HTML for a specific UFC fight. Saves to Redis. Triggers parse job.
 */
export async function ufcstatsFightFetch(data: JobData): Promise<{ url: string; bytes: number }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const url = typeof data.url === "string" ? data.url : `${BASE_URL}${externalId}`;
  const html = await fetchWithPlaywright(url);
  await redis.set(RedisKeys.fetchFight(externalId), html, "EX", TTL_SECONDS);

  const queue = createQueue();
  await enqueue(queue, "ufcstats-fight-parse", {
    externalId,
    orderInEvent: data.orderInEvent,
    parentJobId: data.parentJobId,
  });

  return { url, bytes: html.length };
}
