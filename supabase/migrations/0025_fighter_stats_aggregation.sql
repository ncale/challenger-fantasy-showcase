-- Fighter stats aggregation view and function
-- This view joins fight_round_snapshot with fight, event, and fighter details
-- to make it easy to filter and group fighter performance data

-- Create a comprehensive view that includes all round snapshot data 
-- along with fight, event, and fighter details
CREATE OR REPLACE VIEW fighter_round_stats_view AS
SELECT 
  -- Round snapshot data (all columns)
  frs.*,
  
  -- Fight details
  f.event_id,
  f.fighter_1_id,
  f.fighter_2_id,
  f.weight_class,
  f.is_title,
  f.rounds_scheduled,
  f.status as fight_status,
  f.result_method,
  f.result_round,
  f.result_round_time,
  f.winner_fighter_id,
  f.weight_lbs,
  f.title_name,
  f.time_format,
  f.details as fight_details,
  f.referee,
  f.fight_order,
  
  -- Event details
  e.slug as event_slug,
  e.name as event_name,
  e.event_date,
  e.tz as event_tz,
  e.venue,
  e.city,
  e.state_or_region,
  e.country,
  e.status as event_status,
  e.org_id,
  
  -- Fighter 1 details
  f1.slug as fighter_1_slug,
  f1.full_name as fighter_1_name,
  f1.nickname as fighter_1_nickname,
  f1.country as fighter_1_country,
  f1.stance as fighter_1_stance,
  f1.height_in as fighter_1_height_in,
  f1.reach_in as fighter_1_reach_in,
  f1.weight_lbs as fighter_1_weight_lbs,
  f1.dob as fighter_1_dob,
  f1.flags as fighter_1_flags,
  f1.search_priority as fighter_1_search_priority,
  
  -- Fighter 2 details  
  f2.slug as fighter_2_slug,
  f2.full_name as fighter_2_name,
  f2.nickname as fighter_2_nickname,
  f2.country as fighter_2_country,
  f2.stance as fighter_2_stance,
  f2.height_in as fighter_2_height_in,
  f2.reach_in as fighter_2_reach_in,
  f2.weight_lbs as fighter_2_weight_lbs,
  f2.dob as fighter_2_dob,
  f2.flags as fighter_2_flags,
  f2.search_priority as fighter_2_search_priority

FROM fight_round_snapshot frs
JOIN fight f ON frs.fight_id = f.id
JOIN event e ON f.event_id = e.id
JOIN fighter f1 ON f.fighter_1_id = f1.id
JOIN fighter f2 ON f.fighter_2_id = f2.id;

-- Create function to get fighter round stats for a specific time period
-- Returns all round data for the fighter within the specified years
-- Aggregation will be done in application code
CREATE OR REPLACE FUNCTION api.fighter_round_stats_by_years(
  p_fighter_slug text,
  p_years_back numeric DEFAULT 5
)
RETURNS TABLE (
  -- Round snapshot fields
  id bigint,
  fight_id uuid,
  round integer,
  fighter_1_stats jsonb,
  fighter_2_stats jsonb,
  round_created_at timestamptz,
  round_updated_at timestamptz,
  
  -- Fight details
  event_id uuid,
  fighter_1_id uuid,
  fighter_2_id uuid,
  weight_class text,
  is_title boolean,
  rounds_scheduled integer,
  fight_status text,
  result_method text,
  result_round integer,
  result_round_time interval,
  winner_fighter_id uuid,
  weight_lbs integer,
  title_name text,
  time_format text,
  fight_details text,
  referee text,
  fight_order integer,
  
  -- Event details
  event_slug text,
  event_name text,
  event_date timestamptz,
  event_tz text,
  venue text,
  city text,
  state_or_region text,
  country text,
  event_status text,
  org_id uuid,
  
  -- Fighter 1 details
  fighter_1_slug text,
  fighter_1_name text,
  fighter_1_nickname text,
  fighter_1_country text,
  fighter_1_stance text,
  fighter_1_height_in integer,
  fighter_1_reach_in integer,
  fighter_1_weight_lbs integer,
  fighter_1_dob date,
  fighter_1_flags jsonb,
  fighter_1_search_priority smallint,
  
  -- Fighter 2 details
  fighter_2_slug text,
  fighter_2_name text,
  fighter_2_nickname text,
  fighter_2_country text,
  fighter_2_stance text,
  fighter_2_height_in integer,
  fighter_2_reach_in integer,
  fighter_2_weight_lbs integer,
  fighter_2_dob date,
  fighter_2_flags jsonb,
  fighter_2_search_priority smallint
)
LANGUAGE sql
SECURITY definer
STABLE
SET search_path = public, pg_temp
AS $$
  SELECT 
    -- Round snapshot fields (renamed to avoid conflicts)
    v.id,
    v.fight_id,
    v.round,
    v.fighter_1_stats,
    v.fighter_2_stats,
    v.created_at as round_created_at,
    v.updated_at as round_updated_at,
    
    -- Fight details
    v.event_id,
    v.fighter_1_id,
    v.fighter_2_id,
    v.weight_class,
    v.is_title,
    v.rounds_scheduled,
    v.fight_status,
    v.result_method,
    v.result_round,
    v.result_round_time,
    v.winner_fighter_id,
    v.weight_lbs,
    v.title_name,
    v.time_format,
    v.fight_details,
    v.referee,
    v.fight_order,
    
    -- Event details
    v.event_slug,
    v.event_name,
    v.event_date,
    v.event_tz,
    v.venue,
    v.city,
    v.state_or_region,
    v.country,
    v.event_status,
    v.org_id,
    
    -- Fighter 1 details
    v.fighter_1_slug,
    v.fighter_1_name,
    v.fighter_1_nickname,
    v.fighter_1_country,
    v.fighter_1_stance,
    v.fighter_1_height_in,
    v.fighter_1_reach_in,
    v.fighter_1_weight_lbs,
    v.fighter_1_dob,
    v.fighter_1_flags,
    v.fighter_1_search_priority,
    
    -- Fighter 2 details
    v.fighter_2_slug,
    v.fighter_2_name,
    v.fighter_2_nickname,
    v.fighter_2_country,
    v.fighter_2_stance,
    v.fighter_2_height_in,
    v.fighter_2_reach_in,
    v.fighter_2_weight_lbs,
    v.fighter_2_dob,
    v.fighter_2_flags,
    v.fighter_2_search_priority
    
  FROM fighter_round_stats_view v
  WHERE (v.fighter_1_slug = p_fighter_slug OR v.fighter_2_slug = p_fighter_slug)
    AND v.event_date >= (CURRENT_DATE - (p_years_back * INTERVAL '1 year'))
    AND v.event_status = 'final'  -- Only include completed events
  ORDER BY v.event_date DESC, v.fight_order ASC, v.round ASC;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION api.fighter_round_stats_by_years(text, numeric) TO anon, authenticated;

-- Helper function to aggregate JSONB fighter stats
-- This function takes multiple JSONB records and sums all numeric fields except percentages
-- Percentages are recalculated from the summed totals where possible
CREATE OR REPLACE FUNCTION aggregate_fighter_stats_jsonb(stats_array jsonb[])
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  result jsonb;
  stat_record jsonb;
  
  -- General stats totals
  total_reversals numeric := 0;
  total_takedowns_landed numeric := 0;
  total_takedowns_attempted numeric := 0;
  total_knockdowns numeric := 0;
  total_strikes_landed numeric := 0;
  total_strikes_attempted numeric := 0;
  total_control_time_seconds numeric := 0;
  total_sig_strikes_landed numeric := 0;
  total_sig_strikes_attempted numeric := 0;
  total_submission_attempts numeric := 0;
  
  -- Strike location totals
  total_leg_landed numeric := 0;
  total_leg_attempted numeric := 0;
  total_body_landed numeric := 0;
  total_body_attempted numeric := 0;
  total_head_landed numeric := 0;
  total_head_attempted numeric := 0;
  total_clinch_landed numeric := 0;
  total_clinch_attempted numeric := 0;
  total_ground_landed numeric := 0;
  total_ground_attempted numeric := 0;
  total_distance_landed numeric := 0;
  total_distance_attempted numeric := 0;
  
BEGIN
  -- Sum all the stats from the array
  FOREACH stat_record IN ARRAY stats_array
  LOOP
    -- General stats
    total_reversals := total_reversals + COALESCE((stat_record->'general'->>'reversals')::numeric, 0);
    total_takedowns_landed := total_takedowns_landed + COALESCE((stat_record->'general'->'takedowns'->>'landed')::numeric, 0);
    total_takedowns_attempted := total_takedowns_attempted + COALESCE((stat_record->'general'->'takedowns'->>'attempted')::numeric, 0);
    total_knockdowns := total_knockdowns + COALESCE((stat_record->'general'->>'knockdowns')::numeric, 0);
    total_strikes_landed := total_strikes_landed + COALESCE((stat_record->'general'->'totalStrikes'->>'landed')::numeric, 0);
    total_strikes_attempted := total_strikes_attempted + COALESCE((stat_record->'general'->'totalStrikes'->>'attempted')::numeric, 0);
    total_control_time_seconds := total_control_time_seconds + COALESCE((stat_record->'general'->>'controlTimeSeconds')::numeric, 0);
    total_sig_strikes_landed := total_sig_strikes_landed + COALESCE((stat_record->'general'->'significantStrikes'->>'landed')::numeric, 0);
    total_sig_strikes_attempted := total_sig_strikes_attempted + COALESCE((stat_record->'general'->'significantStrikes'->>'attempted')::numeric, 0);
    total_submission_attempts := total_submission_attempts + COALESCE((stat_record->'general'->>'submissionAttempts')::numeric, 0);
    
    -- Strike locations
    total_leg_landed := total_leg_landed + COALESCE((stat_record->'strikes'->'leg'->>'landed')::numeric, 0);
    total_leg_attempted := total_leg_attempted + COALESCE((stat_record->'strikes'->'leg'->>'attempted')::numeric, 0);
    total_body_landed := total_body_landed + COALESCE((stat_record->'strikes'->'body'->>'landed')::numeric, 0);
    total_body_attempted := total_body_attempted + COALESCE((stat_record->'strikes'->'body'->>'attempted')::numeric, 0);
    total_head_landed := total_head_landed + COALESCE((stat_record->'strikes'->'head'->>'landed')::numeric, 0);
    total_head_attempted := total_head_attempted + COALESCE((stat_record->'strikes'->'head'->>'attempted')::numeric, 0);
    total_clinch_landed := total_clinch_landed + COALESCE((stat_record->'strikes'->'clinch'->>'landed')::numeric, 0);
    total_clinch_attempted := total_clinch_attempted + COALESCE((stat_record->'strikes'->'clinch'->>'attempted')::numeric, 0);
    total_ground_landed := total_ground_landed + COALESCE((stat_record->'strikes'->'ground'->>'landed')::numeric, 0);
    total_ground_attempted := total_ground_attempted + COALESCE((stat_record->'strikes'->'ground'->>'attempted')::numeric, 0);
    total_distance_landed := total_distance_landed + COALESCE((stat_record->'strikes'->'distance'->>'landed')::numeric, 0);
    total_distance_attempted := total_distance_attempted + COALESCE((stat_record->'strikes'->'distance'->>'attempted')::numeric, 0);
  END LOOP;
  
  -- Build the aggregated result with recalculated percentages
  result := jsonb_build_object(
    'general', jsonb_build_object(
      'reversals', total_reversals,
      'takedowns', jsonb_build_object(
        'landed', total_takedowns_landed,
        'attempted', total_takedowns_attempted
      ),
      'knockdowns', total_knockdowns,
      'totalStrikes', jsonb_build_object(
        'landed', total_strikes_landed,
        'attempted', total_strikes_attempted
      ),
      'controlTimeSeconds', total_control_time_seconds,
      'significantStrikes', jsonb_build_object(
        'landed', total_sig_strikes_landed,
        'attempted', total_sig_strikes_attempted
      ),
      'submissionAttempts', total_submission_attempts,
      'takedownPercentage', CASE 
        WHEN total_takedowns_attempted > 0 
        THEN ROUND((total_takedowns_landed::numeric / total_takedowns_attempted * 100), 1)
        ELSE null 
      END,
      'significantStrikePercentage', CASE 
        WHEN total_sig_strikes_attempted > 0 
        THEN ROUND((total_sig_strikes_landed::numeric / total_sig_strikes_attempted * 100), 1)
        ELSE null 
      END
    ),
    'strikes', jsonb_build_object(
      'leg', jsonb_build_object(
        'landed', total_leg_landed,
        'attempted', total_leg_attempted
      ),
      'body', jsonb_build_object(
        'landed', total_body_landed,
        'attempted', total_body_attempted
      ),
      'head', jsonb_build_object(
        'landed', total_head_landed,
        'attempted', total_head_attempted
      ),
      'total', jsonb_build_object(
        'landed', total_sig_strikes_landed,
        'attempted', total_sig_strikes_attempted,
        'percentage', CASE 
          WHEN total_sig_strikes_attempted > 0 
          THEN ROUND((total_sig_strikes_landed::numeric / total_sig_strikes_attempted * 100), 1)
          ELSE null 
        END
      ),
      'clinch', jsonb_build_object(
        'landed', total_clinch_landed,
        'attempted', total_clinch_attempted
      ),
      'ground', jsonb_build_object(
        'landed', total_ground_landed,
        'attempted', total_ground_attempted
      ),
      'distance', jsonb_build_object(
        'landed', total_distance_landed,
        'attempted', total_distance_attempted
      ),
      'totalPercentage', CASE 
        WHEN total_sig_strikes_attempted > 0 
        THEN ROUND((total_sig_strikes_landed::numeric / total_sig_strikes_attempted * 100), 1)
        ELSE null 
      END
    ),
    'schemaVersion', 1
  );
  
  RETURN result;
END;
$$;

-- Function to get aggregated fighter stats over a time period
-- This function aggregates all the JSONB stats for a fighter and returns the totals
CREATE OR REPLACE FUNCTION api.fighter_aggregated_stats_by_years(
  p_fighter_slug text,
  p_years_back numeric DEFAULT 5
)
RETURNS TABLE (
  fighter_slug text,
  fighter_name text,
  total_rounds integer,
  total_fights integer,
  date_range_start date,
  date_range_end date,
  aggregated_stats jsonb
)
LANGUAGE sql
SECURITY definer
STABLE
SET search_path = public, pg_temp
AS $$
  WITH fighter_rounds AS (
    SELECT 
      CASE 
        WHEN v.fighter_1_slug = p_fighter_slug THEN v.fighter_1_stats
        WHEN v.fighter_2_slug = p_fighter_slug THEN v.fighter_2_stats
        ELSE NULL
      END as fighter_stats,
      CASE 
        WHEN v.fighter_1_slug = p_fighter_slug THEN v.fighter_1_name
        WHEN v.fighter_2_slug = p_fighter_slug THEN v.fighter_2_name
        ELSE NULL
      END as fighter_name,
      v.event_date,
      v.fight_id
    FROM fighter_round_stats_view v
    WHERE (v.fighter_1_slug = p_fighter_slug OR v.fighter_2_slug = p_fighter_slug)
      AND v.event_date >= (CURRENT_DATE - (p_years_back * INTERVAL '1 year'))
      AND v.event_status = 'final'
  ),
  filtered_rounds AS (
    SELECT *
    FROM fighter_rounds
    WHERE fighter_stats IS NOT NULL
  ),
  aggregated AS (
    SELECT 
      p_fighter_slug as fighter_slug,
      MAX(fighter_name) as fighter_name,
      COUNT(*) as total_rounds,
      COUNT(DISTINCT fight_id) as total_fights,
      MIN(event_date::date) as date_range_start,
      MAX(event_date::date) as date_range_end,
      aggregate_fighter_stats_jsonb(array_agg(fighter_stats)) as aggregated_stats
    FROM filtered_rounds
  )
  SELECT * FROM aggregated;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION aggregate_fighter_stats_jsonb(jsonb[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION api.fighter_aggregated_stats_by_years(text, numeric) TO anon, authenticated;
