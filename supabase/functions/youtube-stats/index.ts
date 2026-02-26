import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleCors, getCorsHeaders } from '../_shared/cors.ts';
import { getSupabaseEnv } from '../_shared/supabase-client.ts';

const YOUTUBE_API_KEY = 'AIzaSyC_tRUvfb9E7OeMWQy3U4MLQ_tQRYt0XFw';

function extractYouTubeHandle(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('youtube.com') && !u.hostname.includes('youtu.be')) return null;
    // Handle /@handle, /c/handle, /user/handle, /channel/UCxxxx
    const match = u.pathname.match(/^\/@([^/]+)/) ||
                  u.pathname.match(/^\/c\/([^/]+)/) ||
                  u.pathname.match(/^\/user\/([^/]+)/);
    if (match) return match[1];
    // Channel ID
    const channelMatch = u.pathname.match(/^\/channel\/(UC[^/]+)/);
    if (channelMatch) return channelMatch[1];
    return null;
  } catch {
    return null;
  }
}

function isChannelId(handle: string): boolean {
  return handle.startsWith('UC') && handle.length > 10;
}

async function fetchChannelStats(handleOrId: string): Promise<{ follower_count: number; view_count: number; channel_id: string } | null> {
  let channelId = handleOrId;

  if (!isChannelId(handleOrId)) {
    // Resolve handle → channel ID via search
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent('@' + handleOrId)}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const item = searchData.items?.[0];
    if (!item) return null;
    channelId = item.snippet?.channelId || item.id?.channelId;
    if (!channelId) return null;
  }

  const statsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${encodeURIComponent(channelId)}&key=${YOUTUBE_API_KEY}`;
  const statsRes = await fetch(statsUrl);
  if (!statsRes.ok) return null;
  const statsData = await statsRes.json();
  const stats = statsData.items?.[0]?.statistics;
  if (!stats) return null;

  return {
    follower_count: parseInt(stats.subscriberCount || '0', 10),
    view_count: parseInt(stats.viewCount || '0', 10),
    channel_id: channelId,
  };
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);
  const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const jsonResp = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    if (req.method !== 'POST') {
      return jsonResp(405, { success: false, message: 'Method not allowed' });
    }

    const { userId } = await req.json();
    if (!userId) {
      return jsonResp(400, { success: false, message: 'userId required' });
    }

    // Fetch all YouTube links for this user
    const { data: links, error: fetchError } = await supabase
      .from('social_links')
      .select('id, url, platform')
      .eq('user_id', userId)
      .ilike('platform', 'youtube');

    if (fetchError) throw fetchError;
    if (!links || links.length === 0) {
      return jsonResp(200, { success: true, updated: 0, message: 'No YouTube links found' });
    }

    let updated = 0;
    const results: { url: string; follower_count?: number; view_count?: number; error?: string }[] = [];

    for (const link of links) {
      const handle = extractYouTubeHandle(link.url);
      if (!handle) {
        results.push({ url: link.url, error: 'Could not parse handle' });
        continue;
      }

      const stats = await fetchChannelStats(handle);
      if (!stats) {
        results.push({ url: link.url, error: 'Channel not found or API error' });
        continue;
      }

      const { error: updateError } = await supabase
        .from('social_links')
        .update({
          follower_count: stats.follower_count,
          view_count: stats.view_count,
        })
        .eq('id', link.id);

      if (updateError) {
        results.push({ url: link.url, error: updateError.message });
      } else {
        updated++;
        results.push({ url: link.url, follower_count: stats.follower_count, view_count: stats.view_count });
      }
    }

    return jsonResp(200, { success: true, updated, results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('youtube-stats error:', message);
    return jsonResp(500, { success: false, message });
  }
});
