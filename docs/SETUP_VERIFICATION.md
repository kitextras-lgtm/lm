# Setup Verification Checklist

## ✅ Edge Functions

### send-otp Function
- [x] **Code Updated**: Uses `hello@mail.sayelevate.com` as default sender
- [x] **Email Validation**: Properly validates and formats FROM_EMAIL
- [x] **Error Handling**: Returns `emailSent`, `emailError`, and `devCode` in response
- [x] **Email Template**: Custom Elevate design with black background
- [x] **OTP Storage**: Saves OTP codes to `otp_codes` table with 30-minute expiry

### verify-otp Function
- [x] **Code Status**: No changes needed (already correct)
- [x] **OTP Validation**: Checks code, expiry, and attempts
- [x] **User Creation**: Creates auth.users and users table entries
- [x] **Profile Check**: Returns user profile status

## ✅ Database Schema

### Required Tables
- [x] **users**: References `auth.users(id)` via foreign key (migration applied)
- [x] **otp_codes**: Stores OTP codes with expiry and attempts tracking
- [x] **user_profiles**: Stores user type and profile information
- [x] **referral_codes**: Optional - for referral system
- [x] **social_links**: Optional - for social media links

### Key Migrations Applied
- [x] **20251221000000_fix_users_table_auth_reference.sql**: Fixed users table to reference auth.users
- [x] **20251202084510_create_otp_codes_table.sql**: OTP codes table created
- [x] **20251202033017_create_user_profiles_table.sql**: User profiles table created
- [x] **20251202090508_create_users_table.sql**: Users table created

## ✅ Frontend Integration

### SignupPage
- [x] **Email Warning**: Shows warning if email service fails
- [x] **Dev Code Display**: Shows OTP code in dev mode when email not sent
- [x] **Error Handling**: Displays email service errors
- [x] **API Integration**: Calls `/functions/v1/send-otp` and `/functions/v1/verify-otp`

### LoginPage
- [x] **Email Warning**: Shows warning if email service fails
- [x] **Dev Code Display**: Shows OTP code in dev mode when email not sent
- [x] **Error Handling**: Displays email service errors
- [x] **API Integration**: Calls `/functions/v1/send-otp` and `/functions/v1/verify-otp`

## ⚠️ Required Supabase Configuration

### Edge Function Secrets
You need to verify these in Supabase Dashboard → Edge Functions → Settings → Secrets:

- [ ] **RESEND_API_KEY**: Your Resend API key (required for sending emails)
- [ ] **FROM_EMAIL**: Optional - set to `hello@mail.sayelevate.com` (default is already set in code)

### Domain Verification
- [ ] **Resend Domain**: `mail.sayelevate.com` must be verified in Resend dashboard
- [ ] **DNS Records**: SPF, DKIM, and DMARC records configured for `mail.sayelevate.com`

## ✅ Code Quality

### Email Format Validation
- [x] Handles plain email: `hello@mail.sayelevate.com` → `Elevate <hello@mail.sayelevate.com>`
- [x] Handles formatted email: `Elevate <hello@mail.sayelevate.com>` → uses as-is
- [x] Falls back to default if invalid format detected
- [x] Logs warnings for invalid formats

### Error Responses
- [x] Returns `success: true/false`
- [x] Returns `emailSent: boolean`
- [x] Returns `emailError: string | null`
- [x] Returns `devCode: string` (only when email not sent)

## 🧪 Testing Checklist

### Manual Testing Steps
1. [ ] **Signup Flow**:
   - Enter email on signup page
   - Check if OTP email is received
   - Verify email is from `hello@mail.sayelevate.com`
   - Enter OTP code
   - Verify user is created in auth.users and users table

2. [ ] **Login Flow**:
   - Enter email on login page
   - Check if OTP email is received
   - Enter OTP code
   - Verify user is redirected to correct dashboard

3. [ ] **Error Scenarios**:
   - Test with invalid email format
   - Test with non-existent user (login)
   - Test with expired OTP code
   - Test with wrong OTP code (check attempts limit)

### Edge Function Logs
Check Supabase Dashboard → Edge Functions → Logs for:
- [ ] Email sending attempts
- [ ] Resend API responses
- [ ] Any error messages

## 📝 Next Steps

1. **Verify Resend Setup**:
   - Go to https://resend.com
   - Verify `mail.sayelevate.com` domain is added and verified
   - Check DNS records are properly configured

2. **Test Email Sending**:
   - Try signing up with a real email
   - Check spam folder if email doesn't arrive
   - Verify email sender is `hello@mail.sayelevate.com`

3. **Monitor Logs**:
   - Check Edge Function logs in Supabase Dashboard
   - Look for any errors or warnings
   - Verify OTP codes are being generated and stored

## 🔧 Troubleshooting

### If emails aren't sending:
1. Check `RESEND_API_KEY` is set in Supabase secrets
2. Verify domain is verified in Resend
3. Check Edge Function logs for errors
4. Verify `FROM_EMAIL` format is correct

### If OTP codes aren't working:
1. Check `otp_codes` table has entries
2. Verify code hasn't expired (30 minutes)
3. Check attempts haven't exceeded limit (3 attempts)
4. Verify database migrations are applied

### If users aren't being created:
1. Check `users` table foreign key constraint
2. Verify `auth.users` entries are being created
3. Check RLS policies allow inserts
4. Review Edge Function logs for errors
