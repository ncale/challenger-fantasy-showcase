CREATE TABLE public.event_staging (
  staging_id bigint generated always as identity primary key,
  id uuid,
  org_id uuid,
  slug character varying(255),
  name text,
  start_time timestamp with time zone,
  venue text,
  city text,
  country text,
  state_or_region text,
  short_name text,
  status public.schedule_status
);

CREATE TABLE public.event_times_staging (
  staging_id bigint generated always as identity primary key,
  slug character varying(255),
  start_time timestamp with time zone,
  prelims_start_time timestamp with time zone,
  main_card_start_time timestamp with time zone
);

ALTER TABLE public.event_staging
  ADD COLUMN created_at timestamp with time zone DEFAULT now();

ALTER TABLE public.event_times_staging
  ADD COLUMN created_at timestamp with time zone DEFAULT now();



CREATE OR REPLACE FUNCTION ops.merge_events()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  WITH latest_event_staging AS (
    SELECT DISTINCT ON (slug) *
    FROM public.event_staging
    ORDER BY slug, created_at DESC
  ),
  latest_event_times_staging AS (
    SELECT DISTINCT ON (slug) *
    FROM public.event_times_staging
    ORDER BY slug, created_at DESC
  )
  INSERT INTO public.event (org_id, slug, name, venue, city, country, state_or_region, short_name, status, start_time, prelims_start_time, main_card_start_time)
  SELECT
    s1.org_id,
    s1.slug,
    s1.name,
    s1.venue,
    s1.city,
    s1.country,
    s1.state_or_region,
    s1.short_name,
    s1.status,
    s2.start_time,
    s2.prelims_start_time,
    s2.main_card_start_time
  FROM latest_event_staging s1
  INNER JOIN latest_event_times_staging s2 ON s1.slug = s2.slug
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    venue = EXCLUDED.venue,
    city = EXCLUDED.city,
    country = EXCLUDED.country,
    state_or_region = EXCLUDED.state_or_region,
    short_name = EXCLUDED.short_name,
    status = EXCLUDED.status,
    start_time = EXCLUDED.start_time,
    prelims_start_time = EXCLUDED.prelims_start_time,
    main_card_start_time = EXCLUDED.main_card_start_time;

  DELETE FROM public.event_staging s1
  WHERE EXISTS (
    SELECT 1 FROM public.event_times_staging s2
    WHERE s1.slug = s2.slug
  );

  DELETE FROM public.event_times_staging s2
  WHERE EXISTS (
    SELECT 1 FROM public.event e
    WHERE e.slug = s2.slug
  );
END;
$$;