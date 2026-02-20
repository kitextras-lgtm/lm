-- Add is_request column to conversations table
-- When a user DMs another user for the first time, the conversation is marked as a request
-- The recipient can accept (moves to primary) or deny (deletes the conversation)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_request boolean DEFAULT false;

-- Index for fast filtering of request conversations
CREATE INDEX IF NOT EXISTS idx_conversations_is_request ON conversations(is_request) WHERE is_request = true;
