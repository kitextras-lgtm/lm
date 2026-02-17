-- ============================================================================
-- CREATE TEAM ELEVATE ADMIN PROFILE
-- ============================================================================

-- Insert the admin profile using the exact admin user ID
INSERT INTO profiles (
  id,
  name,
  avatar_url,
  is_admin,
  is_online,
  last_seen,
  created_at,
  updated_at
) VALUES (
  'a7c7e4c1-0f8a-4a3b-9e6d-2f8b9c7a6e5d',  -- Team Elevate admin user ID
  'Team Elevate',
  '',
  true,
  true,
  now(),
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  is_online = true,
  updated_at = now();

-- Verify the admin profile was created
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
-- DONE!
-- ============================================================================
SELECT 'Team Elevate admin profile created successfully!' as status;
