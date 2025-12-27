// Message cache utility to store messages locally for instant loading
const CACHE_PREFIX = 'messages_cache_';
const CACHE_VERSION = '1';
const MAX_CACHE_AGE = 5 * 60 * 1000; // 5 minutes

interface CachedMessages {
  messages: any[];
  timestamp: number;
  version: string;
}

// Get cached messages for a conversation
export function getCachedMessages(conversationId: string): any[] | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + conversationId);
    if (cached) {
      const data: CachedMessages = JSON.parse(cached);
      
      // Check version
      if (data.version !== CACHE_VERSION) {
        return null;
      }
      
      // Check cache age
      const age = Date.now() - data.timestamp;
      if (age > MAX_CACHE_AGE) {
        // Cache expired, remove it
        localStorage.removeItem(CACHE_PREFIX + conversationId);
        return null;
      }
      
      return data.messages || null;
    }
  } catch (error) {
    // Ignore errors
  }
  return null;
}

// Cache messages for a conversation
export function cacheMessages(conversationId: string, messages: any[]): void {
  try {
    const data: CachedMessages = {
      messages,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    localStorage.setItem(CACHE_PREFIX + conversationId, JSON.stringify(data));
  } catch (error) {
    // Ignore errors (localStorage might be full)
    console.warn('Failed to cache messages:', error);
  }
}

// Clear cached messages for a conversation
export function clearCachedMessages(conversationId: string): void {
  try {
    localStorage.removeItem(CACHE_PREFIX + conversationId);
  } catch (error) {
    // Ignore errors
  }
}

// Clear all cached messages (useful for cleanup)
export function clearAllCachedMessages(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    // Ignore errors
  }
}

