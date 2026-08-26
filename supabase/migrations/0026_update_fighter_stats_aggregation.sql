DROP FUNCTION IF EXISTS api.fighter_aggregated_stats_by_years;

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
  aggregated_stats jsonb,
  opponent_aggregated_stats jsonb
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
        WHEN v.fighter_1_slug = p_fighter_slug THEN v.fighter_2_stats
        WHEN v.fighter_2_slug = p_fighter_slug THEN v.fighter_1_stats
        ELSE NULL
      END as opponent_stats,
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
      aggregate_fighter_stats_jsonb(array_agg(fighter_stats)) as aggregated_stats,
      aggregate_fighter_stats_jsonb(array_agg(opponent_stats)) as opponent_aggregated_stats
    FROM filtered_rounds
  )
  SELECT * FROM aggregated;
$$;