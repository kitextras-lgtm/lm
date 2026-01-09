import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { 
  getCachedProfile, 
  cacheProfile, 
  clearProfileCache, 
  updateCachedProfile,
  CachedUserProfile 
} from '../utils/profileCache';
import { preloadAndCacheImage } from '../utils/imageCache';

interface UserProfileContextType {
  profile: CachedUserProfile | null;
  userId: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<CachedUserProfile>) => void;
  clearCache: () => void;
  prefetchProfile: (userId: string) => Promise<CachedUserProfile | null>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

interface UserProfileProviderProps {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const [profile, setProfile] = useState<CachedUserProfile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile from server (Edge Function or direct query)
  const fetchProfileFromServer = useCallback(async (uid: string): Promise<CachedUserProfile | null> => {
    try {
      // Try Edge Function first (bypasses RLS)
      const fetchUrl = `${SUPABASE_URL}/functions/v1/get-profile?userId=${uid}`;
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          const userData = data.user;
          const profileData: CachedUserProfile = {
            id: userData.id,
            email: userData.email || '',
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            username: userData.username || '',
            profile_picture_url: userData.profile_picture_url || null,
            banner_url: userData.banner_url || null,
            location: userData.location || '',
            primary_language: userData.primary_language || 'English',
            user_type: userData.user_type || '',
            created_at: userData.created_at || '',
            updated_at: userData.updated_at || new Date().toISOString(),
          };
          return profileData;
        }
      }

      // Fallback: direct query from users table
      const { data: userResult, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (queryError) {
        console.error('[UserProfileContext] Query error:', queryError);
        return null;
      }

      if (userResult) {
        const profileData: CachedUserProfile = {
          id: userResult.id,
          email: userResult.email || '',
          first_name: userResult.first_name || '',
          last_name: userResult.last_name || '',
          username: userResult.username || '',
          profile_picture_url: userResult.profile_picture_url || null,
          banner_url: userResult.banner_url || null,
          location: userResult.location || '',
          primary_language: userResult.primary_language || 'English',
          user_type: userResult.user_type || '',
          created_at: userResult.created_at || '',
          updated_at: userResult.updated_at || new Date().toISOString(),
        };
        return profileData;
      }

      return null;
    } catch (err) {
      console.error('[UserProfileContext] Fetch error:', err);
      return null;
    }
  }, []);

  // Initialize: Load cached profile instantly, then refresh in background
  const initializeProfile = useCallback(async () => {
    try {
      // Get user ID from auth or localStorage
      const { data: { user } } = await supabase.auth.getUser();
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const verifiedEmail = localStorage.getItem('verifiedEmail');
      
      let uid = user?.id || verifiedUserId;

      // If we have email but no userId, try to find user by email
      if (!uid && verifiedEmail) {
        const { data: usersByEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', verifiedEmail)
          .maybeSingle();

        if (usersByEmail?.id) {
          uid = usersByEmail.id;
          localStorage.setItem('verifiedUserId', uid as string);
        }
      }

      if (!uid) {
        setIsLoading(false);
        return;
      }

      setUserId(uid);

      // INSTANT: Load from cache first
      const cached = getCachedProfile(uid);
      if (cached) {
        setProfile(cached);
        setIsLoading(false);
        
        // Preload profile picture from cache
        if (cached.profile_picture_url && typeof cached.profile_picture_url === 'string') {
          preloadAndCacheImage(cached.profile_picture_url);
        }

        // BACKGROUND: Refresh from server
        setIsRefreshing(true);
        const fresh = await fetchProfileFromServer(uid);
        if (fresh) {
          // Only update if data changed
          if (JSON.stringify(fresh) !== JSON.stringify(cached)) {
            setProfile(fresh);
            cacheProfile(uid, fresh);
            
            // Preload new profile picture if changed
            if (fresh.profile_picture_url && fresh.profile_picture_url !== cached.profile_picture_url) {
              preloadAndCacheImage(fresh.profile_picture_url);
            }
          }
        }
        setIsRefreshing(false);
      } else {
        // No cache: fetch from server (first-time user)
        const fresh = await fetchProfileFromServer(uid);
        if (fresh) {
          setProfile(fresh);
          cacheProfile(uid, fresh);
          
          // Preload profile picture
          if (fresh.profile_picture_url) {
            preloadAndCacheImage(fresh.profile_picture_url);
          }
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[UserProfileContext] Init error:', err);
      setError('Failed to load profile');
      setIsLoading(false);
    }
  }, [fetchProfileFromServer]);

  // Refetch profile (force refresh from server)
  const refetch = useCallback(async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    setError(null);
    
    const fresh = await fetchProfileFromServer(userId);
    if (fresh) {
      setProfile(fresh);
      cacheProfile(userId, fresh);
    } else {
      setError('Failed to refresh profile');
    }
    
    setIsRefreshing(false);
  }, [userId, fetchProfileFromServer]);

  // Update profile optimistically (for instant UI feedback after edits)
  const updateProfile = useCallback((updates: Partial<CachedUserProfile>) => {
    if (!userId || !profile) return;
    
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);
    updateCachedProfile(userId, updates);
  }, [userId, profile]);

  // Clear cache (call on logout)
  const clearCache = useCallback(() => {
    clearProfileCache();
    setProfile(null);
    setUserId(null);
  }, []);

  // Prefetch profile for a specific user (call after login)
  const prefetchProfile = useCallback(async (uid: string): Promise<CachedUserProfile | null> => {
    const fresh = await fetchProfileFromServer(uid);
    if (fresh) {
      cacheProfile(uid, fresh);
      setProfile(fresh);
      setUserId(uid);
      
      // Preload profile picture
      if (fresh.profile_picture_url) {
        preloadAndCacheImage(fresh.profile_picture_url);
      }
    }
    return fresh;
  }, [fetchProfileFromServer]);

  // Initialize on mount
  useEffect(() => {
    initializeProfile();
  }, [initializeProfile]);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearCache();
      } else if (event === 'SIGNED_IN' && session?.user?.id) {
        // Prefetch profile after sign in
        prefetchProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearCache, prefetchProfile]);

  // Re-fetch when tab becomes visible (stale-while-revalidate)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && userId) {
        refetch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId, refetch]);

  const value: UserProfileContextType = {
    profile,
    userId,
    isLoading,
    isRefreshing,
    error,
    refetch,
    updateProfile,
    clearCache,
    prefetchProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

/**
 * Hook to access user profile with instant loading from cache
 * 
 * Usage:
 * ```tsx
 * const { profile, isLoading, isRefreshing, updateProfile } = useUserProfile();
 * 
 * // Profile loads instantly from cache
 * // isRefreshing is true while background refresh happens
 * // updateProfile for optimistic updates after edits
 * ```
 */
export function useUserProfile(): UserProfileContextType {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}

/**
 * Hook to get just the display name (first + last name)
 */
export function useDisplayName(): string {
  const { profile } = useUserProfile();
  if (!profile) return '';
  return [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username || '';
}

/**
 * Hook to get profile picture URL
 */
export function useProfilePicture(): string | null {
  const { profile } = useUserProfile();
  return profile?.profile_picture_url || null;
}
