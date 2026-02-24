import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient, getSupabaseEnv } from '../_shared/supabase-client.ts';
import { getValidatedFromEmail } from '../_shared/email.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { email, isSignup, isLogin } = await req.json();

    if (!email) {
      return jsonError('Email required');
    }

    const supabase = createServiceClient();
    const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();

    // ── Look up user in auth.users ──
    let existingAuthUser = await findAuthUserByEmail(supabaseUrl, serviceRoleKey, email);

    // ── Signup guard ──
    if (isSignup) {
      if (existingAuthUser) {
        if (existingAuthUser.deleted_at) {
          existingAuthUser = null;
        } else {
          const { data: userData } = await supabase
            .from('users')
            .select('user_type')
            .eq('id', existingAuthUser.id)
            .maybeSingle();

          if (!userData?.user_type) {
            return json({ success: true, isContinuation: true, message: 'Continue your signup process' });
          }

          return jsonError('This email is already registered. Please log in instead.');
        }
      }
    }

    // ── Login guard ──
    if (isLogin) {
      if (!existingAuthUser) {
        const { data: userFromTable } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', email)
          .maybeSingle();

        if (!userFromTable?.id) {
          return jsonError('No account found. Please sign up first.');
        }

        const verified = await verifyAuthUserById(supabaseUrl, serviceRoleKey, userFromTable.id);
        if (!verified) {
          return jsonError('No account found. Please sign up first.');
        }
      }
    }

    // ── Generate & store OTP ──
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60_000);

    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('email', email)
      .eq('verified', false);

    const { error: insertError } = await supabase.from('otp_codes').insert({
      email,
      code,
      expires_at: expiresAt.toISOString(),
      verified: false,
      attempts: 0,
    });

    if (insertError) {
      console.error('Error inserting OTP:', insertError);
      throw insertError;
    }

    // ── Send email via Resend ──
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM_EMAIL = getValidatedFromEmail();
    let emailSent = false;
    let emailError: string | null = null;

    if (RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [email],
            subject: `${code} is your verification code`,
            html: buildOtpEmailHtml(code),
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error('Resend API error:', res.status, body);
          emailError = `Email service error: ${body}`;
        } else {
          emailSent = true;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Error sending email via Resend:', msg);
        emailError = `Failed to send email: ${msg}`;
      }
    } else {
      emailError = 'Email service not configured';
    }

    return json({
      success: true,
      devCode: !emailSent ? code : undefined,
      emailSent,
      emailError,
    });
  } catch (err) {
    console.error('Error in send-otp:', err);
    return jsonError('Failed to send OTP', 500);
  }
});

// ─── Helpers ────────────────────────────────────────────────

async function findAuthUserByEmail(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.users?.length) return null;

    return (
      data.users.find(
        (u: Record<string, unknown>) =>
          typeof u.email === 'string' && u.email.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function verifyAuthUserById(
  supabaseUrl: string,
  serviceRoleKey: string,
  userId: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}

function buildOtpEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>Elevate Verification Code</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 20px 16px !important; }
      .content-box { padding: 40px 24px !important; }
      .code-box { padding: 30px 16px !important; }
      h1 { font-size: 24px !important; margin-bottom: 30px !important; }
      .code { font-size: 42px !important; letter-spacing: 8px !important; }
      .text { font-size: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000 !important;">
  <div class="container" style="max-width:600px;margin:0 auto;padding:40px 20px;background-color:#000000;">
    <div class="content-box" style="background-color:#000000;border-radius:8px;padding:60px 40px;">
      <h1 style="font-size:32px;font-weight:600;margin:0 0 40px 0;text-align:center;color:#ffffff !important;line-height:1.2;">Your Elevate verification code is:</h1>
      <div class="code-box" style="background-color:#1a1a1a !important;border-radius:16px;padding:40px 20px;margin:0 0 40px 0;text-align:center;">
        <p class="code" style="font-size:56px;font-weight:700;letter-spacing:12px;margin:0;color:#ffffff !important;line-height:1;">${code}</p>
      </div>
      <div style="text-align:center;">
        <p class="text" style="font-size:18px;color:#ffffff !important;line-height:1.6;margin:0 0 8px 0;">This code expires after 30 minutes and can only be used once.</p>
        <p class="text" style="font-size:18px;color:#ffffff !important;line-height:1.6;margin:0;font-weight:600;">Never share your code.</p>
      </div>
    </div>
    <div style="text-align:center;margin-top:30px;padding:0 20px;">
      <p style="font-size:14px;color:#9ca3af !important;line-height:1.5;margin:0;">If you didn't request this code, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`;
}
