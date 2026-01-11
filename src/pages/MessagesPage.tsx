import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { EditIcon } from '../components/EditIcon';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ChatWindow, UserListItem, ConversationListSkeleton, ChatWindowSkeleton, NewMessageModal } from '../components/chat';
import { useCustomerConversations, usePresence, getOrCreateAdminConversation } from '../hooks/useChat';
import { supabase } from '../lib/supabase';
import type { Conversation, Profile } from '../types/chat';
import { debounce } from '../utils/debounce';

type FilterType = 'all' | 'unread' | 'pinned';

interface MessagesPageProps {
  currentUserId: string;
  backgroundTheme?: 'light' | 'grey' | 'dark';
  userType?: 'artist' | 'creator' | 'business';
}

export function MessagesPage({ currentUserId, backgroundTheme = 'dark', userType }: MessagesPageProps) {
  // Get cached user profile for username display
  const { profile: cachedProfile, isLoading: profileLoading } = useUserProfile();

  // Fix 1: Use enhanced hook with selection locking + Instagram/X pattern
  const {
    conversations,
    loading,
    updateConversationUnreadCount,
    refetch,
    selectConversation: hookSelectConversation,
    // Instagram/X pattern
    pendingConversation,
    startConversationWith,
    sendMessageToConversation,
    clearPendingConversation,
  } = useCustomerConversations(currentUserId);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { admin: Profile }) | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [initializing, setInitializing] = useState(true);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);

  usePresence(currentUserId);

  // Compute display name from users table (via useUserProfile)
  const displayUsername = useMemo(() => {
    // Priority: username > first_name > email prefix > 'Messages'
    if (cachedProfile?.username) return cachedProfile.username;
    if (cachedProfile?.first_name) return cachedProfile.first_name;
    if (cachedProfile?.email) return cachedProfile.email.split('@')[0];
    // Show empty while loading, 'Messages' as final fallback
    return profileLoading ? '' : 'Messages';
  }, [cachedProfile, profileLoading]);

  // Safety check to prevent modal opening for artists
  const handleNewMessageClick = () => {
    if (userType === 'artist') return;
    setIsNewMessageModalOpen(true);
  };

  // Instagram/X pattern: Cancel pending conversation on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && pendingConversation) {
        clearPendingConversation();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [pendingConversation, clearPendingConversation]);

  // Fix 4: Selection is now handled by the hook with localStorage persistence
  // No need to manually save to localStorage here - hookSelectConversation handles it

  // Fix 4: Proper conversation selection on load
  // Auto-create Team Elevate conversation for every user
  useEffect(() => {
    const initializeConversation = async () => {
      if (!loading && currentUserId) {
        const isMobile = window.innerWidth < 1024;
        
        if (conversations.length > 0) {
          // Try to restore last conversation from localStorage
          const lastConvId = localStorage.getItem(`lastConversation_${currentUserId}`);
          if (lastConvId) {
            const lastConv = conversations.find(c => c.id === lastConvId);
            if (lastConv) {
              setSelectedConversation(lastConv);
              hookSelectConversation(lastConvId);
              setInitializing(false);
              return;
            }
          }
          
          // No last conversation found, select first conversation (desktop only)
          if (!isMobile) {
            setSelectedConversation(conversations[0]);
            hookSelectConversation(conversations[0].id);
          }
        } else {
          // No conversations exist - create Team Elevate conversation
          console.log('No conversations found, creating Team Elevate conversation...');
          const adminConv = await getOrCreateAdminConversation(currentUserId);
          if (adminConv) {
            // The conversation will be added to the list automatically by the hook
            console.log('Team Elevate conversation created:', adminConv.id);
          }
        }
        setInitializing(false);
      }
    };

    initializeConversation();
  }, [currentUserId, loading, conversations.length, hookSelectConversation, getOrCreateAdminConversation]);

  const debouncedSearch = useMemo(
    () => debounce((value: string) => setDebouncedSearchQuery(value), 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Ensure admin conversation is always selected when conversations load (desktop only)
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;

    if (!initializing && conversations.length > 0 && !selectedConversation && !isMobile) {
      const adminConv = conversations[0];
      setSelectedConversation(adminConv);

      if (adminConv.unread_count_customer > 0) {
        supabase
          .from('conversations')
          .update({ unread_count_customer: 0 })
          .eq('id', adminConv.id)
          .catch((error) => console.error('Error marking conversation as read:', error));
      }
    } else if (!initializing && conversations.length > 0 && selectedConversation) {
      const updatedConv = conversations.find(c => c.id === selectedConversation.id);
      if (updatedConv) {
        setSelectedConversation(updatedConv);
      } else if (!isMobile) {
        setSelectedConversation(conversations[0]);
      }
    }
  }, [conversations, initializing, selectedConversation]);

  const filteredConversations = useMemo(() => {
    let convs = [...conversations];

    if (selectedConversation && !convs.find(c => c.id === selectedConversation.id)) {
      convs = [selectedConversation, ...convs];
    }

    const filtered = convs.filter((conv) => {
      if (!conv.admin) {
        return false;
      }

      if (debouncedSearchQuery.trim()) {
        const adminName = conv.admin.name?.toLowerCase() || '';
        if (!adminName.includes(debouncedSearchQuery.toLowerCase())) {
          return false;
        }
      }

      if (filter === 'unread') {
        return conv.unread_count_customer > 0;
      }

      if (filter === 'pinned') {
        return conv.is_pinned === true;
      }

      return true;
    });

    return filtered;
  }, [conversations, selectedConversation, debouncedSearchQuery, filter]);

  const getSenderName = useCallback(
    (senderId: string) => {
      if (senderId === currentUserId) {
        return customerProfile?.name || 'You';
      }
      return selectedConversation?.admin?.name || 'Support';
    },
    [customerProfile, selectedConversation, currentUserId]
  );

  const handleSelectConversation = async (conv: Conversation & { admin: Profile }) => {
    // Instagram/X pattern: Clear pending conversation when selecting existing
    clearPendingConversation();
    
    // Fix 1: Lock selection to prevent race conditions
    hookSelectConversation(conv.id, true);
    setSelectedConversation(conv);
    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
      setShowChatOnMobile(true);
      setShowSidebar(false);
    } else {
      setShowSidebar(false);
    }

    if (conv.unread_count_customer > 0) {
      updateConversationUnreadCount(conv.id, 0);

      try {
        await supabase
          .from('conversations')
          .update({ unread_count_customer: 0 })
          .eq('id', conv.id);
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    }
  };

  const handleBackToConversations = () => {
    setShowChatOnMobile(false);
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

  if (isMobile && showChatOnMobile && selectedConversation) {
    return (
      <div className="flex flex-col w-full" style={{ backgroundColor: 'var(--bg-primary)', height: '100%', maxHeight: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-1 min-h-0">
          {selectedConversation.admin && (
            <ChatWindow
              key={selectedConversation.id}
              conversation={selectedConversation}
              otherUser={selectedConversation.admin}
              currentUserId={currentUserId}
              getSenderName={getSenderName}
              backgroundTheme={backgroundTheme}
              onBack={handleBackToConversations}
              showBackButton={true}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row rounded-2xl w-full shadow-2xl" style={{ backgroundColor: 'var(--bg-primary)', height: '100%', maxHeight: '100%', border: '1px solid var(--border-default)', overflow: 'hidden', display: 'flex' }}>
      {/* Mobile header */}
      {isMobile && (
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-primary)' }}>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {displayUsername}
          </span>
          {userType !== 'artist' && (
            <EditIcon
              onClick={handleNewMessageClick}
              className="p-2 rounded-lg transition-colors"
            />
          )}
        </div>
      )}

      {/* Mobile Conversations List */}
      {isMobile && (
        <div className="lg:hidden flex flex-col flex-1 min-h-0 overflow-hidden" style={{ overflow: 'hidden' }}>
          <div className="p-3 pb-3" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)', backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000' }}>
            <div className="relative mb-3 lg:mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                aria-label="Search conversations"
                className="w-full pl-9 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                style={{
                  backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000',
                  border: '1px solid rgba(75, 85, 99, 0.25)',
                  color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC',
                }}
              />
            </div>

            {userType !== 'artist' && (
              <div className="flex gap-1.5 lg:gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`flex-1 px-3 lg:px-4 py-1.5 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
                    filter === 'all' ? '' : 'hover:brightness-110 active:scale-[0.98]'
                  }`}
                  style={filter === 'all' ? { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC', boxShadow: '0 1px 2px rgba(148, 163, 184, 0.2)' } : { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8', border: '1px solid transparent' }}
                >
                  Primary
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`flex-1 px-3 lg:px-4 py-1.5 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
                    filter === 'unread' ? '' : 'hover:brightness-110 active:scale-[0.98]'
                  }`}
                  style={filter === 'unread' ? { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC', boxShadow: '0 1px 2px rgba(148, 163, 184, 0.2)' } : { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8', border: '1px solid transparent' }}
                >
                  General
                </button>
                <button
                  onClick={() => setFilter('pinned')}
                  className={`flex-1 px-3 lg:px-4 py-1.5 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
                    filter === 'pinned' ? '' : 'hover:brightness-110 active:scale-[0.98]'
                  }`}
                  style={filter === 'pinned' ? { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC', boxShadow: '0 1px 2px rgba(148, 163, 184, 0.2)' } : { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8', border: '1px solid transparent' }}
                >
                  Requests
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent', WebkitOverflowScrolling: 'touch' }}>
            {showConversationSkeletons ? (
              <ConversationListSkeleton count={4} />
            ) : filteredConversations.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000' }}>
                  <MessageSquare className="w-8 h-8" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }} />
                </div>
                {userType === 'artist' ? (
                  <>
                    <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No messages yet</p>
                    <p className="text-xs mt-1" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }}>Our support team will reach out to you here when needed.</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No conversations found</p>
                    <p className="text-xs mt-1" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }}>Start a conversation to get help</p>
                  </>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => (
                conv.admin && (
                  <UserListItem
                    key={conv.id}
                    user={conv.admin}
                    conversation={conv}
                    isActive={selectedConversation?.id === conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    onPin={handlePinConversation}
                    unreadCount={conv.unread_count_customer}
                    currentUserId={currentUserId}
                    backgroundTheme={backgroundTheme}
                  />
                )
              ))
            )}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-80 xl:w-96 min-h-0 flex-shrink-0 overflow-hidden border-r" style={{ borderRight: '1px solid rgba(75, 85, 99, 0.2)', backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', height: '100%' }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000' }}>
          <span className="text-xl font-bold" style={{ color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC' }}>
            {displayUsername}
          </span>
          {userType !== 'artist' && (
            <EditIcon
              onClick={handleNewMessageClick}
              className="p-2 rounded-lg transition-colors"
            />
          )}
        </div>

        <div className="px-5 pb-4" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)', backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000' }}>
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{
                backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000',
                border: '1px solid rgba(75, 85, 99, 0.25)',
                color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC',
              }}
            />
          </div>

          {userType !== 'artist' && (
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'all' ? '' : 'hover:brightness-110 active:scale-[0.98]'
                }`}
                style={filter === 'all' ? { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC', boxShadow: '0 1px 2px rgba(148, 163, 184, 0.2)' } : { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8', border: '1px solid transparent' }}
              >
                Primary
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'unread' ? '' : 'hover:brightness-110 active:scale-[0.98]'
                }`}
                style={filter === 'unread' ? { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC', boxShadow: '0 1px 2px rgba(148, 163, 184, 0.2)' } : { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8', border: '1px solid transparent' }}
              >
                General
              </button>
              <button
                onClick={() => setFilter('pinned')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === 'pinned' ? '' : 'hover:brightness-110 active:scale-[0.98]'
                }`}
                style={filter === 'pinned' ? { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC', boxShadow: '0 1px 2px rgba(148, 163, 184, 0.2)' } : { backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8', border: '1px solid transparent' }}
              >
                Requests
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent', WebkitOverflowScrolling: 'touch' }}>
          {showConversationSkeletons ? (
            <ConversationListSkeleton count={5} />
          ) : filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000' }}>
                <MessageSquare className="w-8 h-8" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }} />
              </div>
              {userType === 'artist' ? (
                <>
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No messages yet</p>
                  <p className="text-xs mt-1" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }}>Our support team will reach out to you here when needed.</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No conversations found</p>
                  <p className="text-xs mt-1" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }}>Start a conversation to get help</p>
                </>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              conv.admin && (
                <UserListItem
                  key={conv.id}
                  user={conv.admin}
                  conversation={conv}
                  isActive={selectedConversation?.id === conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  onPin={handlePinConversation}
                  unreadCount={conv.unread_count_customer}
                  currentUserId={currentUserId}
                  backgroundTheme={backgroundTheme}
                />
              )
            ))
          )}
        </div>
      </div>

      {/* Desktop Chat Window */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden" style={{ backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', height: '100%', overflow: 'hidden' }}>
        {pendingConversation ? (
          /* Instagram/X pattern: Show pending conversation UI */
          <ChatWindow
            key={`pending-${pendingConversation.recipientId}`}
            isPending={true}
            pendingRecipient={pendingConversation.recipientUser}
            currentUserId={currentUserId}
            getSenderName={getSenderName}
            backgroundTheme={backgroundTheme}
            onSendPendingMessage={async (content: string) => {
              const result = await sendMessageToConversation(null, content);
              if (result.newConversation) {
                // Use the returned conversation directly (not stale conversations array)
                setSelectedConversation(result.newConversation);
                hookSelectConversation(result.newConversation.id, true);
              }
            }}
            onCancelPending={clearPendingConversation}
          />
        ) : selectedConversation && selectedConversation.admin ? (
          <ChatWindow
            key={selectedConversation.id}
            conversation={selectedConversation}
            otherUser={selectedConversation.admin}
            currentUserId={currentUserId}
            getSenderName={getSenderName}
            onMarkAsRead={(convId) => updateConversationUnreadCount(convId, 0)}
            backgroundTheme={backgroundTheme}
          />
        ) : showChatSkeleton ? (
          <ChatWindowSkeleton />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#2A2A2E' : '#1a1a1e', border: '1px solid rgba(75, 85, 99, 0.1)' }}>
                <MessageSquare className="w-10 h-10" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC' }}>Select a conversation</h2>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Choose a support agent from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onSelectUser={async (user) => {
          setIsNewMessageModalOpen(false);
          // Instagram/X pattern: Start conversation (no DB write until first message)
          const result = await startConversationWith(user);
          if (result.type === 'existing' && result.conversation) {
            setSelectedConversation(result.conversation);
            setShowChatOnMobile(true);
          } else if (result.type === 'pending') {
            // Clear selected conversation - UI will show pending state
            setSelectedConversation(null);
            setShowChatOnMobile(true);
          }
        }}
        currentUserId={currentUserId}
        userType={userType}
      />
    </div>
  );
}
