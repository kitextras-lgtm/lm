-- ============================================================================
-- SEND WELCOME MESSAGE TO EXISTING CONVERSATIONS
-- ============================================================================
-- This script sends the welcome message to existing conversations that don't have messages yet
-- Run this after updating the admin name to "Team Elevate"
-- ============================================================================

-- Step 1: Check existing conversations for judestcks@gmail.com (or any user)
-- Replace 'USER_EMAIL_HERE' with the actual email
SELECT 
  c.id as conversation_id,
  c.customer_id,
  u.email,
  u.first_name,
  COUNT(m.id) as message_count
FROM conversations c
LEFT JOIN users u ON c.customer_id = u.id
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE u.email = 'judestcks@gmail.com'
GROUP BY c.id, c.customer_id, u.email, u.first_name;

-- Step 2: Send welcome message to conversations without messages
-- This will send the welcome message to all conversations that have 0 messages
WITH conversations_without_messages AS (
  SELECT 
    c.id as conversation_id,
    c.customer_id,
    c.admin_id,
    u.first_name
  FROM conversations c
  LEFT JOIN users u ON c.customer_id = u.id
  LEFT JOIN messages m ON c.id = m.conversation_id
  WHERE m.id IS NULL  -- No messages exist
  GROUP BY c.id, c.customer_id, c.admin_id, u.first_name
)
INSERT INTO messages (conversation_id, sender_id, type, content, status)
SELECT 
  conversation_id,
  admin_id as sender_id,
  'text' as type,
  'Hi' || 
  CASE 
    WHEN first_name IS NOT NULL AND first_name != '' THEN ' ' || first_name || ','
    ELSE ''
  END || 
  ' welcome to Elevate! 👋' || E'\n\n' ||
  'If you have any questions, feel free to ask.' || E'\n\n' ||
  'Have suggestions or feedback? You can submit them here. We review everything and are always working to give you the best experience on Elevate.' as content,
  'sent' as status
FROM conversations_without_messages
WHERE admin_id IS NOT NULL;

-- Step 3: Update conversations with the last message
UPDATE conversations
SET 
  last_message = 'Hi welcome to Elevate! 👋',
  last_message_at = NOW(),
  unread_count_customer = 1
WHERE id IN (
  SELECT c.id
  FROM conversations c
  LEFT JOIN messages m ON c.id = m.conversation_id
  WHERE m.id IS NULL
)
AND admin_id IS NOT NULL;

-- Step 4: Verify the welcome message was sent
SELECT 
  m.id,
  m.conversation_id,
  m.content,
  m.created_at,
  u.email,
  u.first_name
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
LEFT JOIN users u ON c.customer_id = u.id
WHERE m.content LIKE '%welcome to Elevate%'
ORDER BY m.created_at DESC
LIMIT 10;


