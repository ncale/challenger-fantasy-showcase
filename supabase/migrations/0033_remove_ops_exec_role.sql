-- delete ops_exec role if it exists

revoke all on schema public from ops_exec;
revoke usage, select, update on sequence ingest_job_id_seq from ops_exec;

revoke select, insert, update on public.drain_lock from ops_exec;
revoke select, insert, update, delete on public.ingest_job from ops_exec;
revoke select, delete on public.ingest_raw from ops_exec;
revoke select on public.ingest_state from ops_exec;

drop role if exists ops_exec;
