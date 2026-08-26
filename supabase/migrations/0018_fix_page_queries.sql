
-- create a dedicated contract layer
create schema if not exists api;

comment on schema api is
  'frontend-facing contract: rpcs/views only. base tables are not directly exposed.';
comment on schema public is
  'base tables for the public api';


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
security definer
stable
set search_path = public, pg_temp
as $$
with f as (
  select 
    id, slug, full_name, nickname, country, stance,
    height_in, reach_in, weight_lbs, dob, flags, 
    search_priority, updated_at
  from fighter
  where slug = p_slug
  limit 1
),
s as (
  -- lightweight, precomputed stats table or view is preferred.
  select 
    fighter_id, wins, losses, draws, no_contests, sig_strikes_landed_per_minute, striking_accuracy,
    sig_strikes_absorbed_per_minute, striking_defense, takedown_average, takedown_accuracy,
    takedown_defense, submission_average
  from fighter_stats
  where fighter_id = (select id from f)
)
select f.*, s.*
from f join s on f.id = s.fighter_id;
$$;

-- rpc: fight overview list
create or replace function api.fighter_fights(
  p_slug   text,
  p_limit  int default 15
)
returns table (
	id uuid,
	event_id uuid,
	event_name text,
	event_slug text,
	event_date timestamptz,
	fight_order int4,
	status text,
	weight_class text,
	is_title boolean,
	rounds_scheduled int4,
	result_method text,
	result_round int4,
	result_round_time text,
	time_format text,
	title_name text,
	details text,
	referee text,
	weight_lbs int4,
	winner_fighter_id uuid,
	fighter_1_id uuid,
	fighter_2_id uuid,
	fighter_1_name text,
	fighter_2_name text,
	is_winner boolean
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
with f as (
  select id as fighter_id
  from fighter
  where slug = p_slug
  limit 1
),
base as (
  select
    fi.id,
    fi.event_id,
    ev.name  as event_name,
    ev.slug  as event_slug,
    ev.event_date,
    fi.fight_order,
    fi.status,
    fi.weight_class,
    fi.is_title,
    fi.rounds_scheduled,
    fi.result_method,
    fi.result_round,
    fi.result_round_time,
    fi.time_format,
    fi.title_name,
    fi.details,
    fi.referee,
    fi.weight_lbs,
    fi.winner_fighter_id,
    fi.fighter_1_id,
    fi.fighter_2_id,
    a.full_name as fighter_1_name,
    b.full_name as fighter_2_name,
    (fi.winner_fighter_id is not null and fi.winner_fighter_id = (select fighter_id from f)) as is_winner
  from fight fi
  join event   ev on ev.id = fi.event_id
  join fighter a  on a.id  = fi.fighter_1_id
  join fighter b  on b.id  = fi.fighter_2_id
  join f          on fi.fighter_1_id = f.fighter_id or fi.fighter_2_id = f.fighter_id
	order by ev.event_date desc
)
select base.* from base limit p_limit;
$$;
