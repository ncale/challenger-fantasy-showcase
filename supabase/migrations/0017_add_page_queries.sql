-- Page query views for optimized data retrieval

-- 1. Fighter page query view
-- Gets a fighter by id with aliases, stats, and all fights they've been involved in
CREATE OR REPLACE VIEW fighter_page_query AS
SELECT 
  -- Fighter details
  f.id as fighter_id,
  f.slug as fighter_slug,
  f.full_name,
  f.nickname,
  f.country,
  f.stance,
  f.height_in,
  f.reach_in,
  f.dob,
  f.weight_lbs as fighter_weight_lbs,
  f.flags,
  f.search_priority,
  f.created_at as fighter_created_at,
  f.updated_at as fighter_updated_at,
  
  -- Fighter stats
  fs.wins,
  fs.losses,
  fs.draws,
  fs.no_contests,
  fs.sig_strikes_landed_per_minute,
  fs.striking_accuracy,
  fs.sig_strikes_absorbed_per_minute,
  fs.striking_defense,
  fs.takedown_average,
  fs.takedown_accuracy,
  fs.takedown_defense,
  fs.submission_average,
  
  -- Fighter aliases (aggregated)
  COALESCE(
    array_agg(DISTINCT fa.alias) FILTER (WHERE fa.alias IS NOT NULL),
    '{}'::text[]
  ) as aliases,
  
  -- Fight details (when fighter is fighter_1)
  fight1.id as fight_id_1,
  fight1.event_id as event_id_1,
  fight1.fighter_2_id as opponent_id_1,
  fight1.weight_class as weight_class_1,
  fight1.weight_lbs as fight_weight_lbs_1,
  fight1.is_title as is_title_1,
  fight1.title_name as title_name_1,
  fight1.rounds_scheduled as rounds_scheduled_1,
  fight1.time_format as time_format_1,
  fight1.status as fight_status_1,
  fight1.result_method as result_method_1,
  fight1.result_round as result_round_1,
  fight1.result_round_time as result_round_time_1,
  fight1.winner_fighter_id as winner_fighter_id_1,
  fight1.referee as referee_1,
  fight1.details as fight_details_1,
  fight1.fight_order as fight_order_1,
  fight1.created_at as fight_created_at_1,
  fight1.updated_at as fight_updated_at_1,
  
  -- Fight details (when fighter is fighter_2)
  fight2.id as fight_id_2,
  fight2.event_id as event_id_2,
  fight2.fighter_1_id as opponent_id_2,
  fight2.weight_class as weight_class_2,
  fight2.weight_lbs as fight_weight_lbs_2,
  fight2.is_title as is_title_2,
  fight2.title_name as title_name_2,
  fight2.rounds_scheduled as rounds_scheduled_2,
  fight2.time_format as time_format_2,
  fight2.status as fight_status_2,
  fight2.result_method as result_method_2,
  fight2.result_round as result_round_2,
  fight2.result_round_time as result_round_time_2,
  fight2.winner_fighter_id as winner_fighter_id_2,
  fight2.referee as referee_2,
  fight2.details as fight_details_2,
  fight2.fight_order as fight_order_2,
  fight2.created_at as fight_created_at_2,
  fight2.updated_at as fight_updated_at_2

FROM fighter f
LEFT JOIN fighter_stats fs ON f.id = fs.fighter_id
LEFT JOIN fighter_alias fa ON f.id = fa.fighter_id
LEFT JOIN fight fight1 ON f.id = fight1.fighter_1_id
LEFT JOIN fight fight2 ON f.id = fight2.fighter_2_id
GROUP BY 
  f.id, f.slug, f.full_name, f.nickname, f.country, f.stance, f.height_in, 
  f.reach_in, f.dob, f.weight_lbs, f.flags, f.search_priority, f.created_at, f.updated_at,
  fs.wins, fs.losses, fs.draws, fs.no_contests, fs.sig_strikes_landed_per_minute,
  fs.striking_accuracy, fs.sig_strikes_absorbed_per_minute, fs.striking_defense,
  fs.takedown_average, fs.takedown_accuracy, fs.takedown_defense, fs.submission_average,
  fight1.id, fight1.event_id, fight1.fighter_2_id, fight1.weight_class, fight1.weight_lbs,
  fight1.is_title, fight1.title_name, fight1.rounds_scheduled, fight1.time_format,
  fight1.status, fight1.result_method, fight1.result_round, fight1.result_round_time,
  fight1.winner_fighter_id, fight1.referee, fight1.details, fight1.fight_order,
  fight1.created_at, fight1.updated_at,
  fight2.id, fight2.event_id, fight2.fighter_1_id, fight2.weight_class, fight2.weight_lbs,
  fight2.is_title, fight2.title_name, fight2.rounds_scheduled, fight2.time_format,
  fight2.status, fight2.result_method, fight2.result_round, fight2.result_round_time,
  fight2.winner_fighter_id, fight2.referee, fight2.details, fight2.fight_order,
  fight2.created_at, fight2.updated_at;

-- 2. Fight page query view
-- Gets fight with event, both fighters, and all fight_round_snapshots
CREATE OR REPLACE VIEW fight_page_query AS
SELECT 
  -- Fight details
  fight.id as fight_id,
  fight.event_id,
  fight.fighter_1_id,
  fight.fighter_2_id,
  fight.weight_class,
  fight.weight_lbs as fight_weight_lbs,
  fight.is_title,
  fight.title_name,
  fight.rounds_scheduled,
  fight.time_format,
  fight.status as fight_status,
  fight.result_method,
  fight.result_round,
  fight.result_round_time,
  fight.winner_fighter_id,
  fight.referee,
  fight.details as fight_details,
  fight.fight_order,
  fight.created_at as fight_created_at,
  fight.updated_at as fight_updated_at,
  
  -- Event details
  e.slug as event_slug,
  e.name as event_name,
  e.event_date,
  e.tz as event_tz,
  e.venue,
  e.city as event_city,
  e.country as event_country,
  e.state_or_region,
  e.status as event_status,
  e.org_id,
  e.created_at as event_created_at,
  e.updated_at as event_updated_at,
  
  -- Fighter 1 details
  f1.slug as fighter_1_slug,
  f1.full_name as fighter_1_full_name,
  f1.nickname as fighter_1_nickname,
  f1.country as fighter_1_country,
  f1.stance as fighter_1_stance,
  f1.height_in as fighter_1_height_in,
  f1.reach_in as fighter_1_reach_in,
  f1.dob as fighter_1_dob,
  f1.weight_lbs as fighter_1_weight_lbs,
  f1.flags as fighter_1_flags,
  f1.search_priority as fighter_1_search_priority,
  
  -- Fighter 2 details
  f2.slug as fighter_2_slug,
  f2.full_name as fighter_2_full_name,
  f2.nickname as fighter_2_nickname,
  f2.country as fighter_2_country,
  f2.stance as fighter_2_stance,
  f2.height_in as fighter_2_height_in,
  f2.reach_in as fighter_2_reach_in,
  f2.dob as fighter_2_dob,
  f2.weight_lbs as fighter_2_weight_lbs,
  f2.flags as fighter_2_flags,
  f2.search_priority as fighter_2_search_priority,
  
  -- Fight round snapshots (aggregated)
  COALESCE(
    json_agg(
      json_build_object(
        'id', frs.id,
        'round', frs.round,
        'fighter_1_stats', frs.fighter_1_stats,
        'fighter_2_stats', frs.fighter_2_stats,
        'created_at', frs.created_at,
        'updated_at', frs.updated_at
      ) ORDER BY frs.round
    ) FILTER (WHERE frs.id IS NOT NULL),
    '[]'::json
  ) as round_snapshots

FROM fight
JOIN event e ON fight.event_id = e.id
JOIN fighter f1 ON fight.fighter_1_id = f1.id
JOIN fighter f2 ON fight.fighter_2_id = f2.id
LEFT JOIN fight_round_snapshot frs ON fight.id = frs.fight_id
GROUP BY 
  fight.id, fight.event_id, fight.fighter_1_id, fight.fighter_2_id, fight.weight_class,
  fight.weight_lbs, fight.is_title, fight.title_name, fight.rounds_scheduled,
  fight.time_format, fight.status, fight.result_method, fight.result_round,
  fight.result_round_time, fight.winner_fighter_id, fight.referee, fight.details,
  fight.fight_order, fight.created_at, fight.updated_at,
  e.slug, e.name, e.event_date, e.tz, e.venue, e.city, e.country, e.state_or_region,
  e.status, e.org_id, e.created_at, e.updated_at,
  f1.slug, f1.full_name, f1.nickname, f1.country, f1.stance, f1.height_in,
  f1.reach_in, f1.dob, f1.weight_lbs, f1.flags, f1.search_priority,
  f2.slug, f2.full_name, f2.nickname, f2.country, f2.stance, f2.height_in,
  f2.reach_in, f2.dob, f2.weight_lbs, f2.flags, f2.search_priority;

-- 3. Event page query view  
-- Gets event with all fights and fighters in those fights
CREATE OR REPLACE VIEW event_page_query AS
SELECT 
  -- Event details
  e.id as event_id,
  e.slug as event_slug,
  e.name as event_name,
  e.event_date,
  e.tz as event_tz,
  e.venue,
  e.city as event_city,
  e.country as event_country,
  e.state_or_region,
  e.status as event_status,
  e.org_id,
  e.created_at as event_created_at,
  e.updated_at as event_updated_at,
  
  -- Organization details
  o.slug as org_slug,
  o.name as org_name,
  
  -- Fight details
  fight.id as fight_id,
  fight.fighter_1_id,
  fight.fighter_2_id,
  fight.weight_class,
  fight.weight_lbs as fight_weight_lbs,
  fight.is_title,
  fight.title_name,
  fight.rounds_scheduled,
  fight.time_format,
  fight.status as fight_status,
  fight.result_method,
  fight.result_round,
  fight.result_round_time,
  fight.winner_fighter_id,
  fight.referee,
  fight.details as fight_details,
  fight.fight_order,
  fight.created_at as fight_created_at,
  fight.updated_at as fight_updated_at,
  
  -- Fighter 1 details
  f1.slug as fighter_1_slug,
  f1.full_name as fighter_1_full_name,
  f1.nickname as fighter_1_nickname,
  f1.country as fighter_1_country,
  f1.stance as fighter_1_stance,
  f1.height_in as fighter_1_height_in,
  f1.reach_in as fighter_1_reach_in,
  f1.dob as fighter_1_dob,
  f1.weight_lbs as fighter_1_weight_lbs,
  f1.flags as fighter_1_flags,
  f1.search_priority as fighter_1_search_priority,
  
  -- Fighter 2 details
  f2.slug as fighter_2_slug,
  f2.full_name as fighter_2_full_name,
  f2.nickname as fighter_2_nickname,
  f2.country as fighter_2_country,
  f2.stance as fighter_2_stance,
  f2.height_in as fighter_2_height_in,
  f2.reach_in as fighter_2_reach_in,
  f2.dob as fighter_2_dob,
  f2.weight_lbs as fighter_2_weight_lbs,
  f2.flags as fighter_2_flags,
  f2.search_priority as fighter_2_search_priority

FROM event e
JOIN org o ON e.org_id = o.id
LEFT JOIN fight ON e.id = fight.event_id
LEFT JOIN fighter f1 ON fight.fighter_1_id = f1.id
LEFT JOIN fighter f2 ON fight.fighter_2_id = f2.id
ORDER BY fight.fight_order NULLS LAST;
