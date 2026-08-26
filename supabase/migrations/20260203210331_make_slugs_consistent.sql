BEGIN;

-- 1. Update event and fighter slug cols to varchar
ALTER TABLE "event" 
  ALTER COLUMN slug TYPE VARCHAR(255) USING slug::VARCHAR(255);

ALTER TABLE "fighter" 
  ALTER COLUMN slug TYPE VARCHAR(255) USING slug::VARCHAR(255);

-- 2. Seed 'different_table' slugs with joined data
-- Format: name-vs-name-<first-8-eventid>
UPDATE fight f
SET slug = LOWER(
    REPLACE(f1.full_name, ' ', '-') || '-vs-' || 
    REPLACE(f2.full_name, ' ', '-') || '-' || 
    LEFT(f.event_id::text, 8)
)
FROM fighter f1, fighter f2
WHERE f.fighter_1_id = f1.id 
  AND f.fighter_2_id = f2.id
  AND f.slug IS NULL;

-- 3. Enforce Data Integrity
ALTER TABLE fight
  ALTER COLUMN slug SET NOT NULL;

COMMIT;