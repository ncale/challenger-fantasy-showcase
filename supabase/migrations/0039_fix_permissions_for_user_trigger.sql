alter table public.user_profile owner to db_owner;
alter table public.user_config owner to db_owner;

create or replace function ops.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_temp, public, ops
as $$
begin
  insert into public.user_profile (user_id, username)
  values (new.id, new.raw_user_meta_data->>'username');

  insert into public.user_config (user_id)
  values (new.id);

  return new;
end;
$$;

alter function ops.handle_new_user owner to db_owner;