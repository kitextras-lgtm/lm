import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { debounce } from '../utils/debounce';
import { useTheme } from '../contexts/ThemeContext';

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

type AnnouncementType = 'normal' | 'serious';
type TargetAudience = 'all' | 'creators' | 'artists' | 'businesses' | 'freelancers';

interface SentAnnouncement {
  id: string;
  title: string;
  message: string;
  announcement_type: string;
  target_audience: string;
  status: string;
  sent_at: string;
  created_at: string;
}

export function AnnouncementSender({ adminId, onClose }: AnnouncementSenderProps) {
  const { tokens } = useTheme();
  const [sendToAll, setSendToAll] = useState(true);
  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [announcementType, setAnnouncementType] = useState<AnnouncementType>('normal');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('all');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [sentAnnouncements, setSentAnnouncements] = useState<SentAnnouncement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchSentAnnouncements = useCallback(async () => {
    setLoadingAnnouncements(true);
    try {
      const { data, error } = await supabase
        .from('admin_announcements')
        .select('id, title, message, announcement_type, target_audience, status, sent_at, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error) setSentAnnouncements(data || []);
    } catch (e) {
      console.error('Error fetching announcements:', e);
    } finally {
      setLoadingAnnouncements(false);
    }
  }, []);

  useEffect(() => {
    fetchSentAnnouncements();
  }, [fetchSentAnnouncements]);

  const handleDeleteAnnouncement = async (id: string) => {
    setDeletingId(id);
    try {
      await supabase.from('admin_announcements').delete().eq('id', id);
      setSentAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (e) {
      console.error('Error deleting announcement:', e);
    } finally {
      setDeletingId(null);
    }
  };

  // Debounced search function
  const searchUsers = useCallback(
    debounce(async (query: string) => {
      if (query.trim().length < 2) {
        setUserSuggestions([]);
        setShowSuggestions(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, username, email, full_name')
          .ilike('username', `%${query}%`)
          .limit(5);

        if (error) throw error;
        setUserSuggestions(data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching users:', error);
        setUserSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    searchUsers(value);
  };

  const handleSelectUser = (user: UserSuggestion) => {
    setUsername(user.username);
    setShowSuggestions(false);
    setUserSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        created_by: adminId,
        title: title.trim(),
        message: content.trim(),
        announcement_type: announcementType,
        target_audience: sendToAll ? targetAudience : 'all', // Only apply audience filter for broadcast
        status: 'sent',
        sent_at: new Date().toISOString(),
      };

      // First, insert into admin_announcements for tracking
      const { error: adminError } = await supabase
        .from('admin_announcements')
        .insert(announcementData);

      if (adminError) throw adminError;

      // For broadcast announcements (all or targeted audience), insert a single row with user_id=null.
      // AnnouncementBanner already filters by target_audience client-side, so this is sufficient.
      if (sendToAll) {
        const { error: insertError } = await supabase
          .from('announcements')
          .insert({
            admin_id: adminId,
            user_id: null,
            title: title.trim(),
            content: content.trim(),
            announcement_type: announcementType,
            target_audience: targetAudience,
            is_read: false,
          });

        if (insertError) throw insertError;
      } else if (!sendToAll && profileId) {
        // Send to specific user
        const { error: insertError } = await supabase
          .from('announcements')
          .insert({
            admin_id: adminId,
            user_id: profileId,
            title: title.trim(),
            content: content.trim(),
            announcement_type: announcementType,
            target_audience: 'all',
            is_read: false,
          });

        if (insertError) throw insertError;
      }

      const audienceLabel = targetAudience === 'all' ? 'all users' : targetAudience === 'businesses' ? 'business users' : `${targetAudience}s`;
      setSendResult({
        success: true,
        message: sendToAll 
          ? `${announcementType === 'serious' ? '🚨 Serious' : '📢 Normal'} announcement sent to ${audienceLabel} successfully` 
          : `Announcement sent to user @${username.trim()} successfully`,
      });
      
      // Clear form on success
      setTitle('');
      setContent('');
      setUsername('');
      setUserSuggestions([]);
      setShowSuggestions(false);
      setSendToAll(true);
      setAnnouncementType('normal');
      setTargetAudience('all');
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
    <div>
      <div className="space-y-4">
        {/* Announcement Type */}
        <div className="rounded-xl p-4" style={{ backgroundColor: tokens.bg.card }}>
          <label className="block text-sm font-medium mb-3" style={{ color: tokens.text.primary, opacity: 0.6 }}>
            Announcement Type
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setAnnouncementType('normal')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                announcementType === 'normal' ? '' : 'hover:brightness-110'
              }`}
              style={{
                backgroundColor: announcementType === 'normal' ? tokens.bg.elevated : 'transparent',
                color: 'var(--text-primary)',
                border: announcementType === 'normal' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
              Normal
            </button>
            <button
              onClick={() => setAnnouncementType('serious')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                announcementType === 'serious' ? '' : 'hover:brightness-110'
              }`}
              style={{
                backgroundColor: announcementType === 'serious' ? tokens.bg.elevated : 'transparent',
                color: 'var(--text-primary)',
                border: announcementType === 'serious' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Serious
            </button>
          </div>
        </div>

        {/* Send To Toggle */}
        <div className="rounded-xl p-4" style={{ backgroundColor: tokens.bg.card }}>
          <label className="block text-sm font-medium mb-3" style={{ color: tokens.text.primary, opacity: 0.6 }}>
            Recipients
          </label>
          <div className="flex gap-3">
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
                backgroundColor: sendToAll ? tokens.bg.elevated : 'transparent',
                color: 'var(--text-primary)',
                border: sendToAll ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              Broadcast
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
                backgroundColor: !sendToAll ? tokens.bg.elevated : 'transparent',
                color: 'var(--text-primary)',
                border: !sendToAll ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
              }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Specific User
            </button>
          </div>
        </div>

        {/* Target Audience (only shown when broadcasting) */}
        {sendToAll && (
          <div className="rounded-xl p-4" style={{ backgroundColor: tokens.bg.card }}>
            <label className="block text-sm font-medium mb-3" style={{ color: tokens.text.primary, opacity: 0.6 }}>
              Target Audience
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setTargetAudience('all')}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'all' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'all' ? tokens.bg.elevated : 'transparent',
                  color: 'var(--text-primary)',
                  border: targetAudience === 'all' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                All Users
              </button>
              <button
                onClick={() => setTargetAudience('creators')}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'creators' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'creators' ? tokens.bg.elevated : 'transparent',
                  color: 'var(--text-primary)',
                  border: targetAudience === 'creators' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="6" width="8" height="12" rx="2"/><path d="M10 6H6a2 2 0 00-2 2v8a2 2 0 002 2h4"/><path d="M14 12H10"/></svg>
                Creators
              </button>
              <button
                onClick={() => setTargetAudience('artists')}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'artists' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'artists' ? tokens.bg.elevated : 'transparent',
                  color: 'var(--text-primary)',
                  border: targetAudience === 'artists' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                Artists
              </button>
              <button
                onClick={() => setTargetAudience('businesses')}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'businesses' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'businesses' ? tokens.bg.elevated : 'transparent',
                  color: 'var(--text-primary)',
                  border: targetAudience === 'businesses' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                Business
              </button>
              <button
                onClick={() => setTargetAudience('freelancers')}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'freelancers' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'freelancers' ? tokens.bg.elevated : 'transparent',
                  color: 'var(--text-primary)',
                  border: targetAudience === 'freelancers' ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
                }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
                Freelancers
              </button>
            </div>
          </div>
        )}

        {/* Username Field (only shown when not sending to all) */}
        {!sendToAll && (
          <div className="rounded-2xl p-6 shadow-xl relative" style={{ backgroundColor: tokens.bg.card }}>
            <label className="block text-sm font-medium mb-3" style={{ color: tokens.text.primary, opacity: 0.6 }}>
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ color: tokens.text.primary, opacity: 0.5 }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                onFocus={e => {
                  if (userSuggestions.length > 0) setShowSuggestions(true);
                  e.currentTarget.style.borderColor = 'var(--text-primary)';
                }}
                onBlur={e => e.currentTarget.style.borderColor = tokens.border.default}
                placeholder="Type username to search..."
                className="w-full h-12 pl-10 pr-4 rounded-xl text-sm focus:outline-none transition-all"
                style={{
                  color: tokens.text.primary,
                  background: tokens.bg.input,
                  border: `1px solid ${tokens.border.default}`,
                }}
                disabled={isSending}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: tokens.text.primary, opacity: 0.5 }}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>
                </div>
              )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && userSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-6 right-6 mt-2 rounded-xl shadow-2xl border z-50 max-h-64 overflow-y-auto"
                style={{
                  backgroundColor: tokens.bg.card,
                  borderColor: tokens.border.default,
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
                      <div className="text-sm font-semibold truncate" style={{ color: tokens.text.primary }}>
                        @{user.username}
                      </div>
                      {user.full_name && (
                        <div className="text-xs truncate mt-0.5" style={{ color: tokens.text.primary, opacity: 0.6 }}>
                          {user.full_name}
                        </div>
                      )}
                      <div className="text-xs truncate mt-0.5" style={{ color: tokens.text.primary, opacity: 0.4 }}>
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
                  backgroundColor: tokens.bg.card,
                  borderColor: tokens.border.default,
                }}
              >
                <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.5 }}>No users found</p>
              </div>
            )}
          </div>
        )}

        {/* Title Input */}
        <div className="rounded-xl p-4" style={{ backgroundColor: tokens.bg.card }}>
          <label className="block text-sm font-medium mb-3" style={{ color: tokens.text.primary, opacity: 0.6 }}>
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="w-full h-12 px-4 rounded-xl text-sm focus:outline-none transition-all"
            style={{
              color: 'var(--text-primary)',
              background: tokens.bg.input,
              border: `1px solid ${tokens.border.default}`,
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
            onBlur={e => e.currentTarget.style.borderColor = tokens.border.default}
            disabled={isSending}
          />
        </div>

        {/* Content Textarea */}
        <div className="rounded-xl p-4" style={{ backgroundColor: tokens.bg.card }}>
          <label className="block text-sm font-medium mb-3" style={{ color: tokens.text.primary, opacity: 0.6 }}>
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Notification content"
            rows={8}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none"
            style={{
              color: 'var(--text-primary)',
              background: tokens.bg.input,
              border: `1px solid ${tokens.border.default}`,
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
            onBlur={e => e.currentTarget.style.borderColor = tokens.border.default}
            disabled={isSending}
          />
        </div>

        {/* Send Result */}
        {sendResult && (
          <div
            className="rounded-2xl p-4 border"
            style={{
              backgroundColor: tokens.bg.card,
              borderColor: tokens.border.default,
            }}
          >
            <div className="flex items-start gap-3">
              {sendResult.success ? (
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><path d="M20 6L9 17l-5-5"/></svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: tokens.text.primary }}><path d="M18 6L6 18M6 6l12 12"/></svg>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: tokens.text.primary }}>
                  {sendResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Send Button */}
        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: tokens.bg.card,
                color: tokens.text.primary,
                border: `1px solid ${tokens.border.default}`,
              }}
              disabled={isSending}
            >
              Cancel
            </button>
          )}
          <button
            onClick={async () => { await handleSend(); fetchSentAnnouncements(); }}
            disabled={isSending || !title.trim() || !content.trim() || (!sendToAll && !username.trim())}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-primary)',
            }}
          >
            {isSending ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>
                {isLookingUp ? 'Looking up user...' : 'Sending...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>
                Send Announcement
              </>
            )}
          </button>
        </div>

        {/* Sent Announcements List */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: tokens.text.primary }}>Sent Announcements</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary }}>
              {sentAnnouncements.length}
            </span>
          </div>
          <div className="h-px mb-6" style={{ backgroundColor: tokens.border.subtle }} />
          {loadingAnnouncements ? (
            <div className="flex items-center justify-center py-8">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: tokens.text.primary, opacity: 0.5 }}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>
            </div>
          ) : sentAnnouncements.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: tokens.text.primary, opacity: 0.4 }}>No announcements sent yet</p>
          ) : (
            <div className="space-y-3">
              {sentAnnouncements.map((ann) => {
                const isSerious = ann.announcement_type === 'serious';
                const audienceLabel: Record<string, string> = {
                  all: 'All Users', creators: 'Creators', artists: 'Artists',
                  businesses: 'Business', freelancers: 'Freelancers',
                };
                return (
                  <div
                    key={ann.id}
                    className="rounded-xl p-4 border flex items-start gap-4"
                    style={{
                      backgroundColor: tokens.bg.card,
                      borderColor: tokens.border.default,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {isSerious && <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
                        <span className="text-sm font-semibold truncate" style={{ color: tokens.text.primary }}>
                          {ann.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: tokens.bg.active, color: tokens.text.primary }}>
                          {audienceLabel[ann.target_audience] || ann.target_audience}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: tokens.text.primary, opacity: 0.6 }}>
                        {ann.message}
                      </p>
                      <p className="text-xs mt-1.5" style={{ color: tokens.text.primary, opacity: 0.4 }}>
                        {new Date(ann.sent_at || ann.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      disabled={deletingId === ann.id}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-40"
                      style={{ backgroundColor: tokens.bg.card, border: `1px solid ${tokens.border.subtle}`, color: tokens.text.primary }}
                      title="Delete announcement"
                    >
                      {deletingId === ann.id
                        ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>
                        : <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

