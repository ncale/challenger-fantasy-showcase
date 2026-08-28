import { upsertFighter } from "../db";
import {
  createRedisClient,
  type JobData,
  JobRole,
  RedisKeys,
} from "../queue";
import type { parseUfcstatsFighterDetailsPage } from "../parsers";
import { type FighterInsert, FighterInsertSchema } from "../schemas";
import { slugify } from "../data/utils";

const redis = createRedisClient();

type FighterParseResult = ReturnType<typeof parseUfcstatsFighterDetailsPage>;

/**
 * @role {@link JobRole.PERSISTENCE}
 * @description Gets parsed JSON from Redis. Writes fighter to the DB.
 * @boundary No fans out. No triggering of other jobs.
 */
export async function ufcstatsFighterUpsert(
  data: JobData,
): Promise<{ name: string; slug: string }> {
  const { externalId } = data;
  if (typeof externalId !== "string") throw new Error("externalId required");

  const raw = await redis.get(RedisKeys.parsedFighter(externalId));
  if (!raw) throw new Error(`No parsed data in Redis for fighter ${externalId} — re-queue parse`);

  const parsed = JSON.parse(raw) as FighterParseResult;
  const { physicalStats } = parsed;

  const validated = FighterInsertSchema.parse({
    ufcstats_external_id: externalId,
    slug: slugify(parsed.name),
    full_name: parsed.name,
    nickname: parsed.nickname ?? null,
    height_in: physicalStats.height?.inches ?? null,
    reach_in: physicalStats.reach?.inches ?? null,
    weight_lbs: physicalStats.weight?.lbs ?? null,
    stance: physicalStats.stance ?? null,
    dob: physicalStats.dateOfBirth?.iso ?? null,
    country: null,
  } satisfies FighterInsert);

  await upsertFighter(validated);
  return { name: validated.full_name ?? validated.slug, slug: validated.slug };
}
