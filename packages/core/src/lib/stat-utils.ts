import type { FighterRoundStatsV1 } from "@challenger-fantasy/schemas";
import type { PastFightRecord, Ratio } from "@challenger-fantasy/types";
import { isNullish } from "./utils.ts";

// TODO: use decimal.js for precision calculations

// GENERAL

export function formatPositiveInt(value: number | null): string {
  if (isNullish(value) || value === 0) return "-";
  return value.toString();
}

export const formatDecimal = (value: number | null, decimals = 2) => {
  if (isNullish(value)) return "N/A";
  if (Number.isNaN(value)) return "N/A";
  return value.toFixed(decimals);
};

function formatDiff(diff: number, kind: "pct" | "dec" | "raw" = "raw", decimals = 2): string {
  if (kind === "pct") {
    return diff > 0 ? `+${formatPercentage(diff)}` : formatPercentage(diff);
  }
  if (kind === "dec") {
    return diff > 0 ? `+${formatDecimal(diff, decimals)}` : formatDecimal(diff, decimals);
  }
  return diff > 0 ? `+${diff}` : diff.toString();
}

function formatPercentage(value: number, decimals = 0): string {
  if (isNullish(value)) return "N/A";
  if (Number.isNaN(value)) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatMinutesSeconds(secs: number): string {
  const mins = Math.floor(secs / 60);
  const secsLeft = secs % 60;
  return `${mins}:${secsLeft.toString().padStart(2, "0")}`;
}

function formatMinutesSecondsWithSign(diff: number): string {
  const sign = diff > 0 ? "+" : diff < 0 ? "-" : "";
  return `${sign}${formatMinutesSeconds(Math.abs(diff))}`;
}

// function formatSeconds(secs: number): string {
//   return `${secs.toFixed(0)}s`;
// }

function formatInches(inches: number | string) {
  return `${inches}"`;
}

function formatFeetInches(heightIn: number) {
  const feet = Math.floor(heightIn / 12);
  const inches = heightIn % 12;
  return `${feet}'${inches}"`;
}

// HELPERS

function getLandedVsAbsorbed(landed: number, absorbed: number, rounds: number) {
  return {
    landed: landed,
    absorbed: absorbed,
    get diff() {
      return this.landed - this.absorbed;
    },
    get landedPerRound() {
      return this.landed / rounds;
    },
    get absorbedPerRound() {
      return this.absorbed / rounds;
    },
    get diffPerRound() {
      return this.landedPerRound - this.absorbedPerRound;
    },
  } as const;
}

function getRatio(landed: number, attempted: number): Ratio {
  return {
    landed,
    attempted,
    get ratio() {
      return landed / attempted;
    },
  } as const;
}

function formatRatio(ratio: Ratio) {
  return `${ratio.landed}/${ratio.attempted} (${formatPercentage(ratio.ratio)})`;
}

// SUMMARY STATS

function getSummaryStatsRaw(off: FighterRoundStatsV1, def: FighterRoundStatsV1, secs: number) {
  const mins = secs / 60;
  const rounds = secs / 300; // 5 minute rounds

  const strikesLandedPerMin = off.general.significantStrikes.landed / mins;
  const strikesAbsorbedPerMin = def.general.significantStrikes.landed / mins;

  const strikesLandedPerRound = off.general.significantStrikes.landed / rounds;
  const strikesAbsorbedPerRound = def.general.significantStrikes.landed / rounds;

  const pctInControl = off.general.controlTimeSeconds / secs;
  const pctUnderControl = def.general.controlTimeSeconds / secs;

  const tdsLandedPerMin = off.general.takedowns.landed / mins;
  const tdsAbsorbedPerMin = def.general.takedowns.landed / mins;

  const tdsLandedPerRound = off.general.takedowns.landed / rounds;
  const tdsAbsorbedPerRound = def.general.takedowns.landed / rounds;

  const offTdsAttemptedRatio = getRatio(
    off.general.takedowns.landed,
    off.general.takedowns.attempted,
  );
  const defTdsAttemptedRatio = getRatio(
    def.general.takedowns.landed,
    def.general.takedowns.attempted,
  );

  const kdsPerRound = off.general.knockdowns / rounds;
  const subAttemptsPerRound = off.general.submissionAttempts / rounds;

  const tdsAttemptedPerMin = off.general.takedowns.attempted / mins;
  const tdsAttemptedPerRound = off.general.takedowns.attempted / rounds;

  return {
    strikesLandedPerMin,
    strikesAbsorbedPerMin,
    strikesLandedPerMinDiff: strikesLandedPerMin - strikesAbsorbedPerMin,
    strikesLandedPerRound,
    strikesAbsorbedPerRound,
    strikesLandedPerRoundDiff: strikesLandedPerRound - strikesAbsorbedPerRound,
    pctInControl,
    pctUnderControl,
    controlDiff: pctInControl - pctUnderControl,
    tdsLandedPerMin,
    tdsAbsorbedPerMin,
    tdsLandedPerMinDiff: tdsLandedPerMin - tdsAbsorbedPerMin,
    tdsLandedPerRound,
    tdsAbsorbedPerRound,
    tdsLandedPerRoundDiff: tdsLandedPerRound - tdsAbsorbedPerRound,
    offTdsAttemptedRatio,
    defTdsAttemptedRatio,
    kdsPerRound,
    subAttemptsPerRound,
    tdsAttemptedPerMin,
    tdsAttemptedPerRound,
  };
}

export function getSummaryStatsFormatted(
  off: FighterRoundStatsV1,
  def: FighterRoundStatsV1,
  secs: number,
) {
  const {
    strikesLandedPerMin,
    strikesAbsorbedPerMin,
    strikesLandedPerMinDiff,
    strikesLandedPerRound,
    strikesAbsorbedPerRound,
    strikesLandedPerRoundDiff,

    pctInControl,
    pctUnderControl,
    controlDiff,

    tdsLandedPerMin,
    tdsAbsorbedPerMin,
    tdsLandedPerMinDiff,
    tdsLandedPerRound,
    tdsAbsorbedPerRound,
    tdsLandedPerRoundDiff,

    offTdsAttemptedRatio,
    defTdsAttemptedRatio,

    kdsPerRound,
    subAttemptsPerRound,
    tdsAttemptedPerMin,
    tdsAttemptedPerRound,
  } = getSummaryStatsRaw(off, def, secs);

  return {
    strikesLandedPerMin: formatDecimal(strikesLandedPerMin, 1),
    strikesAbsorbedPerMin: formatDecimal(strikesAbsorbedPerMin, 1),
    strikesLandedPerMinDiff: formatDiff(strikesLandedPerMinDiff, "dec", 1),
    strikesLandedPerRound: formatDecimal(strikesLandedPerRound, 1),
    strikesAbsorbedPerRound: formatDecimal(strikesAbsorbedPerRound, 1),
    strikesLandedPerRoundDiff: formatDiff(strikesLandedPerRoundDiff, "dec", 1),

    pctInControl: formatPercentage(pctInControl),
    pctUnderControl: formatPercentage(pctUnderControl),
    controlDiff: formatDiff(controlDiff, "pct"),

    tdsLandedPerMin: formatDecimal(tdsLandedPerMin, 1),
    tdsAbsorbedPerMin: formatDecimal(tdsAbsorbedPerMin, 1),
    tdsLandedPerMinDiff: formatDiff(tdsLandedPerMinDiff, "dec", 1),
    tdsLandedPerRound: formatDecimal(tdsLandedPerRound, 1),
    tdsAbsorbedPerRound: formatDecimal(tdsAbsorbedPerRound, 1),
    tdsLandedPerRoundDiff: formatDiff(tdsLandedPerRoundDiff, "dec", 1),

    offTdsAttemptedRatio: formatRatio(offTdsAttemptedRatio),
    defTdsAttemptedRatio: formatRatio(defTdsAttemptedRatio),

    kdsPerRound: formatDecimal(kdsPerRound),
    subAttemptsPerRound: formatDecimal(subAttemptsPerRound),
    tdsAttemptedPerMin: formatDecimal(tdsAttemptedPerMin),
    tdsAttemptedPerRound: formatDecimal(tdsAttemptedPerRound),
  };
}

// FANTASY STATS

function getFantasyStatsRaw(off: FighterRoundStatsV1, def: FighterRoundStatsV1, secs: number) {
  const rounds = secs / 300; // 5 minute rounds

  const standingStrikes = getLandedVsAbsorbed(
    off.strikes.clinch.landed + off.strikes.distance.landed,
    def.strikes.clinch.landed + def.strikes.distance.landed,
    rounds,
  );

  const groundStrikes = getLandedVsAbsorbed(
    off.strikes.ground.landed,
    def.strikes.ground.landed,
    rounds,
  );

  const pctInControl = off.general.controlTimeSeconds / secs;
  const pctUnderControl = def.general.controlTimeSeconds / secs;

  const tdsLandedPerRound = off.general.takedowns.landed / rounds;
  const tdsAbsorbedPerRound = def.general.takedowns.landed / rounds;

  const kdsPerRound = off.general.knockdowns / rounds;
  const subAttemptsPerRound = off.general.submissionAttempts / rounds;

  return {
    standingStrikes,
    groundStrikes,
    pctInControl,
    pctUnderControl,
    controlDiff: pctInControl - pctUnderControl,
    tdsLandedPerRound,
    tdsAbsorbedPerRound,
    tdsLandedPerRoundDiff: tdsLandedPerRound - tdsAbsorbedPerRound,
    kdsPerRound,
    subAttemptsPerRound,
  };
}

export function getFantasyStatsFormatted(
  off: FighterRoundStatsV1,
  def: FighterRoundStatsV1,
  secs: number,
) {
  const stats = getFantasyStatsRaw(off, def, secs);

  return {
    standingStrikes: {
      landed: stats.standingStrikes.landed,
      absorbed: stats.standingStrikes.absorbed,
      diff: stats.standingStrikes.diff,
      landedPerRound: formatDecimal(stats.standingStrikes.landedPerRound),
      absorbedPerRound: formatDecimal(stats.standingStrikes.absorbedPerRound),
      diffPerRound: formatDiff(stats.standingStrikes.diffPerRound, "dec"),
    },
    groundStrikes: {
      landed: stats.groundStrikes.landed,
      absorbed: stats.groundStrikes.absorbed,
      diff: stats.groundStrikes.diff,
      landedPerRound: formatDecimal(stats.groundStrikes.landedPerRound),
      absorbedPerRound: formatDecimal(stats.groundStrikes.absorbedPerRound),
      diffPerRound: formatDiff(stats.groundStrikes.diffPerRound, "dec"),
    },
    pctInControl: formatPercentage(stats.pctInControl),
    pctUnderControl: formatPercentage(stats.pctUnderControl),
    controlDiff: formatDiff(stats.controlDiff, "pct"),
    tdsLandedPerRound: formatDecimal(stats.tdsLandedPerRound),
    tdsAbsorbedPerRound: formatDecimal(stats.tdsAbsorbedPerRound),
    tdsLandedPerRoundDiff: formatDiff(stats.tdsLandedPerRoundDiff, "dec"),
    kdsPerRound: formatDecimal(stats.kdsPerRound),
    subAttemptsPerRound: formatDecimal(stats.subAttemptsPerRound),
  };
}

// FIGHT BREAKDOWN

function getFightKeyMetricsRaw(f1: FighterRoundStatsV1, f2: FighterRoundStatsV1) {
  // Strike differential and percentages
  const f1Sig = f1.general.significantStrikes.landed;
  const f2Sig = f2.general.significantStrikes.landed;
  const totalSig = f1Sig + f2Sig;

  // Control time differential and percentages
  const f1Ctrl = f1.general.controlTimeSeconds;
  const f2Ctrl = f2.general.controlTimeSeconds;
  const totalCtrl = f1Ctrl + f2Ctrl;

  return {
    f1StrikeDiff: f1Sig - f2Sig,
    f2StrikeDiff: f2Sig - f1Sig,
    f1SigPct: totalSig > 0 ? f1Sig / totalSig : 0,
    f2SigPct: totalSig > 0 ? f2Sig / totalSig : 0,
    f1CtrlDiff: f1Ctrl - f2Ctrl,
    f2CtrlDiff: f2Ctrl - f1Ctrl,
    f1CtrlPct: totalCtrl > 0 ? f1Ctrl / totalCtrl : 0,
    f2CtrlPct: totalCtrl > 0 ? f2Ctrl / totalCtrl : 0,
    f1Finishes: f1.general.knockdowns + f1.general.submissionAttempts,
    f2Finishes: f2.general.knockdowns + f2.general.submissionAttempts,
  };
}

export function getFightKeyMetricsFormatted(f1: FighterRoundStatsV1, f2: FighterRoundStatsV1) {
  const {
    f1StrikeDiff,
    f2StrikeDiff,
    f1SigPct,
    f2SigPct,
    f1CtrlDiff,
    f2CtrlDiff,
    f1CtrlPct,
    f2CtrlPct,
    ...rest
  } = getFightKeyMetricsRaw(f1, f2);

  return {
    f1StrikeDiff: formatDiff(f1StrikeDiff, "raw"),
    f2StrikeDiff: formatDiff(f2StrikeDiff, "raw"),
    f1SigPct: formatPercentage(f1SigPct),
    f2SigPct: formatPercentage(f2SigPct),
    f1CtrlDiff: formatMinutesSecondsWithSign(f1CtrlDiff),
    f2CtrlDiff: formatMinutesSecondsWithSign(f2CtrlDiff),
    f1CtrlPct: formatPercentage(f1CtrlPct),
    f2CtrlPct: formatPercentage(f2CtrlPct),
    ...rest,
  };
}

function getFightBreakdownRaw(off: FighterRoundStatsV1, def: FighterRoundStatsV1, secs: number) {
  const strikesLandedPerMin = off.general.significantStrikes.landed / secs;
  const strikesAbsorbedPerMin = def.general.significantStrikes.landed / secs;

  return {
    strikesLandedPerMin,
    strikesAbsorbedPerMin,
  };
}

export function getFightBreakdownFormatted(
  off: FighterRoundStatsV1,
  def: FighterRoundStatsV1,
  secs: number,
) {
  const { strikesLandedPerMin, strikesAbsorbedPerMin } = getFightBreakdownRaw(off, def, secs);

  return {
    strikesLandedPerMin: formatDecimal(strikesLandedPerMin),
    strikesAbsorbedPerMin: formatDecimal(strikesAbsorbedPerMin),
  };
}

// FIGHT RECORD

function getFightRecordString(
  wins: number,
  losses: number,
  draws: number,
  noContests: number,
): string {
  const delimiter = "/";
  if (draws === 0 && noContests === 0) {
    return [wins, losses].join(delimiter);
  }
  return [wins, losses, draws, noContests].join(delimiter);
}

export function formatFightRecord(
  wins?: number | null,
  losses?: number | null,
  draws?: number | null,
  noContests?: number | null,
): PastFightRecord {
  if (isNullish(wins) || isNullish(losses) || isNullish(draws) || isNullish(noContests)) {
    return {
      wins: "-",
      losses: "-",
      draws: "-",
      noContests: "-",
      total: "-",
      winRate: "N/A",
      formatted: "N/A",
    };
  }

  const total = wins + losses + draws + noContests;
  const winRate = total > 0 ? formatPercentage(wins / total, 0) : "N/A";

  return {
    wins: wins.toString(),
    losses: losses.toString(),
    draws: draws.toString(),
    noContests: noContests.toString(),
    total: total.toString(),
    winRate,
    formatted: getFightRecordString(wins, losses, draws, noContests),
  };
}

export function calculateApeIndex(
  heightIn: number | null,
  reachIn: number | null,
): {
  height: string;
  reach: string;
  apeIndex: string;
  allFormatted: string;
} {
  let height = "-",
    reach = "-",
    apeIndex = "-",
    allFormatted = "-";

  if (isNullish(reachIn) || isNullish(heightIn)) {
    return { height, reach, apeIndex, allFormatted };
  }

  height = formatFeetInches(heightIn);
  reach = formatInches(reachIn);

  const diff = reachIn - heightIn;
  apeIndex = formatInches(formatDiff(diff, "raw"));
  allFormatted = `${height} / ${reach} (${apeIndex})`;

  return { height, reach, apeIndex, allFormatted };
}
