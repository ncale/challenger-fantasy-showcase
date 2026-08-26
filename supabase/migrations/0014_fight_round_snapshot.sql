-- Add unique constraint on fight_id and round combination for fight_round_snapshot table
-- This is required for the upsert operation with onConflict: "fight_id,round" to work

ALTER TABLE fight_round_snapshot 
ADD CONSTRAINT fight_round_snapshot_fight_id_round_unique 
UNIQUE (fight_id, round);