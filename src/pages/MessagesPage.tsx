import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MessageSquare, ArrowLeft, PenSquare } from 'lucide-react';
import { useUserProfile } from '../contexts/UserProfileContext';
import { ChatWindow, UserListItem, ConversationListSkeleton, ChatWindowSkeleton, NewMessageModal } from '../components/chat';
import { useCustomerConversations, usePresence, useProfile, getOrCreateAdminConversation } from '../hooks/useChat';
import { supabase } from '../lib/supabase';
import type { Conversation, Profile } from '../types/chat';
import { debounce } from '../utils/debounce';

type FilterType = 'all' | 'unread' | 'pinned';

interface MessagesPageProps {
  currentUserId: string;
}

export function MessagesPage({ currentUserId }: MessagesPageProps) {
  console.log('🔵🔵🔵 [MessagesPage] COMPONENT RENDERED with currentUserId:', currentUserId);
  console.log('🔵🔵🔵 [MessagesPage] currentUserId type:', typeof currentUserId);
  console.log('🔵🔵🔵 [MessagesPage] currentUserId truthy?', !!currentUserId);
  
  // Get cached user profile for username display
  const { profile: cachedProfile } = useUserProfile();
  
  const { conversations, loading, updateConversationUnreadCount, refetch } = useCustomerConversations(currentUserId);
  
  console.log('🔵🔵🔵 [MessagesPage] Hook state:', {
    conversationsCount: conversations.length,
    loading,
    currentUserId,
    conversations: conversations.map(c => ({ id: c.id, adminName: c.admin?.name }))
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<(Conversation & { admin: Profile }) | null>(null);
  const [showSidebar, setShowSidebar] = useState(false); // Hide sidebar on mobile by default
  const [showChatOnMobile, setShowChatOnMobile] = useState(false); // Track if we're showing chat on mobile (vs list)
  const [filter, setFilter] = useState<FilterType>('all');
  const [initializing, setInitializing] = useState(true);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const { profile: customerProfile } = useProfile(currentUserId);

  usePresence(currentUserId);

  // Initialize: Only auto-select conversation on desktop, not mobile
  useEffect(() => {
    const initializeConversation = async () => {
      if (!loading && currentUserId) {
        try {
          console.log('[MessagesPage] Initializing admin conversation for:', currentUserId);
          // Always get or create admin conversation (for desktop)
          const conv = await getOrCreateAdminConversation(currentUserId);
          if (conv) {
            console.log('[MessagesPage] Admin conversation created/found:', {
              id: conv.id,
              hasAdmin: !!conv.admin,
              adminName: conv.admin?.name
            });
            
            // Set selected conversation first so it appears in filteredConversations
            const isMobile = window.innerWidth < 1024;
            if (!isMobile) {
              setSelectedConversation(conv);
            }
            
            // Refetch conversations to ensure the new conversation appears in the list
            await refetch();
            
            console.log('[MessagesPage] Conversation initialization complete');
          } else {
            console.error('[MessagesPage] Failed to get or create admin conversation - this usually means no admin profile exists with is_admin = true');
          }
        } catch (error) {
          console.error('[MessagesPage] Error initializing admin conversation:', error);
        } finally {
          setInitializing(false);
        }
      }
    };

    initializeConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, loading]);

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
    
    // If conversations loaded and we have one, select it on desktop
    if (!initializing && conversations.length > 0 && !selectedConversation && !isMobile) {
      // Always select the first conversation (admin conversation) on desktop
      const adminConv = conversations[0];
      setSelectedConversation(adminConv);
      
      // Mark conversation as read if it has unread messages
      if (adminConv.unread_count_customer > 0) {
        supabase
          .from('conversations')
          .update({ unread_count_customer: 0 })
          .eq('id', adminConv.id)
          .catch((error) => console.error('Error marking conversation as read:', error));
      }
    } 
    // If we have a selected conversation, update it with latest data from the list
    else if (!initializing && conversations.length > 0 && selectedConversation) {
      const updatedConv = conversations.find(c => c.id === selectedConversation.id);
      if (updatedConv) {
        setSelectedConversation(updatedConv);
      } else if (!isMobile) {
        // If selected conversation doesn't exist in list anymore, select the first one (desktop only)
        setSelectedConversation(conversations[0]);
      }
    }
    // If no conversations but we have a selectedConversation (from getOrCreateAdminConversation), ensure it stays selected
    else if (!initializing && conversations.length === 0 && selectedConversation && !isMobile) {
      // Keep the selected conversation even if it's not in the list yet
      // This handles the case where getOrCreateAdminConversation created it but refetch hasn't completed
      console.log('Keeping selected conversation even though conversations list is empty:', selectedConversation.id);
    }
  }, [conversations, initializing, selectedConversation]);

  const filteredConversations = useMemo(() => {
    // Start with conversations from the hook
    let convs = [...conversations];
    
    console.log('🔵🔵🔵 [MessagesPage] filteredConversations useMemo - initial state:', {
      conversationsLength: conversations.length,
      selectedConversationId: selectedConversation?.id,
      hasSelectedConversation: !!selectedConversation,
      conversationsWithAdmin: conversations.filter(c => !!c.admin).length,
      conversationsWithoutAdmin: conversations.filter(c => !c.admin).length
    });
    
    // If selectedConversation exists but is not in the list, add it
    // This ensures conversations created by getOrCreateAdminConversation appear immediately
    if (selectedConversation && !convs.find(c => c.id === selectedConversation.id)) {
      console.log('🔵🔵🔵 [MessagesPage] Adding selectedConversation to filtered list:', selectedConversation.id);
      convs = [selectedConversation, ...convs];
    }
    
    // Apply filters
    const filtered = convs.filter((conv) => {
      // Must have admin profile
      if (!conv.admin) {
        console.warn('🔵🔵🔵 [MessagesPage] ⚠️ Filtering out conversation (no admin profile):', {
          conversationId: conv.id,
          adminId: conv.admin_id,
          hasAdmin: !!conv.admin
        });
        return false;
      }
      
      // Search filter: match admin name (case-insensitive)
      // If search query is empty, match all conversations
      if (debouncedSearchQuery.trim()) {
        const adminName = conv.admin.name?.toLowerCase() || '';
        if (!adminName.includes(debouncedSearchQuery.toLowerCase())) {
          console.log('[MessagesPage] Filtering out conversation (search mismatch):', conv.id, adminName);
          return false;
        }
      }

      // Filter by unread status
      if (filter === 'unread') {
        return conv.unread_count_customer > 0;
      }
      
      // Filter by pinned status
      if (filter === 'pinned') {
        return conv.is_pinned === true;
      }
      
      // 'all' filter - show all conversations
      return true;
    });
    
    console.log('[MessagesPage] filteredConversations result:', {
      beforeFilter: convs.length,
      afterFilter: filtered.length,
      conversations: filtered.map(c => ({ id: c.id, adminName: c.admin?.name }))
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
    setSelectedConversation(conv);
    const isMobile = window.innerWidth < 1024;
    
    if (isMobile) {
      // On mobile, switch to chat view
      setShowChatOnMobile(true);
      setShowSidebar(false);
    } else {
      // On desktop, just close sidebar overlay if open
      setShowSidebar(false);
    }
    
    // Mark conversation as read when selected - optimistically update immediately
    if (conv.unread_count_customer > 0) {
      // Optimistically update the conversation list
      updateConversationUnreadCount(conv.id, 0);
      
      // Update database
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

  // Check if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  
  // Determine if we should show skeleton loaders (only for truly empty initial state)
  const showConversationSkeletons = loading && conversations.length === 0;
  const showChatSkeleton = initializing && !selectedConversation;
  
  console.log('[MessagesPage] Loading state check:', {
    loading,
    initializing,
    conversationsLength: conversations.length,
    selectedConversation: !!selectedConversation,
    isMobile,
    showConversationSkeletons,
    showChatSkeleton,
    currentUserId
  });
  
  if (isMobile && showChatOnMobile && selectedConversation) {
    // Mobile: Show chat view with back button
    return (
      <div className="flex flex-col rounded-2xl w-full shadow-2xl" style={{ backgroundColor: '#111111', height: '100%', maxHeight: '100%', border: '1px solid rgba(75, 85, 99, 0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile chat header with back button */}
        <div className="lg:hidden flex items-center gap-3 p-3 border-b" style={{ borderColor: 'rgba(75, 85, 99, 0.2)', backgroundColor: '#111111' }}>
          <button
            onClick={handleBackToConversations}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: '#F8FAFC' }}
            aria-label="Back to conversations"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-semibold" style={{ color: '#F8FAFC' }}>Messages</h2>
        </div>
        
        {/* Chat window */}
        <div className="flex-1 min-h-0">
          {selectedConversation.admin && (
            <ChatWindow
              key={selectedConversation.id}
              conversation={selectedConversation}
              otherUser={selectedConversation.admin}
              currentUserId={currentUserId}
              getSenderName={getSenderName}
            />
          )}
        </div>
      </div>
    );
  }

  // Mobile: Show conversations list (full page)
  // Desktop: Show sidebar + chat layout
  return (
    <div className="flex flex-col lg:flex-row rounded-2xl w-full shadow-2xl" style={{ backgroundColor: '#111111', height: '100%', maxHeight: '100%', border: '1px solid rgba(75, 85, 99, 0.1)', overflow: 'hidden', display: 'flex' }}>
      {/* Mobile header - only show when showing list */}
      {isMobile && (
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(75, 85, 99, 0.2)', backgroundColor: '#111111' }}>
          <span className="text-lg font-bold" style={{ color: '#F8FAFC' }}>
            {cachedProfile?.username || customerProfile?.name || 'Messages'}
          </span>
          <button 
            onClick={() => setIsNewMessageModalOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="New message"
          >
            <PenSquare className="w-5 h-5" style={{ color: '#F8FAFC' }} />
          </button>
        </div>
      )}

      {/* Mobile Conversations List - Full Page */}
      {isMobile && (
        <div className="lg:hidden flex flex-col flex-1 min-h-0 overflow-hidden" style={{ overflow: 'hidden' }}>
        <div className="p-3 pb-3" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)', backgroundColor: '#111111' }}>
          <div className="relative mb-3 lg:mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 lg:w-4 lg:h-4" style={{ color: '#64748B' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
              className="w-full pl-9 lg:pl-10 pr-3 lg:pr-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{ 
                backgroundColor: '#0f0f13', 
                border: '1px solid rgba(75, 85, 99, 0.25)',
                color: '#F8FAFC',
                focusRingColor: 'rgba(148, 163, 184, 0.3)'
              }}
            />
          </div>

          <div className="flex gap-1.5 lg:gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-3 lg:px-4 py-1.5 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? ''
                  : 'hover:brightness-110 active:scale-[0.98]'
              }`}
              style={filter === 'all' ? { backgroundColor: '#0f0f13', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: '#F8FAFC', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' } : { backgroundColor: '#0f0f13', color: '#64748B', border: '1px solid transparent' }}
            >
              Primary
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-3 lg:px-4 py-1.5 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
                filter === 'unread'
                  ? ''
                  : 'hover:brightness-110 active:scale-[0.98]'
              }`}
              style={filter === 'unread' ? { backgroundColor: '#0f0f13', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: '#F8FAFC', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' } : { backgroundColor: '#0f0f13', color: '#64748B', border: '1px solid transparent' }}
            >
              General
            </button>
            <button
              onClick={() => setFilter('pinned')}
              className={`flex-1 px-3 lg:px-4 py-1.5 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ${
                filter === 'pinned'
                  ? ''
                  : 'hover:brightness-110 active:scale-[0.98]'
              }`}
              style={filter === 'pinned' ? { backgroundColor: '#0f0f13', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: '#F8FAFC', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' } : { backgroundColor: '#0f0f13', color: '#64748B', border: '1px solid transparent' }}
            >
              Requests
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent' }}>
          {showConversationSkeletons ? (
            <ConversationListSkeleton count={4} />
          ) : filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0f0f13' }}>
                <MessageSquare className="w-8 h-8" style={{ color: '#64748B' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No conversations found</p>
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>Start a conversation to get help</p>
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
                />
              )
            ))
          )}
        </div>
        </div>
      )}

      {/* Desktop Sidebar - Always Visible */}
      <div className="hidden lg:flex flex-col w-80 xl:w-96 min-h-0 flex-shrink-0 overflow-hidden border-r" style={{ borderRight: '1px solid rgba(75, 85, 99, 0.2)', backgroundColor: '#111111', height: '100%' }}>
        {/* Username header with new chat button */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ backgroundColor: '#111111' }}>
          <span className="text-xl font-bold" style={{ color: '#F8FAFC' }}>
            {cachedProfile?.username || customerProfile?.name || 'Messages'}
          </span>
          <button 
            onClick={() => setIsNewMessageModalOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="New message"
          >
            <PenSquare className="w-5 h-5" style={{ color: '#F8FAFC' }} />
          </button>
        </div>
        
        <div className="px-5 pb-4" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)', backgroundColor: '#111111' }}>
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#64748B' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              aria-label="Search conversations"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{ 
                backgroundColor: '#0f0f13', 
                border: '1px solid rgba(75, 85, 99, 0.25)',
                color: '#F8FAFC',
                focusRingColor: 'rgba(148, 163, 184, 0.3)'
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? ''
                  : 'hover:brightness-110 active:scale-[0.98]'
              }`}
              style={filter === 'all' ? { backgroundColor: '#0f0f13', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: '#F8FAFC', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' } : { backgroundColor: '#0f0f13', color: '#64748B', border: '1px solid transparent' }}
            >
              Primary
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'unread'
                  ? ''
                  : 'hover:brightness-110 active:scale-[0.98]'
              }`}
              style={filter === 'unread' ? { backgroundColor: '#0f0f13', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: '#F8FAFC', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' } : { backgroundColor: '#0f0f13', color: '#64748B', border: '1px solid transparent' }}
            >
              General
            </button>
            <button
              onClick={() => setFilter('pinned')}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'pinned'
                  ? ''
                  : 'hover:brightness-110 active:scale-[0.98]'
              }`}
              style={filter === 'pinned' ? { backgroundColor: '#0f0f13', border: '1.5px solid rgba(148, 163, 184, 0.3)', color: '#F8FAFC', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)' } : { backgroundColor: '#0f0f13', color: '#64748B', border: '1px solid transparent' }}
            >
              Requests
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent' }}>
          {showConversationSkeletons ? (
            <ConversationListSkeleton count={5} />
          ) : filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0f0f13' }}>
                <MessageSquare className="w-8 h-8" style={{ color: '#64748B' }} />
              </div>
              <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>No conversations found</p>
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>Start a conversation to get help</p>
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
                />
              )
            ))
          )}
        </div>
      </div>

      {/* Desktop Chat Window */}
      <div className="hidden lg:flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden" style={{ backgroundColor: '#111111', height: '100%', overflow: 'hidden' }}>
        {selectedConversation && selectedConversation.admin ? (
          <ChatWindow
            key={selectedConversation.id}
            conversation={selectedConversation}
            otherUser={selectedConversation.admin}
            currentUserId={currentUserId}
            getSenderName={getSenderName}
            onMarkAsRead={(convId) => updateConversationUnreadCount(convId, 0)}
          />
        ) : showChatSkeleton ? (
          <ChatWindowSkeleton />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#1a1a1e', border: '1px solid rgba(75, 85, 99, 0.1)' }}>
                <MessageSquare className="w-10 h-10" style={{ color: '#64748B' }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#F8FAFC' }}>Select a conversation</h2>
              <p className="text-sm" style={{ color: '#94A3B8' }}>Choose a support agent from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onSelectUser={(user) => {
          console.log('Selected user for new message:', user);
          // TODO: Create or find conversation with selected user
          setIsNewMessageModalOpen(false);
        }}
        currentUserId={currentUserId}
      />
    </div>
  );
}

