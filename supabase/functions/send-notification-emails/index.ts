import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient, getSupabaseEnv } from '../_shared/supabase-client.ts';
import { getValidatedFromEmail, getEmailTemplate } from '../_shared/email.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { notificationType, subject, content } = await req.json();

    if (!notificationType || !subject || !content) {
      return jsonError('notificationType, subject, and content are required');
    }

    if (!['new_features', 'platform_updates'].includes(notificationType)) {
      return jsonError('Invalid notification type. Must be "new_features" or "platform_updates"');
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return jsonError('Email service not configured (RESEND_API_KEY missing)', 500);
    }

    const supabase = createServiceClient();
    const { url: supabaseUrl } = getSupabaseEnv();
    const FROM_EMAIL = getValidatedFromEmail();

    // ── Fetch opted-in users ──
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
      return jsonError(`Failed to fetch users: ${dbError.message}`, 500);
    }

    if (!users || users.length === 0) {
      return json({ success: true, message: 'No users found with this preference enabled', total: 0, sent: 0, failed: 0 });
    }

    // ── Build email ──
    const unsubscribeUrl = `${supabaseUrl.replace('/rest/v1', '')}/#/settings/notifications`;
    const htmlContent = getEmailTemplate(subject, content, unsubscribeUrl);
    const textContent = content.replace(/\n/g, '\n\n');

    // ── Send emails ──
    const results: { userId: string; email: string; success: boolean; messageId?: string; error?: string }[] = [];

    for (const user of users) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
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

        const data = await res.json();

        results.push({
          userId: user.id,
          email: user.email,
          success: res.ok,
          ...(res.ok ? { messageId: data.id } : { error: data.message || 'Unknown error' }),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to send email';
        results.push({ userId: user.id, email: user.email, success: false, error: msg });
      }
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return json({
      success: true,
      message: `Sent ${sent} emails, ${failed} failed`,
      total: users.length,
      sent,
      failed,
      results,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error in send-notification-emails:', msg);
    return jsonError(msg, 500);
  }
});
