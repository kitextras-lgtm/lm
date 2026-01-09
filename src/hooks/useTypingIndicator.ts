// Fix 23: Typing Indicators Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useTypingIndicator(conversationId: string, currentUserId: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Subscribe to typing channel
  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const channel = supabase.channel(`typing:${conversationId}`);
    channelRef.current = channel;

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { userId, isTyping } = payload as { userId: string; isTyping: boolean };

        if (userId === currentUserId) return; // Ignore own typing

        // Clear existing timeout for this user
        const existingTimeout = typingTimeoutRef.current.get(userId);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        if (isTyping) {
          setTypingUsers(prev => new Set([...prev, userId]));

          // Auto-remove after 3 seconds of no update
          const timeout = setTimeout(() => {
            setTypingUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(userId);
              return newSet;
            });
          }, 3000);

          typingTimeoutRef.current.set(userId, timeout);
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      // Clear all timeouts
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, [conversationId, currentUserId]);

  // Broadcast typing status
  const setTyping = useCallback((isTyping: boolean) => {
    if (!channelRef.current) return;

    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUserId, isTyping },
    });
  }, [currentUserId]);

  return { typingUsers, setTyping };
}
