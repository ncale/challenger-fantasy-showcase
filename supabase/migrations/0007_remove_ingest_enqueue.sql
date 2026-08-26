-- DEDUPE JOBS

-- Reset ingest_job payload column so we can use it for deduping
alter table ingest_job alter column payload set default '{}'::jsonb;
update ingest_job set payload = '{}'::jsonb where payload is null;
alter table ingest_job alter column payload set not null;

-- Drop the unique index on kind and payload so we can use it for deduping
drop index if exists ingest_job_kind_payload_unique;
create unique index ingest_job_kind_payload_unique
  on ingest_job (kind, payload)
  where status in ('queued','running');


-- ENQUEUE HELPERS (single + batch), both perform atomic upserts

-- single-row enqueue (updated to default '{}'::jsonb)
create or replace function ingest_enqueue(
  p_kind text,
  p_payload jsonb default '{}'::jsonb,
  p_priority int default 0,
  p_run_after timestamptz default now()
)
returns ingest_job
language sql
security definer
as $$
  insert into ingest_job (kind, payload, priority, run_after)
  values (p_kind, coalesce(p_payload, '{}'::jsonb), p_priority, coalesce(p_run_after, now()))
  on conflict (kind, payload) where status in ('queued','running')
  do update
     set priority  = greatest(ingest_job.priority, excluded.priority),
         run_after = least(ingest_job.run_after, excluded.run_after)
  returning ingest_job.*;
$$;

-- batch enqueue from a jsonb array of objects:
-- [{ "kind":"...", "payload":{...}, "priority":0, "run_after":"2025-08-19T00:00:00Z" }, ...]
create or replace function ingest_enqueue_many(p_jobs jsonb)
returns setof ingest_job
language sql
security definer
as $$
  with src as (
    select *
    from jsonb_to_recordset(
           case when jsonb_typeof(p_jobs) = 'array'
                then p_jobs
                else jsonb_build_array(p_jobs)
           end
         ) as t(
           kind text,
           payload jsonb,
           priority int,
           run_after timestamptz
         )
  )
  insert into ingest_job (kind, payload, priority, run_after)
  select
    kind,
    coalesce(payload, '{}'::jsonb),
    coalesce(priority, 0),
    coalesce(run_after, now())
  from src
  on conflict (kind, payload) where status in ('queued','running')
  do update
     set priority  = greatest(ingest_job.priority, excluded.priority),
         run_after = least(ingest_job.run_after, excluded.run_after)
  returning ingest_job.*;
$$;