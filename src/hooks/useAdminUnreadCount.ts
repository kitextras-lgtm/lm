import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminUnreadCount() {
  const [totalUnread, setTotalUnread] = useState(0);

  const fetchUnread = useCallback(async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('unread_count_admin')
      .gt('unread_count_admin', 0);

    if (!error && data) {
      const total = data.reduce((sum, conv) => sum + (conv.unread_count_admin || 0), 0);
      setTotalUnread(total);
    }
  }, []);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread]);

  useEffect(() => {
    const subscription = supabase
      .channel('admin-unread-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUnread]);

  return totalUnread;
}
