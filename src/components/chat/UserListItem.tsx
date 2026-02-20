import { useState, memo } from 'react';
import { Avatar } from './Avatar';
import { ContextMenu } from './ContextMenu';
import type { Profile, Conversation } from '../../types/chat';
import { formatLastMessageTime } from '../../utils/dateUtils';

type UserType = 'artist' | 'creator' | 'freelancer' | 'business';

function AccountTypeIcon({ userType }: { userType: UserType }) {
  const s = 13;
  if (userType === 'artist') {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: s, height: s, flexShrink: 0, opacity: 0.55 }} color="currentColor">
        <path d="M12 28C12 20.268 18.268 14 26 14H22C29.732 14 36 20.268 36 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <rect x="8" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="32" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="10" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
        <rect x="34" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>
    );
  }
  if (userType === 'creator') {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: s, height: s, flexShrink: 0, opacity: 0.55 }} color="currentColor">
        <rect x="14" y="6" width="20" height="36" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="20" y="9" width="8" height="2" rx="1" fill="currentColor" opacity="0.4"/>
        <rect x="21" y="38" width="6" height="2" rx="1" fill="currentColor" opacity="0.4"/>
        <rect x="16" y="14" width="10" height="8" rx="2" fill="currentColor" opacity="0.2"/>
        <path d="M20 16L23 18L20 20V16Z" fill="currentColor" opacity="0.8"/>
        <rect x="26" y="14" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8"/>
        <circle cx="30" cy="18" r="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
        <circle cx="32.5" cy="15.5" r="0.8" fill="currentColor" opacity="0.6"/>
      </svg>
    );
  }
  if (userType === 'freelancer') {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: s, height: s, flexShrink: 0, opacity: 0.55 }} color="currentColor">
        <rect x="12" y="10" width="24" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="21" y="20" width="6" height="24" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="22" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="22" y1="37" x2="26" y2="37" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  }
  if (userType === 'business') {
    return (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: s, height: s, flexShrink: 0, opacity: 0.55 }} color="currentColor">
        <rect x="6" y="18" width="36" height="22" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M18 18V14C18 12.8954 18.8954 12 20 12H28C29.1046 12 30 12.8954 30 14V18" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="6" y="18" width="36" height="8" rx="3" stroke="currentColor" strokeWidth="2" fill="black"/>
        <rect x="21" y="24" width="6" height="4" rx="1" fill="currentColor"/>
      </svg>
    );
  }
  return null;
}

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
  // Fix: Use the correct unread field based on user's role in the conversation
  const count = unreadCount !== undefined 
    ? unreadCount 
    : (currentUserId && conversation.customer_id === currentUserId 
        ? conversation.unread_count_customer 
        : conversation.unread_count_admin);
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
        style={isActive ? { backgroundColor: 'var(--bg-elevated)' } : { backgroundColor: 'transparent' }}
      >
        <Avatar
          src={user.avatar_url}
          name={user.name}
          size="lg"
          isAdmin={user.is_admin}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm lg:text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
              {user.user_type && !user.is_admin && <AccountTypeIcon userType={user.user_type as UserType} />}
            </span>
            <span className="text-[10px] lg:text-xs flex-shrink-0 ml-2" style={{ color: 'var(--text-secondary)' }}>
              {formatLastMessageTime(conversation.last_message_at)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs lg:text-sm truncate pr-2" style={{ color: 'var(--text-secondary)' }}>
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

