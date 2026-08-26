-- rpc: event header (tiny, cacheable)
create or replace function api.event_header(p_slug text)
returns table (
  id uuid,
  slug text,
  name text,
  event_date timestamptz,
  venue text,
  city text,
  state_or_region text,
  country text,
  status text,
  fight_count int4,
  updated_at timestamptz
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
with e as (
  select 
    id, slug, name, event_date, venue, city, state_or_region, country, status, updated_at
  from event
  where slug = p_slug
  limit 1
),
fc as (
  select count(*) as fight_count
  from fight
  where event_id = (select id from e)
)
select 
  e.id, e.slug, e.name, e.event_date, e.venue, e.city, e.state_or_region, e.country, e.status,
  fc.fight_count,
  e.updated_at
from e, fc;
$$;

-- rpc: event fights list
create or replace function api.event_fights(
  p_slug text,
  p_limit int default 50
)
returns table (
  id uuid,
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
  fighter_1_slug text,
  fighter_2_name text,
  fighter_2_slug text
)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
with e as (
  select id
  from event
  where slug = p_slug
  limit 1
),
base as (
  select
    fi.id,
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
    a.slug as fighter_1_slug,
    b.full_name as fighter_2_name,
    b.slug as fighter_2_slug
  from fight fi
  join fighter a on a.id = fi.fighter_1_id
  join fighter b on b.id = fi.fighter_2_id
  where fi.event_id = (select id from e)
  order by fi.fight_order asc
)
select base.* from base limit p_limit;
$$;

-- grant execute permissions
grant execute on function api.event_header(text) to anon, authenticated;
grant execute on function api.event_fights(text, int) to anon, authenticated;
