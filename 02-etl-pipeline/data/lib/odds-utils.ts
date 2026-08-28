import Decimal from "decimal.js";

export function normalizeFighterName(name: string | null | undefined): string {
  return (name ?? "").toLowerCase().replace(/-/g, " ").trim();
}

export function averageDecimalOdds(odds: number[]): Decimal {
  if (odds.length === 0) throw new Error("Cannot average empty odds array");
  const sum = odds.reduce((acc, o) => acc.plus(new Decimal(o)), new Decimal(0));
  return sum.dividedBy(odds.length);
}

/**
 * Removes bookmaker margin to get fair win probabilities for each fighter.
 * impliedProb = 1 / decimalOdds; fairProb = impliedProb / (impliedProb1 + impliedProb2)
 */
export function noVigProbabilities(
  fighter1Odds: Decimal,
  fighter2Odds: Decimal,
): { fighter1: Decimal; fighter2: Decimal } {
  const impl1 = new Decimal(1).dividedBy(fighter1Odds);
  const impl2 = new Decimal(1).dividedBy(fighter2Odds);
  const overround = impl1.plus(impl2);
  return {
    fighter1: impl1.dividedBy(overround),
    fighter2: impl2.dividedBy(overround),
  };
}
