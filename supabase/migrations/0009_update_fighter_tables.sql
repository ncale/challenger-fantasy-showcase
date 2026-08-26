
alter table event add column state_or_region text;

alter table fighter
  add column full_name text,
  add column weight_lbs int,
  drop column name_given,
  drop column name_family;

create table if not exists fighter_stats (
  fighter_id uuid primary key references fighter(id) on delete cascade,
  wins int not null default 0,
  losses int not null default 0,
  draws int not null default 0,
	no_contests int not null default 0,
  sig_strikes_landed_per_minute numeric,
	striking_accuracy numeric,
	sig_strikes_absorbed_per_minute numeric,
	striking_defense numeric,
	takedown_average numeric,
	takedown_accuracy numeric,
	takedown_defense numeric,
	submission_average numeric,
	created_at timestamptz default now(), updated_at timestamptz default now()
);

alter table fight
  drop column red_fighter_id,
  drop column blue_fighter_id,
  add column fighter_1_id uuid not null references fighter(id),
  add column fighter_2_id uuid not null references fighter(id),
  add column weight_lbs int,
  add column title_name text,
  add column time_format text,
  drop column result_time,
  add column result_round_time interval,
  add column details text,
  add column referee text;

drop table if exists fight_stat_snapshot;

create table if not exists fight_round_snapshot (
  id bigserial primary key,
  fight_id uuid not null references fight(id) on delete cascade,
  round int not null,
  fighter_1_stats jsonb not null,
  fighter_2_stats jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

