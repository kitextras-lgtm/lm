// Fix 18: Mute Conversations Hook

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useMuting(currentUserId: string) {
  const [mutedConversations, setMutedConversations] = useState<Map<string, Date | null>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch muted conversations on mount
  useEffect(() => {
    const fetchMuted = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('conversation_mutes')
        .select('conversation_id, muted_until')
        .eq('user_id', currentUserId);

      if (!error && data) {
        const muted = new Map<string, Date | null>();
        data.forEach(m => {
          muted.set(m.conversation_id, m.muted_until ? new Date(m.muted_until) : null);
        });
        setMutedConversations(muted);
      }
      setLoading(false);
    };

    fetchMuted();
  }, [currentUserId]);

  const muteConversation = useCallback(async (
    conversationId: string,
    duration?: number // minutes, undefined = forever
  ) => {
    const mutedUntil = duration
      ? new Date(Date.now() + duration * 60 * 1000).toISOString()
      : null;

    const { error } = await supabase
      .from('conversation_mutes')
      .upsert({
        user_id: currentUserId,
        conversation_id: conversationId,
        muted_until: mutedUntil,
      });

    if (!error) {
      setMutedConversations(prev =>
        new Map(prev).set(conversationId, mutedUntil ? new Date(mutedUntil) : null)
      );
    }

    return { error };
  }, [currentUserId]);

  const unmuteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('conversation_mutes')
      .delete()
      .eq('user_id', currentUserId)
      .eq('conversation_id', conversationId);

    if (!error) {
      setMutedConversations(prev => {
        const newMap = new Map(prev);
        newMap.delete(conversationId);
        return newMap;
      });
    }

    return { error };
  }, [currentUserId]);

  const isMuted = useCallback((conversationId: string) => {
    const mutedUntil = mutedConversations.get(conversationId);

    if (mutedUntil === undefined) return false; // Not muted
    if (mutedUntil === null) return true; // Muted forever

    return new Date() < mutedUntil; // Check if still within mute period
  }, [mutedConversations]);

  return { muteConversation, unmuteConversation, isMuted, loading };
}
