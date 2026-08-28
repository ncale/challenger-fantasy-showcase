import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./generated-overwrite";

// ENUMS

export type FightResultEnum = Database["public"]["Enums"]["fight_result_enum"];
export type UserStatusEnum = Database["public"]["Enums"]["user_status"];

// TABLES

export type DBClient = SupabaseClient<Database>;

export type Alias = Database["public"]["Tables"]["alias"]["Row"];
export type AliasInsert = Database["public"]["Tables"]["alias"]["Insert"];

export type Event = Database["public"]["Tables"]["event"]["Row"];
export type EventInsert = Database["public"]["Tables"]["event"]["Insert"];

export type Fight = Database["public"]["Tables"]["fight"]["Row"];
export type FightInsert = Database["public"]["Tables"]["fight"]["Insert"];

export type FightRoundSnapshot = Database["public"]["Tables"]["fight_round_snapshot"]["Row"];
export type FightRoundSnapshotInsert =
  Database["public"]["Tables"]["fight_round_snapshot"]["Insert"];

export type Fighter = Database["public"]["Tables"]["fighter"]["Row"];
export type FighterInsert = Database["public"]["Tables"]["fighter"]["Insert"];

export type FighterColumns = keyof Fighter;

export type FighterStats = Database["public"]["Tables"]["fighter_stats"]["Row"];
export type FighterStatsInsert = Database["public"]["Tables"]["fighter_stats"]["Insert"];

export type IngestJob = Database["public"]["Tables"]["ingest_job"]["Row"];
export type IngestRaw = Database["public"]["Tables"]["ingest_raw"]["Row"];
export type IngestState = Database["public"]["Tables"]["ingest_state"]["Row"];

export type DailyMmaGame = Database["public"]["Tables"]["daily_mma_game"]["Row"];
export type DailyMmaGameSubmission =
  Database["public"]["Tables"]["daily_mma_game_submission"]["Row"];

// OPS VIEWS

export type AliasedEvents = Database["ops"]["Views"]["aliased_events"]["Row"];
export type AliasedFights = Database["ops"]["Views"]["aliased_fights"]["Row"];

// API VIEWS

export type UserProfile = Database["api"]["Views"]["user_profile_view"]["Row"];
export type FighterPast5YearStatsView =
  Database["api"]["Views"]["fighter_past_5_year_stats_view"]["Row"];
export type EventHeaderView = Database["api"]["Views"]["event_header_view"]["Row"];
export type DailyMmaGameSubmissionPicksView =
  Database["api"]["Views"]["daily_mma_game_submission_picks_view"]["Row"];

export type EventFightersView = Database["api"]["Views"]["event_fighters_view"]["Row"];

// API FUNCTIONS

// SEARCH

export type SearchFightersReturn = Database["api"]["Functions"]["search_fighters"]["Returns"];

// PAGES

export type FighterHeaderAndStats =
  Database["api"]["Functions"]["fighter_header_and_stats"]["Returns"][number];
