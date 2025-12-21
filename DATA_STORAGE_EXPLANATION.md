# Where User Data is Stored

## Overview
User data from onboarding is stored in **TWO tables**:

### 1. `user_profiles` Table (Main Profile Data)
This is where **most** of the onboarding data is saved:
- `first_name` - First name
- `last_name` - Last name  
- `username` - Unique username (with @)
- `profile_picture_url` - URL to profile picture
- `location` - User's location/country
- `primary_language` - User's primary language
- `user_type` - 'artist', 'creator', or 'business'
- `profile_completed` - Boolean flag
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Location in Supabase Dashboard:**
- Go to: **Table Editor** → **user_profiles**

### 2. `users` Table (Basic User Info)
This table stores basic user information:
- `id` - User ID (matches auth.users.id)
- `email` - User's email address
- `full_name` - Combined first + last name
- `user_type` - 'artist', 'creator', or 'business'
- `verified` - Email verification status
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Location in Supabase Dashboard:**
- Go to: **Table Editor** → **users**

## Data Flow During Onboarding

1. **OTP Verification** (`verify-otp` Edge Function):
   - Creates user in `auth.users`
   - Creates/updates entry in `users` table with: `id`, `email`, `verified: true`

2. **Make Profile Page** (`save-profile` Edge Function):
   - Saves to `user_profiles`: `first_name`, `last_name`, `username`, `profile_picture_url`
   - Updates `users` table: `full_name` (combined first + last)

3. **Tell Us About Yourself Page** (`save-profile` Edge Function):
   - Updates `user_profiles`: `location`, `primary_language`

4. **User Type Selection Page** (`save-profile` Edge Function):
   - Updates `user_profiles`: `user_type`, `profile_completed: true`
   - Updates `users` table: `user_type`

## How to Check Data

### To see profile data (name, username, picture, etc.):
```sql
SELECT * FROM user_profiles WHERE id = 'USER_ID_HERE';
```

### To see basic user info (email, full_name):
```sql
SELECT * FROM users WHERE id = 'USER_ID_HERE';
```

### To see both together:
```sql
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.user_type,
  up.first_name,
  up.last_name,
  up.username,
  up.profile_picture_url,
  up.location,
  up.primary_language,
  up.profile_completed
FROM users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE u.email = 'user@example.com';
```

## Important Notes

- **Most profile data is in `user_profiles`**, not `users`
- The `users` table is mainly for basic info (email, full_name)
- Both tables use the same `id` (from `auth.users`)
- If you don't see data in `users`, check `user_profiles` instead



