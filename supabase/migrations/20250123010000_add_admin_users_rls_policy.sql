/*
  # Add RLS Policy for Admins to View All Users

  1. Changes
    - Add RLS policy allowing admins to SELECT all rows from users table
    - This policy checks if the current user is an admin by checking the admins table
    - Note: Edge Functions use service role key which bypasses RLS, but this policy
      ensures direct database access by admins is properly secured

  2. Security
    - Only admins (users in the admins table) can view all users
    - Regular users can still only view their own data (existing policy)
    - Edge Functions bypass RLS using service role key, but this adds an extra layer
*/

-- Create a function to check if a user is an admin
-- This function checks if the current auth.uid() exists in the admins table
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM admins 
    WHERE id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

-- Drop existing overly permissive policy if it exists
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new policy: Users can read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Create new policy: Admins can view all users
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  USING (is_admin() = true);

-- Note: The existing "Users can update own data" policy remains unchanged
-- Edge Functions bypass RLS using service role key, but these policies
-- ensure direct database access is properly secured
