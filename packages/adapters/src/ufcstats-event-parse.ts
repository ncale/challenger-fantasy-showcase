import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "@challenger-fantasy/ingest-queue";
import { parseDocumentFromPage, parseUfcstatsEventDetailsPage } from "@challenger-fantasy/parsers";
import { enqueue } from "./utils.ts";

const TTL_SECONDS = 3600; // 1 hour

const redis = createRedisClient();

/**
 * @role {@link JobRole.TRANSFORMATION}
 * @description Gets HTML from Redis. Parses the data to JSON and saves to Redis. Triggers upsert and fanout jobs.
 */
export async function ufcstatsEventParse(
  data: JobData,
): Promise<{ name: string; date: string | null; fightCount: number }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const html = await redis.get(RedisKeys.fetchEvent(externalId));
  if (!html) throw new Error(`No fetch data in Redis for event ${externalId} — re-queue fetch`);

  const document = parseDocumentFromPage(html);
  const parsed = parseUfcstatsEventDetailsPage(document);

  await redis.set(RedisKeys.parsedEvent(externalId), JSON.stringify(parsed), "EX", TTL_SECONDS);

  const queue = createQueue();
  await Promise.all([
    enqueue(queue, "ufcstats-event-upsert", { externalId, parentJobId: data.parentJobId }),
    enqueue(queue, "ufcstats-event-fanout", {
      externalId,
      parentJobId: data.parentJobId,
      liveMode: data.liveMode,
    }),
  ]);

  return {
    name: parsed.name,
    date: parsed.eventDate.iso,
    fightCount: parsed.fights.length,
  };
}
