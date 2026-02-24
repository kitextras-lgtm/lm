-- Create public storage bucket for artist images
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-images', 'artist-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own artist images
DROP POLICY IF EXISTS "Authenticated users can upload artist images" ON storage.objects;
CREATE POLICY "Authenticated users can upload artist images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'artist-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to artist images
DROP POLICY IF EXISTS "Public can read artist images" ON storage.objects;
CREATE POLICY "Public can read artist images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'artist-images');

-- Allow users to update/replace their own artist images
DROP POLICY IF EXISTS "Users can update own artist images" ON storage.objects;
CREATE POLICY "Users can update own artist images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'artist-images' AND auth.uid()::text = (storage.foldername(name))[1]);
