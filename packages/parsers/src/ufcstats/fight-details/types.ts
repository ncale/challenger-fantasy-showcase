import type { BothFighters, Prettify, StrikeStat, WithRound } from "@challenger-fantasy/types";
import type {
  BonusInfo,
  FightResult,
  TimeParsed,
  TitleInfo,
  WeightClassParsed,
} from "../../common.ts";

////////////////////////////////////////////////////////////

type FighterGeneralStats = {
  knockdowns: number;
  significantStrikes: StrikeStat;
  significantStrikePercentage: number;
  totalStrikes: StrikeStat;
  takedowns: StrikeStat;
  takedownPercentage: number | null; // null when no attempts
  submissionAttempts: number;
  reversals: number;
  controlTime: TimeParsed; // e.g., "0:15" with seconds and raw
};

type GeneralStats = BothFighters<FighterGeneralStats>;
type GeneralStatsByRound = WithRound<GeneralStats>;

type StrikesByTarget = {
  head: StrikeStat;
  body: StrikeStat;
  leg: StrikeStat;
};
type StrikesByPosition = {
  distance: StrikeStat;
  clinch: StrikeStat;
  ground: StrikeStat;
};
interface FighterStrikesBreakdown extends StrikesByTarget, StrikesByPosition {
  total: StrikeStat;
  percentage: number;
}

type StrikesBreakdown = BothFighters<FighterStrikesBreakdown>;
type StrikesBreakdownByRound = WithRound<StrikesBreakdown>;

type CompletedFightStats = {
  generalStats: GeneralStats;
  generalStatsByRound: GeneralStatsByRound[];
  strikesBreakdown: StrikesBreakdown;
  strikesBreakdownByRound: StrikesBreakdownByRound[];
};

////////////////////////////////////////////////////////////

type Fighter = {
  externalId: string;
  name: string;
};

type BaseFight = {
  eventExternalId: string;
  eventName: string;
  fighter1: Fighter;
  fighter2: Fighter;
  weightClass: WeightClassParsed;
  title: TitleInfo;
};

type CompletedFightInfo = {
  bonusInfo: BonusInfo;
  result: FightResult;
  timeFormat: string; // e.g., "5 Rnd (5-5-5-5-5)"
  referee: string;
  details: string;
};

type Fight = BaseFight | Prettify<BaseFight & CompletedFightInfo & CompletedFightStats>;

////////////////////////////////////////////////////////////

// FINAL RESULT TYPE

export type { Fight as FightParseResult };

// EXPORTS

export type {
  FighterGeneralStats,
  GeneralStats,
  GeneralStatsByRound,
  FighterStrikesBreakdown,
  StrikesBreakdown,
  StrikesBreakdownByRound,
  CompletedFightInfo,
  CompletedFightStats,
  Fighter as FighterParsed,
};
