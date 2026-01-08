// Conversation cache utility to store conversations locally for instant loading
import type { Conversation, Profile } from '../types/chat';

const CACHE_KEY = 'conversations_cache';
const CACHE_VERSION = '1';
const MAX_CACHE_AGE = 10 * 60 * 1000; // 10 minutes

type ConversationWithAdmin = Conversation & { admin: Profile };

interface CachedConversations {
  conversations: ConversationWithAdmin[];
  timestamp: number;
  version: string;
  customerId: string;
}

// Get cached conversations for a customer
export function getCachedConversations(customerId: string): ConversationWithAdmin[] | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: CachedConversations = JSON.parse(cached);

      // Check version and customer match
      if (data.version !== CACHE_VERSION || data.customerId !== customerId) {
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

// Cache conversations for a customer
export function cacheConversations(customerId: string, conversations: ConversationWithAdmin[]): void {
  try {
    const data: CachedConversations = {
      conversations,
      timestamp: Date.now(),
      version: CACHE_VERSION,
      customerId,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore errors (sessionStorage might be full)
  }
}

// Clear cached conversations
export function clearCachedConversations(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore errors
  }
}
