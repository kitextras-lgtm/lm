/*
  # Add bio to users table

  1. Changes
    - Add `bio` (text, nullable) - User's bio/description (optional)

  2. Important Notes
    - Bio is optional field
    - Allows users to write a short description about themselves
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'bio'
  ) THEN
    ALTER TABLE users ADD COLUMN bio text;
  END IF;
END $$;
