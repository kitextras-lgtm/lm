-- user_relationships: Discord-style friend request system
CREATE TABLE IF NOT EXISTS user_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  -- Canonical pair key: min(a,b) || ':' || max(a,b) — enforces uniqueness regardless of direction
  pair_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

-- Prevent duplicate relationships between the same pair
CREATE UNIQUE INDEX IF NOT EXISTS user_relationships_pair_key_idx ON user_relationships (pair_key);

-- Fast lookups per user
CREATE INDEX IF NOT EXISTS user_relationships_requester_idx ON user_relationships (requester_id, status);
CREATE INDEX IF NOT EXISTS user_relationships_addressee_idx ON user_relationships (addressee_id, status);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_relationships_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_relationships_updated_at ON user_relationships;
CREATE TRIGGER trg_user_relationships_updated_at
  BEFORE UPDATE ON user_relationships
  FOR EACH ROW EXECUTE FUNCTION update_user_relationships_updated_at();

-- Disable RLS (admin-managed, access controlled via Edge Functions with service role)
ALTER TABLE user_relationships DISABLE ROW LEVEL SECURITY;
