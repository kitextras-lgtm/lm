-- Add verification_phrase column to store the randomized phrase for each link
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS verification_phrase text;

-- Remove any duplicate URLs before adding unique constraint
-- Keep the oldest (first inserted) row per URL
DELETE FROM social_links
WHERE id NOT IN (
  SELECT DISTINCT ON (url) id
  FROM social_links
  ORDER BY url, created_at ASC
);

-- Add unique constraint on url (system-wide, one owner per URL)
ALTER TABLE social_links DROP CONSTRAINT IF EXISTS social_links_url_unique;
ALTER TABLE social_links ADD CONSTRAINT social_links_url_unique UNIQUE (url);
