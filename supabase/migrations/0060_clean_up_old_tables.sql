create table if not exists daily_mma_game_draft_group (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references daily_mma_game(id) on delete cascade,
  created_at timestamptz default now(),
  completed_at timestamptz default null
);

alter table public.daily_mma_game_draft_group enable row level security;
create policy enable_read_access 
	on "public"."daily_mma_game_draft_group" 
	for select to anon, authenticated 
	using (true);

alter table daily_mma_game_submission add column draft_group_id uuid references daily_mma_game_draft_group(id) on delete cascade;
alter table daily_mma_game_submission add column position int not null default 1;
