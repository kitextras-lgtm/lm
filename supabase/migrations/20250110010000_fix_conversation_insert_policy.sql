-- ============================================================================
-- FIX CONVERSATION INSERT RLS POLICY
-- ============================================================================

-- The current policy is too restrictive - it doesn't allow users to create
-- conversations with admin_id set to someone else's UUID

DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;

-- Updated policy: Users can create conversations where they are the customer
-- and admin_id can be any valid UUID (for Team Elevate conversations)
CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    customer_id = auth.uid()  -- User must be the customer
    -- admin_id can be any valid UUID (no restriction needed)
  );

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT 'Conversation insert policy fixed!' as status;
