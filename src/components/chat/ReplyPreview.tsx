import { X } from 'lucide-react';
import type { ReplyTo } from '../../types/chat';

interface ReplyPreviewProps {
  replyTo: ReplyTo;
  onCancel: () => void;
}

export function ReplyPreview({ replyTo, onCancel }: ReplyPreviewProps) {
  const truncatedContent = replyTo.content.length > 80
    ? replyTo.content.substring(0, 80) + '...'
    : replyTo.content;

  return (
    <div className="animate-fade-in">
      <div className="flex items-start gap-3 px-3 py-2 rounded-lg border-l-2" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            Replying to {replyTo.senderName}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-primary)' }}>
            {truncatedContent || 'Image'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="shrink-0 p-1 rounded-full hover:brightness-110 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


