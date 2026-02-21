// Fix 5: NewMessageModal - Instagram/X pattern
import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import { DEFAULT_AVATAR_DATA_URI } from '../DefaultAvatar';

interface User {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  role?: string;
}

// Instagram/X pattern: User data for starting conversation
export interface StartConversationUser {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: StartConversationUser) => void;
  currentUserId: string;
  userType?: 'artist' | 'creator' | 'freelancer' | 'business';
}

export function NewMessageModal({ isOpen, onClose, onSelectUser, currentUserId, userType }: NewMessageModalProps) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Fix 5: Search users using unified_users view
  useEffect(() => {
    const searchUsers = async () => {
      // Strip @ symbol if user types it
      const cleanQuery = searchQuery.trim().replace(/^@/, '').toLowerCase();
      
      // Don't show any users if no search query - user must search for specific username
      if (!cleanQuery) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fix 3: Use unified_users view for consistent data
        // Artists can only message support, creators/business can message creators/businesses/support (not artists)
        let query = supabase
          .from('unified_users')
          .select('id, display_name, username, avatar_url')
          .neq('id', currentUserId)
          .eq('username', cleanQuery);

        // Artists can only see admin/support accounts
        if (userType === 'artist') {
          query = query.eq('is_admin', true);
        } else {
          // Creators and businesses can see other creators/businesses and support, but not artists
          query = query.not('user_type', 'eq', 'artist');
        }

        const { data: exactMatch, error: exactError } = await query.limit(1);

        if (!exactError && exactMatch && exactMatch.length > 0) {
          setUsers(exactMatch.map(u => ({
            id: u.id,
            name: u.display_name || 'Unknown',
            username: u.username || '',
            avatar_url: u.avatar_url
          })));
        } else {
          setUsers([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error searching users:', err);
        setUsers([]);
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, currentUserId, userType]);

  // Clear selection when search query changes
  useEffect(() => {
    // Clear any selected users when the search query changes
    setSelectedUsers([]);
  }, [searchQuery]);

  const toggleUserSelection = (user: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const handleChat = () => {
    if (selectedUsers.length > 0) {
      const user = selectedUsers[0];
      // Convert User to StartConversationUser format
      onSelectUser({
        id: user.id,
        username: user.username,
        display_name: user.name,
        avatar_url: user.avatar_url,
      });
      // Close modal - state will reset on next mount
      onClose();
      setSearchQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => {
        onClose();
        setSearchQuery('');
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--bg-primary)', maxHeight: '80vh', border: '1px solid var(--border-default)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div className="w-8" />
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t('messages.newMessage')}</h2>
          <button 
            onClick={() => {
              onClose();
              setSearchQuery('');
            }}
            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('messages.to')}</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                // Clear selection when typing
                setSelectedUsers([]);
              }}
              placeholder={t('messages.searchPlaceholder')}
              className="w-full bg-transparent text-sm focus:outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
          {loading ? (
            <div className="p-4 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('messages.searching')}</p>
            </div>
          ) : !searchQuery.trim() ? (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('messages.enterUsername')}</p>
            </div>
          ) : (
            <>
              <p className="px-4 py-2 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                {t('messages.results')}
              </p>
              {users.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('messages.noUsersFound')}</p>
                </div>
              ) : (
                users.map(user => {
                  const isSelected = selectedUsers.some(u => u.id === user.id);
                  return (
                    <button
                      key={user.id}
                      onClick={() => toggleUserSelection(user)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                    >
                      <img
                        src={user.avatar_url || DEFAULT_AVATAR_DATA_URI}
                        alt={user.name}
                        className="w-11 h-11 rounded-full object-cover"
                        style={{ backgroundColor: 'var(--bg-elevated)' }}
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                          {user.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {user.username}
                        </p>
                      </div>
                      <div 
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ 
                          borderColor: isSelected ? 'var(--text-primary)' : 'var(--border-default)',
                          backgroundColor: isSelected ? 'var(--text-primary)' : 'transparent'
                        }}
                      >
                        {isSelected && (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}
        </div>

        {/* Chat Button */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border-default)' }}>
          <button
            onClick={handleChat}
            disabled={selectedUsers.length === 0}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: selectedUsers.length > 0 ? 'var(--text-primary)' : 'var(--bg-elevated)',
              color: selectedUsers.length > 0 ? 'var(--bg-primary)' : 'var(--text-primary)'
            }}
          >
            {t('messages.chat')}
          </button>
        </div>
      </div>
    </div>
  );
}
