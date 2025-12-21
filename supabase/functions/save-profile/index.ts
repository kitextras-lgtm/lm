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
    const { userId, firstName, lastName, username, profilePictureUrl, location, primaryLanguage, userType } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: 'User ID required' }),
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

    // Verify user exists in auth.users
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const getUserResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
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
        JSON.stringify({ success: false, message: 'User not found' }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get user email from auth.users - REQUIRED for users table
    const getUserDataResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users/${userId}`,
      {
        method: 'GET',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    let userEmail = null;
    if (getUserDataResponse.ok) {
      const userData = await getUserDataResponse.json();
      userEmail = userData.email;
      console.log('Retrieved email from auth.users:', userEmail);
    } else {
      console.error('Failed to get user email from auth.users:', getUserDataResponse.status);
      // Try to get email from existing users table record
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('email')
        .eq('id', userId)
        .maybeSingle();
      
      if (existingUser?.email) {
        userEmail = existingUser.email;
        console.log('Retrieved email from existing users record:', userEmail);
      }
    }

    // Update users table with ALL onboarding data
    // Email is REQUIRED (NOT NULL constraint), so we must have it
    const fullName = lastName ? `${firstName} ${lastName}` : firstName;
    const usersUpdateData: any = {
      id: userId,
      updated_at: new Date().toISOString()
    };
    
    // Add all profile fields to users table
    if (firstName !== undefined) usersUpdateData.first_name = firstName;
    if (lastName !== undefined) usersUpdateData.last_name = lastName || null;
    if (firstName) usersUpdateData.full_name = fullName;
    if (username !== undefined) usersUpdateData.username = username;
    if (location !== undefined) usersUpdateData.location = location;
    if (primaryLanguage !== undefined) usersUpdateData.primary_language = primaryLanguage;
    if (profilePictureUrl !== undefined) usersUpdateData.profile_picture_url = profilePictureUrl;
    if (userType !== undefined) {
      usersUpdateData.user_type = userType;
      usersUpdateData.profile_completed = true;
    }
    
    // Email is REQUIRED - if we don't have it, skip users table update
    if (userEmail) {
      usersUpdateData.email = userEmail;
    } else {
      console.warn('No email available for users table update. Skipping users table update.');
      console.warn('This is OK - user_profiles will still be updated.');
    }
    
    // Only update users table if we have email (required field)
    if (userEmail) {
      console.log('Updating users table with all onboarding data:', usersUpdateData);
      
      const { error: usersError } = await supabaseClient
        .from('users')
        .upsert(usersUpdateData, {
          onConflict: 'id'
        });

      if (usersError) {
        console.error('Error updating users table:', usersError);
        console.error('Error details:', JSON.stringify(usersError, null, 2));
        // Don't fail the whole operation, but log the error
      } else {
        console.log('✅ Successfully updated users table with all onboarding data');
      }
    }

    // Check if username is already taken (if provided)
    if (username) {
      const { data: existingUsername } = await supabaseClient
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', userId)
        .maybeSingle();

      if (existingUsername) {
        return new Response(
          JSON.stringify({ success: false, message: 'This username is already taken. Please choose another.' }),
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

    // Build profile data object (only include provided fields)
    const profileData: any = {
      id: userId,
      updated_at: new Date().toISOString()
    };

    if (firstName !== undefined) profileData.first_name = firstName;
    if (lastName !== undefined) profileData.last_name = lastName || null;
    if (username !== undefined) profileData.username = username;
    if (profilePictureUrl !== undefined) profileData.profile_picture_url = profilePictureUrl;
    if (location !== undefined) profileData.location = location;
    if (primaryLanguage !== undefined) profileData.primary_language = primaryLanguage;
    if (userType !== undefined) {
      profileData.user_type = userType;
      profileData.profile_completed = true;
    } else {
      // If no userType provided, try to get from existing profile or default to 'creator'
      const { data: existingProfile } = await supabaseClient
        .from('user_profiles')
        .select('user_type')
        .eq('id', userId)
        .maybeSingle();
      
      if (existingProfile?.user_type) {
        profileData.user_type = existingProfile.user_type;
      } else {
        // Default to 'creator' if no userType is found
        console.log('No userType provided and no existing profile found. Defaulting to "creator"');
        profileData.user_type = 'creator';
      }
    }

    console.log('Final profileData to save:', profileData);

    // Update or insert user profile (service role bypasses RLS)
    const { error: profileError } = await supabaseClient
      .from('user_profiles')
      .upsert(profileData, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('Error saving profile:', profileError);
      
      // Check if it's a unique constraint violation for username
      if (profileError.message?.includes('unique') && profileError.message?.includes('username')) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'This username is already taken. Please choose another.' 
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
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: profileError.message || 'Failed to save profile' 
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

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Profile saved successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err: any) {
    console.error('Error in save-profile:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: err.message || 'Failed to save profile' 
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
