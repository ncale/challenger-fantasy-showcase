-- Enable Row Level Security (RLS) and add read-only policies

alter table public.daily_mma_game_submission_ranking enable row level security;
create policy enable_read_access 
	on "public"."daily_mma_game_submission_ranking" 
	for select to anon, authenticated 
	using (true);

-- Trigger to update fight stats when fight is finalized
create or replace function ops.trigger_update_fight_stats()
returns trigger
language plpgsql
security definer
set search_path = pg_temp, public, ops
as $$
begin
  if new.status = 'final' and old.status is distinct from 'final' then
    perform ops.add_stats_to_fight_result(new.id);
  end if;
  return new;
end;
$$;

create trigger fight_finalize_update_stats
after update on public.fight
for each row
when (new.status = 'final' and old.status is distinct from 'final')
execute function ops.trigger_update_fight_stats();
