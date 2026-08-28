-- Helper function to aggregate JSONB fighter stats
-- This function takes multiple JSONB records and sums all numeric fields except percentages
-- Percentages are recalculated from the summed totals where possible
create or replace function api.aggregate_fighter_stats_jsonb(stats_array jsonb[])
returns jsonb
language plpgsql
immutable
security invoker
set search_path = pg_temp, public, api
as $$
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

alter function api.aggregate_fighter_stats_jsonb owner to db_owner;
grant execute on function api.aggregate_fighter_stats_jsonb to anon, authenticated;



-- rpc: fighter header + aggregated stats (tiny, cacheable)
create or replace function api.fighter_header_and_stats(p_slug text)
returns table (
  id uuid,
  slug text,
  full_name text,
  nickname text,
  country text,
  stance text,
  height_in int4,
  reach_in int4,
  weight_lbs int4,
  dob date,
  flags jsonb,
  search_priority int2,
  updated_at timestamptz,
  fighter_id uuid,
  wins int4,
  losses int4,
  draws int4,
  no_contests int4,
  sig_strikes_landed_per_minute numeric,
  striking_accuracy numeric,
  sig_strikes_absorbed_per_minute numeric,
  striking_defense numeric,
  takedown_average numeric,
  takedown_accuracy numeric,
  takedown_defense numeric,
  submission_average numeric
)
language sql
stable
security invoker
set search_path = pg_temp, public, api
as $$
with f as (
  select 
    id, slug, full_name, nickname, country, stance,
    height_in, reach_in, weight_lbs, dob, flags, 
    search_priority, updated_at
  from public.fighter
  where slug = p_slug
  limit 1
),
s as (
  -- lightweight, precomputed stats table or view is preferred.
  select 
    fighter_id, wins, losses, draws, no_contests, sig_strikes_landed_per_minute, striking_accuracy,
    sig_strikes_absorbed_per_minute, striking_defense, takedown_average, takedown_accuracy,
    takedown_defense, submission_average
  from public.fighter_stats
  where fighter_id = (select id from f)
)
select f.*, s.*
from f join s on f.id = s.fighter_id;
$$;

alter function api.fighter_header_and_stats owner to db_owner;
grant execute on function api.fighter_header_and_stats to anon, authenticated;



create or replace function api.search_fighters(q text, lim int default 10)
returns table(fighter_id uuid, full_name text, nickname text, search_priority int, rank numeric)
language sql
stable
security invoker
set search_path = pg_temp, public, api
as $$
with norm as (select unaccent(trim(q)) as q)
select
  s.fighter_id, s.full_name, s.nickname, s.search_priority,
  -- tuneable scoring:
  (s.search_priority * 1.0) * 2.0
  + ts_rank_cd(s.search_vec, plainto_tsquery('simple', (select q from norm))) * 3.0
  + similarity(s.search_text, (select q from norm)) * 1.5
  as rank
from
  /* choose your surface: */
  /* person_search_mv s, norm */
  public.fighter_search_mv s, norm
where
  s.search_text ilike (select q || '%')               -- fast prefix
  or s.search_text % (select q)                       -- fuzzy via trigrams
  or s.search_vec @@ plainto_tsquery('simple', (select q)) -- full-text match
order by rank desc
limit greatest(1, lim);
$$;

alter function api.search_fighters owner to db_owner;
grant execute on function api.search_fighters to anon, authenticated;



-- rpc: daily mma games with submission counts
create or replace function api.games_with_submission_counts(uid uuid)
returns table (
  game_id uuid,
	event_id uuid,
	config jsonb,
	metadata jsonb,
  total_submissions bigint,
  user_submissions bigint
)
language sql
stable
security invoker
set search_path = pg_temp, public, api
as $$
	select
		g.id as game_id,
		g.event_id,
		g.config,
		g.metadata,
		(
			select count(*)
			from daily_mma_game_submission s
			where s.game_id = g.id
		) as total_submissions,
		(
			select count(*)
			from daily_mma_game_submission s
			where s.game_id = g.id
				and s.user_id = $1
		) as user_submissions
	from daily_mma_game g
	order by g.created_at desc;
$$;

alter function api.games_with_submission_counts owner to db_owner;
grant execute on function api.games_with_submission_counts to anon, authenticated;



-- rpc: daily mma games for submissions
create or replace function api.submission_games(uid uuid)
returns table (
  game_id uuid,
	event_id uuid,
	config jsonb,
	metadata jsonb,
  total_submissions bigint,
  user_submissions bigint
)
language sql
stable
security invoker
set search_path = pg_temp, public, api
as $$
	select * from api.games_with_submission_counts(uid)
	where game_id in (select distinct game_id from api.daily_mma_game_submissions_view where user_id = uid)
$$;

alter function api.games_with_submission_counts owner to db_owner;
grant execute on function api.games_with_submission_counts to anon, authenticated;



-- rpc: daily mma games for submissions
create or replace function api.make_submission(
  p_game_id uuid,
  p_name text,
  p_picks jsonb,  -- array of { fighter_id, kind }
	p_submission_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_temp, public, api
as $$
declare
  v_user_id uuid := auth.uid();  -- supabase helper for caller
  v_submission_id uuid;
begin
	-- validation
  if not exists(select 1 from public.daily_mma_game where id = p_game_id) then
    raise exception 'invalid game id';
  end if;

	if p_submission_id is not null then
		if not exists (
			select 1
			from public.daily_mma_game_submission
			where id = p_submission_id
				and user_id = v_user_id
		) then
			raise exception 'submission does not belong to user';
		end if;
	end if;

	-- ensure all fighter ids exist
  if exists(
    select 1
    from jsonb_array_elements(p_picks) as elem
    where not exists(
      select 1 from public.fighter f
      where f.id = (elem->>'fighter_id')::uuid
    )
  ) then
    raise exception 'one or more fighter ids invalid';
  end if;

	-- upsert submission
  insert into public.daily_mma_game_submission (id, game_id, user_id, metadata)
  values (
    coalesce(p_submission_id, gen_random_uuid()),
    p_game_id,
    v_user_id,
    jsonb_build_object(
			'name', p_name, 
			'schemaKey', 'submission-v1'
		)
  )
  on conflict (id) do update
    set metadata = excluded.metadata,
        updated_at = now()
  returning id into v_submission_id;

  -- clean existing picks
  delete from public.daily_mma_game_submission_pick
  where submission_id = v_submission_id;

  -- insert new picks
  insert into public.daily_mma_game_submission_pick (submission_id, fighter_id, metadata)
  select
    v_submission_id,
    (elem->>'fighter_id')::uuid,
    jsonb_build_object(
			'kind', elem->>'kind',
			'order', ord,
      'schemaKey', 'pick-v1'
		)
  from jsonb_array_elements(p_picks) with ordinality as elem(elem, ord);

  return v_submission_id;
end;
$$;

revoke all on function api.make_submission from public;

alter function api.make_submission owner to postgres; -- need an owner that has auth schema access
grant execute on function api.make_submission to authenticated;



--- rpc: fight page data

create or replace function api.fight_header(p_fight_id uuid)
returns table (
  id uuid,
  event_slug text,
  event_name text,
  event_date timestamptz,
	event_venue text,
	event_city text,
	event_state_or_region text,
	event_country text,
	rounds_scheduled int,
  fight_order int,
	fight_status text,
  weight_class text,
  weight_lbs numeric,
  is_title boolean,
  title_name text,
	result fight_result_enum,
  result_method text,
  result_round int,
  result_round_time interval,
  fighter_1_id uuid,
	fighter_1_slug text,
  fighter_1_name text,
	fighter_1_country text,
  fighter_1_height_in numeric,
  fighter_1_reach_in numeric,
  fighter_1_stance text,
  fighter_1_age interval,
  fighter_2_id uuid,
	fighter_2_slug text,
  fighter_2_name text,
	fighter_2_country text,
  fighter_2_height_in numeric,
  fighter_2_reach_in numeric,
  fighter_2_stance text,
  fighter_2_age interval,
  winner_fighter_id uuid,
  round_snapshots jsonb
) language sql stable as $$
  with fight_data as (
    select
      f.*,
      e.slug as event_slug,
      e.name as event_name,
      e.event_date,
			e.venue as event_venue,
			e.city as event_city,
			e.state_or_region as event_state_or_region,
			e.country as event_country
    from public.fight f
    inner join public.event e on e.id = f.event_id
    where f.id = p_fight_id
  ),
  fighter_data as (
    select
      f1.id as fighter_1_id,
			f1.slug as fighter_1_slug,
      f1.full_name as fighter_1_name,
			f1.country as fighter_1_country,
      f1.height_in as fighter_1_height_in,
      f1.reach_in as fighter_1_reach_in,
      f1.stance as fighter_1_stance,
      f1.dob as fighter_1_dob,
      f2.id as fighter_2_id,
			f2.slug as fighter_2_slug,
      f2.full_name as fighter_2_name,
			f2.country as fighter_2_country,
      f2.height_in as fighter_2_height_in,
      f2.reach_in as fighter_2_reach_in,
      f2.stance as fighter_2_stance,
      f2.dob as fighter_2_dob
    from fight_data fd
    inner join public.fighter f1 on f1.id = fd.fighter_1_id
    inner join public.fighter f2 on f2.id = fd.fighter_2_id
  ),
  round_data as (
    select
      jsonb_agg(
        jsonb_build_object(
          'round', round,
          'fighter_1_stats', fighter_1_stats,
          'fighter_2_stats', fighter_2_stats
        ) order by round
      ) as round_snapshots
    from public.fight_round_snapshot
    where fight_id = p_fight_id
  )
  select
    fd.id,
		fd.event_slug,
		fd.event_name,
		fd.event_date,
		fd.event_venue,
		fd.event_city,
		fd.event_state_or_region,
		fd.event_country,
		fd.rounds_scheduled,
		fd.fight_order,
		fd.status as fight_status,
		fd.weight_class,
		fd.weight_lbs,
		fd.is_title,
		fd.title_name,
		fd.result,
		fd.result_method,
		fd.result_round,
		fd.result_round_time,
		fid.fighter_1_id,
		fid.fighter_1_slug,
		fid.fighter_1_name,
		fid.fighter_1_country,
		fid.fighter_1_height_in,
		fid.fighter_1_reach_in,
		fid.fighter_1_stance,
		(age(fd.event_date, fid.fighter_1_dob)) as fighter_1_age,
		fid.fighter_2_id,
		fid.fighter_2_slug,
		fid.fighter_2_name,
		fid.fighter_2_country,
		fid.fighter_2_height_in,
		fid.fighter_2_reach_in,
		fid.fighter_2_stance,
    (age(fd.event_date, fid.fighter_2_dob)) as fighter_2_age,
    fd.winner_fighter_id,
    coalesce(rd.round_snapshots, '[]'::jsonb) as round_snapshots
  from fight_data fd
  inner join fighter_data fid on true
  left join round_data rd on true;
$$;

alter function api.fight_header owner to db_owner;
grant execute on function api.fight_header to anon, authenticated;
