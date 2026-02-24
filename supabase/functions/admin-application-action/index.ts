import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Session-Token",
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify admin session
    let sessionToken: string | null = req.headers.get("X-Session-Token");
    if (!sessionToken) {
      const cookies = req.headers.get("Cookie");
      if (cookies) {
        const match = cookies.match(/admin_session=([^;]+)/);
        if (match) sessionToken = match[1];
      }
    }

    if (!sessionToken) {
      return new Response(JSON.stringify({ success: false, message: "No session token provided" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sessionTokenHash = await hashToken(sessionToken);
    const { data: session } = await supabase
      .from("admin_sessions")
      .select("id, admin_id, expires_at, admins (id, is_active, custom_permissions, admin_roles (default_permissions))")
      .eq("session_token_hash", sessionTokenHash)
      .maybeSingle();

    if (!session || new Date(session.expires_at) < new Date()) {
      return new Response(JSON.stringify({ success: false, message: "Invalid or expired session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = session.admins as any;
    if (!admin || !admin.is_active) {
      return new Response(JSON.stringify({ success: false, message: "Admin account inactive" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check permission
    const { data: hasPermission } = await supabase.rpc("admin_has_permission", {
      p_admin_id: admin.id,
      p_resource: "applications",
      p_action: "approve",
    });

    if (!hasPermission) {
      return new Response(JSON.stringify({ success: false, message: "Permission denied" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { applicationId, action, declineReason } = await req.json();

    if (!applicationId || !action) {
      return new Response(JSON.stringify({ success: false, message: "applicationId and action required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action !== "approved" && action !== "denied") {
      return new Response(JSON.stringify({ success: false, message: "action must be 'approved' or 'denied'" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the application first (needed for artist_account side-effect)
    const { data: app, error: fetchErr } = await supabase
      .from("applications")
      .select("id, user_id, application_type")
      .eq("id", applicationId)
      .maybeSingle();

    if (fetchErr || !app) {
      return new Response(JSON.stringify({ success: false, message: "Application not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update application status
    const updateData: Record<string, any> = {
      status: action,
      reviewed_at: new Date().toISOString(),
    };
    if (action === "denied" && declineReason) {
      updateData.decline_reason = declineReason;
    }

    const { error: updateErr } = await supabase
      .from("applications")
      .update(updateData)
      .eq("id", applicationId);

    if (updateErr) {
      console.error("Failed to update application:", updateErr);
      return new Response(JSON.stringify({ success: false, message: "Failed to update application" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Side-effect: if approving an artist_account, mark their Artist social link as verified
    // and update their user_type to 'artist'
    if (action === "approved" && app.application_type === "artist_account" && app.user_id) {
      await supabase
        .from("social_links")
        .update({ verified: true })
        .eq("user_id", app.user_id)
        .eq("platform", "Artist");

      await supabase
        .from("users")
        .update({ user_type: "artist" })
        .eq("id", app.user_id);
    }

    // Audit log
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";
    await supabase.rpc("admin_log_action", {
      p_admin_id: admin.id,
      p_session_id: session.id,
      p_action_type: `application.${action}`,
      p_resource_type: "application",
      p_resource_id: applicationId,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_details: JSON.stringify({ action, declineReason: declineReason || null }),
      p_success: true,
      p_error_message: null,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("admin-application-action error:", error);
    return new Response(JSON.stringify({ success: false, message: "Internal server error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
