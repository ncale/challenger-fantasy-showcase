import { getFighterLastUpdated } from "@challenger-fantasy/db";
import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "@challenger-fantasy/ingest-queue";
import type { parseUfcstatsFightDetailsPage } from "@challenger-fantasy/parsers";
import { enqueue, hoursAgo } from "./utils.ts";

const redis = createRedisClient();

const STALENESS_HOURS = 24 * 28; // 4 weeks

type FightParseResult = ReturnType<typeof parseUfcstatsFightDetailsPage>;

async function shouldFetchFighter(externalId: string): Promise<boolean> {
  const lastUpdated = await getFighterLastUpdated(externalId);
  return !lastUpdated || hoursAgo(lastUpdated) >= STALENESS_HOURS;
}

/**
 * @role {@link JobRole.ORCHESTRATION}
 * @description Gets parsed JSON from Redis. Triggers fetch jobs for fighters whose data is stale.
 */
export async function ufcstatsFightFanout(data: JobData) {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const raw = await redis.get(RedisKeys.parsedFight(externalId));
  if (!raw) throw new Error(`No parsed data in Redis for fight ${externalId} — re-queue parse`);

  const parsed = JSON.parse(raw) as FightParseResult;

  const [fetch1, fetch2] = await Promise.all([
    shouldFetchFighter(parsed.fighter1.externalId),
    shouldFetchFighter(parsed.fighter2.externalId),
  ]);

  const queue = createQueue();
  const jobs = [];
  if (fetch1)
    jobs.push(
      enqueue(queue, "ufcstats-fighter-fetch", {
        externalId: parsed.fighter1.externalId,
        parentJobId: data.parentJobId,
      }),
    );
  if (fetch2)
    jobs.push(
      enqueue(queue, "ufcstats-fighter-fetch", {
        externalId: parsed.fighter2.externalId,
        parentJobId: data.parentJobId,
      }),
    );
  await Promise.all(jobs);

  return { fighter1Fetched: fetch1, fighter2Fetched: fetch2 };
}
