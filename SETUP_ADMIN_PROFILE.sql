-- ============================================================================
-- SETUP ADMIN PROFILE FOR CHAT SYSTEM
-- ============================================================================
-- This script sets up the admin profile for michael@sayelevate.com
-- It handles both cases:
-- 1. If michael@sayelevate.com exists in the users table
-- 2. If multiple admins need to be set up in the future
-- ============================================================================

-- Step 1: Check if michael@sayelevate.com exists in users table
SELECT id, email, full_name, first_name, last_name 
FROM users 
WHERE email = 'michael@sayelevate.com';

-- Step 2: Create/Update profile for michael@sayelevate.com and set as admin
-- This will create a profile if it doesn't exist, or update it if it does
INSERT INTO profiles (id, name, avatar_url, is_admin, is_online)
SELECT 
  u.id,
  COALESCE(
    NULLIF(TRIM(COALESCE(u.first_name || ' ', '') || COALESCE(u.last_name, '')), ''),
    u.full_name,
    u.email,
    'Admin User'
  ) as name,
  COALESCE(u.profile_picture_url, '') as avatar_url,
  true as is_admin,  -- Set as admin
  false as is_online
FROM users u
WHERE u.email = 'michael@sayelevate.com'
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;  -- Ensure is_admin is set to true

-- Step 3: Verify the admin profile was created/updated
SELECT 
  p.id, 
  p.name, 
  p.is_admin, 
  p.is_online,
  u.email,
  u.full_name,
  p.created_at 
FROM profiles p
LEFT JOIN users u ON p.id = u.id
WHERE p.is_admin = true
ORDER BY p.created_at DESC;

-- Step 4: For future admin additions, use this template:
-- Replace 'admin@example.com' with the new admin's email
/*
INSERT INTO profiles (id, name, avatar_url, is_admin, is_online)
SELECT 
  u.id,
  COALESCE(
    NULLIF(TRIM(COALESCE(u.first_name || ' ', '') || COALESCE(u.last_name, '')), ''),
    u.full_name,
    u.email,
    'Admin User'
  ) as name,
  COALESCE(u.profile_picture_url, '') as avatar_url,
  true as is_admin,
  false as is_online
FROM users u
WHERE u.email = 'admin@example.com'
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;
*/

