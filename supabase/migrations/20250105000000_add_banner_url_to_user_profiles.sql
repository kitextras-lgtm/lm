/*
  # Add banner_url to user_profiles table

  1. Changes
    - Add `banner_url` (text, nullable) - URL to user's banner image (optional)

  2. Important Notes
    - Banner URL is optional field
    - Allows users to upload and display banner images on their profiles
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN banner_url text;
  END IF;
END $$;
