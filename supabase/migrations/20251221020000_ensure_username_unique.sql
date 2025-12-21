-- Ensure username has UNIQUE constraint
-- This migration ensures usernames are unique across all users

-- Check if unique constraint already exists
DO $$
BEGIN
  -- Check if username column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' 
    AND column_name = 'username'
  ) THEN
    -- Check if unique constraint already exists
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'user_profiles'::regclass
        AND contype = 'u'
        AND (
          conkey::text LIKE '%username%' 
          OR pg_get_constraintdef(oid) LIKE '%username%'
        )
    ) THEN
      -- Add unique constraint if it doesn't exist
      ALTER TABLE user_profiles 
      ADD CONSTRAINT user_profiles_username_unique UNIQUE (username);
      
      RAISE NOTICE 'Added UNIQUE constraint on username';
    ELSE
      RAISE NOTICE 'UNIQUE constraint on username already exists';
    END IF;
  END IF;
END $$;



