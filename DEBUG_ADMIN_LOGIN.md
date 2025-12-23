# Debug "Failed to fetch" Error - Admin Login

## 🔍 Check These Logs (In Order)

### 1. Browser Console (Most Important!)

**How to check:**
1. Open your browser
2. Press `F12` (or right-click → Inspect)
3. Go to **Console** tab
4. Try logging in again
5. Look for red error messages

**What to look for:**
- Network errors (CORS, 404, 500)
- JavaScript errors
- Failed fetch requests
- The exact error message

**Common errors you might see:**
```
Failed to fetch
CORS policy error
404 Not Found
500 Internal Server Error
```

---

### 2. Supabase Edge Functions Logs

**How to check:**
1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Click **Edge Functions** in left sidebar
4. Click on **`admin-login`** function
5. Go to **Logs** tab
6. Look for recent errors (red text)

**What to look for:**
- Function execution errors
- Database connection errors
- Missing environment variables
- Code errors

---

### 3. Network Tab (Browser DevTools)

**How to check:**
1. Open browser DevTools (`F12`)
2. Go to **Network** tab
3. Try logging in again
4. Look for the request to `admin-login`
5. Click on it to see:
   - Request URL
   - Status code (200, 404, 500, etc.)
   - Response body
   - Error details

**What to check:**
- Is the request being sent?
- What's the status code?
- What's the response?
- Is the URL correct?

---

### 4. Environment Variables

**Check if `VITE_SUPABASE_URL` is set:**

1. In your project root, check `.env` file:
   ```bash
   cat .env
   ```

2. Should have:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   ```

3. If missing, add it!

---

## 🐛 Common Issues & Fixes

### Issue 1: CORS Error
**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Fix:** Edge Functions should already have CORS headers. Check if function is deployed correctly.

---

### Issue 2: 404 Not Found
**Error:** `404` or `Function not found`

**Possible causes:**
- Function not deployed
- Wrong function name
- Wrong URL

**Fix:**
1. Go to Supabase Dashboard → Edge Functions
2. Verify `admin-login` exists and is active
3. Check the function URL in your code matches

---

### Issue 3: 500 Internal Server Error
**Error:** `500` or `Internal server error`

**Fix:**
1. Check Edge Functions → Logs
2. Look for the specific error
3. Common issues:
   - Missing environment variables
   - Database connection error
   - Code syntax error

---

### Issue 4: Wrong URL
**Error:** Network error or connection refused

**Check:**
1. Open browser console
2. Look at the Network tab
3. See what URL is being called
4. Should be: `https://YOUR_PROJECT.supabase.co/functions/v1/admin-login`

**Fix:** Verify `VITE_SUPABASE_URL` in `.env` file

---

## 🔧 Quick Debug Steps

### Step 1: Check Browser Console
```javascript
// Open console and check:
console.log('SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
```

### Step 2: Test Edge Function Directly
```bash
# In browser console, try:
fetch('https://YOUR_PROJECT.supabase.co/functions/v1/admin-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test' })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### Step 3: Check Function Status
1. Supabase Dashboard → Edge Functions
2. Verify all 5 functions show as "Active"
3. Click each one → Check "Logs" tab

---

## 📋 Debug Checklist

- [ ] Browser console shows error (what is it?)
- [ ] Network tab shows the request (what status code?)
- [ ] Edge Functions logs show errors (what error?)
- [ ] `VITE_SUPABASE_URL` is set in `.env`
- [ ] All 5 Edge Functions are deployed and active
- [ ] Function URL is correct in code

---

## 🎯 Most Likely Issues

1. **Missing `VITE_SUPABASE_URL`** - Check `.env` file
2. **Function not deployed** - Check Supabase Dashboard
3. **Wrong function URL** - Check the URL in `AdminAuthContext.tsx`
4. **CORS error** - Check browser console
5. **Function code error** - Check Edge Functions logs

---

## 💡 Quick Fixes

### Fix 1: Add Missing Environment Variable
```bash
# In project root, create/update .env:
echo "VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co" >> .env
```

### Fix 2: Restart Dev Server
```bash
# Stop server (Ctrl+C)
# Start again:
npm run dev
```

### Fix 3: Redeploy Function
1. Supabase Dashboard → Edge Functions
2. Click `admin-login`
3. Check code is correct
4. Click "Deploy" again

---

## 📞 What to Share for Help

If still stuck, share:
1. **Browser console error** (screenshot or copy text)
2. **Network tab details** (status code, response)
3. **Edge Functions logs** (from Supabase Dashboard)
4. **Your `.env` file** (without secrets!)
