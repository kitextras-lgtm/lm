-- Make user_type nullable in user_profiles table
-- This allows profile creation before user type selection

-- First, drop the NOT NULL constraint
ALTER TABLE user_profiles 
  ALTER COLUMN user_type DROP NOT NULL;

-- Find and drop the existing CHECK constraint
DO $$
DECLARE
  constraint_name text;
BEGIN
  -- Find the constraint name
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'user_profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%user_type%';
  
  -- Drop it if found
  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE user_profiles DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- Add new CHECK constraint that allows NULL
ALTER TABLE user_profiles 
  ADD CONSTRAINT user_profiles_user_type_check 
  CHECK (user_type IS NULL OR user_type IN ('artist', 'creator', 'business'));



