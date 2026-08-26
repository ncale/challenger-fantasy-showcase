
-- RLS

-- rls is already enabled for public tables
-- make them consistent
drop policy if exists "Enable read access for all users" on "public"."event";
drop policy if exists "Enable read access for all users" on "public"."fight";
drop policy if exists "Enable read access for all users" on "public"."fight_round_snapshot";
drop policy if exists "Enable read access for all users" on "public"."fighter";
drop policy if exists "Enable read access to fighter_alias" on "public"."fighter_alias";
drop policy if exists "Enable read access for all users" on "public"."fighter_stats";
drop policy if exists "Enable read access for all users" on "public"."org";

-- set rls policies for each

-- available to authenticated & anon
create policy enable_read_access on "public"."event"                   for select to anon, authenticated using (true);
create policy enable_read_access on "public"."fight"                   for select to anon, authenticated using (true);
create policy enable_read_access on "public"."fight_round_snapshot"    for select to anon, authenticated using (true);
create policy enable_read_access on "public"."fighter"                 for select to anon, authenticated using (true);
create policy enable_read_access on "public"."fighter_alias"           for select to anon, authenticated using (true);
create policy enable_read_access on "public"."fighter_stats"           for select to anon, authenticated using (true);
create policy enable_read_access on "public"."org"                     for select to anon, authenticated using (true);

-- not available to anon or authenticated
-- alias
-- drain_lock
-- ingest_job
-- ingest_raw
-- ingest_state

