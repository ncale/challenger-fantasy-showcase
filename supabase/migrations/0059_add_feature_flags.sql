create table if not exists feature_flag (
  key text primary key,
	enabled boolean not null,
	rules jsonb default '{}'::jsonb not null
);

alter table feature_flag enable row level security;
create policy enable_read_access on "public"."feature_flag" for select to anon, authenticated using (true);
