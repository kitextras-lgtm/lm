# Admin System - Next Steps

## ✅ What's Done

1. **Database Schema** - Complete with all tables, functions, and security
2. **Authentication** - Login, logout, session management, TOTP support
3. **RBAC** - Role-based access control with permission checking
4. **Audit Logging** - All admin actions are logged
5. **React Frontend** - Auth context, hooks, login page, dashboard shell
6. **Edge Functions** - Login, logout, session verification, permission checking

## 🎯 Immediate Next Steps

### Priority 1: Get Admin System Running

1. **Run Database Migration**
   ```bash
   # In Supabase SQL Editor, run:
   # supabase/migrations/20250122000000_create_admin_system.sql
   ```

2. **Create First Admin** (see `ADMIN_SETUP_GUIDE.md` for details)
   - Generate bcrypt hash for password
   - Insert admin into database
   - Or use: `./create-admin.sh admin@elevate.com YourPassword`

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy admin-login
   supabase functions deploy admin-logout
   supabase functions deploy admin-verify-session
   supabase functions deploy admin-check-permission
   supabase functions deploy admin-channels
   ```

4. **Test Login**
   - Navigate to `/admin/login`
   - Login with your admin credentials
   - Verify redirect to `/admin/dashboard`

### Priority 2: Build Admin Features

#### A. Channel Management (Most Critical)

**Backend:**
1. ✅ `admin-channels/index.ts` - Basic structure exists, needs:
   - Integration with your actual channels table
   - Approve/reject functionality
   - List pending channels

**Frontend:**
1. Create `src/pages/admin/ChannelsPage.tsx`
   - List of pending channel applications
   - Search/filter functionality
   - Approve/reject buttons with reason field
   - Permission checks (`can('channels', 'approve')`)

**To Do:**
- [ ] Identify your channels table name (may need to create `channel_applications` table)
- [ ] Update `admin-channels/index.ts` to work with your schema
- [ ] Build ChannelsPage component
- [ ] Add route to App.tsx: `/admin/channels`

#### B. User Management

**Backend:**
1. Create `supabase/functions/admin-users/index.ts`
   ```typescript
   GET /admin/users?page=1&limit=50&search=email
   GET /admin/users/:id
   PUT /admin/users/:id (if permission)
   ```

**Frontend:**
1. Create `src/pages/admin/UsersPage.tsx`
   - Paginated user list
   - Search by email/username
   - View user details
   - Edit user (if permission)

**To Do:**
- [ ] Create `admin-users` Edge Function
- [ ] Build UsersPage component
- [ ] Add pagination and search
- [ ] Add route: `/admin/users`

#### C. Announcements

**Backend:**
1. Create `supabase/functions/admin-announcements/index.ts`
   ```typescript
   GET /admin/announcements
   POST /admin/announcements (create)
   PUT /admin/announcements/:id
   DELETE /admin/announcements/:id
   POST /admin/announcements/:id/send
   ```

**Frontend:**
1. Create `src/pages/admin/AnnouncementsPage.tsx`
   - Create announcement form
   - Target audience selector (all, creators, artists, businesses)
   - Schedule sending
   - List sent announcements

**To Do:**
- [ ] Create `admin-announcements` Edge Function
- [ ] Build AnnouncementsPage component
- [ ] Add route: `/admin/announcements`

#### D. Support Chat

**Backend:**
1. Create `supabase/functions/admin-support/index.ts`
   ```typescript
   GET /admin/support/conversations
   GET /admin/support/conversations/:id/messages
   POST /admin/support/conversations/:id/messages
   PUT /admin/support/conversations/:id (assign, close)
   ```

**Frontend:**
1. Create `src/pages/admin/SupportPage.tsx`
   - Conversation list with filters
   - Message thread view
   - Send message form
   - Assign to admin
   - Close/resolve conversation

**To Do:**
- [ ] Create `admin-support` Edge Function
- [ ] Build SupportPage component
- [ ] Add route: `/admin/support`

#### E. Revenue (High Security Required)

**Backend:**
1. Create `supabase/functions/admin-revenue/index.ts`
   ```typescript
   GET /admin/revenue?start_date=2024-01-01&end_date=2024-12-31
   GET /admin/revenue/export?format=csv
   ```
   - Requires extra permission check
   - Logs all access to `admin_revenue_access_logs`
   - Consider requiring re-authentication

**Frontend:**
1. Create `src/pages/admin/RevenuePage.tsx`
   - Date range selector
   - Revenue charts/graphs
   - Filters (user type, date range)
   - Export buttons (CSV, JSON, Excel)
   - Confirmation dialog for sensitive operations

**To Do:**
- [ ] Create `admin-revenue` Edge Function
- [ ] Implement extra security (re-auth prompt?)
- [ ] Build RevenuePage component
- [ ] Add data visualization library (Chart.js, Recharts, etc.)
- [ ] Add route: `/admin/revenue`

### Priority 3: Enhancements

#### TOTP Setup Flow
- [ ] Create `admin-setup-totp` Edge Function
- [ ] Generate QR code for authenticator apps
- [ ] Create backup codes
- [ ] Build TOTP setup UI

#### Admin Management
- [ ] Create `admin-admins` Edge Function
- [ ] Build AdminManagementPage
- [ ] List all admins
- [ ] Create new admin (super_admin only)
- [ ] Edit admin roles/permissions
- [ ] Deactivate admin

#### Dashboard Stats
- [ ] Add statistics cards to dashboard
  - Total users
  - Pending channel applications
  - Open support tickets
  - Revenue summary (if permission)

#### Session Management
- [ ] Create `admin-sessions` Edge Function
- [ ] List active sessions
- [ ] Revoke sessions
- [ ] Build SessionsPage

#### Audit Log Viewer
- [ ] Create `admin-audit-logs` Edge Function
- [ ] Build AuditLogsPage
- [ ] Filter by admin, action type, date range
- [ ] Export audit logs

## 📋 Implementation Order Recommendation

1. **Week 1:**
   - ✅ Complete setup (migration, first admin, deploy functions)
   - ✅ Channel Management (backend + frontend)
   - ✅ Basic User Management (list + view)

2. **Week 2:**
   - ✅ Complete User Management (edit, search)
   - ✅ Announcements (create + send)
   - ✅ Support Chat (basic functionality)

3. **Week 3:**
   - ✅ Complete Support Chat (assign, close, filters)
   - ✅ Revenue (with extra security)
   - ✅ Dashboard stats

4. **Week 4:**
   - ✅ TOTP setup flow
   - ✅ Admin management
   - ✅ Audit log viewer
   - ✅ Polish & testing

## 🔧 Technical Tasks

### Database
- [ ] Create `channel_applications` table (if doesn't exist)
- [ ] Add indexes for performance
- [ ] Set up cron job for session cleanup
- [ ] Add database constraints where needed

### Edge Functions
- [ ] Add rate limiting middleware
- [ ] Add input validation helpers
- [ ] Create reusable `verifyAdminSession` helper (extract from functions)
- [ ] Add request/response logging

### Frontend
- [ ] Create admin layout component (sidebar navigation)
- [ ] Add loading states everywhere
- [ ] Add error boundaries
- [ ] Add toast notifications for actions
- [ ] Create reusable data table component
- [ ] Add pagination component
- [ ] Create modal/dialog component

### Security
- [ ] Implement httpOnly cookies for session tokens (instead of memory)
- [ ] Add CSRF protection
- [ ] Add request rate limiting
- [ ] Add IP whitelist option (optional)
- [ ] Set up alerting for suspicious activity

## 📝 Code Structure Example

```
src/
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx (empty shell - done)
│   │   ├── ChannelsPage.tsx (to create)
│   │   ├── UsersPage.tsx (to create)
│   │   ├── AnnouncementsPage.tsx (to create)
│   │   ├── SupportPage.tsx (to create)
│   │   └── RevenuePage.tsx (to create)
│   └── AdminLoginPage.tsx (done)
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx (sidebar navigation)
│   │   ├── DataTable.tsx (reusable table)
│   │   ├── Pagination.tsx
│   │   └── PermissionGate.tsx (hide/show based on permissions)
│   └── AdminProtectedRoute.tsx (done)
└── hooks/
    └── useAdmin.ts (done)

supabase/functions/
├── admin-login (done)
├── admin-logout (done)
├── admin-verify-session (done)
├── admin-check-permission (done)
├── admin-channels (partial)
├── admin-users (to create)
├── admin-announcements (to create)
├── admin-support (to create)
└── admin-revenue (to create)
```

## 🎨 UI/UX Considerations

- Use the same design system as CreatorDashboard
- Dark theme (`#111111` background, `#1a1a1e` cards)
- Consistent spacing and typography
- Loading skeletons for data tables
- Empty states with helpful messages
- Confirmation dialogs for destructive actions
- Toast notifications for success/error
- Responsive design (mobile-friendly)

## 📊 Testing Checklist

- [ ] Login/logout flow
- [ ] Session expiration handling
- [ ] Permission checks (try accessing restricted pages)
- [ ] TOTP verification (when enabled)
- [ ] Account lockout after 5 failed attempts
- [ ] Audit logging for all actions
- [ ] Edge function error handling
- [ ] Frontend error boundaries
- [ ] Mobile responsive design

## 🚀 Deployment Checklist

Before deploying to production:
- [ ] All Edge Functions deployed
- [ ] Environment variables set in production
- [ ] Database migration run in production
- [ ] First admin created in production
- [ ] TOTP enabled for all admins
- [ ] Rate limiting configured
- [ ] Session cleanup cron job running
- [ ] Monitoring/alerting set up
- [ ] Backup strategy for admin tables
- [ ] Documentation updated
