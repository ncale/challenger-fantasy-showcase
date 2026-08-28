import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import type { parseUfcstatsEventDetailsPage } from "../parsers";
import { enqueue } from "./utils.ts";

const redis = createRedisClient();

type EventParseResult = ReturnType<typeof parseUfcstatsEventDetailsPage>;

/**
 * @role {@link JobRole.ORCHESTRATION}
 * @description Gets parsed JSON from Redis. Triggers fetch jobs for related fights.
 * In liveMode, only enqueues fights with results that haven't been processed yet.
 */
export async function ufcstatsEventFanout(data: JobData) {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const raw = await redis.get(RedisKeys.parsedEvent(externalId));
  if (!raw) throw new Error(`No parsed data in Redis for event ${externalId} — re-queue parse`);

  const parsed = JSON.parse(raw) as EventParseResult;
  const queue = createQueue();

  await enqueue(queue, "ufcstats-cancel-orphan-fights", {
    externalId,
    parentJobId: data.parentJobId,
  });

  if (data.liveMode) {
    const finishedSetKey = RedisKeys.finishedFights(externalId);
    let newFights = 0;

    for (const [i, fight] of parsed.fights.entries()) {
      if (fight.winner === null) continue;

      const alreadyQueued = await redis.sismember(finishedSetKey, fight.externalId);
      if (alreadyQueued) continue;

      await enqueue(queue, "ufcstats-fight-fetch", {
        externalId: fight.externalId,
        orderInEvent: i + 1,
        parentJobId: data.parentJobId,
      });
      await redis.sadd(finishedSetKey, fight.externalId);
      newFights++;
    }

    // * Set a TTL on the finished set to prevent unbounded growth in Redis.
    // * This expires 24 hours after the last fight is added.
    if (newFights > 0) {
      await redis.expire(finishedSetKey, 86400);
    }

    return { newFights };
  }

  // * Fan out to all fights in non-live mode
  await Promise.all(
    parsed.fights.map((fight, i) =>
      enqueue(queue, "ufcstats-fight-fetch", {
        externalId: fight.externalId,
        orderInEvent: i + 1,
        parentJobId: data.parentJobId,
      }),
    ),
  );

  return {
    newFights: parsed.fights.length,
    fightIds: parsed.fights.map((f) => f.externalId),
  };
}
