import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const WORDS = [
  "Anchor","Blaze","Cedar","Drift","Eagle","Flare","Grove","Haven","Ivory","Jade",
  "Kite","Lumen","Maple","Noble","Orbit","Pearl","Quest","Ridge","Stone","Tide",
  "Unity","Valor","Willow","Xenon","Yield","Zenith","Amber","Birch","Coral","Dawn",
  "Echo","Fern","Gale","Halo","Iris","Jewel","Knoll","Lotus","Mist","Nova",
  "Opal","Pine","Quill","River","Sage","Terra","Umber","Veil","Wave","Zinc",
  "Acorn","Brook","Cliff","Dune","Ember","Frost","Glow","Heath","Isle","Jasper",
  "Kelp","Lark","Marsh","Nook","Onyx","Petal","Quartz","Reed","Slate","Thorn",
  "Umber","Vine","Wren","Yew","Zeal","Alder","Brine","Crest","Dell","Elm",
  "Finch","Gust","Haze","Ink","Juniper","Knot","Leaf","Moss","Nile","Oak",
  "Plum","Quake","Rune","Silt","Tuft","Urn","Vale","Wick","Yolk","Zest"
];

function generatePhrase(): string {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  return `Elevate ${word}`;
}

async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ElevateBot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return "";
    const html = await res.text();
    // Strip HTML tags to get plain text
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  } catch {
    return "";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { action, linkId, userId } = await req.json();

    if (!linkId || !userId) {
      return new Response(JSON.stringify({ success: false, message: "linkId and userId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the link row
    const { data: link, error: fetchErr } = await supabase
      .from("social_links")
      .select("*")
      .eq("id", linkId)
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr || !link) {
      return new Response(JSON.stringify({ success: false, message: "Link not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: get-phrase — generate and store a phrase if not already set
    if (action === "get-phrase") {
      let phrase = link.verification_phrase;
      if (!phrase) {
        phrase = generatePhrase();
        await supabase
          .from("social_links")
          .update({ verification_phrase: phrase })
          .eq("id", linkId);
      }
      return new Response(JSON.stringify({ success: true, phrase }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ACTION: check — scrape the URL and look for the phrase
    if (action === "check") {
      const phrase = link.verification_phrase;
      if (!phrase) {
        return new Response(JSON.stringify({ success: false, message: "No phrase assigned yet" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const pageText = await fetchPageText(link.url);
      const found = pageText.toLowerCase().includes(phrase.toLowerCase());

      if (found) {
        await supabase
          .from("social_links")
          .update({ verified: true })
          .eq("id", linkId);
      }

      return new Response(JSON.stringify({ success: true, verified: found }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: false, message: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("verify-social-link error:", message);
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
