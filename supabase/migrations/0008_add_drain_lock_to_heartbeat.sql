-- heartbeat (batched) + extend global drain lock
create or replace function ingest_heartbeat(p_ids bigint[])
returns setof ingest_job
language sql
security definer
as $$
with hb as (
  update ingest_job j
  set lease_until = now() + make_interval(mins => 3)
  where j.id = any(p_ids)
    and j.status = 'running'
  returning j.*
),
dl as (
  insert into drain_lock (id, locked_until)
  values (1, now() + interval '15 minutes')
  on conflict (id) do update
    set locked_until = greatest(drain_lock.locked_until, now()) + interval '15 minutes'
  returning 1
)
select * from hb;
$$;
