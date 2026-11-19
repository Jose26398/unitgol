-- Add positions column to players table
ALTER TABLE players
ADD COLUMN IF NOT EXISTS positions text[] DEFAULT '{}';
