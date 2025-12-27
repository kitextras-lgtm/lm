-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  is_admin boolean DEFAULT false,
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  last_message text DEFAULT '',
  last_message_at timestamptz DEFAULT now(),
  unread_count_admin integer DEFAULT 0,
  unread_count_customer integer DEFAULT 0,
  is_pinned boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image')),
  content text DEFAULT '',
  image_url text DEFAULT '',
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'seen')),
  reply_to_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  reply_to_sender_name text DEFAULT '',
  reply_to_content text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
  ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_customer 
  ON conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message 
  ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to 
  ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies (permissive for now - adjust based on your auth setup)
-- Note: These policies allow all operations. In production, you may want to restrict based on user roles.

DROP POLICY IF EXISTS "Anyone can view profiles" ON profiles;
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can update profiles" ON profiles;
CREATE POLICY "Users can update profiles" ON profiles FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can insert profiles" ON profiles;
CREATE POLICY "Anyone can insert profiles" ON profiles FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Participants can view their conversations" ON conversations;
CREATE POLICY "Participants can view their conversations" ON conversations FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Customers can create conversations" ON conversations;
CREATE POLICY "Customers can create conversations" ON conversations FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Participants can update conversations" ON conversations;
CREATE POLICY "Participants can update conversations" ON conversations FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Participants can view conversation messages" ON messages;
CREATE POLICY "Participants can view conversation messages" ON messages FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages" ON messages FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Participants can update messages" ON messages;
CREATE POLICY "Participants can update messages" ON messages FOR UPDATE TO anon, authenticated USING (true);

-- Enable realtime (only add if not already added)
DO $$
BEGIN
  -- Add messages table to realtime publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;

  -- Add conversations table to realtime publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;

  -- Add profiles table to realtime publication if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;

