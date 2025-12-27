import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Email template matching OTP style
function getEmailTemplate(title: string, content: string, unsubscribeUrl?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${title}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px 16px !important;
      }
      .content-box {
        padding: 40px 24px !important;
      }
      h1 {
        font-size: 24px !important;
        margin-bottom: 30px !important;
      }
      .text {
        font-size: 16px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #000000 !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!--[if mso]>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #000000;">
    <tr>
      <td style="padding: 20px;">
  <![endif]-->
  <div class="container" style="max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #000000;">
    <div class="content-box" style="background-color: #000000; border-radius: 8px; padding: 60px 40px; box-shadow: 0 1px 3px 0 rgba(255, 255, 255, 0.1);">

      <h1 style="font-size: 32px; font-weight: 600; margin: 0 0 40px 0; text-align: center; color: #ffffff !important; line-height: 1.2;">
        ${title}
      </h1>

      <div style="text-align: left; margin-bottom: 40px;">
        <div class="text" style="font-size: 18px; color: #ffffff !important; line-height: 1.6; margin: 0 0 16px 0; white-space: pre-wrap;">
          ${content.replace(/\n/g, '<br>')}
        </div>
      </div>

    </div>

    <div style="text-align: center; margin-top: 30px; padding: 0 20px;">
      <p style="font-size: 14px; color: #9ca3af !important; line-height: 1.5; margin: 0 0 16px 0;">
        ${unsubscribeUrl ? `<a href="${unsubscribeUrl}" style="color: #9ca3af !important; text-decoration: underline;">Update email preferences</a><br><br>` : ''}
        If you have any questions, please contact us at hello@sayelevate.com
      </p>
      <p style="font-size: 12px; color: #6b7280 !important; line-height: 1.5; margin: 0;">
        © ${new Date().getFullYear()} Elevate. All rights reserved.
      </p>
    </div>
  </div>
  <!--[if mso]>
      </td>
    </tr>
  </table>
  <![endif]-->
</body>
</html>
  `.trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { notificationType, subject, content } = await req.json();

    if (!notificationType || !subject || !content) {
      return new Response(
        JSON.stringify({ success: false, message: 'notificationType, subject, and content are required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!['new_features', 'platform_updates'].includes(notificationType)) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid notification type. Must be "new_features" or "platform_updates"' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let FROM_EMAIL = Deno.env.get('FROM_EMAIL')?.trim() || 'Elevate <hello@mail.sayelevate.com>';

    // Validate and format FROM_EMAIL
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!FROM_EMAIL || FROM_EMAIL === '') {
      FROM_EMAIL = 'Elevate <hello@mail.sayelevate.com>';
    } else if (FROM_EMAIL.includes('<') && FROM_EMAIL.includes('>')) {
      const emailMatch = FROM_EMAIL.match(/<([^>]+)>/);
      if (emailMatch && !emailRegex.test(emailMatch[1])) {
        FROM_EMAIL = 'Elevate <hello@mail.sayelevate.com>';
      }
    } else if (emailRegex.test(FROM_EMAIL)) {
      FROM_EMAIL = `Elevate <${FROM_EMAIL}>`;
    } else {
      FROM_EMAIL = 'Elevate <hello@mail.sayelevate.com>';
    }

    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email service not configured (RESEND_API_KEY missing)' }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get users with the relevant preference enabled
    const preferenceColumn = notificationType === 'new_features' 
      ? 'email_new_features' 
      : 'email_platform_updates';

    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('id, email, full_name, first_name, last_name')
      .eq(preferenceColumn, true)
      .not('email', 'is', null)
      .eq('verified', true);

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch users', error: dbError.message }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users found with this preference enabled', 
          total: 0,
          sent: 0,
          failed: 0 
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Create unsubscribe URL (users will need to log in to update preferences)
    const unsubscribeUrl = `${supabaseUrl.replace('/rest/v1', '')}/#/settings/notifications`;

    // Generate email HTML using template
    const htmlContent = getEmailTemplate(subject, content, unsubscribeUrl);
    
    // Create plain text version (simple conversion)
    const textContent = content.replace(/\n/g, '\n\n');

    // Send emails via Resend
    const results = [];
    for (const user of users) {
      try {
        const emailPayload = {
          from: FROM_EMAIL,
          to: user.email,
          subject: subject,
          html: htmlContent,
          text: textContent,
        };

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(emailPayload),
        });

        const emailData = await emailResponse.json();
        
        if (emailResponse.ok) {
          results.push({ 
            userId: user.id, 
            email: user.email, 
            success: true,
            messageId: emailData.id || null
          });
        } else {
          results.push({ 
            userId: user.id, 
            email: user.email, 
            success: false, 
            error: emailData.message || 'Unknown error' 
          });
        }
      } catch (emailError: any) {
        results.push({ 
          userId: user.id, 
          email: user.email, 
          success: false, 
          error: emailError.message || 'Failed to send email' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount} emails, ${failureCount} failed`,
        total: users.length,
        sent: successCount,
        failed: failureCount,
        results: results,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-notification-emails:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

