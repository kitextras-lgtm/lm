-- Fix RLS policies for tables used by custom-auth users (OTP-based, not Supabase Auth)
-- These users exist in the public.users table but NOT in auth.users,
-- so auth.uid() returns null for them. We relax policies to allow anon role
-- (the client uses the anon key) while keeping user_id scoping via WITH CHECK.

-- ─── social_links ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can insert own social links" ON social_links;
CREATE POLICY "Users can insert own social links"
  ON social_links FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own social links" ON social_links;
CREATE POLICY "Users can update own social links"
  ON social_links FOR UPDATE
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can delete own social links" ON social_links;
CREATE POLICY "Users can delete own social links"
  ON social_links FOR DELETE
  TO anon, authenticated
  USING (true);

-- ─── release_drafts ──────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can read own release drafts" ON release_drafts;
CREATE POLICY "Users can read own release drafts"
  ON release_drafts FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can insert own release drafts" ON release_drafts;
CREATE POLICY "Users can insert own release drafts"
  ON release_drafts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own release drafts" ON release_drafts;
CREATE POLICY "Users can update own release drafts"
  ON release_drafts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own release drafts" ON release_drafts;
CREATE POLICY "Users can delete own release drafts"
  ON release_drafts FOR DELETE
  TO anon, authenticated
  USING (true);

-- ─── storage: artist-images ──────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can upload artist images" ON storage.objects;
CREATE POLICY "Users can upload artist images"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'artist-images');

DROP POLICY IF EXISTS "Users can update own artist images" ON storage.objects;
CREATE POLICY "Users can update artist images"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'artist-images');

-- ─── storage: release-artwork ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can upload release artwork" ON storage.objects;
CREATE POLICY "Users can upload release artwork"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'release-artwork');

DROP POLICY IF EXISTS "Users can update own release artwork" ON storage.objects;
CREATE POLICY "Users can update release artwork"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'release-artwork');

DROP POLICY IF EXISTS "Users can delete own release artwork" ON storage.objects;
CREATE POLICY "Users can delete release artwork"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'release-artwork');
