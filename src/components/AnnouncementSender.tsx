import React, { useState, useEffect, useRef } from 'react';
import { Send, AlertTriangle, Users, User, Loader2, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { debounce } from '../utils/debounce';

interface AnnouncementSenderProps {
  adminId: string;
  onClose?: () => void;
}

interface UserSuggestion {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
}

export function AnnouncementSender({ adminId, onClose }: AnnouncementSenderProps) {
  const [sendToAll, setSendToAll] = useState(true);
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleSend = async () => {
    if (!title.trim() || !content.trim()) {
      setSendResult({ success: false, message: 'Please fill in both title and content' });
      return;
    }

    if (!sendToAll && !username.trim()) {
      setSendResult({ success: false, message: 'Please enter a username or select "Send to all users"' });
      return;
    }

    setIsSending(true);
    setSendResult(null);
    setIsLookingUp(true);

    try {
      let profileId: string | null = null;

      // If sending to specific user, look up their profile ID by username
      if (!sendToAll && username.trim()) {
        // First, get the user by username from the users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('username', username.trim())
          .single();

        if (userError || !userData) {
          throw new Error(`User with username "${username.trim()}" not found`);
        }

        // Then, get the profile ID that matches the user ID
        // Note: Assuming profiles.id matches users.id (auth.users(id))
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userData.id)
          .single();

        if (profileError || !profileData) {
          throw new Error(`Profile not found for user "${username.trim()}"`);
        }

        profileId = profileData.id;
      }

      setIsLookingUp(false);

      const announcementData = {
        admin_id: adminId,
        user_id: sendToAll ? null : profileId,
        title: title.trim(),
        content: content.trim(),
      };

      const { data, error } = await supabase
        .from('announcements')
        .insert(announcementData)
        .select();

      if (error) throw error;

      setSendResult({
        success: true,
        message: sendToAll 
          ? 'Announcement sent to all users successfully' 
          : `Announcement sent to user @${username.trim()} successfully`,
      });
      
      // Clear form on success
      setTitle('');
      setContent('');
      setUsername('');
      setUserSuggestions([]);
      setShowSuggestions(false);
      setSendToAll(true);
    } catch (error: any) {
      setIsLookingUp(false);
      setSendResult({
        success: false,
        message: error.message || 'Failed to send announcement',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1a1a1e' }}>
            <AlertTriangle className="w-5 h-5" style={{ color: '#F8FAFC' }} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: '#F8FAFC' }}>Send Announcement</h2>
            <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>
              Send announcements to all users or specific users
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Send To Toggle */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
          <label className="block text-sm font-medium mb-4" style={{ color: '#94A3B8' }}>
            Recipients
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setSendToAll(true);
                setUsername('');
                setUserSuggestions([]);
                setShowSuggestions(false);
              }}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                sendToAll ? '' : 'hover:brightness-110'
              }`}
              style={{
                backgroundColor: sendToAll ? '#0f0f13' : 'transparent',
                color: '#F8FAFC',
                border: sendToAll ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
              }}
            >
              <Users className="w-4 h-4" />
              Send to all users
            </button>
            <button
              onClick={() => {
                setSendToAll(false);
                setUserSuggestions([]);
                setShowSuggestions(false);
              }}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                !sendToAll ? '' : 'hover:brightness-110'
              }`}
              style={{
                backgroundColor: !sendToAll ? '#0f0f13' : 'transparent',
                color: '#F8FAFC',
                border: !sendToAll ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
              }}
            >
              <User className="w-4 h-4" />
              Send to specific user
            </button>
          </div>
        </div>

        {/* Username Field (only shown when not sending to all) */}
        {!sendToAll && (
          <div className="rounded-2xl p-6 shadow-xl relative" style={{ backgroundColor: '#1a1a1e' }}>
            <label className="block text-sm font-medium mb-3" style={{ color: '#94A3B8' }}>
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4" style={{ color: '#64748B' }} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onFocus={() => {
                  if (userSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="Type username to search..."
                className="w-full h-12 pl-10 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: '#F8FAFC',
                  background: '#0f0f13',
                  border: '1px solid rgba(75, 85, 99, 0.2)',
                }}
                disabled={isSending}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#64748B' }} />
                </div>
              )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && userSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-6 right-6 mt-2 rounded-xl shadow-2xl border z-50 max-h-64 overflow-y-auto"
                style={{
                  backgroundColor: '#1a1a1e',
                  borderColor: 'rgba(75, 85, 99, 0.2)',
                }}
              >
                {userSuggestions.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full px-4 py-3 text-left hover:brightness-110 transition-all flex items-center gap-3 border-b last:border-b-0"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: 'rgba(75, 85, 99, 0.1)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: '#F8FAFC' }}>
                        @{user.username}
                      </div>
                      {user.full_name && (
                        <div className="text-xs truncate mt-0.5" style={{ color: '#94A3B8' }}>
                          {user.full_name}
                        </div>
                      )}
                      <div className="text-xs truncate mt-0.5" style={{ color: '#64748B' }}>
                        {user.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {showSuggestions && username.trim().length >= 2 && !isSearching && userSuggestions.length === 0 && (
              <div
                className="absolute left-6 right-6 mt-2 rounded-xl shadow-2xl border p-4 text-center"
                style={{
                  backgroundColor: '#1a1a1e',
                  borderColor: 'rgba(75, 85, 99, 0.2)',
                }}
              >
                <p className="text-sm" style={{ color: '#94A3B8' }}>No users found</p>
              </div>
            )}
          </div>
        )}

        {/* Title Input */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
          <label className="block text-sm font-medium mb-3" style={{ color: '#94A3B8' }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="w-full h-12 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
            style={{
              color: '#F8FAFC',
              background: '#0f0f13',
              border: '1px solid rgba(75, 85, 99, 0.2)',
            }}
            disabled={isSending}
          />
        </div>

        {/* Content Textarea */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
          <label className="block text-sm font-medium mb-3" style={{ color: '#94A3B8' }}>
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Notification content"
            rows={8}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none"
            style={{
              color: '#F8FAFC',
              background: '#0f0f13',
              border: '1px solid rgba(75, 85, 99, 0.2)',
            }}
            disabled={isSending}
          />
        </div>

        {/* Send Result */}
        {sendResult && (
          <div
            className={`rounded-2xl p-4 border ${
              sendResult.success ? 'border-green-500/30' : 'border-red-500/30'
            }`}
            style={{
              backgroundColor: sendResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <div className="flex items-start gap-3">
              {sendResult.success ? (
                <Send className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#10b981' }} />
              ) : (
                <X className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: sendResult.success ? '#10b981' : '#ef4444' }}>
                  {sendResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex gap-4">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: '#1a1a1e',
                color: '#F8FAFC',
                border: '1px solid rgba(75, 85, 99, 0.2)',
              }}
              disabled={isSending}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={isSending || !title.trim() || !content.trim() || (!sendToAll && !username.trim())}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#F8FAFC',
              color: '#000000',
            }}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isLookingUp ? 'Looking up user...' : 'Sending...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Announcement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

