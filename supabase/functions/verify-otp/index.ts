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
    const { email, code, isSignup } = await req.json();

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

    // Check if this is a signup (new user) or login (existing user)
    let authUserId: string | null = null;
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (isSignup) {
      // Check if auth user already exists using REST API
      console.log('Checking for existing user:', email);
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

      if (getUserResponse.ok) {
        const usersData = await getUserResponse.json();
        if (usersData.users && usersData.users.length > 0) {
          // User already exists
          authUserId = usersData.users[0].id;
          console.log('Found existing auth user:', authUserId);
        }
      } else {
        console.log('No existing user found or error checking:', await getUserResponse.text());
      }

      if (!authUserId) {
        // Create new Supabase Auth user using REST API
        console.log('Creating new auth user for:', email);
        const createUserResponse = await fetch(
          `${supabaseUrl}/auth/v1/admin/users`,
          {
            method: 'POST',
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              email_confirm: true,
              user_metadata: {
                email_verified: true
              }
            }),
          }
        );

        if (!createUserResponse.ok) {
          const errorText = await createUserResponse.text();
          console.error('Error creating auth user:', errorText);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: `Failed to create account. Please try again.` 
            }),
            {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        const newUserData = await createUserResponse.json();
        if (!newUserData?.id) {
          console.error('Error: New auth user created but no ID returned. Response:', newUserData);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Failed to create user account. Please try again.' 
            }),
            {
              status: 500,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        authUserId = newUserData.id;
        console.log('Created new Supabase Auth user:', authUserId);
      }

      // Also create/update entry in users table
      const { error: usersError } = await supabaseClient
        .from('users')
        .upsert({
          id: authUserId,
          email,
          verified: true,
        }, {
          onConflict: 'id'
        });

      if (usersError) {
        console.error('Error upserting to users table:', usersError);
        // Don't fail the whole process, but log the error
        // The user is created in auth.users, which is the critical part
      }
    } else {
      // Login - find existing auth user using REST API
      console.log('Looking up user for login:', email);
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

      if (!getUserResponse.ok) {
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

      const usersData = await getUserResponse.json();
      if (!usersData.users || usersData.users.length === 0) {
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

      authUserId = usersData.users[0].id;
      console.log('Found user for login:', authUserId);
      const { error: usersError } = await supabaseClient
        .from('users')
        .upsert({
          id: authUserId,
          email,
          verified: true,
        }, {
          onConflict: 'id'
        });

      if (usersError) {
        console.error('Error upserting to users table (login):', usersError);
        // Don't fail the whole process, but log the error
      }
    }

    // Ensure authUserId is set
    if (!authUserId) {
      console.error('Error: authUserId is null after processing');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to create or retrieve user account. Please try again.' 
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if user profile exists in users table (updated to use users table)
    const { data: userData } = await supabaseClient
      .from('users')
      .select('user_type, profile_completed')
      .eq('id', authUserId)
      .maybeSingle();

    console.log('OTP verified successfully for:', email, 'Auth User ID:', authUserId);

    return new Response(
      JSON.stringify({
        success: true,
        userId: authUserId,
        hasProfile: !!userData?.profile_completed,
        userType: userData?.user_type || null
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: any) {
    console.error('Error in verify-otp:', err);
    const errorMessage = err?.message || err?.toString() || 'Failed to verify OTP';
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: errorMessage 
      }),
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