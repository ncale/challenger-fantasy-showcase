-- Refactor fighter_stats to only hold record information,
-- and introduce fighter_analytics for computed per-fight analytics.

-- 1. Drop analytics columns from fighter_stats
ALTER TABLE fighter_stats
  DROP COLUMN IF EXISTS sig_strikes_landed_per_minute,
  DROP COLUMN IF EXISTS striking_accuracy,
  DROP COLUMN IF EXISTS sig_strikes_absorbed_per_minute,
  DROP COLUMN IF EXISTS striking_defense,
  DROP COLUMN IF EXISTS takedown_average,
  DROP COLUMN IF EXISTS takedown_accuracy,
  DROP COLUMN IF EXISTS takedown_defense,
  DROP COLUMN IF EXISTS submission_average;

-- 2. Create fighter_analytics table
CREATE TABLE IF NOT EXISTS fighter_analytics (
  fighter_id uuid PRIMARY KEY REFERENCES fighter(id) ON DELETE CASCADE,
  sig_strikes_landed_per_5_mins numeric,
  sig_strikes_absorbed_per_5_mins numeric,
  in_control_pct numeric,
  under_control_pct numeric,
  takedowns_attempted_per_5_mins numeric,
  takedown_accuracy numeric,
  takedown_defence numeric,
  computed_at_fight_count integer NOT NULL DEFAULT 0,
  lowest_weight_lbs integer,
  highest_weight_lbs integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. RLS
ALTER TABLE fighter_analytics ENABLE ROW LEVEL SECURITY;
