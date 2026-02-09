-- Add 'businesses' option to announcements table target_audience column

-- First, drop the existing check constraint
ALTER TABLE announcements 
  DROP CONSTRAINT IF EXISTS announcements_target_audience_check;

-- Add new check constraint that includes 'businesses'
ALTER TABLE announcements 
  ADD CONSTRAINT announcements_target_audience_check 
  CHECK (target_audience IN ('all', 'creators', 'artists', 'businesses'));

-- Update the comment to reflect the new option
COMMENT ON COLUMN announcements.target_audience IS 'Target audience: all (default), creators, artists, or businesses';
