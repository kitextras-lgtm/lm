-- Add last_message_sender_id column to conversations table
-- This tracks who sent the last message so we can show "Me: " prefix only for the sender
-- References profiles table since that's what's used for chat

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS last_message_sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_sender_id 
ON conversations(last_message_sender_id);

-- Add comment
COMMENT ON COLUMN conversations.last_message_sender_id IS 'ID of the user who sent the last message in this conversation';

