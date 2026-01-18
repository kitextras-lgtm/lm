import { useState, useEffect, useRef } from 'react';
import { Plus, X, Youtube, Instagram, Music2, Twitter, Twitch, Link2, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AnimatedLinkIcon } from './AnimatedLinkIcon';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_name: string;
  channel_description: string;
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

interface CustomDropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  platformIcons: { [key: string]: any };
}

function CustomDropdown({ value, options, onChange, platformIcons }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedIcon = platformIcons[value] || Link2;
  const SelectedIcon = selectedIcon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
        style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div className="flex items-center gap-2">
          <SelectedIcon 
            className="w-4 h-4 transition-all duration-200 group-hover:scale-110" 
            style={{ color: '#F8FAFC' }} 
          />
          <span className="transition-all duration-200">{value}</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${isOpen ? 'rotate-180' : ''}`} 
          style={{ color: '#94A3B8' }} 
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg shadow-xl overflow-hidden animate-fade-in-down"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const Icon = platformIcons[option] || Link2;
              const isSelected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-sm transition-all duration-200 flex items-center gap-2 group/option relative"
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                    }
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div className="relative group/icon">
                    <Icon 
                      className="w-4 h-4 transition-all duration-300 group-hover/option:scale-125 group-hover/option:rotate-12 group-hover/icon:scale-150 group-hover/icon:rotate-180" 
                      style={{ color: '#F8FAFC' }} 
                    />
                    <div className="absolute inset-0 w-4 h-4 rounded-full opacity-0 group-hover/icon:opacity-20 group-hover/icon:scale-150 transition-all duration-300" style={{ backgroundColor: '#F8FAFC' }}></div>
                  </div>
                  <span className="transition-all duration-200">{option}</span>
                  {isSelected && (
                    <span className="ml-auto text-xs transition-all duration-200" style={{ color: '#94A3B8' }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface SocialLinksFormProps {
  appliedTheme?: string;
  userType?: 'artist' | 'creator' | 'business';
}

export function SocialLinksForm({ appliedTheme, userType }: SocialLinksFormProps) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({
    platform: 'YouTube',
    url: '',
    display_name: '',
    channel_description: '',
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

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    // Remove leading/trailing whitespace and trailing slashes
    normalized = normalized.replace(/\/+$/, '');
    
    // Ensure it starts with https:// or http://
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized;
    }
    
    return normalized;
  };

  const handleAddLink = async () => {
    if (!newLink.url.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const normalizedUrl = normalizeUrl(newLink.url);

      // Check if URL already exists
      const { data: existingLinks, error: checkError } = await supabase
        .from('social_links')
        .select('id')
        .eq('url', normalizedUrl)
        .limit(1);

      if (existingLinks && existingLinks.length > 0) {
        alert('This link has already been registered by another user. Please use a different link.');
        return;
      }

      const insertData: any = {
        user_id: user.id,
        platform: newLink.platform,
        url: normalizedUrl,
        display_name: newLink.display_name.trim() || newLink.platform,
      };

      // Only include channel_description for creator accounts
      if (userType === 'creator') {
        insertData.channel_description = newLink.channel_description.trim();
      }

      const { error } = await supabase
        .from('social_links')
        .insert(insertData);

      if (error) {
        // Check if it's a unique constraint violation
        if (error.code === '23505') {
          alert('This link has already been registered by another user. Please use a different link.');
        } else {
          throw error;
        }
        return;
      }

      await loadLinks();
      setNewLink({ platform: 'YouTube', url: '', display_name: '', channel_description: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding link:', error);
      // Error already handled above if it's a duplicate
      if (error && typeof error === 'object' && 'code' in error && error.code !== '23505') {
        alert('Error adding link. Please try again.');
      }
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
      <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <div className="text-center" style={{ color: '#94A3B8' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#F8FAFC' }}>My Social Links</h3>
        {!isAdding && userType !== 'artist' && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 border"
            style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Link</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="mb-5 p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'transparent' }}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                Platform
              </label>
              <CustomDropdown
                value={newLink.platform}
                options={platformOptions}
                onChange={(value) => setNewLink({ ...newLink, platform: value })}
                platformIcons={platformIcons}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                URL
              </label>
              <input
                type="text"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 border"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
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
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 border"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>

            {userType === 'creator' && (
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: '#94A3B8' }}>
                  Channel Description (optional)
                </label>
                <textarea
                  value={newLink.channel_description}
                  onChange={(e) => setNewLink({ ...newLink, channel_description: e.target.value })}
                  placeholder="Describe your channel content, style, or what makes it unique..."
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 border resize-none"
                  style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 pt-2">
              <button
                onClick={handleAddLink}
                className="flex-1 px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewLink({ platform: 'YouTube', url: '', display_name: '', channel_description: '' });
                }}
                className="px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-90 border"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
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
            {userType === 'artist' ? (
              <p className="text-xs sm:text-sm" style={{ color: '#64748B' }}>
                Accounts from distribution will up here
              </p>
            ) : (
              userType === 'creator' || userType === 'business' ? null : (
                <p className="text-xs sm:text-sm" style={{ color: '#64748B' }}>
                  Distribute to get started
                </p>
              )
            )}
          </div>
        ) : (
          links.map((link) => {
            const Icon = platformIcons[link.platform] || Link2;
            return (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-200 hover:brightness-105"
                style={{ backgroundColor: 'transparent' }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#F8FAFC' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-medium truncate" style={{ color: '#F8FAFC' }}>
                      {link.display_name || link.platform}
                    </div>
                    <div className="text-xs sm:text-sm truncate" style={{ color: '#64748B' }}>
                      {link.url.replace(/^https?:\/\//i, '')}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteLink(link.id)}
                  className="ml-2 p-2 rounded-lg transition-all duration-200 hover:brightness-110 flex-shrink-0"
                  style={{ backgroundColor: 'transparent', color: '#64748B' }}
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
