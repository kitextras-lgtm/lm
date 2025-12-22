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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Check auth.users as the source of truth (consistent with verify-otp)
    let existingAuthUser = null;
    console.log('🔍 send-otp: Checking auth.users for email:', email);
    console.log('🔍 send-otp: isSignup:', isSignup, 'isLogin:', isLogin);
    
    try {
      const getUserResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 send-otp: Auth API response status:', getUserResponse.status);
      const responseText = await getUserResponse.text();
      console.log('📡 send-otp: Auth API response body:', responseText);

      if (getUserResponse.ok) {
        let usersData;
        try {
          usersData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ send-otp: Failed to parse response:', parseError);
          usersData = { users: [] };
        }
        
        console.log('📋 send-otp: Parsed users data:', JSON.stringify(usersData, null, 2));
        
        if (usersData.users && usersData.users.length > 0) {
          // CRITICAL FIX: Supabase Auth API might return wrong users - filter by exact email match
          const matchingUser = usersData.users.find((u: any) => 
            u.email && u.email.toLowerCase() === email.toLowerCase()
          );
          
          if (matchingUser) {
            existingAuthUser = matchingUser;
            console.log('⚠️ send-otp: Found matching auth user:', {
              id: existingAuthUser.id,
              email: existingAuthUser.email,
              deleted_at: existingAuthUser.deleted_at,
              banned_until: existingAuthUser.banned_until
            });
          } else {
            // API returned users but none match the requested email - this is a bug
            console.error('❌ CRITICAL BUG: Auth API returned users but none match requested email!');
            console.error('❌ Requested email:', email);
            console.error('❌ Returned users:', usersData.users.map((u: any) => u.email));
            // Treat as if no user exists - allow signup
            existingAuthUser = null;
            console.log('✅ send-otp: No matching user found - allowing signup');
          }
        } else {
          console.log('✅ send-otp: No existing user found in auth.users');
        }
      } else {
        console.log('⚠️ send-otp: Auth API returned non-OK status:', getUserResponse.status);
      }
    } catch (err) {
      console.error('❌ send-otp: Error checking auth.users:', err);
    }

    if (isSignup) {
      if (existingAuthUser) {
        // Check if user is soft-deleted or banned
        if (existingAuthUser.deleted_at) {
          console.log('⚠️ send-otp: User exists but is soft-deleted, allowing signup');
          existingAuthUser = null; // Allow signup to proceed
        } else {
          console.log('❌ send-otp: Signup blocked - User already exists in auth.users:', existingAuthUser.id);
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
      } else {
        console.log('✅ send-otp: No existing user found - allowing signup to proceed');
      }
    }

    if (isLogin) {
      if (!existingAuthUser) {
        console.log('Login blocked: No user found in auth.users');
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

      // Also check users table for user_type to ensure profile exists
      const { data: userData } = await supabaseClient
        .from('users')
        .select('user_type')
        .eq('id', existingAuthUser.id)
        .maybeSingle();

      if (!userData || !userData.user_type) {
        console.log('Login blocked: User exists in auth but no user_type in users table');
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
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>Elevate Verification Code</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px 16px !important;
      }
      .content-box {
        padding: 40px 24px !important;
      }
      .code-box {
        padding: 30px 16px !important;
      }
      h1 {
        font-size: 24px !important;
        margin-bottom: 30px !important;
      }
      .code {
        font-size: 42px !important;
        letter-spacing: 8px !important;
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
        Your Elevate verification code is:
      </h1>

      <div class="code-box" style="background-color: #1a1a1a !important; border-radius: 16px; padding: 40px 20px; margin: 0 0 40px 0; text-align: center;">
        <p class="code" style="font-size: 56px; font-weight: 700; letter-spacing: 12px; margin: 0; color: #ffffff !important; line-height: 1;">
          ${code}
        </p>
      </div>

      <div style="text-align: center;">
        <p class="text" style="font-size: 18px; color: #ffffff !important; line-height: 1.6; margin: 0 0 8px 0;">
          This code expires after 30 minutes and can
        </p>
        <p class="text" style="font-size: 18px; color: #ffffff !important; line-height: 1.6; margin: 0 0 8px 0;">
          only be used once.
        </p>
        <p class="text" style="font-size: 18px; color: #ffffff !important; line-height: 1.6; margin: 0; font-weight: 600;">
          Never share your code.
        </p>
      </div>

    </div>

    <div style="text-align: center; margin-top: 30px; padding: 0 20px;">
      <p style="font-size: 14px; color: #9ca3af !important; line-height: 1.5; margin: 0;">
        If you didn't request this code, you can safely ignore this email.
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
