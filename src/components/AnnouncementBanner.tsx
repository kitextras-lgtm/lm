import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_read?: boolean;
}

interface AnnouncementBannerProps {
  userId: string | null;
}

// Type assertion for fetchpriority (it's valid HTML but TypeScript doesn't recognize it yet)
declare module 'react' {
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}

export function AnnouncementBanner({ userId }: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        // Fetch announcements for this user: either user-specific (user_id = userId) or all-user (user_id IS NULL)
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, content, created_at, is_read')
          .or(`user_id.eq.${userId},user_id.is.null`)
          .order('created_at', { ascending: false })
          .limit(5); // Show only the 5 most recent

        if (error) throw error;
        setAnnouncements(data || []);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('announcements-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchAnnouncements();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
          filter: 'user_id=is.null',
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDismiss = async (announcementId: string) => {
    try {
      // Mark as read (for user-specific announcements)
      await supabase
        .from('announcements')
        .update({ is_read: true })
        .eq('id', announcementId);

      // Remove from local state
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    } catch (error) {
      console.error('Error dismissing announcement:', error);
    }
  };

  if (loading || announcements.length === 0) {
    return null;
  }

  // Show only the most recent unread announcement
  const latestAnnouncement = announcements.find((a) => !a.is_read) || announcements[0];

  if (!latestAnnouncement) {
    return null;
  }

  return (
    <div className="mb-6 animate-fade-in">
      <div
        className="rounded-2xl p-5 border relative"
        style={{
          backgroundColor: '#1a1a1e',
          borderColor: 'rgba(148, 163, 184, 0.2)',
        }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0f0f13' }}>
            <AlertCircle className="w-5 h-5" style={{ color: '#F59E0B' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#F8FAFC' }}>
              {latestAnnouncement.title}
            </h3>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#94A3B8' }}>
              {latestAnnouncement.content}
            </p>
          </div>
          <button
            onClick={() => handleDismiss(latestAnnouncement.id)}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: '#0f0f13',
              color: '#94A3B8',
            }}
            aria-label="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

