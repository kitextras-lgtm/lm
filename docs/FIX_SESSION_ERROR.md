# Fix "Failed to create session" in Edge Function

## ✅ Good News
The SQL test worked! This means:
- Database table exists ✅
- Admin exists ✅
- Data types are correct ✅
- Permissions are fine ✅

## 🔍 The Issue
The problem is in the **Edge Function code**, not the database.

## 🐛 Most Likely Causes

### 1. Service Role Key Not Set
The Edge Function needs `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.

**Check:**
1. Supabase Dashboard → Settings → API
2. Copy the **service_role** key (not anon key!)
3. Supabase Dashboard → Edge Functions → Settings → Secrets
4. Verify `SUPABASE_SERVICE_ROLE_KEY` is set

**If missing, add it:**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your service role key from Settings → API

### 2. IP Address Format Issue
The code might be passing an invalid IP format.

**Current code uses:** `127.0.0.1` as fallback (should work)

**Check Edge Functions logs** to see what IP is being passed.

### 3. Error in Logs
The updated code should show more details. Check:
1. Supabase Dashboard → Edge Functions → `admin-login` → Logs
2. Look for the exact error message
3. It should show what went wrong

## 🔧 Quick Fix Steps

### Step 1: Verify Service Role Key
```bash
# In Supabase Dashboard:
Settings → API → Copy "service_role" key
Edge Functions → Settings → Secrets → Add/Verify SUPABASE_SERVICE_ROLE_KEY
```

### Step 2: Check Logs
1. Try logging in again
2. Go to Edge Functions → `admin-login` → Logs
3. Look for the error (should have more details now)
4. Share the error message

### Step 3: Test with Better Error Handling
The updated code should return the actual error. Try logging in and check:
- Browser console (F12)
- Edge Functions logs

## 📋 What to Share

After checking, share:
1. **Edge Functions Logs** - The exact error from `admin-login` logs
2. **Service Role Key Status** - Is it set in Edge Functions secrets?
3. **Any other errors** you see

The SQL test proves the database works, so it's definitely an Edge Function configuration or code issue!
