// Image cache utility to store avatar images locally for instant loading
const CACHE_PREFIX = 'avatar_cache_';
const CACHE_VERSION = '1';

// Convert image URL to base64 and cache it
async function imageToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // Silently fail - caching is optional
    return null;
  }
}

// Get cached image
export function getCachedImage(url: string): string | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + url);
    if (cached) {
      const { data, version } = JSON.parse(cached);
      if (version === CACHE_VERSION) {
        return data;
      }
    }
  } catch (error) {
    // Ignore errors
  }
  return null;
}

// Cache image
export async function cacheImage(url: string): Promise<void> {
  try {
    // Check if already cached
    if (getCachedImage(url)) {
      return;
    }

    const base64 = await imageToBase64(url);
    if (base64) {
      localStorage.setItem(
        CACHE_PREFIX + url,
        JSON.stringify({
          data: base64,
          version: CACHE_VERSION,
          timestamp: Date.now(),
        })
      );
    }
  } catch (error) {
    // Silently fail - caching is optional
  }
}

// Preload and cache image
export function preloadAndCacheImage(url: string): void {
  if (!url) return;
  
  // Check if already cached
  if (getCachedImage(url)) {
    return;
  }

  // Start caching in background with high priority
  const img = new Image();
  img.crossOrigin = 'anonymous'; // Enable CORS for Supabase images
  img.loading = 'eager'; // Eager loading
  img.fetchPriority = 'high'; // High priority
  
  img.onload = () => {
    cacheImage(url).catch(() => {
      // Silently fail - caching is optional
    });
  };
  img.onerror = () => {
    // Silently fail - caching is optional
  };
  img.src = url;
}

