import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ImagePlus, AlertCircle } from 'lucide-react';
import { ImageUploadPreview } from './ImageUploadPreview';
import { ReplyPreview } from './ReplyPreview';
import type { ReplyTo } from '../../types/chat';
import { MAX_IMAGE_SIZE, SUPPORTED_IMAGE_TYPES } from '../../utils/chatConstants';

interface ChatInputProps {
  onSendMessage: (content: string, imageFile?: File, replyTo?: ReplyTo) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  replyTo?: ReplyTo | null;
  onCancelReply?: () => void;
  otherUserName?: string;
}

export function ChatInput({ onSendMessage, onTyping, disabled, replyTo, onCancelReply, otherUserName }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageButtonRef = useRef<HTMLButtonElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '36px';
      const scrollHeight = textarea.scrollHeight;
      if (scrollHeight > 36) {
        textarea.style.height = `${Math.min(scrollHeight, 150)}px`;
      }
    }
  }, [message]);

  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  useEffect(() => {
    // Force sharp corners on all input elements
    if (imageButtonRef.current) {
      imageButtonRef.current.style.borderRadius = '0';
    }
    if (sendButtonRef.current) {
      sendButtonRef.current.style.borderRadius = '0';
    }
    if (textareaRef.current) {
      textareaRef.current.style.borderRadius = '0';
    }
  }, []);

  const handleTyping = () => {
    onTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSend = () => {
    if ((!message.trim() && !imageFile) || disabled) return;
    onSendMessage(message.trim(), imageFile || undefined, replyTo || undefined);
    setMessage('');
    setImageFile(null);
    onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      e.target.value = '';
      return;
    }

    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
      console.error('Unsupported image format. Please use JPEG, PNG, GIF, or WebP.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      console.error('Image size exceeds 10MB limit. Please choose a smaller image.');
      e.target.value = '';
      return;
    }

    setImageFile(file);
    e.target.value = '';
  }, []);

  const hasContent = message.trim() || imageFile;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {replyTo && onCancelReply && (
        <div className="px-3 lg:px-4 pt-3">
          <ReplyPreview replyTo={replyTo} onCancel={onCancelReply} />
        </div>
      )}

      {imageFile && (
        <div className="px-3 lg:px-4 py-2">
          <div className="p-3 rounded-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(26, 26, 30, 0.5)' }}>
            <ImageUploadPreview file={imageFile} onRemove={() => setImageFile(null)} />
            {imageFile.size > MAX_IMAGE_SIZE && (
              <div className="flex items-center gap-2 text-xs" style={{ color: '#ef4444' }}>
                <AlertCircle className="w-4 h-4" />
                <span>File too large</span>
              </div>
            )}
          </div>
        </div>
      )}

      <form 
        onSubmit={handleFormSubmit} 
        className="flex gap-2 items-center safe-area-inset-bottom"
        style={{ borderTop: '1px solid rgba(75, 85, 99, 0.2)', backgroundColor: '#111111', padding: '12px 16px' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <button
          ref={imageButtonRef}
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="shrink-0 hover:bg-transparent group h-8 w-8 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: '#94A3B8', borderRadius: 0 }}
        >
          <ImagePlus className="w-4 h-4 transition-transform duration-200 group-hover:scale-125" />
        </button>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder={otherUserName ? `Message @${otherUserName}` : 'Send a message...'}
          disabled={disabled}
          rows={1}
          maxLength={5000}
          aria-label="Message input"
          className="flex-1 px-4 py-2 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-y-auto"
          style={{ 
            minHeight: '32px',
            maxHeight: '120px',
            color: '#F8FAFC',
            backgroundColor: '#1a1a1e',
            border: '1px solid rgba(75, 85, 99, 0.2)',
            borderRadius: 0
          }}
        />
        <button
          ref={sendButtonRef}
          type="submit"
          disabled={!hasContent || disabled}
          className="shrink-0 h-8 w-8 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={hasContent ? { backgroundColor: '#F8FAFC', color: '#111111', borderRadius: 0 } : { backgroundColor: 'rgba(148, 163, 184, 0.1)', color: '#94A3B8', borderRadius: 0 }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </>
  );
}

