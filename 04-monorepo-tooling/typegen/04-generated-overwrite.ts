// Step 4: `MergeDeep`-patches a handful of view/function return types that
// `supabase gen types` can't infer correctly (e.g. custom RPC return shapes),
// without hand-editing the generated file itself — regenerating step 1 never
// clobbers this layer.
import type { MergeDeep } from "type-fest";
import type { Database as DatabaseGenerated, Json } from "./02-generated.excerpt";

export type { Json };

export type Database = MergeDeep<
  DatabaseGenerated,
  {
    api: {
      Views: {
        event_fights_view: {
          Row: {
            event_id: string;
            fight_id: string;
            fight_slug: string;
            fight_order: number;
            fighter_1_id: string;
            fighter_1_name: string;
            fighter_1_slug: string;
            fighter_2_id: string;
            fighter_2_name: string;
            fighter_2_slug: string;
            status: Database["public"]["Enums"]["schedule_status"];
            weight_class: string;
            weight_class_key: string;
          };
        };
        event_fighters_view: {
          Row: {
            event_id: string;
            fighter_id: string;
            fighter_name: string;
            fighter_slug: string;
          };
        };
        daily_mma_game_submissions_view: {
          Row: {
            id: string;
            game_id: string;
            event_id: string;
            event_name: string;
            start_time: string;
            draft_group_id: string;
            user_id: string;
            submission_metadata: Json;
          };
        };
        daily_mma_game_submission_picks_view: {
          Row: {
            game_id: string;
            submission_id: string;
            fighter_id: string;
            pick_metadata: Json;
          };
        };
        fight_pre_fight_stats_view: {
          Row: {
            id: string;
            fighter_1_id: string;
            fighter_1_offensive_stats: Json;
            fighter_1_defensive_stats: Json;
            fighter_1_total_seconds: number;
            fighter_1_total_rounds: number;
            fighter_2_id: string;
            fighter_2_offensive_stats: Json;
            fighter_2_defensive_stats: Json;
            fighter_2_total_seconds: number;
            fighter_2_total_rounds: number;
          };
        };
        fighter_past_5_year_stats_view: {
          Row: {
            fighter_id: string;
            fighter_name: string;
            fighter_slug: string;
            total_fights: number;
            total_seconds: number;
            wins: number;
            losses: number;
            draws: number;
            no_contests: number;
          };
        };
        user_submission_events_view: {
          Row: {
            user_id: string;
            event_id: string;
            event_name: string;
            event_short_name: string | null;
            event_date: string;
            event_slug: string;
            event_status: Database["public"]["Enums"]["schedule_status"];
            submission_count: number;
          };
        };
      };
    };
  }
>;
