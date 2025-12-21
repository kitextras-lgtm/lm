-- Verify username uniqueness constraint exists
-- Run this in Supabase Dashboard → SQL Editor to check

-- Check if username column has UNIQUE constraint
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_profiles'::regclass
  AND pg_get_constraintdef(oid) LIKE '%username%';

-- If no constraint found, add it:
-- ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);

-- Or if the column was added without the constraint:
-- ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_unique UNIQUE (username);



