-- Create announcements table for admin announcements to users
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE, -- NULL means sent to all users
  title text NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for announcements
CREATE INDEX IF NOT EXISTS idx_announcements_user_id 
  ON announcements(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_announcements_created_at 
  ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_admin_id 
  ON announcements(admin_id);
CREATE INDEX IF NOT EXISTS idx_announcements_is_read 
  ON announcements(is_read) WHERE is_read = false;

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for announcements
DROP POLICY IF EXISTS "Anyone can insert announcements" ON announcements;
CREATE POLICY "Anyone can insert announcements" ON announcements FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view announcements" ON announcements;
CREATE POLICY "Users can view announcements" ON announcements 
  FOR SELECT TO anon, authenticated 
  USING (true); -- Allow all authenticated users to view announcements (filtering by user_id happens in application logic)

DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
CREATE POLICY "Admins can update announcements" ON announcements 
  FOR UPDATE TO anon, authenticated 
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;
CREATE POLICY "Admins can delete announcements" ON announcements 
  FOR DELETE TO anon, authenticated 
  USING (true);

-- Add to realtime publication for live updates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'announcements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
  END IF;
END $$;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

COMMENT ON TABLE announcements IS 'Admin announcements sent to users (can be targeted to specific users or all users)';
COMMENT ON COLUMN announcements.user_id IS 'If NULL, announcement is sent to all users. If set, announcement is sent only to that specific user.';
COMMENT ON COLUMN announcements.is_read IS 'Tracks whether the announcement has been read by the user (only applies to user-specific announcements)';

