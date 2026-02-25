import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleCors, getCorsHeaders } from '../_shared/cors.ts';
import { getSupabaseEnv } from '../_shared/supabase-client.ts';

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const corsHeaders = getCorsHeaders(req);
  const { url: supabaseUrl, serviceRoleKey } = getSupabaseEnv();
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Verify caller identity from Authorization header
  const authHeader = req.headers.get('Authorization');
  let callerUserId: string | null = null;
  if (authHeader) {
    try {
      const anonClient = createClient(
        supabaseUrl,
        Deno.env.get('SUPABASE_ANON_KEY') ?? authHeader.replace('Bearer ', ''),
      );
      const {
        data: { user },
      } = await anonClient.auth.getUser(authHeader.replace('Bearer ', ''));
      callerUserId = user?.id ?? null;
    } catch {
      /* auth check failed — callerUserId stays null */
    }
  }

  const jsonResp = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const userId = url.searchParams.get('userId');
      const platform = url.searchParams.get('platform');

      if (!userId && !platform) {
        return jsonResp(400, { success: false, message: 'userId or platform required' });
      }

      let query = supabase.from('social_links').select('*');
      if (userId) query = query.eq('user_id', userId);
      if (platform) query = query.ilike('platform', platform);
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return jsonResp(200, { success: true, links: data });
    }

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
        return jsonResp(400, { success: false, message: 'userId and url required' });
      }

      // Verify the caller owns this userId (prevent IDOR)
      if (callerUserId && callerUserId !== userId) {
        return jsonResp(403, { success: false, message: 'Unauthorized: userId mismatch' });
      }

      // Check duplicate system-wide
      const { data: existing } = await supabase
        .from('social_links')
        .select('id, user_id, verified')
        .eq('url', linkUrl)
        .limit(1);

      if (existing && existing.length > 0) {
        const owner = existing[0];
        if (owner.user_id === userId) {
          return jsonResp(200, { success: false, duplicate: true, own: true });
        }
        return jsonResp(200, {
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

      return jsonResp(200, { success: true });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      const userId = url.searchParams.get('userId');
      if (!id || !userId) {
        return jsonResp(400, { success: false, message: 'id and userId required' });
      }

      // Verify the caller owns this userId (prevent IDOR)
      if (callerUserId && callerUserId !== userId) {
        return jsonResp(403, { success: false, message: 'Unauthorized: userId mismatch' });
      }
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
      return jsonResp(200, { success: true });
    }

    return jsonResp(405, { success: false, message: 'Method not allowed' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('social-links error:', message);
    return jsonResp(500, { success: false, message });
  }
});
