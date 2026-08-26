create extension if not exists pg_trgm;
create extension if not exists unaccent;


-- normalized aliases (fast + flexible)
create table if not exists fighter_alias (
  fighter_id uuid not null references fighter(id) on delete cascade,
  alias text not null,
  primary key (fighter_id, alias)
);

alter table fighter_alias enable row level security;

create policy "Enable read access to fighter_alias"
  on fighter_alias
  for select
  to authenticated, anon
  using (true);


-- search materialization: combine name, nickname, aliases → searchable text + tsvector
-- view gives you a single surface to query
create materialized view if not exists fighter_search_mv as
select
  f.id as fighter_id,
  f.full_name,
  f.nickname,
  f.search_priority,
  coalesce(
    unaccent(trim(f.full_name)) || ' ' ||
    unaccent(trim(coalesce(f.nickname,''))) || ' ' ||
    unaccent(trim(coalesce(string_agg(a.alias, ' '), '')))
  , '')                                   as search_text,
  to_tsvector('simple',
    coalesce(
      unaccent(trim(f.full_name)) || ' ' ||
      unaccent(trim(coalesce(f.nickname,''))) || ' ' ||
      unaccent(trim(coalesce(string_agg(a.alias, ' '), '')))
    , '')
  )                                        as search_vec
from fighter f
left join fighter_alias a on f.id = a.fighter_id
group by f.id;


-- indexes for both prefix + fuzzy + full-text

create unique index if not exists fighter_search_mv_pk on fighter_search_mv (fighter_id);

-- trigram on search_text for ilike / similarity
create index if not exists fighter_search_mv_text_trgm
  on fighter_search_mv using gin (search_text gin_trgm_ops);

-- full-text index for tsquery ranking
create index if not exists fighter_search_mv_vec_gin
  on fighter_search_mv using gin (search_vec);






create or replace function search_fighters(q text, lim int default 10)
returns table(fighter_id uuid, full_name text, nickname text, search_priority int, rank numeric)
language sql stable
security invoker as $$
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
  fighter_search_mv s, norm
where
  s.search_text ilike (select q || '%')               -- fast prefix
  or s.search_text % (select q)                       -- fuzzy via trigrams
  or s.search_vec @@ plainto_tsquery('simple', (select q)) -- full-text match
order by rank desc
limit greatest(1, lim);
$$;
