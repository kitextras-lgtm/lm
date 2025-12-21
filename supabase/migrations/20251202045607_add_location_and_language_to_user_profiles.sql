/*
  # Add location and language fields to user_profiles table

  1. Changes
    - Add `location` (text) - User's location/country
    - Add `primary_language` (text) - User's primary language

  2. Important Notes
    - These fields help match users with relevant campaigns and content
    - Both fields are optional but recommended for better user experience
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'primary_language'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN primary_language text;
  END IF;
END $$;