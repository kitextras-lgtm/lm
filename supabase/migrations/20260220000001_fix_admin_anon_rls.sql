-- Fix RLS so the admin dashboard (which uses anon key without Supabase Auth session)
-- can read conversations, messages, and profiles.
-- The admin authenticates via a custom session token, not Supabase Auth,
-- so auth.uid() is always null for admin requests.

-- Conversations: allow anon to read (admin needs to see all conversations)
DROP POLICY IF EXISTS "Anon can view conversations" ON conversations;
CREATE POLICY "Anon can view conversations" ON conversations
  FOR SELECT TO anon
  USING (true);

-- Profiles: allow anon to read (admin needs to see customer profiles)
DROP POLICY IF EXISTS "Anon can view profiles" ON profiles;
CREATE POLICY "Anon can view profiles" ON profiles
  FOR SELECT TO anon
  USING (true);

-- Messages: allow anon to read (admin needs to see messages)
DROP POLICY IF EXISTS "Anon can view messages" ON messages;
CREATE POLICY "Anon can view messages" ON messages
  FOR SELECT TO anon
  USING (true);
