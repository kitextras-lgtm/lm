import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Returns the number of unique conversations that have at least 1 unread message.
 * Used for the sidebar Messages badge — each conversation counts as 1 regardless
 * of how many messages it contains. The per-message total is handled by useUnreadCount.
 */
export function useUniqueSenderCount(userId: string) {
  const [uniqueCount, setUniqueCount] = useState(0);
  const prevCountRef = useRef<number | null>(null);

  const fetchUnique = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('conversations')
      .select('customer_id, admin_id, unread_count_customer, unread_count_admin, is_request')
      .or(`customer_id.eq.${userId},admin_id.eq.${userId}`);

    if (!error && data) {
      const count = data.filter(conv => {
        const raw = conv.customer_id === userId
          ? conv.unread_count_customer
          : conv.unread_count_admin;
        const isRecipientOfRequest = conv.is_request === true && conv.admin_id === userId;
        const unread = isRecipientOfRequest ? Math.min(raw || 0, 1) : (raw || 0);
        return unread > 0;
      }).length;

      setUniqueCount(() => {
        prevCountRef.current = count;
        return count;
      });
    }
  }, [userId]);

  useEffect(() => {
    fetchUnique();
  }, [fetchUnique]);

  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`unique-unread:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        (payload) => {
          const conv = payload.new as { customer_id?: string; admin_id?: string } | null;
          if (conv && (conv.customer_id === userId || conv.admin_id === userId)) {
            fetchUnique();
          }
        }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [userId, fetchUnique]);

  return uniqueCount;
}
