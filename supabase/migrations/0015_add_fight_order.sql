-- Add fight_order column to fight table
ALTER TABLE fight ADD COLUMN fight_order INTEGER;

-- Add index to help with ordering fights
CREATE INDEX fight_order_idx ON fight(event_id, fight_order);

-- Add constraint to ensure fight_order is non-negative
ALTER TABLE fight ADD CONSTRAINT fight_order_non_negative CHECK (fight_order >= 0);
