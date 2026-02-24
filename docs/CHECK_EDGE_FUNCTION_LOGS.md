# Check Edge Functions Logs for Exact Error

## ✅ What We Know
- ✅ Database works (SQL test succeeded)
- ✅ Service role key is set
- ✅ Admin exists

## 🔍 Next Step: Check Logs

The updated code should show detailed error messages. Here's how to check:

### Step 1: Try Logging In Again
1. Go to `/admin/login`
2. Enter your credentials
3. Click "Sign in"
4. Wait for the error

### Step 2: Check Edge Functions Logs
1. Go to **Supabase Dashboard** → **Edge Functions**
2. Click on **`admin-login`** function
3. Go to **Logs** tab
4. Look for the **most recent error** (should be red/highlighted)
5. You should see:
   - "Session creation error:" with the error details
   - "IP Address:" with the IP being used
   - "Session data:" with the data being inserted

### Step 3: Share the Error
Copy the exact error message from the logs and share it.

## 🐛 Common Issues to Look For

### Issue 1: IP Address Format
**Error might say:** `invalid input syntax for type inet`

**If you see this:** The IP address format is wrong. The code should use `127.0.0.1` but maybe it's getting something else.

### Issue 2: RLS Policy
**Error might say:** `new row violates row-level security policy`

**If you see this:** Even with service role, RLS might be blocking. We need to check the RLS policies.

### Issue 3: Missing Environment Variable
**Error might say:** `SUPABASE_SERVICE_ROLE_KEY is not defined` or similar

**If you see this:** The secret isn't being read correctly.

### Issue 4: Data Type Mismatch
**Error might say:** `invalid input syntax for type uuid` or similar

**If you see this:** One of the UUIDs or data types is wrong.

## 📋 What I Need

Please share:
1. **The exact error message** from Edge Functions logs
2. **Any console.log output** (if visible)
3. **The "Session data" log** (should show what's being inserted)

This will tell us exactly what's wrong!
