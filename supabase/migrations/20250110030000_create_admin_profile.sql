-- ============================================================================
-- CREATE ADMIN PROFILE FOR TEAM ELEVATE
-- ============================================================================

-- Check if admin profile already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE is_admin = true LIMIT 1
  ) THEN
    -- Create admin profile for Team Elevate
    INSERT INTO profiles (
      id,
      name,
      avatar_url,
      is_admin,
      is_online,
      last_seen
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',  -- This should match your actual admin user ID
      'Team Elevate',
      '',
      true,
      true,
      now()
    );
    
    RAISE NOTICE 'Admin profile created for Team Elevate';
  ELSE
    RAISE NOTICE 'Admin profile already exists';
  END IF;
END $$;

-- Show current admin profiles
SELECT 
  id, 
  name, 
  is_admin, 
  is_online, 
  last_seen,
  created_at
FROM profiles 
WHERE is_admin = true;

-- ============================================================================
-- IMPORTANT: You may need to update the admin ID above!
-- ============================================================================

-- Check what admin users exist in the users table
SELECT id, email, first_name, last_name FROM users WHERE email LIKE '%admin%' OR email LIKE '%elevate%';

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT 'Admin profile creation completed!' as status;
