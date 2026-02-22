-- Add media_url column to feedback table
ALTER TABLE feedback ADD COLUMN IF NOT EXISTS media_url text;

-- Create feedback-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-media', 'feedback-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to feedback-media
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to feedback-media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feedback-media');

-- Allow public read of feedback-media
CREATE POLICY IF NOT EXISTS "Allow public read of feedback-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'feedback-media');
