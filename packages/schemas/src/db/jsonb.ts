import type {
  PointCategories,
  ScoreFactor,
  StatPointsBreakdown,
  StatPointsNumberedEntry,
  StatPointsOccurrenceEntry,
} from "@challenger-fantasy/types";
import { z } from "@hono/zod-openapi";

/**
 * Scoring for a daily MMA game
 */

type PointsConfigShape = Partial<PointCategories<number>>;

export const pointsConfigSchema = z.object({
  win: z.number().optional(),
  sigStrike: z.number().optional(),
  standingStrike: z.number().optional(),
  groundStrike: z.number().optional(),
  headStrike: z.number().optional(),
  bodyStrike: z.number().optional(),
  takedown: z.number().optional(),
  controlTimeSecond: z.number().optional(),
  knockdown: z.number().optional(),
  subAttempt: z.number().optional(),
  finish: z.number().optional(),
  finishRnd1Bonus: z.number().optional(),
  finishRnd2Bonus: z.number().optional(),
}) satisfies z.ZodType<PointsConfigShape>;
export type PointsConfig = z.infer<typeof pointsConfigSchema>;

/**
 * Scoring breakdown for a daily MMA game submission
 */

const statPointsNumberedEntrySchema = z.object({
  count: z.number(),
  pointsPer: z.number(),
  pointsEarned: z.number(),
}) satisfies z.ZodType<StatPointsNumberedEntry>;

const statPointsOccurrenceEntrySchema = z.object({
  occurred: z.boolean(),
  pointsPer: z.number(),
  pointsEarned: z.number(),
}) satisfies z.ZodType<StatPointsOccurrenceEntry>;

export const statPointsBreakdownSchema = z.object({
  win: statPointsOccurrenceEntrySchema,
  sigStrike: statPointsNumberedEntrySchema,
  standingStrike: statPointsNumberedEntrySchema,
  groundStrike: statPointsNumberedEntrySchema,
  headStrike: statPointsNumberedEntrySchema,
  bodyStrike: statPointsNumberedEntrySchema,
  takedown: statPointsNumberedEntrySchema,
  controlTimeSecond: statPointsNumberedEntrySchema,
  knockdown: statPointsNumberedEntrySchema,
  subAttempt: statPointsNumberedEntrySchema,
  finish: statPointsOccurrenceEntrySchema,
  finishRnd1Bonus: statPointsOccurrenceEntrySchema,
  finishRnd2Bonus: statPointsOccurrenceEntrySchema,
  total: z.number(),
}) satisfies z.ZodType<StatPointsBreakdown>;

const scoreFactorSchema = z.object({
  fighterId: z.string(),
  baseScore: z.number(),
  potentialScore: z.number(),
  effectiveScore: z.number(),
  isBackup: z.boolean().optional(),
  replacedFighter: z
    .object({
      fighterId: z.string(),
      baseScore: z.number(),
      potentialScore: z.number(),
      effectiveScore: z.number(),
      reason: z.string(),
    })
    .optional(),
}) satisfies z.ZodType<ScoreFactor>;

type SubmissionBreakdownSchema = { schemaKey: "submission-breakdown-v1" } & {
  overallScore: number;
  tiebreakScore: number;
  factors: ScoreFactor[];
};

export const dailyMmaGameSubmissionBreakdownSchema = z.union([
  z.object({
    schemaKey: z.literal("submission-breakdown-v1"),
    overallScore: z.number(),
    tiebreakScore: z.number(),
    factors: z.array(scoreFactorSchema),
  }) satisfies z.ZodType<SubmissionBreakdownSchema>,
  z.object({}), // TODO: remove
]);
export type DailyMmaGameSubmissionBreakdown = z.infer<typeof dailyMmaGameSubmissionBreakdownSchema>;

// GAMES

const scoringProfileSchema = z.enum(["balanced"]);
export type ScoringProfile = z.infer<typeof scoringProfileSchema>;

// GAME METADATA & CONFIG

const gameMetadataV1Schema = z.object({
  version: z.literal(1),
  name: z.string().optional(),
  enabled: z.boolean(),
  tags: z.array(z.string()).optional(),
  iconColor: z.string().optional(),
});
export type GameMetadataV1 = z.infer<typeof gameMetadataV1Schema>;

export const gameMetadataSchema = z.discriminatedUnion("version", [gameMetadataV1Schema]);
export type GameMetadata = z.infer<typeof gameMetadataSchema>;

const gameConfigV1Schema = z.object({
  version: z.literal(1),
  scope: z.union([
    z.object({ kind: z.literal("single_event") }),
    z.object({ kind: z.literal("multi_event"), count: z.int().min(2).max(50) }),
  ]),
  mode: z.union([
    z.object({
      kind: z.literal("draft"),
      numPeople: z.union([z.literal(2), z.literal(3), z.literal(4)]),
      pickClockSeconds: z.number().default(30),
    }),
    z.object({ kind: z.literal("solo") }),
  ]),
  numPickSlots: z.int().min(1).max(10),
  selectFrom: z.union([
    z.object({ kind: z.literal("full_card") }),
    z.object({ kind: z.literal("top_fights"), number: z.int().min(1).max(30) }),
  ]),
  scoringProfile: scoringProfileSchema,
  submissionWindow: z
    .object({
      opens_at: z.string().optional(),
      closes_at: z.string().optional(),
    })
    .optional(),
  prizeDetails: z
    .object({
      payouts: z.array(
        z.union([
          z.object({
            kind: z.literal("exact"),
            place: z.number(),
            amount: z.number(),
          }),
          z.object({
            kind: z.literal("range"),
            places: z.object({ start: z.number(), end: z.number() }),
            amount: z.number(),
          }),
        ]),
      ),
    })
    .optional(),
});
export type GameConfigV1 = z.infer<typeof gameConfigV1Schema>;

export const gameConfigSchema = z.discriminatedUnion("version", [gameConfigV1Schema]);
export type GameConfig = z.infer<typeof gameConfigSchema>;

/**
 * Metadata for a daily MMA game submission
 *
 * This shows details about a specific user submission. This
 * should apply to the entire submission, NOT individual picks.
 */
export const DailyMmaGameSubmissionMetadataSchema = z.object({
  name: z.string().optional(),
});
export type DailyMmaGameSubmissionMetadata = z.infer<typeof DailyMmaGameSubmissionMetadataSchema>;

/**
 * Metadata for a daily MMA game submission pick
 *
 * This shows details about a specific pick, eg. boost applied,
 * hero-fighter part, order, etc.
 */
export const DailyMmaGameSubmissionPickMetadataSchema = z.object({
  kind: z.enum(["default"]),
  order: z.number(),
});
export type DailyMmaGameSubmissionPickMetadata = z.infer<
  typeof DailyMmaGameSubmissionPickMetadataSchema
>;

// FEATURE FLAG RULES

export const featureFlagRulesSchema = z.object({
  percentage: z.number().min(0).max(100).optional(),
  allow_users: z.array(z.uuid()).optional(),
});

// SAVE DRAFT SUBMISSIONS FUNCTION INPUT

export const saveDraftSubmissionsInputSchema = z.array(
  z.object({
    user_id: z.uuid(),
    metadata: DailyMmaGameSubmissionMetadataSchema,
    position: z.number(),
    picks: z.array(
      z.object({
        fighter_id: z.uuid(),
        metadata: DailyMmaGameSubmissionPickMetadataSchema,
      }),
    ),
  }),
);
export type SaveDraftSubmissionsInput = z.infer<typeof saveDraftSubmissionsInputSchema>;
