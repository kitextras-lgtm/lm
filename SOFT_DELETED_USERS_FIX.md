# 🚨 CRITICAL FIX: Soft-Deleted Users Blocking Signup

## Problem

Users were getting "This email is already registered" error for emails that don't appear in the `auth.users` table. This was caused by **soft-deleted users** in Supabase Auth.

## Root Cause

1. **Supabase Auth API returns ALL users** (including soft-deleted) when querying by email
2. **Soft-deleted users have `deleted_at` field set** but are still returned by the API
3. **`verify-otp` wasn't checking for `deleted_at`** - it was blocking signup for soft-deleted users
4. **`send-otp` correctly filtered soft-deleted users**, but `verify-otp` didn't

## The Bug

```typescript
// OLD CODE (BROKEN):
if (usersData.users && usersData.users.length > 0) {
  const existingAuthUser = usersData.users[0];
  // ❌ This blocks signup even if user is soft-deleted!
  if (userProfile && userProfile.profile_completed) {
    return error('This email is already registered');
  }
}
```

## The Fix

```typescript
// NEW CODE (FIXED):
if (usersData.users && usersData.users.length > 0) {
  const existingAuthUser = usersData.users[0];
  
  // ✅ Check if user is soft-deleted FIRST
  if (existingAuthUser.deleted_at) {
    // Allow signup - treat soft-deleted user as non-existent
    console.log('User is soft-deleted - allowing new signup');
    // Proceed with new user creation
  } else if (existingAuthUser.banned_until) {
    // Block banned users
    return error('Account banned');
  } else {
    // Check profile completion for active users only
    if (userProfile && userProfile.profile_completed) {
      return error('This email is already registered');
    }
  }
}
```

## Changes Made

### 1. `verify-otp` Function
- ✅ Added `deleted_at` check before blocking signup
- ✅ Added `banned_until` check for banned users
- ✅ Only blocks signup for **active users with complete profiles**
- ✅ Allows signup for soft-deleted users (treats as new signup)

### 2. Pre-Creation Check
- ✅ Updated to only block if user exists AND is NOT soft-deleted
- ✅ Allows creation if user is soft-deleted

## Testing

After deploying, test:

1. **Soft-Deleted User:**
   - Create user → Delete user (soft delete)
   - Try signing up with same email
   - ✅ Should allow signup (creates new user)

2. **Active User:**
   - Create user → Complete profile
   - Try signing up with same email
   - ✅ Should block signup ("email already registered")

3. **New Email:**
   - Try signing up with completely new email
   - ✅ Should allow signup (creates new user)

## Deployment

```bash
cd "/Users/diel/Documents/elevate (c)"
npx supabase functions deploy verify-otp
```

## Monitoring

Check logs for:
- `✅ User is soft-deleted - treating as non-existent, allowing new signup`
- `✅ User is soft-deleted - allowing new signup with same email`
- `⚠️ Found soft-deleted user - will create new user with same email`

If you see these logs, the fix is working correctly.

## Why Soft-Deleted Users Exist

Supabase Auth uses **soft deletes** - when a user is deleted, they're marked with `deleted_at` timestamp but not actually removed from the database. This allows:
- Account recovery
- Audit trails
- Data retention

However, soft-deleted users shouldn't block new signups with the same email.
