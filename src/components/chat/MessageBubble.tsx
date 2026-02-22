import { useState, useEffect, memo } from 'react';
import { Copy, Reply, Trash2 } from 'lucide-react';
import type { Message, ReplyTo } from '../../types/chat';
import { ImagePreviewModal } from './ImagePreviewModal';
import { formatTime } from '../../utils/dateUtils';
import { AnimatedWave } from './AnimatedWave';
import { getTheme } from '../../utils/chatTheme';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (messageId: string, forEveryone: boolean) => void;
  onReply?: (replyTo: ReplyTo) => void;
  onScrollToMessage?: (messageId: string) => void;
  senderName?: string;
  onImageLoad?: (messageId: string, loaded: boolean) => void;
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white';
}

export const MessageBubble = memo(function MessageBubble({ message, isOwn, onReply, onScrollToMessage, senderName, onImageLoad, onDelete, backgroundTheme = 'dark' }: MessageBubbleProps) {
  const theme = getTheme(backgroundTheme);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload image to prevent layout shift
  useEffect(() => {
    if (message.type === 'image' && message.image_url) {
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        onImageLoad?.(message.id, true);
      };
      img.onerror = () => {
        setImageError(true);
        onImageLoad?.(message.id, true); // Mark as loaded even on error to unblock
      };
      img.src = message.image_url;
    } else {
      // No image to load, mark as loaded immediately
      onImageLoad?.(message.id, true);
    }
  }, [message.id, message.type, message.image_url, onImageLoad]);

  const handleCopy = async () => {
    if (message.content) {
      try {
        await navigator.clipboard.writeText(message.content);
      } catch (error) {
        console.error('Failed to copy message:', error);
      }
    }
  };

  const handleReply = () => {
    if (onReply) {
      onReply({
        id: message.id,
        senderName: senderName || 'Unknown',
        content: message.content || (message.type === 'image' ? 'Image' : ''),
      });
    }
  };

  const handleQuotedClick = () => {
    if (message.reply_to_id && onScrollToMessage) {
      onScrollToMessage(message.reply_to_id);
    }
  };

  const handleDeleteForMe = async () => {
    // Hide message locally (doesn't affect other user)
    if (onDelete) {
      onDelete(message.id, false); // false = delete for me only
    }
  };

  const handleDeleteForEveryone = async () => {
    // Soft delete in database (shows "deleted" to everyone)
    if (onDelete) {
      onDelete(message.id, true); // true = delete for everyone
    }
  };

  const hasReply = message.reply_to_id && (message.reply_to_sender_name || message.reply_to_content);

  // Show "This message was deleted" for deleted messages
  if (message.deleted_at) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-2 lg:px-4 py-0.5`}>
        <div className="px-3 py-2 rounded-lg italic text-sm" style={{ backgroundColor: theme.messageBubbleOther + '50', color: theme.textMuted }}>
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        id={`message-${message.id}`}
        className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} px-2 lg:px-4 py-0.5`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => {
          setShowActions(false);
          setShowDeleteMenu(false); // Close delete menu when leaving
        }}
      >
        <div className={`flex items-center gap-1.5 lg:gap-2 max-w-[85%] lg:max-w-[70%] min-w-0 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="flex flex-col gap-1 min-w-0">
            {hasReply && (
              <button
                onClick={handleQuotedClick}
                className={`text-left px-2 py-1.5 rounded-lg border-l-2 transition-colors ${
                  isOwn ? 'ml-auto' : 'mr-auto'
                }`}
                style={{ 
                  backgroundColor: theme.messageBubbleOther, 
                  borderColor: theme.border,
                  color: theme.messageBubbleOtherText
                }}
              >
                <p className="text-[10px] font-medium" style={{ color: theme.textSecondary }}>
                  {message.reply_to_sender_name}
                </p>
                <p className="text-[10px] line-clamp-1" style={{ color: theme.textMuted }}>
                  {message.reply_to_content || 'Image'}
                </p>
              </button>
            )}

            <div
              className={`relative rounded-2xl overflow-hidden transition-all duration-200 min-w-[2.5rem] ${
                message.type === 'image' && !message.content ? 'p-0' : ''
              }`}
              style={isOwn ? { backgroundColor: theme.messageBubbleOwn, color: theme.messageBubbleOwnText } : { backgroundColor: theme.messageBubbleOther, color: theme.messageBubbleOtherText }}
            >
              {message.type === 'image' && message.image_url && (
                <div className={`relative ${message.content ? 'px-4 pt-3' : 'p-0'}`}>
                  {imageError ? (
                    <div className={`rounded-lg flex items-center justify-center ${
                      message.content ? 'mb-2' : ''
                    }`} style={{ width: '100%', maxWidth: '280px', height: '200px', backgroundColor: theme.backgroundSecondary }}>
                      <p className="text-xs" style={{ color: theme.textSecondary }}>Failed to load image</p>
                    </div>
                  ) : (
                    <>
                      {/* Placeholder shown while image is loading - same dimensions */}
                      {!imageLoaded && (
                        <div 
                          className={`chat-image-placeholder rounded-lg ${
                            message.content ? 'mb-2' : ''
                          }`} 
                          style={{ 
                            width: '280px', 
                            height: '200px',
                            backgroundColor: 'rgba(75, 85, 99, 0.15)'
                          }}
                        />
                      )}
                      <img
                        src={message.image_url}
                        alt="Shared image"
                        className={`rounded-lg w-full max-w-[280px] lg:max-w-[280px] max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                          message.content ? 'mb-2' : ''
                        } ${imageLoaded ? 'chat-image-loaded' : ''}`}
                        style={{ 
                          display: imageLoaded ? 'block' : 'none',
                          border: 'none',
                          outline: 'none'
                        }}
                        onClick={() => setImageModalOpen(true)}
                        onError={() => setImageError(true)}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </>
                  )}
                </div>
              )}
              {message.content && (
                <div className={`flex items-center justify-center min-h-[1.5rem] ${message.type === 'image' && message.image_url ? 'px-4 pb-3' : 'px-4 py-3'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words w-full text-center">
                    {message.content.split('👋').map((part, index, array) => 
                      index < array.length - 1 ? (
                        <span key={index}>
                          {part}
                          <AnimatedWave />
                        </span>
                      ) : (
                        <span key={index}>{part}</span>
                      )
                    )}
                  </p>
                </div>
              )}
            </div>
            <span className={`text-[10px] px-1 ${isOwn ? 'text-right' : 'text-left'}`} style={{ color: theme.textMuted }}>
              {formatTime(message.created_at)}
            </span>
          </div>

          <div
            className={`flex items-center gap-1 transition-opacity duration-200 ${
              showActions ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {message.content && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-full hover:brightness-110 transition-colors"
                style={{ color: theme.textSecondary }}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleReply}
              className="p-1.5 rounded-full hover:brightness-110 transition-colors"
              style={{ color: theme.textSecondary }}
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
            
            {/* Delete button - only for own messages */}
            {isOwn && (
              <div className="relative">
                <button
                  onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                  className="p-1.5 rounded-full hover:brightness-110 transition-colors"
                  style={{ color: theme.textSecondary }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                
                {showDeleteMenu && (
                  <div className="absolute bottom-full right-0 mb-1 rounded-lg shadow-lg py-1 min-w-[140px] z-50" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => {
                        handleDeleteForMe();
                        setShowDeleteMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:brightness-110 transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Delete for me
                    </button>
                    <button
                      onClick={() => {
                        handleDeleteForEveryone();
                        setShowDeleteMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:brightness-110 transition-colors"
                      style={{ color: '#F87171' }}
                    >
                      Delete for everyone
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {message.type === 'image' && message.image_url && (
        <ImagePreviewModal
          isOpen={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          imageUrl={message.image_url}
        />
      )}
    </>
  );
});

