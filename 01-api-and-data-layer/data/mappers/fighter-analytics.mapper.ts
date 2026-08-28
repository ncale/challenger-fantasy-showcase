import type { Database, FighterAnalyticsModel } from "../../types";

type FighterAnalytics = Database["public"]["Tables"]["fighter_analytics"]["Row"];

export const mapFighterAnalytics = (row: FighterAnalytics): FighterAnalyticsModel => ({
  fighterId: row.fighter_id,
  computedAtFightCount: row.computed_at_fight_count,
  sigStrikesLandedPer5Mins: row.sig_strikes_landed_per_5_mins,
  sigStrikesAbsorbedPer5Mins: row.sig_strikes_absorbed_per_5_mins,
  inControlPct: row.in_control_pct,
  underControlPct: row.under_control_pct,
  takedownsAttemptedPer5Mins: row.takedowns_attempted_per_5_mins,
  takedownAccuracy: row.takedown_accuracy,
  takedownDefence: row.takedown_defence,
  lowestWeightKey: row.lowest_weight_key,
  highestWeightKey: row.highest_weight_key,
});
