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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Session-Token",
};

// Helper to verify session and get admin (reusable)
async function verifyAdminSession(req: Request) {
  // Get session token from custom header or cookie
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

    // Check permission for viewing users
    const { data: hasPermission } = await supabase.rpc("admin_has_permission", {
      p_admin_id: admin.id,
      p_resource: "users",
      p_action: "view",
    });

    if (!hasPermission) {
      // Log permission denied
      await supabase.rpc("admin_log_action", {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: "users.permission_denied",
        p_resource_type: "users",
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

    // GET /admin-users - List all users (creators, artists, business)
    if (req.method === "GET") {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get("limit") || "100");
      const offset = parseInt(url.searchParams.get("offset") || "0");

      // Fetch ALL users regardless of user_type (includes creators, artists, business users)
      // Note: Admin accounts are stored in the separate 'admins' table, NOT in 'users' table
      // So admin accounts will NOT appear in this list automatically
      // Using service role key bypasses RLS, so we get all regular users
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, email, full_name, username, user_type, profile_completed, verified, created_at, updated_at")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (usersError) {
        console.error("Error fetching users:", usersError);
        return new Response(
          JSON.stringify({ success: false, message: "Failed to fetch users" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get total count
      const { count } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });

      // Log action
      await supabase.rpc("admin_log_action", {
        p_admin_id: admin.id,
        p_session_id: sessionId,
        p_action_type: "users.list_viewed",
        p_resource_type: "users",
        p_resource_id: null,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ count: users?.length || 0, limit, offset }),
        p_success: true,
        p_error_message: null,
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          users: users || [],
          total: count || 0,
          limit,
          offset
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, message: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Admin users error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
