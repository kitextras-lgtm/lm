// Profile cache utility for instant loading like Twitter/Instagram
// Uses localStorage for persistence across sessions

const PROFILE_CACHE_KEY = 'user_profile_cache';
const PROFILE_CACHE_VERSION = '1';

export interface CachedUserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  profile_picture_url: string | null;
  location: string;
  primary_language: string;
  user_type: string;
  created_at: string;
  updated_at: string;
}

interface ProfileCacheData {
  profile: CachedUserProfile;
  userId: string;
  timestamp: number;
  version: string;
}

/**
 * Get cached user profile from localStorage
 * Returns null if cache is missing, expired, or for different user
 */
export function getCachedProfile(userId: string): CachedUserProfile | null {
  if (!userId) return null;
  
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;
    
    const data: ProfileCacheData = JSON.parse(cached);
    
    // Check version and user match
    if (data.version !== PROFILE_CACHE_VERSION || data.userId !== userId) {
      return null;
    }
    
    // Cache is valid indefinitely for instant loading
    // Background refresh will update it
    return data.profile;
  } catch (error) {
    console.warn('[profileCache] Error reading cache:', error);
    return null;
  }
}

/**
 * Save user profile to localStorage cache
 */
export function cacheProfile(userId: string, profile: CachedUserProfile): void {
  if (!userId || !profile) return;
  
  try {
    const data: ProfileCacheData = {
      profile,
      userId,
      timestamp: Date.now(),
      version: PROFILE_CACHE_VERSION,
    };
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[profileCache] Error saving cache:', error);
  }
}

/**
 * Update specific fields in the cached profile
 * Useful for optimistic updates after profile edits
 */
export function updateCachedProfile(userId: string, updates: Partial<CachedUserProfile>): void {
  const cached = getCachedProfile(userId);
  if (!cached) return;
  
  const updated = { ...cached, ...updates, updated_at: new Date().toISOString() };
  cacheProfile(userId, updated);
}

/**
 * Clear the profile cache (call on logout)
 */
export function clearProfileCache(): void {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch (error) {
    console.warn('[profileCache] Error clearing cache:', error);
  }
}

/**
 * Check if profile cache exists for a user
 */
export function hasProfileCache(userId: string): boolean {
  return getCachedProfile(userId) !== null;
}

/**
 * Get cache timestamp (for debugging/staleness checks)
 */
export function getProfileCacheTimestamp(userId: string): number | null {
  if (!userId) return null;
  
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!cached) return null;
    
    const data: ProfileCacheData = JSON.parse(cached);
    if (data.userId !== userId) return null;
    
    return data.timestamp;
  } catch {
    return null;
  }
}
