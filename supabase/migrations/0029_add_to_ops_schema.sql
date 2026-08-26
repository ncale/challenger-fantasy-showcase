
-- ops execution role for server-side functions
-- this is the role that will be used to execute the functions that are defined in the ops schema
do $$ begin 
	create role ops_exec nologin; 
exception when duplicate_object then null; end $$;

grant ops_exec to postgres;


drop function public.cleanup_old_records_dry_run(integer);
drop function public.cleanup_old_records(integer);
drop function public.ingest_enqueue(text, jsonb, integer, timestamptz);
drop function public.ingest_enqueue_many(jsonb);
drop function public.ingest_heartbeat(bigint[]);
drop function public.ingest_lease_jobs(int, int, text[]);
drop function public.ingest_mark_fail(bigint, uuid, text);
drop function public.ingest_mark_ok(bigint, uuid, jsonb);





-- add ops_exec limited permissions

grant select, insert, update on public.drain_lock to ops_exec;
grant select, insert, update, delete on public.ingest_job to ops_exec;
grant select, delete on public.ingest_raw to ops_exec;
grant select on public.ingest_state to ops_exec;
