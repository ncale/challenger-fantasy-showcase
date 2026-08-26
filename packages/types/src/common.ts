// UTILITY TYPES

export type Prettify<T> = {
  [key in keyof T]: T[key];
} & {};

export type DisallowId<T> = Prettify<T & { id?: never }>;

type RequiredKeys<T> = {
  // biome-ignore lint/complexity/noBannedTypes: <ts quirk>
  [K in keyof T]: {} extends { [P in K]: T[K] } ? never : K;
}[keyof T];

export type NonOptional<T> = Prettify<Pick<T, RequiredKeys<T>>>;

export type RemoveNulls<T, K extends keyof T> = T & {
  [P in K]: Exclude<T[P], null>;
};

export type Overwrite<T, U> = Omit<T, keyof U> & U;

// OPTIONS

export type LimitOptions = {
  limit?: number;
};
type OffsetOptions = {
  offset?: number;
};
export type PaginationOptions = Prettify<LimitOptions & OffsetOptions>;

export type InfinitePaginationOptions = {
  pageSize?: number;
};
export type PageOptions = {
  page?: number;
  pageSize?: number;
};
export type PagePaginationOptions = PageOptions;

export type SearchOptions = {
  query?: string;
};

export type BustCacheOptions = {
  bustCache?: boolean;
};

// Submission kind options // TODO: combine with @challenger-fantasy/schemas input.ts submissionStatusQueryParamsSchema
export type SubmissionStatusOptions = {
  status: "live" | "upcoming" | "completed";
};

// Event list options
type EventStatusFilter = "upcoming" | "past" | "upcoming-or-live";
export type EventListOptions = {
  status?: EventStatusFilter;
};

// Event card options
export type EventCardOptions = {
  top?: number;
};

// COMMON

export type EntityType = "event" | "fight" | "fighter";

export type SourceNames = "ufcstats";

type DataSourceGeneric<T extends EntityType> = {
  name: SourceNames;
  externalId: string;
  entityType: T;
};
export type DataSource = DataSourceGeneric<EntityType>;
export type DataSourceEvent = DataSourceGeneric<"event">;
export type DataSourceFight = DataSourceGeneric<"fight">;
export type DataSourceFighter = DataSourceGeneric<"fighter">;

export type FightWinner = "f1" | "f2" | "draw" | "no-contest";

export type FightResultFormatted = "W" | "L" | "D" | "NC";

// FIGHT STATS

export type LandedVsAttempted = {
  landed: number;
  attempted: number;
};
export type StrikeStat = LandedVsAttempted;

export type FighterRecord = {
  wins: number;
  losses: number;
  draws: number;
  noContests: number;
};

export type EventLocation = {
  city: string;
  stateOrRegion: string;
  country: string;
};

export type BothFighters<T> = {
  fighter1: T;
  fighter2: T;
};

export type WithRound<T> = Prettify<{ round: number } & T>;

// OTHER

export type FightResultMethod =
  | "KO/TKO"
  | "Could Not Continue"
  | "Submission"
  | "TKO - Doctor's Stoppage"
  | "Overturned"
  | "DQ"
  | "Decision - Split"
  | "Decision - Unanimous"
  | "Decision - Majority";

export type UFCWeightClass =
  | "Women's Strawweight"
  | "Women's Flyweight"
  | "Women's Bantamweight"
  | "Women's Featherweight"
  | "Flyweight"
  | "Bantamweight"
  | "Featherweight"
  | "Lightweight"
  | "Welterweight"
  | "Middleweight"
  | "Light Heavyweight"
  | "Heavyweight";

export type PastFightRecord = {
  wins: string;
  losses: string;
  draws: string;
  noContests: string;
  total: string;
  winRate: string;
  formatted: string;
};

export type EventStatus = "final" | "live" | "scheduled";

// STATS

export type Ratio = {
  landed: number;
  attempted: number;
  ratio: number;
};

// SCORING

export type PointCategories<T, U = T> = {
  win: U;
  sigStrike: T;
  standingStrike: T;
  groundStrike: T;
  headStrike: T;
  bodyStrike: T;
  takedown: T;
  controlTimeSecond: T;
  knockdown: T;
  subAttempt: T;
  finish: U;
  finishRnd1Bonus: U;
  finishRnd2Bonus: U;
};

type StatPointsEntryBase = {
  pointsPer: number;
  pointsEarned: number;
};

export interface StatPointsNumberedEntry extends StatPointsEntryBase {
  count: number;
}
export interface StatPointsOccurrenceEntry extends StatPointsEntryBase {
  occurred: boolean;
}

export type StatPointsBreakdown = Prettify<
  PointCategories<StatPointsNumberedEntry, StatPointsOccurrenceEntry> & {
    total: number;
  }
>;

export type ScoreFactorFighter = {
  fighterId: string;
  // BASE SCORE: Raw score achieved by the fighter
  baseScore: number;
  // POTENTIAL SCORE: Score applied to the user's total assuming the fighter is applied and valid
  potentialScore: number;
  // EFFECTIVE SCORE: Score applied to the user's total
  effectiveScore: number;
};

// TODO: can have one of replacedFighter or isBackup, but not both
export type ScoreFactor = Prettify<
  ScoreFactorFighter & {
    isBackup?: boolean;
    replacedFighter?: ScoreFactorFighter & {
      reason: string;
    };
  }
>;

// DAILY MMA GAME

enum ClassicSlotKindEnum {
  Default = "default",
  Backup = "backup",
}

export type ClassicSlotKind = `${ClassicSlotKindEnum}`;

export type Slot =
  | { fighterId: string; kind: `${ClassicSlotKindEnum.Default}` }
  | { fighterId?: string; kind: `${ClassicSlotKindEnum.Backup}` };

export type Slots = Array<Slot>;

export type Selected =
  | {
      section: "slots";
      idx: number;
    }
  | {
      section: "fighters";
      fighterId: string;
    };
