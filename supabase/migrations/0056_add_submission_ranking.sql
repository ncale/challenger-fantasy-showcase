-- Rename the table from daily_mma_game_submission_score to daily_mma_game_submission_live_score
alter table public.daily_mma_game_submission_score
  rename to daily_mma_game_submission_live_score;

-- 1. create table
create table public.daily_mma_game_submission_ranking (
  submission_id uuid primary key references public.daily_mma_game_submission(id) on delete cascade,
  game_id uuid not null references public.daily_mma_game(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score numeric not null,
  place int not null,
  payout numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. index for lookups
create index daily_mma_game_submission_rankings_game_id_idx on daily_mma_game_submission_ranking(game_id);
create index daily_mma_game_submission_rankings_user_id_idx on daily_mma_game_submission_ranking(user_id);
