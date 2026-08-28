import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import {
  parseDocumentFromPage,
  parseUfcstatsFighterDetailsPage,
} from "../parsers";
import { enqueue } from "./utils.ts";

const TTL_SECONDS = 86400; // 24 hours

const redis = createRedisClient();

/**
 * @role {@link JobRole.TRANSFORMATION}
 * @description Gets HTML from Redis. Parses the data to JSON and saves to Redis. Triggers upsert job.
 */
export async function ufcstatsFighterParse(
  data: JobData,
): Promise<{ name: string; nickname: string | null }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const html = await redis.get(RedisKeys.fetchFighter(externalId));
  if (!html) throw new Error(`No fetch data in Redis for fighter ${externalId} — re-queue fetch`);

  const document = parseDocumentFromPage(html);
  const parsed = parseUfcstatsFighterDetailsPage(document);

  await redis.set(RedisKeys.parsedFighter(externalId), JSON.stringify(parsed), "EX", TTL_SECONDS);

  const queue = createQueue();
  await Promise.all([
    enqueue(queue, "ufcstats-fighter-upsert", { externalId, parentJobId: data.parentJobId }),
    enqueue(queue, "ufcstats-fighter-stats-upsert", { externalId, parentJobId: data.parentJobId }),
    enqueue(queue, "calculate-fighter-analytics", { externalId, parentJobId: data.parentJobId }),
  ]);

  return { name: parsed.name, nickname: parsed.nickname ?? null };
}
