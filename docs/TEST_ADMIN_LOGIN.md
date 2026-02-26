# ✅ Test Your Admin Login - Next Steps

## Step 1: Access Admin Login Page

1. **Start your dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Navigate to admin login:**
   ```
   http://localhost:5173/admin/login
   ```
   (Replace 5173 with your actual port)

## Step 2: Login

1. **Enter your credentials:**
   - **Email:** `michael@sayelevate.com`
   - **Password:** The password you used when creating the bcrypt hash (NOT the hash itself!)

2. **Click "Sign in"**

3. **If TOTP is enabled:** Enter your 6-digit code from authenticator app

## Step 3: Verify Success

After logging in, you should:
- ✅ Be redirected to `/admin/dashboard`
- ✅ See the admin dashboard with navigation bar
- ✅ See your email/name in the dropdown (top right)
- ✅ See your role displayed (e.g., "SUPER ADMINISTRATOR")

## Step 4: Test Logout

1. Click your profile icon (top right)
2. Click "Log out"
3. You should be redirected back to `/admin/login`

## ✅ Success Checklist

- [ ] Can access `/admin/login` page
- [ ] Can log in with your credentials
- [ ] Redirected to `/admin/dashboard` after login
- [ ] See admin dropdown with your info
- [ ] Can log out successfully

## 🐛 Troubleshooting

### "Invalid email or password"
- Verify admin exists: Run in Supabase SQL Editor:
  ```sql
  SELECT email, is_active, account_locked_until 
  FROM admins 
  WHERE email = 'michael@sayelevate.com';
  ```
- Check if account is locked
- Verify you're using the ORIGINAL password (not the hash)

### "No session token provided"
- Check browser console for errors
- Verify Edge Functions are deployed and active
- Check Supabase Dashboard → Edge Functions → Logs

### "Failed to fetch" or network errors
- Check if dev server is running
- Verify `VITE_SUPABASE_URL` is set in `.env` file
- Check browser console for CORS errors

### Functions not working
- Go to Supabase Dashboard → Edge Functions
- Check each function shows as "Active" or "Deployed"
- Click on a function → "Logs" tab to see errors

## 🎉 What's Next?

Once login works, you can:
1. **Build admin features** (channels, users, announcements, etc.)
2. **Add more admin users** with different roles
3. **Enable TOTP** for extra security
4. **Customize the dashboard** with admin features

## 📝 Quick Reference

**Admin Login URL:**
- Dev: `http://localhost:5173/admin/login`
- Production: `https://your-domain.com/admin/login`

**Your Credentials:**
- Email: `michael@sayelevate.com`
- Password: (the original password you hashed)

**Edge Functions Status:**
- Check: Supabase Dashboard → Edge Functions
- All 5 should be listed and active
