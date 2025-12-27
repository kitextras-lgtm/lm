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

    // Extract IP address and User-Agent for spam filtering
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : (req.headers.get('x-real-ip') || '127.0.0.1');
    const userAgent = req.headers.get('user-agent') || 'unknown';

    console.log('🔍 OTP verified successfully. Processing:', {
      email,
      isSignup,
      isLogin: !isSignup,
      ipAddress,
      supabaseUrl: supabaseUrl ? '✅ Set' : '❌ Missing',
      serviceRoleKey: serviceRoleKey ? '✅ Set' : '❌ Missing'
    });
    
    if (isSignup) {
      console.log('📝 SIGNUP FLOW: Starting new user creation process');
      
      // Check if user already exists in auth.users (to determine if this is completing an incomplete profile)
      console.log('Checking for existing user in auth.users:', email);
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

      console.log('📡 Auth API check response status:', getUserResponse.status);
      const responseText = await getUserResponse.text();
      console.log('📡 Auth API check response body:', responseText);
      
      if (getUserResponse.ok) {
        let usersData;
        try {
          usersData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Failed to parse auth check response:', parseError);
          console.error('❌ Raw response:', responseText);
          // Continue with signup if we can't parse the response
          usersData = { users: [] };
        }
        
        console.log('📋 Parsed users data:', JSON.stringify(usersData, null, 2));
        
        if (usersData.users && usersData.users.length > 0) {
          // CRITICAL FIX: Supabase Auth API might return wrong users - filter by exact email match
          const matchingUser = usersData.users.find((u: any) => 
            u.email && u.email.toLowerCase() === email.toLowerCase()
          );
          
          if (!matchingUser) {
            // API returned users but none match the requested email - this is a bug
            console.error('❌ CRITICAL BUG: Auth API returned users but none match requested email!');
            console.error('❌ Requested email:', email);
            console.error('❌ Returned users:', usersData.users.map((u: any) => u.email));
            // Treat as if no user exists - proceed with new user creation
            console.log('✅ No matching user found - proceeding with new user creation');
          } else {
            // User exists in auth.users - check if they're soft-deleted or banned
            let existingAuthUser = matchingUser;
            console.log('⚠️ User found in auth.users:', {
              id: existingAuthUser.id,
              email: existingAuthUser.email,
              deleted_at: existingAuthUser.deleted_at,
              banned_until: existingAuthUser.banned_until
            });
            
            // CRITICAL FIX: Filter out soft-deleted users (they shouldn't block signup)
            if (existingAuthUser.deleted_at) {
              console.log('✅ User is soft-deleted - treating as non-existent, allowing new signup');
              // Treat as if user doesn't exist - proceed with new user creation
              // Don't set authUserId, let it create a new user
            } else if (existingAuthUser.banned_until && new Date(existingAuthUser.banned_until) > new Date()) {
              // User is banned - block signup
              console.error('❌ User is banned - signup blocked');
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  message: 'This account has been banned. Please contact support.' 
                }),
                {
                  status: 403,
                  headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                  },
                }
              );
            } else {
            // User exists and is active - check if they have a complete profile
            const { data: userProfile } = await supabaseClient
              .from('users')
              .select('id, email, user_type, profile_completed')
              .eq('id', existingAuthUser.id)
              .maybeSingle();
            
            console.log('📋 User profile check:', userProfile ? JSON.stringify(userProfile, null, 2) : 'No profile found');
            
            // CRITICAL: Verify email matches before blocking
            if (existingAuthUser.email?.toLowerCase() !== email.toLowerCase()) {
              console.error('❌ CRITICAL BUG: Found user with different email!');
              console.error('❌ Requested email:', email);
              console.error('❌ Found user email:', existingAuthUser.email);
              console.error('❌ Found user ID:', existingAuthUser.id);
              // Don't block - treat as if no matching user found, proceed with new user creation
              console.log('✅ Email mismatch - treating as non-existent, proceeding with new user creation');
              // Don't set authUserId - let it create a new user
            } else if (userProfile && userProfile.user_type && userProfile.profile_completed) {
              // User has complete profile - block signup, must log in
              console.error('❌ User has complete profile - signup blocked');
              console.error('❌ Blocking details:', {
                requestedEmail: email,
                foundEmail: existingAuthUser.email,
                userId: existingAuthUser.id,
                hasProfile: !!userProfile,
                userType: userProfile?.user_type,
                profileCompleted: userProfile?.profile_completed
              });
              return new Response(
                JSON.stringify({ 
                  success: false, 
                  message: 'This email is already registered. Please log in instead.' 
                }),
                {
                  status: 400,
                  headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                  },
                }
              );
            } else {
              // User exists in auth.users but profile is incomplete - allow them to complete signup
              console.log('✅ User exists but profile is incomplete - allowing signup to complete');
              authUserId = existingAuthUser.id;
              console.log('✅ Will use existing auth user ID:', authUserId);
            }
          }
          }
        } else {
          console.log('✅ No existing user found in auth.users - proceeding with new user creation');
          console.log('📊 authUserId at this point:', authUserId);
        }
      } else {
        console.log('⚠️ Auth API check returned non-OK status:', getUserResponse.status);
        console.log('⚠️ Response text:', responseText);
        // If the check fails, we'll still try to create the user (might be a temporary API issue)
        console.log('⚠️ Continuing with signup despite check failure');
        console.log('📊 authUserId at this point:', authUserId);
      }

      console.log('🔍 After auth.users check - authUserId:', authUserId);

      // Check users table - but only block if there's a corresponding auth user
      // If email exists in users table but NOT in auth.users, it's an orphaned record - allow signup
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        // Check if this user ID exists in auth.users
        const checkAuthResponse = await fetch(
          `${supabaseUrl}/auth/v1/admin/users/${existingUser.id}`,
          {
            method: 'GET',
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (checkAuthResponse.ok) {
          // User exists in both users table AND auth.users - verify email matches
          const authUserData = await checkAuthResponse.json();
          if (authUserData.email && authUserData.email.toLowerCase() === email.toLowerCase()) {
            // Email matches - block signup
            console.error('User already exists in both users table and auth.users:', existingUser.id);
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: 'This email is already registered. Please log in instead.' 
              }),
              {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                },
              }
            );
          } else {
            // Email doesn't match - this is an orphaned record with wrong email
            console.log('⚠️ Found user in users table with different email - deleting orphaned record');
            await supabaseClient
              .from('users')
              .delete()
              .eq('id', existingUser.id);
            console.log('✅ Deleted orphaned user record with mismatched email');
          }
        } else {
          // User exists in users table but NOT in auth.users - orphaned record
          // Delete the orphaned record and allow signup to proceed
          console.log('⚠️ Found orphaned user record in users table (not in auth.users). Deleting orphaned record:', existingUser.id);
          await supabaseClient
            .from('users')
            .delete()
            .eq('id', existingUser.id);
          console.log('✅ Deleted orphaned user record, allowing signup to proceed');
        }
      }

      console.log('🔍 After users table check - authUserId:', authUserId);
      console.log('🔍 Ready to create user?', !authUserId ? 'YES - will create new' : 'NO - using existing');

      // Create a new user for signup (only if we don't already have an authUserId from incomplete profile)
      if (!authUserId) {
        console.log('🚀 ENTERING USER CREATION BLOCK - authUserId is null, will create new user');
        
        // SPAM FILTER: Check if a signup already exists from this IP/device (only for new signups)
        console.log('🛡️ SPAM FILTER: Checking for existing signup from IP:', ipAddress);
        const { data: existingSignup, error: signupCheckError } = await supabaseClient
          .from('signup_tracking')
          .select('id, email, created_at')
          .eq('ip_address', ipAddress)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (signupCheckError) {
          console.error('❌ Error checking signup tracking:', signupCheckError);
          // Don't block signup if we can't check - log error but continue
        } else if (existingSignup) {
          console.error('❌ SPAM FILTER: Signup blocked - IP address already used for signup:', {
            ipAddress,
            previousEmail: existingSignup.email,
            previousSignupDate: existingSignup.created_at
          });
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'Only one signup is allowed per device/IP address. Please contact support if you need assistance.' 
            }),
            {
              status: 403,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        } else {
          console.log('✅ SPAM FILTER: No existing signup found for this IP - allowing new signup');
        }
        
        // Create new Supabase Auth user using REST API
        console.log('🚀 Starting user creation process for:', email);
        console.log('📋 Supabase URL:', supabaseUrl);
        console.log('🔑 Service role key exists:', !!serviceRoleKey);
        
        try {
          // CRITICAL: Double-check email doesn't exist (or is soft-deleted) before creating
          const preCreateCheck = await fetch(
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
          
          if (preCreateCheck.ok) {
            const preCheckData = await preCreateCheck.json();
            if (preCheckData.users && preCheckData.users.length > 0) {
              // CRITICAL FIX: Filter by exact email match (API might return wrong users)
              const matchingUser = preCheckData.users.find((u: any) => 
                u.email && u.email.toLowerCase() === email.toLowerCase()
              );
              
              if (matchingUser) {
                // Only block if user exists AND is NOT soft-deleted
                if (!matchingUser.deleted_at) {
                  console.error('❌ CRITICAL: Active user already exists in auth.users before creation attempt!', {
                    id: matchingUser.id,
                    email: matchingUser.email,
                    deleted_at: matchingUser.deleted_at
                  });
                  return new Response(
                    JSON.stringify({ 
                      success: false, 
                      message: 'This email is already registered. Please log in instead.' 
                    }),
                    {
                      status: 400,
                      headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                      },
                    }
                  );
                } else {
                  console.log('⚠️ Found soft-deleted user - will create new user with same email');
                }
              } else {
                // API returned users but none match - this is a bug, but allow signup
                console.error('❌ CRITICAL BUG: Pre-create check returned users but none match requested email!');
                console.error('❌ Requested email:', email);
                console.error('❌ Returned users:', preCheckData.users.map((u: any) => u.email));
                console.log('✅ Proceeding with user creation despite API bug');
              }
            }
          }
          
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

          console.log('📡 Auth API response status:', createUserResponse.status);
          const responseText = await createUserResponse.text();
          console.log('📡 Auth API response body:', responseText);

          if (!createUserResponse.ok) {
            console.error('❌ Error creating auth user - HTTP', createUserResponse.status, ':', responseText);
            let errorMessage = 'Failed to create account. Please try again.';
            try {
              const errorData = JSON.parse(responseText);
              errorMessage = errorData.message || errorData.error_description || errorMessage;
            } catch {
              errorMessage = responseText || errorMessage;
            }
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

          let newUserData;
          try {
            newUserData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('❌ Failed to parse auth API response:', parseError);
            console.error('❌ Raw response:', responseText);
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: 'Failed to create user account. Invalid response from server.' 
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

          if (!newUserData?.id) {
            console.error('❌ Error: New auth user created but no ID returned.');
            console.error('❌ Full response:', JSON.stringify(newUserData, null, 2));
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
          console.log('✅ Created NEW Supabase Auth user with ID:', authUserId, 'Email:', email);
          console.log('✅ Full user data:', JSON.stringify(newUserData, null, 2));
          
          // CRITICAL: Verify the created user's email matches the requested email
          if (newUserData.email?.toLowerCase() !== email.toLowerCase()) {
            console.error('❌ CRITICAL ERROR: Created user email does not match requested email!');
            console.error('❌ Requested email:', email);
            console.error('❌ Created user email:', newUserData.email);
            console.error('❌ Created user ID:', authUserId);
            // Delete the incorrectly created auth user
            try {
              await fetch(
                `${supabaseUrl}/auth/v1/admin/users/${authUserId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'apikey': serviceRoleKey,
                    'Authorization': `Bearer ${serviceRoleKey}`,
                  },
                }
              );
              console.log('✅ Deleted incorrectly created auth user');
            } catch (deleteError) {
              console.error('❌ Failed to delete incorrectly created user:', deleteError);
            }
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
          
          // Verify the user was actually created (not returned as existing)
          // Check if this user ID already exists in our users table - if so, it's an existing user
          const { data: checkExisting } = await supabaseClient
            .from('users')
            .select('id, email, created_at')
            .eq('id', authUserId)
            .maybeSingle();

          if (checkExisting) {
            // User already exists in users table - this means Supabase returned an existing auth user
            console.error('❌ ERROR: User ID already exists in users table!', {
              userId: authUserId,
              email: checkExisting.email,
              created_at: checkExisting.created_at
            });
            // Delete the auth user since we can't use it
            try {
              await fetch(
                `${supabaseUrl}/auth/v1/admin/users/${authUserId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'apikey': serviceRoleKey,
                    'Authorization': `Bearer ${serviceRoleKey}`,
                  },
                }
              );
              console.log('✅ Deleted duplicate auth user');
            } catch (deleteError) {
              console.error('❌ Failed to delete duplicate user:', deleteError);
            }
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: 'This email is already registered. Please log in instead.' 
              }),
              {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                },
              }
            );
          }
          
          console.log('✅ Verified: This is a truly new user (not in users table yet)');
        } catch (fetchError) {
          console.error('❌ Exception during user creation:', fetchError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: `Failed to create account: ${fetchError.message || 'Unknown error'}` 
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
      } else {
        console.log('⚠️ authUserId already set, skipping user creation:', authUserId);
      }

      // Create entry in users table
      // CRITICAL FIX: Use INSERT (not UPSERT) for new users to prevent overwriting
      // Only use UPSERT if we're completing an incomplete profile (authUserId was set from existing user)
      const { data: existingUserCheck } = await supabaseClient
        .from('users')
        .select('id')
        .eq('id', authUserId)
        .maybeSingle();
      
      const isCompletingIncompleteProfile = !!existingUserCheck;
      
      let usersError, insertedUser;
      
      if (isCompletingIncompleteProfile) {
        // User exists in auth.users but has incomplete profile - use upsert to complete it
        console.log('📝 Completing incomplete profile in users table:', { id: authUserId, email });
        const result = await supabaseClient
          .from('users')
          .upsert({
            id: authUserId,
            email,
            verified: true,
          }, {
            onConflict: 'id'
          })
          .select();
        usersError = result.error;
        insertedUser = result.data;
      } else {
        // NEW user - use INSERT to ensure we get an error if ID already exists (should never happen)
        console.log('📝 Inserting NEW user into users table:', { id: authUserId, email });
        const result = await supabaseClient
          .from('users')
          .insert({
            id: authUserId,
            email,
            verified: true,
          })
          .select();
        usersError = result.error;
        insertedUser = result.data;
      }

      if (usersError) {
        console.error('❌ Error inserting to users table:', usersError);
        
        // Check if it's a unique constraint violation (user already exists)
        if (usersError.code === '23505' || usersError.message?.includes('duplicate') || usersError.message?.includes('unique')) {
          console.error('❌ User already exists in users table (unique constraint violation)');
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'This email is already registered. Please log in instead.' 
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }
        
        // For other errors, still fail the signup to prevent inconsistent state
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Failed to create user account: ${usersError.message}` 
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      } else {
        console.log('✅ Successfully created new user entry in users table:', {
          id: authUserId,
          email,
          insertedData: insertedUser
        });
        
        // Create profile for chat system (required for conversations)
        console.log('📝 Creating profile for new user:', authUserId);
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .insert({
            id: authUserId,
            name: email.split('@')[0] || 'User', // Default name from email
            avatar_url: '',
            is_admin: false,
            is_online: false,
          });
        
        if (profileError) {
          console.error('⚠️ Failed to create profile:', profileError);
          // Don't fail signup if profile creation fails - user can still proceed
        } else {
          console.log('✅ Successfully created profile for new user');
        }
        
        // Create admin conversation and send welcome message (only for new signups)
        console.log('💬 Setting up admin conversation for new user:', authUserId);
        try {
          // Get admin ID
          const { data: adminProfile, error: adminError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('is_admin', true)
            .limit(1)
            .maybeSingle();
          
          if (adminError) {
            console.error('⚠️ Failed to find admin profile:', adminError);
          } else if (adminProfile?.id) {
            const adminId = adminProfile.id;
            console.log('✅ Found admin ID:', adminId);
            
            // Check if conversation already exists
            const { data: existingConv } = await supabaseClient
              .from('conversations')
              .select('id')
              .eq('customer_id', authUserId)
              .eq('admin_id', adminId)
              .maybeSingle();
            
            if (!existingConv) {
              // Create new conversation
              const { data: newConv, error: convError } = await supabaseClient
                .from('conversations')
                .insert({
                  customer_id: authUserId,
                  admin_id: adminId,
                  last_message: '',
                  unread_count_admin: 0,
                  unread_count_customer: 0,
                })
                .select('id')
                .single();
              
              if (convError) {
                console.error('⚠️ Failed to create admin conversation:', convError);
              } else if (newConv?.id) {
                console.log('✅ Created admin conversation:', newConv.id);
                
                // Get user's first name if available (might be empty during signup)
                const { data: userData } = await supabaseClient
                  .from('users')
                  .select('first_name')
                  .eq('id', authUserId)
                  .maybeSingle();
                
                const firstName = userData?.first_name?.trim() || '';
                const welcomeMessage = `Hi${firstName ? ` ${firstName},` : ''} welcome to Elevate! 👋\n\nIf you have any questions, feel free to ask.\n\nHave suggestions or feedback? You can submit them here. We review everything and are always working to give you the best experience on Elevate.`;
                
                // Send welcome message
                const { error: messageError } = await supabaseClient
                  .from('messages')
                  .insert({
                    conversation_id: newConv.id,
                    sender_id: adminId,
                    type: 'text',
                    content: welcomeMessage,
                    status: 'sent',
                  });
                
                if (messageError) {
                  console.error('⚠️ Failed to send welcome message:', messageError);
                } else {
                  // Update conversation with last message
                  const welcomeMessagePreview = welcomeMessage.split('\n')[0];
                  await supabaseClient
                    .from('conversations')
                    .update({
                      last_message: welcomeMessagePreview,
                      last_message_at: new Date().toISOString(),
                      last_message_sender_id: adminId,
                      unread_count_customer: 1,
                    })
                    .eq('id', newConv.id);
                  
                  console.log('✅ Welcome message sent to new user');
                }
              }
            } else {
              console.log('ℹ️ Admin conversation already exists for user');
            }
          } else {
            console.warn('⚠️ No admin profile found - cannot create conversation');
          }
        } catch (chatError) {
          console.error('⚠️ Error setting up admin conversation:', chatError);
          // Don't fail signup if conversation setup fails
        }
        
        // Store signup tracking record for spam prevention
        console.log('📝 Storing signup tracking record:', { ipAddress, userAgent, email, userId: authUserId });
        const { error: trackingError } = await supabaseClient
          .from('signup_tracking')
          .insert({
            ip_address: ipAddress,
            user_agent: userAgent,
            email: email,
            user_id: authUserId
          });
        
        if (trackingError) {
          console.error('⚠️ Failed to store signup tracking record:', trackingError);
          // Don't fail the signup if tracking fails - log error but continue
        } else {
          console.log('✅ Successfully stored signup tracking record');
        }
      }
    } else {
      // Login - find existing user by checking which user ID the OTP was sent to
      // The OTP record contains the email, so we can verify the user exists
      // PRIMARY STRATEGY: Check users table FIRST (source of truth for email)
      console.log('🔍 Login: Checking users table by email (primary method):', email);
      const { data: userFromTable, error: userTableError } = await supabaseClient
        .from('users')
        .select('id, email')
        .ilike('email', email)  // Case-insensitive match
        .maybeSingle();
      
      console.log('📊 Login: Users table query result:', {
        hasData: !!userFromTable,
        hasError: !!userTableError,
        userId: userFromTable?.id,
        email: userFromTable?.email,
        error: userTableError ? JSON.stringify(userTableError) : null
      });
      
      if (userTableError) {
        console.error('❌ Login: Error querying users table:', userTableError);
      }
      
      if (userFromTable?.id) {
        console.log('✅ Login: Found user in users table with email:', userFromTable.email);
        console.log('✅ Login: User ID:', userFromTable.id);
        
        // Verify this user exists in auth.users by ID
        const getUserByIdResponse = await fetch(
          `${supabaseUrl}/auth/v1/admin/users/${userFromTable.id}`,
          {
            method: 'GET',
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
        
        if (getUserByIdResponse.ok) {
          const userByIdText = await getUserByIdResponse.text();
          let userByIdData;
          try {
            userByIdData = JSON.parse(userByIdText);
          } catch (parseError) {
            console.error('❌ Login: Failed to parse auth.users response by ID:', parseError);
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: 'No account found. Please sign up first.',
                debug: 'Failed to parse auth.users response'
              }),
              {
                status: 400,
                headers: {
                  ...corsHeaders,
                  'Content-Type': 'application/json',
                },
              }
            );
          }
          
          if (userByIdData && userByIdData.id) {
            console.log('✅ Login: User verified in auth.users by ID');
            console.log('✅ Login: Email in users table:', userFromTable.email);
            console.log('✅ Login: Email in auth.users:', userByIdData.email);
            console.log('✅ Login: Using authUserId:', userByIdData.id);
            authUserId = userByIdData.id;
            // Continue with login flow below - email mismatch is OK, we use users table as source of truth
          } else {
            console.error('❌ Login: User ID from users table not found in auth.users');
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: 'No account found. Please sign up first.',
                debug: 'User found in users table but not in auth.users'
              }),
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
          const errorText = await getUserByIdResponse.text();
          console.error('❌ Login: Failed to verify user in auth.users by ID');
          console.error('❌ Status:', getUserByIdResponse.status);
          console.error('❌ Response:', errorText);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'No account found. Please sign up first.',
              debug: 'User found in users table but auth.users verification failed'
            }),
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
        // FALLBACK: Try auth.users API (in case user exists there but not in users table - should be rare)
        console.log('⚠️ Login: User not found in users table, trying auth.users API as fallback');
        
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
          console.error('❌ Login: Auth API returned non-OK status:', getUserResponse.status);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'No account found. Please sign up first.',
              debug: `Email not found in users table and auth API returned ${getUserResponse.status}`
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }
        
        const responseText = await getUserResponse.text();
        let usersData;
        try {
          usersData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Login: Failed to parse auth API response:', parseError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'No account found. Please sign up first.',
              debug: 'Failed to parse auth API response'
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        if (!usersData || !usersData.users || usersData.users.length === 0) {
          console.error('❌ Login: No users found in auth.users response');
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'No account found. Please sign up first.',
              debug: 'Email not found in users table or auth.users'
            }),
            {
              status: 400,
              headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
              },
            }
          );
        }

        // CRITICAL: Only use user if email matches EXACTLY (case-insensitive)
        // Don't trust auth.users if it returns wrong email (could be normalization bug/email collision)
        const matchingUser = usersData.users.find((u: any) => 
          u.email && u.email.toLowerCase() === email.toLowerCase()
        );

        if (matchingUser) {
          console.log('✅ Login: Found user in auth.users with matching email:', matchingUser.id);
          authUserId = matchingUser.id;
        } else {
          console.error('❌ Login: Auth API returned user(s) but none match requested email exactly');
          console.error('❌ Requested email:', email);
          console.error('❌ Auth API returned:', usersData.users.map((u: any) => ({ email: u.email, id: u.id })));
          console.error('❌ This likely means email collision or normalization bug in Supabase Auth API');
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: 'No account found. Please sign up first.',
              debug: `Email ${email} not found. Auth API returned different email(s) - possible email collision`
            }),
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

      console.log('✅ Login: Using authUserId:', authUserId);
      
      // Upsert to users table - use requested email (source of truth for what user entered)
      // This ensures users table has the correct email even if auth.users has different one
      const { error: usersError } = await supabaseClient
        .from('users')
        .upsert({
          id: authUserId,
          email: email, // Use requested email (what user typed)
          verified: true,
        }, {
          onConflict: 'id'
        });

      if (usersError) {
        console.error('❌ Error upserting to users table (login):', usersError);
        // Don't fail the whole process, but log the error
      } else {
        console.log('✅ Login: Successfully updated users table for:', authUserId);
      }
    }

    // Ensure authUserId is set before returning
    if (!authUserId) {
      console.error('❌ CRITICAL ERROR: authUserId is null at end of function!');
      console.error('❌ This should never happen - user creation/retrieval must have failed silently');
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

    console.log('✅ OTP verified successfully for:', email);
    console.log('✅ Final authUserId:', authUserId);
    console.log('✅ User profile data:', userData ? JSON.stringify(userData, null, 2) : 'No profile data');

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