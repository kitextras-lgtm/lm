import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { verifyAdminSession } from '../_shared/admin-auth.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { resource, action } = await req.json();

    if (!resource || !action) {
      return jsonError('Resource and action required');
    }

    const { error, admin } = await verifyAdminSession(req);
    if (error || !admin) {
      return jsonError(error || 'Unauthorized', 401);
    }

    const supabase = createServiceClient();

    const { data: hasPermission, error: permError } = await supabase.rpc(
      'admin_has_permission',
      {
        p_admin_id: admin.id,
        p_resource: resource,
        p_action: action,
      },
    );

    if (permError) {
      console.error('Permission check error:', permError);
      return jsonError('Permission check failed', 500);
    }

    return json({ success: true, hasPermission: hasPermission === true });
  } catch (error) {
    console.error('Check permission error:', error);
    return jsonError('Internal server error', 500);
  }
});
