# 🚨 CRITICAL FIXES - User Creation Issues

## Issues Found and Fixed

### **ISSUE 1: Auth Users Overwriting** ✅ FIXED
**Problem:** New users weren't being created in `auth.users` - same record was being overwritten.

**Root Causes:**
1. Supabase Auth API might return existing user if email exists (even soft-deleted)
2. No verification that created user's email matches requested email
3. No cleanup of incorrectly created users

**Fixes Applied:**
1. ✅ Added pre-creation check to ensure email doesn't exist (unless soft-deleted)
2. ✅ Added email verification after creation to ensure created user's email matches
3. ✅ Added cleanup: Delete incorrectly created auth users if email mismatch
4. ✅ Added cleanup: Delete duplicate auth users if ID already exists in users table

### **ISSUE 2: Users Table Overwriting** ✅ FIXED
**Problem:** User data in `users` table was overwriting the same row instead of creating new rows.

**Root Cause:**
- Code was using `.upsert()` with `onConflict: 'id'` for ALL users
- This meant if a user ID already existed, it would UPDATE that row instead of creating a new one
- Even for brand new users, upsert would update existing rows if ID matched

**Fixes Applied:**
1. ✅ Changed to use `.insert()` for NEW users (will error if ID exists - prevents overwriting)
2. ✅ Only use `.upsert()` when completing an incomplete profile (user exists in auth.users but not users table)
3. ✅ Added check to determine if we're completing a profile or creating new user

## Complete Flow (After Fixes)

### Signup Flow:
1. **User enters email** → `SignupPage.tsx` calls `send-otp` with `isSignup: true`
2. **OTP sent** → `send-otp` checks if email exists in `auth.users` → blocks if exists (unless soft-deleted)
3. **User enters OTP** → `SignupPage.tsx` calls `verify-otp` with `isSignup: true`
4. **verify-otp function:**
   - ✅ Checks if email exists in `auth.users` → blocks if complete profile exists
   - ✅ Checks if email exists in `users` table → deletes orphaned records
   - ✅ **Pre-creation check:** Verifies email doesn't exist before creating
   - ✅ **Creates NEW auth user** via REST API: `POST /auth/v1/admin/users`
   - ✅ **Verifies created user:** Ensures email matches, ID doesn't exist in users table
   - ✅ **Creates NEW users table row** using `.insert()` (not `.upsert()`)
   - ✅ Returns `userId` to frontend

5. **Frontend stores userId** in localStorage
6. **User completes onboarding** → `save-profile` updates users table with profile data

## Key Code Changes

### 1. Pre-Creation Email Check
```typescript
// Double-check email doesn't exist before creating
const preCreateCheck = await fetch(...);
if (preCheckData.users && preCheckData.users.length > 0 && !existingUser.deleted_at) {
  // Block signup - email already exists
}
```

### 2. Post-Creation Email Verification
```typescript
// Verify created user's email matches requested email
if (newUserData.email?.toLowerCase() !== email.toLowerCase()) {
  // Delete incorrectly created user and return error
}
```

### 3. Users Table Insert (Not Upsert for New Users)
```typescript
// Check if user already exists in users table
const existingUserCheck = await supabaseClient.from('users').select('id').eq('id', authUserId).maybeSingle();

if (existingUserCheck) {
  // Complete incomplete profile - use UPSERT
  .upsert({...}, { onConflict: 'id' })
} else {
  // NEW user - use INSERT (will error if ID exists - prevents overwriting)
  .insert({...})
}
```

## Testing Checklist

After deploying, test:

1. ✅ **New User Signup:**
   - Sign up with `test1@example.com`
   - Verify new row created in `auth.users` with unique ID
   - Verify new row created in `users` table with same ID

2. ✅ **Second New User:**
   - Sign up with `test2@example.com`
   - Verify ANOTHER new row created in `auth.users` (different ID)
   - Verify ANOTHER new row created in `users` table (different ID)
   - Verify `test1@example.com` data is NOT overwritten

3. ✅ **Duplicate Email:**
   - Try signing up with `test1@example.com` again
   - Should get error: "This email is already registered"

4. ✅ **Incomplete Profile:**
   - Sign up with email → create auth user → fail before users table insert
   - Sign up again with same email
   - Should complete the profile (not create duplicate)

## Deployment

```bash
cd "/Users/diel/Documents/elevate (c)"
npx supabase functions deploy verify-otp
```

## Monitoring

After deployment, check logs for:
- `✅ Created NEW Supabase Auth user with ID: [unique-id]`
- `✅ Verified: This is a truly new user (not in users table yet)`
- `📝 Inserting NEW user into users table: { id: [unique-id], email: ... }`
- `✅ Successfully created new user entry in users table`

If you see:
- `❌ CRITICAL ERROR: Created user email does not match` → Auth API bug
- `❌ ERROR: User ID already exists in users table!` → Duplicate creation bug
- `❌ User already exists in users table (unique constraint violation)` → Insert attempted on existing ID

## Database Triggers Check

No database triggers should interfere, but verify:
```sql
-- Check for triggers on users table
SELECT * FROM pg_trigger WHERE tgrelid = 'users'::regclass;

-- Check for triggers on auth.users (if accessible)
-- Note: auth.users is managed by Supabase, triggers are internal
```

## RLS Policies Check

Verify RLS allows inserts:
```sql
-- Check RLS policies on users table
SELECT * FROM pg_policies WHERE tablename = 'users';

-- Should have policy allowing INSERT for authenticated users or service role
```

