
-- set security invoker

alter function cleanup_old_records(p_days_to_keep int) security invoker;
alter function cleanup_old_records_dry_run(p_days_to_keep int) security invoker;

alter function ingest_enqueue(p_kind text, p_payload jsonb, p_priority int, p_run_after timestamptz) security invoker;
alter function ingest_enqueue_many(p_jobs jsonb) security invoker;

alter function ingest_heartbeat(p_ids bigint[]) security invoker;
alter function ingest_lease_jobs(p_limit int, p_lease_seconds int, p_kinds text[]) security invoker;

alter function ingest_mark_fail(p_id bigint, p_lease_token uuid, p_error text) security invoker;
alter function ingest_mark_ok(p_id bigint, p_lease_token uuid, p_counts jsonb) security invoker;

-- revoke execute on all functions in public schema

revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon, authenticated;

alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public revoke execute on functions from anon, authenticated;

-- set security invoker on views

alter view scheduled_events set (security_invoker = true);
