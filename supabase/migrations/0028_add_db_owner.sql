-- CREATE ROLES & SCHEMAS

create schema if not exists ops;
create schema if not exists reporting;

-- owner role for infra
do $$ begin
  create role db_owner nologin;
exception when duplicate_object then null; end $$;

grant db_owner to postgres;

-- BASE SCHEMA OWNERSHIP

alter schema public     owner to db_owner;
alter schema api        owner to db_owner;
alter schema ops        owner to db_owner;
alter schema reporting  owner to db_owner;

grant usage, create on schema public, api, ops, reporting to postgres;










-- TABLE, VIEW, FUNCTION, & MATVIEW OWNERSHIP, LOCATION, & SECURITY

-- api functions (invoker UNLESS PERFORMING A WRITE; owned by db_owner)

alter function api.event_fights(p_slug text, p_limit int) security invoker;
alter function api.event_fights(p_slug text, p_limit int) owner to db_owner;

alter function api.event_header(p_slug text) security invoker;
alter function api.event_header(p_slug text) owner to db_owner;

alter function api.fight_header(p_fight_id uuid) security invoker;
alter function api.fight_header(p_fight_id uuid) owner to db_owner;

alter function api.fighter_aggregated_stats_by_years(p_fighter_slug text, p_years_back numeric) security invoker;
alter function api.fighter_aggregated_stats_by_years(p_fighter_slug text, p_years_back numeric) owner to db_owner;

alter function api.fighter_fights(p_slug text, p_limit int) security invoker;
alter function api.fighter_fights(p_slug text, p_limit int) owner to db_owner;

alter function api.fighter_header_and_stats(p_slug text) security invoker;
alter function api.fighter_header_and_stats(p_slug text) owner to db_owner;

alter function api.fighter_round_stats_by_years(p_fighter_slug text, p_years_back numeric) security invoker;
alter function api.fighter_round_stats_by_years(p_fighter_slug text, p_years_back numeric) owner to db_owner;


-- public functions that should be in api

alter function public.aggregate_fighter_stats_jsonb(stats_array jsonb[]) set schema api;
alter function api.aggregate_fighter_stats_jsonb(stats_array jsonb[]) security invoker;
alter function api.aggregate_fighter_stats_jsonb(stats_array jsonb[]) owner to db_owner;

alter function public.search_fighters(q text, lim int) set schema api;
alter function api.search_fighters(q text, lim int) security invoker;
alter function api.search_fighters(q text, lim int) owner to db_owner;


-- public tables

alter table public.alias owner to db_owner;
alter table public.event owner to db_owner;
alter table public.fight owner to db_owner;
alter table public.fight_round_snapshot owner to db_owner;
alter table public.fighter owner to db_owner;
alter table public.fighter_alias owner to db_owner;
alter table public.fighter_stats owner to db_owner;
alter table public.org owner to db_owner;

alter table public.drain_lock owner to db_owner;
alter table public.ingest_job owner to db_owner;
alter table public.ingest_raw owner to db_owner;
alter table public.ingest_state owner to db_owner;

-- public matviews
alter materialized view public.fighter_search_mv owner to db_owner;

-- api views
alter view public.fighter_round_stats_view set schema api;
alter view api.fighter_round_stats_view set (security_invoker = true, security_barrier = true);
alter view api.fighter_round_stats_view owner to db_owner;

alter view public.scheduled_events set schema api;
alter view api.scheduled_events set (security_invoker = true, security_barrier = true);
alter view api.scheduled_events owner to db_owner;


