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

      const { data: userProfile } = await supabaseClient
        .from('user_profiles')
        .select('user_type')
        .eq('id', existingUser.id)
        .maybeSingle();

      if (!userProfile || !userProfile.user_type) {
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
    const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'delivered@resend.dev';

    let emailSent = false;
    let emailError = null;

    if (RESEND_API_KEY) {
      try {
        const emailPayload = {
          from: FROM_EMAIL,
          to: [email],
          subject: 'Your Elevate Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Verify Your Email</h2>
              <p style="color: #666; font-size: 16px;">Your verification code is:</p>
              <div style="background: #f4f4f4; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #000;">${code}</span>
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 30 minutes.</p>
              <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this code, please ignore this email.</p>
            </div>
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
