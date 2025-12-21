-- Simple fix: Make user_type nullable
-- Run this in Supabase Dashboard → SQL Editor

-- Step 1: Make user_type nullable
ALTER TABLE user_profiles 
  ALTER COLUMN user_type DROP NOT NULL;

-- Step 2: Update the CHECK constraint to allow NULL
-- First, find the constraint name
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find constraint that checks user_type
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'user_profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%user_type%'
  LIMIT 1;
  
  -- Drop it if found
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE user_profiles DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Step 3: Add new constraint that allows NULL
ALTER TABLE user_profiles 
  ADD CONSTRAINT user_profiles_user_type_check 
  CHECK (user_type IS NULL OR user_type IN ('artist', 'creator', 'business'));



