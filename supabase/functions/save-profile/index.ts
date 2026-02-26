import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient, getSupabaseEnv } from '../_shared/supabase-client.ts';

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
};

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const {
      userId,
      firstName,
      lastName,
      username,
      profilePictureUrl,
      profilePictureBase64,
      profilePictureFileName,
      bannerUrl,
      bannerBase64,
      bannerFileName,
      location,
      primaryLanguage,
      userType,
      email: clientEmail,
    } = await req.json();

    if (!userId) {
      return jsonError('User ID required');
    }

    const supabase = createServiceClient();

    // ── Resolve user email (single auth API call) ──
    const userEmail = await resolveUserEmail(supabase, userId, clientEmail);

    // ── Upload images if base64 provided ──
    const finalProfilePictureUrl = await resolveImageUrl(
      supabase, userId, 'profile-pictures',
      profilePictureUrl, profilePictureBase64, profilePictureFileName,
    );

    const finalBannerUrl = await resolveImageUrl(
      supabase, userId, 'banners',
      bannerUrl, bannerBase64, bannerFileName,
    );

    // ── Validate username uniqueness (only during onboarding) ──
    if (username !== undefined) {
      const { data: currentUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .maybeSingle();

      if (!currentUser?.username) {
        const { data: taken } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .neq('id', userId)
          .maybeSingle();

        if (taken) {
          return jsonError('This username is already taken. Please choose another.');
        }
      }
    }

    // ── Build update payload ──
    const updateData: Record<string, unknown> = {
      id: userId,
      updated_at: new Date().toISOString(),
    };

    if (userEmail) updateData.email = userEmail;
    if (firstName !== undefined) updateData.first_name = firstName;
    if (lastName !== undefined) updateData.last_name = lastName || null;
    if (firstName) updateData.full_name = lastName ? `${firstName} ${lastName}` : firstName;

    // Username: only settable during onboarding (when user doesn't have one yet)
    if (username !== undefined) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('id', userId)
        .maybeSingle();

      if (!existingUser?.username) {
        updateData.username = username;
      }
    }

    if (location !== undefined) updateData.location = location;
    if (primaryLanguage !== undefined) updateData.primary_language = primaryLanguage;

    if (finalProfilePictureUrl && !finalProfilePictureUrl.startsWith('blob:')) {
      updateData.profile_picture_url = finalProfilePictureUrl;
    }
    if (finalBannerUrl && !finalBannerUrl.startsWith('blob:')) {
      updateData.banner_url = finalBannerUrl;
    }

    if (userType !== undefined) {
      updateData.user_type = userType;
      updateData.profile_completed = true;
    }

    // ── Single upsert to users table ──
    if (!userEmail) {
      console.error('No email available for userId:', userId);
      return jsonError('Unable to resolve user email. Profile cannot be saved without an email.', 422);
    }

    const { error: upsertError } = await supabase
      .from('users')
      .upsert(updateData, { onConflict: 'id' });

    if (upsertError) {
      if (upsertError.message?.includes('unique') && upsertError.message?.includes('username')) {
        return jsonError('This username is already taken. Please choose another.');
      }
      console.error('Error saving profile:', upsertError);
      return jsonError('Failed to save profile', 500);
    }

    return json({
      success: true,
      message: 'Profile saved successfully',
      savedUserType: userType || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to save profile';
    console.error('Error in save-profile:', message);
    return jsonError(message, 500);
  }
});

// ─── Helpers ────────────────────────────────────────────────

/** Resolve user email: auth API → users table → client-provided (single API call). */
async function resolveUserEmail(
  supabase: SupabaseClient,
  userId: string,
  clientEmail?: string,
): Promise<string | null> {
  const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();

  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (res.ok) {
    const data = await res.json();
    if (data.email) return data.email;
  }

  // Fallback: existing users table record
  const { data: existing } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .maybeSingle();

  return existing?.email || clientEmail || null;
}

/** Upload a base64 image or pass through an existing URL (skipping blob: URLs). */
async function resolveImageUrl(
  supabase: SupabaseClient,
  userId: string,
  folder: string,
  existingUrl?: string,
  base64Data?: string,
  fileName?: string,
): Promise<string | null> {
  // If base64 is provided, upload it
  if (base64Data && fileName) {
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `${folder}/${userId}/${Date.now()}.${ext}`;
      const contentType = MIME_TYPES[ext] || `image/${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, bytes, {
          cacheControl: '3600',
          upsert: false,
          contentType,
        });

      if (uploadError) {
        console.error(`${folder} upload failed:`, uploadError);
        return existingUrl && !existingUrl.startsWith('blob:') ? existingUrl : null;
      }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return urlData.publicUrl;
    } catch (err) {
      console.error(`${folder} upload exception:`, err);
      return existingUrl && !existingUrl.startsWith('blob:') ? existingUrl : null;
    }
  }

  // No base64 — use existing URL if it's not a blob
  if (existingUrl && !existingUrl.startsWith('blob:')) {
    return existingUrl;
  }

  return null;
}
