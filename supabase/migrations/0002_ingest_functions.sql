
-- ------------------------------------------------------------
-- Ingest functions
-- ------------------------------------------------------------

-- enqueue (dedupes against queued/running, bumps priority earlier and run_after sooner)
create or replace function ingest_enqueue(
  p_kind text,
  p_payload jsonb default null,
  p_priority int default 0,
  p_run_after timestamptz default now()
)
returns ingest_job
language sql
security definer
as $$
	insert into ingest_job (kind, payload, priority, run_after)
	values (p_kind, p_payload, p_priority, p_run_after)
	on conflict (kind, payload) where status in ('queued','running')
	do update
		set priority  = greatest(ingest_job.priority, excluded.priority),
				run_after = least(ingest_job.run_after, excluded.run_after)
	returning ingest_job.*;
$$;



-- lease N due jobs for p_lease_seconds; optionally restrict to kinds
create or replace function ingest_lease_jobs(
  p_limit int default 5,
  p_lease_seconds int default 60,
  p_kinds text[] default null
)
returns setof ingest_job
language sql
security definer
as $$
with candidates as (
  select id
  from ingest_job
  where (
    (status = 'queued'  and run_after <= now())
    or
    (status = 'running' and coalesce(lease_until, now()) <= now())
  )
  and (p_kinds is null or kind = any(p_kinds))
  order by
    priority desc,
    case when status = 'queued' then run_after else lease_until end,
    id
  for update skip locked
  limit p_limit
),
upd as (
  update ingest_job j
  set status      = 'running',
			lease_token = gen_random_uuid(),
      lease_until = now() + make_interval(secs => p_lease_seconds),
      attempts    = attempts + 1,
      started_at  = coalesce(started_at, now())
  from candidates
  where j.id = candidates.id
  returning j.*
)
select * from upd;
$$;



-- heartbeat (batched)
create or replace function ingest_heartbeat(
  p_ids bigint[]
)
returns setof ingest_job
language sql
security definer
as $$
update ingest_job j
set lease_until = now() + make_interval(mins => 3)
where j.id = any(p_ids)
  and j.status = 'running'
returning j.*;
$$;



-- mark ok (must hold a valid, unexpired lease)
create or replace function ingest_mark_ok(
  p_id bigint,
  p_lease_token uuid,
  p_counts jsonb default '{}'::jsonb
)
returns ingest_job
language sql
security definer
as $$
update ingest_job j
set status      = 'ok',
    finished_at = now(),
		lease_token = null,
    lease_until = null,
    error       = null,
    counts      = coalesce(j.counts, '{}'::jsonb) || coalesce(p_counts, '{}'::jsonb)
where j.id = p_id
  and j.status = 'running'
	and j.lease_token is not null
	and j.lease_token = p_lease_token
  and j.lease_until > now()
returning j.*;
$$;



-- mark fail with capped exponential backoff + jitter (must hold lease)
create or replace function ingest_mark_fail(
  p_id bigint,
  p_lease_token uuid,
  p_error text
)
returns ingest_job
language sql
security definer
as $$
update ingest_job j
set status      = 'queued',
		lease_token = null,
    lease_until = null,
    run_after   = now()
                  + least(interval '30 minutes',
                           interval '30 seconds' * power(2, greatest(0, j.attempts)))
                  + make_interval(secs => floor(random()*10)::int),
    error       = left(coalesce(p_error,''), 250)
where j.id = p_id
	and j.status = 'running'
	and j.lease_token is not null
	and j.lease_token = p_lease_token
	and j.lease_until > now()
returning j.*;
$$;


