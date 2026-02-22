-- Create public storage bucket for feedback media attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-media', 'feedback-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to feedback-media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload feedback media' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Authenticated users can upload feedback media"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'feedback-media');
  END IF;
END $$;

-- Allow public read access to feedback media
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read access for feedback media' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public read access for feedback media"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'feedback-media');
  END IF;
END $$;
