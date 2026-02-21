import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, X, ExternalLink, Youtube, Instagram, Music2, Twitter, Twitch, Link2, CheckCircle } from 'lucide-react';
import type { Profile } from '../../types/chat';
import { DEFAULT_AVATAR_DATA_URI, ELEVATE_ADMIN_AVATAR_URL } from '../DefaultAvatar';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabase';

const SOCIAL_LINKS_FN = `${SUPABASE_URL}/functions/v1/social-links`;
const fnHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` };

const platformIcons: { [key: string]: React.ElementType } = {
  YouTube: Youtube,
  Instagram: Instagram,
  TikTok: Music2,
  Twitter: Twitter,
  Twitch: Twitch,
  Other: Link2,
};

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_name: string;
  verified: boolean;
}

interface UserProfilePopupProps {
  user: Profile;
  onClose: () => void;
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white';
}

function UserProfilePopup({ user, onClose, backgroundTheme: _backgroundTheme }: UserProfilePopupProps) {
  const modalBg = 'var(--bg-card)';
  const borderColor = 'var(--border-default)';
  const dividerColor = 'var(--border-subtle)';
  const rowHover = 'hover:bg-white/5';
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user.is_admin) {
      setLoadingLinks(false);
      return;
    }
    fetch(`${SOCIAL_LINKS_FN}?userId=${user.id}`, { headers: fnHeaders })
      .then(r => r.json())
      .then(json => { if (json.success) setLinks(json.links || []); })
      .catch(() => {})
      .finally(() => setLoadingLinks(false));
  }, [user.id, user.is_admin]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ backgroundColor: modalBg, border: `1px solid ${borderColor}` }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full transition-colors hover:bg-white/10 z-10"
          style={{ color: 'var(--text-primary)' }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar + name section */}
        <div className="flex flex-col items-center pt-8 pb-5 px-6" style={{ borderBottom: `1px solid ${dividerColor}` }}>
          <img
            src={user.is_admin ? ELEVATE_ADMIN_AVATAR_URL : (user.avatar_url || DEFAULT_AVATAR_DATA_URI)}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover mb-3"
            style={{ border: '2px solid rgba(255,255,255,0.15)' }}
          />
          <h3 className="text-lg font-semibold text-center" style={{ color: 'var(--text-primary)' }}>{user.name}</h3>
          {user.username && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>@{user.username}</p>
          )}
          {user.user_type && (
            <span
              className="mt-2 px-3 py-0.5 rounded-full text-xs font-medium capitalize"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
            >
              {user.user_type}
            </span>
          )}
        </div>

        {/* Social links section */}
        {!user.is_admin && (
          <div className="px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-primary)' }}>Social Links</p>
            {loadingLinks ? (
              <div className="flex justify-center py-4">
                <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(255,255,255,0.2)', borderTopColor: 'rgba(255,255,255,0.7)' }} />
              </div>
            ) : links.length === 0 ? (
              <p className="text-sm text-center py-3" style={{ color: 'var(--text-primary)' }}>No social links added</p>
            ) : (
              <div className="space-y-1">
                {links.map(link => {
                  const Icon = platformIcons[link.platform] || Link2;
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors group ${rowHover}`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <Icon className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate" style={{ color: '#E2E8F0' }}>
                            {link.display_name || link.platform}
                          </span>
                          {link.verified && <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: '#22C55E' }} />}
                        </div>
                        <span className="text-xs truncate block" style={{ color: 'var(--text-primary)' }}>
                          {link.url.replace(/^https?:\/\//i, '')}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-primary)' }} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface AnimatedIconProps {
  className?: string;
  style?: React.CSSProperties;
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white';
}

// Video Camera Icon Component
function VideoCameraIcon({ className, style }: AnimatedIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`cursor-pointer flex items-center justify-center ${className}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 overflow-visible">
        {/* Camera body */}
        <rect 
          x="4" y="14" width="28" height="20" rx="3" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none"
          style={{ 
            transform: isHovered ? "scale(1.05)" : "scale(1)", 
            transformOrigin: "18px 24px", 
            transition: "transform 0.3s ease" 
          }} 
        />
        
        {/* Camera lens */}
        <circle 
          cx="18" cy="24" r="6" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none"
          style={{ 
            transform: isHovered ? "scale(1.1)" : "scale(1)", 
            transformOrigin: "18px 24px", 
            transition: "transform 0.3s ease 0.05s" 
          }} 
        />
        
        {/* Lens center */}
        <circle 
          cx="18" cy="24" r="3" 
          fill="currentColor" 
          style={{ 
            opacity: isHovered ? 0.8 : 0.4, 
            transition: "opacity 0.3s ease" 
          }} 
        />
        
        {/* Lens reflection */}
        <circle 
          cx="16" cy="22" r="1" 
          fill="currentColor" 
          style={{ 
            opacity: isHovered ? 0.6 : 0.2, 
            transition: "opacity 0.3s ease 0.1s" 
          }} 
        />
        
        {/* Camera lens */}
        <path 
          d="M32 18L44 12V36L32 30V18Z" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinejoin="round" 
          fill="none"
          style={{ 
            transform: isHovered ? "translateX(2px) scale(1.1)" : "translateX(0) scale(1)", 
            transformOrigin: "32px 24px", 
            transition: "transform 0.3s ease" 
          }} 
        />
        
        {/* Recording light */}
        <circle 
          cx="8" cy="18" r="2" 
          fill="#ef4444"
          style={{ 
            opacity: isHovered ? 1 : 0, 
            transform: isHovered ? "scale(1)" : "scale(0)", 
            transformOrigin: "8px 18px", 
            transition: "all 0.3s ease" 
          }} 
        />
        
        {/* Recording light glow */}
        <circle 
          cx="8" cy="18" r="2" 
          fill="#ef4444"
          style={{ 
            opacity: isHovered ? 0.3 : 0, 
            transform: isHovered ? "scale(2.5)" : "scale(0)", 
            transformOrigin: "8px 18px", 
            transition: "all 0.5s ease" 
          }} 
        />
      </svg>
    </div>
  );
}

// Calendar Icon Component
function CalendarIcon({ className, style }: AnimatedIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`cursor-pointer flex items-center justify-center ${className}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 overflow-visible">
        {/* Calendar body */}
        <rect 
          x="6" y="10" width="36" height="32" rx="3" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none"
          style={{ 
            transform: isHovered ? "scale(1.05)" : "scale(1)", 
            transformOrigin: "24px 26px", 
            transition: "transform 0.3s ease" 
          }} 
        />
        
        {/* Header line */}
        <line 
          x1="6" y1="18" x2="42" y2="18" 
          stroke="currentColor" 
          strokeWidth="3"
          style={{ opacity: isHovered ? 0.8 : 0.6, transition: "opacity 0.3s ease" }}
        />
        
        {/* Ring bindings */}
        <line 
          x1="14" y1="6" x2="14" y2="14" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round"
          style={{ 
            transform: isHovered ? "translateY(-1px)" : "translateY(0)", 
            transition: "transform 0.3s ease" 
          }} 
        />
        <line 
          x1="34" y1="6" x2="34" y2="14" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round"
          style={{ 
            transform: isHovered ? "translateY(-1px)" : "translateY(0)", 
            transition: "transform 0.3s ease 0.05s" 
          }} 
        />
        
        {/* Date dots that appear on hover */}
        <circle cx="12" cy="24" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.1s" }} />
        <circle cx="18" cy="24" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.15s" }} />
        <circle cx="24" cy="24" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 1 : 0.4, transition: "opacity 0.3s ease 0.2s" }} />
        <circle cx="30" cy="24" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.25s" }} />
        <circle cx="36" cy="24" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.3s" }} />
        
        <circle cx="12" cy="30" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.35s" }} />
        <circle cx="18" cy="30" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.4s" }} />
        <circle cx="24" cy="30" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.45s" }} />
        <circle cx="30" cy="30" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.5s" }} />
        <circle cx="36" cy="30" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.55s" }} />
        
        <circle cx="12" cy="36" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.4 : 0.1, transition: "opacity 0.3s ease 0.6s" }} />
        <circle cx="18" cy="36" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.4 : 0.1, transition: "opacity 0.3s ease 0.65s" }} />
        <circle cx="24" cy="36" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.7s" }} />
        <circle cx="30" cy="36" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.4 : 0.1, transition: "opacity 0.3s ease 0.75s" }} />
        <circle cx="36" cy="36" r="1.5" fill="currentColor" style={{ opacity: isHovered ? 0.4 : 0.1, transition: "opacity 0.3s ease 0.8s" }} />
        
        {/* Highlight effect on hover */}
        <rect 
          x="8" y="20" width="32" height="22" 
          fill="rgba(255,255,255,0.05)" 
          style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.3s ease" }} 
        />
      </svg>
    </div>
  );
}

// Drawer Icon Component
function DrawerIcon({ className, style, isDrawerOpen, backgroundTheme }: AnimatedIconProps & { isDrawerOpen?: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`cursor-pointer flex items-center justify-center ${className}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 overflow-visible">
        {/* Main container */}
        <rect 
          x="6" y="6" width="36" height="36" rx="3" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none"
          style={{ 
            transform: isHovered ? "scale(1.02)" : "scale(1)", 
            transformOrigin: "24px 24px", 
            transition: "transform 0.3s ease" 
          }} 
        />
        
        {/* Top section - always visible */}
        <rect 
          x="10" y="10" width="28" height="8" rx="1" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none" 
          style={{ opacity: 0.6 }} 
        />
        <line 
          x1="20" y1="14" x2="28" y2="14" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          style={{ opacity: 0.6 }} 
        />
        
        {/* Middle section - slides down on hover or when drawer is open */}
        <g style={{ 
          transform: (isHovered || isDrawerOpen) ? "translateY(12px) scale(1.05)" : "translateY(0) scale(1)", 
          transformOrigin: "24px 24px", 
          transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)" 
        }}>
          <rect 
            x="10" y="20" width="28" height="8" rx="1" 
            stroke="currentColor" 
            strokeWidth="3" 
            fill='var(--bg-primary)' 
          />
          <line 
            x1="20" y1="24" x2="28" y2="24" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          
          {/* Content items that appear on hover or when drawer is open */}
          <g style={{ opacity: (isHovered || isDrawerOpen) ? 1 : 0, transition: "opacity 0.3s ease 0.15s" }}>
            {/* Document icons */}
            <rect x="12" y="22" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.7" />
            <rect x="17" y="22" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.5" />
            <rect x="22" y="22" width="4" height="4" rx="0.5" fill="currentColor" opacity="0.6" />
            
            {/* Small details on documents */}
            <line x1="13" y1="23.5" x2="15" y2="23.5" stroke='rgba(0,0,0,0.5)' strokeWidth="0.5" />
            <line x1="18" y1="23.5" x2="20" y2="23.5" stroke='rgba(0,0,0,0.5)' strokeWidth="0.5" />
            <line x1="23" y1="23.5" x2="25" y2="23.5" stroke='rgba(0,0,0,0.5)' strokeWidth="0.5" />
          </g>
        </g>
        
        {/* Bottom section - always visible */}
        <rect 
          x="10" y="30" width="28" height="8" rx="1" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none" 
          style={{ opacity: 0.6 }} 
        />
        <line 
          x1="20" y1="34" x2="28" y2="34" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          style={{ opacity: 0.6 }} 
        />
        
        {/* Slide indicator/shadow */}
        <rect 
          x="10" y="28" width="28" height="4" 
          fill="currentColor" 
          style={{ 
            opacity: isHovered ? 0.2 : 0, 
            transition: "opacity 0.3s ease" 
          }} 
        />
        
        {/* Handle indicator */}
        <rect 
          x="20" y="8" width="8" height="2" rx="1" 
          fill="currentColor" 
          style={{ 
            opacity: isHovered ? 0.8 : 0.4, 
            transition: "opacity 0.3s ease" 
          }} 
        />
      </svg>
    </div>
  );
}

interface ChatHeaderProps {
  user: Profile;
  isTyping?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  onVideoCall?: () => void;
  onScheduleMeeting?: () => void;
  onOpenDrawer?: () => void;
  isDrawerOpen?: boolean;
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white';
}

export function ChatHeader({ user, isTyping, onBack, showBackButton, onVideoCall, onScheduleMeeting, onOpenDrawer, isDrawerOpen, backgroundTheme = 'dark' }: ChatHeaderProps) {
  const { profile } = useUserProfile();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  // Only show icons if profile is loaded AND user is not an artist
  const shouldShowIcons = profile && profile.user_type !== 'artist';

  return (
    <>
    <div className="h-14 lg:h-16 px-3 lg:px-4 flex items-center justify-between min-w-0" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)' }}>
      <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-1.5 lg:p-2 -ml-1 lg:-ml-2 rounded-full hover:brightness-110 transition-colors lg:hidden"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        )}
        <div className="relative flex-shrink-0">
          <img
            src={user.is_admin ? ELEVATE_ADMIN_AVATAR_URL : (user.avatar_url || DEFAULT_AVATAR_DATA_URI)}
            alt={user.name}
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover default-avatar-shake"
            style={{ backgroundColor: 'var(--bg-active)' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <button
            onClick={() => setShowProfilePopup(true)}
            className="text-left hover:underline transition-all"
          >
            <h2 className="text-sm lg:text-base font-medium truncate" style={{ color: 'var(--text-primary)' }} data-component-name="ChatHeader">{user.name}</h2>
          </button>
          {isTyping && (
            <p className="text-[10px] lg:text-xs" style={{ color: 'var(--text-primary)' }}>typing...</p>
          )}
        </div>
      </div>
      
      {/* Action Icons - Hidden for artist accounts */}
      {shouldShowIcons && (
        <div className="flex items-center gap-1 lg:gap-2">
          <button
            onClick={onVideoCall}
            className="p-2.5 rounded-lg transition-colors"
            aria-label="Video call"
          >
            <VideoCameraIcon className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: 'var(--text-primary)' }} backgroundTheme={backgroundTheme} />
          </button>
          <button
            onClick={onScheduleMeeting}
            className="p-2.5 rounded-lg transition-colors"
            aria-label="Schedule meeting"
          >
            <CalendarIcon className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: 'var(--text-primary)' }} />
          </button>
          <button
            onClick={onOpenDrawer}
            className="p-2.5 rounded-lg transition-colors"
            aria-label="View details"
          >
            <DrawerIcon className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: 'var(--text-primary)' }} isDrawerOpen={isDrawerOpen} backgroundTheme={backgroundTheme} />
          </button>
        </div>
      )}
    </div>
    {showProfilePopup && (
      <UserProfilePopup user={user} onClose={() => setShowProfilePopup(false)} backgroundTheme={backgroundTheme} />
    )}
    </>
  );
}


