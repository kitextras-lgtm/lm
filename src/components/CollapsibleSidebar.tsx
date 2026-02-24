import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AdminApplicationsIconSVG, 
  AdminMessagesIconSVG, 
  AdminUsersIconSVG, 
  AdminDataIconSVG
} from './AdminIcons';
import { DEFAULT_AVATAR_DATA_URI } from './DefaultAvatar';

// CSS for new icon animations
const style = document.createElement('style');
style.textContent = `
  @keyframes data-transmit {
    0% { opacity: 0; transform: scale(0.5); }
    20% { opacity: 1; transform: scale(1); }
    80% { opacity: 1; transform: scale(1.2); }
    100% { opacity: 0; transform: scale(1.5); }
  }

  .group:hover .group-hover\\:animate-data-transmit-up { animation: data-transmit 2s ease-out infinite; }
  .group:hover .group-hover\\:animate-data-transmit-down { animation: data-transmit 2s ease-out infinite; }
  .group:hover .group-hover\\:animate-data-transmit-left { animation: data-transmit 2s ease-out infinite; }
  .group:hover .group-hover\\:animate-data-transmit-right { animation: data-transmit 2s ease-out infinite; }

  @keyframes clapper-open-close {
    0%, 100% { transform: rotate(0deg); }
    15% { transform: rotate(-30deg); }
    30% { transform: rotate(0deg); }
    45% { transform: rotate(-30deg); }
    60% { transform: rotate(0deg); }
  }

  .animate-clapper-open-close {
    animation: clapper-open-close 1.2s ease-in-out infinite;
  }
`;
document.head.appendChild(style);

interface CollapsibleSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  userProfile?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_picture_url?: string;
  } | null;
  unreadCount?: number;
  cachedProfilePic?: string | null;
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  permanentlyCollapsed?: boolean;
  userType?: 'artist' | 'creator' | 'freelancer' | 'business' | 'admin';
}

// Consistent icon size for all icons - 28px
const ICON_SIZE = "w-7 h-7";

// Sound wave bars icon for collapsed state - Elevate brand icon
function ElevateIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <>
      <img
        src="/elevate l0.png"
        alt="Elevate"
        style={{ maxWidth: 'unset' }}
        className={`${className} sidebar-logo-white rounded-lg default-avatar-shake`}
      />
      <img
        src="/bb.png"
        alt="Elevate"
        style={{ maxWidth: 'unset' }}
        className={`${className} sidebar-logo-black rounded-lg default-avatar-shake`}
      />
    </>
  );
}

// Animated Icons from original LeftSidebar
function HomeIconSVG({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}>
      <rect x="12" y="20" width="24" height="26" rx="2" stroke="currentColor" strokeWidth="3.5" fill="none"/>
      <path d="M4 22L24 4L44 22" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path 
        d="M18 46V30C18 29.4477 18.4477 29 19 29H29C29.5523 29 30 29.4477 30 30V46" 
        fill="currentColor"
        style={{ opacity: shouldAnimate ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
      />
      <ellipse 
        cx="24" 
        cy="38" 
        rx="7" 
        ry="9" 
        fill="currentColor"
        style={{ opacity: shouldAnimate ? 0.4 : 0, transition: 'opacity 0.3s ease' }}
      />
    </svg>
  );
}

function ExploreIconSVG({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}>
      <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3.5" fill="none" />
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" fill="none" />
      <line x1="24" y1="4" x2="24" y2="8" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="24" y1="40" x2="24" y2="44" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="4" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="40" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="38.1" y1="9.9" x2="36" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="38.1" y1="38.1" x2="36" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9.9" y1="38.1" x2="12" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="9.9" y1="9.9" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <g style={{
        transform: shouldAnimate ? "rotate(180deg)" : "rotate(0deg)",
        transformOrigin: "24px 24px",
        transition: "transform 0.5s ease-in-out",
      }}>
        <path d="M24 10L28 24H20L24 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" />
        <path d="M24 38L28 24H20L24 38Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
      </g>
      <circle cx="24" cy="24" r="2.5" fill="currentColor" />
    </svg>
  );
}

function TalentIconSVG({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${ICON_SIZE} overflow-visible`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = 8 + i * 8;
        return (
          <polygon
            key={i}
            points={`${cx},2 ${cx + 1.2},5 ${cx + 4},5.5 ${cx + 2},7.5 ${cx + 2.5},11 ${cx},9 ${cx - 2.5},11 ${cx - 2},7.5 ${cx - 4},5.5 ${cx - 1.2},5`}
            fill="currentColor"
            style={{
              opacity: shouldAnimate ? 1 : 0,
              transform: shouldAnimate ? "scale(1) translateY(0)" : "scale(0.5) translateY(4px)",
              transformOrigin: `${cx}px 6px`,
              transition: `all 0.3s ease ${i * 0.06}s`,
            }}
          />
        );
      })}
      <circle cx="12" cy="22" r="5" stroke="currentColor" strokeWidth="3.5" fill="none"
        style={{ opacity: 0.5, transform: shouldAnimate ? "translateX(-3px)" : "translateX(0)", transition: "all 0.3s ease" }} />
      <path d="M4 44C4 37 7 32 12 32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none"
        style={{ opacity: 0.5, transform: shouldAnimate ? "translateX(-3px)" : "translateX(0)", transition: "all 0.3s ease" }} />
      <circle cx="36" cy="22" r="5" stroke="currentColor" strokeWidth="3.5" fill="none"
        style={{ opacity: 0.5, transform: shouldAnimate ? "translateX(3px)" : "translateX(0)", transition: "all 0.3s ease" }} />
      <path d="M44 44C44 37 41 32 36 32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none"
        style={{ opacity: 0.5, transform: shouldAnimate ? "translateX(3px)" : "translateX(0)", transition: "all 0.3s ease" }} />
      <circle cx="24" cy="20" r="6" stroke="currentColor" strokeWidth="3.5" fill="none"
        style={{ transform: shouldAnimate ? "scale(1.05)" : "scale(1)", transformOrigin: "24px 20px", transition: "transform 0.3s ease" }} />
      <path d="M12 44C12 35 17 30 24 30C31 30 36 35 36 44" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function DealsIconSVG({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${ICON_SIZE} overflow-visible`}>
      {/* Left puzzle piece with tab */}
      <path
        d="M6 12 H20 V18 C20 20.2 18.2 22 16 22 C13.8 22 12 20.2 12 18 V12 H6 V36 H20 V30 C20 27.8 18.2 26 16 26 C13.8 26 12 27.8 12 30 V36 H6 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
        style={{
          transform: shouldAnimate ? "translateX(2px)" : "translateX(-3px)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />

      {/* Right puzzle piece with slot */}
      <path
        d="M42 12 H28 V18 C28 20.2 29.8 22 32 22 C34.2 22 36 20.2 36 18 V12 H42 V36 H28 V30 C28 27.8 29.8 26 32 26 C34.2 26 36 27.8 36 30 V36 H42 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        fill="none"
        style={{
          transform: shouldAnimate ? "translateX(-2px)" : "translateX(3px)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />

      {/* Connection glow when pieces meet */}
      <line
        x1="24"
        y1="12"
        x2="24"
        y2="36"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          opacity: shouldAnimate ? 0.6 : 0,
          transition: "opacity 0.3s ease 0.2s",
        }}
      />
    </svg>
  );
}

// Artist-specific icons
function ArtistDistributionIconSVG({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className={`relative ${ICON_SIZE}`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}>
        {/* Central chip body */}
        <rect
          x="14"
          y="14"
          width="20"
          height="20"
          rx="2"
          stroke="currentColor"
          strokeWidth="3.5"
          fill="currentColor"
          fillOpacity="0.1"
          style={{
            transform: shouldAnimate ? "scale(1.05)" : "scale(1)",
            transformOrigin: "24px 24px",
            transition: "transform 0.3s ease",
          }}
        />

        {/* Internal circuit pattern - cross lines */}
        <line x1="19" y1="24" x2="29" y2="24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.3, transition: 'opacity 0.3s ease' }} />
        <line x1="24" y1="19" x2="24" y2="29" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.3, transition: 'opacity 0.3s ease' }} />

        {/* Connection pins - Top */}
        <line x1="19" y1="14" x2="19" y2="7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.4, transition: 'opacity 0.3s ease' }} />
        <line x1="29" y1="14" x2="29" y2="7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.4, transition: 'opacity 0.3s ease' }} />

        {/* Connection pins - Bottom */}
        <line x1="19" y1="34" x2="19" y2="41" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.4, transition: 'opacity 0.3s ease' }} />
        <line x1="29" y1="34" x2="29" y2="41" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.4, transition: 'opacity 0.3s ease' }} />

        {/* Connection pins - Left */}
        <line x1="14" y1="19" x2="7" y2="19" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.4, transition: 'opacity 0.3s ease' }} />
        <line x1="14" y1="29" x2="7" y2="29" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.4, transition: 'opacity 0.3s ease' }} />

        {/* Connection pins - Right */}
        <line x1="34" y1="19" x2="41" y2="19" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.4, transition: 'opacity 0.3s ease' }} />
        <line x1="34" y1="29" x2="41" y2="29" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 1 : 0.4, transition: 'opacity 0.3s ease' }} />

        {/* Data packets - refined animation */}
        <circle cx="19" cy="4" r="2.5" fill="currentColor" style={{ opacity: shouldAnimate ? 1 : 0, transition: 'opacity 0.3s ease' }} />
        <circle cx="29" cy="44" r="2.5" fill="currentColor" style={{ opacity: shouldAnimate ? 1 : 0, transition: 'opacity 0.3s ease', transitionDelay: '0.1s' }} />
        <circle cx="4" cy="19" r="2.5" fill="currentColor" style={{ opacity: shouldAnimate ? 1 : 0, transition: 'opacity 0.3s ease', transitionDelay: '0.2s' }} />
        <circle cx="44" cy="29" r="2.5" fill="currentColor" style={{ opacity: shouldAnimate ? 1 : 0, transition: 'opacity 0.3s ease', transitionDelay: '0.3s' }} />
      </svg>
    </div>
  );
}

function ArtistPublishingIconSVG({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className={`relative ${ICON_SIZE}`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}>
        {/* Magnifying glass */}
        <g style={{
          transform: shouldAnimate ? 'scale(1.05)' : 'scale(1)',
          transformOrigin: '24px 24px',
          transition: 'transform 0.3s ease'
        }}>
          <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="3.5" fill="none" />
          <line x1="30" y1="30" x2="42" y2="42" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          {/* Shine on glass */}
          <path
            d="M14 15C16 12 19 11 22 12"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ opacity: shouldAnimate ? 0.7 : 0.3, transition: 'opacity 0.3s ease' }}
          />
        </g>

        {/* Hidden dollar sign - revealed on hover */}
        <text
          x="20"
          y="25"
          textAnchor="middle"
          fill="currentColor"
          fontSize="16"
          fontWeight="bold"
          style={{
            opacity: shouldAnimate ? 1 : 0,
            transform: shouldAnimate ? "scale(1.1)" : "scale(0.8)",
            transformOrigin: "20px 25px",
            transition: 'all 0.3s ease'
          }}
        >
          $
        </text>
      </svg>
    </div>
  );
}

function ArtistSyncIconSVG({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className={`relative ${ICON_SIZE}`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}>
        {/* Bottom slate base */}
        <rect x="8" y="24" width="32" height="16" rx="2" stroke="currentColor" strokeWidth="3.5" fill="none" />

        {/* Text lines on slate */}
        <line x1="12" y1="30" x2="28" y2="30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 0.8 : 0.3, transition: 'opacity 0.3s ease' }} />
        <line x1="12" y1="36" x2="22" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" 
              style={{ opacity: shouldAnimate ? 0.8 : 0.3, transition: 'opacity 0.3s ease' }} />

        {/* Top clapper - opens and closes on hover */}
        <g style={{
          transform: shouldAnimate ? 'rotate(-15deg)' : 'rotate(0deg)',
          transformOrigin: '8px 24px',
          transition: 'transform 0.3s ease'
        }}>
          {/* Clapper board */}
          <path
            d="M8 24V16C8 14.8954 8.89543 14 10 14H38C38.1046 14 40 14.8954 40 16V24"
            stroke="currentColor"
            strokeWidth="3.5"
            fill="none"
            strokeLinejoin="round"
          />
          {/* Diagonal stripes */}
          <line x1="14" y1="14" x2="20" y2="24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="22" y1="14" x2="28" y2="24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="30" y1="14" x2="36" y2="24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

function MessagesIconSVG({ isHovered, isActive, unreadCount = 0 }: { isHovered: boolean; isActive: boolean; unreadCount?: number }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className={`relative ${ICON_SIZE}`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}>
        <path 
          d="M36 6H14C9.58172 6 6 9.58172 6 14V26C6 30.4183 9.58172 34 14 34H17L24 42L31 34H36C40.4183 34 44 30.4183 44 26V14C44 9.58172 40.4183 6 36 6Z" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none"
          style={{ transform: shouldAnimate ? 'scale(1.05) translate(-2px, -2px)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 0.3s ease' }}
        />
        <path 
          d="M34 16H12C8.68629 16 6 18.6863 6 22V32C6 35.3137 8.68629 38 12 38H15L21 46L27 38H34C37.3137 38 40 35.3137 40 32V22C40 18.6863 37.3137 16 34 16Z" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="var(--bg-primary)"
          style={{ transform: shouldAnimate ? 'scale(1.08) translate(2px, 2px)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 0.3s ease' }}
        />
        <g style={{ opacity: shouldAnimate ? 1 : 0.7, transition: 'opacity 0.3s ease' }}>
          <circle cx="15" cy="28" r="2" fill="currentColor"/>
          <circle cx="23" cy="28" r="2" fill="currentColor"/>
          <circle cx="31" cy="28" r="2" fill="currentColor"/>
        </g>
      </svg>
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center" style={{ zIndex: 9999 }}>
          <div className="absolute w-4 h-4 rounded-full bg-red-500 animate-ping opacity-75" />
          <div className="relative w-4 h-4 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <span className="text-[9px] font-bold text-white leading-none">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function EarningsIconSVG({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className={`relative ${ICON_SIZE} overflow-visible`}>
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={ICON_SIZE}
        style={{
          animation: shouldAnimate ? 'piggyWiggle 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)' : 'none'
        }}
      >
        <ellipse cx="24" cy="26" rx="18" ry="14" stroke="currentColor" strokeWidth="3.5" fill="none"/>
        <ellipse cx="40" cy="26" rx="5" ry="4" stroke="currentColor" strokeWidth="3.5" fill="none"/>
        <circle cx="39" cy="24" r="1" fill="currentColor"/>
        <circle cx="42" cy="24" r="1" fill="currentColor"/>
        <path d="M14 16C14 16 11 10 16 8C21 6 24 12 24 14" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
        <path d="M14 38V46" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M22 38V46" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M28 38V46" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        <path d="M36 38V46" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
        <rect x="19" y="12" width="10" height="3" rx="1.5" fill="currentColor"/>
        <circle cx="16" cy="22" r="2" fill="currentColor"/>
      </svg>
      
      {/* Coin 1 - drops with spin and bounce */}
      <div 
        className="absolute left-1/2"
        style={{ 
          top: '-4px',
          opacity: 0,
          animation: isHovered ? 'coinDrop1 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none'
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.3))' }}>
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" fill="rgba(255,255,255,0.1)"/>
          <text x="5" y="7" textAnchor="middle" fill="currentColor" fontSize="5" fontWeight="bold">$</text>
        </svg>
      </div>
      
      {/* Coin 2 - slightly offset, delayed */}
      <div 
        className="absolute left-1/2"
        style={{ 
          top: '-4px',
          opacity: 0,
          animation: isHovered ? 'coinDrop2 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.12s forwards' : 'none'
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.3))' }}>
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" fill="rgba(255,255,255,0.1)"/>
          <text x="5" y="7" textAnchor="middle" fill="currentColor" fontSize="5" fontWeight="bold">$</text>
        </svg>
      </div>
      
      {/* Coin 3 - third coin for extra polish */}
      <div 
        className="absolute left-1/2"
        style={{ 
          top: '-4px',
          opacity: 0,
          animation: isHovered ? 'coinDrop3 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.22s forwards' : 'none'
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ filter: 'drop-shadow(0 1px 2px rgba(255,255,255,0.2))' }}>
          <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1" fill="rgba(255,255,255,0.1)"/>
          <text x="4" y="5.5" textAnchor="middle" fill="currentColor" fontSize="4" fontWeight="bold">$</text>
        </svg>
      </div>
      
      {/* Sparkle effect when coins land */}
      <div 
        className="absolute left-1/2 -translate-x-1/2"
        style={{ 
          top: '12px',
          opacity: 0,
          animation: isHovered ? 'sparkle 0.4s ease-out 0.35s forwards' : 'none'
        }}
      >
        <svg width="16" height="8" viewBox="0 0 16 8" fill="none">
          <circle cx="8" cy="4" r="1" fill="currentColor" opacity="0.8"/>
          <circle cx="4" cy="4" r="0.5" fill="currentColor" opacity="0.6"/>
          <circle cx="12" cy="4" r="0.5" fill="currentColor" opacity="0.6"/>
        </svg>
      </div>
      
      <style>{`
        @keyframes piggyWiggle {
          0% { transform: rotate(0deg) scale(1); }
          15% { transform: rotate(-4deg) scale(1.02); }
          30% { transform: rotate(4deg) scale(1.02); }
          45% { transform: rotate(-3deg) scale(1.01); }
          60% { transform: rotate(3deg) scale(1.01); }
          75% { transform: rotate(-1deg) scale(1); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes coinDrop1 {
          0% { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0) rotate(0deg) scale(0.5); 
          }
          20% { 
            opacity: 1; 
            transform: translateX(-50%) translateY(-2px) rotate(45deg) scale(1); 
          }
          70% { 
            opacity: 1; 
            transform: translateX(-45%) translateY(10px) rotate(180deg) scale(1); 
          }
          85% { 
            opacity: 0.8; 
            transform: translateX(-45%) translateY(8px) rotate(200deg) scale(0.9); 
          }
          100% { 
            opacity: 0; 
            transform: translateX(-45%) translateY(12px) rotate(220deg) scale(0.7); 
          }
        }
        @keyframes coinDrop2 {
          0% { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0) rotate(0deg) scale(0.5); 
          }
          20% { 
            opacity: 1; 
            transform: translateX(-50%) translateY(-3px) rotate(-30deg) scale(1); 
          }
          70% { 
            opacity: 1; 
            transform: translateX(-55%) translateY(11px) rotate(-150deg) scale(1); 
          }
          85% { 
            opacity: 0.8; 
            transform: translateX(-55%) translateY(9px) rotate(-170deg) scale(0.9); 
          }
          100% { 
            opacity: 0; 
            transform: translateX(-55%) translateY(13px) rotate(-190deg) scale(0.7); 
          }
        }
        @keyframes coinDrop3 {
          0% { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0) rotate(0deg) scale(0.4); 
          }
          25% { 
            opacity: 1; 
            transform: translateX(-50%) translateY(-1px) rotate(60deg) scale(1); 
          }
          75% { 
            opacity: 1; 
            transform: translateX(-50%) translateY(9px) rotate(240deg) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translateX(-50%) translateY(11px) rotate(300deg) scale(0.6); 
          }
        }
        @keyframes sparkle {
          0% { 
            opacity: 0; 
            transform: translateX(-50%) scale(0.3); 
          }
          50% { 
            opacity: 1; 
            transform: translateX(-50%) scale(1.2); 
          }
          100% { 
            opacity: 0; 
            transform: translateX(-50%) scale(0.8); 
          }
        }
      `}</style>
    </div>
  );
}

function SettingsIconSVG({ isHovered, isActive }: { isHovered: boolean; isActive: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${ICON_SIZE} overflow-visible`}>
      <g style={{ transform: shouldAnimate ? "rotate(45deg)" : "rotate(0deg)", transformOrigin: "24px 24px", transition: "transform 0.5s ease-in-out" }}>
        <path
          d="M21 4H27V10L30 11.5L35 6L42 13L37 18L38.5 21H44V27H38.5L37 30L42 35L35 42L30 37L27 38.5V44H21V38.5L18 37L13 42L6 35L11 30L9.5 27H4V21H9.5L11 18L6 13L13 6L18 11L21 10V4Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      <circle cx="24" cy="24" r="7" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  );
}


// Get nav items based on user type - uses translation keys for labels
const getNavItems = (userType?: 'artist' | 'creator' | 'freelancer' | 'business' | 'admin', t?: (key: string) => string) => {
  const tr = (key: string, fallback: string) => t ? t(key) : fallback;
  if (userType === 'admin') {
    return [
      { id: 'home', label: tr('nav.home', 'Home'), Icon: HomeIconSVG },
      { id: 'applications', label: 'Applications', Icon: AdminApplicationsIconSVG },
      { id: 'messages', label: tr('nav.messages', 'Messages'), Icon: AdminMessagesIconSVG },
      { id: 'users', label: 'Users', Icon: AdminUsersIconSVG },
      { id: 'data', label: 'Data', Icon: AdminDataIconSVG },
      { id: 'settings', label: tr('nav.settings', 'Settings'), Icon: SettingsIconSVG },
    ];
  }
  if (userType === 'artist') {
    return [
      { id: 'home', label: tr('nav.home', 'Home'), Icon: HomeIconSVG },
      { id: 'explore', label: tr('nav.distribution', 'Distribution'), Icon: ArtistDistributionIconSVG },
      { id: 'talent', label: tr('nav.publishing', 'Publishing'), Icon: ArtistPublishingIconSVG },
      { id: 'deals', label: tr('nav.sync', 'Sync'), Icon: ArtistSyncIconSVG },
      { id: 'messages', label: tr('nav.messages', 'Messages'), Icon: MessagesIconSVG },
      { id: 'earnings', label: tr('nav.earnings', 'Earnings'), Icon: EarningsIconSVG },
      { id: 'settings', label: tr('nav.settings', 'Settings'), Icon: SettingsIconSVG },
    ];
  } else if (userType === 'business') {
    return [
      { id: 'home', label: tr('nav.home', 'Home'), Icon: HomeIconSVG },
      { id: 'talent', label: tr('nav.talent', 'Talent'), Icon: TalentIconSVG },
      { id: 'deals', label: tr('nav.deals', 'Deals'), Icon: DealsIconSVG },
      { id: 'messages', label: tr('nav.messages', 'Messages'), Icon: MessagesIconSVG },
      { id: 'settings', label: tr('nav.settings', 'Settings'), Icon: SettingsIconSVG },
    ];
  } else {
    return [
      { id: 'home', label: tr('nav.home', 'Home'), Icon: HomeIconSVG },
      { id: 'explore', label: tr('nav.explore', 'Explore'), Icon: ExploreIconSVG },
      { id: 'talent', label: tr('nav.talent', 'Talent'), Icon: TalentIconSVG },
      { id: 'deals', label: tr('nav.deals', 'Deals'), Icon: DealsIconSVG },
      { id: 'messages', label: tr('nav.messages', 'Messages'), Icon: MessagesIconSVG },
      { id: 'earnings', label: tr('nav.earnings', 'Earnings'), Icon: EarningsIconSVG },
      { id: 'settings', label: tr('nav.settings', 'Settings'), Icon: SettingsIconSVG },
    ];
  }
};

// Expanded width in pixels
const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 80;

export function CollapsibleSidebar({ 
  activeSection, 
  setActiveSection, 
  userProfile,
  unreadCount = 0,
  cachedProfilePic,
  isCollapsed: externalCollapsed,
  onCollapsedChange,
  permanentlyCollapsed,
  userType
}: CollapsibleSidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { t } = useTranslation();
  
  // Use external state if provided, otherwise use internal state
  // If permanentlyCollapsed is true, always keep sidebar collapsed
  const isCollapsed = permanentlyCollapsed ? true : (externalCollapsed !== undefined ? externalCollapsed : internalCollapsed);
  const setIsCollapsed = (collapsed: boolean) => {
    // Don't allow expansion if permanently collapsed
    if (permanentlyCollapsed && !collapsed) return;
    
    if (onCollapsedChange) {
      onCollapsedChange(collapsed);
    } else {
      setInternalCollapsed(collapsed);
    }
  };

  // Handle responsive collapse based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const profilePicUrl = userProfile?.profile_picture_url;
  const displayPic = cachedProfilePic || (profilePicUrl && !profilePicUrl.startsWith('blob:') ? profilePicUrl : null);
  const displayName = userProfile?.first_name && userProfile?.last_name 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Your Name';
  const username = userProfile?.username || 'username';

  const handleNavClick = (itemId: string) => {
    setActiveSection(itemId);
    // If permanently collapsed, don't change state
    if (permanentlyCollapsed) return;
    
    // Collapse when Messages is clicked, expand for everything else
    if (itemId === 'messages') {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  };

  return (
    <aside 
      className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-40"
      style={{ 
        width: isCollapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-subtle)'
      }}
    >
      {/* Logo Section - matches original LeftSidebar */}
      <div className="relative" style={{ height: '96px' }}>
        {/* Collapsed icon - aligned with nav icons (px-3 + px-4 = 28px from edge, centered in 28px icon width) */}
        <div 
          className="absolute top-1/2 flex items-center justify-center"
          style={{ 
            left: '28px',
            width: '28px',
            transform: 'translateY(-50%)',
            opacity: isCollapsed ? 1 : 0,
            transition: 'opacity 0.2s ease',
            pointerEvents: isCollapsed ? 'auto' : 'none'
          }}
        >
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection('home');
            }}
          >
            <ElevateIcon className="w-12 h-12 sidebar-logo-white" />
          </div>
        </div>

        {/* Expanded logo - uses the same image as original */}
        <div 
          className="absolute top-0 left-0 h-full flex items-center px-4"
          style={{ 
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 0.2s ease',
            pointerEvents: isCollapsed ? 'none' : 'auto'
          }}
        >
          <img 
            src="/elevate_transparent_white_.png" 
            alt="ELEVATE" 
            className="sidebar-logo-white h-32 -my-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection('home');
            }}
          />
          <img 
            src="/elevate_transparent_dark_.png" 
            alt="ELEVATE" 
            className="sidebar-logo-dark h-32 -my-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection('home');
            }}
          />
          <img 
            src="/elevate black logo .png" 
            alt="ELEVATE" 
            className="sidebar-logo-black h-32 -my-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection('home');
            }}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {getNavItems(userType, t).map((item: any) => {
          const isHovered = hoveredItem === item.id;
          const isActive = activeSection === item.id;
          const IconComponent = item.Icon;
          const showBadge = item.id === 'messages' && unreadCount > 0 && activeSection !== 'messages';

          return (
            <div
              key={item.id}
              className={`cursor-pointer flex items-center gap-5 px-4 py-3 rounded-full transition-all duration-200 my-0.5 ${userType === 'admin' ? 'group' : ''}`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => handleNavClick(item.id)}
              style={{ 
                backgroundColor: isHovered && !isCollapsed ? 'var(--bg-elevated)' : 'transparent',
                boxShadow: isHovered && !isCollapsed ? '0 0 0 1px var(--border-subtle)' : 'none',
              }}
            >
              {/* Icon container - fixed position */}
              <div className="w-7 h-7 flex items-center justify-center overflow-visible flex-shrink-0" style={{ color: 'var(--text-primary)' }}>
                {item.id === 'messages' ? (
                  <IconComponent isHovered={isHovered} isActive={isActive} unreadCount={showBadge ? unreadCount : 0} />
                ) : (
                  <IconComponent isHovered={isHovered} isActive={isActive} />
                )}
              </div>
              
              {/* Label - fades out with opacity */}
              <span
                className="text-lg whitespace-nowrap overflow-hidden"
                style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: isActive ? 700 : 400,
                  opacity: isCollapsed ? 0 : 1,
                  width: isCollapsed ? 0 : 'auto',
                  transition: 'opacity 0.2s ease, width 0.3s ease, color 0.2s ease'
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Profile Section - Pinned to bottom (hidden for admin) */}
      {userType !== 'admin' && (
        <div 
          className={`p-3 mb-4 mx-3 rounded-full cursor-pointer transition-all duration-200`}
          onMouseEnter={(e) => { if (!isCollapsed) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-elevated)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
          onClick={() => {
            setActiveSection('profile');
            if (!permanentlyCollapsed) {
              setIsCollapsed(false);
            }
          }}
        >
          <div className="flex items-center gap-3">
            {/* Avatar - fixed position */}
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img 
                src={displayPic || DEFAULT_AVATAR_DATA_URI} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* User info - fades out */}
            <div 
              className="flex-1 min-w-0 overflow-hidden"
              style={{
                opacity: isCollapsed ? 0 : 1,
                width: isCollapsed ? 0 : 'auto',
                transition: 'opacity 0.2s ease, width 0.3s ease'
              }}
            >
              <div className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                {displayName}
              </div>
              <div className="text-sm truncate" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>
                @{username}
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default CollapsibleSidebar;
