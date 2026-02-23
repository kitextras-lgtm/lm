-- Create release_drafts table for persisting distribution form state
CREATE TABLE IF NOT EXISTS release_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'incomplete', -- 'incomplete' | 'submitted' | 'approved' | 'inactive'
  current_step integer NOT NULL DEFAULT 1,

  -- Step 1: Release Information
  title text DEFAULT '',
  copyright_holder text DEFAULT '',
  copyright_year text DEFAULT '',
  production_holder text DEFAULT '',
  production_year text DEFAULT '',
  record_label text DEFAULT 'Independent',
  release_artists text DEFAULT '',
  genre text DEFAULT '',
  secondary_genre text DEFAULT '',
  language text DEFAULT 'English',

  -- Step 1: Artwork
  artwork_url text DEFAULT '',

  -- Step 2: Tracks (stored as JSONB)
  tracks jsonb DEFAULT '[]'::jsonb,

  -- Step 2: Checklist
  checklist jsonb DEFAULT '[false,false,false]'::jsonb,

  -- Step 2: Copyright option
  copyright_option text DEFAULT 'none',

  -- Step 3: Schedule
  release_date text DEFAULT '',
  release_date_mode text DEFAULT 'most-recent',
  released_before boolean DEFAULT false,
  original_release_date text DEFAULT '',
  country_restrictions boolean DEFAULT false,
  selected_countries jsonb DEFAULT '[]'::jsonb,

  -- Step 4: Stores
  stores jsonb DEFAULT '[]'::jsonb,
  store_dist_type text DEFAULT 'all',

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE release_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own release drafts" ON release_drafts;
CREATE POLICY "Users can read own release drafts"
  ON release_drafts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own release drafts" ON release_drafts;
CREATE POLICY "Users can insert own release drafts"
  ON release_drafts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own release drafts" ON release_drafts;
CREATE POLICY "Users can update own release drafts"
  ON release_drafts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own release drafts" ON release_drafts;
CREATE POLICY "Users can delete own release drafts"
  ON release_drafts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_release_drafts_user_id ON release_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_release_drafts_status ON release_drafts(status);

-- Storage bucket for release artwork
INSERT INTO storage.buckets (id, name, public)
VALUES ('release-artwork', 'release-artwork', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for release artwork
DROP POLICY IF EXISTS "Users can upload release artwork" ON storage.objects;
CREATE POLICY "Users can upload release artwork"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'release-artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Anyone can view release artwork" ON storage.objects;
CREATE POLICY "Anyone can view release artwork"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'release-artwork');

DROP POLICY IF EXISTS "Users can update own release artwork" ON storage.objects;
CREATE POLICY "Users can update own release artwork"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'release-artwork' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own release artwork" ON storage.objects;
CREATE POLICY "Users can delete own release artwork"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'release-artwork' AND auth.uid()::text = (storage.foldername(name))[1]);
