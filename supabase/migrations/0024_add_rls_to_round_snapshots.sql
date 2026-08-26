create policy "Enable read access for all users" on "public"."fight_round_snapshot" 
  for select using (true);