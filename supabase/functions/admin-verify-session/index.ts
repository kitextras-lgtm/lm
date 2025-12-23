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

const SESSION_DURATION_MINUTES = 30;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Get session token from custom header or cookie
    // Note: Authorization header is used for Supabase anon key, so we use X-Session-Token for the session
    let sessionToken: string | null = req.headers.get("X-Session-Token");

    if (!sessionToken) {
      // Try to get from cookie as fallback
      const cookies = req.headers.get("Cookie");
      if (cookies) {
        const cookieMatch = cookies.match(/admin_session=([^;]+)/);
        if (cookieMatch) {
          sessionToken = cookieMatch[1];
        }
      }
    }

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ success: false, message: "No session token provided" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Hash the token to look it up
    const sessionTokenHash = await hashToken(sessionToken);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find session
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .select(`
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
          admin_roles (
            id,
            name,
            display_name,
            default_permissions
          )
        )
      `)
      .eq("session_token_hash", sessionTokenHash)
      .maybeSingle();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid session" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await supabase.from("admin_sessions").delete().eq("id", session.id);
      return new Response(
        JSON.stringify({ success: false, message: "Session expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if session is inactive (30 minutes)
    const lastActivity = new Date(session.last_activity_at);
    const inactiveMinutes = (Date.now() - lastActivity.getTime()) / 60000;
    if (inactiveMinutes > SESSION_DURATION_MINUTES) {
      await supabase.from("admin_sessions").delete().eq("id", session.id);
      return new Response(
        JSON.stringify({ success: false, message: "Session expired due to inactivity" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if admin account is still active
    const admin = session.admins as any;
    if (!admin || !admin.is_active) {
      return new Response(
        JSON.stringify({ success: false, message: "Admin account is deactivated" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if admin account is locked
    if (admin.account_locked_until && new Date(admin.account_locked_until) > new Date()) {
      return new Response(
        JSON.stringify({ success: false, message: "Admin account is locked" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last activity
    await supabase.rpc("admin_update_session_activity", { p_session_id: session.id });

    // Return admin info
    return new Response(
      JSON.stringify({
        success: true,
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
          role: {
            id: admin.admin_roles.id,
            name: admin.admin_roles.name,
            displayName: admin.admin_roles.display_name,
          },
          permissions: admin.custom_permissions || admin.admin_roles.default_permissions,
        },
        sessionId: session.id,
        expiresAt: session.expires_at,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Session verification error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
