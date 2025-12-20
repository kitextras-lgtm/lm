import { useState, useEffect } from 'react';
import { Plus, X, Youtube, Instagram, Music2, Twitter, Twitch, Link2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AnimatedLinkIcon } from './AnimatedLinkIcon';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_name: string;
}

const platformIcons: { [key: string]: any } = {
  YouTube: Youtube,
  Instagram: Instagram,
  TikTok: Music2,
  Twitter: Twitter,
  Twitch: Twitch,
  Other: Link2,
};

const platformOptions = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'Twitch', 'Other'];

export function SocialLinksForm() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({
    platform: 'YouTube',
    url: '',
    display_name: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLink = async () => {
    if (!newLink.url.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('social_links')
        .insert({
          user_id: user.id,
          platform: newLink.platform,
          url: newLink.url.trim(),
          display_name: newLink.display_name.trim() || newLink.platform,
        });

      if (error) throw error;

      await loadLinks();
      setNewLink({ platform: 'YouTube', url: '', display_name: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#1a1a1e' }}>
        <div className="text-center" style={{ color: '#94A3B8' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7" style={{ backgroundColor: '#1a1a1e' }}>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#F8FAFC' }}>My Social Links</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
            style={{ backgroundColor: '#111111', color: '#F8FAFC' }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Link</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-5 p-4 sm:p-5 rounded-xl" style={{ backgroundColor: '#111111' }}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                Platform
              </label>
              <select
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC' }}
              >
                {platformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                URL
              </label>
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC' }}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                Display Name (optional)
              </label>
              <input
                type="text"
                value={newLink.display_name}
                onChange={(e) => setNewLink({ ...newLink, display_name: e.target.value })}
                placeholder="My Channel"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC' }}
              />
            </div>

            <div className="flex gap-2 sm:gap-3 pt-2">
              <button
                onClick={handleAddLink}
                className="flex-1 px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: '#F8FAFC', color: '#111111' }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewLink({ platform: 'YouTube', url: '', display_name: '' });
                }}
                className="px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-90"
                style={{ backgroundColor: '#111111', color: '#F8FAFC' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {links.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <AnimatedLinkIcon />
            <p className="text-sm sm:text-base font-medium mb-1" style={{ color: '#F8FAFC' }}>
              No links added yet
            </p>
            <p className="text-xs sm:text-sm" style={{ color: '#64748B' }}>
              Add your social media links to get started
            </p>
          </div>
        ) : (
          links.map((link) => {
            const Icon = platformIcons[link.platform] || Link2;
            return (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-200 hover:brightness-105"
                style={{ backgroundColor: '#111111' }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#1a1a1e' }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#F8FAFC' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-medium truncate" style={{ color: '#F8FAFC' }}>
                      {link.display_name || link.platform}
                    </div>
                    <div className="text-xs sm:text-sm truncate" style={{ color: '#64748B' }}>
                      {link.url}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="ml-2 p-2 rounded-lg transition-all duration-200 hover:brightness-110 flex-shrink-0"
                  style={{ backgroundColor: '#1a1a1e', color: '#64748B' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
