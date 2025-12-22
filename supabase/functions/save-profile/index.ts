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
    const { userId, firstName, lastName, username, profilePictureUrl, profilePictureBase64, profilePictureFileName, location, primaryLanguage, userType } = await req.json();

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

    // Handle profile picture upload if base64 is provided
    // Ignore blob URLs - they're temporary and shouldn't be saved to database
    let finalProfilePictureUrl = null;
    if (profilePictureUrl && !profilePictureUrl.startsWith('blob:')) {
      // Only use profilePictureUrl if it's a valid storage URL (not a blob URL)
      finalProfilePictureUrl = profilePictureUrl;
      console.log('Using provided profilePictureUrl (non-blob):', finalProfilePictureUrl);
    }
    
    if (profilePictureBase64 && profilePictureFileName) {
      try {
        console.log('🖼️ Uploading profile picture via Edge Function (bypasses RLS)...');
        
        // Convert base64 to Uint8Array
        const base64Data = profilePictureBase64;
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Determine file extension and content type
        const fileExt = profilePictureFileName.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `profile-pictures/${userId}/${fileName}`;
        
        // Map file extensions to proper MIME types
        const mimeTypes: { [key: string]: string } = {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'gif': 'image/gif',
          'webp': 'image/webp',
          'svg': 'image/svg+xml',
          'bmp': 'image/bmp'
        };
        
        const contentType = mimeTypes[fileExt] || `image/${fileExt}`;
        
        console.log('Upload path:', filePath);
        console.log('File extension:', fileExt);
        console.log('Content type:', contentType);
        
        // Upload to storage using service role (bypasses RLS)
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('avatars')
          .upload(filePath, bytes, {
            cacheControl: '3600',
            upsert: false,
            contentType: contentType
          });
        
        if (uploadError) {
          console.error('❌ Storage upload failed:', uploadError);
          console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
          // Don't fail the whole operation, just log the error
          console.warn('Profile will be saved without picture URL');
        } else {
          console.log('✅ Upload successful!', uploadData);
          console.log('Upload data path:', uploadData.path);
          // Get public URL
          const { data: urlData } = supabaseClient.storage
            .from('avatars')
            .getPublicUrl(filePath);
          finalProfilePictureUrl = urlData.publicUrl;
          console.log('✅ Public URL generated:', finalProfilePictureUrl);
          console.log('✅ URL will be saved to database as profile_picture_url');
        }
      } catch (uploadErr: any) {
        console.error('❌ Upload exception:', uploadErr);
        // Don't fail the whole operation, just log the error
        console.warn('Profile will be saved without picture URL');
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
    // Username can only be set during onboarding, not changed afterwards
    // Only allow username update if user doesn't have one yet (during onboarding)
    if (username !== undefined) {
      // Check if user already has a username
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('username')
        .eq('id', userId)
        .maybeSingle();
      
      // Only set username if it doesn't exist yet (onboarding)
      if (!existingUser?.username) {
        usersUpdateData.username = username;
        console.log('Setting username during onboarding:', username);
      } else {
        console.log('Username already exists, ignoring update attempt:', existingUser.username);
      }
    }
    if (location !== undefined) usersUpdateData.location = location;
    if (primaryLanguage !== undefined) usersUpdateData.primary_language = primaryLanguage;
    if (finalProfilePictureUrl !== undefined && finalProfilePictureUrl !== null) {
      // Never save blob URLs to database
      if (finalProfilePictureUrl.startsWith('blob:')) {
        console.warn('⚠️ Attempted to save blob URL - ignoring. Blob URLs are temporary and should not be saved.');
        // Don't set profile_picture_url if it's a blob URL
      } else {
        usersUpdateData.profile_picture_url = finalProfilePictureUrl;
        console.log('📸 Setting profile_picture_url in usersUpdateData:', finalProfilePictureUrl);
      }
    } else {
      console.log('⚠️ finalProfilePictureUrl is undefined/null - profile picture URL will not be updated');
    }
    if (userType !== undefined) {
      usersUpdateData.user_type = userType;
      usersUpdateData.profile_completed = true;
    }
    
    // Email is REQUIRED - if we don't have it, skip users table update
    if (userEmail) {
      usersUpdateData.email = userEmail;
    } else {
      console.warn('No email available for users table update. Skipping users table update.');
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
        console.log('✅ Profile picture URL saved:', usersUpdateData.profile_picture_url);
      }
    }

    // Check if username is already taken (only during onboarding when setting username for the first time)
    if (username !== undefined) {
      // Check if user already has a username
      const { data: currentUser } = await supabaseClient
        .from('users')
        .select('username')
        .eq('id', userId)
        .maybeSingle();
      
      // Only check uniqueness if this is a new username (onboarding)
      if (!currentUser?.username) {
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
    }

    // Build profile data object (only include provided fields)
    const profileData: any = {
      id: userId,
      updated_at: new Date().toISOString()
    };

    if (firstName !== undefined) profileData.first_name = firstName;
    if (lastName !== undefined) profileData.last_name = lastName || null;
    // Username is handled above - only set during onboarding
    // Never save blob URLs to database
    if (finalProfilePictureUrl !== undefined && finalProfilePictureUrl !== null && !finalProfilePictureUrl.startsWith('blob:')) {
      profileData.profile_picture_url = finalProfilePictureUrl;
    }
    if (location !== undefined) profileData.location = location;
    if (primaryLanguage !== undefined) profileData.primary_language = primaryLanguage;
    if (userType !== undefined) {
      profileData.user_type = userType;
      profileData.profile_completed = true;
    } else {
      // If no userType provided, try to get from existing user or default to 'creator'
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('user_type')
        .eq('id', userId)
        .maybeSingle();
      
      if (existingUser?.user_type) {
        profileData.user_type = existingUser.user_type;
      } else {
        // Default to 'creator' if no userType is found
        console.log('No userType provided and no existing user found. Defaulting to "creator"');
        profileData.user_type = 'creator';
      }
    }

    console.log('Final profileData to save to users table:', profileData);

    // Update users table with profile data (already done above, but ensure all fields are included)
    if (userEmail) {
      const { error: profileError } = await supabaseClient
        .from('users')
        .upsert({
          ...usersUpdateData,
          ...profileData
        }, {
          onConflict: 'id'
        });

        if (profileError) {
          console.error('Error saving profile to users table:', profileError);
        
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
        } else {
          console.log('✅ Successfully saved profile to users table');
        }
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
