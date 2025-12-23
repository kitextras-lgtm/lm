-- Test Session Insert - Run this in Supabase SQL Editor

-- First, let's get your admin ID
SELECT id, email, full_name 
FROM admins 
WHERE email = 'michael@sayelevate.com';

-- Then use the ID from above to test session insert
-- Replace 'PASTE_ADMIN_ID_HERE' with the actual UUID from the query above

-- OR run this all-in-one query (it will use the admin ID automatically):
INSERT INTO admin_sessions (
  admin_id,
  session_token_hash,
  ip_address,
  user_agent,
  expires_at,
  last_activity_at
) 
SELECT 
  id as admin_id,
  'test_hash_' || gen_random_uuid()::text as session_token_hash,
  '127.0.0.1'::inet as ip_address,
  'test user agent' as user_agent,
  NOW() + INTERVAL '30 minutes' as expires_at,
  NOW() as last_activity_at
FROM admins
WHERE email = 'michael@sayelevate.com'
RETURNING id, admin_id, created_at;

-- If this works, you should see a new session row returned
-- If it fails, you'll see the exact error
