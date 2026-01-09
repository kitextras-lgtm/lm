import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Profile } from '../../types/chat';
import { DEFAULT_AVATAR_DATA_URI, ELEVATE_ADMIN_AVATAR_URL } from '../DefaultAvatar';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface AnimatedIconProps {
  className?: string;
  style?: React.CSSProperties;
  backgroundTheme?: 'light' | 'grey' | 'dark';
}

// Video Camera Icon Component
function VideoCameraIcon({ className, style, backgroundTheme }: AnimatedIconProps) {
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
          stroke="white" 
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
          stroke="white" 
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
          fill="white" 
          style={{ 
            opacity: isHovered ? 0.8 : 0.4, 
            transition: "opacity 0.3s ease" 
          }} 
        />
        
        {/* Lens reflection */}
        <circle 
          cx="16" cy="22" r="1" 
          fill="white" 
          style={{ 
            opacity: isHovered ? 0.6 : 0.2, 
            transition: "opacity 0.3s ease 0.1s" 
          }} 
        />
        
        {/* Camera lens */}
        <path 
          d="M32 18L44 12V36L32 30V18Z" 
          stroke="white" 
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
          stroke="white" 
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
          stroke="white" 
          strokeWidth="3"
          style={{ opacity: isHovered ? 0.8 : 0.6, transition: "opacity 0.3s ease" }}
        />
        
        {/* Ring bindings */}
        <line 
          x1="14" y1="6" x2="14" y2="14" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
          style={{ 
            transform: isHovered ? "translateY(-1px)" : "translateY(0)", 
            transition: "transform 0.3s ease" 
          }} 
        />
        <line 
          x1="34" y1="6" x2="34" y2="14" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round"
          style={{ 
            transform: isHovered ? "translateY(-1px)" : "translateY(0)", 
            transition: "transform 0.3s ease 0.05s" 
          }} 
        />
        
        {/* Date dots that appear on hover */}
        <circle cx="12" cy="24" r="1.5" fill="white" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.1s" }} />
        <circle cx="18" cy="24" r="1.5" fill="white" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.15s" }} />
        <circle cx="24" cy="24" r="1.5" fill="white" style={{ opacity: isHovered ? 1 : 0.4, transition: "opacity 0.3s ease 0.2s" }} />
        <circle cx="30" cy="24" r="1.5" fill="white" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.25s" }} />
        <circle cx="36" cy="24" r="1.5" fill="white" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.3s" }} />
        
        <circle cx="12" cy="30" r="1.5" fill="white" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.35s" }} />
        <circle cx="18" cy="30" r="1.5" fill="white" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.4s" }} />
        <circle cx="24" cy="30" r="1.5" fill="white" style={{ opacity: isHovered ? 0.8 : 0.3, transition: "opacity 0.3s ease 0.45s" }} />
        <circle cx="30" cy="30" r="1.5" fill="white" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.5s" }} />
        <circle cx="36" cy="30" r="1.5" fill="white" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.55s" }} />
        
        <circle cx="12" cy="36" r="1.5" fill="white" style={{ opacity: isHovered ? 0.4 : 0.1, transition: "opacity 0.3s ease 0.6s" }} />
        <circle cx="18" cy="36" r="1.5" fill="white" style={{ opacity: isHovered ? 0.4 : 0.1, transition: "opacity 0.3s ease 0.65s" }} />
        <circle cx="24" cy="36" r="1.5" fill="white" style={{ opacity: isHovered ? 0.6 : 0.2, transition: "opacity 0.3s ease 0.7s" }} />
        <circle cx="30" cy="36" r="1.5" fill="white" style={{ opacity: isHovered ? 0.4 : 0.1, transition: "opacity 0.3s ease 0.75s" }} />
        <circle cx="36" cy="36" r="1.5" fill="white" style={{ opacity: isHovered ? 0.4 : 0.1, transition: "opacity 0.3s ease 0.8s" }} />
        
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
          stroke="white" 
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
          stroke="white" 
          strokeWidth="3" 
          fill="none" 
          style={{ opacity: 0.6 }} 
        />
        <line 
          x1="20" y1="14" x2="28" y2="14" 
          stroke="white" 
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
            stroke="white" 
            strokeWidth="3" 
            fill={backgroundTheme === 'light' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(0,0,0,0.9)'} 
          />
          <line 
            x1="20" y1="24" x2="28" y2="24" 
            stroke="white" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
          
          {/* Content items that appear on hover or when drawer is open */}
          <g style={{ opacity: (isHovered || isDrawerOpen) ? 1 : 0, transition: "opacity 0.3s ease 0.15s" }}>
            {/* Document icons */}
            <rect x="12" y="22" width="4" height="4" rx="0.5" fill="white" opacity="0.7" />
            <rect x="17" y="22" width="4" height="4" rx="0.5" fill="white" opacity="0.5" />
            <rect x="22" y="22" width="4" height="4" rx="0.5" fill="white" opacity="0.6" />
            
            {/* Small details on documents */}
            <line x1="13" y1="23.5" x2="15" y2="23.5" stroke={backgroundTheme === 'light' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(0,0,0,0.5)'} strokeWidth="0.5" />
            <line x1="18" y1="23.5" x2="20" y2="23.5" stroke={backgroundTheme === 'light' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(0,0,0,0.5)'} strokeWidth="0.5" />
            <line x1="23" y1="23.5" x2="25" y2="23.5" stroke={backgroundTheme === 'light' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(0,0,0,0.5)'} strokeWidth="0.5" />
          </g>
        </g>
        
        {/* Bottom section - always visible */}
        <rect 
          x="10" y="30" width="28" height="8" rx="1" 
          stroke="white" 
          strokeWidth="3" 
          fill="none" 
          style={{ opacity: 0.6 }} 
        />
        <line 
          x1="20" y1="34" x2="28" y2="34" 
          stroke="white" 
          strokeWidth="3" 
          strokeLinecap="round" 
          style={{ opacity: 0.6 }} 
        />
        
        {/* Slide indicator/shadow */}
        <rect 
          x="10" y="28" width="28" height="4" 
          fill="white" 
          style={{ 
            opacity: isHovered ? 0.2 : 0, 
            transition: "opacity 0.3s ease" 
          }} 
        />
        
        {/* Handle indicator */}
        <rect 
          x="20" y="8" width="8" height="2" rx="1" 
          fill="white" 
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
  backgroundTheme?: 'light' | 'grey' | 'dark';
}

export function ChatHeader({ user, isTyping, onBack, showBackButton, onVideoCall, onScheduleMeeting, onOpenDrawer, isDrawerOpen, backgroundTheme = 'dark' }: ChatHeaderProps) {
  console.log('🎯 ChatHeader rendering with user:', user?.name, user);
  const { profile } = useUserProfile();
  // Only show icons if profile is loaded AND user is not an artist
  const shouldShowIcons = profile && profile.user_type !== 'artist';

  return (
    <div className="h-14 lg:h-16 px-3 lg:px-4 flex items-center justify-between min-w-0" style={{ borderBottom: '1px solid rgba(75, 85, 99, 0.2)', backgroundColor: backgroundTheme === 'light' ? '#0F172A' : backgroundTheme === 'grey' ? '#1A1A1E' : '#000000' }}>
      <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
        {showBackButton && (
          <button
            onClick={onBack}
            className="p-1.5 lg:p-2 -ml-1 lg:-ml-2 rounded-full hover:brightness-110 transition-colors lg:hidden"
            style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }}
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
          </button>
        )}
        <div className="relative flex-shrink-0">
          <img
            src={user.is_admin ? ELEVATE_ADMIN_AVATAR_URL : (user.avatar_url || DEFAULT_AVATAR_DATA_URI)}
            alt={user.name}
            className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover default-avatar-shake"
            style={{ backgroundColor: '#0f0f13' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm lg:text-base font-medium truncate" style={{ color: backgroundTheme === 'light' ? '#FFFFFF' : '#F8FAFC' }}>{user.name}</h2>
          {isTyping && (
            <p className="text-[10px] lg:text-xs" style={{ color: backgroundTheme === 'light' ? '#64748B' : '#94A3B8' }}>typing...</p>
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
            <VideoCameraIcon className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#94A3B8' }} backgroundTheme={backgroundTheme} />
          </button>
          <button
            onClick={onScheduleMeeting}
            className="p-2.5 rounded-lg transition-colors"
            aria-label="Schedule meeting"
          >
            <CalendarIcon className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#94A3B8' }} />
          </button>
          <button
            onClick={onOpenDrawer}
            className="p-2.5 rounded-lg transition-colors"
            aria-label="View details"
          >
            <DrawerIcon className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#94A3B8' }} isDrawerOpen={isDrawerOpen} backgroundTheme={backgroundTheme} />
          </button>
        </div>
      )}
    </div>
  );
}


