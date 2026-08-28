import type { Database, Json } from "../../types";
import { z } from "zod";

// Job payload schemas for the BullMQ ingest pipeline

export const UfcstatsEventsUpcomingJobDataSchema = z.object({
  url: z.string().url().optional(),
});

export const UfcstatsEventDetailsJobDataSchema = z.object({
  url: z.string().url().optional(),
  externalId: z.string(),
});

export const UfcstatsFightDetailsJobDataSchema = z.object({
  url: z.string().url().optional(),
  externalId: z.string(),
});

export const UfcstatsFighterDetailsJobDataSchema = z.object({
  url: z.string().url().optional(),
  externalId: z.string(),
});

// Table insert schemas.
//
// Exact-match schemas are required for type safety and to prevent accidentally inserting invalid data.
// exactSchema() will have a compile-time error if the schema doesn't match the DB Insert type exactly
// (no extra or missing fields, and all field types must match).
//
// If you get an error, inspect the differences and the _Debug type to see what fields are missing or extra
// and update the schema or DB type as needed.

type Tables = Database["public"]["Tables"];

// ── Exact-match helper ────────────────────────────────────────────────────────

type ExactSchema<TSchema extends z.ZodTypeAny, TType> = z.infer<TSchema> extends TType
  ? TType extends z.infer<TSchema>
    ? TSchema
    : never
  : never;

function exactSchema<TSchema extends z.ZodTypeAny, TType>(
  schema: ExactSchema<TSchema, TType>,
): TSchema {
  return schema as TSchema;
}

// ── Debug helper ──────────────────────────────────────────────────────────────

// type SchemaDiff<TSchema extends z.ZodTypeAny, TType> = {
//   extraInSchema: Exclude<keyof z.infer<TSchema>, keyof TType>;
//   missingFromSchema: Exclude<keyof TType, keyof z.infer<TSchema>>;
//   valueMismatches: {
//     [K in keyof z.infer<TSchema> & keyof TType]: z.infer<TSchema>[K] extends TType[K]
//       ? TType[K] extends z.infer<TSchema>[K]
//         ? never
//         : K
//       : K;
//   }[keyof z.infer<TSchema> & keyof TType];
// };

// ── Schemas ───────────────────────────────────────────────────────────────────

// TODO: rename "entityInsert" format to make clear it isn't the database insert type

// Event

const _eventSchema = z.object({
  id: z.string().optional(),
  slug: z.string(),
  name: z.string(),
  city: z.string().nullish(),
  state_or_region: z.string().nullish(),
  country: z.string().nullish(),
  created_at: z.string().nullish(),
  start_time: z.string().nullish(),
  status: z.enum(["scheduled", "live", "final", "cancelled"]),
  org_id: z.string(),
  short_name: z.string().nullish(),
  venue: z.string().nullish(),
  event_date: z.string(),
  prelims_start_time: z.string().nullish(),
  main_card_start_time: z.string().nullish(),
  ufcstats_external_id: z.string().nullish(),
  updated_at: z.string().nullish(),
});

export const EventInsertSchema = exactSchema<typeof _eventSchema, Tables["event"]["Insert"]>(
  _eventSchema,
);
// type _EventDebug = SchemaDiff<typeof _eventSchema, Tables["event"]["Insert"]>;
export type EventInsert = z.infer<typeof EventInsertSchema>;

// Fighter

const _fighterSchema = z.object({
  country: z.string().nullish(),
  created_at: z.string().nullish(),
  dob: z.string().nullish(),
  flags: z.custom<Json>().nullish(),
  full_name: z.string(),
  height_in: z.number().int().nullish(),
  id: z.string().optional(),
  nickname: z.string().nullish(),
  reach_in: z.number().int().nullish(),
  search_priority: z.number().optional(),
  slug: z.string(),
  stance: z.string().nullish(),
  ufcstats_external_id: z.string().nullish(),
  updated_at: z.string().nullish(),
  weight_lbs: z.number().int().nullish(),
});

export const FighterInsertSchema = exactSchema<typeof _fighterSchema, Tables["fighter"]["Insert"]>(
  _fighterSchema,
);
// type _FighterDebug = SchemaDiff<typeof _fighterSchema, Tables["fighter"]["Insert"]>;
export type FighterInsert = z.infer<typeof FighterInsertSchema>;

// Fight

const _fightSchema = z.object({
  created_at: z.string().nullish(),
  details: z.string().nullish(),
  event_id: z.string(),
  fight_order: z.number().int().nullish(),
  fighter_1_id: z.string(),
  fighter_2_id: z.string(),
  id: z.string().optional(),
  is_title: z.boolean().nullish(),
  referee: z.string().nullish(),
  result: z.enum(["f1", "f2", "draw", "no-contest"]).nullish(),
  result_method: z.string().nullish(),
  result_round: z.number().int().nullish(),
  result_round_time: z.string().nullish(),
  rounds_scheduled: z.number().int().nullish(),
  slug: z.string(),
  status: z.enum(["scheduled", "live", "final", "cancelled"]),
  time_format: z.string().nullish(),
  title_name: z.string().nullish(),
  ufcstats_external_id: z.string().nullish(),
  updated_at: z.string().nullish(),
  weight_class: z.string().nullish(),
  weight_class_key: z.string(),
  weight_lbs: z.number().int().nullish(),
  winner_fighter_id: z.string().nullish(),
});

export const FightInsertSchema = exactSchema<typeof _fightSchema, Tables["fight"]["Insert"]>(
  _fightSchema,
);
// type _FightDebug = SchemaDiff<typeof _fightSchema, Tables["fight"]["Insert"]>;
export type FightInsert = z.infer<typeof FightInsertSchema>;

// Fight result

const _fightResultSchema = z.object({
  created_at: z.string().nullish(),
  details: z.string().nullish(),
  fight_id: z.string(),
  fighter_1_stats: z.custom<Json>().nullish(),
  fighter_2_stats: z.custom<Json>().nullish(),
  method: z.string().nullish(),
  referee: z.string().nullish(),
  result: z.enum(["f1", "f2", "draw", "no-contest"]).nullish(),
  round: z.number().int().nullish(),
  round_time: z.string().nullish(),
});

export const FightResultInsertSchema = exactSchema<
  typeof _fightResultSchema,
  Tables["fight_result"]["Insert"]
>(_fightResultSchema);
// type _FightResultDebug = SchemaDiff<typeof _fightResultSchema, Tables["fight_result"]["Insert"]>;
export type FightResultInsert = z.infer<typeof FightResultInsertSchema>;

// Fight round snapshot

const _fightRoundSnapshotSchema = z.object({
  created_at: z.string().nullish(),
  fight_id: z.string(),
  fighter_1_stats: z.custom<Json>(),
  fighter_2_stats: z.custom<Json>(),
  id: z.number().int().optional(),
  round: z.number().int(),
  updated_at: z.string().nullish(),
});

export const FightRoundSnapshotInsertSchema = exactSchema<
  typeof _fightRoundSnapshotSchema,
  Tables["fight_round_snapshot"]["Insert"]
>(_fightRoundSnapshotSchema);
// type _FightRoundSnapshotDebug = SchemaDiff<typeof _fightRoundSnapshotSchema, Tables["fight_round_snapshot"]["Insert"]>;
export type FightRoundSnapshotInsert = z.infer<typeof FightRoundSnapshotInsertSchema>;

// Fighter stats

const _fighterStatsSchema = z.object({
  created_at: z.string().nullish(),
  draws: z.number().int().optional(),
  fighter_id: z.string(),
  losses: z.number().int().optional(),
  no_contests: z.number().int().optional(),
  updated_at: z.string().nullish(),
  wins: z.number().int().optional(),
});

export const FighterStatsInsertSchema = exactSchema<
  typeof _fighterStatsSchema,
  Tables["fighter_stats"]["Insert"]
>(_fighterStatsSchema);
// type _FighterStatsDebug = SchemaDiff<typeof _fighterStatsSchema, Tables["fighter_stats"]["Insert"]>;
export type FighterStatsInsert = z.infer<typeof FighterStatsInsertSchema>;

// Fighter analytics

const _fighterAnalyticsSchema = z.object({
  computed_at_fight_count: z.number().int().optional(),
  created_at: z.string().nullish(),
  fighter_id: z.string(),
  highest_weight_key: z.string().nullish(),
  in_control_pct: z.number().nullish(),
  lowest_weight_key: z.string().nullish(),
  sig_strikes_absorbed_per_5_mins: z.number().nullish(),
  sig_strikes_landed_per_5_mins: z.number().nullish(),
  takedown_accuracy: z.number().nullish(),
  takedown_defence: z.number().nullish(),
  takedowns_attempted_per_5_mins: z.number().nullish(),
  under_control_pct: z.number().nullish(),
  updated_at: z.string().nullish(),
});

export const FighterAnalyticsInsertSchema = exactSchema<
  typeof _fighterAnalyticsSchema,
  Tables["fighter_analytics"]["Insert"]
>(_fighterAnalyticsSchema);
// type _FighterAnalyticsDebug = SchemaDiff<typeof _fighterAnalyticsSchema, Tables["fighter_analytics"]["Insert"]>;
export type FighterAnalyticsInsert = z.infer<typeof FighterAnalyticsInsertSchema>;

// Odds snapshot

const _oddsSnapshotSchema = z.object({
  id: z.string().optional(),
  fight_id: z.string(),
  fighter_id: z.string(),
  avg_decimal_odds: z.number(),
  fair_probability: z.number(),
  bookmaker_count: z.number().int(),
  fetched_at: z.string().optional(),
});

export const OddsSnapshotInsertSchema = exactSchema<
  typeof _oddsSnapshotSchema,
  Tables["odds_snapshot"]["Insert"]
>(_oddsSnapshotSchema);
// type _OddsSnapshotDebug = SchemaDiff<typeof _oddsSnapshotSchema, Tables["odds_snapshot"]["Insert"]>;
export type OddsSnapshotInsert = z.infer<typeof OddsSnapshotInsertSchema>;
