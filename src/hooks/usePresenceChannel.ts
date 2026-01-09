// Fix 24: Online Presence Hook (using Supabase Presence)

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function usePresenceChannel(currentUserId: string) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUserId) return;

    // Join presence channel
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set(Object.keys(state));
        setOnlineUsers(online);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => new Set([...prev, key]));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    // Update last_seen on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        channel.track({
          user_id: currentUserId,
          online_at: new Date().toISOString(),
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Heartbeat to keep presence alive
    const heartbeat = setInterval(() => {
      if (document.visibilityState === 'visible') {
        channel.track({
          user_id: currentUserId,
          online_at: new Date().toISOString(),
        });
      }
    }, 30000); // Every 30 seconds

    return () => {
      channel.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(heartbeat);
    };
  }, [currentUserId]);

  const isOnline = useCallback((userId: string) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  return { onlineUsers, isOnline };
}

// Update last_seen in database periodically
export async function updateLastSeen(userId: string) {
  await supabase
    .from('profiles')
    .update({ 
      is_online: true,
      last_seen: new Date().toISOString() 
    })
    .eq('id', userId);
}
