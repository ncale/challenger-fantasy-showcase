create table public.user_profile (
  user_id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_url text
);

alter table public.user_profile enable row level security;

-- PUBLIC USER PROFILE POLICIES
-- anyone (including anon) can read usernames and avatars
create policy "enable_read_access"
  on public.user_profile
  for select
  using (true);

-- only owner can insert/update/delete their own public profile
create policy "enable_manage_access_for_authenticated_users"
  on public.user_profile
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);







create table public.user_config (
  user_id uuid primary key references auth.users on delete cascade,
  config jsonb default '{}'::jsonb
);

alter table public.user_config enable row level security;

-- PRIVATE USER CONFIG POLICIES
-- only owner can read/write their own private profile
create policy "enable_read_access_for_authenticated_users"
  on public.user_config
  for select
  using (auth.uid() = user_id);

create policy "enable_manage_access_for_authenticated_users"
  on public.user_config
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
