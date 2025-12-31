// Conversation cache utility to store conversations locally for instant loading
const CACHE_KEY = 'conversations_cache';
const CACHE_VERSION = '1';
const MAX_CACHE_AGE = 10 * 60 * 1000; // 10 minutes

interface CachedConversations {
  conversations: any[];
  timestamp: number;
  version: string;
  customerId: string;
}

// Get cached conversations for a customer
export function getCachedConversations(customerId: string): any[] | null {
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
  } catch (error) {
    // Ignore errors
  }
  return null;
}

// Cache conversations for a customer
export function cacheConversations(customerId: string, conversations: any[]): void {
  try {
    const data: CachedConversations = {
      conversations,
      timestamp: Date.now(),
      version: CACHE_VERSION,
      customerId,
    };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to cache conversations:', error);
  }
}

// Clear cached conversations
export function clearCachedConversations(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch (error) {
    // Ignore errors
  }
}
