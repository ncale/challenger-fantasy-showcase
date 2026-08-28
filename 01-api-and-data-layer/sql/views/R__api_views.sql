


create or replace view api.stats_both_fighters_view 
with (security_invoker = true, security_barrier = true)
as
with base_query as (
	select 
		-- Round snapshot data (all columns)
		frs.fighter_1_stats,
		frs.fighter_2_stats,
		-- Fighter 1 details
		f1.id as fighter_1_id,
		f1.slug as fighter_1_slug,
		f1.full_name as fighter_1_name,
		-- Fighter 2 details  
		f2.id as fighter_2_id,
		f2.slug as fighter_2_slug,
		f2.full_name as fighter_2_name,
		-- Event details
		e.id as event_id,
		e.slug as event_slug,
		e.name as event_name,
		e.event_date as event_date,
		-- Fight details
		f.id as fight_id,
		f.weight_class,
		f.is_title,
		f.rounds_scheduled,
		f.result,
		f.result_method,
		case 
      when frs.round < f.result_round THEN 300
      when frs.round = f.result_round and f.result_round_time is not null then 
        extract(epoch from f.result_round_time)
      when frs.round = f.result_round and f.result_round_time is null then 300
      else 0
    end as round_seconds,
		f.result_round,
		f.result_round_time,
		f.winner_fighter_id,
		f.referee
	from "public"."fight_round_snapshot" frs
	join "public"."fight" f on frs.fight_id = f.id
	join "public"."event" e on f.event_id = e.id
	join "public"."fighter" f1 on f.fighter_1_id = f1.id
	join "public"."fighter" f2 on f.fighter_2_id = f2.id
	where f.status = 'final'
),
agg as (
  select 
    "api"."aggregate_fighter_stats_jsonb"(array_agg(bq.fighter_1_stats)) as fighter_1_stats,
    "api"."aggregate_fighter_stats_jsonb"(array_agg(bq.fighter_2_stats)) as fighter_2_stats,
    fighter_1_id,
    fighter_1_slug,
    fighter_1_name,
    fighter_2_id,
    fighter_2_slug,
    fighter_2_name,
    event_id,
    event_slug,
    event_name,
    event_date,
    fight_id,
    weight_class,
    is_title,
    rounds_scheduled,
    result,
    result_method,
    sum(round_seconds) as total_seconds,
    result_round,
    result_round_time,
    winner_fighter_id,
    referee
  from base_query bq
  group by 
    bq.fight_id,
    fighter_1_id,
    fighter_1_slug,
    fighter_1_name,
    fighter_2_id,
    fighter_2_slug,
    fighter_2_name,
    event_id,
    event_slug,
    event_name,
    event_date,
    fight_id,
    weight_class,
    is_title,
    rounds_scheduled,
    result,
    result_method,
    result_round,
    result_round_time,
    winner_fighter_id,
    referee
)
select * from agg;

alter view api.stats_both_fighters_view owner to postgres;
grant select on api.stats_both_fighters_view to anon, authenticated;



create or replace view api.stats_single_fighter_view
with (security_invoker = true, security_barrier = true)
as
with fighter_1_perspective as (
	select 
		-- Main fighter (fighter 1)
		fighter_1_id as fighter_id,
		fighter_1_slug as fighter_slug,
		fighter_1_name as fighter_name,
		-- Offensive stats (fighter 1's stats)
		fighter_1_stats as offensive_stats,
		-- Defensive stats (fighter 2's stats - what fighter 1 faced)
		fighter_2_stats as defensive_stats,
		-- Opponent details
		fighter_2_id as opponent_id,
		fighter_2_slug as opponent_slug,
		fighter_2_name as opponent_name,
		-- Event details
		event_id,
		event_slug,
		event_name,
		event_date,
		-- Fight details
		fight_id,
		weight_class,
		is_title,
		rounds_scheduled,
		(
			case 
				when result = 'f1' then 'winner'
				when result = 'f2' then 'loser'
				when result = 'draw' then 'draw'
				when result = 'no-contest' then 'no-contest'
			end
		)::single_fighter_fight_result_enum as result,
		result_method,
		total_seconds,
		result_round,
		result_round_time,
		winner_fighter_id,
		referee
	from "api"."stats_both_fighters_view"
),
fighter_2_perspective as (
	select 
		-- Main fighter (fighter 2)
		fighter_2_id as fighter_id,
		fighter_2_slug as fighter_slug,
		fighter_2_name as fighter_name,
		-- Offensive stats (fighter 2's stats)
		fighter_2_stats as offensive_stats,
		-- Defensive stats (fighter 1's stats - what fighter 2 faced)
		fighter_1_stats as defensive_stats,
		-- Opponent details
		fighter_1_id as opponent_id,
		fighter_1_slug as opponent_slug,
		fighter_1_name as opponent_name,
		-- Event details
		event_id,
		event_slug,
		event_name,
		event_date,
		-- Fight details
		fight_id,
		weight_class,
		is_title,
		rounds_scheduled,
		(
			case 
				when result = 'f2' then 'winner'
				when result = 'f1' then 'loser'
				when result = 'draw' then 'draw'
				when result = 'no-contest' then 'no-contest'
			end
		)::single_fighter_fight_result_enum as result,
		result_method,
		total_seconds,
		result_round,
		result_round_time,
		winner_fighter_id,
		referee
	from "api"."stats_both_fighters_view"
),
base_query as (
	select * from fighter_1_perspective
	union all
	select * from fighter_2_perspective
)
select * from base_query;

alter view api.stats_single_fighter_view owner to postgres;
grant select on api.stats_single_fighter_view to anon, authenticated;



-- @deprecated - this isn't used anymore.
-- fighter past 5 year stats view 
create or replace view api.fighter_past_5_year_stats_view
with (security_invoker = true, security_barrier = true)
as
with agg as (
  select 
    fr.fighter_id,
    fr.fighter_slug,
    fr.fighter_name,
    sum(fr.total_seconds) as total_seconds,
    count(*) as total_fights,
    "api"."aggregate_fighter_stats_jsonb"(array_agg(fr.offensive_stats)) as offensive_stats,
    "api"."aggregate_fighter_stats_jsonb"(array_agg(fr.defensive_stats)) as defensive_stats,
    count(*) filter (where fr.result = 'winner') as wins,
    count(*) filter (where fr.result = 'loser') as losses,
    count(*) filter (where fr.result = 'draw') as draws,
    count(*) filter (where fr.result = 'no-contest') as no_contests
  from api.stats_single_fighter_view fr
	where fr.event_date >= (CURRENT_DATE - interval '5 years')
  group by fr.fighter_id, fr.fighter_slug, fr.fighter_name
)
select * from agg;

alter view api.fighter_past_5_year_stats_view owner to postgres;
grant select on api.fighter_past_5_year_stats_view to anon, authenticated;



-- fight pre-fight stats view
create or replace view api.fight_pre_fight_stats_view
with (security_invoker = true, security_barrier = true)
as
with fight as (
  select 
    f.id as id,
		f.slug as slug,
    f.fighter_1_id as fighter_1_id,
    f.fighter_2_id as fighter_2_id,
    e.event_date as event_date
  from "public"."fight" f
  join "public"."event" e on f.event_id = e.id
),
fighter_1_agg as (
  select 
    fight.id as fight_id,
    stats.fighter_id as fighter_1_id,
    sum(stats.total_seconds) as fighter_1_total_seconds,
    count(*) as fighter_1_total_rounds,
    max(stats.fighter_name) as fighter_1_name,
    "api"."aggregate_fighter_stats_jsonb"(array_agg(stats.offensive_stats)) as fighter_1_offensive_stats,
		"api"."aggregate_fighter_stats_jsonb"(array_agg(stats.defensive_stats)) as fighter_1_defensive_stats
  from fight
  left join "api"."stats_single_fighter_view" stats on stats.fighter_id = fight.fighter_1_id
    and stats.fight_id != fight.id
    and stats.event_date <= fight.event_date 
    and stats.event_date >= (fight.event_date - interval '5 years')
  group by fight.id, stats.fighter_id
),
fighter_2_agg as (
  select 
    fight.id as fight_id,
    stats.fighter_id as fighter_2_id,
    sum(stats.total_seconds) as fighter_2_total_seconds,
    count(*) as fighter_2_total_rounds,
    max(stats.fighter_name) as fighter_2_name,
    "api"."aggregate_fighter_stats_jsonb"(array_agg(stats.offensive_stats)) as fighter_2_offensive_stats,
    "api"."aggregate_fighter_stats_jsonb"(array_agg(stats.defensive_stats)) as fighter_2_defensive_stats
  from fight
  left join "api"."stats_single_fighter_view" stats on stats.fighter_id = fight.fighter_2_id
    and stats.fight_id != fight.id
    and stats.event_date <= fight.event_date 
    and stats.event_date >= (fight.event_date - interval '5 years')
  group by fight.id, stats.fighter_id
),
agg as (
  select
    fight.id,
		fight.slug,
    fight.fighter_1_id,
    f1.fighter_1_name,
    f1.fighter_1_offensive_stats,
    f1.fighter_1_defensive_stats,
    coalesce(f1.fighter_1_total_seconds, 0) as fighter_1_total_seconds,
    coalesce(f1.fighter_1_total_rounds, 0) as fighter_1_total_rounds,
    fight.fighter_2_id,
    f2.fighter_2_name,
    f2.fighter_2_offensive_stats,
    f2.fighter_2_defensive_stats,
    coalesce(f2.fighter_2_total_seconds, 0) as fighter_2_total_seconds,
    coalesce(f2.fighter_2_total_rounds, 0) as fighter_2_total_rounds
  from fight
	join fighter_1_agg f1 on fight.id = f1.fight_id
  join fighter_2_agg f2 on fight.id = f2.fight_id
)
select * from agg;

alter view api.fight_pre_fight_stats_view owner to postgres;
grant select on api.fight_pre_fight_stats_view to anon, authenticated;



-- event header view
create or replace view api.event_header_view
with (security_invoker = true, security_barrier = true)
as
with e as (
  select *
  from public.event
),
fc as (
  select count(*) as fight_count
  from public.fight
)
select 
  e.id, e.slug, e.name, e.event_date, e.venue, e.city, e.state_or_region, e.country, e.status,
  fc.fight_count,
  e.updated_at
from e, fc;

alter view api.event_header_view owner to postgres;
grant select on api.event_header_view to anon, authenticated;



-- user profile view
create or replace view api.user_profile_view
with (security_invoker = false, security_barrier = true)
as
select 
  up.*,
  u.created_at as since
from public.user_profile up
join public.users u on up.user_id = u.user_id;

alter view api.user_profile_view owner to postgres;
grant select on api.user_profile_view to anon, authenticated;



-- user account view
CREATE OR REPLACE VIEW api.user_account_view
WITH (security_invoker = true, security_barrier = true)
AS 
SELECT
  uc.user_id,
  uc.user_number,
  uc.referral_code,
  uc.referred_by,
  uc.referral_bonus,
  uc.status,
  GREATEST(1, uc.user_number - uc.referral_bonus) AS effective_waitlist_position,
  up.username,
  up.avatar_url
FROM public.user_account uc
JOIN public.user_profile up ON uc.user_id = up.user_id;

alter view api.user_account_view owner to postgres;
grant select on api.user_account_view to authenticated;



-- daily mma game fights view
create or replace view api.event_fights_view
with (security_invoker = true, security_barrier = true)
as
with fights as (
  select
    e.id as event_id,
    f.id as fight_id,
    f.slug as fight_slug,
		f.status,
    f.fight_order,
		f.weight_class,
		f.weight_class_key,
    f.fighter_1_id,
		f1.full_name as fighter_1_name,
		f1.slug as fighter_1_slug,
		fr.fighter_1_stats,
    f.fighter_2_id,
		f2.full_name as fighter_2_name,
		f2.slug as fighter_2_slug,
		fr.fighter_2_stats,
		fr.result,
		fr.method,
		fr.round as result_round,
		fr.round_time as result_round_time
	from public.event e
  join public.fight f on f.event_id = e.id
	join public.fighter f1 on f1.id = f.fighter_1_id
	join public.fighter f2 on f2.id = f.fighter_2_id
	left join public.fight_result fr on fr.fight_id = f.id
)
select * from fights;

alter view api.event_fights_view owner to postgres;
grant select on api.event_fights_view to anon, authenticated;



-- fighters view: gets all fighters in an event, even for cancelled fights
create or replace view api.event_fighters_view
with (security_invoker = true, security_barrier = true)
as
select
  e.id as event_id,
  ftr.id as fighter_id,
  ftr.full_name as fighter_name,
  ftr.slug as fighter_slug
from public.event e
join public.fight fi on fi.event_id = e.id
join public.fighter ftr
  on ftr.id = fi.fighter_1_id
    or ftr.id = fi.fighter_2_id
group by e.id, ftr.id, ftr.full_name;

alter view api.event_fighters_view owner to postgres;
grant select on api.event_fighters_view to anon, authenticated;



-- daily mma game submissions view
create or replace view api.daily_mma_game_submissions_view
with (security_invoker = true, security_barrier = true)
as
with submissions as (
  select
    dms.id,
    dms.game_id,
    dms.user_id,
    dms.metadata as submission_metadata,
		dms.draft_group_id,
		dm.config as game_config,
		dm.metadata as game_metadata,
		e.id as event_id,
		e.slug as event_slug,
		e.name as event_name,
		e.short_name as event_short_name,
		e.status as event_status,
		e.event_date,
		e.start_time,
		e.prelims_start_time,
		e.main_card_start_time,
		e.venue,
		e.city,
		e.state_or_region,
		e.country,
		dmss.score,
		dmss.position,
		dmss.payout,
		dmss.scoring_status,
		dmss.breakdown
  from public.daily_mma_game_submission dms
	left join public.daily_mma_game dm on dm.id = dms.game_id
	left join public.event e on e.id = dm.event_id
  left join public.daily_mma_game_submission_score dmss on dms.id = dmss.submission_id
)
select *
from submissions;

alter view api.daily_mma_game_submissions_view owner to postgres;
grant select on api.daily_mma_game_submissions_view to anon, authenticated;




-- daily mma game submission picks view
create or replace view api.daily_mma_game_submission_picks_view
with (security_invoker = true, security_barrier = true)
as
with picks as (
	select 
		s.game_id,
		dmspk.submission_id,
		dmspk.fighter_id,
		dmspk.metadata as pick_metadata
	from public.daily_mma_game_submission s
	join public.daily_mma_game_submission_pick dmspk on dmspk.submission_id = s.id
)
select * from picks;

alter view api.daily_mma_game_submission_picks_view owner to postgres;
grant select on api.daily_mma_game_submission_picks_view to anon, authenticated;



-- daily mma game submission rankings view
create or replace view api.draft_group_submission_view
with (security_invoker = true, security_barrier = true)
as
select 
	submission.*,
  scoring.score,
  scoring.position as scoring_position,
  scoring.payout,
  scoring.breakdown,
  scoring.scoring_status,
  up.username,
	up.avatar_url
from public.daily_mma_game_submission submission
left join public.daily_mma_game_submission_score scoring on scoring.submission_id = submission.id
left join public.user_profile up on submission.user_id = up.user_id;

alter view api.draft_group_submission_view owner to postgres;
grant select on api.draft_group_submission_view to authenticated;



-- user submission events view: aggregates submissions per user per event
create or replace view api.user_submission_events_view
with (security_invoker = true, security_barrier = true)
as
select
  s.user_id,
  e.id         as event_id,
  e.name       as event_name,
  e.short_name as event_short_name,
  e.slug       as event_slug,
  e.event_date,
  e.status     as event_status,
  count(s.id)  as submission_count
from public.daily_mma_game_submission s
join public.daily_mma_game g on g.id = s.game_id
join public.event e on e.id = g.event_id
group by
  s.user_id,
  e.id,
  e.name,
  e.short_name,
  e.slug,
  e.event_date,
  e.status;

alter view api.user_submission_events_view owner to postgres;
grant select on api.user_submission_events_view to service_role;



-- daily mma game submission rankings view
create or replace view api.daily_mma_game_submission_rankings_view
with (security_invoker = true, security_barrier = true)
as
select 
  dmsr.*,
  up.username,
	up.avatar_url
from public.daily_mma_game_submission_ranking dmsr
join public.user_profile up on dmsr.user_id = up.user_id;

alter view api.daily_mma_game_submission_rankings_view owner to postgres;
grant select on api.daily_mma_game_submission_rankings_view to anon, authenticated;