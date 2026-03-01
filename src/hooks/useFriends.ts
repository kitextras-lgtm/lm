import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FRIENDS_URL = `${SUPABASE_URL}/functions/v1/friends`;

export interface FriendUser {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
  user_type: string | null;
}

export interface FriendRelationship {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  user: FriendUser;
  created_at: string;
  responded_at: string | null;
  requester_id: string;
  addressee_id: string;
}

export interface SearchedUser extends FriendUser {
  relationship: { id: string; status: string; requester_id: string } | null;
}

async function callFriends(path: string, method: string, body?: Record<string, any>) {
  const res = await fetch(`${FRIENDS_URL}/${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function getFriends(currentUserId: string, type: string) {
  const res = await fetch(
    `${FRIENDS_URL}/list?currentUserId=${currentUserId}&type=${type}`,
    { headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  return res.json();
}

export function useFriends(currentUserId: string | null) {
  const [friends, setFriends] = useState<FriendRelationship[]>([]);
  const [incoming, setIncoming] = useState<FriendRelationship[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRelationship[]>([]);
  const [blocked, setBlocked] = useState<FriendRelationship[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchAll = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const [f, i, o, b] = await Promise.all([
        getFriends(currentUserId, 'friends'),
        getFriends(currentUserId, 'incoming'),
        getFriends(currentUserId, 'outgoing'),
        getFriends(currentUserId, 'blocked'),
      ]);
      setFriends(f.items || []);
      setIncoming(i.items || []);
      setOutgoing(o.items || []);
      setBlocked(b.items || []);
    } catch (e) {
      console.error('[useFriends] fetch error', e);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  // Initial fetch + realtime subscription
  useEffect(() => {
    if (!currentUserId) return;
    fetchAll();

    // Subscribe to any changes in user_relationships touching this user
    const channel = supabase
      .channel(`friends_${currentUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_relationships',
          filter: `requester_id=eq.${currentUserId}`,
        },
        () => fetchAll()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_relationships',
          filter: `addressee_id=eq.${currentUserId}`,
        },
        () => fetchAll()
      )
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, fetchAll]);

  const sendRequest = useCallback(async (targetUserId: string) => {
    if (!currentUserId) return { error: 'Not logged in' };
    const data = await callFriends('send', 'POST', { currentUserId, targetUserId });
    await fetchAll();
    return data;
  }, [currentUserId, fetchAll]);

  const acceptRequest = useCallback(async (relationshipId: string) => {
    if (!currentUserId) return;
    await callFriends('accept', 'POST', { currentUserId, relationshipId });
    await fetchAll();
  }, [currentUserId, fetchAll]);

  const declineRequest = useCallback(async (relationshipId: string) => {
    if (!currentUserId) return;
    await callFriends('decline', 'POST', { currentUserId, relationshipId });
    await fetchAll();
  }, [currentUserId, fetchAll]);

  const cancelRequest = useCallback(async (relationshipId: string) => {
    if (!currentUserId) return;
    await callFriends('cancel', 'POST', { currentUserId, relationshipId });
    await fetchAll();
  }, [currentUserId, fetchAll]);

  const removeFriend = useCallback(async (targetUserId: string) => {
    if (!currentUserId) return;
    await callFriends('remove', 'POST', { currentUserId, targetUserId });
    await fetchAll();
  }, [currentUserId, fetchAll]);

  const blockUser = useCallback(async (targetUserId: string) => {
    if (!currentUserId) return;
    await callFriends('block', 'POST', { currentUserId, targetUserId });
    await fetchAll();
  }, [currentUserId, fetchAll]);

  const unblockUser = useCallback(async (targetUserId: string) => {
    if (!currentUserId) return;
    await callFriends('unblock', 'POST', { currentUserId, targetUserId });
    await fetchAll();
  }, [currentUserId, fetchAll]);

  const searchUsers = useCallback(async (q: string): Promise<SearchedUser[]> => {
    if (!currentUserId || !q.trim()) return [];
    const res = await fetch(
      `${FRIENDS_URL}/search?currentUserId=${currentUserId}&q=${encodeURIComponent(q)}`,
      { headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
    );
    const data = await res.json();
    return data.users || [];
  }, [currentUserId]);

  const friendIds = new Set(friends.map(f => f.user.id));

  return {
    friends, incoming, outgoing, blocked, loading,
    friendIds,
    sendRequest, acceptRequest, declineRequest, cancelRequest,
    removeFriend, blockUser, unblockUser, searchUsers,
    refetch: fetchAll,
  };
}
