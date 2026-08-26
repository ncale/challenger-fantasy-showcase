import type { FightStatsByFighterId } from "@challenger-fantasy/models";
import { isSubmission, isTko, type PointsConfig } from "@challenger-fantasy/schemas";
import type {
  PointCategories,
  StatPointsBreakdown,
  StatPointsNumberedEntry,
  StatPointsOccurrenceEntry,
} from "@challenger-fantasy/types";

type ScoringCategoryKey = keyof PointCategories<unknown>;

const SCORING_CATEGORY_LABELS: PointCategories<string> = {
  win: "Win",
  finish: "Finish",
  finishRnd1Bonus: "Round 1 Finish",
  finishRnd2Bonus: "Round 2 Finish",
  sigStrike: "Sig. Strikes",
  standingStrike: "Standing Strikes",
  groundStrike: "Ground Strikes",
  headStrike: "Head Strikes",
  bodyStrike: "Body Strikes",
  takedown: "Takedowns",
  controlTimeSecond: "Control Time (sec)",
  knockdown: "Knockdowns",
  subAttempt: "Sub Attempts",
};

// Canonical display order: outcome → bonuses → striking → grappling
const SCORING_CATEGORY_DISPLAY_ORDER: ReadonlyArray<ScoringCategoryKey> = [
  "win",
  "finish",
  "finishRnd1Bonus",
  "finishRnd2Bonus",
  "sigStrike",
  "knockdown",
  "subAttempt",
  "takedown",
  "controlTimeSecond",
  "standingStrike",
  "groundStrike",
  "headStrike",
  "bodyStrike",
] as const;

export function getScoringCategoryLabel(key: ScoringCategoryKey): string {
  return SCORING_CATEGORY_LABELS[key];
}

/** Returns only the categories present in a scoring profile, in display order. */
export function getActiveScoringCategories(
  config: PointsConfig,
): Array<{ key: ScoringCategoryKey; label: string }> {
  return SCORING_CATEGORY_DISPLAY_ORDER.filter((key) => (config[key] ?? 0) > 0).map((key) => ({
    key,
    label: SCORING_CATEGORY_LABELS[key],
  }));
}

// SCORING

function makeNumberedEntry(count: number, pointsPer: number): StatPointsNumberedEntry {
  return { count, pointsPer, pointsEarned: count * pointsPer };
}

function makeOccurrenceEntry(occurred: boolean, pointsPer: number): StatPointsOccurrenceEntry {
  return { occurred, pointsPer, pointsEarned: occurred ? pointsPer : 0 };
}

export function calcGamePoints(
  points: PointsConfig,
  stats: FightStatsByFighterId,
): StatPointsBreakdown {
  const distanceLanded = stats.off?.strikes.distance.landed ?? 0;
  const clinchLanded = stats.off?.strikes.clinch.landed ?? 0;
  const groundLanded = stats.off?.strikes.ground.landed ?? 0;

  const headLanded = stats.off?.strikes.head.landed ?? 0;
  const bodyLanded = (stats.off?.strikes.body.landed ?? 0) + (stats.off?.strikes.leg.landed ?? 0);

  const takedownsLanded = stats.off?.general.takedowns.landed ?? 0;
  const controlTimeSeconds = stats.off?.general.controlTimeSeconds ?? 0;

  const knockdowns = stats.off?.general.knockdowns ?? 0;
  const submissionAttempts = stats.off?.general.submissionAttempts ?? 0;

  const isFinish =
    stats.method !== null && stats.method !== undefined && stats.winner === true
      ? isTko(stats.method) || isSubmission(stats.method)
      : false;

  const breakdown: Omit<StatPointsBreakdown, "total"> = {
    win: makeOccurrenceEntry(stats.winner ?? false, points.win ?? 0),
    sigStrike: makeNumberedEntry(
      distanceLanded + clinchLanded + groundLanded,
      points.sigStrike ?? 0,
    ),
    standingStrike: makeNumberedEntry(distanceLanded + clinchLanded, points.standingStrike ?? 0),
    groundStrike: makeNumberedEntry(groundLanded, points.groundStrike ?? 0),
    headStrike: makeNumberedEntry(headLanded, points.headStrike ?? 0),
    bodyStrike: makeNumberedEntry(bodyLanded, points.bodyStrike ?? 0),
    takedown: makeNumberedEntry(takedownsLanded, points.takedown ?? 0),
    controlTimeSecond: makeNumberedEntry(controlTimeSeconds, points.controlTimeSecond ?? 0),
    knockdown: makeNumberedEntry(knockdowns, points.knockdown ?? 0),
    subAttempt: makeNumberedEntry(submissionAttempts, points.subAttempt ?? 0),
    finish: makeOccurrenceEntry(isFinish, points.finish ?? 0),
    finishRnd1Bonus: makeOccurrenceEntry(
      isFinish && stats.resultRound === 1,
      points.finishRnd1Bonus ?? 0,
    ),
    finishRnd2Bonus: makeOccurrenceEntry(
      isFinish && stats.resultRound === 2,
      points.finishRnd2Bonus ?? 0,
    ),
  };

  const total = Object.values(breakdown).reduce((sum, entry) => sum + entry.pointsEarned, 0);

  return { ...breakdown, total };
}
