# Deploy Edge Functions via Supabase Dashboard (No CLI Needed!)

## Step-by-Step Guide

### Step 1: Go to Edge Functions in Dashboard

1. Open your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click **Edge Functions** in the left sidebar

### Step 2: Deploy Each Function

For each function below, follow these steps:

#### Function 1: admin-login

1. Click **"Create a new function"** or **"New Function"**
2. Name it: `admin-login`
3. Click **Create**
4. You'll see a code editor
5. Copy ALL the code from: `supabase/functions/admin-login/index.ts`
6. Paste it into the editor
7. Click **Deploy** (or **Save**)

#### Function 2: admin-logout

1. Click **"Create a new function"** again
2. Name it: `admin-logout`
3. Copy code from: `supabase/functions/admin-logout/index.ts`
4. Paste and Deploy

#### Function 3: admin-verify-session

1. Create new function: `admin-verify-session`
2. Copy code from: `supabase/functions/admin-verify-session/index.ts`
3. Paste and Deploy

#### Function 4: admin-check-permission

1. Create new function: `admin-check-permission`
2. Copy code from: `supabase/functions/admin-check-permission/index.ts`
3. Paste and Deploy

#### Function 5: admin-channels

1. Create new function: `admin-channels`
2. Copy code from: `supabase/functions/admin-channels/index.ts`
3. Paste and Deploy

## File Locations in Your Project

Your function code files are here:
```
/Users/diel/Documents/project 17/elevate (c)/supabase/functions/
├── admin-login/index.ts          ← Copy this
├── admin-logout/index.ts         ← Copy this
├── admin-verify-session/index.ts ← Copy this
├── admin-check-permission/index.ts ← Copy this
└── admin-channels/index.ts       ← Copy this
```

## Quick Copy-Paste Method

**Option A: Open files in your editor**
1. Open each `.ts` file in VS Code/Cursor
2. Select All (Cmd/Ctrl + A)
3. Copy (Cmd/Ctrl + C)
4. Paste into Supabase Dashboard editor

**Option B: Use terminal to view**
```bash
cd "/Users/diel/Documents/project 17/elevate (c)"
cat supabase/functions/admin-login/index.ts
# Then copy the output
```

## Verify Deployment

After deploying all 5 functions:
1. Go back to **Edge Functions** list in Dashboard
2. You should see all 5 functions listed:
   - ✅ admin-login
   - ✅ admin-logout
   - ✅ admin-verify-session
   - ✅ admin-check-permission
   - ✅ admin-channels

## Important Notes

- **No SQL needed** - Edge Functions are TypeScript/JavaScript code
- **Deploy via Dashboard** - No command line required
- **Each function is separate** - Deploy them one by one
- **Code is in your project** - Just copy/paste from the files

## After Deployment

Once all functions are deployed:
1. ✅ Your admin login will work
2. ✅ You can test at `/admin/login`
3. ✅ Functions will be accessible at: `https://YOUR_PROJECT.supabase.co/functions/v1/admin-login`

## Troubleshooting

**"Function already exists"**
- Edit the existing function instead of creating new
- Or delete and recreate

**"Deployment failed"**
- Check for syntax errors in the code
- Make sure you copied the ENTIRE file
- Check the Logs tab for error messages

**"Function not working"**
- Verify environment variables are set (they should be automatic)
- Check Edge Functions → Logs for errors
- Make sure you deployed ALL 5 functions
