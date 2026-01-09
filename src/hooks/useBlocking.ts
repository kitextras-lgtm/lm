// Fix 18: Block Users Hook

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useBlocking(currentUserId: string) {
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch blocked users on mount
  useEffect(() => {
    const fetchBlocked = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_blocks')
        .select('blocked_id')
        .eq('blocker_id', currentUserId);

      if (!error && data) {
        setBlockedUsers(new Set(data.map(b => b.blocked_id)));
      }
      setLoading(false);
    };

    fetchBlocked();
  }, [currentUserId]);

  const blockUser = useCallback(async (userId: string) => {
    const { error } = await supabase
      .from('user_blocks')
      .insert({ blocker_id: currentUserId, blocked_id: userId });

    if (!error) {
      setBlockedUsers(prev => new Set([...prev, userId]));
    }

    return { error };
  }, [currentUserId]);

  const unblockUser = useCallback(async (userId: string) => {
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', currentUserId)
      .eq('blocked_id', userId);

    if (!error) {
      setBlockedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }

    return { error };
  }, [currentUserId]);

  const isBlocked = useCallback((userId: string) => {
    return blockedUsers.has(userId);
  }, [blockedUsers]);

  return { blockUser, unblockUser, isBlocked, blockedUsers, loading };
}
