// Fix 11: Centralized Cache Management with TTL and Version

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_VERSION = 1; // Increment when data structure changes

const CACHE_TTL = {
  conversations: 5 * 60 * 1000,  // 5 minutes
  messages: 10 * 60 * 1000,      // 10 minutes
  users: 30 * 60 * 1000,         // 30 minutes
};

export type CacheTTLType = keyof typeof CACHE_TTL;

export const cache = {
  set<T>(key: string, data: T, _ttlType: CacheTTLType): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      // Storage full - clear old entries
      this.cleanup();
      try {
        localStorage.setItem(key, JSON.stringify(entry));
      } catch {
        console.warn('Cache storage failed');
      }
    }
  },

  get<T>(key: string, ttlType: CacheTTLType): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const entry: CacheEntry<T> = JSON.parse(raw);

      // Version mismatch - invalidate
      if (entry.version !== CACHE_VERSION) {
        localStorage.removeItem(key);
        return null;
      }

      // TTL expired - invalidate
      if (Date.now() - entry.timestamp > CACHE_TTL[ttlType]) {
        localStorage.removeItem(key);
        return null;
      }

      return entry.data;
    } catch {
      localStorage.removeItem(key);
      return null;
    }
  },

  invalidate(pattern: string): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    });
  },

  invalidateConversation(conversationId: string): void {
    this.invalidate(`messages_cache_${conversationId}`);
    this.invalidate(`conversation_${conversationId}`);
  },

  invalidateAllForUser(userId: string): void {
    this.invalidate(`_${userId}`);
  },

  cleanup(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();

    keys.forEach(key => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return;

        const entry = JSON.parse(raw);

        // Remove entries older than 24 hours regardless of TTL
        if (entry.timestamp && now - entry.timestamp > 24 * 60 * 60 * 1000) {
          localStorage.removeItem(key);
        }

        // Remove entries with old version
        if (entry.version && entry.version !== CACHE_VERSION) {
          localStorage.removeItem(key);
        }
      } catch {
        // Invalid JSON - remove
        localStorage.removeItem(key);
      }
    });
  },
};

// Run cleanup on module load
if (typeof window !== 'undefined') {
  cache.cleanup();
}
