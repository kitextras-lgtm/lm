# Admin System Setup Guide

## 🚀 Quick Start - Access the Admin Panel

### Step 1: Run the Database Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project: https://app.supabase.com
   - Navigate to **SQL Editor**

2. **Run the Migration**
   - Copy the contents of `supabase/migrations/20250122000000_create_admin_system.sql`
   - Paste into SQL Editor
   - Click **Run** to execute the migration
   - Verify all tables were created successfully

### Step 2: Create Your First Super Admin

**Option A: Using Supabase SQL Editor (Recommended)**

1. Generate a bcrypt hash for your password. Use one of these methods:

   **Method 1: Online Tool**
   - Visit: https://bcrypt-generator.com/
   - Enter your password
   - Set rounds to **10** (cost factor)
   - Copy the generated hash

   **Method 2: Node.js (if you have it installed)**
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YOUR_PASSWORD', 10).then(hash => console.log(hash));"
   ```

2. Run this SQL in Supabase SQL Editor (replace the placeholders):

   ```sql
   -- Insert your first super admin
   INSERT INTO admins (email, password_hash, role_id, full_name, totp_enabled)
   SELECT 
       'admin@elevate.com',  -- Change to your admin email
       '$2b$10$YOUR_BCRYPT_HASH_HERE',  -- Paste your bcrypt hash
       id,
       'Super Administrator',
       false  -- Set to true after setting up TOTP
   FROM admin_roles
   WHERE name = 'super_admin'
   RETURNING id, email, full_name;
   ```

3. **Verify the admin was created:**
   ```sql
   SELECT id, email, full_name, is_active 
   FROM admins 
   WHERE email = 'admin@elevate.com';
   ```

### Step 3: Deploy Edge Functions

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find your project ref in Supabase Dashboard > Settings > General)

4. **Deploy all admin functions:**
   ```bash
   supabase functions deploy admin-login
   supabase functions deploy admin-logout
   supabase functions deploy admin-verify-session
   supabase functions deploy admin-check-permission
   supabase functions deploy admin-channels
   ```

   Or deploy all at once:
   ```bash
   supabase functions deploy admin-login admin-logout admin-verify-session admin-check-permission admin-channels
   ```

### Step 4: Set Environment Variables

1. **In Supabase Dashboard:**
   - Go to **Project Settings** > **Edge Functions** > **Secrets**
   - Add these secrets (they should already exist, but verify):
     - `SUPABASE_URL` - Your project URL
     - `SUPABASE_SERVICE_ROLE_KEY` - Your service role key (found in Settings > API)

   These are automatically available to Edge Functions, but verify they're set.

### Step 5: Access Admin Login Page

1. **Start your development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Navigate to Admin Login:**
   ```
   http://localhost:5173/admin/login
   ```
   (Replace 5173 with your actual dev server port)

3. **Or in production:**
   ```
   https://your-domain.com/admin/login
   ```

### Step 6: Login as Admin

1. Enter your admin credentials:
   - **Email**: `admin@elevate.com` (or whatever you used in Step 2)
   - **Password**: The password you hashed in Step 2

2. If TOTP is enabled:
   - Enter the 6-digit code from your authenticator app

3. Click **"Sign in"**

4. You'll be redirected to `/admin/dashboard`

## 📋 Verification Checklist

After setup, verify everything works:

- [ ] Database migration ran successfully (check tables exist)
- [ ] Admin user created (run `SELECT * FROM admins;`)
- [ ] Edge functions deployed (check in Supabase Dashboard > Edge Functions)
- [ ] Can access `/admin/login` page
- [ ] Can log in with admin credentials
- [ ] Redirected to `/admin/dashboard` after login
- [ ] Admin dropdown shows correct role and email

## 🔧 Troubleshooting

### "No session token provided" error
- Make sure you're logged in
- Check browser console for errors
- Try clearing cookies and logging in again

### "Invalid email or password" error
- Verify the admin email exists: `SELECT email FROM admins;`
- Check if account is locked: `SELECT account_locked_until FROM admins WHERE email = 'admin@elevate.com';`
- Verify the password hash was generated correctly
- Reset failed attempts: `UPDATE admins SET failed_login_attempts = 0, account_locked_until = NULL WHERE email = 'admin@elevate.com';`

### Edge Function errors
- Check Supabase Dashboard > Edge Functions > Logs
- Verify environment variables are set
- Check function code for syntax errors

### "Permission denied" errors
- Verify your admin has the correct role: `SELECT ar.name FROM admins a JOIN admin_roles ar ON a.role_id = ar.id WHERE a.email = 'admin@elevate.com';`
- Check permissions: `SELECT default_permissions FROM admin_roles WHERE name = 'super_admin';`

## 🔐 Security Best Practices

1. **Change default admin email** from `admin@elevate.com` to your actual admin email
2. **Enable TOTP** for your admin account (see TOTP Setup below)
3. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
4. **Keep session tokens secure** - they're stored in memory only (lost on page reload)
5. **Monitor audit logs** regularly: `SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 50;`

## 📝 Next Steps After Initial Setup

### 1. Enable TOTP (Two-Factor Authentication)

**Generate TOTP Secret:**
```sql
-- Generate a secret (use a TOTP library or online generator)
-- Then update your admin:
UPDATE admins 
SET totp_secret = 'YOUR_BASE32_SECRET',
    totp_enabled = true
WHERE email = 'admin@elevate.com';
```

**Create Edge Function for TOTP Setup:**
- Need to create `admin-setup-totp` function
- Generates QR code for authenticator apps
- Creates backup codes

### 2. Create Additional Admin Users

```sql
-- Create a content moderator
INSERT INTO admins (email, password_hash, role_id, full_name)
SELECT 
    'moderator@elevate.com',
    '$2b$10$HASH_HERE',
    id,
    'Content Moderator'
FROM admin_roles
WHERE name = 'content_moderator';

-- Create a support agent
INSERT INTO admins (email, password_hash, role_id, full_name)
SELECT 
    'support@elevate.com',
    '$2b$10$HASH_HERE',
    id,
    'Support Agent'
FROM admin_roles
WHERE name = 'support_agent';
```

### 3. Build Admin Feature Pages

Currently, the admin dashboard is empty. Next, create:

- **Channel Management Page** - Approve/reject channel applications
- **User Management Page** - View/search users
- **Announcements Page** - Send system announcements
- **Support Chat Page** - Handle user support tickets
- **Revenue Page** - View revenue data (requires special permission)

### 4. Set Up Session Cleanup Cron Job

Run this periodically to clean expired sessions:

```sql
-- Run manually or set up as cron job
SELECT admin_cleanup_expired_sessions();
```

Or create a Supabase Edge Function that runs on a schedule.

## 🎯 Current Admin Dashboard Status

The admin dashboard at `/admin/dashboard` currently has:
- ✅ Header navigation bar
- ✅ Admin dropdown with profile info
- ✅ Logout functionality
- ⏳ Empty content area (ready for you to add features)

## 📚 Related Documentation

- Full implementation details: `ADMIN_SYSTEM_IMPLEMENTATION.md`
- Database schema: `supabase/migrations/20250122000000_create_admin_system.sql`
- Edge Functions: `supabase/functions/admin-*`
- Frontend code: `src/pages/AdminDashboard.tsx`, `src/contexts/AdminAuthContext.tsx`

## 🆘 Need Help?

If you encounter issues:
1. Check Supabase Edge Function logs
2. Check browser console for errors
3. Verify database tables exist
4. Confirm environment variables are set
5. Review the troubleshooting section above
