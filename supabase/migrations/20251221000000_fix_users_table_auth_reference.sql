/*
  # Fix Users Table to Reference auth.users

  1. Changes
    - Update `users` table to reference `auth.users(id)` instead of generating its own UUID
    - This ensures the users table ID matches the auth.users ID
    - Add foreign key constraint to maintain referential integrity

  2. Important Notes
    - This migration will DELETE any users in the `users` table that don't exist in `auth.users`
    - This ensures consistency between auth.users and users table
    - Only users with valid auth.users entries will remain
*/

-- First, check if we need to migrate existing data
-- If the table is empty or IDs already match, we can proceed

-- First, remove any orphaned users (users that don't exist in auth.users)
-- This ensures we can safely add the foreign key constraint
DELETE FROM users 
WHERE id NOT IN (SELECT id FROM auth.users);

-- Drop the default UUID generation and make it reference auth.users
DO $$
BEGIN
  -- Check if id column has default
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' 
    AND column_name = 'id' 
    AND column_default IS NOT NULL
  ) THEN
    -- Remove default
    ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
    
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'users_id_fkey'
      AND table_name = 'users'
    ) THEN
      ALTER TABLE users 
      ADD CONSTRAINT users_id_fkey 
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Update RLS policies to ensure users can only access their own data
-- (This should already be in place, but let's make sure)

-- Ensure the policy uses auth.uid() correctly
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);



