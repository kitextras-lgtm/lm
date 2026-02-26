import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { verifyAdminSession } from '../_shared/admin-auth.ts';
import { getClientIp, getUserAgent } from '../_shared/request-helpers.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { error, admin, sessionId } = await verifyAdminSession(req);
    if (error || !admin) {
      return jsonError(error || 'Unauthorized', 401, req);
    }

    const supabase = createServiceClient();
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);

    const permAction = req.method === 'GET' ? 'view' : req.method === 'POST' ? 'approve' : 'reject';
    const { data: hasPermission } = await supabase.rpc('admin_has_permission', {
      p_admin_id: admin.id,
      p_resource: 'channels',
      p_action: permAction,
    });

    if (!hasPermission) {
      await supabase.rpc('admin_log_action', {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: 'channel.permission_denied',
        p_resource_type: 'channel',
        p_resource_id: null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ method: req.method }),
        p_success: false,
        p_error_message: 'Permission denied',
      });
      return jsonError('Permission denied', 403, req);
    }

    // ── GET: List channels ──
    if (req.method === 'GET') {
      const { data: channels } = await supabase
        .from('users')
        .select('id, email, username, user_type, created_at')
        .limit(50);

      await supabase.rpc('admin_log_action', {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: 'channel.list_viewed',
        p_resource_type: 'channel',
        p_resource_id: null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ count: channels?.length || 0 }),
        p_success: true,
        p_error_message: null,
      });

      return json({ success: true, channels: channels || [] }, 200, req);
    }

    // ── POST: Approve / reject a channel ──
    if (req.method === 'POST') {
      const url = new URL(req.url);
      const channelId = url.pathname.split('/').pop();
      const { action: channelAction, reason } = await req.json();

      if (channelAction !== 'approve' && channelAction !== 'reject') {
        return jsonError("Invalid action. Use 'approve' or 'reject'", 400, req);
      }

      await supabase.rpc('admin_log_action', {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: `channel.${channelAction}d`,
        p_resource_type: 'channel',
        p_resource_id: channelId,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ reason: reason || null }),
        p_success: true,
        p_error_message: null,
      });

      return json({ success: true, message: `Channel ${channelAction}d successfully` }, 200, req);
    }

    return jsonError('Method not allowed', 405, req);
  } catch (error) {
    console.error('Admin channels error:', error);
    return jsonError('Internal server error', 500, req);
  }
});
