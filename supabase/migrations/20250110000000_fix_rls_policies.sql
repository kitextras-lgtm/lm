-- ============================================================================
-- SECURITY & CLEANUP FIX
-- ============================================================================

-- ============================================================================
-- 1. DROP REDUNDANT TABLE
-- ============================================================================
DROP TABLE IF EXISTS user_profiles;

-- ============================================================================
-- 2. FIX CONVERSATIONS RLS (Private chats)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can view conversations" ON conversations;
DROP POLICY IF EXISTS "Participants can view their conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can create conversations" ON conversations;
DROP POLICY IF EXISTS "Anyone can update conversations" ON conversations;

-- Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR admin_id = auth.uid());

-- Users can only update their own conversations
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR admin_id = auth.uid());

-- Users can create conversations where they are a participant
CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid() OR admin_id = auth.uid());

-- ============================================================================
-- 3. FIX MESSAGES RLS (Private messages)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view messages" ON messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON messages;
DROP POLICY IF EXISTS "Participants can view conversation messages" ON messages;
DROP POLICY IF EXISTS "Anyone can send messages" ON messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;

-- Users can only see messages in their conversations
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.customer_id = auth.uid() OR c.admin_id = auth.uid())
    )
  );

-- Users can only send messages in their conversations
CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.customer_id = auth.uid() OR c.admin_id = auth.uid())
    )
  );

-- Users can update their own messages (for read status, etc.)
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.customer_id = auth.uid() OR c.admin_id = auth.uid())
    )
  );

-- ============================================================================
-- 4. FIX PROFILES RLS
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;

-- Everyone can view profiles (needed for chat to show names/avatars)
-- This is OK - profiles only have name, avatar, online status (not sensitive)
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Users can only update their own profile
DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- 5. FIX FEEDBACK RLS
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view feedback" ON feedback;
DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;

-- Users can only see their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can submit feedback
CREATE POLICY "Users can insert feedback" ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 6. FIX ANNOUNCEMENTS RLS
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view announcements" ON announcements;
DROP POLICY IF EXISTS "Users can view announcements" ON announcements;
DROP POLICY IF EXISTS "Anyone can insert announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;

-- Users can see announcements meant for them or all users
CREATE POLICY "Users can view relevant announcements" ON announcements
  FOR SELECT TO authenticated
  USING (
    user_id IS NULL  -- Broadcast to all
    OR user_id = auth.uid()  -- Specific to this user
  );

-- Users can update announcements (mark as read)
CREATE POLICY "Users can update own announcements" ON announcements
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 7. FIX USERS TABLE RLS
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can read users" ON users;
DROP POLICY IF EXISTS "Users can read users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Users can view all users (needed for profile lookups, chat, etc.)
-- But this exposes emails - consider restricting in future
CREATE POLICY "Authenticated users can view users" ON users
  FOR SELECT TO authenticated
  USING (true);

-- Users can only update their own record
DROP POLICY IF EXISTS "Users can update own record" ON users;
CREATE POLICY "Users can update own record" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- 8. ADD PERFORMANCE INDEXES FOR RLS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_admin_id ON conversations(admin_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT 'Security policies updated successfully!' as status;
