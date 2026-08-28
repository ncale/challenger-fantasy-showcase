import type { LandedVsAttempted } from "../../types";
import { z } from "@hono/zod-openapi";
import { gameConfigSchema, gameMetadataSchema, statPointsBreakdownSchema } from "../db/jsonb";
import { FighterRoundStatsSchemaV1 } from "../fight-stats";

// GENERIC

export const featureFlagsResponseDtoSchema = z
  .record(z.string(), z.boolean())
  .openapi("FeatureFlagsResponse");

const versionFieldsDtoSchema = z.object({
  minAppVersion: z.string(),
  latestAppVersion: z.string(),
});

export const appConfigResponseDtoSchema = z
  .object({
    maintenanceMode: z.boolean(),
    /** @deprecated use ios.minAppVersion */
    minAppVersion: z.string(),
    ios: versionFieldsDtoSchema,
    reviewPromptMinSessions: z.number().int(),
    reviewPromptCooldownDays: z.number().int(),
    trackPageLivePreviewCount: z.number().int(),
    trackPageUpcomingPreviewCount: z.number().int(),
    trackPageResultsPreviewCount: z.number().int(),
    draftInitializingTimeSeconds: z.number().int(),
    maxConcurrentDrafts: z.number().int(),
  })
  .openapi("AppConfigResponse");
export type AppConfigResponseDto = z.infer<typeof appConfigResponseDtoSchema>;

export const healthResponseDtoSchema = z
  .object({
    status: z.string().openapi({ example: "ok" }),
    timestamp: z.string().openapi({ example: "2021-01-01" }),
  })
  .openapi("HealthResponse");

export const errorResponseDtoSchema = z
  .object({
    message: z.string().openapi({ example: "Error message" }),
  })
  .openapi("ErrorResponse");

// SIMPLE TYPE SCHEMAS

const uuidDtoSchema = z.uuid().openapi({ example: "123" });
const slugDtoSchema = z.string().openapi({ example: "entity-name" });
const dateDtoSchema = z.string().openapi({ example: "2021-01-01" });

const simpleEntityDtoSchema = z.object({
  id: uuidDtoSchema,
  name: z.string().openapi({ example: "Entity Name" }),
});

const submissionEventDtoSchema = simpleEntityDtoSchema.extend({
  shortName: z.string().optional().openapi({ example: "UFC 300" }),
});

// DTO MODELS

// ! DEPRECATED - use `userProfileDtoSchema` instead
export const userProfileSnakeCaseDtoSchema = z
  .object({
    user_id: uuidDtoSchema.nullable(),
    username: z.string().nullable(),
    avatar_url: z.string().nullable(),
    updated_at: z.string().nullable(),
    since: z.string().nullable(),
  })
  .openapi("UserProfileSnakeCaseDtoSchema");

// TODO: make these fields non-nullable where possible
const userProfileBaseDtoSchema = z.object({
  userId: uuidDtoSchema.nullable(),
  username: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

export const userProfileDtoSchema = z
  .object({
    ...userProfileBaseDtoSchema.shape,
    updatedAt: z.string().nullable(),
    since: z.string().nullable(),
  })
  .openapi("UserProfileDTO");
export type UserProfileDto = z.infer<typeof userProfileDtoSchema>;

// -----

export const gameDtoSchema = z
  .object({
    id: uuidDtoSchema,
    // TODO: replace this with full event data
    eventId: uuidDtoSchema,
    name: z.string().openapi({ example: "Game Name" }),
    config: gameConfigSchema,
    metadata: gameMetadataSchema,
  })
  .openapi("GameDTO");
export type GameDto = z.infer<typeof gameDtoSchema>;

// -----

const statusDtoSchema = z
  .enum(["scheduled", "live", "final", "cancelled"])
  .openapi({ example: "scheduled" });

// -----

const eventBaseDtoSchema = z.object({
  id: uuidDtoSchema,
  slug: slugDtoSchema,
  name: z.string().openapi({ example: "Event Name" }),
  seriesName: z.string(),
  headlineName: z.string(),
  status: statusDtoSchema,
  eventDate: dateDtoSchema,
});

export const eventDtoSchema = z
  .object({
    ...eventBaseDtoSchema.shape,
    startTimeUtc: dateDtoSchema.nullable(),
    prelimsStartTimeUtc: dateDtoSchema.nullable(),
    mainCardStartTimeUtc: dateDtoSchema.nullable(),
  })
  .openapi("EventDTO");

export const eventWithGamesDtoSchema = z
  .object({
    ...eventDtoSchema.shape,
    games: z.array(gameDtoSchema),
  })
  .openapi("EventWithGamesDTO");
export type EventWithGamesDto = z.infer<typeof eventWithGamesDtoSchema>;

// -----

export const fighterSimpleDtoSchema = z.object({
  id: uuidDtoSchema,
  name: z.string().openapi({ example: "Fighter Name" }),
  slug: slugDtoSchema,
});
export type FighterSimpleDto = z.infer<typeof fighterSimpleDtoSchema>;

export const fighterDtoSchema = fighterSimpleDtoSchema.extend({
  dob: dateDtoSchema,
  heightIn: z.number().openapi({ example: 180 }),
  reachIn: z.number().openapi({ example: 180 }),
  stance: z.string().openapi({ example: "southpaw" }),
  country: z.string().openapi({ example: "USA" }),
  wins: z.number().optional().openapi({ example: 10 }),
  losses: z.number().optional().openapi({ example: 5 }),
  draws: z.number().optional().openapi({ example: 2 }),
  noContests: z.number().optional().openapi({ example: 3 }),
});
export type FighterDto = z.infer<typeof fighterDtoSchema>;

export const fightersDtoSchema = z.array(fighterDtoSchema).openapi("FightersDTO");
export type FightersDto = z.infer<typeof fightersDtoSchema>;

// -----

const landedVsAttemptedDtoSchema = z.object({
  landed: z.number(),
  attempted: z.number(),
}) satisfies z.ZodType<LandedVsAttempted>;

const generalStatsDtoSchema = z.object({
  knockdowns: z.number(),
  significantStrikes: landedVsAttemptedDtoSchema,
  significantStrikePercentage: z.number().nullable(),
  totalStrikes: landedVsAttemptedDtoSchema,
  takedowns: landedVsAttemptedDtoSchema,
  takedownPercentage: z.number().nullable(),
  submissionAttempts: z.number(),
  reversals: z.number(),
  controlTimeSeconds: z.number(),
});

const significantStrikeStatsDtoSchema = z.object({
  total: landedVsAttemptedDtoSchema,
  head: landedVsAttemptedDtoSchema,
  body: landedVsAttemptedDtoSchema,
  leg: landedVsAttemptedDtoSchema,
  distance: landedVsAttemptedDtoSchema,
  clinch: landedVsAttemptedDtoSchema,
  ground: landedVsAttemptedDtoSchema,
});

export const fighterStatsDtoSchema = z.object({
  schemaVersion: z.literal(1),
  general: generalStatsDtoSchema,
  strikes: significantStrikeStatsDtoSchema,
});

// -----

export const fighterAnalyticsDtoSchema = z.object({
  fighterId: uuidDtoSchema,
  computedAtFightCount: z.number(),
  sigStrikesLandedPer5Mins: z.number().nullable(),
  sigStrikesAbsorbedPer5Mins: z.number().nullable(),
  inControlPct: z.number().nullable(),
  underControlPct: z.number().nullable(),
  takedownsAttemptedPer5Mins: z.number().nullable(),
  takedownAccuracy: z.number().nullable(),
  takedownDefence: z.number().nullable(),
  lowestWeightKey: z.string().nullable(),
  highestWeightKey: z.string().nullable(),
});
export type FighterAnalyticsDto = z.infer<typeof fighterAnalyticsDtoSchema>;

// export const aggregatedFighterStatsDtoSchema = z.object({
//   fighterId: uuidDtoSchema,
//   fighterName: z.string(),
//   fighterSlug: slugDtoSchema,
//   totalFights: z.number(),
//   totalSeconds: z.number(),
//   wins: z.number(),
//   losses: z.number(),
//   draws: z.number(),
//   noContests: z.number(),
//   offensiveStats: fighterStatsDtoSchema,
//   defensiveStats: fighterStatsDtoSchema,
// });
// export type AggregatedFighterStatsDto = z.infer<typeof aggregatedFighterStatsDtoSchema>;

// -----

// TODO: can the stats even be nullable?
export const preFightStatsDtoSchema = z.object({
  fightId: uuidDtoSchema,
  // TODO: use `fighterSimpleDtoSchema.extend` instead. Cannot use now because fighter name isn't returned in query in situations where there is no data from past 5 years.
  fighter1: z.object({
    id: uuidDtoSchema,
    offensiveStats: FighterRoundStatsSchemaV1,
    defensiveStats: FighterRoundStatsSchemaV1,
    totalSeconds: z.number(),
    totalRounds: z.number(),
  }),
  fighter2: z.object({
    id: uuidDtoSchema,
    offensiveStats: FighterRoundStatsSchemaV1,
    defensiveStats: FighterRoundStatsSchemaV1,
    totalSeconds: z.number(),
    totalRounds: z.number(),
  }),
});
export type PreFightStatsDto = z.infer<typeof preFightStatsDtoSchema>;

// -----

const weightClassDtoSchema = z.object({
  weightClass: z.string().openapi({ example: "Lightweight" }),
  weightClassKey: z.string().openapi({ example: "155lbs_lightweight" }),
});

export const fightDtoSchema = z.object({
  id: uuidDtoSchema,
  slug: slugDtoSchema,
  eventId: uuidDtoSchema,
  fighter1: fighterSimpleDtoSchema.extend({
    stats: FighterRoundStatsSchemaV1.nullable(),
  }),
  fighter2: fighterSimpleDtoSchema.extend({
    stats: FighterRoundStatsSchemaV1.nullable(),
  }),
  status: statusDtoSchema,
  order: z.number().openapi({ example: 1 }),
  ...weightClassDtoSchema.shape,
  result: z
    .object({
      result: z.enum(["f1", "f2", "draw", "no-contest"]).openapi({ example: "win" }),
      round: z.number().openapi({ example: 1 }),
      round_time: z.number().openapi({ example: 10 }),
      method: z.string().openapi({ example: "submission" }),
    })
    .nullable(),
});
export type FightDto = z.infer<typeof fightDtoSchema>;

// -----

export const fighterEventInfoDtoSchema = z.object({
  fighterId: uuidDtoSchema,
  projectedPoints: z.number().openapi({ example: 100 }),
  fightStatus: z.string().openapi({ example: "scheduled" }),
  opponent: fighterSimpleDtoSchema,
  winProbability: z.number().nullable().optional().openapi({ example: 0.65 }),
  recentForm: z.string().nullable().optional().openapi({ example: "WWLWW" }),
  // ! DEPRECATED - use `fightWeightKey` instead
  fightWeight: z.string().openapi({ example: "Lightweight" }),
  // TODO: replace with the same `weightClassKey` field used in `fightDtoSchema` for consistency.
  fightWeightKey: z.string().openapi({ example: "155lbs_lightweight" }),
});
export type FighterEventInfoDto = z.infer<typeof fighterEventInfoDtoSchema>;

// -----

const submissionCountsDtoSchema = z
  .object({
    gameId: uuidDtoSchema,
    submissionCount: z.number().openapi({ example: 100 }),
  })
  .openapi("SubmissionCountsDTO");

// -----

export const userSubmissionCountsDtoSchema = z
  .object({
    live: z.number().openapi({ example: 15 }),
    upcoming: z.number().openapi({ example: 15 }),
    completed: z.number().openapi({ example: 70 }),
  })
  .openapi("UserSubmissionCountsDTO");
export type UserSubmissionCountsDto = z.infer<typeof userSubmissionCountsDtoSchema>;

export const userStatsDtoSchema = z
  .object({
    gamesPlayed: z.number().openapi({ example: 50 }),
    gamesWon: z.number().openapi({ example: 10 }),
    winPercentage: z.number().openapi({ example: 20 }),
  })
  .openapi("UserStatsDTO");
export type UserStatsDto = z.infer<typeof userStatsDtoSchema>;

// ------------------------------
// SCORING
// ------------------------------

const scoringResultDtoSchema = z.object({
  score: z.number().openapi({ example: 100 }),
  position: z.number().openapi({ example: 1 }),
});

// ------------------------------
// PICKS (shared base — reused by submission and draft group)
// ------------------------------

const pickDtoSchema = z.object({
  fighterId: uuidDtoSchema,
  order: z.number().openapi({ example: 1 }),
});

const submissionPickDtoSchema = pickDtoSchema
  .extend({
    kind: z.enum(["default"]).openapi({ example: "default" }),
  })
  .openapi("SubmissionPickDTO");

const draftGroupPickDtoSchema = pickDtoSchema.extend({
  fighterName: z.string().openapi({ example: "Conor McGregor" }),
  opponentName: z.string().openapi({ example: "Dustin Poirier" }),
  fightId: uuidDtoSchema,
  score: z.number().nullable().openapi({ example: 80 }),
  baseScore: z.number().nullable().openapi({ example: 80 }),
  potentialScore: z.number().nullable().openapi({ example: 80 }),
});

// ------------------------------
// DRAFT GROUP
// ------------------------------

const draftGroupTeamDtoSchema = z
  .object({
    submissionId: uuidDtoSchema,
    // TODO: replace with `...userProfileBaseDtoSchema.shape,` once the user profile endpoint is updated to return non-nullable userId
    userId: uuidDtoSchema,
    username: z.string().openapi({ example: "Username" }),
    avatarUrl: z.string().nullable().openapi({ example: "https://example.com/avatar.png" }),
    // TODO: replace with `...scoringResultDtoSchema.shape,`
    score: z.number().openapi({ example: 100 }),
    position: z.number().nullable().openapi({ example: 1 }),
    picks: z.array(draftGroupPickDtoSchema),
  })
  .openapi("DraftGroupTeamDto");
export type DraftGroupTeamDto = z.infer<typeof draftGroupTeamDtoSchema>;

export const draftGroupDtoSchema = z
  .object({
    id: uuidDtoSchema,
    teams: z.array(draftGroupTeamDtoSchema),
  })
  .openapi("draftGroupDtoSchema");

// ------------------------------
// SUBMISSIONS
// ------------------------------

export const submissionDtoSchema = z
  .object({
    id: uuidDtoSchema,
    name: z.string().optional().openapi({ example: "Submission Name" }),
    scoring: scoringResultDtoSchema,
    game: simpleEntityDtoSchema.optional(), // TODO: investigate - remove optionality?
    event: submissionEventDtoSchema.optional(), // TODO: investigate - remove optionality?
  })
  .openapi("SubmissionDto");
export type SubmissionDto = z.infer<typeof submissionDtoSchema>;

export const submissionsDtoSchema = z
  .object({
    submissions: z.array(submissionDtoSchema),
  })
  .openapi("SubmissionsDto");

/** @deprecated this schema belongs to an endpoint that cannot paginate easily */
const submissionsByEventDtoSchema = z
  .object({
    event: simpleEntityDtoSchema,
    submissions: z.array(submissionDtoSchema),
  })
  .openapi("SubmissionsByEventDto");

export const groupedSubmissionsDtoSchema = z
  .object({
    groups: z.array(submissionsByEventDtoSchema),
  })
  .openapi("GroupedSubmissionsDto");

export const submissionDetailDtoSchema = z
  .object({
    ...submissionDtoSchema.shape,
    game: simpleEntityDtoSchema,
    event: simpleEntityDtoSchema,
    draftGroupId: uuidDtoSchema,
    picks: z.array(submissionPickDtoSchema),
  })
  .openapi("SubmissionDetailDto");
export type SubmissionDetailDto = z.infer<typeof submissionDetailDtoSchema>;

// -----

// ROUTE SPECIFIC

// -----

export const eventCardDtoSchema = z
  .object({
    fights: z.array(fightDtoSchema),
    fighters: z.array(fighterSimpleDtoSchema),
    fighterEventInfo: z.array(fighterEventInfoDtoSchema),
    fighterAnalytics: z.array(fighterAnalyticsDtoSchema),
  })
  .openapi("EventCardDTO");
export type EventCardDto = z.infer<typeof eventCardDtoSchema>;

export const allGameSubmissionCountsDtoSchema = z
  .object({
    games: z.array(submissionCountsDtoSchema),
  })
  .openapi("AllGameSubmissionCountsDTO");

// Events
export const eventsListDtoSchema = z
  .object({
    events: z.array(eventWithGamesDtoSchema),
    total: z.number().openapi({ example: 100 }),
    page: z.number().openapi({ example: 0 }),
    pageSize: z.number().openapi({ example: 20 }),
  })
  .openapi("EventsListDTO");

// Pick ranking
export const pickRankingDtoSchema = z
  .object({
    eventId: uuidDtoSchema,
    fighterIds: z.array(uuidDtoSchema),
  })
  .openapi("PickRankingDto");
export type PickRankingDto = z.infer<typeof pickRankingDtoSchema>;

// User submission events
export const userSubmissionEventDtoSchema = z.object({
  event: eventBaseDtoSchema,
  submissionCount: z.number().int(),
});
export type UserSubmissionEventDto = z.infer<typeof userSubmissionEventDtoSchema>;

export const userSubmissionEventsDtoSchema = z.object({
  submissionEvents: z.array(userSubmissionEventDtoSchema),
  total: z.number().int().openapi({ example: 10 }),
  page: z.number().int().openapi({ example: 0 }),
  pageSize: z.number().int().openapi({ example: 10 }),
});
export type UserSubmissionEventsDto = z.infer<typeof userSubmissionEventsDtoSchema>;

// Fight stats (for fight page)
export const fightStatsDtoSchema = z
  .object({
    id: uuidDtoSchema,
    eventId: uuidDtoSchema,
    eventName: z.string().openapi({ example: "UFC 300" }),
    eventSlug: slugDtoSchema,
    eventDate: z.string().openapi({ example: "2024-04-13" }),
    ...weightClassDtoSchema.shape,
    isTitle: z.boolean().openapi({ example: true }),
    status: z.string().openapi({ example: "scheduled" }),
    order: z.number().openapi({ example: 1 }),
    fighter1: z.object({
      id: uuidDtoSchema,
      name: z.string().openapi({ example: "Jon Jones" }),
      slug: slugDtoSchema,
      age: z.number().nullable().openapi({ example: 36 }),
      heightIn: z.number().nullable().openapi({ example: 76 }),
      reachIn: z.number().nullable().openapi({ example: 84.5 }),
      stance: z.string().nullable().openapi({ example: "Orthodox" }),
      record: z.string().openapi({ example: "27-1-0" }),
    }),
    fighter2: z.object({
      id: uuidDtoSchema,
      name: z.string().openapi({ example: "Stipe Miocic" }),
      slug: slugDtoSchema,
      age: z.number().nullable().openapi({ example: 41 }),
      heightIn: z.number().nullable().openapi({ example: 76 }),
      reachIn: z.number().nullable().openapi({ example: 80 }),
      stance: z.string().nullable().openapi({ example: "Orthodox" }),
      record: z.string().openapi({ example: "20-4-0" }),
    }),
    result: z
      .object({
        result: z.string().openapi({ example: "win" }),
        round: z.number().openapi({ example: 3 }),
        round_time: z.number().openapi({ example: 125 }),
        method: z.string().openapi({ example: "TKO" }),
      })
      .nullable(),
  })
  .openapi("FightStatsDTO");
export type FightStatsDto = z.infer<typeof fightStatsDtoSchema>;

// Fighter scoring archive
export const fighterScoringEntryDtoSchema = z
  .object({
    fighterId: uuidDtoSchema,
    score: z.number().openapi({ example: 18.5 }),
    breakdown: statPointsBreakdownSchema,
  })
  .openapi("FighterScoringEntryDTO");

export const fighterScoringDtoSchema = z
  .array(fighterScoringEntryDtoSchema)
  .openapi("FighterScoringDTO");
export type FighterScoringDto = z.infer<typeof fighterScoringDtoSchema>;
