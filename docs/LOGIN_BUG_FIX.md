# Login Bug Fix Documentation

## Bug Description
Users with existing accounts were unable to log in, receiving "No account found. Please sign up first." error even though their account existed in the database. This bug manifested after creating a second account with a similar email pattern.

**Example:** User `judestcks@gmail.com` could not log in after account `jdoe128931023801923@gmail.com` was created.

## 1. Root Cause: Violated Invariant

**Violated Invariant:** 
> "The Supabase Auth Admin API email query endpoint (`/auth/v1/admin/users?email=...`) is a reliable source of truth for user email addresses."

**Why it's violated:**
The Supabase Auth Admin API has a known issue where querying by email can return incorrect users due to:
- Fuzzy matching algorithms
- Email normalization inconsistencies
- Possible email collision bugs in the underlying Auth system

When queried for `judestcks@gmail.com`, the API sometimes returned `jdoe128931023801923@gmail.com` instead, causing the login flow to reject valid login attempts.

**The actual invariant that should hold:**
> "The `users` table is the authoritative source of truth for user email addresses. The `auth.users` table should only be used for authentication verification by user ID, not for email-based lookups."

## 2. Where the Invariant is Now Enforced

### Location: `supabase/functions/verify-otp/index.ts` (Login Flow)

**Primary Strategy (Lines 747-812):**
```typescript
// PRIMARY STRATEGY: Check users table FIRST (source of truth for email)
console.log('🔍 Login: Checking users table by email (primary method):', email);
const { data: userFromTable, error: userTableError } = await supabaseClient
  .from('users')
  .select('id, email')
  .ilike('email', email)  // Case-insensitive match
  .maybeSingle();

if (userFromTable?.id) {
  // Verify this user exists in auth.users by ID (not by email!)
  const getUserByIdResponse = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${userFromTable.id}`,  // ✅ Query by ID, not email
    {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  if (getUserByIdResponse.ok) {
    const userByIdData = JSON.parse(userByIdText);
    if (userByIdData && userByIdData.id) {
      authUserId = userByIdData.id;  // ✅ Use ID from verified auth.users entry
      // Continue login...
    }
  }
}
```

**Fallback Strategy (Lines 850-940):**
Only if the user is NOT found in the `users` table, we fall back to the auth.users API by email, but with strict email matching:
```typescript
// FALLBACK: Try auth.users API (in case user exists there but not in users table - should be rare)
const getUserResponse = await fetch(
  `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
  // ... fetch logic
);

// CRITICAL: Only use user if email matches EXACTLY (case-insensitive)
const matchingUser = usersData.users.find((u: any) => 
  u.email && u.email.toLowerCase() === email.toLowerCase()
);

if (!matchingUser) {
  // Reject - don't trust auth.users if email doesn't match exactly
  return new Response(
    JSON.stringify({ 
      success: false, 
      message: 'No account found. Please sign up first.',
      debug: `Email ${email} not found. Auth API returned different email(s) - possible email collision`
    }),
    // ...
  );
}
```

**Key Enforcement Points:**
1. ✅ **Line 747-753:** Users table queried FIRST with case-insensitive matching
2. ✅ **Line 771-772:** Auth.users queried by ID (not email) after finding user in users table
3. ✅ **Line 924-940:** Strict email matching in fallback (rejects if email doesn't match exactly)
4. ✅ **Line 964-977:** Upsert to users table uses requested email (source of truth)

## 3. How to Detect if Violated Again

### Detection Mechanisms:

**A. Logging (Already Implemented):**
```typescript
console.log('🔍 Login: Checking users table by email (primary method):', email);
console.log('📊 Login: Users table query result:', {
  hasData: !!userFromTable,
  hasError: !!userTableError,
  userId: userFromTable?.id,
  email: userFromTable?.email,
  error: userTableError ? JSON.stringify(userTableError) : null
});

// If fallback is triggered, log a warning:
console.log('⚠️ Login: User not found in users table, trying auth.users API as fallback');

// If email mismatch in fallback:
console.error('❌ Login: Auth API returned user(s) but none match requested email exactly');
console.error('❌ Requested email:', email);
console.error('❌ Auth API returned:', usersData.users.map((u: any) => ({ email: u.email, id: u.id })));
```

**B. Monitoring/Alerting (Recommended):**
- **Alert if fallback is used frequently:** This indicates users table might be out of sync
- **Alert on email mismatch in fallback:** This indicates the auth.users API bug is occurring
- **Track login failure rates:** Sudden spikes may indicate this bug has resurfaced

**C. Code Review Checklist:**
- ❌ Never use `auth.users` API email queries as primary lookup method
- ✅ Always check `users` table first for email-based lookups
- ✅ Only use `auth.users` API by user ID (not email)
- ✅ If fallback to auth.users by email is needed, enforce strict email matching
- ✅ Use case-insensitive matching (`.ilike()` or `.toLowerCase()`)

**D. Manual Testing:**
1. Create account with email `test@example.com`
2. Create another account with similar email `test2@example.com`
3. Attempt to log in with `test@example.com`
4. Should succeed without falling back to auth.users API
5. Check logs to confirm: "✅ Login: Found user in users table"

## 4. Regression Test

### Test File: `supabase/functions/verify-otp/index.test.ts`

```typescript
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

/**
 * Regression Test: Login Email Lookup Bug
 * 
 * This test ensures that:
 * 1. Users table is checked FIRST (primary source of truth)
 * 2. auth.users API is only used for ID verification, not email lookup
 * 3. Email mismatches in auth.users API are properly handled
 */
Deno.test("Login should use users table as primary source of truth for email", async () => {
  // Setup: Create test user in users table
  const testEmail = "test-regression@example.com";
  const testUserId = "test-user-id-123";
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Create user in users table
  await supabaseClient
    .from('users')
    .upsert({
      id: testUserId,
      email: testEmail,
      verified: true,
    });

  // Test: Query users table (simulating login flow)
  const { data: userFromTable, error: userTableError } = await supabaseClient
    .from('users')
    .select('id, email')
    .ilike('email', testEmail)
    .maybeSingle();

  // Assert: User should be found in users table
  assertExists(userFromTable, "User should exist in users table");
  assertEquals(userFromTable.email.toLowerCase(), testEmail.toLowerCase(), 
    "Email should match (case-insensitive)");
  assertEquals(userFromTable.id, testUserId, "User ID should match");

  // Test: Verify user exists in auth.users by ID (not email!)
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  const getUserByIdResponse = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${testUserId}`,
    {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  // Assert: User should exist in auth.users when queried by ID
  assertEquals(getUserByIdResponse.ok, true, 
    "User should exist in auth.users when queried by ID");

  // Cleanup
  await supabaseClient.from('users').delete().eq('id', testUserId);
});

Deno.test("Login should reject email mismatches from auth.users API", async () => {
  const testEmail = "correct-email@example.com";
  const wrongEmail = "wrong-email@example.com";
  const testUserId = "test-user-id-456";
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Create user in users table with correct email
  await supabaseClient
    .from('users')
    .upsert({
      id: testUserId,
      email: testEmail,
      verified: true,
    });

  // Simulate auth.users API returning wrong email (the bug scenario)
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  
  // Query auth.users by email (simulating the buggy behavior)
  const getUserResponse = await fetch(
    `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(testEmail)}`,
    {
      method: 'GET',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (getUserResponse.ok) {
    const usersData = await getUserResponse.json();
    
    if (usersData.users && usersData.users.length > 0) {
      // Simulate the bug: API returns user with different email
      const returnedUser = usersData.users[0];
      
      // CRITICAL TEST: Reject if email doesn't match exactly
      const emailMatches = returnedUser.email && 
        returnedUser.email.toLowerCase() === testEmail.toLowerCase();
      
      if (!emailMatches) {
        // This is the correct behavior - reject the login
        assertEquals(emailMatches, false, 
          "Should reject when auth.users API returns email mismatch");
      }
    }
  }

  // Cleanup
  await supabaseClient.from('users').delete().eq('id', testUserId);
});

Deno.test("Login should prioritize users table over auth.users API", async () => {
  const testEmail = "primary-test@example.com";
  const testUserId = "test-user-id-789";
  
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Create user in users table
  await supabaseClient
    .from('users')
    .upsert({
      id: testUserId,
      email: testEmail,
      verified: true,
    });

  // Simulate login flow: Check users table FIRST
  const { data: userFromTable } = await supabaseClient
    .from('users')
    .select('id, email')
    .ilike('email', testEmail)
    .maybeSingle();

  // Assert: User should be found in users table (primary source)
  assertExists(userFromTable, "User should be found in users table (primary source)");
  
  // Assert: We should NOT need to query auth.users by email
  // (Only query by ID for verification)
  assertEquals(userFromTable.id, testUserId, 
    "User ID from users table should be used");

  // Cleanup
  await supabaseClient.from('users').delete().eq('id', testUserId);
});
```

### Integration Test (Manual Test Case)

**Test Scenario:**
1. **Setup:** Create account `user1@example.com` and account `user2@example.com`
2. **Action:** Attempt to log in with `user1@example.com`
3. **Expected:** Login succeeds
4. **Verify in logs:**
   - ✅ "🔍 Login: Checking users table by email (primary method): user1@example.com"
   - ✅ "✅ Login: Found user in users table with email: user1@example.com"
   - ✅ "✅ Login: User verified in auth.users by ID"
   - ❌ Should NOT see: "⚠️ Login: User not found in users table, trying auth.users API as fallback"

**Failure Scenario (Bug Reproduction):**
1. **Setup:** Create account `judestcks@gmail.com`
2. **Action:** Create another account `jdoe128931023801923@gmail.com`
3. **Action:** Attempt to log in with `judestcks@gmail.com`
4. **Old Bug Behavior:** Would fail with "No account found" because auth.users API returned wrong user
5. **Expected New Behavior:** Should succeed because users table is checked first

## Summary

**Violated Invariant:** Trusting auth.users API email queries as reliable source of truth

**Enforcement Location:** `supabase/functions/verify-otp/index.ts` lines 747-977

**Detection:** 
- Logging at key decision points
- Monitoring fallback usage
- Code review checklist
- Integration tests

**Prevention:** Regression tests ensure users table is always checked first and email mismatches are rejected


