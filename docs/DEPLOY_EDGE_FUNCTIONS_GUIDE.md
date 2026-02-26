# How to Deploy Edge Functions - Step by Step

## What are Edge Functions?

Edge Functions are serverless functions (like API endpoints) that run on Supabase's servers. They handle:
- Admin login authentication
- Session verification
- Permission checking
- And other backend operations

Think of them as the "backend API" for your admin system.

## Two Ways to Deploy

### Method 1: Using Supabase Dashboard (Easiest - No CLI needed)

**Step 1: Install Supabase CLI** (one-time setup)
```bash
# Install via npm (if you have Node.js)
npm install -g supabase

# OR install via Homebrew (Mac)
brew install supabase/tap/supabase

# OR download from: https://github.com/supabase/cli/releases
```

**Step 2: Login to Supabase**
```bash
supabase login
```
This will open your browser to authenticate.

**Step 3: Link your project**
```bash
cd "/Users/diel/Documents/project 17/elevate (c)"
supabase link --project-ref YOUR_PROJECT_REF
```

**How to find your Project Ref:**
1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **General**
4. Copy the **Reference ID** (looks like: `abcdefghijklmnop`)

**Step 4: Deploy the functions**
```bash
# Deploy all admin functions at once
supabase functions deploy admin-login
supabase functions deploy admin-logout
supabase functions deploy admin-verify-session
supabase functions deploy admin-check-permission
supabase functions deploy admin-channels
```

### Method 2: Using Supabase Dashboard (Manual Upload)

If you don't want to use CLI, you can manually create functions in the dashboard:

1. Go to Supabase Dashboard → **Edge Functions**
2. Click **Create a new function**
3. Name it: `admin-login`
4. Copy the code from `supabase/functions/admin-login/index.ts`
5. Paste into the editor
6. Click **Deploy**
7. Repeat for each function:
   - `admin-logout`
   - `admin-verify-session`
   - `admin-check-permission`
   - `admin-channels`

**Note:** This method is more tedious but doesn't require CLI.

## Verify Deployment

After deploying, you should see all functions listed in:
**Supabase Dashboard → Edge Functions**

They should show as "Active" or "Deployed".

## Test the Functions

Once deployed, you can test them by:
1. Going to `/admin/login` in your app
2. Trying to log in with your admin credentials
3. If it works, the functions are deployed correctly!

## Troubleshooting

### "Command not found: supabase"
- Install Supabase CLI first (see Method 1, Step 1)

### "Not logged in"
- Run `supabase login` first

### "Project not linked"
- Run `supabase link --project-ref YOUR_PROJECT_REF`

### Functions not working after deployment
- Check Supabase Dashboard → Edge Functions → Logs
- Look for error messages
- Verify environment variables are set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

## Quick Reference

**Your Edge Functions are located at:**
```
supabase/functions/
├── admin-login/index.ts
├── admin-logout/index.ts
├── admin-verify-session/index.ts
├── admin-check-permission/index.ts
└── admin-channels/index.ts
```

**After deployment, they'll be accessible at:**
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/admin-login
https://YOUR_PROJECT_REF.supabase.co/functions/v1/admin-logout
etc.
```

Your React app automatically uses these URLs (configured in `AdminAuthContext.tsx`).
