export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  api: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      daily_mma_game_submission_picks_view: {
        Row: {
          fighter_id: string | null
          game_id: string | null
          pick_metadata: Json | null
          submission_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_mma_game_submission_pick_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "event_fighters_view"
            referencedColumns: ["fighter_id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_pick_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_1_id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_pick_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_2_id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_pick_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "daily_mma_game_submissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_pick_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "draft_group_submission_view"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_mma_game_submission_rankings_view: {
        Row: {
          avatar_url: string | null
          breakdown: Json | null
          created_at: string | null
          game_id: string | null
          overall_score: number | null
          payout: number | null
          place: number | null
          submission_id: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_mma_game_submission_ranking_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "daily_mma_game_submissions_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_ranking_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "draft_group_submission_view"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_mma_game_submissions_view: {
        Row: {
          breakdown: Json | null
          city: string | null
          country: string | null
          draft_group_id: string | null
          event_date: string | null
          event_id: string | null
          event_name: string | null
          event_short_name: string | null
          event_slug: string | null
          event_status: Database["public"]["Enums"]["schedule_status"] | null
          game_config: Json | null
          game_id: string | null
          game_metadata: Json | null
          id: string | null
          main_card_start_time: string | null
          payout: number | null
          position: number | null
          prelims_start_time: string | null
          score: number | null
          scoring_status: string | null
          start_time: string | null
          state_or_region: string | null
          submission_metadata: Json | null
          user_id: string | null
          venue: string | null
        }
        Relationships: []
      }
      draft_group_submission_view: {
        Row: {
          avatar_url: string | null
          breakdown: Json | null
          created_at: string | null
          draft_group_id: string | null
          game_id: string | null
          id: string | null
          metadata: Json | null
          payout: number | null
          position: number | null
          score: number | null
          scoring_position: number | null
          scoring_status: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      event_fighters_view: {
        Row: {
          event_id: string | null
          fighter_id: string | null
          fighter_name: string | null
          fighter_slug: string | null
        }
        Relationships: []
      }
      event_fights_view: {
        Row: {
          event_id: string | null
          fight_id: string | null
          fight_order: number | null
          fight_slug: string | null
          fighter_1_id: string | null
          fighter_1_name: string | null
          fighter_1_slug: string | null
          fighter_1_stats: Json | null
          fighter_2_id: string | null
          fighter_2_name: string | null
          fighter_2_slug: string | null
          fighter_2_stats: Json | null
          method: string | null
          result: Database["public"]["Enums"]["fight_result_enum"] | null
          result_round: number | null
          result_round_time: string | null
          status: Database["public"]["Enums"]["schedule_status"] | null
          weight_class: string | null
          weight_class_key: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fight_fighter_1_id_fkey"
            columns: ["fighter_1_id"]
            isOneToOne: false
            referencedRelation: "event_fighters_view"
            referencedColumns: ["fighter_id"]
          },
          {
            foreignKeyName: "fight_fighter_1_id_fkey"
            columns: ["fighter_1_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_1_id"]
          },
          {
            foreignKeyName: "fight_fighter_1_id_fkey"
            columns: ["fighter_1_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_2_id"]
          },
          {
            foreignKeyName: "fight_fighter_2_id_fkey"
            columns: ["fighter_2_id"]
            isOneToOne: false
            referencedRelation: "event_fighters_view"
            referencedColumns: ["fighter_id"]
          },
          {
            foreignKeyName: "fight_fighter_2_id_fkey"
            columns: ["fighter_2_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_1_id"]
          },
          {
            foreignKeyName: "fight_fighter_2_id_fkey"
            columns: ["fighter_2_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_2_id"]
          },
        ]
      }
      event_header_view: {
        Row: {
          city: string | null
          country: string | null
          event_date: string | null
          fight_count: number | null
          id: string | null
          name: string | null
          slug: string | null
          state_or_region: string | null
          status: Database["public"]["Enums"]["schedule_status"] | null
          updated_at: string | null
          venue: string | null
        }
        Relationships: []
      }
      fight_pre_fight_stats_view: {
        Row: {
          fighter_1_defensive_stats: Json | null
          fighter_1_id: string | null
          fighter_1_name: string | null
          fighter_1_offensive_stats: Json | null
          fighter_1_total_rounds: number | null
          fighter_1_total_seconds: number | null
          fighter_2_defensive_stats: Json | null
          fighter_2_id: string | null
          fighter_2_name: string | null
          fighter_2_offensive_stats: Json | null
          fighter_2_total_rounds: number | null
          fighter_2_total_seconds: number | null
          id: string | null
          slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fight_fighter_1_id_fkey"
            columns: ["fighter_1_id"]
            isOneToOne: false
            referencedRelation: "event_fighters_view"
            referencedColumns: ["fighter_id"]
          },
          {
            foreignKeyName: "fight_fighter_1_id_fkey"
            columns: ["fighter_1_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_1_id"]
          },
          {
            foreignKeyName: "fight_fighter_1_id_fkey"
            columns: ["fighter_1_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_2_id"]
          },
          {
            foreignKeyName: "fight_fighter_2_id_fkey"
            columns: ["fighter_2_id"]
            isOneToOne: false
            referencedRelation: "event_fighters_view"
            referencedColumns: ["fighter_id"]
          },
          {
            foreignKeyName: "fight_fighter_2_id_fkey"
            columns: ["fighter_2_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_1_id"]
          },
          {
            foreignKeyName: "fight_fighter_2_id_fkey"
            columns: ["fighter_2_id"]
            isOneToOne: false
            referencedRelation: "stats_both_fighters_view"
            referencedColumns: ["fighter_2_id"]
          },
        ]
      }
      fighter_past_5_year_stats_view: {
        Row: {
          defensive_stats: Json | null
          draws: number | null
          fighter_id: string | null
          fighter_name: string | null
          fighter_slug: string | null
          losses: number | null
          no_contests: number | null
          offensive_stats: Json | null
          total_fights: number | null
          total_seconds: number | null
          wins: number | null
        }
        Relationships: []
      }
      stats_both_fighters_view: {
        Row: {
          event_date: string | null
          event_id: string | null
          event_name: string | null
          event_slug: string | null
          fight_id: string | null
          fighter_1_id: string | null
          fighter_1_name: string | null
          fighter_1_slug: string | null
          fighter_1_stats: Json | null
          fighter_2_id: string | null
          fighter_2_name: string | null
          fighter_2_slug: string | null
          fighter_2_stats: Json | null
          is_title: boolean | null
          referee: string | null
          result: Database["public"]["Enums"]["fight_result_enum"] | null
          result_method: string | null
          result_round: number | null
          result_round_time: string | null
          rounds_scheduled: number | null
          total_seconds: number | null
          weight_class: string | null
          winner_fighter_id: string | null
        }
        Relationships: []
      }
      stats_single_fighter_view: {
        Row: {
          defensive_stats: Json | null
          event_date: string | null
          event_id: string | null
          event_name: string | null
          event_slug: string | null
          fight_id: string | null
          fighter_id: string | null
          fighter_name: string | null
          fighter_slug: string | null
          is_title: boolean | null
          offensive_stats: Json | null
          opponent_id: string | null
          opponent_name: string | null
          opponent_slug: string | null
          referee: string | null
          result:
            | Database["public"]["Enums"]["single_fighter_fight_result_enum"]
            | null
          result_method: string | null
          result_round: number | null
          result_round_time: string | null
          rounds_scheduled: number | null
          total_seconds: number | null
          weight_class: string | null
          winner_fighter_id: string | null
        }
        Relationships: []
      }
      user_account_view: {
        Row: {
          avatar_url: string | null
          effective_waitlist_position: number | null
          referral_bonus: number | null
          referral_code: string | null
          referred_by: string | null
          status: Database["public"]["Enums"]["user_status"] | null
          user_id: string | null
          user_number: number | null
          username: string | null
        }
        Relationships: []
      }
      user_profile_view: {
        Row: {
          avatar_url: string | null
          since: string | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      user_submission_events_view: {
        Row: {
          event_date: string | null
          event_id: string | null
          event_name: string | null
          event_short_name: string | null
          event_slug: string | null
          event_status: Database["public"]["Enums"]["schedule_status"] | null
          submission_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      aggregate_fighter_stats_jsonb: {
        Args: { stats_array: Json[] }
        Returns: Json
      }
      fight_header: {
        Args: { p_fight_id: string }
        Returns: {
          event_city: string
          event_country: string
          event_date: string
          event_name: string
          event_slug: string
          event_state_or_region: string
          event_venue: string
          fight_order: number
          fight_status: string
          fighter_1_age: string
          fighter_1_country: string
          fighter_1_height_in: number
          fighter_1_id: string
          fighter_1_name: string
          fighter_1_reach_in: number
          fighter_1_slug: string
          fighter_1_stance: string
          fighter_2_age: string
          fighter_2_country: string
          fighter_2_height_in: number
          fighter_2_id: string
          fighter_2_name: string
          fighter_2_reach_in: number
          fighter_2_slug: string
          fighter_2_stance: string
          id: string
          is_title: boolean
          result: Database["public"]["Enums"]["fight_result_enum"]
          result_method: string
          result_round: number
          result_round_time: string
          round_snapshots: Json
          rounds_scheduled: number
          title_name: string
          weight_class: string
          weight_lbs: number
          winner_fighter_id: string
        }[]
      }
      fighter_header_and_stats: {
        Args: { p_slug: string }
        Returns: {
          country: string
          dob: string
          draws: number
          fighter_id: string
          flags: Json
          full_name: string
          height_in: number
          id: string
          losses: number
          nickname: string
          no_contests: number
          reach_in: number
          search_priority: number
          sig_strikes_absorbed_per_minute: number
          sig_strikes_landed_per_minute: number
          slug: string
          stance: string
          striking_accuracy: number
          striking_defense: number
          submission_average: number
          takedown_accuracy: number
          takedown_average: number
          takedown_defense: number
          updated_at: string
          weight_lbs: number
          wins: number
        }[]
      }
      games_with_submission_counts: {
        Args: { uid: string }
        Returns: {
          config: Json
          event_id: string
          game_id: string
          metadata: Json
          total_submissions: number
          user_submissions: number
        }[]
      }
      make_submission: {
        Args: {
          p_game_id: string
          p_name: string
          p_picks: Json
          p_submission_id?: string
        }
        Returns: string
      }
      search_fighters: {
        Args: { lim?: number; q: string }
        Returns: {
          fighter_id: string
          full_name: string
          nickname: string
          rank: number
          search_priority: number
        }[]
      }
      submission_games: {
        Args: { uid: string }
        Returns: {
          config: Json
          event_id: string
          game_id: string
          metadata: Json
          total_submissions: number
          user_submissions: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  ops: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      aliased_events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          event_date: string | null
          event_external_id: string | null
          id: string | null
          name: string | null
          org_id: string | null
          short_name: string | null
          slug: string | null
          state_or_region: string | null
          status: Database["public"]["Enums"]["schedule_status"] | null
          updated_at: string | null
          venue: string | null
        }
        Relationships: []
      }
      aliased_fights: {
        Row: {
          created_at: string | null
          details: string | null
          event_id: string | null
          fight_external_id: string | null
          fight_order: number | null
          fighter_1_id: string | null
          fighter_2_id: string | null
          id: string | null
          is_title: boolean | null
          referee: string | null
          result: Database["public"]["Enums"]["fight_result_enum"] | null
          result_method: string | null
          result_round: number | null
          result_round_time: string | null
          rounds_scheduled: number | null
          slug: string | null
          status: Database["public"]["Enums"]["schedule_status"] | null
          time_format: string | null
          title_name: string | null
          updated_at: string | null
          weight_class: string | null
          weight_lbs: number | null
          winner_fighter_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fight_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "aliased_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fight_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "scheduled_events"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_events: {
        Row: {
          external_id: string | null
          id: string | null
          name: string | null
          slug: string | null
          status: Database["public"]["Enums"]["schedule_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_stats_to_fight_result: {
        Args: { p_fight_id: string }
        Returns: undefined
      }
      cleanup_old_records: { Args: { p_days_to_keep?: number }; Returns: Json }
      finalize_submission_rankings: {
        Args: { p_game_id: string }
        Returns: undefined
      }
      generate_referral_code: { Args: never; Returns: string }
      ingest_enqueue: {
        Args: {
          p_kind: string
          p_payload?: Json
          p_priority?: number
          p_run_after?: string
        }
        Returns: Database["public"]["Tables"]["ingest_job"]["Row"]
        SetofOptions: {
          from: "*"
          to: "ingest_job"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ingest_enqueue_many: {
        Args: { p_jobs: Json }
        Returns: Database["public"]["Tables"]["ingest_job"]["Row"][]
        SetofOptions: {
          from: "*"
          to: "ingest_job"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      ingest_heartbeat: {
        Args: { p_ids: number[] }
        Returns: Database["public"]["Tables"]["ingest_job"]["Row"][]
        SetofOptions: {
          from: "*"
          to: "ingest_job"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      ingest_lease_jobs: {
        Args: { p_kinds?: string[]; p_lease_seconds?: number; p_limit?: number }
        Returns: Database["public"]["Tables"]["ingest_job"]["Row"][]
        SetofOptions: {
          from: "*"
          to: "ingest_job"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      ingest_mark_fail: {
        Args: { p_error: string; p_id: number; p_lease_token: string }
        Returns: Database["public"]["Tables"]["ingest_job"]["Row"]
        SetofOptions: {
          from: "*"
          to: "ingest_job"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ingest_mark_ok: {
        Args: { p_counts?: Json; p_id: number; p_lease_token: string }
        Returns: Database["public"]["Tables"]["ingest_job"]["Row"]
        SetofOptions: {
          from: "*"
          to: "ingest_job"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      merge_events: { Args: never; Returns: undefined }
      rank_submission_scores: { Args: never; Returns: undefined }
      save_draft_submissions: {
        Args: {
          p_draft_group_id: string
          p_game_id: string
          p_submissions: Json[]
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      alias: {
        Row: {
          entity_type: string
          external_id: string
          internal_id: string
          source: string
        }
        Insert: {
          entity_type: string
          external_id: string
          internal_id: string
          source: string
        }
        Update: {
          entity_type?: string
          external_id?: string
          internal_id?: string
          source?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          draft_initializing_time_seconds: number
          id: number
          ios_latest_app_version: string
          ios_min_app_version: string
          maintenance_mode: boolean
          max_concurrent_drafts: number
          min_app_version: string
          review_prompt_cooldown_days: number
          review_prompt_min_sessions: number
          track_page_live_preview_count: number
          track_page_results_preview_count: number
          track_page_upcoming_preview_count: number
          updated_at: string
        }
        Insert: {
          draft_initializing_time_seconds?: number
          id?: number
          ios_latest_app_version?: string
          ios_min_app_version?: string
          maintenance_mode?: boolean
          max_concurrent_drafts?: number
          min_app_version?: string
          review_prompt_cooldown_days?: number
          review_prompt_min_sessions?: number
          track_page_live_preview_count?: number
          track_page_results_preview_count?: number
          track_page_upcoming_preview_count?: number
          updated_at?: string
        }
        Update: {
          draft_initializing_time_seconds?: number
          id?: number
          ios_latest_app_version?: string
          ios_min_app_version?: string
          maintenance_mode?: boolean
          max_concurrent_drafts?: number
          min_app_version?: string
          review_prompt_cooldown_days?: number
          review_prompt_min_sessions?: number
          track_page_live_preview_count?: number
          track_page_results_preview_count?: number
          track_page_upcoming_preview_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      daily_mma_game: {
        Row: {
          config: Json
          created_at: string | null
          event_id: string
          id: string
          metadata: Json
        }
        Insert: {
          config?: Json
          created_at?: string | null
          event_id: string
          id?: string
          metadata?: Json
        }
        Update: {
          config?: Json
          created_at?: string | null
          event_id?: string
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "daily_mma_game_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_mma_game_draft_group: {
        Row: {
          completed_at: string | null
          created_at: string | null
          game_id: string
          id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          game_id: string
          id?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          game_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_mma_game_draft_group_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "daily_mma_game"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_mma_game_submission: {
        Row: {
          created_at: string | null
          draft_group_id: string | null
          game_id: string
          id: string
          metadata: Json
          position: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          draft_group_id?: string | null
          game_id: string
          id?: string
          metadata?: Json
          position?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          draft_group_id?: string | null
          game_id?: string
          id?: string
          metadata?: Json
          position?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_mma_game_submission_draft_group_id_fkey"
            columns: ["draft_group_id"]
            isOneToOne: false
            referencedRelation: "daily_mma_game_draft_group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "daily_mma_game"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_mma_game_submission_live_score: {
        Row: {
          breakdown: Json
          overall_score: number
          submission_id: string
          updated_at: string | null
        }
        Insert: {
          breakdown?: Json
          overall_score?: number
          submission_id: string
          updated_at?: string | null
        }
        Update: {
          breakdown?: Json
          overall_score?: number
          submission_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_mma_game_submission_score_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "daily_mma_game_submission"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_mma_game_submission_pick: {
        Row: {
          fighter_id: string
          metadata: Json | null
          submission_id: string
        }
        Insert: {
          fighter_id: string
          metadata?: Json | null
          submission_id: string
        }
        Update: {
          fighter_id?: string
          metadata?: Json | null
          submission_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_mma_game_submission_pick_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_pick_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter_search_mv"
            referencedColumns: ["fighter_id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_pick_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "daily_mma_game_submission"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_mma_game_submission_ranking: {
        Row: {
          breakdown: Json | null
          created_at: string
          game_id: string
          overall_score: number
          payout: number
          place: number
          submission_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          breakdown?: Json | null
          created_at?: string
          game_id: string
          overall_score: number
          payout: number
          place: number
          submission_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          breakdown?: Json | null
          created_at?: string
          game_id?: string
          overall_score?: number
          payout?: number
          place?: number
          submission_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_mma_game_submission_ranking_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "daily_mma_game"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_ranking_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "daily_mma_game_submission"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_ranking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_mma_game_submission_score: {
        Row: {
          breakdown: Json | null
          draft_group_id: string
          payout: number | null
          position: number
          score: number
          scoring_status: string
          submission_id: string
          updated_at: string
        }
        Insert: {
          breakdown?: Json | null
          draft_group_id: string
          payout?: number | null
          position?: number
          score?: number
          scoring_status?: string
          submission_id: string
          updated_at?: string
        }
        Update: {
          breakdown?: Json | null
          draft_group_id?: string
          payout?: number | null
          position?: number
          score?: number
          scoring_status?: string
          submission_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_mma_game_submission_score_draft_group_id_fkey"
            columns: ["draft_group_id"]
            isOneToOne: false
            referencedRelation: "daily_mma_game_draft_group"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_mma_game_submission_score_submission_id_fkey1"
            columns: ["submission_id"]
            isOneToOne: true
            referencedRelation: "daily_mma_game_submission"
            referencedColumns: ["id"]
          },
        ]
      }
      event: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          event_date: string
          id: string
          main_card_start_time: string | null
          name: string
          org_id: string
          prelims_start_time: string | null
          short_name: string | null
          slug: string
          start_time: string | null
          state_or_region: string | null
          status: Database["public"]["Enums"]["schedule_status"]
          ufcstats_external_id: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          event_date: string
          id?: string
          main_card_start_time?: string | null
          name: string
          org_id: string
          prelims_start_time?: string | null
          short_name?: string | null
          slug: string
          start_time?: string | null
          state_or_region?: string | null
          status: Database["public"]["Enums"]["schedule_status"]
          ufcstats_external_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          event_date?: string
          id?: string
          main_card_start_time?: string | null
          name?: string
          org_id?: string
          prelims_start_time?: string | null
          short_name?: string | null
          slug?: string
          start_time?: string | null
          state_or_region?: string | null
          status?: Database["public"]["Enums"]["schedule_status"]
          ufcstats_external_id?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "org"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flag: {
        Row: {
          enabled: boolean
          key: string
          rules: Json
        }
        Insert: {
          enabled: boolean
          key: string
          rules?: Json
        }
        Update: {
          enabled?: boolean
          key?: string
          rules?: Json
        }
        Relationships: []
      }
      fight: {
        Row: {
          created_at: string | null
          details: string | null
          event_id: string
          fight_order: number | null
          fighter_1_id: string
          fighter_2_id: string
          id: string
          is_title: boolean | null
          referee: string | null
          result: Database["public"]["Enums"]["fight_result_enum"] | null
          result_method: string | null
          result_round: number | null
          result_round_time: string | null
          rounds_scheduled: number | null
          slug: string
          status: Database["public"]["Enums"]["schedule_status"]
          time_format: string | null
          title_name: string | null
          ufcstats_external_id: string | null
          updated_at: string | null
          weight_class: string | null
          weight_class_key: string
          weight_lbs: number | null
          winner_fighter_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          event_id: string
          fight_order?: number | null
          fighter_1_id: string
          fighter_2_id: string
          id?: string
          is_title?: boolean | null
          referee?: string | null
          result?: Database["public"]["Enums"]["fight_result_enum"] | null
          result_method?: string | null
          result_round?: number | null
          result_round_time?: string | null
          rounds_scheduled?: number | null
          slug: string
          status: Database["public"]["Enums"]["schedule_status"]
          time_format?: string | null
          title_name?: string | null
          ufcstats_external_id?: string | null
          updated_at?: string | null
          weight_class?: string | null
          weight_class_key: string
          weight_lbs?: number | null
          winner_fighter_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          event_id?: string
          fight_order?: number | null
          fighter_1_id?: string
          fighter_2_id?: string
          id?: string
          is_title?: boolean | null
          referee?: string | null
          result?: Database["public"]["Enums"]["fight_result_enum"] | null
          result_method?: string | null
          result_round?: number | null
          result_round_time?: string | null
          rounds_scheduled?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["schedule_status"]
          time_format?: string | null
          title_name?: string | null
          ufcstats_external_id?: string | null
          updated_at?: string | null
          weight_class?: string | null
          weight_class_key?: string
          weight_lbs?: number | null
          winner_fighter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fight_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fight_fighter_1_id_fkey"
            columns: ["fighter_1_id"]
            isOneToOne: false
            referencedRelation: "fighter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fight_fighter_1_id_fkey"
            columns: ["fighter_1_id"]
            isOneToOne: false
            referencedRelation: "fighter_search_mv"
            referencedColumns: ["fighter_id"]
          },
          {
            foreignKeyName: "fight_fighter_2_id_fkey"
            columns: ["fighter_2_id"]
            isOneToOne: false
            referencedRelation: "fighter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fight_fighter_2_id_fkey"
            columns: ["fighter_2_id"]
            isOneToOne: false
            referencedRelation: "fighter_search_mv"
            referencedColumns: ["fighter_id"]
          },
        ]
      }
      fight_result: {
        Row: {
          created_at: string | null
          details: string | null
          fight_id: string
          fighter_1_stats: Json | null
          fighter_2_stats: Json | null
          method: string | null
          referee: string | null
          result: Database["public"]["Enums"]["fight_result_enum"] | null
          round: number | null
          round_time: string | null
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          fight_id: string
          fighter_1_stats?: Json | null
          fighter_2_stats?: Json | null
          method?: string | null
          referee?: string | null
          result?: Database["public"]["Enums"]["fight_result_enum"] | null
          round?: number | null
          round_time?: string | null
        }
        Update: {
          created_at?: string | null
          details?: string | null
          fight_id?: string
          fighter_1_stats?: Json | null
          fighter_2_stats?: Json | null
          method?: string | null
          referee?: string | null
          result?: Database["public"]["Enums"]["fight_result_enum"] | null
          round?: number | null
          round_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fight_result_fight_id_fkey"
            columns: ["fight_id"]
            isOneToOne: true
            referencedRelation: "fight"
            referencedColumns: ["id"]
          },
        ]
      }
      fight_round_snapshot: {
        Row: {
          created_at: string | null
          fight_id: string
          fighter_1_stats: Json
          fighter_2_stats: Json
          id: number
          round: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fight_id: string
          fighter_1_stats: Json
          fighter_2_stats: Json
          id?: number
          round: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fight_id?: string
          fighter_1_stats?: Json
          fighter_2_stats?: Json
          id?: number
          round?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fight_round_snapshot_fight_id_fkey"
            columns: ["fight_id"]
            isOneToOne: false
            referencedRelation: "fight"
            referencedColumns: ["id"]
          },
        ]
      }
      fighter: {
        Row: {
          country: string | null
          created_at: string | null
          dob: string | null
          flags: Json | null
          full_name: string
          height_in: number | null
          id: string
          nickname: string | null
          reach_in: number | null
          search_priority: number
          slug: string
          stance: string | null
          ufcstats_external_id: string | null
          updated_at: string | null
          weight_lbs: number | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          dob?: string | null
          flags?: Json | null
          full_name: string
          height_in?: number | null
          id?: string
          nickname?: string | null
          reach_in?: number | null
          search_priority?: number
          slug: string
          stance?: string | null
          ufcstats_external_id?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          dob?: string | null
          flags?: Json | null
          full_name?: string
          height_in?: number | null
          id?: string
          nickname?: string | null
          reach_in?: number | null
          search_priority?: number
          slug?: string
          stance?: string | null
          ufcstats_external_id?: string | null
          updated_at?: string | null
          weight_lbs?: number | null
        }
        Relationships: []
      }
      fighter_alias: {
        Row: {
          alias: string
          fighter_id: string
        }
        Insert: {
          alias: string
          fighter_id: string
        }
        Update: {
          alias?: string
          fighter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fighter_alias_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fighter_alias_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter_search_mv"
            referencedColumns: ["fighter_id"]
          },
        ]
      }
      fighter_analytics: {
        Row: {
          computed_at_fight_count: number
          created_at: string | null
          fighter_id: string
          highest_weight_key: string | null
          in_control_pct: number | null
          lowest_weight_key: string | null
          sig_strikes_absorbed_per_5_mins: number | null
          sig_strikes_landed_per_5_mins: number | null
          takedown_accuracy: number | null
          takedown_defence: number | null
          takedowns_attempted_per_5_mins: number | null
          under_control_pct: number | null
          updated_at: string | null
        }
        Insert: {
          computed_at_fight_count?: number
          created_at?: string | null
          fighter_id: string
          highest_weight_key?: string | null
          in_control_pct?: number | null
          lowest_weight_key?: string | null
          sig_strikes_absorbed_per_5_mins?: number | null
          sig_strikes_landed_per_5_mins?: number | null
          takedown_accuracy?: number | null
          takedown_defence?: number | null
          takedowns_attempted_per_5_mins?: number | null
          under_control_pct?: number | null
          updated_at?: string | null
        }
        Update: {
          computed_at_fight_count?: number
          created_at?: string | null
          fighter_id?: string
          highest_weight_key?: string | null
          in_control_pct?: number | null
          lowest_weight_key?: string | null
          sig_strikes_absorbed_per_5_mins?: number | null
          sig_strikes_landed_per_5_mins?: number | null
          takedown_accuracy?: number | null
          takedown_defence?: number | null
          takedowns_attempted_per_5_mins?: number | null
          under_control_pct?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fighter_analytics_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: true
            referencedRelation: "fighter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fighter_analytics_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: true
            referencedRelation: "fighter_search_mv"
            referencedColumns: ["fighter_id"]
          },
        ]
      }
      fighter_scoring_archive: {
        Row: {
          breakdown: Json
          created_at: string
          fight_id: string
          fighter_id: string
          id: string
          score: number
          scoring_profile: string
        }
        Insert: {
          breakdown: Json
          created_at?: string
          fight_id: string
          fighter_id: string
          id?: string
          score: number
          scoring_profile: string
        }
        Update: {
          breakdown?: Json
          created_at?: string
          fight_id?: string
          fighter_id?: string
          id?: string
          score?: number
          scoring_profile?: string
        }
        Relationships: [
          {
            foreignKeyName: "fighter_scoring_archive_fight_id_fkey"
            columns: ["fight_id"]
            isOneToOne: false
            referencedRelation: "fight"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fighter_scoring_archive_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fighter_scoring_archive_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter_search_mv"
            referencedColumns: ["fighter_id"]
          },
        ]
      }
      fighter_stats: {
        Row: {
          created_at: string | null
          draws: number
          fighter_id: string
          losses: number
          no_contests: number
          updated_at: string | null
          wins: number
        }
        Insert: {
          created_at?: string | null
          draws?: number
          fighter_id: string
          losses?: number
          no_contests?: number
          updated_at?: string | null
          wins?: number
        }
        Update: {
          created_at?: string | null
          draws?: number
          fighter_id?: string
          losses?: number
          no_contests?: number
          updated_at?: string | null
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "fighter_stats_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: true
            referencedRelation: "fighter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fighter_stats_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: true
            referencedRelation: "fighter_search_mv"
            referencedColumns: ["fighter_id"]
          },
        ]
      }
      ingest_job: {
        Row: {
          attempts: number
          counts: Json
          error: string | null
          finished_at: string | null
          id: number
          kind: string
          lease_token: string | null
          lease_until: string | null
          payload: Json
          priority: number
          run_after: string
          started_at: string | null
          status: string
        }
        Insert: {
          attempts?: number
          counts?: Json
          error?: string | null
          finished_at?: string | null
          id?: number
          kind: string
          lease_token?: string | null
          lease_until?: string | null
          payload?: Json
          priority?: number
          run_after?: string
          started_at?: string | null
          status?: string
        }
        Update: {
          attempts?: number
          counts?: Json
          error?: string | null
          finished_at?: string | null
          id?: number
          kind?: string
          lease_token?: string | null
          lease_until?: string | null
          payload?: Json
          priority?: number
          run_after?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      ingest_lock: {
        Row: {
          id: number
          lock_name: string | null
          locked_by: string
          locked_until: string
        }
        Insert: {
          id?: number
          lock_name?: string | null
          locked_by?: string
          locked_until?: string
        }
        Update: {
          id?: number
          lock_name?: string | null
          locked_by?: string
          locked_until?: string
        }
        Relationships: []
      }
      ingest_raw: {
        Row: {
          body: string | null
          fetched_at: string
          hash: string
          id: number
          source: string
          url: string
        }
        Insert: {
          body?: string | null
          fetched_at?: string
          hash: string
          id?: number
          source: string
          url: string
        }
        Update: {
          body?: string | null
          fetched_at?: string
          hash?: string
          id?: number
          source?: string
          url?: string
        }
        Relationships: []
      }
      ingest_state: {
        Row: {
          attempts: number
          last_checked: string | null
          last_status: number | null
          latest_ingest_raw_id: number | null
          run_after: string
          url: string
        }
        Insert: {
          attempts?: number
          last_checked?: string | null
          last_status?: number | null
          latest_ingest_raw_id?: number | null
          run_after?: string
          url: string
        }
        Update: {
          attempts?: number
          last_checked?: string | null
          last_status?: number | null
          latest_ingest_raw_id?: number | null
          run_after?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingest_state_latest_ingest_raw_id_fkey"
            columns: ["latest_ingest_raw_id"]
            isOneToOne: false
            referencedRelation: "ingest_raw"
            referencedColumns: ["id"]
          },
        ]
      }
      odds_snapshot: {
        Row: {
          avg_decimal_odds: number
          bookmaker_count: number
          fair_probability: number
          fetched_at: string
          fight_id: string
          fighter_id: string
          id: string
        }
        Insert: {
          avg_decimal_odds: number
          bookmaker_count: number
          fair_probability: number
          fetched_at?: string
          fight_id: string
          fighter_id: string
          id?: string
        }
        Update: {
          avg_decimal_odds?: number
          bookmaker_count?: number
          fair_probability?: number
          fetched_at?: string
          fight_id?: string
          fighter_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "odds_snapshot_fight_id_fkey"
            columns: ["fight_id"]
            isOneToOne: false
            referencedRelation: "fight"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odds_snapshot_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odds_snapshot_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter_search_mv"
            referencedColumns: ["fighter_id"]
          },
        ]
      }
      org: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      user_account: {
        Row: {
          expo_push_token: string | null
          referral_bonus: number | null
          referral_code: string | null
          referred_by: string | null
          status: Database["public"]["Enums"]["user_status"]
          user_id: string
          user_number: number
        }
        Insert: {
          expo_push_token?: string | null
          referral_bonus?: number | null
          referral_code?: string | null
          referred_by?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          user_id: string
          user_number?: number
        }
        Update: {
          expo_push_token?: string | null
          referral_bonus?: number | null
          referral_code?: string | null
          referred_by?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          user_id?: string
          user_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_account_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_account_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_pick_ranking: {
        Row: {
          created_at: string
          event_id: string
          id: string
          mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pick_ranking_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pick_ranking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_pick_ranking_entry: {
        Row: {
          created_at: string
          fighter_id: string
          id: string
          position: number
          ranking_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fighter_id: string
          id?: string
          position: number
          ranking_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fighter_id?: string
          id?: string
          position?: number
          ranking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pick_ranking_entry_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pick_ranking_entry_fighter_id_fkey"
            columns: ["fighter_id"]
            isOneToOne: false
            referencedRelation: "fighter_search_mv"
            referencedColumns: ["fighter_id"]
          },
          {
            foreignKeyName: "user_pick_ranking_entry_ranking_id_fkey"
            columns: ["ranking_id"]
            isOneToOne: false
            referencedRelation: "user_pick_ranking"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_profile: {
        Row: {
          avatar_url: string | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          is_deleted: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          is_deleted?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          is_deleted?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      fighter_search_mv: {
        Row: {
          fighter_id: string | null
          full_name: string | null
          nickname: string | null
          search_priority: number | null
          search_text: string | null
          search_vec: unknown
        }
        Relationships: []
      }
      pg_all_foreign_keys: {
        Row: {
          fk_columns: unknown[] | null
          fk_constraint_name: unknown
          fk_schema_name: unknown
          fk_table_name: unknown
          fk_table_oid: unknown
          is_deferrable: boolean | null
          is_deferred: boolean | null
          match_type: string | null
          on_delete: string | null
          on_update: string | null
          pk_columns: unknown[] | null
          pk_constraint_name: unknown
          pk_index_name: unknown
          pk_schema_name: unknown
          pk_table_name: unknown
          pk_table_oid: unknown
        }
        Relationships: []
      }
      tap_funky: {
        Row: {
          args: string | null
          is_definer: boolean | null
          is_strict: boolean | null
          is_visible: boolean | null
          kind: unknown
          langoid: unknown
          name: unknown
          oid: unknown
          owner: unknown
          returns: string | null
          returns_set: boolean | null
          schema: unknown
          volatility: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      _cleanup: { Args: never; Returns: boolean }
      _contract_on: { Args: { "": string }; Returns: unknown }
      _currtest: { Args: never; Returns: number }
      _db_privs: { Args: never; Returns: unknown[] }
      _extensions: { Args: never; Returns: unknown[] }
      _get: { Args: { "": string }; Returns: number }
      _get_latest: { Args: { "": string }; Returns: number[] }
      _get_note: { Args: { "": string }; Returns: string }
      _is_verbose: { Args: never; Returns: boolean }
      _prokind: { Args: { p_oid: unknown }; Returns: unknown }
      _query: { Args: { "": string }; Returns: string }
      _refine_vol: { Args: { "": string }; Returns: string }
      _table_privs: { Args: never; Returns: unknown[] }
      _temptypes: { Args: { "": string }; Returns: string }
      _todo: { Args: never; Returns: string }
      col_is_null:
        | {
            Args: {
              column_name: unknown
              description?: string
              schema_name: unknown
              table_name: unknown
            }
            Returns: string
          }
        | {
            Args: {
              column_name: unknown
              description?: string
              table_name: unknown
            }
            Returns: string
          }
      col_not_null:
        | {
            Args: {
              column_name: unknown
              description?: string
              schema_name: unknown
              table_name: unknown
            }
            Returns: string
          }
        | {
            Args: {
              column_name: unknown
              description?: string
              table_name: unknown
            }
            Returns: string
          }
      diag:
        | {
            Args: { msg: unknown }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.diag(msg => text), public.diag(msg => anyelement). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { msg: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.diag(msg => text), public.diag(msg => anyelement). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      diag_test_name: { Args: { "": string }; Returns: string }
      do_tap:
        | { Args: never; Returns: string[] }
        | { Args: { "": string }; Returns: string[] }
      fail:
        | { Args: never; Returns: string }
        | { Args: { "": string }; Returns: string }
      findfuncs: { Args: { "": string }; Returns: string[] }
      finish: { Args: { exception_on_failure?: boolean }; Returns: string[] }
      has_unique: { Args: { "": string }; Returns: string }
      in_todo: { Args: never; Returns: boolean }
      is_empty: { Args: { "": string }; Returns: string }
      isnt_empty: { Args: { "": string }; Returns: string }
      lives_ok: { Args: { "": string }; Returns: string }
      no_plan: { Args: never; Returns: boolean[] }
      num_failed: { Args: never; Returns: number }
      os_name: { Args: never; Returns: string }
      pass:
        | { Args: never; Returns: string }
        | { Args: { "": string }; Returns: string }
      pg_version: { Args: never; Returns: string }
      pg_version_num: { Args: never; Returns: number }
      pgtap_version: { Args: never; Returns: number }
      runtests:
        | { Args: never; Returns: string[] }
        | { Args: { "": string }; Returns: string[] }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      skip:
        | { Args: { "": string }; Returns: string }
        | { Args: { how_many: number; why: string }; Returns: string }
      throws_ok: { Args: { "": string }; Returns: string }
      todo:
        | { Args: { how_many: number }; Returns: boolean[] }
        | { Args: { how_many: number; why: string }; Returns: boolean[] }
        | { Args: { why: string }; Returns: boolean[] }
        | { Args: { how_many: number; why: string }; Returns: boolean[] }
      todo_end: { Args: never; Returns: boolean[] }
      todo_start:
        | { Args: never; Returns: boolean[] }
        | { Args: { "": string }; Returns: boolean[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      fight_result_enum: "f1" | "f2" | "draw" | "no-contest"
      schedule_status: "scheduled" | "live" | "final" | "cancelled"
      single_fighter_fight_result_enum:
        | "winner"
        | "loser"
        | "draw"
        | "no-contest"
      user_status:
        | "pending"
        | "rejected"
        | "active"
        | "suspended"
        | "deactivated"
    }
    CompositeTypes: {
      _time_trial_type: {
        a_time: number | null
      }
    }
  }
  reporting: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  api: {
    Enums: {},
  },
  ops: {
    Enums: {},
  },
  public: {
    Enums: {
      fight_result_enum: ["f1", "f2", "draw", "no-contest"],
      schedule_status: ["scheduled", "live", "final", "cancelled"],
      single_fighter_fight_result_enum: [
        "winner",
        "loser",
        "draw",
        "no-contest",
      ],
      user_status: [
        "pending",
        "rejected",
        "active",
        "suspended",
        "deactivated",
      ],
    },
  },
  reporting: {
    Enums: {},
  },
} as const
