-- Add subscriber_count and view_count columns to social_links table
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS subscriber_count bigint DEFAULT NULL;
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS view_count bigint DEFAULT NULL;
