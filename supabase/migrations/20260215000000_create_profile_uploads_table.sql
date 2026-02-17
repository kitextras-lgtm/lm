/*
  # Create profile_uploads table

  Tracks resume and LinkedIn PDF uploads during freelancer onboarding.
  
  Columns:
    - id: UUID primary key
    - user_id: references auth.users
    - upload_type: 'resume' or 'linkedin_pdf'
    - file_name: original filename
    - file_size: size in bytes
    - mime_type: validated MIME type
    - storage_path: private path in storage bucket
    - status: upload lifecycle state
    - created_at / updated_at: timestamps
*/

CREATE TABLE IF NOT EXISTS profile_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_type TEXT NOT NULL CHECK (upload_type IN ('resume', 'linkedin_pdf')),
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'uploading' CHECK (status IN ('uploading', 'uploaded', 'scanning', 'parsing', 'complete', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_profile_uploads_user_id ON profile_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_uploads_user_type ON profile_uploads(user_id, upload_type);

-- RLS
ALTER TABLE profile_uploads ENABLE ROW LEVEL SECURITY;

-- Users can read their own uploads
DROP POLICY IF EXISTS "Users can read own uploads" ON profile_uploads;
CREATE POLICY "Users can read own uploads"
  ON profile_uploads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can do everything (Edge Functions)
DROP POLICY IF EXISTS "Service role full access on profile_uploads" ON profile_uploads;
CREATE POLICY "Service role full access on profile_uploads"
  ON profile_uploads FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_profile_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profile_uploads_updated_at ON profile_uploads;
CREATE TRIGGER profile_uploads_updated_at
  BEFORE UPDATE ON profile_uploads
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_uploads_updated_at();
