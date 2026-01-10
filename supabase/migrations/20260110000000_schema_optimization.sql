-- ============================================================================
-- SCHEMA OPTIMIZATION MIGRATION
-- ============================================================================
-- This migration addresses:
-- 1. Missing tables that frontend code expects
-- 2. Missing indexes for performance
-- 3. Creates unified_users view for easier querying
-- 4. Adds sync trigger between users and profiles
-- 5. Optional RLS improvements (commented out for safety)
-- ============================================================================

-- ============================================================================
-- 1. CREATE MISSING TABLES (Required by frontend code)
-- ============================================================================

-- 1a. conversation_mutes - Track muted conversations per user
CREATE TABLE IF NOT EXISTS conversation_mutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  muted_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, conversation_id)
);

-- Enable RLS
ALTER TABLE conversation_mutes ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only manage their own mutes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_mutes' AND policyname = 'Users can view own mutes') THEN
    CREATE POLICY "Users can view own mutes" ON conversation_mutes
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_mutes' AND policyname = 'Users can insert own mutes') THEN
    CREATE POLICY "Users can insert own mutes" ON conversation_mutes
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_mutes' AND policyname = 'Users can delete own mutes') THEN
    CREATE POLICY "Users can delete own mutes" ON conversation_mutes
      FOR DELETE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_conversation_mutes_user ON conversation_mutes(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_mutes_conversation ON conversation_mutes(conversation_id);

-- 1b. conversation_user_state - Track per-user state for conversations (pinned, archived, etc.)
CREATE TABLE IF NOT EXISTS conversation_user_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  is_pinned boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  last_read_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, conversation_id)
);

ALTER TABLE conversation_user_state ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_user_state' AND policyname = 'Users can view own state') THEN
    CREATE POLICY "Users can view own state" ON conversation_user_state
      FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_user_state' AND policyname = 'Users can insert own state') THEN
    CREATE POLICY "Users can insert own state" ON conversation_user_state
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_user_state' AND policyname = 'Users can update own state') THEN
    CREATE POLICY "Users can update own state" ON conversation_user_state
      FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'conversation_user_state' AND policyname = 'Users can delete own state') THEN
    CREATE POLICY "Users can delete own state" ON conversation_user_state
      FOR DELETE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_conversation_user_state_user ON conversation_user_state(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_user_state_conversation ON conversation_user_state(conversation_id);

-- 1c. user_blocks - Track blocked users
CREATE TABLE IF NOT EXISTS user_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(blocker_id, blocked_id),
  CHECK (blocker_id != blocked_id) -- Can't block yourself
);

ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_blocks' AND policyname = 'Users can view own blocks') THEN
    CREATE POLICY "Users can view own blocks" ON user_blocks
      FOR SELECT TO authenticated
      USING (blocker_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_blocks' AND policyname = 'Users can insert own blocks') THEN
    CREATE POLICY "Users can insert own blocks" ON user_blocks
      FOR INSERT TO authenticated
      WITH CHECK (blocker_id = auth.uid());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_blocks' AND policyname = 'Users can delete own blocks') THEN
    CREATE POLICY "Users can delete own blocks" ON user_blocks
      FOR DELETE TO authenticated
      USING (blocker_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);

-- ============================================================================
-- 2. CREATE unified_users VIEW
-- ============================================================================
-- This view combines users and profiles for easier querying in chat
-- The frontend code uses this view

CREATE OR REPLACE VIEW unified_users AS
SELECT
  COALESCE(u.id, p.id) as id,
  u.first_name,
  u.last_name,
  u.username,
  COALESCE(u.profile_picture_url, p.avatar_url) as avatar_url,
  COALESCE(
    CASE
      WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL
      THEN u.first_name || ' ' || u.last_name
      WHEN u.first_name IS NOT NULL
      THEN u.first_name
      ELSE p.name
    END,
    p.name,
    'User'
  ) as display_name,
  COALESCE(p.is_admin, false) as is_admin,
  COALESCE(p.is_online, false) as is_online,
  p.last_seen,
  u.email,
  u.user_type,
  u.bio
FROM profiles p
LEFT JOIN users u ON u.id = p.id;

-- Grant access to the view
GRANT SELECT ON unified_users TO authenticated;
GRANT SELECT ON unified_users TO anon;

-- ============================================================================
-- 3. ADD MISSING INDEXES FOR PERFORMANCE
-- ============================================================================

-- OTP verification queries
CREATE INDEX IF NOT EXISTS idx_otp_codes_verified ON otp_codes(verified);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_verified ON otp_codes(email, verified);

-- Admin profile lookups (used by chat to find admin)
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- User lookups by email (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(lower(email));

-- Signup tracking time-based queries (for spam filter with 24h window)
CREATE INDEX IF NOT EXISTS idx_signup_tracking_ip_time ON signup_tracking(ip_address, created_at DESC);

-- Social links lookups
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(user_id, platform);

-- Announcements by type and audience
CREATE INDEX IF NOT EXISTS idx_announcements_type_audience ON announcements(announcement_type, target_audience);

-- Messages by sender (useful for admin queries)
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- ============================================================================
-- 4. ADD SYNC TRIGGER: users -> profiles
-- ============================================================================
-- When a user is created/updated, ensure their profile exists and stays in sync

CREATE OR REPLACE FUNCTION sync_profile_from_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert into profiles to keep them in sync
  INSERT INTO profiles (id, name, avatar_url, is_admin, is_online)
  VALUES (
    NEW.id,
    COALESCE(
      CASE
        WHEN NEW.first_name IS NOT NULL THEN NEW.first_name
        ELSE split_part(NEW.email, '@', 1)
      END,
      'User'
    ),
    COALESCE(NEW.profile_picture_url, ''),
    false,
    false
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(
      CASE
        WHEN NEW.first_name IS NOT NULL THEN NEW.first_name
        ELSE profiles.name
      END,
      profiles.name
    ),
    avatar_url = COALESCE(NEW.profile_picture_url, profiles.avatar_url);

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the user operation if profile sync fails
  RAISE WARNING 'Failed to sync profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS sync_profile_on_user_change ON users;
CREATE TRIGGER sync_profile_on_user_change
  AFTER INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_from_user();

-- ============================================================================
-- 5. ADD updated_at TRIGGER FOR NEW TABLES
-- ============================================================================

-- Reuse or create the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for conversation_user_state
DROP TRIGGER IF EXISTS update_conversation_user_state_updated_at ON conversation_user_state;
CREATE TRIGGER update_conversation_user_state_updated_at
  BEFORE UPDATE ON conversation_user_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 6. ADD REALTIME SUPPORT FOR NEW TABLES
-- ============================================================================

DO $$
BEGIN
  -- Add conversation_mutes to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_mutes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_mutes;
  END IF;

  -- Add conversation_user_state to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversation_user_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_user_state;
  END IF;

  -- Add user_blocks to realtime
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'user_blocks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_blocks;
  END IF;
END $$;

-- ============================================================================
-- 7. DOCUMENTATION COMMENTS
-- ============================================================================

COMMENT ON TABLE conversation_mutes IS 'Tracks muted conversations per user - muted conversations dont show notifications';
COMMENT ON TABLE conversation_user_state IS 'Per-user state for conversations like pinned, archived, last read time';
COMMENT ON TABLE user_blocks IS 'Tracks blocked users - blocked users cannot send messages';
COMMENT ON VIEW unified_users IS 'Combined view of users and profiles for chat system queries';

COMMENT ON TABLE users IS 'Main user table - synced with auth.users via FK. Contains profile data.';
COMMENT ON TABLE profiles IS 'Chat profiles - linked to users. Used for conversations and messaging.';
COMMENT ON TABLE user_profiles IS 'DEPRECATED - legacy table, use users table instead.';

-- ============================================================================
-- 8. OPTIONAL: STRICTER RLS POLICIES
-- ============================================================================
-- These are commented out because the current permissive policies may be
-- intentional for the chat system. Uncomment if you want stricter security.
-- NOTE: Service role key bypasses RLS, so Edge Functions will still work.

/*
-- Fix conversations RLS - users should only see their own conversations
DROP POLICY IF EXISTS "Participants can view their conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid()
    OR admin_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Fix messages RLS - users should only see messages in their conversations
DROP POLICY IF EXISTS "Participants can view conversation messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.customer_id = auth.uid() OR c.admin_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
