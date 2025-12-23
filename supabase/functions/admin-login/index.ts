import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import bcrypt from "npm:bcryptjs@2.4.3";
import { authenticator } from "npm:otplib@12.0.1";

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
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Constants for security
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;
const SESSION_DURATION_MINUTES = 30;
const TOTP_WINDOW = 2; // Accept codes from 2 steps before/after current time

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, password, totpCode } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, message: "Email and password required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get client IP and user agent
    // Extract first IP from x-forwarded-for (can contain multiple IPs)
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : (req.headers.get("x-real-ip") || "127.0.0.1");
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find admin by email
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select(`
        id,
        email,
        password_hash,
        role_id,
        custom_permissions,
        totp_secret,
        totp_enabled,
        failed_login_attempts,
        account_locked_until,
        is_active,
        full_name,
        admin_roles (
          id,
          name,
          display_name,
          default_permissions
        )
      `)
      .eq("email", email.toLowerCase().trim())
      .maybeSingle();

    if (adminError || !admin) {
      // Don't reveal if email exists (security best practice)
      return new Response(
        JSON.stringify({ success: false, message: "Invalid email or password" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if account is active
    if (!admin.is_active) {
      return new Response(
        JSON.stringify({ success: false, message: "Account is deactivated" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if account is locked
    if (admin.account_locked_until && new Date(admin.account_locked_until) > new Date()) {
      const lockoutMinutes = Math.ceil(
        (new Date(admin.account_locked_until).getTime() - new Date().getTime()) / 60000
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: `Account locked. Try again in ${lockoutMinutes} minutes.`,
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, admin.password_hash);
    if (!passwordValid) {
      // Increment failed login attempts
      const newFailedAttempts = (admin.failed_login_attempts || 0) + 1;
      const shouldLockAccount = newFailedAttempts >= MAX_FAILED_ATTEMPTS;

      await supabase
        .from("admins")
        .update({
          failed_login_attempts: newFailedAttempts,
          account_locked_until: shouldLockAccount
            ? new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString()
            : null,
        })
        .eq("id", admin.id);

      // Log failed login attempt
      await supabase.rpc("admin_log_action", {
        p_admin_id: admin.id,
        p_session_id: null,
        p_action_type: "auth.login_failed",
        p_resource_type: "admin",
        p_resource_id: admin.id,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_details: JSON.stringify({ reason: "invalid_password", failed_attempts: newFailedAttempts }),
        p_success: false,
        p_error_message: "Invalid password",
      });

      return new Response(
        JSON.stringify({
          success: false,
          message: shouldLockAccount
            ? `Account locked after ${MAX_FAILED_ATTEMPTS} failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`
            : "Invalid email or password",
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify TOTP if enabled
    if (admin.totp_enabled) {
      if (!totpCode) {
        return new Response(
          JSON.stringify({ success: false, message: "TOTP code required", requiresTotp: true }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      try {
        const isValid = authenticator.check(totpCode, admin.totp_secret, {
          window: TOTP_WINDOW,
        });

        if (!isValid) {
          // Log failed TOTP attempt
          await supabase.rpc("admin_log_action", {
            p_admin_id: admin.id,
            p_session_id: null,
            p_action_type: "auth.totp_failed",
            p_resource_type: "admin",
            p_resource_id: admin.id,
            p_ip_address: ipAddress,
            p_user_agent: userAgent,
            p_details: JSON.stringify({ reason: "invalid_totp" }),
            p_success: false,
            p_error_message: "Invalid TOTP code",
          });

          return new Response(
            JSON.stringify({ success: false, message: "Invalid TOTP code" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (totpError) {
        console.error("TOTP verification error:", totpError);
        return new Response(
          JSON.stringify({ success: false, message: "TOTP verification failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Generate session token
    const sessionToken = crypto.randomUUID() + "-" + crypto.randomUUID();
    const sessionTokenHash = await hashToken(sessionToken);

    // Calculate session expiration
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MINUTES * 60 * 1000);

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from("admin_sessions")
      .insert({
        admin_id: admin.id,
        session_token_hash: sessionTokenHash,
        ip_address: ipAddress,
        user_agent: userAgent,
        expires_at: expiresAt.toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("Session creation error:", sessionError);
      console.error("IP Address:", ipAddress);
      console.error("Session data:", {
        admin_id: admin.id,
        session_token_hash: sessionTokenHash.substring(0, 20) + "...",
        ip_address: ipAddress,
        expires_at: expiresAt.toISOString(),
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to create session",
          error: sessionError?.message || "Unknown error"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Reset failed login attempts and update last login
    await supabase
      .from("admins")
      .update({
        failed_login_attempts: 0,
        account_locked_until: null,
        last_login_at: new Date().toISOString(),
        last_login_ip: ipAddress,
        last_login_user_agent: userAgent,
      })
      .eq("id", admin.id);

    // Log successful login
    await supabase.rpc("admin_log_action", {
      p_admin_id: admin.id,
      p_session_id: session.id,
      p_action_type: "auth.login_success",
      p_resource_type: "admin",
      p_resource_id: admin.id,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
      p_details: JSON.stringify({ totp_used: admin.totp_enabled }),
      p_success: true,
      p_error_message: null,
    });

    // Return session token and admin info (NEVER return password_hash or totp_secret)
    return new Response(
      JSON.stringify({
        success: true,
        sessionToken: sessionToken, // Client should store this securely (httpOnly cookie or memory)
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
        expiresAt: expiresAt.toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          // Optionally set httpOnly cookie here if using cookies
          // "Set-Cookie": `admin_session=${sessionToken}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DURATION_MINUTES * 60}; Path=/`
        },
      }
    );
  } catch (error: any) {
    console.error("Admin login error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
