-- ============================================================================
-- SEND WELCOME MESSAGE TO SPECIFIC USER (judestcks@gmail.com)
-- ============================================================================
-- This sends the welcome message to judestcks@gmail.com's existing conversation
-- ============================================================================

-- Step 1: Find the conversation for judestcks@gmail.com
SELECT 
  c.id as conversation_id,
  c.customer_id,
  c.admin_id,
  u.email,
  u.first_name,
  COUNT(m.id) as message_count
FROM conversations c
JOIN users u ON c.customer_id = u.id
LEFT JOIN messages m ON c.id = m.conversation_id
WHERE u.email = 'judestcks@gmail.com'
GROUP BY c.id, c.customer_id, c.admin_id, u.email, u.first_name;

-- Step 2: Send welcome message to this specific conversation
-- Only send if no messages exist yet
DO $$
DECLARE
  v_conversation_id UUID;
  v_customer_id UUID;
  v_admin_id UUID;
  v_first_name TEXT;
  v_welcome_message TEXT;
  v_message_id UUID;
BEGIN
  -- Get conversation details
  SELECT 
    c.id,
    c.customer_id,
    c.admin_id,
    COALESCE(u.first_name, '') as first_name
  INTO 
    v_conversation_id,
    v_customer_id,
    v_admin_id,
    v_first_name
  FROM conversations c
  JOIN users u ON c.customer_id = u.id
  WHERE u.email = 'judestcks@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM messages WHERE conversation_id = c.id
  )
  LIMIT 1;

  -- If conversation found and no messages exist, send welcome message
  IF v_conversation_id IS NOT NULL AND v_admin_id IS NOT NULL THEN
    -- Build welcome message
    v_welcome_message := 'Hi' || 
      CASE 
        WHEN v_first_name IS NOT NULL AND v_first_name != '' THEN ' ' || v_first_name || ','
        ELSE ''
      END || 
      ' welcome to Elevate! 👋' || E'\n\n' ||
      'If you have any questions, feel free to ask.' || E'\n\n' ||
      'Have suggestions or feedback? You can submit them here. We review everything and are always working to give you the best experience on Elevate.';

    -- Insert welcome message
    INSERT INTO messages (conversation_id, sender_id, type, content, status)
    VALUES (v_conversation_id, v_admin_id, 'text', v_welcome_message, 'sent')
    RETURNING id INTO v_message_id;

    -- Update conversation
    UPDATE conversations
    SET 
      last_message = 'Hi' || 
        CASE 
          WHEN v_first_name IS NOT NULL AND v_first_name != '' THEN ' ' || v_first_name || ','
          ELSE ''
        END || ' welcome to Elevate! 👋',
      last_message_at = NOW(),
      unread_count_customer = 1
    WHERE id = v_conversation_id;

    RAISE NOTICE 'Welcome message sent to conversation % for user judestcks@gmail.com', v_conversation_id;
  ELSE
    RAISE NOTICE 'Conversation not found or already has messages for judestcks@gmail.com';
  END IF;
END $$;

-- Step 3: Verify the message was sent
SELECT 
  m.id,
  m.content,
  m.created_at,
  u.email,
  u.first_name
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
JOIN users u ON c.customer_id = u.id
WHERE u.email = 'judestcks@gmail.com'
ORDER BY m.created_at DESC;


