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
    const { email, code } = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email and code required' }),
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

    const { data: otpRecord, error: fetchError } = await supabaseClient
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching OTP:', fetchError);
      throw fetchError;
    }

    if (!otpRecord) {
      return new Response(
        JSON.stringify({ success: false, message: 'No valid OTP found' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const expiresAt = new Date(otpRecord.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ success: false, message: 'OTP has expired' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (otpRecord.attempts >= 3) {
      return new Response(
        JSON.stringify({ success: false, message: 'Too many attempts' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (otpRecord.code !== code) {
      await supabaseClient
        .from('otp_codes')
        .update({ attempts: otpRecord.attempts + 1 })
        .eq('id', otpRecord.id);

      return new Response(
        JSON.stringify({ success: false, message: 'Invalid code' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    await supabaseClient
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    let userId;
    if (!existingUser) {
      const { data: newUser } = await supabaseClient
        .from('users')
        .insert({
          email,
          verified: true,
        })
        .select()
        .single();
      userId = newUser?.id;
    } else {
      await supabaseClient
        .from('users')
        .update({ verified: true })
        .eq('email', email);
      userId = existingUser.id;
    }

    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('user_type')
      .eq('id', userId)
      .maybeSingle();

    console.log('OTP verified successfully for:', email);

    return new Response(
      JSON.stringify({
        success: true,
        hasProfile: !!userProfile,
        userType: userProfile?.user_type || null
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Error in verify-otp:', err);
    return new Response(
      JSON.stringify({ success: false, message: 'Failed to verify OTP' }),
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