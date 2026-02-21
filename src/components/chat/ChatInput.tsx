// Fix 22 & 23: Input State Preservation (Drafts) and Typing Indicators
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, ImagePlus, AlertCircle, Mic, Square, Loader2, X } from 'lucide-react';
import { ImageUploadPreview } from './ImageUploadPreview';
import { ReplyPreview } from './ReplyPreview';
import type { ReplyTo } from '../../types/chat';
import { MAX_IMAGE_SIZE, SUPPORTED_IMAGE_TYPES } from '../../utils/chatConstants';
import { useSpeechToText } from '../../hooks/useSpeechToText';
import { WaveformVisualizer } from './WaveformVisualizer';

interface ChatInputProps {
  onSendMessage: (content: string, imageFile?: File, replyTo?: ReplyTo) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
  replyTo?: ReplyTo | null;
  onCancelReply?: () => void;
  otherUserName?: string;
  // Fix 22: Draft support
  conversationId?: string;
  initialDraft?: string;
  onDraftChange?: (conversationId: string, content: string) => void;
  onDraftClear?: (conversationId: string) => void;
}

export function ChatInput({ 
  onSendMessage, 
  onTyping, 
  disabled, 
  replyTo, 
  onCancelReply, 
  otherUserName,
  conversationId,
  initialDraft = '',
  onDraftChange,
  onDraftClear,
}: ChatInputProps) {
  const { t } = useTranslation();
  // Fix 22: Initialize with draft if provided
  const [message, setMessage] = useState(initialDraft);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageButtonRef = useRef<HTMLButtonElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const draftTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fix 22: Update message when conversation changes (restore draft)
  useEffect(() => {
    setMessage(initialDraft);
  }, [conversationId, initialDraft]);

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

  // Fix 23: Handle typing indicator
  const handleTyping = () => {
    onTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  // Fix 22: Save draft with debounce
  const handleDraftSave = useCallback((content: string) => {
    if (!conversationId || !onDraftChange) return;
    
    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current);
    }
    draftTimeoutRef.current = setTimeout(() => {
      onDraftChange(conversationId, content);
    }, 500);
  }, [conversationId, onDraftChange]);

  const handleSend = () => {
    if ((!message.trim() && !imageFile) || disabled) return;
    onSendMessage(message.trim(), imageFile || undefined, replyTo || undefined);
    setMessage('');
    setImageFile(null);
    onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // Fix 22: Clear draft after sending
    if (conversationId && onDraftClear) {
      onDraftClear(conversationId);
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

  // Speech-to-text
  const stt = useSpeechToText();
  const micButtonRef = useRef<HTMLButtonElement>(null);

  const handleMicClick = async () => {
    if (stt.state === 'recording') {
      const transcript = await stt.stopAndTranscribe();
      if (transcript) {
        const updated = message ? message + ' ' + transcript : transcript;
        setMessage(updated);
        handleDraftSave(updated);
        // Focus the textarea so user can edit / send
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    } else if (stt.state === 'idle' || stt.state === 'error') {
      await stt.startRecording();
    }
  };

  const handleMicCancel = () => {
    stt.cancelRecording();
  };

  // Force sharp corners on mic button
  useEffect(() => {
    if (micButtonRef.current) {
      micButtonRef.current.style.borderRadius = '0';
    }
  }, []);

  const hasContent = message.trim() || imageFile;
  const isRecording = stt.state === 'recording';
  const isTranscribing = stt.state === 'transcribing';

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

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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

      {/* Recording indicator bar */}
      {isRecording && (
        <div
          className="flex items-center gap-2 px-4 py-2 animate-fade-in"
          style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#ef4444' }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: '#ef4444' }} />
          </span>
          <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-primary)' }}>{formatDuration(stt.duration)}</span>
          <WaveformVisualizer getWaveformData={stt.getWaveformData} isActive={isRecording} />
          <button
            type="button"
            onClick={handleMicCancel}
            className="ml-auto shrink-0 p-1 transition-colors hover:brightness-125"
            style={{ color: 'var(--text-primary)', opacity: 0.6 }}
            aria-label="Cancel recording"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Transcribing indicator */}
      {isTranscribing && (
        <div
          className="flex items-center gap-3 px-4 py-2 animate-fade-in"
          style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-elevated)' }}
        >
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-primary)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Transcribing…</span>
        </div>
      )}

      {/* STT error */}
      {stt.error && stt.state === 'error' && (
        <div
          className="flex items-center gap-2 px-4 py-2 text-xs"
          style={{ borderTop: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.08)', color: '#f87171' }}
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{stt.error}</span>
        </div>
      )}

      <form 
        onSubmit={handleFormSubmit} 
        className="flex gap-2 items-center safe-area-inset-bottom"
        style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-sidebar)', padding: '12px 16px' }}
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
          disabled={disabled || isRecording || isTranscribing}
          className="shrink-0 hover:bg-transparent group h-8 w-8 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-secondary)', borderRadius: 0, border: '1px solid var(--border-default)' }}
        >
          <ImagePlus className="w-4 h-4 transition-transform duration-200 group-hover:scale-125" />
        </button>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
            // Fix 22: Save draft on change
            handleDraftSave(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={isTranscribing ? 'Transcribing…' : otherUserName ? t('messages.messageAt', { username: otherUserName }) : t('messages.sendAMessage')}
          disabled={disabled || isTranscribing}
          rows={1}
          maxLength={5000}
          aria-label="Message input"
          className="flex-1 px-4 py-2 text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none overflow-y-auto"
          style={{ 
            minHeight: '32px',
            maxHeight: '120px',
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-default)',
            borderRadius: 0,
            opacity: 0.7
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.opacity = '1'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.opacity = '0.7'; }}
        />
        {/* Mic button — toggles between start/stop recording */}
        <button
          ref={micButtonRef}
          type="button"
          onClick={handleMicClick}
          disabled={disabled || isTranscribing}
          className="shrink-0 h-8 w-8 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          style={isRecording
            ? { backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 0, border: '1px solid rgba(239,68,68,0.4)' }
            : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderRadius: 0, border: '1px solid var(--border-default)', opacity: 0.6 }
          }
          aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          {isRecording ? (
            <Square className="w-3.5 h-3.5" fill="currentColor" />
          ) : isTranscribing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mic className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          )}
        </button>
        <button
          ref={sendButtonRef}
          type="submit"
          disabled={!hasContent || disabled}
          className="shrink-0 h-8 w-8 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={hasContent ? { backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: 0, border: '1px solid var(--border-default)' } : { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderRadius: 0, border: '1px solid var(--border-default)', opacity: 0.4 }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </>
  );
}

