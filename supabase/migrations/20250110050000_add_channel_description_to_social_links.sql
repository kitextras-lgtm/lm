-- ============================================================================
-- ADD CHANNEL DESCRIPTION TO SOCIAL LINKS
-- ============================================================================

-- Add channel_description column to social_links table
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS channel_description text;

-- Add comment to describe the column
COMMENT ON COLUMN social_links.channel_description IS 'Optional description of the channel content, style, or what makes it unique';

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT 'Channel description column added to social_links table!' as status;
