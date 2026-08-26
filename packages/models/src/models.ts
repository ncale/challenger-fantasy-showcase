import {
  type DailyMmaGameSubmissionBreakdown,
  type DailyMmaGameSubmissionMetadata,
  DailyMmaGameSubmissionMetadataSchema,
  type DailyMmaGameSubmissionPickMetadata,
  DailyMmaGameSubmissionPickMetadataSchema,
  dailyMmaGameSubmissionBreakdownSchema,
  FighterRoundStatsSchemaV1,
  type FighterRoundStatsV1,
  FightResultMethodSchema,
  type GameConfig,
  type GameMetadata,
  gameConfigSchema,
  gameMetadataSchema,
  parsePgInterval,
} from "@challenger-fantasy/schemas";
import type { FightResultMethod, Json, Overwrite, Prettify } from "@challenger-fantasy/types";

// GAMES - Hydrated parses game metadata and config

type PlainGame = { metadata: Json; config: Json };

export type HydratedGame<T extends PlainGame> = Prettify<
  Overwrite<
    T,
    {
      metadata: GameMetadata;
      config: GameConfig;
    }
  >
>;

export function hydrateGame<T extends PlainGame>(game: T): HydratedGame<T> {
  const metadata = gameMetadataSchema.parse(game.metadata);
  const config = gameConfigSchema.parse(game.config);

  return { ...game, metadata, config };
}

// FIGHT STATS - Hydrated parses fight stats. Null if fight is not completed yet.

type BaseFightStats = {
  fighter_1_stats: Json | null;
  fighter_2_stats: Json | null;
  method: string | null;
  result_round_time: unknown | null;
};

export type HydratedFightStats<T extends BaseFightStats> = Prettify<
  Overwrite<
    T,
    {
      fighter_1_stats: FighterRoundStatsV1 | null;
      fighter_2_stats: FighterRoundStatsV1 | null;
      method: FightResultMethod | null;
      result_round_time: number | null;
    }
  >
>;

export function hydrateFightStats<T extends BaseFightStats>(fightStats: T): HydratedFightStats<T> {
  return {
    ...fightStats,
    fighter_1_stats: FighterRoundStatsSchemaV1.nullable().parse(fightStats.fighter_1_stats),
    fighter_2_stats: FighterRoundStatsSchemaV1.nullable().parse(fightStats.fighter_2_stats),
    method: FightResultMethodSchema.nullable().parse(fightStats.method),
    result_round_time: fightStats.result_round_time
      ? parsePgInterval(fightStats.result_round_time)
      : null,
  };
}

// FIGHTER PERFORMANCES - Hydrated parses fighter performance stats (offensive_stats and defensive_stats)

type BaseFighterPerformance = {
  offensive_stats: Json;
  defensive_stats: Json;
  result_round_time: unknown;
};

export type HydratedFighterPerformance<T extends BaseFighterPerformance> = Prettify<
  Overwrite<
    T,
    {
      offensive_stats: FighterRoundStatsV1;
      defensive_stats: FighterRoundStatsV1;
      result_round_time: number;
    }
  >
>;

export function hydrateFighterPerformance<T extends BaseFighterPerformance>(
  fighterPerformance: T,
): HydratedFighterPerformance<T> {
  const offensive_stats = FighterRoundStatsSchemaV1.parse(fighterPerformance.offensive_stats);
  const defensive_stats = FighterRoundStatsSchemaV1.parse(fighterPerformance.defensive_stats);
  const result_round_time = parsePgInterval(fighterPerformance.result_round_time as string);

  return {
    ...fighterPerformance,
    offensive_stats,
    defensive_stats,
    result_round_time,
  };
}

// SUBMISSIONS - Hydrated parses submission metadata and breakdown

type BaseSubmission = {
  submission_metadata: Json;
  live_breakdown: Json | null; // TODO: check - can these breakdowns be null?
  final_breakdown: Json | null;
};

export type HydratedSubmission<T extends BaseSubmission> = Prettify<
  Overwrite<
    T,
    {
      submission_metadata: DailyMmaGameSubmissionMetadata;
      live_breakdown: DailyMmaGameSubmissionBreakdown | null;
      final_breakdown: DailyMmaGameSubmissionBreakdown | null;
    }
  >
>;

export function hydrateSubmission<T extends BaseSubmission>(submission: T): HydratedSubmission<T> {
  return {
    ...submission,
    submission_metadata: DailyMmaGameSubmissionMetadataSchema.parse(submission.submission_metadata),
    live_breakdown: dailyMmaGameSubmissionBreakdownSchema
      .nullable()
      .parse(submission.live_breakdown),
    final_breakdown: dailyMmaGameSubmissionBreakdownSchema
      .nullable()
      .parse(submission.final_breakdown),
  };
}

// SUBMISSION PICKS - Hydrated parses submission pick metadata

type BaseSubmissionPick = {
  pick_metadata: Json;
};

export type HydratedSubmissionPick<T extends BaseSubmissionPick> = Prettify<
  Overwrite<
    T,
    {
      pick_metadata: DailyMmaGameSubmissionPickMetadata;
    }
  >
>;

export function hydrateSubmissionPick<T extends BaseSubmissionPick>(
  submissionPick: T,
): HydratedSubmissionPick<T> {
  return {
    ...submissionPick,
    pick_metadata: DailyMmaGameSubmissionPickMetadataSchema.parse(submissionPick.pick_metadata),
  };
}

// SUBMISSION RANKINGS - Hydrated parses submission score breakdowns

type BaseSubmissionRanking = {
  breakdown: Json;
};

export type HydratedSubmissionRanking<T extends BaseSubmissionRanking> = Prettify<
  Overwrite<
    T,
    {
      breakdown: DailyMmaGameSubmissionBreakdown;
    }
  >
>;

export function hydrateSubmissionRanking<T extends BaseSubmissionRanking>(
  submissionRanking: T,
): HydratedSubmissionRanking<T> {
  return {
    ...submissionRanking,
    breakdown: dailyMmaGameSubmissionBreakdownSchema.parse(submissionRanking.breakdown),
  };
}
