-- Create enum type for fight result
CREATE TYPE fight_result AS ENUM ('f1', 'f2', 'draw', 'no-contest');

-- Add result column to fight table
ALTER TABLE fight
ADD COLUMN result fight_result;
