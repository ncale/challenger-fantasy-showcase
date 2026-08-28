import { getRoundsScheduled, toWeightClassKey } from "../data";
import { lookupEventId, lookupFighterId, upsertFight } from "../db";
import {
  createQueue,
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import type { parseUfcstatsFightDetailsPage } from "../parsers";
import { type FightInsert, FightInsertSchema } from "../schemas";
import { slugifyFight } from "../data/utils";
import { mapWinner, secondsToRoundTime } from "./fight-helpers.ts";
import { enqueue } from "./utils.ts";

const redis = createRedisClient();

type FightParseResult = ReturnType<typeof parseUfcstatsFightDetailsPage>;

type CompletedFight = FightParseResult & {
  result: { winner: string; method: string; round: number; time: { seconds: number } };
  timeFormat: string;
};

/**
 * @role {@link JobRole.PERSISTENCE}
 * @description Gets parsed JSON from Redis. Writes fight to the DB.
 * Conditionally triggers result-upsert for completed fights.
 */
export async function ufcstatsFightUpsert(data: JobData): Promise<{
  fighter1: string;
  fighter2: string;
  status: string;
}> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const raw = await redis.get(RedisKeys.parsedFight(externalId));
  if (!raw) throw new Error(`No parsed data in Redis for fight ${externalId} — re-queue parse`);

  const parsed = JSON.parse(raw) as FightParseResult;
  const completed = "result" in parsed ? (parsed as CompletedFight) : null;

  const [eventId, fighter1Id, fighter2Id] = await Promise.all([
    lookupEventId(parsed.eventExternalId),
    lookupFighterId(parsed.fighter1.externalId),
    lookupFighterId(parsed.fighter2.externalId),
  ]);

  // TODO: remove all fight result fields, as this should be handled in the fight result table.
  const validated = FightInsertSchema.parse({
    ufcstats_external_id: externalId,
    slug: slugifyFight(parsed.fighter1.name, parsed.fighter2.name, parsed.eventExternalId),
    event_id: eventId,
    fighter_1_id: fighter1Id,
    fighter_2_id: fighter2Id,
    weight_class: parsed.weightClass.weightClass ?? null,
    weight_class_key: toWeightClassKey(parsed.weightClass.weightClass),
    weight_lbs: null,
    is_title: parsed.title.isTitle,
    title_name: parsed.title.isTitle ? (parsed.title.name ?? null) : null,
    rounds_scheduled: completed ? getRoundsScheduled(completed.timeFormat) : null,
    time_format: completed ? completed.timeFormat : null,
    fight_order: typeof data.orderInEvent === "number" ? data.orderInEvent : null,
    status: completed ? "final" : "scheduled",
    result: completed ? mapWinner(completed.result.winner) : null,
    result_method: completed ? completed.result.method : null,
    result_round: completed ? completed.result.round : null,
    result_round_time: completed ? secondsToRoundTime(completed.result.time.seconds) : null,
    winner_fighter_id: completed
      ? completed.result.winner === "fighter1"
        ? fighter1Id
        : completed.result.winner === "fighter2"
          ? fighter2Id
          : null
      : null,
  } satisfies FightInsert);

  await upsertFight(validated);

  if (completed) {
    const queue = createQueue();
    await enqueue(queue, "ufcstats-fight-result-upsert", {
      externalId,
      parentJobId: data.parentJobId,
    });
  }

  return {
    fighter1: parsed.fighter1.name,
    fighter2: parsed.fighter2.name,
    status: validated.status,
  };
}
