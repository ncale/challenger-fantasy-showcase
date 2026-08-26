-- ------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------

-- Enable RLS on core tables
alter table event enable row level security;
alter table fighter enable row level security;
alter table fight enable row level security;

-- Create new policies
create policy "Enable read access for all users" on "public"."event" 
  for select using (true);

create policy "Enable read access for all users" on "public"."fighter" 
  for select using (true);

create policy "Enable read access for all users" on "public"."fight" 
  for select using (true);


