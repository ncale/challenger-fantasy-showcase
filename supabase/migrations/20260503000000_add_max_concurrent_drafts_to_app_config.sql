ALTER TABLE public.app_config
ADD COLUMN max_concurrent_drafts integer NOT NULL DEFAULT 3;
