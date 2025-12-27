import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ChatHeader, ChatInput, MessageBubble, TypingIndicator } from './';
import { useChat } from '../../hooks/useChat';
import { useImageUpload } from '../../hooks/useImageUpload';
import type { Conversation, Profile, ReplyTo } from '../../types/chat';
import { formatDate, isSameDay } from '../../utils/dateUtils';
import { AnimatedBarsLoader } from '../AnimatedBarsLoader';

interface ChatWindowProps {
  conversation: Conversation;
  otherUser: Profile;
  currentUserId: string;
  getSenderName: (senderId: string) => string;
  isLoading?: boolean;
  onMarkAsRead?: (conversationId: string) => void;
}

export const ChatWindow = memo(function ChatWindow({
  conversation,
  otherUser,
  currentUserId,
  getSenderName,
  isLoading = false,
  onMarkAsRead,
}: ChatWindowProps) {
  const { messages, loading, otherUserTyping, sendMessage, setTyping, markMessagesAsSeen } = useChat({
    conversationId: conversation.id,
    currentUserId,
  });
  const { uploadImage, uploading } = useImageUpload();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<ReplyTo | null>(null);
  const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasMarkedAsReadRef = useRef(false);

  // Track if this is the initial load for this conversation
  const isInitialLoadRef = useRef(true);
  const shouldAutoScrollRef = useRef(true);

  // Reset flags when conversation changes
  useEffect(() => {
    isInitialLoadRef.current = true;
    shouldAutoScrollRef.current = true;
  }, [conversation.id]);

  // Scroll to bottom after messages finish rendering
  // Uses bottom anchor ref (messagesEndRef) instead of scrollTop math
  useEffect(() => {
    if (!loading && messages.length > 0 && messagesEndRef.current && shouldAutoScrollRef.current) {
      // Scroll happens after render, using bottom anchor ref
      messagesEndRef.current.scrollIntoView({ behavior: isInitialLoadRef.current ? 'instant' : 'smooth' });
      
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
      }
    }
  }, [loading, messages.length, conversation.id]);

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
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden" style={{ backgroundColor: '#111111', height: '100%' }}>
      <ChatHeader user={otherUser} isTyping={otherUserTyping} />

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto min-h-0" 
        style={{ backgroundColor: '#111111', scrollbarWidth: 'thin', scrollbarColor: 'rgba(75, 85, 99, 0.3) transparent', overflowY: 'auto' }}
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
          {loading ? (
            // Show loading spinner while fetching messages (prevents "No messages yet" flicker)
            <div className="flex-1 flex items-center justify-center">
              <AnimatedBarsLoader text="Loading messages..." />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-4 lg:px-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-5 rounded-xl lg:rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#1a1a1e', border: '1px solid rgba(75, 85, 99, 0.1)' }}>
                  <svg className="w-8 h-8 lg:w-10 lg:h-10" style={{ color: '#64748B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-xs lg:text-sm font-medium" style={{ color: '#94A3B8' }}>No messages yet</p>
                <p className="text-[10px] lg:text-xs mt-1" style={{ color: '#64748B' }}>Start the conversation by sending a message</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0.5 lg:space-y-1 px-2 lg:px-2">
              {messages.map((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : null;
                const currentDate = new Date(message.created_at);
                const previousDate = previousMessage ? new Date(previousMessage.created_at) : null;
                const shouldShowDate = !previousDate || !isSameDay(currentDate, previousDate);

                return (
                  <div key={message.id}>
                    {shouldShowDate && (
                      <div className="flex items-center justify-center py-5">
                        <div className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#1a1a1e', border: '1px solid rgba(75, 85, 99, 0.15)' }}>
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

      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={setTyping}
        disabled={uploading}
        replyTo={replyTo}
        onCancelReply={handleCancelReply}
        otherUserName={otherUser.name}
      />
    </div>
  );
});

