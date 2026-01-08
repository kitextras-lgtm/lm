import { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInfoDrawer } from './ChatInfoDrawer';
import { useChat } from '../../hooks/useChat';
import { useImageUpload } from '../../hooks/useImageUpload';
import type { Conversation, Profile, ReplyTo } from '../../types/chat';
import { formatDate, isSameDay } from '../../utils/dateUtils';

interface ChatWindowProps {
  conversation: Conversation;
  otherUser: Profile;
  currentUserId: string;
  getSenderName: (senderId: string) => string;
  onMarkAsRead?: (conversationId: string) => void;
  backgroundTheme?: 'light' | 'grey' | 'dark';
  onBack?: () => void;
  showBackButton?: boolean;
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
}: ChatWindowProps) {
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
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" style={{ backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', height: '100%' }}>
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
              backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000',
              transition: 'opacity 150ms ease-out',
              opacity: 1,
              pointerEvents: 'none'
            }}
          >
          {/* Skeleton messages area */}
          <div className="flex-1 pt-2 lg:pt-4 pb-2 lg:pb-3 flex flex-col justify-end animate-pulse">
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
            backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000', 
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
        <div className="pt-2 lg:pt-4 min-h-full flex flex-col justify-end">
          {messages.length === 0 && !loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4 lg:px-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-5 rounded-xl lg:rounded-2xl flex items-center justify-center" style={{ backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#2A2A2E' : '#1a1a1e', border: '1px solid rgba(75, 85, 99, 0.1)' }}>
                  <svg className="w-8 h-8 lg:w-10 lg:h-10" style={{ color: '#64748B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-xs lg:text-sm font-medium" style={{ color: '#94A3B8' }}>No messages yet</p>
                <p className="text-[10px] lg:text-xs mt-1" style={{ color: '#64748B' }}>Start the conversation by sending a message</p>
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
                        <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#2A2A2E' : '#000000', border: '1px solid rgba(75, 85, 99, 0.15)' }}>
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
                      backgroundTheme={backgroundTheme}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {otherUserTyping && <TypingIndicator />}
          <div ref={messagesEndRef} className="h-2 lg:h-3 flex-shrink-0" />
        </div>
        </div>
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={setTyping}
        disabled={uploading}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        otherUserName={otherUser.name}
        backgroundTheme={backgroundTheme}
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

