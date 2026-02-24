import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';

const WORDS = [
  'Anchor','Blaze','Cedar','Drift','Eagle','Flare','Grove','Haven','Ivory','Jade',
  'Kite','Lumen','Maple','Noble','Orbit','Pearl','Quest','Ridge','Stone','Tide',
  'Unity','Valor','Willow','Xenon','Yield','Zenith','Amber','Birch','Coral','Dawn',
  'Echo','Fern','Gale','Halo','Iris','Jewel','Knoll','Lotus','Mist','Nova',
  'Opal','Pine','Quill','River','Sage','Terra','Umber','Veil','Wave','Zinc',
  'Acorn','Brook','Cliff','Dune','Ember','Frost','Glow','Heath','Isle','Jasper',
  'Kelp','Lark','Marsh','Nook','Onyx','Petal','Quartz','Reed','Slate','Thorn',
  'Umber','Vine','Wren','Yew','Zeal','Alder','Brine','Crest','Dell','Elm',
  'Finch','Gust','Haze','Ink','Juniper','Knot','Leaf','Moss','Nile','Oak',
  'Plum','Quake','Rune','Silt','Tuft','Urn','Vale','Wick','Yolk','Zest',
];

function generatePhrase(): string {
  return `Elevate ${WORDS[Math.floor(Math.random() * WORDS.length)]}`;
}

async function fetchPageText(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ElevateBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    if (!res.ok) return '';
    const html = await res.text();
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  } catch {
    return '';
  }
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();

  try {
    const { action, linkId, userId } = await req.json();

    if (!linkId || !userId) {
      return jsonError('linkId and userId required');
    }

    const { data: link, error: fetchErr } = await supabase
      .from('social_links')
      .select('*')
      .eq('id', linkId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !link) {
      return jsonError('Link not found', 404);
    }

    // ── get-phrase: generate and store a verification phrase ──
    if (action === 'get-phrase') {
      let phrase = link.verification_phrase;
      if (!phrase) {
        phrase = generatePhrase();
        await supabase
          .from('social_links')
          .update({ verification_phrase: phrase })
          .eq('id', linkId);
      }
      return json({ success: true, phrase });
    }

    // ── check: scrape the URL and look for the phrase ──
    if (action === 'check') {
      const phrase = link.verification_phrase;
      if (!phrase) {
        return jsonError('No phrase assigned yet');
      }

      const pageText = await fetchPageText(link.url);
      const found = pageText.toLowerCase().includes(phrase.toLowerCase());

      if (found) {
        await supabase
          .from('social_links')
          .update({ verified: true })
          .eq('id', linkId);
      }

      return json({ success: true, verified: found });
    }

    return jsonError('Unknown action');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('verify-social-link error:', message);
    return jsonError(message, 500);
  }
});
