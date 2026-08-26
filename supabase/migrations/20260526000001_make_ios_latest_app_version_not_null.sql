UPDATE public.app_config SET ios_latest_app_version = ios_min_app_version WHERE ios_latest_app_version IS NULL;

ALTER TABLE public.app_config
  ALTER COLUMN ios_latest_app_version SET NOT NULL,
  ALTER COLUMN ios_latest_app_version SET DEFAULT '1.0.0';
