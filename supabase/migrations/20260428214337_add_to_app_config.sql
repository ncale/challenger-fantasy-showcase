ALTER TABLE public.app_config
ADD COLUMN track_page_live_preview_count integer NOT NULL DEFAULT 8,
ADD COLUMN track_page_upcoming_preview_count integer NOT NULL DEFAULT 8,
ADD COLUMN track_page_results_preview_count integer NOT NULL DEFAULT 4,
ADD COLUMN draft_initializing_time_seconds integer NOT NULL DEFAULT 30;