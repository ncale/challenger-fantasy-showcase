
-- CHECKS
-- 1. put in ops schema
-- 2. set owner and security, and search_path
--     2.1. db_owner and invoker
-- 3. set search_path = pg_temp, public, ops

-- ops should be owned by db_owner
alter schema ops owner to db_owner;

-- Clean up old records from various tables
create or replace function ops.cleanup_old_records(p_days_to_keep int default 7)
returns jsonb
language plpgsql
security invoker
set search_path = pg_temp, public, ops
as $$
declare
  v_cutoff_date timestamptz;
  v_deleted_jobs int := 0;
  v_deleted_raw int := 0;
  v_result jsonb;
begin
  v_cutoff_date := now() - make_interval(days => p_days_to_keep);

  delete from public.ingest_job 
  where status = 'ok' 
    and finished_at < v_cutoff_date;
  
  get diagnostics v_deleted_jobs = row_count;
  
  -- Clean up old ingest_raw records that are no longer referenced
  -- Only delete raw data that isn't the latest for any URL and is older than cutoff
  -- This preserves the most recent raw data for each URL while cleaning up old versions
  delete from public.ingest_raw ir
  where ir.fetched_at < v_cutoff_date
    and not exists (
      select 1 from public.ingest_state ist 
      where ist.latest_ingest_raw_id = ir.id
    );
  
  get diagnostics v_deleted_raw = row_count;
  
  -- Build result summary
  v_result := jsonb_build_object(
    'cleanup_date', now(),
    'cutoff_date', v_cutoff_date,
    'days_kept', p_days_to_keep,
    'deleted_records', jsonb_build_object(
      'ingest_jobs', v_deleted_jobs,
      'ingest_raw', v_deleted_raw,
      'total', v_deleted_jobs + v_deleted_raw
    )
  );
  
  -- Log the cleanup operation
  raise notice 'Cleanup completed: %', v_result;
  
  return v_result;
end;
$$;

alter function ops.cleanup_old_records owner to db_owner;


-- single-row enqueue
create or replace function ops.ingest_enqueue(
  p_kind text,
  p_payload jsonb default '{}'::jsonb,
  p_priority int default 0,
  p_run_after timestamptz default now()
)
returns ingest_job
language sql
security invoker
set search_path = pg_temp, public, ops
as $$
  insert into public.ingest_job (kind, payload, priority, run_after)
  values (p_kind, coalesce(p_payload, '{}'::jsonb), p_priority, coalesce(p_run_after, now()))
  on conflict (kind, payload) where status in ('queued','running')
  do update
     set priority  = greatest(ingest_job.priority, excluded.priority),
         run_after = least(ingest_job.run_after, excluded.run_after)
  returning ingest_job.*;
$$;

alter function ops.ingest_enqueue owner to db_owner;


-- batch enqueue from a jsonb array of objects:
-- [{ "kind":"...", "payload":{...}, "priority":0, "run_after":"2025-08-19T00:00:00Z" }, ...]
create or replace function ops.ingest_enqueue_many(p_jobs jsonb)
returns setof ingest_job
language sql
security invoker
set search_path = pg_temp, public, ops
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
  insert into public.ingest_job (kind, payload, priority, run_after)
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

alter function ops.ingest_enqueue_many owner to db_owner;


-- heartbeat (batched) + extend global ingest lock
create or replace function ops.ingest_heartbeat(p_ids bigint[])
returns setof ingest_job
language sql
security invoker
set search_path = pg_temp, public, ops
as $$
with hb as (
  update ingest_job j
  set lease_until = now() + make_interval(mins => 3)
  where j.id = any(p_ids)
    and j.status = 'running'
  returning j.*
),
dl as (
  insert into ingest_lock (id, locked_until)
  values (1, now() + interval '15 minutes')
  on conflict (id) do update
    set locked_until = greatest(ingest_lock.locked_until, now()) + interval '15 minutes'
  returning 1
)
select * from hb;
$$;

alter function ops.ingest_heartbeat owner to db_owner;


-- lease N due jobs for p_lease_seconds; optionally restrict to kinds
create or replace function ops.ingest_lease_jobs(
  p_limit int default 5,
  p_lease_seconds int default 60,
  p_kinds text[] default null
)
returns setof ingest_job
language sql
security invoker
set search_path = pg_temp, public, ops
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

alter function ops.ingest_lease_jobs owner to db_owner;


-- mark ok (must hold a valid, unexpired lease)
create or replace function ops.ingest_mark_ok(
  p_id bigint,
  p_lease_token uuid,
  p_counts jsonb default '{}'::jsonb
)
returns ingest_job
language sql
security invoker
set search_path = pg_temp, public, ops
as $$
update public.ingest_job j
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

alter function ops.ingest_mark_ok owner to db_owner;



-- mark fail with capped exponential backoff + jitter (must hold lease)
create or replace function ops.ingest_mark_fail(
  p_id bigint,
  p_lease_token uuid,
  p_error text
)
returns ingest_job
language sql 
security invoker
set search_path = pg_temp, public, ops
as $$
update public.ingest_job j
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

alter function ops.ingest_mark_fail owner to db_owner;



-- handle new user (trigger function)
create or replace function ops.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_temp, public, ops
as $$
begin
  insert into public.user_profile (user_id, username)
  values (new.id, new.raw_user_meta_data->>'username');

  insert into public.user_config (user_id, config)
  values (new.id, jsonb_build_object('betaAccess', (new.raw_user_meta_data->>'betaAccess')::boolean));

  return new;
end;
$$;

alter function ops.handle_new_user owner to db_owner;



-- set updated_at automatically
create or replace function ops.set_updated_at()
returns trigger 
language plpgsql
security invoker
set search_path = pg_temp, public, ops
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


--- depreciated
create or replace function ops.finalize_submission_rankings(p_game_id uuid)
returns void 
language plpgsql
security invoker
set search_path = pg_temp, public, ops
as $$
begin
  insert into daily_mma_game_submission_ranking (submission_id, game_id, user_id, overall_score, breakdown, place, payout)
  select s.id, s.game_id, s.user_id, ss.overall_score, ss.breakdown,
         rank() over (partition by s.game_id order by ss.overall_score desc) as place,
				 0 as payout
  from daily_mma_game_submission s
  join daily_mma_game_submission_live_score ss on ss.submission_id = s.id
  where s.game_id = p_game_id
  on conflict (submission_id)
  do update set overall_score = excluded.overall_score, breakdown = excluded.breakdown, place = excluded.place, payout = excluded.payout;
end;
$$;

alter function ops.finalize_submission_rankings owner to db_owner;



create or replace function ops.rank_submission_scores()
returns void 
language plpgsql
security invoker
set search_path = pg_temp, public, ops
as $$
begin
  UPDATE daily_mma_game_submission_score ss
	SET position = ranked.position
	FROM (
		SELECT 
			submission_id,
			RANK() OVER (PARTITION BY draft_group_id ORDER BY score DESC) as position
		FROM daily_mma_game_submission_score
	) ranked
	WHERE ss.submission_id = ranked.submission_id
	AND ss.position != ranked.position;
end;
$$;



-- Add stats to fight result
create or replace function ops.add_stats_to_fight_result(p_fight_id uuid)
returns void 
language plpgsql
security invoker
set search_path = pg_temp, public, ops
as $$
begin
	update public.fight_result fr
	set
		fighter_1_stats = agg.fighter_1_stats,
		fighter_2_stats = agg.fighter_2_stats
	from (
		select
			frs.fight_id,
			api.aggregate_fighter_stats_jsonb(array_agg(frs.fighter_1_stats)) as fighter_1_stats,
			api.aggregate_fighter_stats_jsonb(array_agg(frs.fighter_2_stats)) as fighter_2_stats
		from public.fight_round_snapshot frs
		where frs.fight_id = p_fight_id
		group by frs.fight_id
	) agg
	where fr.fight_id = agg.fight_id;
end;
$$;

alter function ops.add_stats_to_fight_result owner to db_owner;

-- Trigger to update fight stats when fight is finalized
create or replace function ops.trigger_update_fight_stats()
returns trigger
language plpgsql
security invoker
set search_path = pg_temp, public, ops
as $$
begin
  if new.status = 'final' and old.status is distinct from 'final' then
    perform ops.add_stats_to_fight_result(new.id);
  end if;
  return new;
end;
$$;

alter function ops.trigger_update_fight_stats owner to db_owner;



-- Save draft submissions
create or replace function ops.save_draft_submissions(
  p_game_id uuid,
  p_draft_group_id uuid,
  p_submissions jsonb[] -- array of { user_id: string, metadata: jsonb, position: int, picks: { fighter_id: string, metadata: jsonb }[] }
)
returns void
language plpgsql
security invoker
set search_path = pg_temp, public, ops
as $$
declare
  v_submission jsonb;
  v_submission_id uuid;
	v_insert_count integer;
begin
  insert into public.daily_mma_game_draft_group (id, game_id)
  values (p_draft_group_id, p_game_id)
  on conflict (id) do nothing;

	GET DIAGNOSTICS v_insert_count = ROW_COUNT;

  if v_insert_count = 0 then
    -- A row was NOT inserted, meaning the ID already existed and you want to block
    raise exception 'Draft group ID already exists: %', p_draft_group_id;
  end if;

  -- Use FOREACH with proper loop variable declaration
  foreach v_submission in array p_submissions loop
    insert into public.daily_mma_game_submission (game_id, draft_group_id, user_id, metadata, position)
    values (
      p_game_id,
      p_draft_group_id,
      (v_submission->>'user_id')::uuid,
      v_submission->'metadata',
      (v_submission->>'position')::int
    )
    returning id into v_submission_id;

    insert into public.daily_mma_game_submission_pick (submission_id, fighter_id, metadata)
    select
      v_submission_id,
      (elem->>'fighter_id')::uuid,
      elem->'metadata'
    from jsonb_array_elements(v_submission->'picks') as elem;
  end loop;
end;
$$;

alter function ops.save_draft_submissions owner to db_owner;
