import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors, getCorsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { getValidatedFromEmail, getEmailTemplate } from '../_shared/email.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);

  const jsonResp = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    const { notificationType, subject, content } = await req.json();

    if (!notificationType || !subject || !content) {
      return jsonResp(400, {
        success: false,
        message: 'notificationType, subject, and content are required',
      });
    }

    if (!['new_features', 'platform_updates'].includes(notificationType)) {
      return jsonResp(400, {
        success: false,
        message: 'Invalid notification type. Must be "new_features" or "platform_updates"',
      });
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return jsonResp(500, {
        success: false,
        message: 'Email service not configured (RESEND_API_KEY missing)',
      });
    }

    const FROM_EMAIL = getValidatedFromEmail();
    const supabase = createServiceClient();
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';

    // Get users with the relevant preference enabled
    const preferenceColumn =
      notificationType === 'new_features' ? 'email_new_features' : 'email_platform_updates';

    const { data: users, error: dbError } = await supabase
      .from('users')
      .select('id, email, full_name, first_name, last_name')
      .eq(preferenceColumn, true)
      .not('email', 'is', null)
      .eq('verified', true);

    if (dbError) {
      console.error('Database error:', dbError);
      return jsonResp(500, {
        success: false,
        message: 'Failed to fetch users',
        error: dbError.message,
      });
    }

    if (!users || users.length === 0) {
      return jsonResp(200, {
        success: true,
        message: 'No users found with this preference enabled',
        total: 0,
        sent: 0,
        failed: 0,
      });
    }

    const unsubscribeUrl = `${supabaseUrl.replace('/rest/v1', '')}/#/settings/notifications`;
    const htmlContent = getEmailTemplate(subject, content, unsubscribeUrl);
    const textContent = content.replace(/\n/g, '\n\n');

    const results = [];
    for (const user of users) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: user.email,
            subject,
            html: htmlContent,
            text: textContent,
          }),
        });

        const emailData = await emailResponse.json();

        if (emailResponse.ok) {
          results.push({
            userId: user.id,
            email: user.email,
            success: true,
            messageId: emailData.id || null,
          });
        } else {
          results.push({
            userId: user.id,
            email: user.email,
            success: false,
            error: emailData.message || 'Unknown error',
          });
        }
      } catch (emailError: unknown) {
        const msg = emailError instanceof Error ? emailError.message : 'Failed to send email';
        results.push({ userId: user.id, email: user.email, success: false, error: msg });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return jsonResp(200, {
      success: true,
      message: `Sent ${successCount} emails, ${failureCount} failed`,
      total: users.length,
      sent: successCount,
      failed: failureCount,
      results,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in send-notification-emails:', msg);
    return jsonResp(500, { success: false, message: msg });
  }
});
