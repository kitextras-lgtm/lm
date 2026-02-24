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

// Helper to verify session and get admin
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
    const { resource, action } = await req.json();

    if (!resource || !action) {
      return new Response(
        JSON.stringify({ success: false, message: "Resource and action required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error, admin } = await verifyAdminSession(req);
    if (error || !admin) {
      return new Response(
        JSON.stringify({ success: false, message: error || "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check permission using database function
    const { data: hasPermission, error: permError } = await supabase.rpc(
      "admin_has_permission",
      {
        p_admin_id: admin.id,
        p_resource: resource,
        p_action: action,
      }
    );

    if (permError) {
      console.error("Permission check error:", permError);
      return new Response(
        JSON.stringify({ success: false, message: "Permission check failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, hasPermission: hasPermission === true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Check permission error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
