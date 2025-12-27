/*
  # Add unique constraint to social_links.url

  This migration adds a unique constraint to the url column in the social_links table
  to ensure that no two users can register the same social media link.
*/

-- Add unique constraint to url column
ALTER TABLE social_links 
ADD CONSTRAINT social_links_url_unique UNIQUE (url);


