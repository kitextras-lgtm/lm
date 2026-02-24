import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { hashToken } from '../_shared/admin-auth.ts';

const SESSION_DURATION_MINUTES = 30;

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    let sessionToken: string | null = req.headers.get('X-Session-Token');

    if (!sessionToken) {
      const cookies = req.headers.get('Cookie');
      if (cookies) {
        const match = cookies.match(/admin_session=([^;]+)/);
        if (match) sessionToken = match[1];
      }
    }

    if (!sessionToken) {
      return jsonError('No session token provided', 401);
    }

    const supabase = createServiceClient();
    const tokenHash = await hashToken(sessionToken);

    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select(`
        id, admin_id, expires_at, last_activity_at,
        admins (
          id, email, full_name, is_active, account_locked_until,
          role_id, custom_permissions,
          admin_roles ( id, name, display_name, default_permissions )
        )
      `)
      .eq('session_token_hash', tokenHash)
      .maybeSingle();

    if (sessionError || !session) {
      return jsonError('Invalid session', 401);
    }

    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('admin_sessions').delete().eq('id', session.id);
      return jsonError('Session expired', 401);
    }

    const inactiveMinutes = (Date.now() - new Date(session.last_activity_at).getTime()) / 60_000;
    if (inactiveMinutes > SESSION_DURATION_MINUTES) {
      await supabase.from('admin_sessions').delete().eq('id', session.id);
      return jsonError('Session expired due to inactivity', 401);
    }

    const admin = session.admins as Record<string, unknown> | null;
    if (!admin || !admin.is_active) {
      return jsonError('Admin account is deactivated', 403);
    }

    if (
      admin.account_locked_until &&
      new Date(admin.account_locked_until as string) > new Date()
    ) {
      return jsonError('Admin account is locked', 403);
    }

    await supabase.rpc('admin_update_session_activity', { p_session_id: session.id });

    const role = admin.admin_roles as Record<string, unknown>;

    return json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        role: { id: role.id, name: role.name, displayName: role.display_name },
        permissions: admin.custom_permissions || role.default_permissions,
      },
      sessionId: session.id,
      expiresAt: session.expires_at,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return jsonError('Internal server error', 500);
  }
});
