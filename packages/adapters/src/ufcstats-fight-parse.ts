import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "@challenger-fantasy/ingest-queue";
import { parseDocumentFromPage, parseUfcstatsFightDetailsPage } from "@challenger-fantasy/parsers";
import { enqueue } from "./utils.ts";

const TTL_SECONDS = 21600; // 6 hours

const redis = createRedisClient();

/**
 * @role {@link JobRole.TRANSFORMATION}
 * @description Gets HTML from Redis. Parses the data to JSON and saves to Redis. Triggers upsert and fanout jobs.
 */
export async function ufcstatsFightParse(
  data: JobData,
): Promise<{ fighter1: string; fighter2: string; completed: boolean }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const html = await redis.get(RedisKeys.fetchFight(externalId));
  if (!html) throw new Error(`No fetch data in Redis for fight ${externalId} — re-queue fetch`);

  const document = parseDocumentFromPage(html);
  const parsed = parseUfcstatsFightDetailsPage(document);

  await redis.set(RedisKeys.parsedFight(externalId), JSON.stringify(parsed), "EX", TTL_SECONDS);

  const queue = createQueue();
  await Promise.all([
    enqueue(queue, "ufcstats-fight-upsert", {
      externalId,
      orderInEvent: data.orderInEvent,
      parentJobId: data.parentJobId,
    }),
    enqueue(queue, "ufcstats-fight-fanout", { externalId, parentJobId: data.parentJobId }),
  ]);

  return {
    fighter1: parsed.fighter1.name,
    fighter2: parsed.fighter2.name,
    completed: "result" in parsed,
  };
}
