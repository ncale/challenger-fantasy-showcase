export type FighterAnalyticsModel = {
  fighterId: string;
  computedAtFightCount: number;
  sigStrikesLandedPer5Mins: number | null;
  sigStrikesAbsorbedPer5Mins: number | null;
  inControlPct: number | null;
  underControlPct: number | null;
  takedownsAttemptedPer5Mins: number | null;
  takedownAccuracy: number | null;
  takedownDefence: number | null;
  lowestWeightKey: string | null;
  highestWeightKey: string | null;
};
