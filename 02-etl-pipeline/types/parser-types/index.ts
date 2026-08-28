import type { FightResultMethod } from "../common.ts";

export type FightStatPair = {
  fighter: number;
  opponent: number;
};

export type LocationParsed = {
  city: string | null;
  stateOrRegion: string | null;
  country: string | null;
  raw: string;
};

export type HeightParsed = {
  cm: number | null;
  inches: number | null;
  raw: string;
};

export type WeightParsed = {
  kg: number | null;
  lbs: number | null;
  raw: string;
};

export type ReachParsed = {
  cm: number | null;
  inches: number | null;
  raw: string;
};

export type TimeParsed = {
  seconds: number;
  raw: string;
};

export type DateParsed = {
  iso: string;
  raw: string;
};

export type WeightClassParsed = {
  weightClass: string;
  raw: string;
};

export type TitleInfo = { isTitle: true; name: string } | { isTitle: false };

export type BonusInfo = {
  fightOfTheNightBonus: boolean;
  performanceBonus: boolean;
  submissionBonus: boolean;
  knockoutBonus: boolean;
};

export type WinnerString = "fighter1" | "fighter2" | "draw" | "no-contest";

export type FightResult = {
  winner: WinnerString;
  method: FightResultMethod;
  round: number;
  time: TimeParsed;
};
