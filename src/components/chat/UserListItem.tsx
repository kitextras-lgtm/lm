import { useState, memo } from 'react';
import { Avatar } from './Avatar';
import { ContextMenu } from './ContextMenu';
import type { Profile, Conversation } from '../../types/chat';
import { formatLastMessageTime } from '../../utils/dateUtils';

interface UserListItemProps {
  user: Profile;
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onPin?: (conversationId: string, isPinned: boolean) => void;
  unreadCount?: number;
  currentUserId?: string;
}

export const UserListItem = memo(function UserListItem({ user, conversation, isActive, onClick, onPin, unreadCount, currentUserId }: UserListItemProps) {
  const count = unreadCount !== undefined ? unreadCount : conversation.unread_count_customer;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handlePin = () => {
    onPin?.(conversation.id, !conversation.is_pinned);
  };

  // Check if current user sent the last message to add "Me: " prefix
  const lastMessagePreview = conversation.last_message 
    ? (() => {
        let messageText = conversation.last_message.replace(/\n/g, ' ').trim();
        // Strip any existing "Me: " prefix (for old messages that had it stored)
        if (messageText.startsWith('Me: ')) {
          messageText = messageText.substring(4).trim();
        }
        // Only add "Me: " prefix if current user sent the last message
        if (currentUserId && conversation.last_message_sender_id === currentUserId) {
          return 'Me: ' + messageText;
        }
        return messageText;
      })()
    : 'No messages yet';

  return (
    <>
      <button
        onClick={onClick}
        onContextMenu={handleContextMenu}
        className={`w-full flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 lg:py-3 transition-colors text-left ${
          isActive ? '' : 'hover:brightness-110'
        }`}
        style={isActive ? { backgroundColor: '#0f0f13' } : { backgroundColor: 'transparent' }}
      >
        <Avatar
          src={user.avatar_url}
          name={user.name}
          size="lg"
          isAdmin={user.is_admin}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-sm lg:text-base font-medium truncate" style={{ color: '#F8FAFC' }}>{user.name}</span>
            <span className="text-[10px] lg:text-xs flex-shrink-0 ml-2" style={{ color: '#64748B' }}>
              {formatLastMessageTime(conversation.last_message_at)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs lg:text-sm truncate pr-2" style={{ color: '#94A3B8' }}>
              {lastMessagePreview}
            </p>
            {count > 0 && (
              <span className="flex-shrink-0 min-w-[18px] lg:min-w-[20px] h-4 lg:h-5 px-1 lg:px-1.5 flex items-center justify-center text-[10px] lg:text-xs font-medium rounded-full" style={{ backgroundColor: '#ef4444', color: '#FFFFFF' }}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </div>
        </div>
      </button>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onPin={handlePin}
          isPinned={conversation.is_pinned}
        />
      )}
    </>
  );
});

