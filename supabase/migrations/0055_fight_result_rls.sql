-- Enable Row Level Security (RLS) on public.fight_result and add read-only policies

alter table public.fight_result enable row level security;
create policy enable_read_access 
	on "public"."fight_result" 
	for select to anon, authenticated 
	using (true);
