// Admin conversation cache utility for instant loading
import type { Conversation, Profile } from '../types/chat';

const CACHE_KEY = 'admin_conversations_cache';
const CACHE_VERSION = '3';
const MAX_CACHE_AGE = 10 * 60 * 1000; // 10 minutes

type ConversationWithCustomer = Conversation & { customer: Profile };

interface CachedAdminConversations {
  conversations: ConversationWithCustomer[];
  timestamp: number;
  version: string;
  adminId: string;
}

// Get cached conversations for an admin
export function getCachedAdminConversations(adminId: string): ConversationWithCustomer[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedAdminConversations = JSON.parse(cached);

      // Check version and admin match
      if (data.version !== CACHE_VERSION || data.adminId !== adminId) {
        return null;
      }

      // Check cache age
      const age = Date.now() - data.timestamp;
      if (age > MAX_CACHE_AGE) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data.conversations || null;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// Cache conversations for an admin
export function cacheAdminConversations(adminId: string, conversations: ConversationWithCustomer[]): void {
  try {
    const data: CachedAdminConversations = {
      conversations,
      timestamp: Date.now(),
      version: CACHE_VERSION,
      adminId,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore errors (sessionStorage might be full)
  }
}

// Clear cached admin conversations
export function clearCachedAdminConversations(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore errors
  }
}
