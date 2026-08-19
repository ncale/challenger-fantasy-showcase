import { fetchMmaOdds } from "@challenger-fantasy/core";
import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "@challenger-fantasy/ingest-queue";
import { enqueue } from "./utils.ts";

const TTL_SECONDS = 86_400; // 24 hours — matches the once-daily schedule
const redis = createRedisClient();

/**
 * @role {@link JobRole.ACQUISITION}
 * @description Fetches MMA fight odds from the Odds API. Saves raw JSON to Redis. Triggers fanout.
 */
export async function oddsApiFetch(data: JobData): Promise<{ events: number; bytes: number }> {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) throw new Error("ODDS_API_KEY env var is required");

  const events = await fetchMmaOdds(apiKey);
  const json = JSON.stringify(events);
  await redis.set(RedisKeys.fetchOdds, json, "EX", TTL_SECONDS);

  const queue = createQueue();
  await enqueue(queue, "odds-api-fanout", { parentJobId: data.parentJobId });

  return { events: events.length, bytes: json.length };
}
