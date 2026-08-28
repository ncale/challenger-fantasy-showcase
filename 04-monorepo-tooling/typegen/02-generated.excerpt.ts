// Step 2: this is what step 1 produces — a fully mechanical, hand-untouched
// dump of every table/view/enum in the schema. This file is normally ~2,400
// lines; trimmed here to one table (`fighter_analytics`, the precomputed
// summary table behind 01-api-and-data-layer's latency story) so the shape
// is legible. Never hand-edited — see 04-generated-overwrite.ts for the layer
// that's actually meant to be touched.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      fighter_analytics: {
        Row: {
          computed_at_fight_count: number;
          created_at: string | null;
          fighter_id: string;
          highest_weight_key: string | null;
          in_control_pct: number | null;
          lowest_weight_key: string | null;
          sig_strikes_absorbed_per_5_mins: number | null;
          sig_strikes_landed_per_5_mins: number | null;
          takedown_accuracy: number | null;
          takedown_defence: number | null;
          takedowns_attempted_per_5_mins: number | null;
          under_control_pct: number | null;
          updated_at: string | null;
        };
        Insert: {
          computed_at_fight_count?: number;
          created_at?: string | null;
          fighter_id: string;
          highest_weight_key?: string | null;
          in_control_pct?: number | null;
          lowest_weight_key?: string | null;
          sig_strikes_absorbed_per_5_mins?: number | null;
          sig_strikes_landed_per_5_mins?: number | null;
          takedown_accuracy?: number | null;
          takedown_defence?: number | null;
          takedowns_attempted_per_5_mins?: number | null;
          under_control_pct?: number | null;
          updated_at?: string | null;
        };
        Update: {
          computed_at_fight_count?: number;
          created_at?: string | null;
          fighter_id?: string;
          highest_weight_key?: string | null;
          in_control_pct?: number | null;
          lowest_weight_key?: string | null;
          sig_strikes_absorbed_per_5_mins?: number | null;
          sig_strikes_landed_per_5_mins?: number | null;
          takedown_accuracy?: number | null;
          takedown_defence?: number | null;
          takedowns_attempted_per_5_mins?: number | null;
          under_control_pct?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fighter_analytics_fighter_id_fkey";
            columns: ["fighter_id"];
            isOneToOne: true;
            referencedRelation: "fighter";
            referencedColumns: ["id"];
          },
        ];
      };
      // ...every other table in the schema
    };
    Views: {
      // ...
    };
    Enums: {
      // ...
    };
  };
  // ...api, ops, reporting schemas
};
