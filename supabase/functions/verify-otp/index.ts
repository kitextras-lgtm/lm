import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient, getSupabaseEnv } from '../_shared/supabase-client.ts';
import { getClientIp, getUserAgent } from '../_shared/request-helpers.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { email, code, isSignup } = await req.json();

    if (!email || !code) {
      return jsonError('Email and code required');
    }

    const supabase = createServiceClient();
    const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();

    // ── Validate OTP ──
    const otpResult = await validateOtp(supabase, email, code);
    if (!otpResult.valid) {
      return jsonError(otpResult.message);
    }

    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    let authUserId: string | null = null;

    if (isSignup) {
      authUserId = await handleSignupFlow(supabase, supabaseUrl, serviceRoleKey, email, ipAddress, userAgent);
    } else {
      authUserId = await handleLoginFlow(supabase, supabaseUrl, serviceRoleKey, email);
    }

    if (!authUserId) {
      return jsonError('Failed to create or retrieve user account. Please try again.', 500);
    }

    // ── Check profile status ──
    const { data: userData } = await supabase
      .from('users')
      .select('user_type, profile_completed')
      .eq('id', authUserId)
      .maybeSingle();

    return json({
      success: true,
      userId: authUserId,
      hasProfile: !!userData?.profile_completed,
      userType: userData?.user_type || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify OTP';
    console.error('Error in verify-otp:', message);
    return jsonError(message, 500);
  }
});

// ─── OTP Validation ─────────────────────────────────────────

async function validateOtp(
  supabase: SupabaseClient,
  email: string,
  code: string,
): Promise<{ valid: boolean; message: string }> {
  const { data: otpRecord, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!otpRecord) return { valid: false, message: 'No valid OTP found' };
  if (new Date() > new Date(otpRecord.expires_at)) return { valid: false, message: 'OTP has expired' };
  if (otpRecord.attempts >= 3) return { valid: false, message: 'Too many attempts' };

  if (otpRecord.code !== code) {
    await supabase
      .from('otp_codes')
      .update({ attempts: otpRecord.attempts + 1 })
      .eq('id', otpRecord.id);
    return { valid: false, message: 'Invalid code' };
  }

  await supabase.from('otp_codes').update({ verified: true }).eq('id', otpRecord.id);
  return { valid: true, message: 'OK' };
}

// ─── Auth API Helpers ───────────────────────────────────────

async function findAuthUserByEmail(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(
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

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.users?.length) return null;

    return (
      data.users.find(
        (u: Record<string, unknown>) =>
          typeof u.email === 'string' && u.email.toLowerCase() === email.toLowerCase(),
      ) ?? null
    );
  } catch {
    return null;
  }
}

async function createAuthUser(
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      email_confirm: true,
      user_metadata: { email_verified: true },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Error creating auth user:', res.status, body);

    // 409/422 = user already exists — try to recover
    if (res.status === 409 || res.status === 422) {
      return await findAuthUserByEmail(supabaseUrl, serviceRoleKey, email);
    }

    throw new Error(
      res.status === 429
        ? 'Too many signup attempts. Please try again later.'
        : 'Failed to create account. Please try again.',
    );
  }

  const newUser = await res.json();
  if (!newUser?.id) throw new Error('Failed to create user account.');

  // Verify email matches
  if (newUser.email?.toLowerCase() !== email.toLowerCase()) {
    // Roll back the incorrectly created user
    await fetch(`${supabaseUrl}/auth/v1/admin/users/${newUser.id}`, {
      method: 'DELETE',
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    }).catch(() => {});
    throw new Error('Failed to create user account. Please try again.');
  }

  return newUser;
}

// ─── Signup Flow ────────────────────────────────────────────

async function handleSignupFlow(
  supabase: SupabaseClient,
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
  ipAddress: string,
  userAgent: string,
): Promise<string | null> {
  let authUserId: string | null = null;

  // ── Check if user already exists ──
  const existingAuthUser = await findAuthUserByEmail(supabaseUrl, serviceRoleKey, email);

  if (existingAuthUser) {
    if (existingAuthUser.deleted_at) {
      // Soft-deleted — proceed with new user creation below
    } else if (
      existingAuthUser.banned_until &&
      new Date(existingAuthUser.banned_until as string) > new Date()
    ) {
      throw new Error('This account has been banned. Please contact support.');
    } else {
      // Check if profile is complete
      const { data: profile } = await supabase
        .from('users')
        .select('id, user_type, profile_completed')
        .eq('id', existingAuthUser.id as string)
        .maybeSingle();

      if (profile?.user_type && profile?.profile_completed) {
        throw new Error('This email is already registered. Please log in instead.');
      }

      // Incomplete profile — allow completion
      authUserId = existingAuthUser.id as string;
    }
  }

  // ── Clean up orphaned users table records ──
  const { data: existingUser } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .maybeSingle();

  if (existingUser && !authUserId) {
    const checkRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${existingUser.id}`, {
      method: 'GET',
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });

    if (checkRes.ok) {
      const authData = await checkRes.json();
      if (authData.email?.toLowerCase() === email.toLowerCase()) {
        throw new Error('This email is already registered. Please log in instead.');
      }
    }

    // Orphaned record — clean up
    await supabase.from('users').delete().eq('id', existingUser.id);
  }

  // ── Create new auth user if needed ──
  if (!authUserId) {
    // Spam filter: check for recent signup from same IP
    const cutoff = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    const { data: recentSignup } = await supabase
      .from('signup_tracking')
      .select('id')
      .eq('ip_address', ipAddress)
      .gte('created_at', cutoff)
      .limit(1)
      .maybeSingle();

    if (recentSignup) {
      throw new Error(
        'A signup was recently completed from this network. Please wait 24 hours or contact support.',
      );
    }

    const newUser = await createAuthUser(supabaseUrl, serviceRoleKey, email);
    if (!newUser?.id) throw new Error('Failed to create user account.');
    authUserId = newUser.id as string;

    // Verify not already in users table (edge case)
    const { data: dupe } = await supabase.from('users').select('id').eq('id', authUserId).maybeSingle();
    if (dupe) {
      throw new Error('This email is already registered. Please log in instead.');
    }
  }

  // ── Insert / upsert users table record ──
  const { data: existingRecord } = await supabase
    .from('users')
    .select('id')
    .eq('id', authUserId)
    .maybeSingle();

  if (existingRecord) {
    await supabase.from('users').upsert({ id: authUserId, email, verified: true }, { onConflict: 'id' });
  } else {
    const { error: insertErr } = await supabase.from('users').insert({ id: authUserId, email, verified: true });
    if (insertErr) {
      if (insertErr.code === '23505') {
        throw new Error('This email is already registered. Please log in instead.');
      }
      throw new Error(`Failed to create user account: ${insertErr.message}`);
    }

    // Create chat profile
    await supabase
      .from('profiles')
      .upsert(
        { id: authUserId, name: email.split('@')[0] || 'User', avatar_url: '', is_admin: false, is_online: false },
        { onConflict: 'id', ignoreDuplicates: false },
      );

    // Setup admin conversation & welcome message
    await setupAdminConversation(supabase, authUserId);

    // Track signup for spam prevention
    await supabase
      .from('signup_tracking')
      .insert({ ip_address: ipAddress, user_agent: userAgent, email, user_id: authUserId })
      .then(({ error }) => { if (error) console.error('Signup tracking error:', error); });
  }

  return authUserId;
}

// ─── Login Flow ─────────────────────────────────────────────

async function handleLoginFlow(
  supabase: SupabaseClient,
  supabaseUrl: string,
  serviceRoleKey: string,
  email: string,
): Promise<string | null> {
  // Primary: check users table
  const { data: userFromTable } = await supabase
    .from('users')
    .select('id, email')
    .ilike('email', email)
    .maybeSingle();

  if (userFromTable?.id) {
    const verifyRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userFromTable.id}`, {
      method: 'GET',
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
    });

    if (verifyRes.ok) {
      const data = await verifyRes.json();
      if (data?.id) {
        // Update users table email
        await supabase
          .from('users')
          .upsert({ id: data.id, email, verified: true }, { onConflict: 'id' });
        return data.id;
      }
    }
    throw new Error('No account found. Please sign up first.');
  }

  // Fallback: check auth.users directly
  const authUser = await findAuthUserByEmail(supabaseUrl, serviceRoleKey, email);
  if (authUser?.id) {
    await supabase
      .from('users')
      .upsert({ id: authUser.id as string, email, verified: true }, { onConflict: 'id' });
    return authUser.id as string;
  }

  throw new Error('No account found. Please sign up first.');
}

// ─── Admin Conversation Setup ───────────────────────────────

async function setupAdminConversation(supabase: SupabaseClient, userId: string): Promise<void> {
  try {
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(1)
      .maybeSingle();

    if (!adminProfile?.id) return;

    const adminId = adminProfile.id;

    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('customer_id', userId)
      .eq('admin_id', adminId)
      .maybeSingle();

    if (existingConv) return;

    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({
        customer_id: userId,
        admin_id: adminId,
        last_message: '',
        unread_count_admin: 0,
        unread_count_customer: 0,
      })
      .select('id')
      .single();

    if (convError || !newConv?.id) return;

    const { data: userData } = await supabase
      .from('users')
      .select('first_name')
      .eq('id', userId)
      .maybeSingle();

    const firstName = userData?.first_name?.trim() || '';
    const welcomeMessage = `Hi${firstName ? ` ${firstName},` : ''} welcome to Elevate!\n\nIf you have any questions, feel free to ask.\n\nHave suggestions or feedback? You can submit them here. We review everything and are always working to give you the best experience on Elevate.`;

    const { error: msgError } = await supabase.from('messages').insert({
      conversation_id: newConv.id,
      sender_id: adminId,
      type: 'text',
      content: welcomeMessage,
      status: 'sent',
    });

    if (!msgError) {
      await supabase
        .from('conversations')
        .update({
          last_message: welcomeMessage.split('\n')[0],
          last_message_at: new Date().toISOString(),
          last_message_sender_id: adminId,
          unread_count_customer: 1,
        })
        .eq('id', newConv.id);
    }
  } catch (err) {
    console.error('Error setting up admin conversation:', err);
  }
}
