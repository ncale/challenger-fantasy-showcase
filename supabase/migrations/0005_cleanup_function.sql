-- ------------------------------------------------------------
-- Database Cleanup Function
-- ------------------------------------------------------------

-- Function to clean up old records from various tables
-- This helps keep the database size manageable by removing temporary/processed data
create or replace function cleanup_old_records(
  p_days_to_keep int default 7
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_cutoff_date timestamptz;
  v_deleted_jobs int := 0;
  v_deleted_raw int := 0;
  v_result jsonb;
begin
  -- Calculate cutoff date
  v_cutoff_date := now() - make_interval(days => p_days_to_keep);
  
  -- Clean up successful ingest jobs older than specified days
  -- These are jobs that completed successfully and are no longer needed
  delete from ingest_job 
  where status = 'ok' 
    and finished_at < v_cutoff_date;
  
  get diagnostics v_deleted_jobs = row_count;
  
  -- Clean up old ingest_raw records that are no longer referenced
  -- Only delete raw data that isn't the latest for any URL and is older than cutoff
  -- This preserves the most recent raw data for each URL while cleaning up old versions
  delete from ingest_raw ir
  where ir.fetched_at < v_cutoff_date
    and not exists (
      select 1 from ingest_state ist 
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



-- Function to get cleanup statistics without actually deleting
-- Useful for monitoring and planning cleanup operations
create or replace function cleanup_old_records_dry_run(
  p_days_to_keep int default 7
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_cutoff_date timestamptz;
  v_jobs_to_delete int := 0;
  v_raw_to_delete int := 0;
  v_result jsonb;
begin
  -- Calculate cutoff date
  v_cutoff_date := now() - make_interval(days => p_days_to_keep);
  
  -- Count successful ingest jobs that would be deleted
  select count(*) into v_jobs_to_delete
  from ingest_job 
  where status = 'ok' 
    and finished_at < v_cutoff_date;
  
  -- Count ingest_raw records that would be deleted
  select count(*) into v_raw_to_delete
  from ingest_raw ir
  where ir.fetched_at < v_cutoff_date
    and not exists (
      select 1 from ingest_state ist 
      where ist.latest_ingest_raw_id = ir.id
    );
  
  -- Build result summary
  v_result := jsonb_build_object(
    'analysis_date', now(),
    'cutoff_date', v_cutoff_date,
    'days_kept', p_days_to_keep,
    'records_to_delete', jsonb_build_object(
      'ingest_jobs', v_jobs_to_delete,
      'ingest_raw', v_raw_to_delete,
      'total', v_jobs_to_delete + v_raw_to_delete
    )
  );
  
  return v_result;
end;
$$;


