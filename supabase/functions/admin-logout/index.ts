import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { hashToken } from '../_shared/admin-auth.ts';
import { getClientIp, getUserAgent } from '../_shared/request-helpers.ts';

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
      return jsonError('No session token provided', 400, req);
    }

    const supabase = createServiceClient();
    const tokenHash = await hashToken(sessionToken);

    const { data: session, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('id, admin_id')
      .eq('session_token_hash', tokenHash)
      .maybeSingle();

    if (sessionError) {
      console.error('Session lookup failed:', sessionError);
      return jsonError('Failed to look up session', 500, req);
    }

    if (session) {
      await supabase.rpc('admin_log_action', {
        p_admin_id: session.admin_id,
        p_session_id: session.id,
        p_action_type: 'auth.logout',
        p_resource_type: 'admin',
        p_resource_id: session.admin_id,
        p_ip_address: getClientIp(req),
        p_user_agent: getUserAgent(req),
        p_details: JSON.stringify({}),
        p_success: true,
        p_error_message: null,
      });

      await supabase.from('admin_sessions').delete().eq('id', session.id);
    }

    return json({ success: true, message: 'Logged out successfully' }, 200, req);
  } catch (error) {
    console.error('Logout error:', error);
    return jsonError('Internal server error', 500, req);
  }
});
