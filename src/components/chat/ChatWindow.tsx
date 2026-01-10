import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInfoDrawer } from './ChatInfoDrawer';
import { useChat } from '../../hooks/useChat';
import { useImageUpload } from '../../hooks/useImageUpload';
import { supabase } from '../../lib/supabase';
import type { Conversation, Profile, ReplyTo } from '../../types/chat';
import { formatDate, isSameDay } from '../../utils/dateUtils';

// Instagram/X pattern: Pending recipient type
interface PendingRecipient {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

interface ChatWindowProps {
  conversation?: Conversation;
  otherUser?: Profile;
  currentUserId: string;
  getSenderName: (senderId: string) => string;
  onMarkAsRead?: (conversationId: string) => void;
  backgroundTheme?: 'light' | 'grey' | 'dark';
  onBack?: () => void;
  showBackButton?: boolean;
  // Instagram/X pattern: Pending conversation props
  isPending?: boolean;
  pendingRecipient?: PendingRecipient;
  onSendPendingMessage?: (content: string) => Promise<void>;
  onCancelPending?: () => void;
}

export const ChatWindow = memo(function ChatWindow({
  conversation,
  otherUser,
  currentUserId,
  getSenderName,
  onMarkAsRead,
  backgroundTheme = 'dark',
  onBack,
  showBackButton = false,
  // Instagram/X pattern
  isPending = false,
  pendingRecipient,
  onSendPendingMessage,
  onCancelPending,
}: ChatWindowProps) {
  // Instagram/X pattern: Handle pending conversation state (no DB conversation yet)
  if (isPending && pendingRecipient) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {/* Header for pending conversation */}
        <div 
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-sidebar)' }}
        >
          {onCancelPending && (
            <button
              onClick={onCancelPending}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors lg:hidden"
              style={{ color: 'var(--text-secondary)' }}
            >
              ←
            </button>
          )}
          <img
            src={pendingRecipient.avatar_url || '/default-avatar.png'}
            alt={pendingRecipient.display_name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {pendingRecipient.display_name}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              @{pendingRecipient.username}
            </p>
          </div>
        </div>

        {/* Empty messages area with prompt */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div 
              className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden"
              style={{ border: '3px solid var(--border-default)' }}
            >
              <img
                src={pendingRecipient.avatar_url || '/default-avatar.png'}
                alt={pendingRecipient.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {pendingRecipient.display_name}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              @{pendingRecipient.username}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Send a message to start the conversation
            </p>
          </div>
        </div>

        {/* Input for pending conversation */}
        <div style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-sidebar)', padding: '12px 16px' }}>
          <ChatInput
            onSendMessage={async (content) => {
              if (onSendPendingMessage && content.trim()) {
                await onSendPendingMessage(content);
              }
            }}
            onTyping={() => {}}
            disabled={false}
            otherUserName={pendingRecipient.username}
          />
        </div>
      </div>
    );
  }

  // Normal conversation flow - requires conversation to be defined
  if (!conversation || !otherUser) {
    return null;
  }

  // Normal conversation rendering continues below...
  return <ChatWindowContent
    conversation={conversation}
    otherUser={otherUser}
    currentUserId={currentUserId}
    getSenderName={getSenderName}
    onMarkAsRead={onMarkAsRead}
    backgroundTheme={backgroundTheme}
    onBack={onBack}
    showBackButton={showBackButton}
  />;
});

// Separate component for actual conversation content
const ChatWindowContent = memo(function ChatWindowContent({
  conversation,
  otherUser,
  currentUserId,
  getSenderName,
  onMarkAsRead,
  backgroundTheme = 'dark',
  onBack,
  showBackButton = false,
}: {
  conversation: Conversation;
  otherUser: Profile;
  currentUserId: string;
  getSenderName: (senderId: string) => string;
  onMarkAsRead?: (conversationId: string) => void;
  backgroundTheme?: 'light' | 'grey' | 'dark';
  onBack?: () => void;
  showBackButton?: boolean;
}) {
  const { messages, loading, otherUserTyping, sendMessage, setTyping, markMessagesAsSeen } = useChat({
    conversationId: conversation.id,
    currentUserId,
  });
  const { uploadImage, uploading } = useImageUpload();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasMarkedAsReadRef = useRef(false);

  // Track if this is the initial load for this conversation
  const isInitialLoadRef = useRef(true);
  const shouldAutoScrollRef = useRef(true);

  // Track content readiness for smooth transition
  // Show content immediately if we have cached messages (instant loading)
  const [contentReady, setContentReady] = useState(() => {
    // Check if we have cached messages - if so, show content immediately
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`messages_cache_${conversation.id}`);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data.messages && data.messages.length > 0) {
            return true; // Show content immediately from cache
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    return false;
  });
  const imagesLoadedRef = useRef<Record<string, boolean>>({});

  // Get messages with images that need to load
  const messagesWithImages = useMemo(() =>
    messages.filter(m => m.type === 'image' && m.image_url),
    [messages]
  );

  // Reset flags when conversation changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    shouldAutoScrollRef.current = true;
    imagesLoadedRef.current = {};
    
    // Check if we have cached messages for the new conversation
    const cached = localStorage.getItem(`messages_cache_${conversation.id}`);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        if (data.messages && data.messages.length > 0) {
          setContentReady(true); // Show content immediately from cache
          return;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    setContentReady(false);
  }, [conversation.id]);

  // Mark content as ready when messages are available (don't wait for images)
  useEffect(() => {
    if (!loading && messages.length > 0) {
      // Content is ready immediately when we have messages - images will load in place
      setContentReady(true);
    } else if (!loading && messages.length === 0) {
      // No messages, content is ready
      setContentReady(true);
    }
  }, [loading, messages.length]);

  // Handle image load callback from MessageBubble
  const handleImageLoad = useCallback((messageId: string, loaded: boolean) => {
    imagesLoadedRef.current[messageId] = loaded;

    // Check if all images are now loaded
    const allLoaded = messagesWithImages.every(m => imagesLoadedRef.current[m.id] === true);
    if (allLoaded && !loading) {
      setContentReady(true);
    }
  }, [messagesWithImages, loading]);

  // Handle delete message
  const handleDeleteMessage = useCallback(async (messageId: string, forEveryone: boolean) => {
    if (forEveryone) {
      // Soft delete in database
      try {
        const { error } = await supabase
          .from('messages')
          .update({ 
            deleted_at: new Date().toISOString(),
            deleted_by: currentUserId 
          })
          .eq('id', messageId);
        
        if (error) {
          console.error('Error deleting message:', error);
          return;
        }
      } catch (error) {
        console.error('Error deleting message:', error);
        return;
      }
    }
    
    // Remove from local state (for both cases)
    // This will be handled by the real-time subscription
    // The message will be filtered out in the useChat hook
  }, [currentUserId]);

  // Scroll to bottom after messages finish rendering
  // Uses bottom anchor ref (messagesEndRef) instead of scrollTop math
  useEffect(() => {
    if (!loading && messages.length > 0 && messagesEndRef.current && shouldAutoScrollRef.current && contentReady) {
      // Scroll happens after render, using bottom anchor ref
      messagesEndRef.current.scrollIntoView({ behavior: isInitialLoadRef.current ? 'instant' : 'smooth' });

      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    }
  }, [loading, messages.length, conversation.id, contentReady]);

  // Mark as read when conversation is opened (only once per conversation)
  useEffect(() => {
    hasMarkedAsReadRef.current = false;
    return () => {
      hasMarkedAsReadRef.current = false;
    };
  }, [conversation.id]);

  useEffect(() => {
    if (messages.length > 0 && !hasMarkedAsReadRef.current) {
      markMessagesAsSeen().then(() => {
        hasMarkedAsReadRef.current = true;
        // Optimistically update the conversation list when messages are marked as read
        if (onMarkAsRead) {
          onMarkAsRead(conversation.id);
        }
      });
    }
  }, [conversation.id, messages.length, markMessagesAsSeen, onMarkAsRead]);

  // Mark as read when messages are visible for 2 seconds (user is at bottom)
  useEffect(() => {
    if (messages.length > 0 && messagesContainerRef.current) {
      // Clear any existing timeout
      if (markAsReadTimeoutRef.current) {
        clearTimeout(markAsReadTimeoutRef.current);
      }

      // Check if user is at bottom of conversation
      const container = messagesContainerRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100; // 100px threshold

      if (isAtBottom) {
        // Set timeout to mark as read after 2 seconds of visibility
        markAsReadTimeoutRef.current = setTimeout(() => {
          markMessagesAsSeen().then(() => {
            if (onMarkAsRead) {
              onMarkAsRead(conversation.id);
            }
          });
        }, 2000);
      }

      return () => {
        if (markAsReadTimeoutRef.current) {
          clearTimeout(markAsReadTimeoutRef.current);
        }
      };
    }
  }, [messages.length, markMessagesAsSeen, conversation.id, onMarkAsRead]);

  const handleSendMessage = async (content: string, imageFile?: File, reply?: ReplyTo) => {
    // Clear reply preview immediately when sending
    setReplyTo(null);

    // Enable auto-scroll when user sends a message (they're at bottom)
    shouldAutoScrollRef.current = true;

    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = (await uploadImage(imageFile)) || undefined;
        if (!imageUrl) {
          throw new Error('Failed to upload image');
        }
      }
      const result = await sendMessage(content, imageUrl, reply);
      if (result?.error) {
        throw result.error;
      }

      // Mark as read when user sends a message (they're viewing the conversation)
      // Note: sendMessage already marks as read in useChat, but we also update optimistically
      if (onMarkAsRead) {
        onMarkAsRead(conversation.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReply = useCallback((reply: ReplyTo) => {
    setReplyTo(reply);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyTo(null);
  }, []);

  const handleScrollToMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-neutral-700/30');
      setTimeout(() => {
        element.classList.remove('bg-neutral-700/30');
      }, 1500);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', height: '100%' }}>
      <ChatHeader 
        user={otherUser} 
        isTyping={otherUserTyping}
        onVideoCall={() => console.log('Video call clicked')}
        onScheduleMeeting={() => console.log('Schedule meeting clicked')}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        isDrawerOpen={isDrawerOpen}
        backgroundTheme={backgroundTheme}
        onBack={onBack}
        showBackButton={showBackButton}
      />

      {/* Messages area wrapper with relative positioning for skeleton overlay */}
      <div className="flex-1 min-h-0 relative">
        {/* Skeleton overlay - stays visible until content is fully ready */}
        {!contentReady && (
          <div 
            className="absolute inset-0 z-10 flex flex-col"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              transition: 'opacity 150ms ease-out',
              opacity: 1,
              pointerEvents: 'none'
            }}
          >
          {/* Skeleton messages area */}
          <div className="flex-1 py-2 lg:py-4 flex flex-col justify-end animate-pulse">
            <div className="space-y-0.5 lg:space-y-1 px-2 lg:px-4">
              {/* Received message skeleton */}
              <div className="flex justify-start px-2 lg:px-4 py-0.5">
                <div className="flex items-center gap-1.5 lg:gap-2 max-w-[85%] lg:max-w-[70%]">
                  <div className="flex flex-col gap-1">
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{ backgroundColor: 'rgba(75, 85, 99, 0.15)', minHeight: '2.5rem', width: '180px' }}
                    />
                    <div
                      className="h-3 rounded px-1"
                      style={{ backgroundColor: 'rgba(75, 85, 99, 0.1)', width: '40px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Sent message skeleton */}
              <div className="flex justify-end px-2 lg:px-4 py-0.5">
                <div className="flex items-center gap-1.5 lg:gap-2 max-w-[85%] lg:max-w-[70%] flex-row-reverse">
                  <div className="flex flex-col gap-1">
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{ backgroundColor: 'rgba(248, 250, 252, 0.1)', minHeight: '2.5rem', width: '140px' }}
                    />
                    <div
                      className="h-3 rounded px-1 ml-auto"
                      style={{ backgroundColor: 'rgba(75, 85, 99, 0.1)', width: '40px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Received message with longer content */}
              <div className="flex justify-start px-2 lg:px-4 py-0.5">
                <div className="flex items-center gap-1.5 lg:gap-2 max-w-[85%] lg:max-w-[70%]">
                  <div className="flex flex-col gap-1">
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{ backgroundColor: 'rgba(75, 85, 99, 0.15)', minHeight: '3.5rem', width: '220px' }}
                    />
                    <div
                      className="h-3 rounded px-1"
                      style={{ backgroundColor: 'rgba(75, 85, 99, 0.1)', width: '40px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        <div
          ref={messagesContainerRef}
          className="absolute inset-0 overflow-y-auto"
          style={{ 
            backgroundColor: 'var(--bg-primary)', 
            scrollbarWidth: 'thin', 
            scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent', 
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}
          onScroll={() => {
            // Track if user is at bottom to control auto-scroll behavior
            if (messagesContainerRef.current) {
              const container = messagesContainerRef.current;
              const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50; // 50px threshold

            // Only auto-scroll if user is at bottom (don't restore mid-scroll state)
            shouldAutoScrollRef.current = isAtBottom;

            if (isAtBottom && messages.length > 0) {
              // Clear existing timeout
              if (markAsReadTimeoutRef.current) {
                clearTimeout(markAsReadTimeoutRef.current);
              }

              // Mark as read immediately when scrolled to bottom
              markMessagesAsSeen().then(() => {
                if (onMarkAsRead) {
                  onMarkAsRead(conversation.id);
                }
              });
            }
          }
        }}
      >
        <div className="py-2 lg:py-4 min-h-full flex flex-col justify-end">
          {messages.length === 0 && !loading ? (
            <div className="flex-1 flex items-start justify-center pt-12 lg:pt-16">
              <div className="text-center px-4 lg:px-6">
                {/* Profile Avatar */}
                <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-4 rounded-full overflow-hidden" style={{ border: '3px solid var(--border-default)' }}>
                  {otherUser.avatar_url ? (
                    <img 
                      src={otherUser.avatar_url} 
                      alt={otherUser.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                      <svg className="w-10 h-10 lg:w-12 lg:h-12" style={{ color: '#64748B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Name */}
                <h3 className="text-base lg:text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {otherUser.name}
                </h3>
                
                {/* Username */}
                {otherUser.username && (
                  <p className="text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
                    @{otherUser.username}
                  </p>
                )}
                
                {/* Joined Date */}
                {otherUser.created_at && (
                  <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Joined {new Date(otherUser.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                )}
                
                {/* View Profile Button */}
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:brightness-110"
                  style={{ 
                    backgroundColor: 'var(--text-primary)', 
                    color: 'var(--bg-primary)'
                  }}
                >
                  View Profile
                </button>
              </div>
            </div>
          ) : (
            <div className={`space-y-0.5 lg:space-y-1 px-2 lg:px-2 ${contentReady ? 'chat-content-ready' : 'chat-content-loading'}`}>
              {messages.map((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const currentDate = new Date(message.created_at);
                const previousDate = previousMessage ? new Date(previousMessage.created_at) : null;
                const shouldShowDate = !previousDate || !isSameDay(currentDate, previousDate);

                return (
                  <div key={message.id}>
                    {shouldShowDate && (
                      <div className="flex items-center justify-center py-5">
                        <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-default)' }}>
                          <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>
                            {formatDate(message.created_at)}
                          </span>
                        </div>
                      </div>
                    )}
                    <MessageBubble
                      message={message}
                      isOwn={message.sender_id === currentUserId}
                      onReply={handleReply}
                      onScrollToMessage={handleScrollToMessage}
                      senderName={getSenderName(message.sender_id)}
                      onImageLoad={handleImageLoad}
                      onDelete={handleDeleteMessage}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {otherUserTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
        </div>
      </div>

      <ChatInput
            onSendMessage={handleSendMessage}
            onTyping={setTyping}
            disabled={loading}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            otherUserName={otherUser?.username || ''}
          />

      {/* Info Drawer */}
      <ChatInfoDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={otherUser}
      />
    </div>
  );
});

