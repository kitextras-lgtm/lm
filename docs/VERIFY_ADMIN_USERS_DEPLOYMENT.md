# Verify Admin Users Edge Function Deployment

## The `ERR_INSUFFICIENT_RESOURCES` Error

This error occurs when the browser makes too many failed requests. This usually means:
1. **The Edge Function is NOT deployed** (most likely)
2. The browser is retrying failed requests repeatedly
3. Browser resources are exhausted

## Quick Fix: Deploy the Edge Function

### Step 1: Verify Function Exists
1. Go to your Supabase Dashboard
2. Click **Edge Functions** in the left sidebar
3. Look for `admin-users` in the list
4. If it's NOT there → **You need to deploy it**

### Step 2: Deploy the Function

**Option A: Using Supabase Dashboard (Easiest)**
1. In Supabase Dashboard → Edge Functions
2. Click **Create a new function**
3. Name it: `admin-users`
4. Copy ALL code from: `supabase/functions/admin-users/index.ts`
5. Paste into the function editor
6. Click **Deploy**

**Option B: Using Supabase CLI**
```bash
cd "/Users/diel/Documents/elevate (c)"
supabase functions deploy admin-users
```

### Step 3: Verify Deployment
After deploying, check:
1. Edge Functions list shows `admin-users` with status "Active"
2. Refresh your admin dashboard
3. Click "Users" - it should work now

## Test the Function Directly

After deployment, test it in browser console:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

fetch(`${supabaseUrl}/functions/v1/admin-users`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
  }
})
.then(r => {
  console.log('Status:', r.status);
  return r.text();
})
.then(text => {
  console.log('Response:', text);
})
.catch(err => console.error('Error:', err));
```

**Expected Results:**
- ✅ **200 OK**: Function is deployed and working
- ❌ **404 Not Found**: Function is NOT deployed
- ❌ **401 Unauthorized**: Need to add X-Session-Token header (normal for direct test)

## After Deployment

Once deployed, the Users section should:
1. Show loading spinner briefly
2. Display all users in a table
3. Show user count badge
4. No more `ERR_INSUFFICIENT_RESOURCES` errors
