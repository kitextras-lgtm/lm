import { useState, memo } from 'react';
import { Copy, Reply } from 'lucide-react';
import type { Message, ReplyTo } from '../../types/chat';
import { ImagePreviewModal } from './ImagePreviewModal';
import { formatTime } from '../../utils/dateUtils';
import { AnimatedWave } from './AnimatedWave';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (id: string) => void;
  onReply?: (replyTo: ReplyTo) => void;
  onScrollToMessage?: (messageId: string) => void;
  senderName?: string;
}

export const MessageBubble = memo(function MessageBubble({ message, isOwn, onReply, onScrollToMessage, senderName }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  const hasReply = message.reply_to_id && (message.reply_to_sender_name || message.reply_to_content);

  return (
    <>
      <div
        id={`message-${message.id}`}
        className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} px-2 lg:px-4 py-0.5`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
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
                  backgroundColor: '#1a1a1e', 
                  borderColor: '#64748B',
                  color: '#F8FAFC'
                }}
              >
                <p className="text-[10px] font-medium" style={{ color: '#64748B' }}>
                  {message.reply_to_sender_name}
                </p>
                <p className="text-[10px] line-clamp-1" style={{ color: '#94A3B8' }}>
                  {message.reply_to_content || 'Image'}
                </p>
              </button>
            )}

            <div
              className={`relative rounded-2xl overflow-hidden transition-all duration-200 min-w-0 ${
                message.type === 'image' && !message.content ? 'p-0' : ''
              }`}
              style={isOwn ? { backgroundColor: '#F8FAFC', color: '#111111' } : { backgroundColor: '#1a1a1e', color: '#F8FAFC' }}
            >
              {message.type === 'image' && message.image_url && (
                <div className={`relative ${message.content ? 'px-4 pt-3' : 'p-0'}`}>
                  {imageError ? (
                    <div className={`rounded-lg flex items-center justify-center ${
                      message.content ? 'mb-2' : ''
                    }`} style={{ width: '100%', maxWidth: '280px', height: '200px', backgroundColor: '#0f0f13' }}>
                      <p className="text-xs" style={{ color: '#64748B' }}>Failed to load image</p>
                    </div>
                  ) : (
                    <img
                      src={message.image_url}
                      alt="Shared image"
                      className={`rounded-lg w-full max-w-[280px] lg:max-w-[280px] max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity ${
                        message.content ? 'mb-2' : ''
                      }`}
                      style={{ 
                        display: 'block',
                        border: 'none',
                        outline: 'none'
                      }}
                      onClick={() => setImageModalOpen(true)}
                      onError={() => setImageError(true)}
                      loading="lazy"
                    />
                  )}
                </div>
              )}
              {message.content && (
                <div className={`flex items-center min-h-[1.5rem] ${message.type === 'image' && message.image_url ? 'px-4 pb-3' : 'px-4 py-3'}`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words w-full">
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
            <span className={`text-[10px] px-1 ${isOwn ? 'text-right' : 'text-left'}`} style={{ color: '#94A3B8' }}>
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
                style={{ color: '#64748B' }}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleReply}
              className="p-1.5 rounded-full hover:brightness-110 transition-colors"
              style={{ color: '#64748B' }}
            >
              <Reply className="w-3.5 h-3.5" />
            </button>
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

