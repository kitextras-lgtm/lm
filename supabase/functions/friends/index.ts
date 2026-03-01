import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { handleCors } from '../_shared/cors.ts';
import { json, jsonError } from '../_shared/response.ts';
import { createServiceClient } from '../_shared/supabase-client.ts';

// pair_key = min(a,b) + ':' + max(a,b)
function pairKey(a: string, b: string): string {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

Deno.serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createServiceClient();
  const url = new URL(req.url);
  // Route: /friends/<action>
  const parts = url.pathname.replace(/^\/friends\/?/, '').split('/').filter(Boolean);
  const action = parts[0]; // e.g. 'send', 'accept', 'decline', 'cancel', 'remove', 'block', 'list', 'search'
  const method = req.method.toUpperCase();

  let body: Record<string, any> = {};
  if (method !== 'GET' && method !== 'DELETE') {
    try { body = await req.json(); } catch { /* empty body ok */ }
  }

  const currentUserId: string | undefined = body.currentUserId || url.searchParams.get('currentUserId') || undefined;
  if (!currentUserId) return jsonError('currentUserId required', 400);

  try {
    // ── SEND friend request ──────────────────────────────────────────────────
    if (action === 'send' && method === 'POST') {
      const { targetUserId } = body;
      if (!targetUserId) return jsonError('targetUserId required', 400);
      if (targetUserId === currentUserId) return jsonError('Cannot add yourself', 400);

      const pk = pairKey(currentUserId, targetUserId);

      // Check existing relationship
      const { data: existing } = await supabase
        .from('user_relationships')
        .select('id, status, requester_id, addressee_id')
        .eq('pair_key', pk)
        .maybeSingle();

      if (existing) {
        if (existing.status === 'accepted') return jsonError('already_friends', 409);
        if (existing.status === 'blocked') return jsonError('blocked', 403);
        if (existing.status === 'pending') {
          // Reverse direction → auto-accept
          if (existing.addressee_id === currentUserId) {
            const { data: updated } = await supabase
              .from('user_relationships')
              .update({ status: 'accepted', responded_at: new Date().toISOString() })
              .eq('id', existing.id)
              .select()
              .single();
            return json({ relationship: updated, autoAccepted: true });
          }
          return jsonError('already_requested', 409);
        }
        if (existing.status === 'declined') {
          // Allow re-request after decline
          const { data: updated } = await supabase
            .from('user_relationships')
            .update({ status: 'pending', requester_id: currentUserId, addressee_id: targetUserId, responded_at: null })
            .eq('id', existing.id)
            .select()
            .single();
          return json({ relationship: updated });
        }
      }

      const { data: relationship, error } = await supabase
        .from('user_relationships')
        .insert({ requester_id: currentUserId, addressee_id: targetUserId, status: 'pending', pair_key: pk })
        .select()
        .single();
      if (error) throw error;
      return json({ relationship });
    }

    // ── ACCEPT request ───────────────────────────────────────────────────────
    if (action === 'accept' && method === 'POST') {
      const { relationshipId } = body;
      if (!relationshipId) return jsonError('relationshipId required', 400);

      const { data: rel } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('id', relationshipId)
        .maybeSingle();
      if (!rel) return jsonError('Not found', 404);
      if (rel.addressee_id !== currentUserId) return jsonError('Forbidden', 403);
      if (rel.status !== 'pending') return jsonError('Not pending', 400);

      const { data: updated } = await supabase
        .from('user_relationships')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', relationshipId)
        .select()
        .single();
      return json({ relationship: updated });
    }

    // ── DECLINE request ──────────────────────────────────────────────────────
    if (action === 'decline' && method === 'POST') {
      const { relationshipId } = body;
      if (!relationshipId) return jsonError('relationshipId required', 400);

      const { data: rel } = await supabase.from('user_relationships').select('*').eq('id', relationshipId).maybeSingle();
      if (!rel) return jsonError('Not found', 404);
      if (rel.addressee_id !== currentUserId) return jsonError('Forbidden', 403);

      await supabase.from('user_relationships').delete().eq('id', relationshipId);
      return json({ success: true });
    }

    // ── CANCEL outgoing request ──────────────────────────────────────────────
    if (action === 'cancel' && method === 'POST') {
      const { relationshipId } = body;
      if (!relationshipId) return jsonError('relationshipId required', 400);

      const { data: rel } = await supabase.from('user_relationships').select('*').eq('id', relationshipId).maybeSingle();
      if (!rel) return jsonError('Not found', 404);
      if (rel.requester_id !== currentUserId) return jsonError('Forbidden', 403);
      if (rel.status !== 'pending') return jsonError('Not pending', 400);

      await supabase.from('user_relationships').delete().eq('id', relationshipId);
      return json({ success: true });
    }

    // ── REMOVE friend ────────────────────────────────────────────────────────
    if (action === 'remove' && method === 'POST') {
      const { targetUserId } = body;
      if (!targetUserId) return jsonError('targetUserId required', 400);

      const pk = pairKey(currentUserId, targetUserId);
      await supabase.from('user_relationships').delete().eq('pair_key', pk).eq('status', 'accepted');
      return json({ success: true });
    }

    // ── BLOCK user ───────────────────────────────────────────────────────────
    if (action === 'block' && method === 'POST') {
      const { targetUserId } = body;
      if (!targetUserId) return jsonError('targetUserId required', 400);
      if (targetUserId === currentUserId) return jsonError('Cannot block yourself', 400);

      const pk = pairKey(currentUserId, targetUserId);
      const { data: existing } = await supabase.from('user_relationships').select('id').eq('pair_key', pk).maybeSingle();

      if (existing) {
        await supabase.from('user_relationships')
          .update({ status: 'blocked', requester_id: currentUserId, addressee_id: targetUserId })
          .eq('id', existing.id);
      } else {
        await supabase.from('user_relationships').insert({
          requester_id: currentUserId, addressee_id: targetUserId,
          status: 'blocked', pair_key: pk,
        });
      }
      return json({ success: true });
    }

    // ── UNBLOCK ──────────────────────────────────────────────────────────────
    if (action === 'unblock' && method === 'POST') {
      const { targetUserId } = body;
      if (!targetUserId) return jsonError('targetUserId required', 400);
      const pk = pairKey(currentUserId, targetUserId);
      await supabase.from('user_relationships').delete().eq('pair_key', pk).eq('status', 'blocked');
      return json({ success: true });
    }

    // ── LIST friends / pending / blocked ─────────────────────────────────────
    if (action === 'list' && method === 'GET') {
      const type = url.searchParams.get('type') || 'friends'; // friends | incoming | outgoing | blocked

      let query = supabase
        .from('user_relationships')
        .select(`
          id, status, requester_id, addressee_id, created_at, responded_at,
          requester:users!user_relationships_requester_id_fkey(id, username, first_name, last_name, profile_picture_url, user_type),
          addressee:users!user_relationships_addressee_id_fkey(id, username, first_name, last_name, profile_picture_url, user_type)
        `);

      if (type === 'friends') {
        query = query.eq('status', 'accepted').or(`requester_id.eq.${currentUserId},addressee_id.eq.${currentUserId}`);
      } else if (type === 'incoming') {
        query = query.eq('status', 'pending').eq('addressee_id', currentUserId);
      } else if (type === 'outgoing') {
        query = query.eq('status', 'pending').eq('requester_id', currentUserId);
      } else if (type === 'blocked') {
        query = query.eq('status', 'blocked').eq('requester_id', currentUserId);
      }

      const { data: rows, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // Map to "other user" for friends list
      const items = (rows || []).map((row: any) => {
        const otherUser = row.requester_id === currentUserId ? row.addressee : row.requester;
        return { id: row.id, status: row.status, user: otherUser, created_at: row.created_at, responded_at: row.responded_at, requester_id: row.requester_id, addressee_id: row.addressee_id };
      });

      return json({ items });
    }

    // ── SEARCH users by username ─────────────────────────────────────────────
    if (action === 'search' && method === 'GET') {
      const q = url.searchParams.get('q') || '';
      if (!q.trim()) return json({ users: [] });

      const { data: users, error } = await supabase
        .from('users')
        .select('id, username, first_name, last_name, profile_picture_url, user_type')
        .ilike('username', `%${q.trim()}%`)
        .neq('id', currentUserId)
        .limit(20);
      if (error) throw error;

      // Annotate with relationship status for current user
      const userIds = (users || []).map((u: any) => u.id);
      let relMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const pks = userIds.map((id: string) => pairKey(currentUserId, id));
        const { data: rels } = await supabase
          .from('user_relationships')
          .select('pair_key, status, requester_id, addressee_id, id')
          .in('pair_key', pks);
        (rels || []).forEach((r: any) => { relMap[r.pair_key] = r; });
      }

      const annotated = (users || []).map((u: any) => {
        const pk = pairKey(currentUserId, u.id);
        const rel = relMap[pk];
        return { ...u, relationship: rel ? { id: rel.id, status: rel.status, requester_id: rel.requester_id } : null };
      });

      return json({ users: annotated });
    }

    // ── STATUS check for a specific user ────────────────────────────────────
    if (action === 'status' && method === 'GET') {
      const targetUserId = url.searchParams.get('targetUserId');
      if (!targetUserId) return jsonError('targetUserId required', 400);
      const pk = pairKey(currentUserId, targetUserId);
      const { data: rel } = await supabase.from('user_relationships').select('*').eq('pair_key', pk).maybeSingle();
      return json({ relationship: rel });
    }

    return jsonError('Unknown action', 404);
  } catch (err: any) {
    console.error('[friends]', err);
    return jsonError(err.message || 'Internal error', 500);
  }
});
