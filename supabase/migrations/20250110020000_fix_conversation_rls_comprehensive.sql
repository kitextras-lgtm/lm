-- ============================================================================
-- COMPREHENSIVE CONVERSATION RLS FIX
-- ============================================================================

-- Drop all existing conversation policies to start fresh
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;

-- Recreate all policies with correct logic

-- SELECT: Users can only see their own conversations
DROP POLICY IF EXISTS "Users can view own conversations" ON conversations;
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid() OR admin_id = auth.uid());

-- UPDATE: Users can only update their own conversations  
DROP POLICY IF EXISTS "Users can update own conversations" ON conversations;
CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE TO authenticated
  USING (customer_id = auth.uid() OR admin_id = auth.uid());

-- INSERT: Users can create conversations where they are the customer
-- (admin_id can be any valid UUID - this is the key fix)
DROP POLICY IF EXISTS "Users can insert own conversations" ON conversations;
CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- ============================================================================
-- DEBUG: Check current policies
-- ============================================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'conversations'
ORDER BY policyname;

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT 'Comprehensive conversation RLS fix applied!' as status;
