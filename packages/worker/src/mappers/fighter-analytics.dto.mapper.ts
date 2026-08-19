import type { FighterAnalyticsDto } from "@challenger-fantasy/schemas";
import type { FighterAnalyticsModel } from "@challenger-fantasy/types";

export const mapFighterAnalyticsToDto = (model: FighterAnalyticsModel): FighterAnalyticsDto => ({
  fighterId: model.fighterId,
  computedAtFightCount: model.computedAtFightCount,
  sigStrikesLandedPer5Mins: model.sigStrikesLandedPer5Mins,
  sigStrikesAbsorbedPer5Mins: model.sigStrikesAbsorbedPer5Mins,
  inControlPct: model.inControlPct,
  underControlPct: model.underControlPct,
  takedownsAttemptedPer5Mins: model.takedownsAttemptedPer5Mins,
  takedownAccuracy: model.takedownAccuracy,
  takedownDefence: model.takedownDefence,
  lowestWeightKey: model.lowestWeightKey,
  highestWeightKey: model.highestWeightKey,
});
