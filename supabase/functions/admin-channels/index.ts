import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Helper function to hash session tokens using Web Crypto API
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getCorsHeaders(req: Request) {
  const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "*";
  const origin = req.headers.get("Origin") || "";
  const resolvedOrigin = allowedOrigin === "*" ? "*" : (origin === allowedOrigin ? origin : allowedOrigin);
  return {
    "Access-Control-Allow-Origin": resolvedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Session-Token",
  };
}

// Helper to verify session and get admin (reusable)
async function verifyAdminSession(req: Request) {
  // Get session token from custom header or cookie
  // Note: Authorization header is used for Supabase anon key, so we use X-Session-Token for the session
  let sessionToken: string | null = req.headers.get("X-Session-Token");

  if (!sessionToken) {
    // Try to get from cookie as fallback
    const cookies = req.headers.get("Cookie");
    if (cookies) {
      const cookieMatch = cookies.match(/admin_session=([^;]+)/);
      if (cookieMatch) sessionToken = cookieMatch[1];
    }
  }

  if (!sessionToken) {
    return { error: "No session token", admin: null, sessionId: null };
  }

  const sessionTokenHash = await hashToken(sessionToken);
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: session } = await supabase
    .from("admin_sessions")
    .select(`
      id,
      admin_id,
      expires_at,
      last_activity_at,
      admins (
        id,
        email,
        is_active,
        account_locked_until,
        role_id,
        custom_permissions,
        admin_roles (default_permissions)
      )
    `)
    .eq("session_token_hash", sessionTokenHash)
    .maybeSingle();

  if (!session || new Date(session.expires_at) < new Date()) {
    return { error: "Invalid or expired session", admin: null, sessionId: null };
  }

  const admin = session.admins as any;
  if (!admin || !admin.is_active) {
    return { error: "Admin account inactive", admin: null, sessionId: null };
  }

  // Update activity
  await supabase.rpc("admin_update_session_activity", { p_session_id: session.id });

  return { error: null, admin, sessionId: session.id };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { error, admin, sessionId } = await verifyAdminSession(req);
    if (error || !admin) {
      return new Response(
        JSON.stringify({ success: false, message: error || "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Check permission
    const { data: hasPermission } = await supabase.rpc("admin_has_permission", {
      p_admin_id: admin.id,
      p_resource: "channels",
      p_action: req.method === "GET" ? "view" : req.method === "POST" ? "approve" : "reject",
    });

    if (!hasPermission) {
      // Log permission denied
      await supabase.rpc("admin_log_action", {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: "channel.permission_denied",
        p_resource_type: "channel",
        p_resource_id: null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ method: req.method }),
        p_success: false,
        p_error_message: "Permission denied",
      });

      return new Response(
        JSON.stringify({ success: false, message: "Permission denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const channelId = url.pathname.split("/").pop();

    // GET /admin/channels - List channels (pending approval)
    if (req.method === "GET") {
      // Note: You'll need to create a 'channels' table or adapt this to your schema
      // For now, this is a placeholder structure
      const { data: channels, error: channelsError } = await supabase
        .from("users") // Placeholder - replace with actual channels table
        .select("id, email, username, user_type, created_at")
        .limit(50);

      // Log action
      await supabase.rpc("admin_log_action", {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: "channel.list_viewed",
        p_resource_type: "channel",
        p_resource_id: null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ count: channels?.length || 0 }),
        p_success: true,
        p_error_message: null,
      });

      return new Response(
        JSON.stringify({ success: true, channels: channels || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // POST /admin/channels/:id/approve or /reject
    if (req.method === "POST" && channelId) {
      const { action } = await req.json(); // "approve" or "reject"
      const { reason } = await req.json().catch(() => ({}));

      if (action !== "approve" && action !== "reject") {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid action. Use 'approve' or 'reject'" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update channel status (placeholder - adapt to your schema)
      // const { error: updateError } = await supabase
      //   .from("channels")
      //   .update({ status: action === "approve" ? "approved" : "rejected", reviewed_at: new Date().toISOString() })
      //   .eq("id", channelId);

      // Log action
      await supabase.rpc("admin_log_action", {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: `channel.${action}d`,
        p_resource_type: "channel",
        p_resource_id: channelId,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ reason: reason || null }),
        p_success: true,
        p_error_message: null,
      });

      return new Response(
        JSON.stringify({ success: true, message: `Channel ${action}d successfully` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Admin channels error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
