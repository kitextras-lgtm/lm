/**
 * Shared admin authentication utilities.
 *
 * Provides session-token hashing and session verification used by all
 * admin-* edge functions.
 *
 * Usage:
 *   import { verifyAdminSession } from '../_shared/admin-auth.ts';
 */

import { createServiceClient } from './supabase-client.ts';

/** SHA-256 hash a session token to look it up in the database. */
export async function hashToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface AdminSessionResult {
  error: string | null;
  admin: Record<string, unknown> | null;
  sessionId: string | null;
}

/**
 * Verify an admin session from a request's X-Session-Token header (or cookie).
 * Returns the admin record and session ID, or an error string.
 */
export async function verifyAdminSession(
  req: Request,
): Promise<AdminSessionResult> {
  let sessionToken: string | null = req.headers.get('X-Session-Token');

  if (!sessionToken) {
    const cookies = req.headers.get('Cookie');
    if (cookies) {
      const match = cookies.match(/admin_session=([^;]+)/);
      if (match) sessionToken = match[1];
    }
  }

  if (!sessionToken) {
    return { error: 'No session token', admin: null, sessionId: null };
  }

  const tokenHash = await hashToken(sessionToken);
  const supabase = createServiceClient();

  const { data: session } = await supabase
    .from('admin_sessions')
    .select(
      `
      id,
      admin_id,
      expires_at,
      last_activity_at,
      admins (
        id,
        email,
        full_name,
        is_active,
        account_locked_until,
        role_id,
        custom_permissions,
        admin_roles (id, name, display_name, default_permissions)
      )
    `,
    )
    .eq('session_token_hash', tokenHash)
    .maybeSingle();

  if (!session || new Date(session.expires_at) < new Date()) {
    return { error: 'Invalid or expired session', admin: null, sessionId: null };
  }

  const admin = session.admins as Record<string, unknown> | null;
  if (!admin || !admin.is_active) {
    return { error: 'Admin account inactive', admin: null, sessionId: null };
  }

  // Refresh session activity timestamp
  await supabase.rpc('admin_update_session_activity', {
    p_session_id: session.id,
  });

  return { error: null, admin, sessionId: session.id };
}
