import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, isSignup, isLogin } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (isSignup) {
      if (existingUser) {
        return new Response(
          JSON.stringify({ success: false, message: 'This email is already registered. Please log in instead.' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    if (isLogin) {
      if (!existingUser) {
        return new Response(
          JSON.stringify({ success: false, message: 'No account found. Please sign up first.' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Check users table for user_type (updated to use users table instead of user_profiles)
      const { data: userData } = await supabaseClient
        .from('users')
        .select('user_type')
        .eq('id', existingUser.id)
        .maybeSingle();

      if (!userData || !userData.user_type) {
        return new Response(
          JSON.stringify({ success: false, message: 'No account found. Please sign up first.' }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    await supabaseClient
      .from('otp_codes')
      .update({ verified: true })
      .eq('email', email)
      .eq('verified', false);

    const { error: insertError } = await supabaseClient
      .from('otp_codes')
      .insert({
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

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let FROM_EMAIL = Deno.env.get('FROM_EMAIL')?.trim() || '';

    // Validate and format FROM_EMAIL
    // Resend requires format: "email@example.com" or "Name <email@example.com>"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!FROM_EMAIL || FROM_EMAIL === '') {
      // Use default with proper format - your domain
      FROM_EMAIL = 'Elevate <hello@mail.sayelevate.com>';
    } else if (FROM_EMAIL.includes('<') && FROM_EMAIL.includes('>')) {
      // Already in "Name <email@example.com>" format, use as is
      // Validate the email part inside <>
      const emailMatch = FROM_EMAIL.match(/<([^>]+)>/);
      if (emailMatch && !emailRegex.test(emailMatch[1])) {
        FROM_EMAIL = 'Elevate <hello@mail.sayelevate.com>';
      }
    } else if (emailRegex.test(FROM_EMAIL)) {
      // Valid email format, wrap with name
      FROM_EMAIL = `Elevate <${FROM_EMAIL}>`;
    } else {
      // Invalid format, use default
      console.warn(`Invalid FROM_EMAIL format: "${FROM_EMAIL}". Using default.`);
      FROM_EMAIL = 'Elevate <hello@mail.sayelevate.com>';
    }

    let emailSent = false;
    let emailError: string | null = null;

    if (RESEND_API_KEY) {
      try {
        const emailPayload = {
          from: FROM_EMAIL,
          to: [email],
          subject: `${code} is your verification code`,
          html: `
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
          ${code}
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
          `,
        };

        console.log('Attempting to send email to:', email);
        console.log('Using from address:', FROM_EMAIL);
        console.log('API Key configured:', !!RESEND_API_KEY);

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify(emailPayload),
        });

        const responseData = await res.text();
        console.log('Resend API response status:', res.status);
        console.log('Resend API response:', responseData);

        if (!res.ok) {
          console.error('Resend API error - Status:', res.status);
          console.error('Resend API error - Response:', responseData);
          emailError = `Email service error: ${responseData}`;
        } else {
          console.log('Email sent successfully via Resend');
          emailSent = true;
        }
      } catch (err) {
        console.error('Error sending email via Resend:', err);
        emailError = `Failed to send email: ${err.message}`;
      }
    } else {
      console.log('RESEND_API_KEY not configured. OTP code:', code);
      emailError = 'Email service not configured';
    }

    console.log('OTP generated for', email, ':', code);
    console.log('Email sent status:', emailSent);
    console.log('Email error:', emailError);

    return new Response(
      JSON.stringify({
        success: true,
        devCode: !emailSent ? code : undefined,
        emailSent: emailSent,
        emailError: emailError
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Error in send-otp:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to send OTP' }),
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
