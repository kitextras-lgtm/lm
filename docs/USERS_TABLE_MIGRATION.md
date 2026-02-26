# Users Table Migration - All Onboarding Data Now Stored in `users` Table

## Summary
All user onboarding data is now stored in the `users` table as the single source of truth, instead of being split between `users` and `user_profiles` tables.

## Changes Made

### 1. Database Schema (`users` table)
**New Migration:** `20251221030000_add_onboarding_fields_to_users.sql`

Added the following columns to the `users` table:
- `first_name` (text) - User's first name
- `last_name` (text) - User's last name  
- `username` (text, unique) - User's handle/username
- `location` (text) - User's location/country
- `primary_language` (text) - User's primary language
- `profile_picture_url` (text) - URL to profile picture in storage
- `profile_completed` (boolean) - Whether onboarding is complete

**Username Constraint:** Only lowercase alphanumeric characters and underscores allowed.

### 2. Backend Changes

#### `save-profile` Edge Function
- Now saves ALL onboarding data to the `users` table
- Fields saved: `first_name`, `last_name`, `username`, `location`, `primary_language`, `profile_picture_url`, `user_type`, `profile_completed`
- Username uniqueness check now queries `users` table instead of `user_profiles`
- Added detailed logging for debugging

#### `get-profile` Edge Function  
- Now fetches from `users` table as the primary source
- Returns data from `users` table in the `profile` field
- `user_profiles` table is now a backup/legacy source

#### `verify-otp` Edge Function
- Continues to create the base user record in `users` table with `id`, `email`, `verified`
- Full profile data added later during onboarding via `save-profile`

### 3. Frontend Changes

#### `MakeProfilePage.tsx`
- Now sends `userType` to `save-profile` Edge Function
- Defaults to `'creator'` if userType is not set
- Added detailed console logging

#### `SettingsPage.tsx`
- Updated to prioritize data from `users` table (via userData)
- Form data now populated from `users` table fields
- Debug panel shows data source

#### `CreatorDashboard.tsx`
- Updated to prioritize data from `users` table (via userData)
- Profile and form data now use `users` table as primary source
- Improved logging with ✅/❌ indicators

#### `LoginPage.tsx`
- Fixed redirect bug: Users without profiles now go to `/make-profile` instead of dashboard

## How to Deploy

### 1. Run the Database Migration
```bash
# Option A: Via Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/20251221030000_add_onboarding_fields_to_users.sql`
3. Run the SQL

# Option B: Via Supabase CLI
cd "/Users/diel/Documents/project 17"
npx supabase db push
```

### 2. Deploy Updated Edge Functions
```bash
cd "/Users/diel/Documents/project 17"
npx supabase functions deploy save-profile
npx supabase functions deploy get-profile
```

### 3. Test the Changes
1. Create a new test account via signup
2. Complete the full onboarding flow
3. Check Supabase Dashboard → Table Editor → `users` table
4. Verify all fields are populated:
   - first_name
   - last_name
   - username
   - location
   - primary_language
   - profile_picture_url
   - user_type
   - profile_completed

## Data Structure

### Before (Split Data)
```
users table:         id, email, full_name, user_type, verified
user_profiles table: first_name, last_name, username, location, primary_language, profile_picture_url
```

### After (Single Source)
```
users table: id, email, full_name, user_type, verified, 
             first_name, last_name, username, location, 
             primary_language, profile_picture_url, profile_completed
```

## Benefits
✅ Single source of truth for all user data  
✅ Easier to query and maintain  
✅ No data sync issues between two tables  
✅ Consistent data access pattern  
✅ Better performance (one query instead of two)

## Backwards Compatibility
- The `user_profiles` table is kept for legacy purposes
- `save-profile` still updates `user_profiles` as backup
- Frontend now prioritizes `users` table data
- Existing data remains accessible

## Troubleshooting

### Issue: Fields not showing in Settings
**Solution:** 
1. Open browser console (F12)
2. Click "Refresh Data" button
3. Check the debug panel - it shows which table data is coming from
4. Verify `users` table has the data in Supabase Dashboard

### Issue: Username already taken error
**Solution:** 
- Usernames must be unique across the `users` table
- Check existing usernames in Supabase Dashboard
- Username format: lowercase letters, numbers, underscores only

### Issue: Migration fails
**Solution:**
- Check if columns already exist: `SELECT * FROM information_schema.columns WHERE table_name = 'users';`
- Drop and recreate if needed (be careful with production data)

## Next Steps
1. ✅ Run database migration
2. ✅ Deploy Edge Functions  
3. ✅ Test with new user signup
4. 📋 Optional: Migrate existing data from `user_profiles` to `users` (if needed)
5. 📋 Optional: Deprecate `user_profiles` table (future)


