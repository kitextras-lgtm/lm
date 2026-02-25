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

    // Check permission for viewing users
    const { data: hasPermission } = await supabase.rpc('admin_has_permission', {
      p_admin_id: admin.id,
      p_resource: 'users',
      p_action: 'view',
    });

    if (!hasPermission) {
      await supabase.rpc('admin_log_action', {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: 'users.permission_denied',
        p_resource_type: 'users',
        p_resource_id: null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ method: req.method }),
        p_success: false,
        p_error_message: 'Permission denied',
      });

      return jsonError('Permission denied', 403, req);
    }

    // GET /admin-users - List all users
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit') || '100');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email, full_name, username, user_type, profile_completed, verified, created_at, updated_at')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return jsonError('Failed to fetch users', 500, req);
      }

      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      await supabase.rpc('admin_log_action', {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: 'users.list_viewed',
        p_resource_type: 'users',
        p_resource_id: null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ count: users?.length || 0, limit, offset }),
        p_success: true,
        p_error_message: null,
      });

      return json({
        success: true,
        users: users || [],
        total: count || 0,
        limit,
        offset,
      }, 200, req);
    }

    return jsonError('Method not allowed', 405, req);
  } catch (error) {
    console.error('Admin users error:', error);
    return jsonError('Internal server error', 500, req);
  }
});
