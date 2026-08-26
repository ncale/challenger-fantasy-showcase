ALTER TABLE public.event
  ALTER COLUMN start_time DROP NOT NULL,
  ALTER COLUMN prelims_start_time DROP NOT NULL,
  ALTER COLUMN main_card_start_time DROP NOT NULL;