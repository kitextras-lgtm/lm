# Resend API Setup Instructions

## Step 1: Get Your Resend API Key

1. Go to https://resend.com and sign up/login
2. Navigate to **API Keys** in your dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "Elevate OTP Emails")
5. Copy the API key (you'll only see it once!)

## Step 2: Verify Your Domain (Recommended)

For production, you should verify your domain:
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Follow the DNS setup instructions
4. Once verified, you can use emails like `noreply@yourdomain.com`

The default is set to `Elevate <hello@mail.sayelevate.com>` in the code

## Step 3: Add Secrets to Supabase Edge Functions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/hlcpoqxzqgbghsadouef
2. Navigate to **Edge Functions** → **Settings**
3. Scroll down to **Secrets**
4. Add the following secrets:

   **Secret 1:**
   - Name: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxx` (your Resend API key)

   **Secret 2:**
   - Name: `FROM_EMAIL`
   - Value: `hello@mail.sayelevate.com` (or `Elevate <hello@mail.sayelevate.com>`)

5. Click **Save** for each secret

## Step 4: Deploy Edge Functions (if needed)

If you've made changes to the Edge Functions, deploy them:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref hlcpoqxzqgbghsadouef

# Deploy the functions
supabase functions deploy send-otp
supabase functions deploy verify-otp
```

## Step 5: Test

1. Go to your app and try to sign up
2. Check your email for the OTP code
3. The email should use the custom Elevate template with black background

## Troubleshooting

- **Emails not sending?** Check the Edge Function logs in Supabase Dashboard
- **API Key invalid?** Make sure you copied the full key without spaces
- **Domain not verified?** Use `delivered@resend.dev` for testing
- **Rate limits?** Resend free tier allows 3,000 emails/month

## Current Configuration

- **Email Template:** Custom Elevate design (black background, white text)
- **Subject Line:** `{code} is your verification code`
- **Code Expiry:** 30 minutes
- **Function:** `send-otp` in Supabase Edge Functions



