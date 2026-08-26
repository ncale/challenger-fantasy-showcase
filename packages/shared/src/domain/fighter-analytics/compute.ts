import type { FighterRoundStatsV1 } from "@challenger-fantasy/schemas";
import Decimal from "decimal.js";
import { getWeightLbsFromKey } from "../weight-class";

export type RoundPair = {
  fighterStats: FighterRoundStatsV1;
  opponentStats: FighterRoundStatsV1;
};

export type FightForAnalytics = {
  weightClassKey: string | null;
  totalFightSeconds: number;
  rounds: RoundPair[];
};

export type FighterAnalyticsResult = {
  sigStrikesLandedPer5Mins: number | null;
  sigStrikesAbsorbedPer5Mins: number | null;
  inControlPct: number | null;
  underControlPct: number | null;
  takedownsAttemptedPer5Mins: number | null;
  takedownAccuracy: number | null;
  takedownDefence: number | null;
  computedAtFightCount: number;
  lowestWeightKey: string | null;
  highestWeightKey: string | null;
};

const FIVE_MINS = new Decimal(300);
const HUNDRED = new Decimal(100);
const TWO_DP = 2;

function safeGetWeightLbs(key: string): number | null {
  try {
    return getWeightLbsFromKey(key);
  } catch {
    return null;
  }
}

export function computeFighterAnalytics(fights: FightForAnalytics[]): FighterAnalyticsResult {
  if (!fights.length) {
    return {
      sigStrikesLandedPer5Mins: null,
      sigStrikesAbsorbedPer5Mins: null,
      inControlPct: null,
      underControlPct: null,
      takedownsAttemptedPer5Mins: null,
      takedownAccuracy: null,
      takedownDefence: null,
      computedAtFightCount: 0,
      lowestWeightKey: null,
      highestWeightKey: null,
    };
  }

  let totalSeconds = new Decimal(0);
  let sigLanded = new Decimal(0);
  let sigAbsorbed = new Decimal(0);
  let controlSecs = new Decimal(0);
  let underControlSecs = new Decimal(0);
  let tdAttempted = new Decimal(0);
  let tdLanded = new Decimal(0);
  let oppTdAttempted = new Decimal(0);
  let oppTdLanded = new Decimal(0);

  let lowestWeightLbs: number | null = null;
  let highestWeightLbs: number | null = null;
  let lowestWeightKey: string | null = null;
  let highestWeightKey: string | null = null;

  for (const fight of fights) {
    totalSeconds = totalSeconds.plus(fight.totalFightSeconds);

    for (const { fighterStats: f, opponentStats: o } of fight.rounds) {
      sigLanded = sigLanded.plus(f.general.significantStrikes.landed);
      sigAbsorbed = sigAbsorbed.plus(o.general.significantStrikes.landed);
      controlSecs = controlSecs.plus(f.general.controlTimeSeconds);
      underControlSecs = underControlSecs.plus(o.general.controlTimeSeconds);
      tdAttempted = tdAttempted.plus(f.general.takedowns.attempted);
      tdLanded = tdLanded.plus(f.general.takedowns.landed);
      oppTdAttempted = oppTdAttempted.plus(o.general.takedowns.attempted);
      oppTdLanded = oppTdLanded.plus(o.general.takedowns.landed);
    }

    if (fight.weightClassKey !== null) {
      const lbs = safeGetWeightLbs(fight.weightClassKey);
      if (lbs !== null) {
        if (lowestWeightLbs === null || lbs < lowestWeightLbs) {
          lowestWeightLbs = lbs;
          lowestWeightKey = fight.weightClassKey;
        }
        if (highestWeightLbs === null || lbs > highestWeightLbs) {
          highestWeightLbs = lbs;
          highestWeightKey = fight.weightClassKey;
        }
      }
    }
  }

  const hasTime = totalSeconds.gt(0);
  const per5 = (n: Decimal) =>
    n.times(FIVE_MINS).dividedBy(totalSeconds).toDecimalPlaces(TWO_DP).toNumber();
  const pct = (n: Decimal) =>
    n.dividedBy(totalSeconds).times(HUNDRED).toDecimalPlaces(TWO_DP).toNumber();

  return {
    sigStrikesLandedPer5Mins: hasTime ? per5(sigLanded) : null,
    sigStrikesAbsorbedPer5Mins: hasTime ? per5(sigAbsorbed) : null,
    inControlPct: hasTime ? pct(controlSecs) : null,
    underControlPct: hasTime ? pct(underControlSecs) : null,
    takedownsAttemptedPer5Mins: hasTime ? per5(tdAttempted) : null,
    takedownAccuracy: tdAttempted.gt(0)
      ? tdLanded.dividedBy(tdAttempted).times(HUNDRED).toDecimalPlaces(TWO_DP).toNumber()
      : null,
    takedownDefence: oppTdAttempted.gt(0)
      ? new Decimal(1)
          .minus(oppTdLanded.dividedBy(oppTdAttempted))
          .times(HUNDRED)
          .toDecimalPlaces(TWO_DP)
          .toNumber()
      : null,
    computedAtFightCount: fights.length,
    lowestWeightKey,
    highestWeightKey,
  };
}
