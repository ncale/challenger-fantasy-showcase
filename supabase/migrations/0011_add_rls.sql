-- Enable RLS
ALTER TABLE alias ENABLE ROW LEVEL SECURITY;
ALTER TABLE drain_lock ENABLE ROW LEVEL SECURITY;
ALTER TABLE fight_round_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE fighter_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingest_job ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingest_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingest_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE org ENABLE ROW LEVEL SECURITY;

-- Create new policies
create policy "Enable read access for all users" on "public"."fighter_stats" 
  for select using (true);

create policy "Enable read access for all users" on "public"."org" 
  for select using (true);

