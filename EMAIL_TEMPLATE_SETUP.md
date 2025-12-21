# Email Template Setup Instructions

## For Hosted Supabase Project

To customize your OTP verification email to match the Elevate design, follow these steps:

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/cihirmtgbwyxhxmcseog
2. Navigate to **Authentication** → **Email Templates**

### Step 2: Edit Magic Link Template
1. Find and click on the **Magic Link** template
2. Replace the existing HTML content with the template below

### Step 3: Copy This HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elevate Verification Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #000000; border-radius: 8px; padding: 60px 40px; box-shadow: 0 1px 3px 0 rgba(255, 255, 255, 0.1);">

      <h1 style="font-size: 32px; font-weight: 600; margin: 0 0 40px 0; text-align: center; color: #ffffff; line-height: 1.2;">
        Your Elevate verification code is:
      </h1>

      <div style="background-color: #1a1a1a; border-radius: 16px; padding: 40px 20px; margin: 0 0 40px 0; text-align: center;">
        <p style="font-size: 56px; font-weight: 700; letter-spacing: 12px; margin: 0; color: #ffffff; line-height: 1;">
          {{ .Token }}
        </p>
      </div>

      <div style="text-align: center;">
        <p style="font-size: 18px; color: #ffffff; line-height: 1.6; margin: 0 0 8px 0;">
          This code expires after 30 minutes and can
        </p>
        <p style="font-size: 18px; color: #ffffff; line-height: 1.6; margin: 0 0 8px 0;">
          only be used once.
        </p>
        <p style="font-size: 18px; color: #ffffff; line-height: 1.6; margin: 0; font-weight: 600;">
          Never share your code.
        </p>
      </div>

    </div>

    <div style="text-align: center; margin-top: 30px; padding: 0 20px;">
      <p style="font-size: 14px; color: #9ca3af; line-height: 1.5; margin: 0;">
        If you didn't request this code, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
```

### Step 4: Update the Subject Line
Set the subject to: **{{ .Token }} is your verification code**

### Step 5: Save the Template
Click **Save** to apply the changes

### Step 6: Test
1. Go to your app and try to sign up or log in
2. Check your email to verify the new template is working

## Important Notes

- The `{{ .Token }}` variable will automatically be replaced with the 6-digit OTP code
- Changes take effect immediately after saving
- The template is responsive and works on all email clients
- The design matches the reference image you provided

## Local Development (Optional)

For local development with Supabase CLI, the template is already configured in:
- `supabase/config.toml`
- `supabase/templates/magic_link.html`

Run `supabase start` to use the local configuration.
