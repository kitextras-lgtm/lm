-- Add announcement_type and target_audience columns to announcements table

-- Add announcement_type column (normal or serious)
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS announcement_type text DEFAULT 'normal' CHECK (announcement_type IN ('normal', 'serious'));

-- Add target_audience column (all, creators, artists)
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS target_audience text DEFAULT 'all' CHECK (target_audience IN ('all', 'creators', 'artists'));

-- Create index for target_audience for efficient filtering
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience 
  ON announcements(target_audience);

-- Create index for announcement_type
CREATE INDEX IF NOT EXISTS idx_announcements_type 
  ON announcements(announcement_type);

COMMENT ON COLUMN announcements.announcement_type IS 'Type of announcement: normal (default) or serious (highlighted)';
COMMENT ON COLUMN announcements.target_audience IS 'Target audience: all (default), creators, or artists';

