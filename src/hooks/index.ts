// Messaging System Hooks - Export all chat-related hooks

// Main chat hooks
export {
  useChat,
  useCustomerConversations,
  useProfile,
  usePresence,
  useAdminConversations,
  getAdminId,
  getOrCreateAdminConversation,
  getOrCreateUserConversation,
} from './useChat';

// Fix 18: Block and Mute
export { useBlocking } from './useBlocking';
export { useMuting } from './useMuting';

// Fix 20: Conversation Actions (archive, delete, pin)
export { useConversationActions } from './useConversationActions';

// Fix 21: Global Unread Count
export { useUnreadCount } from './useUnreadCount';

// Fix 22: Drafts
export { useDrafts } from './useDrafts';

// Fix 23: Typing Indicators
export { useTypingIndicator } from './useTypingIndicator';

// Fix 24: Online Presence
export { usePresenceChannel, updateLastSeen } from './usePresenceChannel';

// Fix 14: Infinite Messages
export { useInfiniteMessages } from './useInfiniteMessages';
