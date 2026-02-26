-- ============================================================================
-- CREATE ADMIN PROFILE FOR CHAT SYSTEM
-- ============================================================================
-- This creates a profile entry for michael@sayelevate.com from the admins table
-- Since admins are separate from users, we create a standalone profile entry
-- ============================================================================

-- Step 1: Check if michael@sayelevate.com exists in admins table
SELECT id, email, full_name 
FROM admins 
WHERE email = 'michael@sayelevate.com';

-- Step 2: Create admin profile for michael@sayelevate.com
-- This creates a profile with is_admin = true, not linked to users table
INSERT INTO profiles (id, name, avatar_url, is_admin, is_online)
SELECT 
  id,  -- Use the admin's ID from admins table as the profile ID
  COALESCE(full_name, email, 'Admin') as name,
  '' as avatar_url,
  true as is_admin,
  false as is_online
FROM admins
WHERE email = 'michael@sayelevate.com'
ON CONFLICT (id) 
DO UPDATE SET 
  is_admin = true,
  name = COALESCE(EXCLUDED.name, profiles.name);

-- Step 3: Verify the admin profile was created
SELECT 
  p.id, 
  p.name, 
  p.is_admin, 
  a.email as admin_email,
  p.created_at 
FROM profiles p
LEFT JOIN admins a ON p.id = a.id
WHERE p.is_admin = true;


