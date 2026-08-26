-- Enable RLS on hero_fighter_game and hero_fighter_game_entry tables
alter table hero_fighter_game enable row level security;
alter table hero_fighter_game_entry enable row level security;

-- Create read-only policies for hero_fighter_game
create policy "enable_read_access"
  on "public"."hero_fighter_game"
  for select
  to anon, authenticated
  using (true);

-- Create read-only policies for hero_fighter_game_entry  
create policy "enable_read_access"
  on "public"."hero_fighter_game_entry"
  for select
  to anon, authenticated
  using (true);
