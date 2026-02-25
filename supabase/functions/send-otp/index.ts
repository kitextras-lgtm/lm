import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors, getCorsHeaders } from '../_shared/cors.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { getSupabaseEnv } from '../_shared/supabase-client.ts';
import { getClientIp } from '../_shared/request-helpers.ts';
import { getValidatedFromEmail } from '../_shared/email.ts';

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
    const { email, isSignup, isLogin } = await req.json();

    if (!email) {
      return jsonResp(400, { success: false, message: 'Email required' });
    }

    const supabaseClient = createServiceClient();
    const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();

    // ─── Rate Limiting ───────────────────────────────────────────────────────
    const clientIP = getClientIp(req);

    async function checkRateLimit(
      identifier: string,
      type: 'otp_email' | 'otp_ip',
      maxAttempts: number,
    ): Promise<string | null> {
      const now = new Date().toISOString();
      await supabaseClient.from('rate_limits').delete().lt('window_end', now);
      const { data: existing } = await supabaseClient
        .from('rate_limits')
        .select('id, count, window_end')
        .eq('identifier', identifier)
        .eq('type', type)
        .gt('window_end', now)
        .maybeSingle();
      if (existing && existing.count >= maxAttempts) {
        const remainingMs = new Date(existing.window_end).getTime() - Date.now();
        const remainingMin = Math.ceil(remainingMs / 60000);
        return `Too many attempts. Try again in ${remainingMin} minute${remainingMin !== 1 ? 's' : ''}.`;
      }
      if (existing) {
        await supabaseClient
          .from('rate_limits')
          .update({ count: existing.count + 1 })
          .eq('id', existing.id);
      } else {
        await supabaseClient.from('rate_limits').insert({
          identifier,
          type,
          window_end: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        });
      }
      return null;
    }

    const emailLimit = await checkRateLimit(email.toLowerCase(), 'otp_email', 5);
    if (emailLimit) {
      return jsonResp(429, { success: false, message: emailLimit });
    }
    const ipLimit = await checkRateLimit(clientIP, 'otp_ip', 10);
    if (ipLimit) {
      return jsonResp(429, { success: false, message: ipLimit });
    }
    // ─────────────────────────────────────────────────────────────────────────

    // Check auth.users as the source of truth
    let existingAuthUser: Record<string, unknown> | null = null;

    try {
      const getUserResponse = await fetch(
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

      if (getUserResponse.ok) {
        let usersData;
        try {
          usersData = JSON.parse(await getUserResponse.text());
        } catch {
          usersData = { users: [] };
        }

        if (usersData.users && usersData.users.length > 0) {
          // CRITICAL FIX: Supabase Auth API might return wrong users — filter by exact email match
          const matchingUser = usersData.users.find(
            (u: Record<string, unknown>) =>
              u.email && (u.email as string).toLowerCase() === email.toLowerCase(),
          );

          if (matchingUser) {
            existingAuthUser = matchingUser;
          } else {
            console.error(
              'Auth API returned users but none match requested email:',
              email,
            );
            existingAuthUser = null;
          }
        }
      }
    } catch (err) {
      console.error('Error checking auth.users:', err);
    }

    if (isSignup) {
      if (existingAuthUser) {
        if (existingAuthUser.deleted_at) {
          existingAuthUser = null; // Soft-deleted — allow signup
        } else {
          // Check if user has completed onboarding
          const { data: userData } = await supabaseClient
            .from('users')
            .select('user_type')
            .eq('id', existingAuthUser.id as string)
            .maybeSingle();

          if (!userData?.user_type) {
            // Incomplete onboarding — allow continuation
            return jsonResp(200, {
              success: true,
              isContinuation: true,
              message: 'Continue your signup process',
            });
          } else {
            return jsonResp(400, {
              success: false,
              message: 'This email is already registered. Please log in instead.',
            });
          }
        }
      }
    }

    if (isLogin) {
      if (!existingAuthUser) {
        // Check users table as fallback
        const { data: userFromTable } = await supabaseClient
          .from('users')
          .select('id, email')
          .eq('email', email)
          .maybeSingle();

        if (userFromTable?.id) {
          // Verify user exists in auth.users by ID
          const getUserByIdResponse = await fetch(
            `${supabaseUrl}/auth/v1/admin/users/${userFromTable.id}`,
            {
              method: 'GET',
              headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
                'Content-Type': 'application/json',
              },
            },
          );

          if (!getUserByIdResponse.ok) {
            return jsonResp(400, {
              success: false,
              message: 'No account found. Please sign up first.',
            });
          }
        } else {
          return jsonResp(400, {
            success: false,
            message: 'No account found. Please sign up first.',
          });
        }
      }
    }

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Invalidate previous OTPs for this email
    await supabaseClient
      .from('otp_codes')
      .update({ verified: true })
      .eq('email', email)
      .eq('verified', false);

    const { error: insertError } = await supabaseClient.from('otp_codes').insert({
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

    // Send OTP email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const FROM_EMAIL = getValidatedFromEmail();

    let emailSent = false;

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
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
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
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#000000 !important;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <div class="container" style="max-width:600px;margin:0 auto;padding:40px 20px;background-color:#000000;">
    <div class="content-box" style="background-color:#000000;border-radius:8px;padding:60px 40px;box-shadow:0 1px 3px 0 rgba(255,255,255,0.1);">
      <h1 style="font-size:32px;font-weight:600;margin:0 0 40px 0;text-align:center;color:#ffffff !important;line-height:1.2;">
        Your Elevate verification code is:
      </h1>
      <div class="code-box" style="background-color:#1a1a1a !important;border-radius:16px;padding:40px 20px;margin:0 0 40px 0;text-align:center;">
        <p class="code" style="font-size:56px;font-weight:700;letter-spacing:12px;margin:0;color:#ffffff !important;line-height:1;">
          ${code}
        </p>
      </div>
      <div style="text-align:center;">
        <p class="text" style="font-size:18px;color:#ffffff !important;line-height:1.6;margin:0 0 8px 0;">This code expires after 10 minutes and can</p>
        <p class="text" style="font-size:18px;color:#ffffff !important;line-height:1.6;margin:0 0 8px 0;">only be used once.</p>
        <p class="text" style="font-size:18px;color:#ffffff !important;line-height:1.6;margin:0;font-weight:600;">Never share your code.</p>
      </div>
    </div>
    <div style="text-align:center;margin-top:30px;padding:0 20px;">
      <p style="font-size:14px;color:#9ca3af !important;line-height:1.5;margin:0;">If you didn't request this code, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>`,
          }),
        });

        if (!res.ok) {
          const responseData = await res.text();
          console.error('Resend API error:', res.status, responseData);
        } else {
          emailSent = true;
        }
      } catch (err) {
        console.error('Error sending email via Resend:', err);
      }
    } else {
      console.log('RESEND_API_KEY not configured. OTP will not be delivered.');
    }

    return jsonResp(200, { success: true, emailSent });
  } catch (err) {
    console.error('Error in send-otp:', err);
    return jsonResp(500, { success: false, message: 'Failed to send OTP' });
  }
});
