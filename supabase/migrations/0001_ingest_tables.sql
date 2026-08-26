-- ------------------------------------------------------------
-- Ingest tables
-- ------------------------------------------------------------

-- map events, fights, and fighters to their source ids
create table if not exists alias (
  source text not null,              -- 'ufcstats'
  external_id text not null,         -- their id/slug
  primary key (source, external_id),
  entity_type text check (entity_type in ('event','fight','fighter')) not null,
  internal_id uuid not null
);

-- raw ingest data
create table if not exists ingest_raw (
  id bigserial primary key,
  source text not null,
  url text not null,
  fetched_at timestamptz not null default now(),
  body text,                             -- raw html (store it for reproducibility)
  hash text not null,                    -- sha256 hex of body (lowercase)
  unique (url, hash)
);

create index if not exists ingest_raw_url_fetched_idx on ingest_raw (url, fetched_at desc);
create index if not exists ingest_raw_url_hash_idx on ingest_raw (url, hash);

-- record of most recent ingest attempt for a url
create table if not exists ingest_state (
  url text primary key,
  run_after timestamptz not null default now(),
	latest_ingest_raw_id bigint references ingest_raw(id) on delete set null,
  last_checked timestamptz,
  last_status int,
  attempts int not null default 0
);

-- control-plane for performing ingest jobs
create table if not exists ingest_job (
  id bigserial primary key,
	kind text not null,                             -- e.g. 'process-ufcstats-event-page'
  payload jsonb default null,                     -- context needed for job to execute
  priority int not null default 0,                -- higher = sooner
  status text not null default 'queued'
                 check (status in ('queued','running','ok','error','skipped')),
  run_after timestamptz not null default now(),   -- earliest time we’ll lease it
	lease_token uuid,																-- worker requires this to mark ok or fail
  lease_until timestamptz,                        -- worker holds lock until this ts
  attempts int not null default 0,                -- retry counter
  started_at timestamptz,
  finished_at timestamptz,
  error text,                                     -- truncated message
  counts jsonb not null default '{}'::jsonb       -- {inserted:…, updated:…}
);

-- fast reservation scan
create index if not exists ingest_job_due_idx on ingest_job (status, run_after, priority desc);

-- skip-locked lookup by kind if you shard consumers
create index if not exists ingest_job_kind_idx on ingest_job (kind);

-- dedupe same jobs
create unique index ingest_job_kind_payload_unique on ingest_job (kind, payload)
  where status in ('queued','running');

-- helps re-leasing expired 'running' jobs
create index if not exists ingest_job_running_idx on ingest_job (status, lease_until);



-- global drain lock to prevent concurrent drain operations
create table if not exists drain_lock (
  id int primary key default 1,
  locked_until timestamptz not null default now(),
  locked_by text not null default ''
);


