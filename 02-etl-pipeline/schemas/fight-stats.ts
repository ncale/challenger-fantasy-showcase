import type { FightRoundSnapshot, LandedVsAttempted } from "../types";
import { z } from "zod";

// GENERAL

const LandedVsAttemptedSchema = z.object({
  landed: z.number(),
  attempted: z.number(),
}) satisfies z.ZodType<LandedVsAttempted>;

// TODO: move this to jsonb.ts

// SCHEMA VERSION 1 - 2025-08-21 (DO NOT CHANGE)

const GeneralStatsSchema = z.object({
  knockdowns: z.number(),
  significantStrikes: LandedVsAttemptedSchema,
  significantStrikePercentage: z.number().nullable(),
  totalStrikes: LandedVsAttemptedSchema,
  takedowns: LandedVsAttemptedSchema,
  takedownPercentage: z.number().nullable(),
  submissionAttempts: z.number(),
  reversals: z.number(),
  controlTimeSeconds: z.number(),
});

const SignificantStrikesTotalSchema = z.object({
  total: LandedVsAttemptedSchema,
  head: LandedVsAttemptedSchema,
  body: LandedVsAttemptedSchema,
  leg: LandedVsAttemptedSchema,
  distance: LandedVsAttemptedSchema,
  clinch: LandedVsAttemptedSchema,
  ground: LandedVsAttemptedSchema,
});

// TODO: lowercase schema name and move v1 before "Schema"
export const FighterRoundStatsSchemaV1 = z.object({
  schemaVersion: z.literal(1),
  general: GeneralStatsSchema,
  strikes: SignificantStrikesTotalSchema,
});
export type FighterRoundStatsV1 = z.infer<typeof FighterRoundStatsSchemaV1>;

// CONSOLIDATED SCHEMA

export const ConsolidatedFightRoundSnapshotSchema = z.discriminatedUnion("schemaVersion", [
  FighterRoundStatsSchemaV1,
]);

// SCHEMA FROM TABLE: fight_round_snapshot

type EssentialFightRoundSnapshot = Pick<
  FightRoundSnapshot,
  "round" | "fighter_1_stats" | "fighter_2_stats"
>;

const EssentialFightRoundSnapshotSchema = z.object({
  round: z.number(),
  fighter_1_stats: ConsolidatedFightRoundSnapshotSchema,
  fighter_2_stats: ConsolidatedFightRoundSnapshotSchema,
}) satisfies z.ZodType<EssentialFightRoundSnapshot>;

export const RoundsSnapshotsSchema = z.array(EssentialFightRoundSnapshotSchema);

export type RoundSnapshots = z.infer<typeof RoundsSnapshotsSchema>;
