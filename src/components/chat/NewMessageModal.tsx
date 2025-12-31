import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DEFAULT_AVATAR_DATA_URI } from '../DefaultAvatar';

interface User {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  role?: string;
}

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
  currentUserId: string;
}

export function NewMessageModal({ isOpen, onClose, onSelectUser, currentUserId }: NewMessageModalProps) {
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

  // Search users
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        // Load suggested users when no search query
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url')
            .neq('id', currentUserId)
            .limit(10);
          
          if (!error && data) {
            setUsers(data.map(u => ({
              id: u.id,
              name: u.name || 'Unknown',
              username: u.username || '',
              avatar_url: u.avatar_url
            })));
          }
        } catch (err) {
          console.error('Error loading users:', err);
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, username, avatar_url')
          .neq('id', currentUserId)
          .or(`username.ilike.%${searchQuery}%,name.ilike.%${searchQuery}%`)
          .limit(20);

        if (!error && data) {
          setUsers(data.map(u => ({
            id: u.id,
            name: u.name || 'Unknown',
            username: u.username || '',
            avatar_url: u.avatar_url
          })));
        }
      } catch (err) {
        console.error('Error searching users:', err);
      }
      setLoading(false);
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, currentUserId]);

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
      onSelectUser(selectedUsers[0]);
      onClose();
      setSelectedUsers([]);
      setSearchQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#111111', maxHeight: '80vh', border: '1px solid rgba(75, 85, 99, 0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
          <div className="w-8" />
          <h2 className="text-base font-semibold" style={{ color: '#F8FAFC' }}>New message</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
          </button>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)' }}>
          <span className="text-sm font-medium" style={{ color: '#F8FAFC' }}>To:</span>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent text-sm focus:outline-none"
              style={{ color: '#F8FAFC' }}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: '400px' }}>
          {loading ? (
            <div className="p-4 text-center">
              <p className="text-sm" style={{ color: '#64748B' }}>Loading...</p>
            </div>
          ) : (
            <>
              <p className="px-4 py-2 text-xs font-medium" style={{ color: '#64748B' }}>
                {searchQuery ? 'Results' : 'Suggested'}
              </p>
              {users.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm" style={{ color: '#64748B' }}>No users found</p>
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
                        style={{ backgroundColor: '#0f0f13' }}
                      />
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#F8FAFC' }}>
                          {user.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: '#64748B' }}>
                          {user.username}
                        </p>
                      </div>
                      <div 
                        className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{ 
                          borderColor: isSelected ? '#3B82F6' : 'rgba(75, 85, 99, 0.4)',
                          backgroundColor: isSelected ? '#3B82F6' : 'transparent'
                        }}
                      >
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="p-4" style={{ borderTop: '1px solid rgba(75, 85, 99, 0.2)' }}>
          <button
            onClick={handleChat}
            disabled={selectedUsers.length === 0}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ 
              backgroundColor: selectedUsers.length > 0 ? '#3B82F6' : 'rgba(59, 130, 246, 0.5)',
              color: '#FFFFFF'
            }}
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}
