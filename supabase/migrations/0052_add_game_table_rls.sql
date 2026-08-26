alter table daily_mma_game 										enable row level security;
alter table daily_mma_game_kind 							enable row level security;
alter table daily_mma_game_submission 				enable row level security;
alter table daily_mma_game_submission_pick 		enable row level security;
alter table daily_mma_game_submission_score 	enable row level security;

create policy enable_read_access on "public"."daily_mma_game"                   for select to anon, authenticated using (true);
create policy enable_read_access on "public"."daily_mma_game_kind"              for select to anon, authenticated using (true);
create policy enable_read_access on "public"."daily_mma_game_submission"        for select to anon, authenticated using (true);
create policy enable_read_access on "public"."daily_mma_game_submission_pick"   for select to anon, authenticated using (true);
create policy enable_read_access on "public"."daily_mma_game_submission_score"  for select to anon, authenticated using (true);
