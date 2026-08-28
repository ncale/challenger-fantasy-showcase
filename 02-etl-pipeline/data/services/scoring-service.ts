import {
  type HydratedFight,
  hydrateFight,
  hydrateGame,
  makeFightStatsByFighterId,
} from "../models";
import {
  type DailyMmaGameSubmissionBreakdown,
  DailyMmaGameSubmissionPickMetadataSchema,
  type PointsConfig,
} from "../../schemas";
import { calcGamePoints, SCORING_PROFILES } from "../shared";
import type { DBClient, Json, ScoreFactor } from "../../types";
import Decimal from "decimal.js";
import { isNullish } from "../lib/utils.ts";

type ScoreData = {
  baseScore: Decimal;
  status: "valid" | "cancelled" | "nc";
};

type ScoreDataByFighterId = Record<string, ScoreData | undefined>;

function getScoreDataByFighterId(
  pointsConfig: PointsConfig,
  fights: HydratedFight[],
): ScoreDataByFighterId {
  const result: ScoreDataByFighterId = {};

  // Sort cancelled fights first so a rescheduled fighter on another fight overwrites the cancelled entry
  const sorted = [...fights].sort((a, b) => {
    if (a.status === "cancelled" && b.status !== "cancelled") return -1;
    if (a.status !== "cancelled" && b.status === "cancelled") return 1;
    return 0;
  });

  for (const fight of sorted) {
    const f1 = fight.fighter_1_id;
    const f2 = fight.fighter_2_id;
    if (!f1 || !f2) continue;

    switch (fight.status) {
      case "cancelled": {
        result[f1] = { baseScore: new Decimal(0), status: "cancelled" };
        result[f2] = { baseScore: new Decimal(0), status: "cancelled" };
        break;
      }
      case "scheduled": {
        result[f1] = { baseScore: new Decimal(0), status: "valid" };
        result[f2] = { baseScore: new Decimal(0), status: "valid" };
        break;
      }
      case "final":
      case "live": {
        if (isNullish(fight.fighter_1_stats) || isNullish(fight.fighter_2_stats)) {
          // Stats not yet ingested — treat as scheduled (score will update on retry)
          result[f1] = { baseScore: new Decimal(0), status: "valid" };
          result[f2] = { baseScore: new Decimal(0), status: "valid" };
          break;
        }

        const isNoContest = fight.result === "no-contest";

        const statsF1 = makeFightStatsByFighterId(f1, fight);
        result[f1] = {
          baseScore: new Decimal(calcGamePoints(pointsConfig, statsF1).total).toDecimalPlaces(4),
          status: isNoContest ? "nc" : "valid",
        };

        const statsF2 = makeFightStatsByFighterId(f2, fight);
        result[f2] = {
          baseScore: new Decimal(calcGamePoints(pointsConfig, statsF2).total).toDecimalPlaces(4),
          status: isNoContest ? "nc" : "valid",
        };
        break;
      }
    }
  }

  return result;
}

function computeScore(
  picks: Array<{ fighter_id: string; order: number }>,
  scoreDataByFighterId: ScoreDataByFighterId,
): DailyMmaGameSubmissionBreakdown {
  const factors: ScoreFactor[] = [];

  for (const pick of picks) {
    const scoreData = scoreDataByFighterId[pick.fighter_id];
    if (isNullish(scoreData)) {
      throw new Error(`Score data not found for fighter ${pick.fighter_id}`);
    }

    const baseScore = scoreData.baseScore.toNumber();
    const effectiveScore = scoreData.status === "valid" ? baseScore : 0;

    const factor: ScoreFactor = {
      fighterId: pick.fighter_id,
      baseScore,
      potentialScore: baseScore,
      effectiveScore,
    };

    factors.push(factor);
  }

  const overallScore = factors
    .reduce((acc, f) => acc.plus(f.effectiveScore), new Decimal(0))
    .toDecimalPlaces(4)
    .toNumber();

  return {
    schemaKey: "submission-breakdown-v1",
    overallScore,
    tiebreakScore: overallScore,
    factors,
  };
}

export function createScoringService(supabase: DBClient) {
  return {
    async scoreFightersForEvent(eventId: string): Promise<{ rowsUpserted: number }> {
      const { data: fightRows, error: fightsError } = await supabase
        .schema("api")
        .from("event_fights_view")
        .select("*")
        .eq("event_id", eventId);
      if (fightsError) throw new Error(`Could not fetch fights: ${fightsError.message}`);

      const fights = (fightRows ?? []).map(hydrateFight);

      const rows: Array<{
        fight_id: string;
        fighter_id: string;
        scoring_profile: string;
        score: number;
        breakdown: Json;
      }> = [];

      for (const fight of fights) {
        const f1 = fight.fighter_1_id;
        const f2 = fight.fighter_2_id;
        if (!f1 || !f2) continue;
        if (isNullish(fight.fighter_1_stats) || isNullish(fight.fighter_2_stats)) continue;
        if (fight.status !== "final" && fight.status !== "live") continue;

        for (const [profile, pointsConfig] of Object.entries(SCORING_PROFILES)) {
          const breakdownF1 = calcGamePoints(pointsConfig, makeFightStatsByFighterId(f1, fight));
          const breakdownF2 = calcGamePoints(pointsConfig, makeFightStatsByFighterId(f2, fight));

          rows.push({
            fight_id: fight.fight_id,
            fighter_id: f1,
            scoring_profile: profile,
            score: breakdownF1.total,
            breakdown: breakdownF1 as unknown as Json,
          });
          rows.push({
            fight_id: fight.fight_id,
            fighter_id: f2,
            scoring_profile: profile,
            score: breakdownF2.total,
            breakdown: breakdownF2 as unknown as Json,
          });
        }
      }

      if (rows.length > 0) {
        const { error } = await supabase
          .from("fighter_scoring_archive")
          .upsert(rows, { onConflict: "fight_id,fighter_id,scoring_profile" });
        if (error) throw new Error(`Could not upsert fighter scoring archive: ${error.message}`);
      }

      return { rowsUpserted: rows.length };
    },

    async scoreGamesForEvent(
      eventId: string,
      scoringStatus: "pending" | "live" | "final" = "live",
    ): Promise<{ gamesScored: number; submissionsScored: number }> {
      const { data: fightRows, error: fightsError } = await supabase
        .schema("api")
        .from("event_fights_view")
        .select("*")
        .eq("event_id", eventId);
      if (fightsError) throw new Error(`Could not fetch fights: ${fightsError.message}`);

      const fights = (fightRows ?? []).map(hydrateFight);

      const { data: gameRows, error: gamesError } = await supabase
        .from("daily_mma_game")
        .select("id, event_id, config, metadata")
        .eq("event_id", eventId);
      if (gamesError) throw new Error(`Could not fetch games: ${gamesError.message}`);

      if (!gameRows || gameRows.length === 0) {
        return { gamesScored: 0, submissionsScored: 0 };
      }

      let totalSubmissionsScored = 0;

      for (const gameRow of gameRows) {
        const game = hydrateGame(gameRow);
        const pointsConfig = SCORING_PROFILES[game.config.scoringProfile];
        const scoreDataByFighterId = getScoreDataByFighterId(pointsConfig, fights);

        const { data: submissions, error: submissionsError } = await supabase
          .from("daily_mma_game_submission")
          .select("id, draft_group_id")
          .eq("game_id", game.id);
        if (submissionsError)
          throw new Error(`Could not fetch submissions: ${submissionsError.message}`);

        for (const submission of submissions ?? []) {
          if (!submission.draft_group_id) continue;
          const { data: pickRows, error: picksError } = await supabase
            .schema("api")
            .from("daily_mma_game_submission_picks_view")
            .select("fighter_id, pick_metadata")
            .eq("submission_id", submission.id)
            .order("pick_metadata->>order", { ascending: true });
          if (picksError) throw new Error(`Could not fetch picks: ${picksError.message}`);

          const picks = (pickRows ?? [])
            .filter((p) => p.fighter_id !== null && p.pick_metadata !== null)
            .map((p) => {
              const meta = DailyMmaGameSubmissionPickMetadataSchema.parse(p.pick_metadata);
              return { fighter_id: p.fighter_id as string, order: meta.order };
            });

          const breakdown = computeScore(picks, scoreDataByFighterId);

          const { error: upsertError } = await supabase
            .from("daily_mma_game_submission_score")
            .upsert(
              {
                submission_id: submission.id,
                draft_group_id: submission.draft_group_id,
                score: breakdown.overallScore,
                scoring_status: scoringStatus,
                breakdown: breakdown as unknown as Json,
              },
              { onConflict: "submission_id" },
            );
          if (upsertError) throw new Error(`Could not upsert score: ${upsertError.message}`);

          const { error: rankError } = await supabase.schema("ops").rpc("rank_submission_scores");
          if (rankError)
            throw new Error(`Could not add rankings to submissions ${rankError.message}`);

          totalSubmissionsScored++;
        }
      }

      return { gamesScored: gameRows.length, submissionsScored: totalSubmissionsScored };
    },
  };
}
