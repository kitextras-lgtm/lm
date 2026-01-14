import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { ChatWindow, UserListItem } from '../components/chat';
import { useAdminConversations, usePresence, useProfile } from '../hooks/useChat';
import { supabase } from '../lib/supabase';
import type { Conversation, Profile } from '../types/chat';
import { debounce } from '../utils/debounce';
import { AnimatedBarsLoader } from '../components/AnimatedBarsLoader';
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
    if (conversations.length > 0 && !selectedConversation) {
      const firstConv = conversations[0];
      setSelectedConversation(firstConv);
      
      // Mark first conversation as read if it has unread messages
      if (firstConv.unread_count_admin > 0) {
        (async () => {
          try {
            const { error } = await supabase
              .from('conversations')
              .update({ unread_count_admin: 0 })
              .eq('id', firstConv.id);
            if (error) throw error;
          } catch (error) {
            console.error('Error marking conversation as read:', error);
          }
        })();
      }
    }
  }, [conversations, selectedConversation]);

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

  // Only show loading if we're actually loading and don't have any conversations yet
  // This ensures a single, smooth loading animation without flickering
  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl w-full shadow-2xl" style={{ minHeight: 'calc(100vh - 160px)', backgroundColor: tokens.bg.primary, border: `1px solid ${tokens.border.default}` }}>
        <AnimatedBarsLoader text="Loading conversations..." />
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
          <div className="relative mb-4">
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
          {filteredConversations.length === 0 ? (
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

