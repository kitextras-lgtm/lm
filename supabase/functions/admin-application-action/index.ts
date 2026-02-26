import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';
import { verifyAdminSession } from '../_shared/admin-auth.ts';
import { getClientIp, getUserAgent } from '../_shared/request-helpers.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405, req);
  }

  try {
    const supabase = createServiceClient();

    // Verify admin session
    const { error, admin, sessionId } = await verifyAdminSession(req);
    if (error || !admin) {
      return jsonError(error || 'Unauthorized', 401, req);
    }

    const { applicationId, action, declineReason } = await req.json();

    if (!applicationId || !action) {
      return jsonError('applicationId and action required', 400, req);
    }

    if (action !== 'approved' && action !== 'denied') {
      return jsonError("action must be 'approved' or 'denied'", 400, req);
    }

    // Check permission — map the action to the correct permission verb
    const permAction = action === 'approved' ? 'approve' : 'reject';
    const { data: hasPermission, error: permError } = await supabase.rpc('admin_has_permission', {
      p_admin_id: admin.id,
      p_resource: 'applications',
      p_action: permAction,
    });

    if (permError) {
      console.error('Permission check failed:', permError);
      return jsonError('Permission check failed', 500, req);
    }

    if (!hasPermission) {
      return jsonError('Permission denied', 403, req);
    }

    // Fetch the application (needed for artist_account side-effect)
    const { data: app, error: fetchErr } = await supabase
      .from('applications')
      .select('id, user_id, application_type')
      .eq('id', applicationId)
      .maybeSingle();

    if (fetchErr || !app) {
      return jsonError('Application not found', 404, req);
    }

    // Update application status
    const updateData: Record<string, unknown> = {
      status: action,
      reviewed_at: new Date().toISOString(),
    };
    if (action === 'denied' && declineReason) {
      updateData.decline_reason = declineReason;
    }

    const { error: updateErr } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', applicationId);

    if (updateErr) {
      console.error('Failed to update application:', updateErr);
      return jsonError('Failed to update application', 500, req);
    }

    // Side-effect: if approving an artist_account, mark their Artist social link as verified
    // and update their user_type to 'artist'
    if (action === 'approved' && app.application_type === 'artist_account' && app.user_id) {
      await supabase
        .from('social_links')
        .update({ verified: true })
        .eq('user_id', app.user_id)
        .eq('platform', 'Artist');

      await supabase
        .from('users')
        .update({ user_type: 'artist' })
        .eq('id', app.user_id);
    }

    // Audit log
    const ipAddress = getClientIp(req);
    const userAgent = getUserAgent(req);
    await supabase.rpc('admin_log_action', {
      p_admin_id: admin.id,
      p_session_id: sessionId,
      p_action_type: `application.${action}`,
      p_resource_type: 'application',
      p_resource_id: applicationId,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_details: JSON.stringify({ action, declineReason: declineReason || null }),
      p_success: true,
      p_error_message: null,
    });

    return json({ success: true }, 200, req);
  } catch (error) {
    console.error('admin-application-action error:', error);
    return jsonError('Internal server error', 500, req);
  }
});
