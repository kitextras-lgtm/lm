import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { ChatWindow, UserListItem, ConversationListSkeleton, ChatWindowSkeleton } from '../components/chat';
import { useAdminConversations, usePresence, useProfile } from '../hooks/useChat';
import { supabase } from '../lib/supabase';
import type { Conversation, Profile } from '../types/chat';
import { debounce } from '../utils/debounce';
import { useTheme } from '../contexts/ThemeContext';


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
        return matchesSearch;
      }),
    [conversations, debouncedSearchQuery]
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
              currentUserId={currentAdminId}
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
            <p className="text-sm" style={{ color: tokens.text.muted }}>Manage customer conversations</p>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ backgroundColor: tokens.bg.input }}>
            <button
              onClick={() => setActiveTab('primary')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'primary' 
                  ? 'text-white border border-white/20' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              style={{ 
                backgroundColor: activeTab === 'primary' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              Primary
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'general' 
                  ? 'text-white border border-white/20' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              style={{ 
                backgroundColor: activeTab === 'general' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              General
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                activeTab === 'requests' 
                  ? 'text-white border border-white/20' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              style={{ 
                backgroundColor: activeTab === 'requests' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
              }}
            >
              Requests
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.text.muted }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              aria-label="Search customers"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
              style={{ 
                backgroundColor: tokens.bg.input, 
                border: `1px solid ${tokens.border.default}`,
                color: tokens.text.primary,
                outlineColor: 'rgba(148, 163, 184, 0.3)',
                boxShadow: '0 0 0 1px rgba(148, 163, 184, 0.3)'
              }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent' }}>
          {showConversationSkeletons ? (
            <ConversationListSkeleton count={4} backgroundTheme={theme} />
          ) : filteredConversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#0f0f13' }}>
                <MessageSquare className="w-8 h-8" style={{ color: tokens.text.muted }} />
              </div>
              <p className="text-sm font-medium" style={{ color: tokens.text.secondary }}>No conversations found</p>
              <p className="text-xs mt-1" style={{ color: tokens.text.muted }}>Customer conversations will appear here</p>
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
            currentUserId={currentAdminId}
            getSenderName={getSenderName}
            backgroundTheme={theme}
          />
        ) : showChatSkeleton ? (
          <ChatWindowSkeleton backgroundTheme={theme} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl flex items-center justify-center" style={{ backgroundColor: tokens.bg.elevated, border: `1px solid ${tokens.border.default}` }}>
                <MessageSquare className="w-10 h-10" style={{ color: tokens.text.muted }} />
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: tokens.text.primary }}>Select a conversation</h2>
              <p className="text-sm" style={{ color: tokens.text.secondary }}>Choose a customer from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

