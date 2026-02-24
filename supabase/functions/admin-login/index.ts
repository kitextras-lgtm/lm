import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import bcrypt from 'npm:bcryptjs@2.4.3';
import { authenticator } from 'npm:otplib@12.0.1';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { hashToken } from '../_shared/admin-auth.ts';
import { getClientIp, getUserAgent } from '../_shared/request-helpers.ts';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const SESSION_DURATION_MINUTES = 30;
const TOTP_WINDOW = 2;

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { email, password, totpCode } = await req.json();

    if (!email || !password) {
      return jsonError('Email and password required');
    }

    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    const supabase = createServiceClient();

    // ── Find admin by email ──
    const { data: admin, error: adminError } = await supabase
      .from('admins')
      .select(`
        id, email, password_hash, role_id, custom_permissions,
        totp_secret, totp_enabled, failed_login_attempts,
        account_locked_until, is_active, full_name,
        admin_roles ( id, name, display_name, default_permissions )
      `)
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (adminError || !admin) {
      return jsonError('Invalid email or password', 401);
    }

    if (!admin.is_active) {
      return jsonError('Account is deactivated', 403);
    }

    // ── Check lockout ──
    if (admin.account_locked_until && new Date(admin.account_locked_until) > new Date()) {
      const mins = Math.ceil(
        (new Date(admin.account_locked_until).getTime() - Date.now()) / 60_000,
      );
      return jsonError(`Account locked. Try again in ${mins} minutes.`, 403);
    }

    // ── Verify password ──
    const passwordValid = await bcrypt.compare(password, admin.password_hash);
    if (!passwordValid) {
      const newAttempts = (admin.failed_login_attempts || 0) + 1;
      const lock = newAttempts >= MAX_FAILED_ATTEMPTS;

      await supabase
        .from('admins')
        .update({
          failed_login_attempts: newAttempts,
          account_locked_until: lock
            ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60_000).toISOString()
            : null,
        })
        .eq('id', admin.id);

      await supabase.rpc('admin_log_action', {
        p_admin_id: admin.id,
        p_session_id: null,
        p_action_type: 'auth.login_failed',
        p_resource_type: 'admin',
        p_resource_id: admin.id,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ reason: 'invalid_password', failed_attempts: newAttempts }),
        p_success: false,
        p_error_message: 'Invalid password',
      });

      const msg = lock
        ? `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`
        : 'Invalid email or password';
      return jsonError(msg, 401);
    }

    // ── Verify TOTP (if enabled) ──
    if (admin.totp_enabled) {
      if (!totpCode) {
        return json({ success: false, message: 'TOTP code required', requiresTotp: true }, 400);
      }

      try {
        const isValid = authenticator.check(totpCode, admin.totp_secret, { window: TOTP_WINDOW });
        if (!isValid) {
          await supabase.rpc('admin_log_action', {
            p_admin_id: admin.id,
            p_session_id: null,
            p_action_type: 'auth.totp_failed',
            p_resource_type: 'admin',
            p_resource_id: admin.id,
            p_ip_address: ipAddress,
            p_user_agent: userAgent,
            p_details: JSON.stringify({ reason: 'invalid_totp' }),
            p_success: false,
            p_error_message: 'Invalid TOTP code',
          });
          return jsonError('Invalid TOTP code', 401);
        }
      } catch (totpError) {
        console.error('TOTP verification error:', totpError);
        return jsonError('TOTP verification failed', 500);
      }
    }

    // ── Create session ──
    const sessionToken = crypto.randomUUID() + '-' + crypto.randomUUID();
    const sessionTokenHash = await hashToken(sessionToken);
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MINUTES * 60_000);

    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: admin.id,
        session_token_hash: sessionTokenHash,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (sessionError || !session) {
      console.error('Session creation error:', sessionError);
      return jsonError('Failed to create session', 500);
    }

    // ── Reset failed attempts & update last-login ──
    await supabase
      .from('admins')
      .update({
        failed_login_attempts: 0,
        account_locked_until: null,
        last_login_at: new Date().toISOString(),
        last_login_ip: ipAddress,
        last_login_user_agent: userAgent,
      })
      .eq('id', admin.id);

    await supabase.rpc('admin_log_action', {
      p_admin_id: admin.id,
      p_session_id: session.id,
      p_action_type: 'auth.login_success',
      p_resource_type: 'admin',
      p_resource_id: admin.id,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_details: JSON.stringify({ totp_used: admin.totp_enabled }),
      p_success: true,
      p_error_message: null,
    });

    const role = admin.admin_roles as Record<string, unknown>;

    return json({
      success: true,
      sessionToken,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: { id: role.id, name: role.name, displayName: role.display_name },
        permissions: admin.custom_permissions || role.default_permissions,
      },
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return jsonError('Internal server error', 500);
  }
});
