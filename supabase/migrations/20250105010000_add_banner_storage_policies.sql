/*
  # Add Storage Policies for Banner Images

  1. Changes
    - Add policies for banner uploads to the 'avatars' bucket
    - Allows users to upload banners to banners/{userId}/ folder
    - Uses service role for uploads (bypasses RLS in Edge Function)

  2. Important Notes
    - Banners are stored in avatars bucket under banners/ folder
    - Public read access is already granted for the entire avatars bucket
*/

-- Drop existing banner policies if they exist
DROP POLICY IF EXISTS "Users can upload their own banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own banners" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own banners" ON storage.objects;
DROP POLICY IF EXISTS "Service role can upload banners" ON storage.objects;

-- Policy: Allow service role to upload banners (Edge Function uses service role)
-- This is the primary method for banner uploads
CREATE POLICY "Service role can upload banners"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'banners'
);

-- Policy: Allow authenticated users to upload their own banners (backup)
CREATE POLICY "Users can upload their own banners"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'banners' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy: Allow authenticated users to update their own banners
CREATE POLICY "Users can update their own banners"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'banners' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy: Allow authenticated users to delete their own banners
CREATE POLICY "Users can delete their own banners"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'banners' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Also add service role policy for profile pictures (Edge Function uses this)
DROP POLICY IF EXISTS "Service role can upload profile pictures" ON storage.objects;
CREATE POLICY "Service role can upload profile pictures"
ON storage.objects
FOR INSERT
TO service_role
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'profile-pictures'
);
