-- ===================================================================
-- ALTER EXISTING STAGING TABLES
-- ===================================================================

-- Add external_id to existing event_staging for UFCStats ID tracking
ALTER TABLE public.event_staging
  ADD COLUMN IF NOT EXISTS external_id text;

-- ===================================================================
-- NEW STAGING TABLES
-- ===================================================================

-- fighter_staging: mirrors fighter table (all nullable except external_id/slug)
CREATE TABLE public.fighter_staging (
  staging_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  external_id text NOT NULL,
  slug character varying(255) NOT NULL,
  full_name text,
  nickname text,
  country text,
  stance text,
  height_in integer,
  reach_in integer,
  dob date,
  weight_lbs integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fighter_staging_external_id ON public.fighter_staging (external_id);
CREATE INDEX idx_fighter_staging_created_at ON public.fighter_staging (created_at DESC);

-- fight_staging: no result fields — those go in fight_result_staging
CREATE TABLE public.fight_staging (
  staging_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  external_id text NOT NULL,
  event_external_id text NOT NULL,
  fighter_1_external_id text NOT NULL,
  fighter_2_external_id text NOT NULL,
  fighter_1_name text NOT NULL,
  fighter_2_name text NOT NULL,
  weight_class text,
  weight_lbs integer,
  is_title boolean NOT NULL DEFAULT false,
  title_name text,
  rounds_scheduled integer,
  time_format text,
  fight_order integer,
  status text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fight_staging_external_id ON public.fight_staging (external_id);
CREATE INDEX idx_fight_staging_event_external_id ON public.fight_staging (event_external_id);
CREATE INDEX idx_fight_staging_created_at ON public.fight_staging (created_at DESC);

-- fight_result_staging: result info split from fight (mirrors fight_result table)
-- round_time stored as seconds (integer) — cast to interval on merge
CREATE TABLE public.fight_result_staging (
  staging_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fight_external_id text NOT NULL,
  method text,
  round integer,
  round_time_seconds integer,
  details text,
  referee text,
  result text,                -- cast to fight_result_enum on merge
  fighter_1_stats jsonb,     -- overall fight stats (not per-round)
  fighter_2_stats jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fight_result_staging_fight_external_id ON public.fight_result_staging (fight_external_id);
CREATE INDEX idx_fight_result_staging_created_at ON public.fight_result_staging (created_at DESC);

-- fight_round_snapshot_staging: per-round JSONB stats
CREATE TABLE public.fight_round_snapshot_staging (
  staging_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fight_external_id text NOT NULL,
  round integer NOT NULL,
  fighter_1_stats jsonb NOT NULL DEFAULT '{}',
  fighter_2_stats jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fight_round_snapshot_staging_fight_external_id
  ON public.fight_round_snapshot_staging (fight_external_id);

-- ===================================================================
-- ARCHIVE TABLES
-- ===================================================================
-- Archive tables capture point-in-time snapshots of production rows.
-- No FK constraints — archives must remain readable even if refs change.
-- All columns match the production table; archived_at records when captured.

CREATE TABLE public.event_archive (
  archive_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id uuid NOT NULL,
  org_id uuid NOT NULL,
  slug character varying(255) NOT NULL,
  name text NOT NULL,
  start_time timestamptz,
  venue text,
  city text,
  country text,
  status public.schedule_status NOT NULL,
  state_or_region text,
  short_name text,
  prelims_start_time timestamptz,
  main_card_start_time timestamptz,
  event_date timestamptz NOT NULL,
  created_at timestamptz,
  updated_at timestamptz,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_archive_id ON public.event_archive (id);
CREATE INDEX idx_event_archive_archived_at ON public.event_archive (archived_at DESC);

CREATE TABLE public.fighter_archive (
  archive_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id uuid NOT NULL,
  slug character varying(255) NOT NULL,
  full_name text,
  nickname text,
  country text,
  stance text,
  height_in integer,
  reach_in integer,
  dob date,
  weight_lbs integer,
  flags jsonb,
  search_priority smallint,
  created_at timestamptz,
  updated_at timestamptz,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fighter_archive_id ON public.fighter_archive (id);
CREATE INDEX idx_fighter_archive_archived_at ON public.fighter_archive (archived_at DESC);

-- fight_archive reflects the FUTURE fight table (after result fields move to fight_result)
CREATE TABLE public.fight_archive (
  archive_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id uuid NOT NULL,
  event_id uuid NOT NULL,
  fighter_1_id uuid NOT NULL,
  fighter_2_id uuid NOT NULL,
  weight_class text,
  weight_lbs integer,
  is_title boolean,
  title_name text,
  rounds_scheduled integer,
  time_format text,
  fight_order integer,
  status public.schedule_status NOT NULL,
  slug character varying(255) NOT NULL,
  created_at timestamptz,
  updated_at timestamptz,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fight_archive_id ON public.fight_archive (id);
CREATE INDEX idx_fight_archive_event_id ON public.fight_archive (event_id);
CREATE INDEX idx_fight_archive_archived_at ON public.fight_archive (archived_at DESC);

CREATE TABLE public.fight_result_archive (
  archive_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  fight_id uuid NOT NULL,
  method text,
  round integer,
  round_time interval,
  details text,
  referee text,
  result public.fight_result_enum,
  fighter_1_stats jsonb,
  fighter_2_stats jsonb,
  created_at timestamptz,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fight_result_archive_fight_id ON public.fight_result_archive (fight_id);
CREATE INDEX idx_fight_result_archive_archived_at ON public.fight_result_archive (archived_at DESC);

CREATE TABLE public.fight_round_snapshot_archive (
  archive_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id bigint NOT NULL,
  fight_id uuid NOT NULL,
  round integer NOT NULL,
  fighter_1_stats jsonb NOT NULL,
  fighter_2_stats jsonb NOT NULL,
  created_at timestamptz,
  updated_at timestamptz,
  archived_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fight_round_snapshot_archive_fight_id ON public.fight_round_snapshot_archive (fight_id);
CREATE INDEX idx_fight_round_snapshot_archive_archived_at ON public.fight_round_snapshot_archive (archived_at DESC);
