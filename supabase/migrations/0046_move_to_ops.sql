-- drop old triggers
drop trigger event_updated_at on public.event;
drop trigger fight_updated_at on public.fight;
drop trigger fight_round_snapshot_updated_at on public.fight_round_snapshot;
drop trigger fighter_updated_at on public.fighter;
drop trigger fighter_stats_updated_at on public.fighter_stats;
drop trigger hero_fighter_game_updated_at on public.hero_fighter_game;
drop trigger hero_fighter_game_entry_updated_at on public.hero_fighter_game_entry;

-- move function to ops schema
alter function api.set_updated_at set schema ops;

-- recreate triggers with new schema reference
create trigger event_updated_at
before update on public.event
for each row
execute function ops.set_updated_at();

create trigger fight_updated_at
before update on public.fight
for each row
execute function ops.set_updated_at();

create trigger fight_round_snapshot_updated_at
before update on public.fight_round_snapshot
for each row
execute function ops.set_updated_at();

create trigger fighter_updated_at
before update on public.fighter
for each row
execute function ops.set_updated_at();

create trigger fighter_stats_updated_at
before update on public.fighter_stats
for each row
execute function ops.set_updated_at();

create trigger hero_fighter_game_updated_at
before update on public.hero_fighter_game
for each row
execute function ops.set_updated_at();

create trigger hero_fighter_game_entry_updated_at
before update on public.hero_fighter_game_entry
for each row
execute function ops.set_updated_at();
