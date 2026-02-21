import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const userId = url.searchParams.get("userId");
      const platform = url.searchParams.get("platform");

      if (!userId && !platform) {
        return new Response(JSON.stringify({ success: false, message: "userId or platform required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let query = supabase.from("social_links").select("*");
      if (userId) query = query.eq("user_id", userId);
      if (platform) query = query.ilike("platform", platform);
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, links: data }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const { userId, platform, url: linkUrl, display_name, channel_type, channel_description, verified } = await req.json();
      if (!userId || !linkUrl) {
        return new Response(JSON.stringify({ success: false, message: "userId and url required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check duplicate system-wide — a verified URL is exclusively owned; unverified blocks re-registration too
      const { data: existing } = await supabase
        .from("social_links")
        .select("id, user_id, verified")
        .eq("url", linkUrl)
        .limit(1);

      if (existing && existing.length > 0) {
        const owner = existing[0];
        if (owner.user_id === userId) {
          return new Response(JSON.stringify({ success: false, duplicate: true, own: true }), {
            status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ success: false, duplicate: true, own: false, verified: owner.verified }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const insertData: Record<string, string | boolean> = {
        user_id: userId,
        platform,
        url: linkUrl,
        display_name: display_name || platform,
      };
      if (channel_type !== undefined) insertData.channel_type = channel_type;
      if (channel_description !== undefined) insertData.channel_description = channel_description;
      if (verified === true) insertData.verified = true;

      const { error } = await supabase.from("social_links").insert(insertData);
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      const userId = url.searchParams.get("userId");
      if (!id || !userId) {
        return new Response(JSON.stringify({ success: false, message: "id and userId required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { error } = await supabase.from("social_links").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, message: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("social-links error:", message);
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
