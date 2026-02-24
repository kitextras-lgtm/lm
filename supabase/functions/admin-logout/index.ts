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

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
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
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionTokenHash = await hashToken(sessionToken);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get session info before deleting (for audit log)
    const { data: session } = await supabase
      .from("admin_sessions")
      .select("id, admin_id")
      .eq("session_token_hash", sessionTokenHash)
      .maybeSingle();

    if (session) {
      // Log logout action
      const forwardedFor = req.headers.get("x-forwarded-for");
      const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : (req.headers.get("x-real-ip") || "127.0.0.1");
      const userAgent = req.headers.get("user-agent") || "unknown";

      await supabase.rpc("admin_log_action", {
        p_admin_id: session.admin_id,
        p_session_id: session.id,
        p_action_type: "auth.logout",
        p_resource_type: "admin",
        p_resource_id: session.admin_id,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({}),
        p_success: true,
        p_error_message: null,
      });

      // Delete session
      await supabase.from("admin_sessions").delete().eq("id", session.id);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Logged out successfully" }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          // Clear cookie if using cookies
          // "Set-Cookie": "admin_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/"
        },
      }
    );
  } catch (error: any) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
