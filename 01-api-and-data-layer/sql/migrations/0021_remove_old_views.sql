-- remove old views that have been replaced by api.* functions
drop view if exists public.event_page_query;
drop view if exists public.fighter_page_query;
drop view if exists public.fight_page_query;
