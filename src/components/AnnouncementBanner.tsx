import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  is_read?: boolean;
  announcement_type?: 'normal' | 'serious';
  target_audience?: 'all' | 'creators' | 'artists' | 'businesses' | 'freelancers';
}

interface AnnouncementBannerProps {
  userId: string | null;
  userType?: 'creator' | 'artist' | 'business' | 'freelancer'; // Which dashboard is showing this
}

// Type assertion for fetchpriority (it's valid HTML but TypeScript doesn't recognize it yet)
declare module 'react' {
  interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}

// Get dismissed announcement IDs from localStorage
const getDismissedAnnouncementIds = (userId: string): Set<string> => {
  try {
    const key = `dismissed_announcements_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

// Save dismissed announcement ID to localStorage
const saveDismissedAnnouncementId = (userId: string, announcementId: string) => {
  try {
    const key = `dismissed_announcements_${userId}`;
    const dismissed = getDismissedAnnouncementIds(userId);
    dismissed.add(announcementId);
    localStorage.setItem(key, JSON.stringify([...dismissed]));
  } catch (error) {
    console.error('Error saving dismissed announcement:', error);
  }
};

export function AnnouncementBanner({ userId, userType = 'creator' }: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        // Get locally dismissed announcement IDs
        const dismissedIds = getDismissedAnnouncementIds(userId);
        
        // Fetch announcements for this user: either user-specific (user_id = userId) or all-user (user_id IS NULL)
        const { data, error } = await supabase
          .from('announcements')
          .select('id, title, content, created_at, is_read, announcement_type, target_audience')
          .or(`user_id.eq.${userId},user_id.is.null`)
          .eq('is_read', false) // Only fetch unread announcements
          .order('created_at', { ascending: false })
          .limit(10); // Fetch more to filter

        if (error) throw error;
        
        // Filter by target audience and dismissed status on the client side
        const filteredData = (data || []).filter((announcement) => {
          // Skip if already dismissed locally
          if (dismissedIds.has(announcement.id)) return false;
          
          const audience = announcement.target_audience || 'all';
          // Show if: targeting all, OR targeting this user type
          if (audience === 'all') return true;
          if (audience === 'creators' && userType === 'creator') return true;
          if (audience === 'artists' && userType === 'artist') return true;
          if (audience === 'businesses' && userType === 'business') return true;
          if (audience === 'freelancers' && userType === 'freelancer') return true;
          return false;
        }).slice(0, 5); // Limit to 5 after filtering
        
        setAnnouncements(filteredData);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setAnnouncements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    // Subscribe to real-time updates for ALL announcements
    // We filter in the callback since real-time doesn't support IS NULL filters well
    const channel = supabase
      .channel(`announcements-${userId}-${userType}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
        },
        (payload) => {
          const newAnnouncement = payload.new as { user_id: string | null; target_audience?: string };
          // Only refetch if this announcement is for this user or for all users
          // AND if it's targeting this user type
          const audience = newAnnouncement.target_audience || 'all';
          const isForThisAudience = audience === 'all' ||
            (audience === 'creators' && userType === 'creator') ||
            (audience === 'artists' && userType === 'artist') ||
            (audience === 'businesses' && userType === 'business') ||
            (audience === 'freelancers' && userType === 'freelancer');
          
          if ((newAnnouncement.user_id === null || newAnnouncement.user_id === userId) && isForThisAudience) {
            console.log('📢 New announcement received in real-time:', payload);
            fetchAnnouncements();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'announcements',
        },
        (payload) => {
          const updatedAnnouncement = payload.new as { user_id: string | null };
          if (updatedAnnouncement.user_id === null || updatedAnnouncement.user_id === userId) {
            fetchAnnouncements();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'announcements',
        },
        () => {
          fetchAnnouncements();
        }
      )
      .subscribe((status) => {
        console.log('📢 Announcements subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userType]);

  const handleDismiss = async (announcementId: string) => {
    // Immediately remove from UI
    setAnnouncements((prev) => prev.filter((a) => a.id !== announcementId));
    
    // Save to localStorage so it stays dismissed on refresh
    if (userId) {
      saveDismissedAnnouncementId(userId, announcementId);
    }
    
    try {
      // Also mark as read in database (for user-specific announcements)
      await supabase
        .from('announcements')
        .update({ is_read: true })
        .eq('id', announcementId);
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

  const isSerious = latestAnnouncement.announcement_type === 'serious';

  return (
    <div className="mb-4 animate-fade-in">
      <div
        className="rounded-xl px-4 py-3 border relative"
        style={{
          backgroundColor: isSerious ? 'rgba(239, 68, 68, 0.1)' : '#111111',
          borderColor: isSerious ? 'rgba(239, 68, 68, 0.4)' : '#2f2f2f',
        }}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-1.5" style={{ color: isSerious ? '#ef4444' : '#F8FAFC' }}>
              {isSerious && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ef4444' }} />}
              {latestAnnouncement.title}
            </h3>
            <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: isSerious ? '#F8FAFC' : '#94A3B8' }}>
              {latestAnnouncement.content}
            </p>
          </div>
          <button
            onClick={() => handleDismiss(latestAnnouncement.id)}
            className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: isSerious ? 'rgba(239, 68, 68, 0.2)' : '#0f0f13',
              color: isSerious ? '#ef4444' : '#94A3B8',
            }}
            aria-label="Dismiss announcement"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

