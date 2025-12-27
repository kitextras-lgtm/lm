# Email Notifications Guide

This guide explains how to send email notifications for "New Features" and "Platform Updates" to users who have opted in.

## Database Structure

User notification preferences are stored in the `users` table with the following columns:
- `email_new_features` (boolean) - Default: `true`
- `email_platform_updates` (boolean) - Default: `true`

## Where to Send Emails From

You have several options for sending bulk emails:

### Option 1: Supabase Edge Function (Recommended)

Create a Supabase Edge Function that:
1. Queries users who have the relevant preference enabled
2. Sends emails via an email service (Resend, SendGrid, etc.)

**Location:** `supabase/functions/send-notification-emails/`

**Steps:**
1. Navigate to Supabase Dashboard → Edge Functions
2. Create a new function called `send-notification-emails`
3. Use the template code below

### Option 2: Admin Dashboard Integration

Add a "Send Email" feature in your Admin Dashboard that allows admins to:
- Select notification type (New Features or Platform Updates)
- Compose the email content
- Preview who will receive it
- Send to all opted-in users

## SQL Query to Get Recipients

### Get Users for "New Features" Emails
```sql
SELECT id, email, full_name, first_name, last_name
FROM users
WHERE email_new_features = true
  AND email IS NOT NULL
  AND verified = true;
```

### Get Users for "Platform Updates" Emails
```sql
SELECT id, email, full_name, first_name, last_name
FROM users
WHERE email_platform_updates = true
  AND email IS NOT NULL
  AND verified = true;
```

## Example Edge Function

Create a file at `supabase/functions/send-notification-emails/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

serve(async (req) => {
  try {
    const { notificationType, subject, htmlContent, textContent } = await req.json()

    if (!['new_features', 'platform_updates'].includes(notificationType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid notification type' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get users with the relevant preference enabled
    const preferenceColumn = notificationType === 'new_features' 
      ? 'email_new_features' 
      : 'email_platform_updates'

    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('id, email, full_name, first_name, last_name')
      .eq(preferenceColumn, true)
      .not('email', 'is', null)
      .eq('verified', true)

    if (dbError) {
      throw dbError
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users found with this preference enabled', count: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send emails via Resend (or your preferred email service)
    const results = []
    for (const user of users) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Elevate <notifications@sayelevate.com>', // Update with your domain
            to: user.email,
            subject: subject,
            html: htmlContent,
            text: textContent,
          }),
        })

        const emailData = await emailResponse.json()
        results.push({ userId: user.id, email: user.email, success: emailResponse.ok, response: emailData })
      } catch (emailError) {
        results.push({ userId: user.id, email: user.email, success: false, error: emailError.message })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        message: `Sent ${successCount} emails, ${failureCount} failed`,
        total: users.length,
        successCount,
        failureCount,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

## Setting Up Resend (Email Service)

1. Sign up at https://resend.com
2. Get your API key from the dashboard
3. Add it to Supabase Secrets:
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Add `RESEND_API_KEY` with your API key value

## How to Send Emails

### Method 1: Via Supabase Dashboard (SQL + Manual Email Service)

1. Run the SQL query above to get recipient list
2. Export the results (CSV)
3. Use your email service (Mailchimp, SendGrid, etc.) to send to the list

### Method 2: Via Edge Function (Automated)

1. Deploy the Edge Function:
   ```bash
   supabase functions deploy send-notification-emails
   ```

2. Call the function:
   ```bash
   curl -X POST \
     'https://your-project.supabase.co/functions/v1/send-notification-emails' \
     -H 'Authorization: Bearer YOUR_ANON_KEY' \
     -H 'Content-Type: application/json' \
     -d '{
       "notificationType": "new_features",
       "subject": "🎉 New Feature: Enhanced Dashboard",
       "htmlContent": "<h1>Check out our new features!</h1><p>We've added amazing new capabilities...</p>",
       "textContent": "Check out our new features! We've added amazing new capabilities..."
     }'
   ```

### Method 3: Via Admin Dashboard UI (Recommended for Non-Technical Users)

1. Create an admin page component in your React app
2. Add a form to compose and send notifications
3. Call the Edge Function from the frontend

## Testing

Before sending to all users, test with a single email:

```sql
-- Get your test user email
SELECT email FROM users WHERE email = 'your-test-email@example.com';
```

Then send a test email using the Edge Function or your email service.

## Best Practices

1. **Always test first** - Send to a small group before broadcasting
2. **Respect preferences** - Only send to users who have opted in
3. **Unsubscribe option** - Include a link to update preferences in emails
4. **Rate limiting** - If sending large volumes, implement rate limiting
5. **Error handling** - Log failed sends and retry if needed
6. **Email templates** - Use consistent branding and formatting

## Updating User Preferences

Users can update their preferences in the Settings → Notifications section of their dashboard. Changes are saved immediately to the `users` table.

