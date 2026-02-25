---
description: Security review findings and remediation steps for the Elevate platform
---

# Security Penetration Test Report
**Date:** February 23, 2026
**Scope:** Full-stack review — Supabase Edge Functions, React client, database migrations, storage, dependencies

---

## CRITICAL FINDINGS

### 1. Authentication Bypass via localStorage Tampering
**Severity: CRITICAL** | **File:** `src/components/ProtectedRoute.tsx`

The ProtectedRoute trusts `localStorage.verifiedUserId` as authentication without server-side verification:

```typescript
const verifiedUserId = localStorage.getItem('verifiedUserId');
if (verifiedUserId) {
  setIsAuthenticated(true); // NO server-side validation
  return;
}
```

**Attack:** Open DevTools, set `verifiedUserId` to any user's UUID, gain full access to their dashboard/settings/messages.

**Impact:** Complete account takeover of any user.

**Affected:** ProtectedRoute, SettingsPage, FreelancerDashboard, ArtistDashboard, BusinessDashboard, CreatorDashboard, MakeProfilePage, UserTypeSelectionPage, TellUsAboutYourselfPage, FreelancerOnboarding, FreelancerExperience, FreelancerReviewProfile

**Fix:** Remove localStorage fallback entirely. Use only `supabase.auth.getUser()` which validates JWTs server-side.

---

### 2. Hardcoded Supabase Credentials in Source Code
**Severity: CRITICAL** | **File:** `src/lib/config.ts:15-16`

Supabase URL and anon key hardcoded as fallback values committed to GitHub.

**Fix:** Remove hardcoded fallbacks. Throw error if env vars missing. Verify `.env` is in `.gitignore`. Rotate anon key if repo was ever public.

---

### 3. OTP Code Leaked in API Response
**Severity: CRITICAL** | **File:** `supabase/functions/send-otp/index.ts:406`

When email fails, OTP code is returned in the response:

```typescript
devCode: !emailSent ? code : undefined, // OTP CODE EXPOSED
```

**Attack:** If Resend is down, call send-otp and receive the OTP in the response body. Bypass all email verification.

**Fix:** Remove `devCode` field entirely. Never return OTP codes to clients.

---

### 4. Excessive Debug Logging of Secrets
**Severity: HIGH** | **Files:** `send-otp/index.ts`, `verify-otp/index.ts`

OTP codes, emails, and service key metadata logged to Supabase function logs:

```typescript
console.log('OTP generated for', email, ':', code);
```

**Fix:** Remove all console.log of OTP codes and PII. Use structured logging, strip secrets.

---

## HIGH FINDINGS

### 5. Wildcard CORS on All 16 Edge Functions
**Severity: HIGH**

Every Edge Function uses `Access-Control-Allow-Origin: *`. Any website can make API requests to your backend.

**Fix:** Restrict to your domain(s): `https://yourdomain.com`

---

### 6. IDOR in Social Links (No Auth Check)
**Severity: HIGH** | **File:** `supabase/functions/social-links/index.ts`

The POST body accepts `userId` without verifying the caller IS that user. Any caller can add/read/delete social links for ANY user.

**Fix:** Extract authenticated user ID from JWT inside the Edge Function. Reject mismatches. Apply to ALL Edge Functions accepting userId.

---

### 7. Missing Rate Limiting on OTP
**Severity: HIGH** | **Files:** `send-otp/index.ts`, `verify-otp/index.ts`

No rate limit on OTP send requests per email or per IP (only a 24h signup IP check exists). Login flow has zero rate limiting.

**Fix:** Max 3 OTP sends per email per hour. Max 10 per IP per hour.

---

### 8. Client-Side Admin Authorization
**Severity: HIGH** | **File:** `src/pages/AdminDashboard.tsx`

Admin writes (approve/decline applications, verify social links) use the anon key Supabase client. Protection is client-side only via AdminProtectedRoute.

```typescript
await supabase.from('applications').update(updateData).eq('id', id);
await supabase.from('social_links').update({ verified: true }).eq('user_id', app.user_id);
```

**Fix:** Admin actions must go through Edge Functions with session token verification. RLS on applications should restrict UPDATE to service_role.

---

## MEDIUM FINDINGS

### 9. Overly Permissive RLS Policies
**Severity: MEDIUM**

- **feedback:** `anon` can insert/view/update — allows unauthenticated spam
- **announcements:** Any user can INSERT — fake platform announcements
- **chat tables:** "Permissive for now" policies allow all ops for all authenticated users

**Fix:** Restrict feedback/announcements INSERT to appropriate roles. Implement conversation-membership-based chat policies.

---

### 10. 30-Minute OTP Expiry
**Severity: MEDIUM** | **File:** `send-otp/index.ts:224`

Industry standard is 5-10 minutes. 30 minutes increases interception risk.

**Fix:** Reduce to 10 minutes.

---

### 11. No CSRF Protection
**Severity: MEDIUM**

Wildcard CORS (Finding 5) means any website can make API calls using the public anon key.

**Fix:** Fix CORS first. Ensure all state-changing ops validate user session.

---

### 12. Verbose Error Messages to Client
**Severity: MEDIUM** | **File:** `verify-otp/index.ts`

Debug objects with HTTP status codes and internal errors sent to client.

**Fix:** Generic messages to clients. Log details server-side only.

---

## LOW FINDINGS

### 13. Legacy Dead Code (SQLite/localStorage)
`src/lib/database.ts`, `src/api/send-otp.ts`, `src/api/verify-otp.ts`, `src/api/submissions.ts` — Delete these.

### 14. Dev Dependency Vulnerabilities
`npm audit`: moderate (@babel/helpers ReDoS), high (minimatch via eslint). Dev-only, but update eslint.

### 15. dangerouslySetInnerHTML (CSS only)
`CreatorDashboard.tsx:4540` — Used for CSS keyframes only, no user input. Move to CSS file.

### 16. Unused project 11/ directory
Separate Vite project with lucide-react. Delete or move to separate repo.

---

## SUMMARY

| # | Finding | Severity | CVSS Est. |
|---|---------|----------|-----------|
| 1 | Auth bypass via localStorage | CRITICAL | 9.8 |
| 2 | Hardcoded Supabase credentials | CRITICAL | 8.5 |
| 3 | OTP code leaked in API response | CRITICAL | 9.1 |
| 4 | Debug logging of secrets | HIGH | 7.5 |
| 5 | Wildcard CORS on all Edge Functions | HIGH | 7.2 |
| 6 | IDOR in social-links | HIGH | 8.1 |
| 7 | Missing OTP rate limiting | HIGH | 6.8 |
| 8 | Client-side admin authorization | HIGH | 8.0 |
| 9 | Overly permissive RLS | MEDIUM | 6.0 |
| 10 | 30-min OTP expiry | MEDIUM | 5.0 |
| 11 | No CSRF protection | MEDIUM | 5.5 |
| 12 | Verbose errors to client | MEDIUM | 4.5 |
| 13 | Legacy dead code | LOW | 2.0 |
| 14 | Dev dependency vulns | LOW | 3.5 |
| 15 | dangerouslySetInnerHTML | LOW | 2.0 |
| 16 | Unused project directory | LOW | 1.0 |

---

## PRIORITY REMEDIATION ORDER

### Immediate (today):
1. Remove `devCode` from send-otp response (#3)
2. Remove OTP code from console.log (#4)
3. Remove hardcoded credentials from config.ts (#2)

### This week:
4. Rewrite ProtectedRoute to use server-side auth only (#1)
5. Add auth verification to social-links Edge Function (#6)
6. Restrict CORS to your domain (#5)
7. Move admin writes to Edge Functions (#8)

### Next sprint:
8. Add OTP rate limiting (#7)
9. Tighten RLS policies (#9)
10. Reduce OTP expiry to 10 min (#10)
11. Clean up verbose error responses (#12)
12. Delete legacy code and project 11/ (#13, #16)