// Fix 21: Global Unread Count Hook

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export function useUnreadCount(userId: string, onNewMessage?: () => void) {
  const [totalUnread, setTotalUnread] = useState(0);
  const prevTotalRef = useRef<number | null>(null);

  const fetchUnread = useCallback(async () => {
    if (!userId) return;

    // Get all conversations where user is either customer or admin
    const { data, error } = await supabase
      .from('conversations')
      .select('customer_id, admin_id, unread_count_customer, unread_count_admin, is_request')
      .or(`customer_id.eq.${userId},admin_id.eq.${userId}`);

    if (!error && data) {
      const total = data.reduce((sum, conv) => {
        // Determine which unread count applies to this user
        const raw = conv.customer_id === userId
          ? conv.unread_count_customer
          : conv.unread_count_admin;
        // For unaccepted request conversations where this user is the recipient,
        // cap contribution to 1 so the badge never exceeds 1 per request and
        // subsequent messages don't trigger the ping sound.
        const isRecipientOfRequest = conv.is_request === true && conv.admin_id === userId;
        const unread = isRecipientOfRequest ? Math.min(raw || 0, 1) : (raw || 0);
        return sum + unread;
      }, 0);
      setTotalUnread(prev => {
        // Fire callback only when count genuinely increases (new message arrived)
        if (prevTotalRef.current !== null && total > prev && onNewMessage) {
          onNewMessage();
        }
        prevTotalRef.current = total;
        return total;
      });
    }
  }, [userId, onNewMessage]);

  // Fetch initial count
  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  // Subscribe to changes
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`unread:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const conv = payload.new as { customer_id?: string; admin_id?: string } | null;
          // Only refetch if this conversation involves the current user
          if (conv && (conv.customer_id === userId || conv.admin_id === userId)) {
            fetchUnread();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, fetchUnread]);

  return totalUnread;
}
