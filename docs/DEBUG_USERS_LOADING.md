# Debug Users Loading Issue

## Steps to Debug

1. **Open Browser Console** (F12 → Console tab)
2. **Click on "Users" in admin dashboard**
3. **Look for these logs**:
   - 🚀 Starting fetchUsers...
   - 🔍 Fetching users...
   - 📡 Making direct fetch to: [URL]
   - 📥 Direct response status: [status]
   - 📦 Parsed response: [data]

## Common Issues & Solutions

### Issue 1: Edge Function Not Deployed
**Symptoms**: 404 error in console
**Solution**: 
```bash
cd "/Users/diel/Documents/elevate (c)"
supabase functions deploy admin-users
```

### Issue 2: Session Token Missing
**Symptoms**: 401 Unauthorized error
**Solution**: Log out and log back in to admin dashboard

### Issue 3: Permission Denied
**Symptoms**: 403 Forbidden error
**Solution**: Check if admin role has `users.view` permission

### Issue 4: Network Error
**Symptoms**: TypeError: Failed to fetch
**Solution**: Check internet connection and Supabase URL

### Issue 5: Response Format Issue
**Symptoms**: "Invalid response format" error
**Solution**: Check console logs for actual response structure

## Quick Test

Run this in browser console while on admin dashboard:

```javascript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sessionToken = 'YOUR_SESSION_TOKEN'; // Get from Network tab

fetch(`${supabaseUrl}/functions/v1/admin-users`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    'X-Session-Token': sessionToken,
  },
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Check Edge Function Logs

1. Go to Supabase Dashboard
2. Navigate to Edge Functions → admin-users
3. Check "Logs" tab for errors
