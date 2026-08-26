
-- Add case-insensitive unique index on username
alter table public.user_profile
drop constraint if exists user_profile_username_key;

alter table public.user_profile
alter column username drop not null;

create unique index user_profile_username_ci_idx on public.user_profile (lower(username)) where username is not null;



-- Add trigger function to create profile + config after user insert
create or replace function ops.handle_new_user()
returns trigger
language plpgsql
security invoker
set search_path = pg_temp, public
as $$
begin
  insert into public.user_profile (user_id)
  values (new.id);

  insert into public.user_config (user_id)
  values (new.id);

  return new;
end;
$$;

alter function ops.handle_new_user owner to db_owner;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure ops.handle_new_user();
