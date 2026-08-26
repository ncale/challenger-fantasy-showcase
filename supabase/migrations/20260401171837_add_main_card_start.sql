--- add nuanced start times to event

ALTER TABLE event
  RENAME COLUMN event_date TO start_time;

ALTER TABLE event
  ADD COLUMN prelims_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN main_card_start_time TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE event
SET
  prelims_start_time = start_time,
  main_card_start_time = start_time;

ALTER TABLE event
  ALTER COLUMN prelims_start_time DROP DEFAULT,
  ALTER COLUMN main_card_start_time DROP DEFAULT;