-- Replace numeric weight columns with weight class key strings.
-- These keys (e.g. "155lbs_lightweight") encode both the weight and the
-- class name, making numeric-only columns redundant.
-- Safe to drop without backfill — no clients read these columns yet.

ALTER TABLE fighter_analytics
  DROP COLUMN IF EXISTS lowest_weight_lbs,
  DROP COLUMN IF EXISTS highest_weight_lbs,
  ADD COLUMN lowest_weight_key text,
  ADD COLUMN highest_weight_key text;
