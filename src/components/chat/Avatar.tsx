import { useState, useEffect, useRef } from 'react';
import { getCachedImage, preloadAndCacheImage } from '../../utils/imageCache';
import { DEFAULT_AVATAR_DATA_URI, ELEVATE_ADMIN_AVATAR_URL } from '../DefaultAvatar';

interface AvatarProps {
  src: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  showOnlineIndicator?: boolean;
  isAdmin?: boolean;
}

const sizeClasses = {
  sm: { container: 'w-8 h-8' },
  md: { container: 'w-10 h-10' },
  lg: { container: 'w-12 h-12' },
};

// Preload image immediately
function preloadImage(src: string, onLoad: () => void, onError: () => void) {
  const img = new Image();
  img.onload = onLoad;
  img.onerror = onError;
  img.src = src;
  return img;
}

export function Avatar({ src, name, size = 'md', isOnline, showOnlineIndicator = false, isAdmin = false }: AvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [cachedImageUrl, setCachedImageUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  
  // For admin, use the Elevate admin avatar URL; otherwise use provided src
  const effectiveSrc = isAdmin ? ELEVATE_ADMIN_AVATAR_URL : (src || '');
  const hasValidSrc = effectiveSrc && effectiveSrc.trim() !== '';

  // Check cache first for instant display
  useEffect(() => {
    if (!hasValidSrc) {
      setImageError(true);
      return;
    }

    // Check if we have a cached version
    const cached = getCachedImage(effectiveSrc);
    if (cached) {
      setCachedImageUrl(cached);
      setImageLoaded(true);
      // Still preload the fresh version in background
      preloadAndCacheImage(effectiveSrc);
    } else {
      // Start caching in background
      preloadAndCacheImage(effectiveSrc);
      
      // Load image normally
      setImageLoaded(false);
      setImageError(false);
      
      const img = preloadImage(
        effectiveSrc,
        () => setImageLoaded(true),
        () => setImageError(true)
      );
      
      imgRef.current = img;
      
      return () => {
        if (imgRef.current) {
          imgRef.current.onload = null;
          imgRef.current.onerror = null;
        }
      };
    }
  }, [effectiveSrc, hasValidSrc]);

  const imageUrl = cachedImageUrl || effectiveSrc;
  const showRealImage = hasValidSrc && (imageLoaded || cachedImageUrl) && !imageError;
  const defaultAvatar = DEFAULT_AVATAR_DATA_URI;

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizeClasses[size].container} rounded-full flex items-center justify-center overflow-hidden relative`}
      >
        {/* Default avatar - always visible instantly with shake animation */}
        <img
          src={defaultAvatar}
          alt={name}
          className={`${sizeClasses[size].container} rounded-full object-cover absolute inset-0 default-avatar-shake`}
          style={{
            opacity: showRealImage ? 0 : 1,
            transition: 'opacity 0.2s ease-in-out'
          }}
        />
        
        {/* Real image - fades in when loaded */}
        {hasValidSrc && (
          <img
            src={imageUrl}
            alt={name}
            className={`${sizeClasses[size].container} rounded-full object-cover absolute inset-0`}
            style={{
              opacity: showRealImage ? 1 : 0,
              transition: showRealImage && !cachedImageUrl ? 'opacity 0.15s ease-in-out' : 'none'
            }}
            onLoad={() => {
              if (!cachedImageUrl) {
                setImageLoaded(true);
              }
            }}
            onError={() => setImageError(true)}
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        )}
      </div>
      {showOnlineIndicator && (
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 rounded-full z-10`}
          style={{
            borderColor: '#111111',
            backgroundColor: isOnline ? '#10b981' : '#64748B'
          }}
        />
      )}
    </div>
  );
}


