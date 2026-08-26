-- update policies so users can only update their profile and config

-- only owner can update their public profile
drop policy if exists "enable_manage_access_for_authenticated_users" on public.user_profile;

create policy "enable_self_update_access_for_authenticated_users"
  on public.user_profile
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);



-- only owner can read their private config
drop policy if exists "enable_read_access_for_authenticated_users" on public.user_config;

create policy "enable_self_read_access_for_authenticated_users"
  on public.user_config
  for select
  using (auth.uid() = user_id);

-- only owner can update their private config
drop policy if exists "enable_manage_access_for_authenticated_users" on public.user_config;

create policy "enable_self_update_access_for_authenticated_users"
  on public.user_config
  for update
  using (auth.uid() = user_id)
	with check (auth.uid() = user_id);
