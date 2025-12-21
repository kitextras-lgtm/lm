-- Fix user_type constraint to allow NULL
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Make user_type nullable
ALTER TABLE user_profiles 
  ALTER COLUMN user_type DROP NOT NULL;

-- Step 2: Find and drop the existing CHECK constraint
-- First, let's see what constraints exist (run this to find the name):
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'user_profiles'::regclass 
  AND contype = 'c'
  AND pg_get_constraintdef(oid) LIKE '%user_type%';

-- Step 3: Drop the constraint (replace 'constraint_name' with the name from above)
-- Or use this to drop all CHECK constraints on user_type:
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'user_profiles'::regclass 
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%user_type%'
  LOOP
    EXECUTE 'ALTER TABLE user_profiles DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Step 4: Add new CHECK constraint that allows NULL
ALTER TABLE user_profiles 
  ADD CONSTRAINT user_profiles_user_type_check 
  CHECK (user_type IS NULL OR user_type IN ('artist', 'creator', 'business'));



