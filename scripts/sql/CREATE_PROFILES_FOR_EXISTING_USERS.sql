-- Step 1: First, let's see what users you have in your database
-- Run this query to see all your users and their IDs:
SELECT id, email, full_name, COALESCE(first_name, '') as first_name, COALESCE(last_name, '') as last_name
FROM users 
ORDER BY created_at DESC
LIMIT 20;

-- Step 2: After you see your users, run this to create profiles for ALL existing users
-- This will automatically create a profile for each user in your users table
-- The profile ID will match the user ID, and it will use their name from the users table

-- Try to use first_name + last_name if they exist, otherwise use full_name, otherwise use email
INSERT INTO profiles (id, name, avatar_url, is_admin, is_online)
SELECT 
  u.id,
  COALESCE(
    NULLIF(TRIM(COALESCE(u.first_name || ' ', '') || COALESCE(u.last_name, '')), ''),
    u.full_name,
    u.email,
    'User'
  ) as name,
  COALESCE(u.profile_picture_url, '') as avatar_url,
  false as is_admin,
  false as is_online
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify the profiles were created
SELECT id, name, is_admin, is_online, created_at 
FROM profiles 
ORDER BY created_at DESC;

