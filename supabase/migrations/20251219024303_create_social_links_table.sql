/*
  # Create social media links table

  1. New Tables
    - `social_links`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `platform` (text) - The social media platform name (YouTube, Instagram, TikTok, etc.)
      - `url` (text) - The full URL to the social media profile/channel
      - `display_name` (text) - Custom display name for the link
      - `created_at` (timestamptz) - When the link was added
      - `updated_at` (timestamptz) - When the link was last updated

  2. Security
    - Enable RLS on `social_links` table
    - Add policy for users to read their own links
    - Add policy for users to insert their own links
    - Add policy for users to update their own links
    - Add policy for users to delete their own links
*/

CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform text NOT NULL,
  url text NOT NULL,
  display_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own social links"
  ON social_links FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social links"
  ON social_links FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social links"
  ON social_links FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social links"
  ON social_links FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);