import type { FighterRecord } from "../../../types";
import type {
  DateParsed,
  FightStatPair,
  HeightParsed,
  ReachParsed,
  WeightParsed,
} from "../../common.ts";

export interface FighterParseResult {
  name: string;
  nickname?: string;
  record: FighterRecord;
  physicalStats: PhysicalStats;
  careerStats: CareerStats;
  fightHistory: FightHistoryEntry[];
}

export interface PhysicalStats {
  height: HeightParsed | null;
  weight: WeightParsed | null;
  reach: ReachParsed | null;
  stance: string | null;
  dateOfBirth: DateParsed | null;
}

export interface CareerStats {
  strikingStats: StrikingStats;
  grapplingStats: GrapplingStats;
}

export interface StrikingStats {
  significantStrikesLandedPerMinute: number; // SLpM
  strikingAccuracy: number; // Str. Acc. (percentage)
  significantStrikesAbsorbedPerMinute: number; // SApM
  strikingDefense: number; // Str. Def (percentage)
}

export interface GrapplingStats {
  takedownAverage: number; // TD Avg. (per 15 minutes)
  takedownAccuracy: number; // TD Acc. (percentage)
  takedownDefense: number; // TD Def. (percentage)
  submissionAverage: number; // Sub. Avg. (per 15 minutes)
}

export type FightHistoryEntryBase = {
  fightExternalId: string; // fight id from the href
  opponentExternalId: string; // opponent fighter id from the href
  opponentName: string;
  result: FightResultType;
  eventExternalId: string; // event id from the href
  eventName: string;
  eventDate: string | null; // ISO date string
};

export type CompletedFightHistoryEntry = FightHistoryEntryBase & {
  result: Exclude<FightResultType, "upcoming">;
  method: string;
  round: number;
  time: string;
  knockdowns: FightStatPair;
  strikes: FightStatPair;
  takedowns: FightStatPair;
  submissionAttempts: FightStatPair;
  bonuses?: PerformanceBonus[];
};

export type UpcomingFightHistoryEntry = FightHistoryEntryBase & {
  result: "upcoming";
};

export type FightHistoryEntry = CompletedFightHistoryEntry | UpcomingFightHistoryEntry;

export type FightResultType = "win" | "loss" | "draw" | "no-contest" | "upcoming";

export type PerformanceBonus = "fight" | "performance" | "submission" | "knockout";
