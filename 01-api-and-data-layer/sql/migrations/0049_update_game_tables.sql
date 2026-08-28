drop view api.hero_fighter_fighters_breakdown_view;
drop view api.hero_fighter_game_entries_view;
drop view api.hero_fighter_game_view;
drop table hero_fighter_game_entry;
drop table hero_fighter_game;



create table daily_mma_game_kind (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  default_config jsonb not null default '{}'::jsonb,  -- holds default settings, e.g. draft_size, modifiers, etc.
  ruleset jsonb not null                             -- scoring logic, key structure defined by your code
);

create table daily_mma_game (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references event(id) on delete cascade,
  kind_id uuid not null references daily_mma_game_kind(id),
  name text,
  config jsonb not null default '{}'::jsonb,          -- merged with daily_mma_game_kind.default_config
  submission_cap int not null check (submission_cap > 0),
  entry_fee numeric(10,2) default 0,
  created_at timestamptz default now()
);

create table daily_mma_game_submission (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references daily_mma_game(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,          -- per-submission metadata (e.g. hero boost, special picks)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table daily_mma_game_submission_pick (
  submission_id uuid not null references daily_mma_game_submission(id) on delete cascade,
  fighter_id uuid not null references fighter(id),
  metadata jsonb default '{}'::jsonb,                 -- e.g. hero = true, multiplier = 2x, etc.
  primary key (submission_id, fighter_id)
);

create table daily_mma_game_submission_score (
  submission_id uuid primary key references daily_mma_game_submission(id) on delete cascade,
  total_score numeric not null default 0,
  breakdown jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
