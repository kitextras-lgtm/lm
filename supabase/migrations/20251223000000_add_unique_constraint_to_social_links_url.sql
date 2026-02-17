/*
  # Add unique constraint to social_links.url

  This migration adds a unique constraint to the url column in the social_links table
  to ensure that no two users can register the same social media link.
*/

-- Add unique constraint to url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'social_links_url_unique' AND table_name = 'social_links'
  ) THEN
    ALTER TABLE social_links ADD CONSTRAINT social_links_url_unique UNIQUE (url);
  END IF;
END $$;


