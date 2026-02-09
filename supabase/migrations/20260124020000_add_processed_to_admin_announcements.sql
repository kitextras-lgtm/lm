-- Add processed flag to admin_announcements table

-- Add processed column to track which announcements have been delivered
ALTER TABLE admin_announcements 
  ADD COLUMN IF NOT EXISTS processed boolean DEFAULT false;

-- Create index for processed announcements
CREATE INDEX IF NOT EXISTS idx_admin_announcements_processed 
  ON admin_announcements(processed) WHERE processed = false;
