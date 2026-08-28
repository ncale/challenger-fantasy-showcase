
-- ------------------------------------------------------------
-- Regular tables
-- ------------------------------------------------------------

create table if not exists org (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,        -- 'ufc'
  name text not null
);

create table if not exists event (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references org(id),
	slug text unique not null,
  name text not null,
  event_date timestamptz not null,  -- card local tz as utc
  tz text not null,                  -- e.g., 'america/las_angeles'
  venue text, city text, country text,
  status text not null check (status in ('scheduled','live','final')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists fighter (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name_given text, name_family text, nickname text,
  country text, stance text, height_in int, reach_in int,
  dob date, flags jsonb default '{}',
	search_priority int2 not null default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists fight (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references event(id) on delete cascade,
  red_fighter_id uuid not null references fighter(id),
  blue_fighter_id uuid not null references fighter(id),
  weight_class text, is_title boolean default false,
  rounds_scheduled int not null,
  status text not null check (status in ('scheduled','live','final')),
  result_method text, result_round int, result_time interval,
  winner_fighter_id uuid,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- snapshots from source (per round, append-only)
create table if not exists fight_stat_snapshot (
  id bigserial primary key,
  fight_id uuid not null references fight(id) on delete cascade,
  snapshot_ts timestamptz not null,
  round int not null,
  red jsonb not null,   -- e.g., { "sig": { "landed": 32, "attempted": 74, "head": 12, ... }, "ctrl_sec": 88, ... }
  blue jsonb not null,
  source_url text, source_etag text
);


