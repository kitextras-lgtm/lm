# 🐛 Post-Fix Hardening: Conversation Profile Foreign Key Violation

## Bug Summary
**Issue**: `getOrCreateAdminConversation` failed with PostgreSQL error `23503` (foreign key violation) when attempting to create a conversation for a customer without a profile in the `profiles` table.

**Error**: `insert or update on table "conversations" violates foreign key constraint "conversations_customer_id_fkey" - Key is not present in table "profiles"`

**Fix Applied**: Added profile existence check and automatic profile creation in `getOrCreateAdminConversation` before conversation creation/fetching.

---

## 1. Root Cause: Violated Invariant

### Violated Invariant
```
∀ customer_id ∈ conversations.customer_id : 
  ∃ profile ∈ profiles : profile.id = customer_id
```

**In plain English**: Every `customer_id` in the `conversations` table MUST have a corresponding entry in the `profiles` table.

This invariant is enforced at the database level via the foreign key constraint:
```sql
ALTER TABLE conversations 
ADD CONSTRAINT conversations_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id);
```

### Why It Was Violated
The `getOrCreateAdminConversation` function attempted to create a conversation without first verifying that the customer profile existed in the `profiles` table. This could happen when:
- A user was created before the automatic profile creation was added to `verify-otp`
- Profile creation failed silently during signup
- Manual user creation skipped profile creation
- Race condition where profile creation hadn't completed yet

---

## 2. Where the Invariant is Now Enforced

### Location 1: Application Layer - `getOrCreateAdminConversation`
**File**: `src/hooks/useChat.ts`  
**Lines**: ~564-615

```typescript
// CRITICAL: Ensure customer profile exists before creating conversation
const { data: customerProfile, error: profileCheckError } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', customerId)
  .maybeSingle();

if (!customerProfile) {
  // Create profile with user data
  const { error: createProfileError } = await supabase
    .from('profiles')
    .insert({ ... });
}
```

**Enforcement Strategy**: 
- ✅ **Prevents violation** by checking profile existence BEFORE conversation creation
- ✅ **Self-healing** by automatically creating missing profiles
- ✅ **Explicit error handling** if profile creation fails

### Location 2: Database Layer - Foreign Key Constraint
**File**: Database migration (likely in `supabase/migrations/`)  
**Constraint**: `conversations_customer_id_fkey`

```sql
ALTER TABLE conversations 
ADD CONSTRAINT conversations_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES profiles(id);
```

**Enforcement Strategy**:
- ✅ **Last line of defense** - prevents invalid data from being inserted
- ✅ **Database-level guarantee** - works even if application code has bugs
- ❌ **Fails hard** - returns error 23503, doesn't auto-fix

### Location 3: Signup Flow - Automatic Profile Creation
**File**: `supabase/functions/verify-otp/index.ts`  
**Lines**: ~725-742

```typescript
// Create profile for chat system (required for conversations)
const { error: profileError } = await supabaseClient
  .from('profiles')
  .insert({
    id: authUserId,
    name: email.split('@')[0] || 'User',
    // ...
  });
```

**Enforcement Strategy**:
- ✅ **Prevents issue at source** - creates profile during signup
- ✅ **Proactive** - ensures profile exists before user can access messages
- ⚠️ **May fail silently** - errors are logged but don't block signup

---

## 3. How to Detect if Violated Again

### Detection Method 1: Application Error Monitoring
**What to monitor**: Error logs for PostgreSQL error code `23503`

**Detection Code**: Already implemented in error handling
```typescript
if (createError.code === '23503') {
  console.error('❌ Foreign key violation: customer_id not in profiles');
  // Profile creation should have caught this - investigate
}
```

**Alerting**: Set up monitoring to alert on:
- Error code `23503` in production logs
- Pattern: `"violates foreign key constraint"` + `"conversations_customer_id_fkey"`

### Detection Method 2: Database Query Check
**What to check**: Orphaned conversations (conversations without matching profiles)

**SQL Query**:
```sql
-- Find conversations with customer_id not in profiles
SELECT c.id, c.customer_id, c.created_at
FROM conversations c
LEFT JOIN profiles p ON c.customer_id = p.id
WHERE p.id IS NULL;
```

**Frequency**: Run daily/weekly as a data integrity check

**Alert**: Alert if count > 0 (should always be 0)

### Detection Method 3: Integration Test
**Test**: Attempt to create conversation without profile

**Expected Behavior**: Profile should be created automatically OR error should be caught gracefully

**Test Code**: See Section 4 below

### Detection Method 4: TypeScript Type Safety
**Current State**: No compile-time enforcement (customer_id is just a string)

**Potential Improvement**: Could add runtime validation or use a branded type

**Example**:
```typescript
type CustomerId = string & { readonly __brand: 'CustomerId' };

function ensureCustomerId(id: string): CustomerId {
  // Validate profile exists
  return id as CustomerId;
}
```

---

## 4. Regression Test

### Test Framework Setup
Since no test framework is currently configured, here's a test structure that would catch this bug:

**Recommended**: Vitest (works well with Vite) or Jest

### Test File Location
`src/hooks/__tests__/useChat.test.ts` or `src/hooks/useChat.test.ts`

### Regression Test Code

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getOrCreateAdminConversation } from '../useChat';
import { supabase } from '../../lib/supabase';

// Mock Supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('getOrCreateAdminConversation', () => {
  const mockCustomerId = 'test-customer-id-123';
  const mockAdminId = 'test-admin-id-456';
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock getAdminId to return admin ID
    vi.mock('../useChat', async () => {
      const actual = await vi.importActual('../useChat');
      return {
        ...actual,
        getAdminId: vi.fn().mockResolvedValue(mockAdminId),
      };
    });
  });

  it('should create customer profile if it does not exist before creating conversation', async () => {
    // Arrange: Customer profile does NOT exist
    const mockFrom = vi.fn();
    const mockSelect = vi.fn();
    const mockEq = vi.fn();
    const mockMaybeSingle = vi.fn();
    const mockInsert = vi.fn();
    const mockSingle = vi.fn();
    
    // Mock profile check - profile does NOT exist
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });
    
    // Mock user data fetch
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { email: 'test@example.com', full_name: 'Test User' },
            error: null,
          }),
        }),
      }),
    });
    
    // Mock profile creation
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        // Should not throw error
      }),
    });
    
    // Mock admin ID check
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: mockAdminId },
              error: null,
            }),
          }),
        }),
      }),
    });
    
    // Mock conversation check - conversation does NOT exist
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    });
    
    // Mock conversation creation
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'conv-123',
              customer_id: mockCustomerId,
              admin_id: mockAdminId,
            },
            error: null,
          }),
        }),
      }),
    });
    
    // Mock welcome message insert
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });
    
    // Mock conversation update
    mockFrom.mockReturnValueOnce({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    
    // Mock admin profile fetch
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockAdminId, name: 'Admin' },
            error: null,
          }),
        }),
      }),
    });
    
    (supabase.from as any) = mockFrom;
    
    // Act
    const result = await getOrCreateAdminConversation(mockCustomerId);
    
    // Assert
    expect(result).not.toBeNull();
    expect(result?.customer_id).toBe(mockCustomerId);
    expect(result?.admin_id).toBe(mockAdminId);
    
    // Verify profile was created BEFORE conversation creation
    const insertCalls = mockFrom.mock.calls.filter(call => 
      call[0] === 'profiles' && mockFrom.mock.results[mockFrom.mock.calls.indexOf(call)]?.value?.insert
    );
    expect(insertCalls.length).toBeGreaterThan(0);
  });

  it('should handle foreign key violation gracefully if profile creation fails', async () => {
    // Arrange: Profile check fails, and profile creation also fails
    const mockFrom = vi.fn();
    
    // Mock profile check - profile does NOT exist
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    });
    
    // Mock user data fetch succeeds
    mockFrom.mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { email: 'test@example.com' },
            error: null,
          }),
        }),
      }),
    });
    
    // Mock profile creation FAILS
    mockFrom.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({
        error: { code: '23505', message: 'Profile already exists' },
      }),
    });
    
    (supabase.from as any) = mockFrom;
    
    // Act
    const result = await getOrCreateAdminConversation(mockCustomerId);
    
    // Assert: Should return null, not throw
    expect(result).toBeNull();
  });

  it('should NOT attempt conversation creation if customer profile does not exist and cannot be created', async () => {
    // This test ensures we don't try to create conversation if profile creation fails
    // Implementation depends on specific error handling logic
  });
});
```

### Integration Test (Manual/End-to-End)

```typescript
/**
 * Integration Test: Create conversation for user without profile
 * 
 * Prerequisites:
 * 1. User exists in auth.users and users table
 * 2. User does NOT exist in profiles table
 * 3. Admin profile exists with is_admin = true
 * 
 * Steps:
 * 1. Call getOrCreateAdminConversation(userId)
 * 2. Verify profile is created in profiles table
 * 3. Verify conversation is created in conversations table
 * 4. Verify conversation.customer_id = profile.id
 * 
 * Expected Result:
 * - Profile created successfully
 * - Conversation created successfully
 * - No foreign key violation errors
 */
```

### Database Integrity Test (SQL)

```sql
-- Test: Ensure no orphaned conversations exist
-- This query should always return 0 rows
SELECT 
  c.id as conversation_id,
  c.customer_id,
  c.created_at as conversation_created_at,
  CASE 
    WHEN p.id IS NULL THEN 'MISSING PROFILE'
    ELSE 'OK'
  END as status
FROM conversations c
LEFT JOIN profiles p ON c.customer_id = p.id
WHERE p.id IS NULL;

-- Expected: 0 rows
-- If > 0 rows, this indicates the invariant is violated
```

---

## 5. Additional Safeguards

### Safeguard 1: Database Trigger (Optional)
Create a trigger to prevent orphaned conversations:

```sql
-- This would prevent the issue at the database level
-- But may be overkill if application-level checks are sufficient
CREATE OR REPLACE FUNCTION check_profile_exists()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = NEW.customer_id) THEN
    RAISE EXCEPTION 'Customer profile must exist before creating conversation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_profile_check
BEFORE INSERT ON conversations
FOR EACH ROW
EXECUTE FUNCTION check_profile_exists();
```

### Safeguard 2: Data Migration Script
Script to fix any existing orphaned conversations:

```sql
-- Fix existing orphaned conversations by creating missing profiles
INSERT INTO profiles (id, name, avatar_url, is_admin, is_online)
SELECT 
  c.customer_id,
  COALESCE(u.full_name, u.email, 'User') as name,
  COALESCE(u.profile_picture_url, '') as avatar_url,
  false as is_admin,
  false as is_online
FROM conversations c
LEFT JOIN profiles p ON c.customer_id = p.id
LEFT JOIN users u ON c.customer_id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
```

### Safeguard 3: Monitoring Dashboard Query
Query to monitor profile coverage:

```sql
-- Monitor: Percentage of users with profiles
SELECT 
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM conversations) as conversations_count,
  (SELECT COUNT(*) FROM conversations c LEFT JOIN profiles p ON c.customer_id = p.id WHERE p.id IS NULL) as orphaned_conversations,
  ROUND(
    (SELECT COUNT(*) FROM profiles)::numeric / 
    NULLIF((SELECT COUNT(*) FROM users), 0) * 100, 
    2
  ) as profile_coverage_percent;
```

---

## 6. Summary

| Aspect | Before Fix | After Fix |
|--------|-----------|-----------|
| **Invariant Enforcement** | Database constraint only (fails hard) | Application + Database (self-healing) |
| **Error Handling** | ❌ Unhandled 23503 error | ✅ Graceful handling with auto-fix |
| **Detection** | ❌ Only at runtime when error occurs | ✅ Proactive check before operation |
| **Recovery** | ❌ Manual intervention required | ✅ Automatic profile creation |
| **Test Coverage** | ❌ No tests | ⚠️ Tests recommended (see Section 4) |

---

## 7. Action Items

- [ ] **Immediate**: Verify fix works for existing users without profiles
- [ ] **Short-term**: Add regression test (Section 4)
- [ ] **Short-term**: Run data integrity query to check for orphaned conversations
- [ ] **Medium-term**: Set up error monitoring for 23503 errors
- [ ] **Medium-term**: Add database trigger (optional safeguard)
- [ ] **Long-term**: Consider TypeScript branded types for stronger type safety

---

## 8. Related Files

- **Fixed Function**: `src/hooks/useChat.ts` - `getOrCreateAdminConversation()`
- **Prevention**: `supabase/functions/verify-otp/index.ts` - Profile creation on signup
- **Database Schema**: `supabase/migrations/*_create_chat_tables.sql` - Foreign key constraint
- **Test Location** (to be created): `src/hooks/__tests__/useChat.test.ts`

