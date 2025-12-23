# Debug "Failed to create session" Error

## 🔍 Check Supabase Edge Functions Logs

1. Go to **Supabase Dashboard** → **Edge Functions**
2. Click on **`admin-login`** function
3. Go to **Logs** tab
4. Look for the most recent error (should be red)
5. Copy the error message

The error will tell us exactly what's wrong.

## 🐛 Common Causes

### 1. Invalid IP Address Format
**Error:** `invalid input syntax for type inet`

**Fix:** The `ip_address` field expects a valid IP address. If you're passing "unknown", it will fail.

**Solution:** I've updated the code to use `127.0.0.1` as fallback instead of "unknown".

### 2. RLS Policy Blocking
**Error:** `new row violates row-level security policy`

**Fix:** Even with service role, RLS might be blocking. Check if the service role key is correct.

### 3. Missing Column or Wrong Data Type
**Error:** `column "xxx" does not exist` or `invalid input syntax`

**Fix:** Verify the migration ran successfully and all columns exist.

### 4. Foreign Key Constraint
**Error:** `insert or update on table "admin_sessions" violates foreign key constraint`

**Fix:** The `admin_id` might not exist. Verify the admin was created correctly.

## 🔧 Quick Fixes

### Fix 1: Check if Migration Ran
Run this in Supabase SQL Editor:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_sessions';
```

Should show:
- id (uuid)
- admin_id (uuid)
- session_token_hash (character varying)
- ip_address (inet)
- user_agent (text)
- expires_at (timestamp with time zone)
- last_activity_at (timestamp with time zone)
- created_at (timestamp with time zone)

### Fix 2: Test Session Insert Manually
```sql
-- Get your admin ID first
SELECT id FROM admins WHERE email = 'michael@sayelevate.com';

-- Then try inserting a session (replace ADMIN_ID with actual ID)
INSERT INTO admin_sessions (
  admin_id,
  session_token_hash,
  ip_address,
  user_agent,
  expires_at,
  last_activity_at
) VALUES (
  'ADMIN_ID_HERE',
  'test_hash_123456789012345678901234567890123456789012345678901234567890',
  '127.0.0.1',
  'test',
  NOW() + INTERVAL '30 minutes',
  NOW()
);
```

If this fails, you'll see the exact error.

### Fix 3: Check Service Role Key
Verify the service role key is set in Supabase:
1. Dashboard → Settings → API
2. Copy "service_role" key
3. Verify it's set as environment variable in Edge Functions

## 📋 What to Share

After checking logs, share:
1. **The exact error message** from Edge Functions logs
2. **The result** of the manual INSERT test above
3. **Any other errors** you see

This will help pinpoint the exact issue!
