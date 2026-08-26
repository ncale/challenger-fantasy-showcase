ALTER TABLE public.app_config
  ADD COLUMN ios_min_app_version text NOT NULL DEFAULT '1.0.0',
  ADD COLUMN ios_latest_app_version text;

UPDATE public.app_config SET ios_min_app_version = min_app_version;

COMMENT ON COLUMN public.app_config.min_app_version IS 'DEPRECATED: use ios_min_app_version instead';
