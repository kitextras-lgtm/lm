# Admin Authentication and Management System - Implementation Guide

## Overview

This document outlines the comprehensive admin system that has been implemented for the Elevate platform. The system provides secure authentication, role-based access control (RBAC), and comprehensive audit logging.

## ✅ Completed Components

### 1. Database Schema (`supabase/migrations/20250122000000_create_admin_system.sql`)

**Tables Created:**
- `admin_roles` - Defines admin roles (super_admin, content_moderator, support_agent, finance_viewer)
- `admins` - Admin user accounts with TOTP 2FA support
- `admin_sessions` - Active admin sessions (tokens hashed with SHA-256)
- `admin_audit_logs` - Comprehensive logging of all admin actions
- `admin_support_chats` - Support conversation management
- `admin_support_messages` - Support chat messages
- `admin_announcements` - System announcements
- `admin_announcement_reads` - Track which users have seen announcements
- `admin_revenue_access_logs` - Special logging for revenue data access

**Helper Functions:**
- `admin_has_permission()` - Check if admin has permission for resource/action
- `admin_log_action()` - Log admin actions to audit log
- `admin_log_revenue_access()` - Log revenue data access
- `admin_cleanup_expired_sessions()` - Clean up expired sessions (run via cron)
- `admin_update_session_activity()` - Update session last activity timestamp

**Security Features:**
- Passwords hashed with bcrypt
- Session tokens hashed with SHA-256 before storage
- Account lockout after 5 failed attempts (15 min lockout)
- Sessions expire after 30 minutes of inactivity
- RLS policies deny all access (only service role can access)

### 2. Authentication Edge Functions

**`admin-login/index.ts`**
- Email/password authentication
- TOTP verification (if enabled)
- Failed login attempt tracking
- Account lockout protection
- Session token generation
- Comprehensive audit logging

**`admin-logout/index.ts`**
- Session termination
- Audit log entry for logout

**`admin-verify-session/index.ts`**
- Session token validation
- Expiration checking
- Inactivity timeout enforcement
- Returns admin info and permissions

**`admin-check-permission/index.ts`**
- Permission checking endpoint
- Returns boolean for resource/action permission

### 3. React Frontend Components

**`src/contexts/AdminAuthContext.tsx`**
- Admin authentication context
- Session token stored in memory only (no localStorage/sessionStorage)
- Login, logout, session verification
- Permission checking helper

**`src/hooks/useAdmin.ts`**
- Custom hook for admin operations
- `can()` helper for permission checks
- `adminFetch()` for authenticated API calls
- `getAuthHeaders()` for request headers

**`src/components/AdminProtectedRoute.tsx`**
- Protected route component for admin pages
- Redirects to /admin/login if not authenticated
- Optional permission checking

**`src/pages/AdminLoginPage.tsx`**
- Admin login form
- Email/password input
- TOTP code input (shown when required)
- Error handling and loading states

**`src/pages/AdminDashboard.tsx`**
- Admin dashboard page
- Header navigation bar (duplicated from CreatorDashboard)
- Empty content area (as requested)
- Admin dropdown with role display

### 4. Routing (`src/App.tsx`)

- `/admin/login` - Admin login page
- `/admin/dashboard` - Admin dashboard (protected)
- Wrapped with `AdminAuthProvider` for global admin state

## 🔄 In Progress / To Complete

### 1. Additional Edge Functions Needed

**Channel Management:**
- ✅ `admin-channels/index.ts` - Basic structure (needs channel table integration)

**User Management:**
- ❌ `admin-users/index.ts` - List/search users, view user details

**Announcements:**
- ❌ `admin-announcements/index.ts` - Create, edit, send announcements

**Support Chat:**
- ❌ `admin-support/index.ts` - List conversations, send messages, close chats

**Revenue:**
- ❌ `admin-revenue/index.ts` - View revenue data (extra security required)

### 2. Frontend Admin Pages

**Channel Management Page:**
- List pending channel applications
- Approve/reject with reason
- Filter and search

**User Management Page:**
- Paginated user list
- Search by email, username
- View user details
- Edit user info (if permission)

**Announcements Page:**
- Create announcement form
- Target audience selection
- Schedule sending
- View sent announcements

**Support Chat Page:**
- Conversation list
- Message thread
- Assign to admin
- Close/resolve conversations

**Revenue Page:**
- Date range selector
- Revenue charts/graphs
- Export functionality
- Filters (user type, date range, etc.)

### 3. Security Improvements Needed

1. **Session Token Storage:**
   - Currently stored in memory (ref)
   - On page reload, admin must log in again
   - **Recommendation:** Implement httpOnly cookies for production

2. **TOTP Setup Flow:**
   - Edge Function to generate TOTP secret
   - QR code generation for authenticator apps
   - Backup codes generation

3. **Rate Limiting:**
   - Add rate limiting to login endpoint
   - Prevent brute force attacks

4. **Cron Job:**
   - Set up scheduled function to clean expired sessions
   - Run `admin_cleanup_expired_sessions()` regularly

## 🔐 Security Features Implemented

✅ **Authentication:**
- Email + password + TOTP (2FA)
- Session tokens hashed before storage
- Account lockout after 5 failed attempts
- Sessions expire after 30 min inactivity

✅ **Authorization:**
- Role-based access control (RBAC)
- Permission checking before every operation
- Custom permissions override role defaults

✅ **Audit Logging:**
- Every admin action logged
- IP address and user agent tracking
- Resource-specific logging
- Special logging for revenue access

✅ **Data Protection:**
- Passwords hashed with bcrypt
- Session tokens never exposed in URLs
- No localStorage/sessionStorage usage
- Service role only for admin table access

## 📋 Usage Examples

### Creating First Super Admin

Run this SQL in Supabase SQL Editor (replace password hash):

```sql
-- Generate bcrypt hash first (use online tool or Node.js: bcrypt.hash('yourpassword', 10))
INSERT INTO admins (email, password_hash, role_id, full_name, totp_enabled)
SELECT 
    'admin@elevate.com',
    '$2b$10$YOUR_BCRYPT_HASH_HERE', -- Replace with actual bcrypt hash
    id,
    'Super Admin',
    false
FROM admin_roles
WHERE name = 'super_admin';
```

### Using Admin Hook in Components

```typescript
import { useAdmin } from '../hooks/useAdmin';

function MyAdminComponent() {
  const { admin, can, adminFetch } = useAdmin();

  // Check permission
  if (can('channels', 'approve')) {
    // Show approve button
  }

  // Make authenticated request
  const data = await adminFetch('admin-channels', {
    method: 'GET',
  });
}
```

### Checking Permissions

```typescript
const { hasPermission } = useAdminAuth();

if (hasPermission('revenue', 'view')) {
  // Allow revenue access
}
```

## 🚀 Next Steps

1. **Create channel applications table** (if not exists)
2. **Implement remaining Edge Functions** (users, announcements, support, revenue)
3. **Build frontend admin pages** for each feature
4. **Set up TOTP enrollment flow**
5. **Add rate limiting middleware**
6. **Configure cron job for session cleanup**
7. **Test all permission checks**
8. **Add confirmation dialogs for destructive actions**

## 📝 Notes

- Session tokens are stored in memory only (lost on page reload for security)
- All admin tables have RLS enabled (deny all - service role only)
- Revenue access requires special logging and extra confirmation
- Permission checks happen server-side for security
- Audit logs are immutable (no update/delete allowed)

## 🔗 Related Files

- Database: `supabase/migrations/20250122000000_create_admin_system.sql`
- Auth Functions: `supabase/functions/admin-*`
- Frontend: `src/contexts/AdminAuthContext.tsx`, `src/hooks/useAdmin.ts`
- Pages: `src/pages/AdminLoginPage.tsx`, `src/pages/AdminDashboard.tsx`
- Components: `src/components/AdminProtectedRoute.tsx`
