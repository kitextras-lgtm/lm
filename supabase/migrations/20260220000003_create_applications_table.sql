-- Create applications table for freelancer onboarding submissions and creator social verification requests
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  application_type text NOT NULL CHECK (application_type IN ('freelancer_onboarding', 'creator_verification')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  -- Applicant snapshot (denormalized for admin review without extra joins)
  full_name text,
  email text,
  username text,
  -- Freelancer-specific fields
  professional_title text,
  category text,
  skills text[],
  hourly_rate numeric,
  bio text,
  country text,
  city text,
  -- Creator-specific fields
  platform text,
  social_url text,
  channel_type text,
  channel_description text,
  -- Admin action
  reviewed_by uuid,
  reviewed_at timestamptz,
  admin_note text,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_type ON applications(application_type);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Users can insert their own applications
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
CREATE POLICY "Users can insert own applications" ON applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own applications
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT TO anon, authenticated
  USING (true);

-- Anon (admin) can update applications (accept/deny)
DROP POLICY IF EXISTS "Anon can update applications" ON applications;
CREATE POLICY "Anon can update applications" ON applications
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Anon (admin) can delete applications
DROP POLICY IF EXISTS "Anon can delete applications" ON applications;
CREATE POLICY "Anon can delete applications" ON applications
  FOR DELETE TO anon, authenticated
  USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_applications_updated_at ON applications;
CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_applications_updated_at();

-- Add to realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE applications;
  END IF;
END $$;
