import type { FighterAnalyticsResult } from "./compute";

export type AnalyticsStatKey = keyof Omit<
  FighterAnalyticsResult,
  "lowestWeightKey" | "highestWeightKey"
>;

type AnalyticsFieldMeta = {
  label: string;
  abbr: string;
  format: "per5" | "pct" | "count";
  explanation: string;
};

export const ANALYTICS_FIELD_META: Readonly<Record<AnalyticsStatKey, AnalyticsFieldMeta>> = {
  computedAtFightCount: {
    label: "Fights",
    abbr: "Fights",
    format: "count",
    explanation: "The number of recent fights used to calculate these statistics.",
  },
  sigStrikesLandedPer5Mins: {
    label: "Sig. Strikes Landed / 5m",
    abbr: "SL/5m",
    format: "per5",
    explanation:
      "Significant strikes landed per 5 minutes of fight time, averaged across recent fights. Significant strikes are power shots that exclude jabs and light clinch strikes.",
  },
  sigStrikesAbsorbedPer5Mins: {
    label: "Sig. Strikes Absorbed / 5m",
    abbr: "SA/5m",
    format: "per5",
    explanation:
      "Significant strikes absorbed per 5 minutes of fight time, averaged across recent fights.",
  },
  inControlPct: {
    label: "Control %",
    abbr: "Ctrl",
    format: "pct",
    explanation:
      "Percentage of fight time spent in a dominant control position — top control, back control, or similar. Higher is better.",
  },
  underControlPct: {
    label: "Under Control %",
    abbr: "UCtrl",
    format: "pct",
    explanation: "Percentage of fight time spent under opponent control. Lower is better.",
  },
  takedownsAttemptedPer5Mins: {
    label: "Takedowns Attempted / 5m",
    abbr: "TD/5m",
    format: "per5",
    explanation: "Number of takedown attempts per 5 minutes of fight time.",
  },
  takedownAccuracy: {
    label: "Takedown Accuracy",
    abbr: "TD Acc",
    format: "pct",
    explanation: "Percentage of takedown attempts that result in a successful takedown.",
  },
  takedownDefence: {
    label: "Takedown Defence",
    abbr: "TD Def",
    format: "pct",
    explanation: "Percentage of incoming takedown attempts that are successfully defended.",
  },
};

export const ANALYTICS_DIFFERENTIAL_EXPLANATIONS = {
  sigStrikes:
    "Difference between significant strikes landed and absorbed per 5 minutes. Positive means the fighter lands more than they take.",
  controlTime:
    "Difference between control time percentage and time under opponent control. Positive means the fighter controls more than they're controlled.",
} as const;

export const ANALYTICS_STAT_KEYS = Object.keys(ANALYTICS_FIELD_META) as AnalyticsStatKey[];

export function getAnalyticsLabel(key: AnalyticsStatKey): string {
  return ANALYTICS_FIELD_META[key].label;
}

export function getAnalyticsAbbr(key: AnalyticsStatKey): string {
  return ANALYTICS_FIELD_META[key].abbr;
}

export function getAnalyticsExplanation(key: AnalyticsStatKey): string {
  return ANALYTICS_FIELD_META[key].explanation;
}

export function formatAnalyticsValue(key: AnalyticsStatKey, value: number | null): string | null {
  if (value === null) return null;
  const { format } = ANALYTICS_FIELD_META[key];
  if (format === "pct") return `${value.toFixed(1)}%`;
  if (format === "count") return Math.round(value).toString();
  return value.toFixed(2);
}

export function analyticsToEntries(
  analytics: Record<AnalyticsStatKey, number | null>,
): Array<{ key: AnalyticsStatKey; label: string; abbr: string; value: string | null }> {
  return ANALYTICS_STAT_KEYS.map((key) => ({
    key,
    label: getAnalyticsLabel(key),
    abbr: getAnalyticsAbbr(key),
    value: formatAnalyticsValue(key, analytics[key]),
  }));
}

export function computeAnalyticsDifferential(a: number | null, b: number | null): number | null {
  if (a === null || b === null) return null;
  return a - b;
}

export function formatAnalyticsDifferential(
  key: AnalyticsStatKey,
  value: number | null,
): string | null {
  if (value === null) return null;
  const formatted = formatAnalyticsValue(key, value);
  if (formatted === null) return null;
  return value >= 0 ? `+${formatted}` : formatted;
}

// ── Fighter context stats ─────────────────────────────────────────────────
// These are NOT derived from fight-history analytics. They represent live or
// draft-session context (odds, ADP) and are keyed/displayed separately.

export type FighterContextStatKey = "winProbability" | "adp";

type FighterContextFieldMeta = {
  label: string;
  abbr: string;
};

export const FIGHTER_CONTEXT_FIELD_META: Readonly<
  Record<FighterContextStatKey, FighterContextFieldMeta>
> = {
  winProbability: { label: "Win Probability", abbr: "Win %" },
  adp: { label: "Avg. Draft Position", abbr: "ADP" },
};

export const FIGHTER_CONTEXT_STAT_KEYS = Object.keys(
  FIGHTER_CONTEXT_FIELD_META,
) as FighterContextStatKey[];
