import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, AlertTriangle, Users, User, Loader2, X, Search, Palette, Music, AlertCircle, Bell, Trash2, Briefcase } from 'lucide-react';
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
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated }}>
            <AlertTriangle className="w-5 h-5" style={{ color: tokens.text.primary }} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: tokens.text.primary }}>Send Announcement</h2>
            <p className="text-sm sm:text-base" style={{ color: tokens.text.secondary }}>
              Send announcements to all users or specific users
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Announcement Type */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: tokens.bg.elevated }}>
          <label className="block text-sm font-medium mb-4" style={{ color: tokens.text.secondary }}>
            Announcement Type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setAnnouncementType('normal')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                announcementType === 'normal' ? '' : 'hover:brightness-110'
              }`}
              style={{
                backgroundColor: announcementType === 'normal' ? tokens.bg.active : 'transparent',
                color: '#F8FAFC',
                border: announcementType === 'normal' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
              }}
            >
              <Bell className="w-4 h-4" />
              Normal
            </button>
            <button
              onClick={() => setAnnouncementType('serious')}
              className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                announcementType === 'serious' ? '' : 'hover:brightness-110'
              }`}
              style={{
                backgroundColor: announcementType === 'serious' ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                color: announcementType === 'serious' ? '#ef4444' : '#F8FAFC',
                border: announcementType === 'serious' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(75, 85, 99, 0.2)',
              }}
            >
              <AlertCircle className="w-4 h-4" />
              Serious
            </button>
          </div>
        </div>

        {/* Send To Toggle */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: tokens.bg.elevated }}>
          <label className="block text-sm font-medium mb-4" style={{ color: tokens.text.secondary }}>
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
                backgroundColor: sendToAll ? tokens.bg.active : 'transparent',
                color: '#F8FAFC',
                border: sendToAll ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
              }}
            >
              <Users className="w-4 h-4" />
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
                backgroundColor: !sendToAll ? tokens.bg.active : 'transparent',
                color: '#F8FAFC',
                border: !sendToAll ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
              }}
            >
              <User className="w-4 h-4" />
              Specific User
            </button>
          </div>
        </div>

        {/* Target Audience (only shown when broadcasting) */}
        {sendToAll && (
          <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: tokens.bg.elevated }}>
            <label className="block text-sm font-medium mb-4" style={{ color: tokens.text.secondary }}>
              Target Audience
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setTargetAudience('all')}
                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'all' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'all' ? tokens.bg.active : 'transparent',
                  color: '#F8FAFC',
                  border: targetAudience === 'all' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
                }}
              >
                <Users className="w-4 h-4" />
                All Users
              </button>
              <button
                onClick={() => setTargetAudience('creators')}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'creators' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'creators' ? tokens.bg.active : 'transparent',
                  color: '#F8FAFC',
                  border: targetAudience === 'creators' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
                }}
              >
                <Palette className="w-4 h-4" />
                Creators
              </button>
              <button
                onClick={() => setTargetAudience('artists')}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'artists' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'artists' ? tokens.bg.active : 'transparent',
                  color: '#F8FAFC',
                  border: targetAudience === 'artists' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
                }}
              >
                <Music className="w-4 h-4" />
                Artists
              </button>
              <button
                onClick={() => setTargetAudience('businesses')}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'businesses' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'businesses' ? tokens.bg.active : 'transparent',
                  color: '#F8FAFC',
                  border: targetAudience === 'businesses' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
                }}
              >
                <User className="w-4 h-4" />
                Business
              </button>
              <button
                onClick={() => setTargetAudience('freelancers')}
                className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  targetAudience === 'freelancers' ? '' : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: targetAudience === 'freelancers' ? tokens.bg.active : 'transparent',
                  color: '#F8FAFC',
                  border: targetAudience === 'freelancers' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.2)',
                }}
              >
                <Briefcase className="w-4 h-4" />
                Freelancers
              </button>
            </div>
          </div>
        )}

        {/* Username Field (only shown when not sending to all) */}
        {!sendToAll && (
          <div className="rounded-2xl p-6 shadow-xl relative" style={{ backgroundColor: tokens.bg.elevated }}>
            <label className="block text-sm font-medium mb-3" style={{ color: tokens.text.secondary }}>
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search className="w-4 h-4" style={{ color: tokens.text.muted }} />
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
                  color: tokens.text.primary,
                  background: tokens.bg.input,
                  border: `1px solid ${tokens.border.default}`,
                }}
                disabled={isSending}
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: tokens.text.muted }} />
                </div>
              )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && userSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-6 right-6 mt-2 rounded-xl shadow-2xl border z-50 max-h-64 overflow-y-auto"
                style={{
                  backgroundColor: tokens.bg.elevated,
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
                        <div className="text-xs truncate mt-0.5" style={{ color: tokens.text.secondary }}>
                          {user.full_name}
                        </div>
                      )}
                      <div className="text-xs truncate mt-0.5" style={{ color: tokens.text.muted }}>
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
                  backgroundColor: tokens.bg.elevated,
                  borderColor: tokens.border.default,
                }}
              >
                <p className="text-sm" style={{ color: tokens.text.secondary }}>No users found</p>
              </div>
            )}
          </div>
        )}

        {/* Title Input */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: tokens.bg.elevated }}>
          <label className="block text-sm font-medium mb-3" style={{ color: tokens.text.secondary }}>
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
              background: tokens.bg.input,
              border: '1px solid rgba(75, 85, 99, 0.2)',
            }}
            disabled={isSending}
          />
        </div>

        {/* Content Textarea */}
        <div className="rounded-2xl p-6 shadow-xl" style={{ backgroundColor: tokens.bg.elevated }}>
          <label className="block text-sm font-medium mb-3" style={{ color: tokens.text.secondary }}>
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
              background: tokens.bg.input,
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
                backgroundColor: tokens.bg.elevated,
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

        {/* Sent Announcements List */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: tokens.text.primary }}>Sent Announcements</h3>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: tokens.bg.active, color: tokens.text.muted }}>
              {sentAnnouncements.length}
            </span>
          </div>
          <div className="h-px mb-6" style={{ backgroundColor: tokens.border.subtle }} />
          {loadingAnnouncements ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: tokens.text.muted }} />
            </div>
          ) : sentAnnouncements.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: tokens.text.muted }}>No announcements sent yet</p>
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
                      backgroundColor: isSerious ? 'rgba(239,68,68,0.07)' : tokens.bg.elevated,
                      borderColor: isSerious ? 'rgba(239,68,68,0.25)' : tokens.border.default,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {isSerious && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#ef4444' }} />}
                        <span className="text-sm font-semibold truncate" style={{ color: isSerious ? '#ef4444' : tokens.text.primary }}>
                          {ann.title}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: tokens.bg.active, color: tokens.text.muted }}>
                          {audienceLabel[ann.target_audience] || ann.target_audience}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed line-clamp-2" style={{ color: tokens.text.secondary }}>
                        {ann.message}
                      </p>
                      <p className="text-xs mt-1.5" style={{ color: tokens.text.muted }}>
                        {new Date(ann.sent_at || ann.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      disabled={deletingId === ann.id}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-40"
                      style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                      title="Delete announcement"
                    >
                      {deletingId === ann.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />}
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

