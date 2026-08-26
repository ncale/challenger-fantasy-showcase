ALTER TABLE hero_fighter_game_entry
ALTER COLUMN user_id SET NOT NULL;



CREATE TYPE schedule_status AS ENUM ('scheduled', 'live', 'final', 'cancelled');

-- Drop the constraint first
ALTER TABLE public.event
DROP CONSTRAINT event_status_check;

-- Convert existing status values to the new enum type
ALTER TABLE public.event 
ALTER COLUMN status TYPE schedule_status 
USING status::schedule_status;

-- Drop the constraint first
ALTER TABLE public.fight
DROP CONSTRAINT fight_status_check;

-- Convert existing status values to the new enum type
ALTER TABLE public.fight 
ALTER COLUMN status TYPE schedule_status 
USING status::schedule_status;
