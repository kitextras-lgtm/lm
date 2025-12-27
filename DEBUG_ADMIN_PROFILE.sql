-- ============================================================================
-- DEBUG: Check if admin profile exists and is accessible
-- ============================================================================

-- Step 1: Check if admin profile exists (bypassing RLS)
-- Note: This query runs with service role, so it bypasses RLS
SELECT 
  p.id, 
  p.name, 
  p.is_admin, 
  u.email,
  p.created_at 
FROM profiles p
LEFT JOIN users u ON p.id = u.id
WHERE p.is_admin = true;

-- Step 2: Check all profiles to see what exists
SELECT 
  p.id, 
  p.name, 
  p.is_admin,
  u.email
FROM profiles p
LEFT JOIN users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 20;

-- Step 3: If no admin profile exists, check if michael@sayelevate.com user exists
SELECT id, email, full_name, first_name, last_name 
FROM users 
WHERE email = 'michael@sayelevate.com';

-- Step 4: If user exists but no profile, create it manually
-- (Only run this if Step 1 shows no admin profile)
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
WHERE u.email = 'michael@sayelevate.com'
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;
*/


