import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();

  try {
    // ── GET: List social links ──
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const platform = url.searchParams.get('platform');

      if (!userId && !platform) {
        return jsonError('userId or platform required');
      }

      let query = supabase.from('social_links').select('*');
      if (userId) query = query.eq('user_id', userId);
      if (platform) query = query.ilike('platform', platform);
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      return json({ success: true, links: data });
    }

    // ── POST: Create social link ──
    if (req.method === 'POST') {
      const {
        userId,
        platform,
        url: linkUrl,
        display_name,
        channel_type,
        channel_description,
        verified,
      } = await req.json();

      if (!userId || !linkUrl) {
        return jsonError('userId and url required');
      }

      // Check for duplicates system-wide
      const { data: existing } = await supabase
        .from('social_links')
        .select('id, user_id, verified')
        .eq('url', linkUrl)
        .limit(1);

      if (existing && existing.length > 0) {
        const owner = existing[0];
        if (owner.user_id === userId) {
          return json({ success: false, duplicate: true, own: true });
        }
        return json({
          success: false,
          duplicate: true,
          own: false,
          verified: owner.verified,
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

      const { error } = await supabase.from('social_links').insert(insertData);
      if (error) throw error;

      return json({ success: true });
    }

    // ── DELETE: Remove social link ──
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      const userId = url.searchParams.get('userId');

      if (!id || !userId) {
        return jsonError('id and userId required');
      }

      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;

      return json({ success: true });
    }

    return jsonError('Method not allowed', 405);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('social-links error:', message);
    return jsonError(message, 500);
  }
});
