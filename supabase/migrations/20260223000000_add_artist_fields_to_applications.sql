-- Add artist-specific fields to applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS artist_type text,
  ADD COLUMN IF NOT EXISTS artist_role text,
  ADD COLUMN IF NOT EXISTS artist_genre text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS x_handle text,
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS youtube_channel text,
  ADD COLUMN IF NOT EXISTS tiktok_username text,
  ADD COLUMN IF NOT EXISTS apple_music_id text,
  ADD COLUMN IF NOT EXISTS spotify_id text,
  ADD COLUMN IF NOT EXISTS soundcloud_id text,
  ADD COLUMN IF NOT EXISTS deezer_id text,
  ADD COLUMN IF NOT EXISTS audiomack_id text,
  ADD COLUMN IF NOT EXISTS amazon_id text;
