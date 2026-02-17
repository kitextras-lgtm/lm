/*
  # Create private storage bucket for profile uploads (resumes, LinkedIn PDFs)

  - Bucket is PRIVATE (no public URLs)
  - Only service_role can insert (Edge Functions handle uploads)
  - Authenticated users can read their own files via signed URLs
  - Users can delete their own files
*/

-- Create the private bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-uploads', 'profile-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Service role can insert files (Edge Function uploads)
DROP POLICY IF EXISTS "Service role can upload profile files" ON storage.objects;
CREATE POLICY "Service role can upload profile files"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'profile-uploads');

-- Service role can read all profile files
DROP POLICY IF EXISTS "Service role can read profile files" ON storage.objects;
CREATE POLICY "Service role can read profile files"
ON storage.objects
FOR SELECT
TO service_role
USING (bucket_id = 'profile-uploads');

-- Service role can delete profile files
DROP POLICY IF EXISTS "Service role can delete profile files" ON storage.objects;
CREATE POLICY "Service role can delete profile files"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'profile-uploads');

-- Authenticated users can read their own files (path: {upload_type}/{user_id}/*)
DROP POLICY IF EXISTS "Users can read own profile files" ON storage.objects;
CREATE POLICY "Users can read own profile files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-uploads' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Authenticated users can delete their own files
DROP POLICY IF EXISTS "Users can delete own profile files" ON storage.objects;
CREATE POLICY "Users can delete own profile files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-uploads' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
