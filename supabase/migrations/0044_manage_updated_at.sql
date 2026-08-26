-- generic function
create or replace function set_updated_at()
returns trigger 
language plpgsql
security invoker
set search_path = pg_temp, public, ops
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- attach to tables
create trigger event_updated_at
before update on "public"."event"
for each row
execute function set_updated_at();

create trigger fight_updated_at
before update on "public"."fight"
for each row
execute function set_updated_at();

create trigger fight_round_snapshot_updated_at
before update on "public"."fight_round_snapshot"
for each row
execute function set_updated_at();

create trigger fighter_updated_at
before update on "public"."fighter"
for each row
execute function set_updated_at();

create trigger fighter_stats_updated_at
before update on "public"."fighter_stats"
for each row
execute function set_updated_at();

create trigger hero_fighter_game_updated_at
before update on "public"."hero_fighter_game"
for each row
execute function set_updated_at();

create trigger hero_fighter_game_entry_updated_at
before update on "public"."hero_fighter_game_entry"
for each row
execute function set_updated_at();
