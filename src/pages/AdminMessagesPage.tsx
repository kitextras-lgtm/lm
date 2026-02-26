import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChatWindow, UserListItem, ConversationListSkeleton, ChatWindowSkeleton } from '../components/chat';
import { useAdminConversations, usePresence, useProfile } from '../hooks/useChat';
import { supabase } from '../lib/supabase';
import type { Conversation, Profile } from '../types/chat';
import { debounce } from '../utils/debounce';
import { useTheme } from '../contexts/ThemeContext';


type UserType = 'artist' | 'creator' | 'freelancer' | 'business';

function AccountTypeIcon({ userType, size = 14 }: { userType: UserType; size?: number }) {
  const s = size;
  if (userType === 'artist') {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: s, height: s, flexShrink: 0 }}>
        <path d="M12 28C12 20.268 18.268 14 26 14H22C29.732 14 36 20.268 36 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <rect x="8" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="32" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="10" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
        <rect x="34" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>
    );
  }
  if (userType === 'creator') {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: s, height: s, flexShrink: 0 }}>
        <rect x="14" y="6" width="20" height="36" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="20" y="9" width="8" height="2" rx="1" fill="currentColor" opacity="0.4"/>
        <rect x="21" y="38" width="6" height="2" rx="1" fill="currentColor" opacity="0.4"/>
        <rect x="16" y="14" width="10" height="8" rx="2" fill="currentColor" opacity="0.2"/>
        <path d="M20 16L23 18L20 20V16Z" fill="currentColor" opacity="0.8"/>
        <rect x="26" y="14" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8"/>
        <circle cx="30" cy="18" r="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
        <circle cx="32.5" cy="15.5" r="0.8" fill="currentColor" opacity="0.6"/>
      </svg>
    );
  }
  if (userType === 'freelancer') {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: s, height: s, flexShrink: 0 }}>
        <rect x="12" y="10" width="24" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="21" y="20" width="6" height="24" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="22" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="22" y1="37" x2="26" y2="37" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (userType === 'business') {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: s, height: s, flexShrink: 0 }}>
        <rect x="6" y="18" width="36" height="22" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M18 18V14C18 12.8954 18.8954 12 20 12H28C29.1046 12 30 12.8954 30 14V18" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="6" y="18" width="36" height="8" rx="3" stroke="currentColor" strokeWidth="2" fill="black"/>
        <rect x="21" y="24" width="6" height="4" rx="1" fill="currentColor"/>
      </svg>
    );
  }
  return null;
}

interface AdminMessagesPageProps {
  currentAdminId: string;
}

export function AdminMessagesPage({ currentAdminId }: AdminMessagesPageProps) {
  const { tokens, theme } = useTheme();
  const { conversations, loading } = useAdminConversations(currentAdminId);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { customer: Profile }) | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState<'primary' | 'general' | 'requests'>('primary');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'artist' | 'creator' | 'freelancer' | 'business'>('all');
  const { profile: adminProfile } = useProfile(currentAdminId);

  usePresence(currentAdminId);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearchQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    const initializeConversation = async () => {
      if (!loading && currentAdminId) {
        const isMobile = window.innerWidth < 1024;
        
        if (conversations.length > 0) {
          // Try to restore last conversation from localStorage
          const lastConvId = localStorage.getItem(`lastConversation_${currentAdminId}`);
          if (lastConvId) {
            const lastConv = conversations.find(c => c.id === lastConvId);
            if (lastConv) {
              setSelectedConversation(lastConv);
              // Mark conversation as read if it has unread messages
              if (lastConv.unread_count_admin > 0) {
                const { error } = await supabase
                  .from('conversations')
                  .update({ unread_count_admin: 0 })
                  .eq('id', lastConv.id);
                if (error) console.error('Error marking conversation as read:', error);
              }
              setInitializing(false);
              return;
            }
          }
          
          // No last conversation found, select first conversation (desktop only)
          if (!isMobile) {
            const firstConv = conversations[0];
            setSelectedConversation(firstConv);
            // Mark first conversation as read if it has unread messages
            if (firstConv.unread_count_admin > 0) {
              const { error } = await supabase
                .from('conversations')
                .update({ unread_count_admin: 0 })
                .eq('id', firstConv.id);
              if (error) console.error('Error marking conversation as read:', error);
            }
          }
        }
        setInitializing(false);
      }
    };

    initializeConversation();
  }, [currentAdminId, loading, conversations.length]);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conv) => {
        if (!conv.customer) return false;
        const matchesSearch = conv.customer.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
        const matchesType = activeTypeFilter === 'all' || conv.customer.user_type === activeTypeFilter;
        return matchesSearch && matchesType;
      }),
    [conversations, debouncedSearchQuery, activeTypeFilter]
  );

  const getSenderName = useCallback(
    (senderId: string) => {
      if (senderId === currentAdminId) {
        return adminProfile?.name || 'You';
      }
      return selectedConversation?.customer?.name || 'Customer';
    },
    [adminProfile, selectedConversation, currentAdminId]
  );

  const handleSelectConversation = async (conv: Conversation & { customer: Profile }) => {
    setSelectedConversation(conv);
    setShowSidebar(false);
    // Save selected conversation to localStorage
    localStorage.setItem(`lastConversation_${currentAdminId}`, conv.id);
    
    // Mark conversation as read when selected
    if (conv.unread_count_admin > 0) {
      try {
        await supabase
          .from('conversations')
          .update({ unread_count_admin: 0 })
          .eq('id', conv.id);
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    }
  };

  const handlePinConversation = async (conversationId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ is_pinned: isPinned })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error pinning conversation:', error);
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  const showConversationSkeletons = loading && conversations.length === 0;
  const showChatSkeleton = initializing && !selectedConversation;

  if (isMobile && selectedConversation) {
    return (
      <div className="flex flex-col w-full" style={{ backgroundColor: 'var(--bg-primary)', height: '100%', maxHeight: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-1 min-h-0">
          {selectedConversation.customer && (
            <ChatWindow
              key={selectedConversation.id}
              conversation={selectedConversation}
              otherUser={selectedConversation.customer}
              currentUserId={selectedConversation.admin_id || currentAdminId}
              getSenderName={getSenderName}
              backgroundTheme={theme}
              onBack={() => setShowSidebar(true)}
              showBackButton={true}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden rounded-2xl w-full shadow-2xl h-full" style={{ backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.default}` }}>
      <div
        className={`${
          showSidebar ? 'flex' : 'hidden lg:flex'
        } flex-col w-full lg:w-80 xl:w-96 min-h-0 flex-shrink-0 overflow-hidden`}
        style={{ borderRight: `1px solid ${tokens.border.default}`, backgroundColor: tokens.bg.primary }}
      >
        <div className="p-5 pb-4" style={{ borderBottom: `1px solid ${tokens.border.default}`, backgroundColor: tokens.bg.primary }}>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-1" style={{ color: tokens.text.primary }}>Messages</h2>
            <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.6 }}>Manage customer conversations</p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-0 mb-3" style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}>
            {(['primary', 'general', 'requests'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 px-3 py-2.5 text-sm font-medium transition-all relative"
                style={{
                  color: 'var(--text-primary)',
                  opacity: activeTab === tab ? 1 : 0.4,
                  background: 'none',
                  border: 'none',
                }}
              >
                {tab === 'primary' ? 'Primary' : tab === 'general' ? 'General' : 'Requests'}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--text-primary)' }} />
                )}
              </button>
            ))}
          </div>
          
          {/* Account Type Filter Bubbles */}
          <div className="flex gap-1.5 flex-wrap mb-3">
            {(['all', 'artist', 'creator', 'freelancer', 'business'] as const).map((type) => {
              const labels: Record<string, string> = { all: 'All', artist: 'Artists', creator: 'Creators', freelancer: 'Freelancers', business: 'Brands' };
              const isActive = activeTypeFilter === type;
              return (
                <button
                  key={type}
                  onClick={() => setActiveTypeFilter(type)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? 'var(--bg-elevated)' : 'transparent',
                    border: isActive ? '1px solid var(--text-primary)' : `1px solid ${tokens.border.subtle}`,
                    color: 'var(--text-primary)',
                  }}
                >
                  {type !== 'all' && <AccountTypeIcon userType={type} size={10} />}
                  {labels[type]}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" style={{ color: tokens.text.primary, opacity: 0.5 }}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              aria-label="Search customers"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
              style={{ 
                backgroundColor: tokens.bg.input, 
                border: `1px solid ${tokens.border.default}`,
                color: tokens.text.primary,
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
              onBlur={(e) => e.target.style.borderColor = tokens.border.default}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent' }}>
          {showConversationSkeletons ? (
            <ConversationListSkeleton count={4} backgroundTheme={theme} />
          ) : filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.35 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <p className="text-sm font-medium" style={{ color: tokens.text.primary }}>No conversations found</p>
              <p className="text-xs mt-1" style={{ color: tokens.text.primary, opacity: 0.5 }}>Customer conversations will appear here</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              conv.customer && (
                <UserListItem
                  key={conv.id}
                  user={conv.customer}
                  conversation={conv}
                  isActive={selectedConversation?.id === conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  onPin={handlePinConversation}
                  unreadCount={conv.unread_count_admin}
                  currentUserId={currentAdminId}
                />
              )
            ))
          )}
        </div>
      </div>

      <div className={`${!showSidebar ? 'flex' : 'hidden lg:flex'} flex-col flex-1 min-h-0 min-w-0 overflow-hidden`} style={{ backgroundColor: tokens.bg.primary }}>
        {selectedConversation && selectedConversation.customer ? (
          <ChatWindow
            key={selectedConversation.id}
            conversation={selectedConversation}
            otherUser={selectedConversation.customer}
            currentUserId={selectedConversation.admin_id || currentAdminId}
            getSenderName={getSenderName}
            backgroundTheme={theme}
          />
        ) : showChatSkeleton ? (
          <ChatWindowSkeleton backgroundTheme={theme} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.default}` }}>
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: tokens.text.primary, opacity: 0.35 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: tokens.text.primary }}>Select a conversation</h2>
              <p className="text-sm" style={{ color: tokens.text.primary, opacity: 0.6 }}>Choose a customer from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

