-- ============================================================================
-- VERIFY CHAT SYSTEM SETUP
-- ============================================================================
-- Run these queries to check if everything is set up correctly

-- 1. Check if admin profile exists
SELECT 
  p.id, 
  p.name, 
  p.is_admin, 
  u.email,
  p.created_at 
FROM profiles p
LEFT JOIN users u ON p.id = u.id
WHERE p.is_admin = true;

-- 2. Check if user profiles exist
SELECT COUNT(*) as total_profiles, 
       COUNT(CASE WHEN is_admin = true THEN 1 END) as admin_profiles
FROM profiles;

-- 3. Check if conversations exist
SELECT 
  c.id,
  c.customer_id,
  c.admin_id,
  u1.email as customer_email,
  u2.email as admin_email,
  c.last_message,
  c.created_at
FROM conversations c
LEFT JOIN users u1 ON c.customer_id = u1.id
LEFT JOIN users u2 ON c.admin_id = u2.id
ORDER BY c.created_at DESC
LIMIT 10;

-- 4. Check if a specific user has a conversation
-- Replace 'USER_ID_HERE' with an actual user ID
/*
SELECT 
  c.id,
  c.customer_id,
  c.admin_id,
  p.name as admin_name,
  c.last_message,
  c.created_at
FROM conversations c
LEFT JOIN profiles p ON c.admin_id = p.id
WHERE c.customer_id = 'USER_ID_HERE';
*/


