import { useState, useCallback } from 'react';
import { 
  AdminApplicationsIconSVG, 
  AdminAlertsIconSVG, 
  AdminMessagesIconSVG, 
  AdminUsersIconSVG, 
  AdminDataIconSVG 
} from './AdminIcons';

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  unreadCount?: number;
  profilePicture?: string | null;
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white';
  userType?: 'artist' | 'creator' | 'business' | 'admin';
}

// Haptic feedback utility for iOS
const triggerHaptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    // iOS Safari haptic feedback
    if ('vibrate' in navigator) {
      const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30;
      navigator.vibrate(duration);
    }
    // Webkit haptic feedback (iOS 10+)
    const webkit = (window as any).webkit;
    if (webkit?.messageHandlers?.haptic) {
      webkit.messageHandlers.haptic.postMessage(style);
    }
  }
};

export function MobileBottomNav({ activeSection, setActiveSection, unreadCount = 0, profilePicture, userType }: MobileBottomNavProps) {
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  const getNavBackground = () => 'var(--bg-sidebar)';
  const getBorderColor = () => 'var(--border-subtle)';

  // Admin-specific nav items - matching original admin nav order
  const adminNavItems = [
    { id: 'applications' },
    { id: 'alerts' },
    { id: 'messages' },
    { id: 'users' },
    { id: 'data' },
  ];

  const creatorNavItems = [
    { id: 'home' },
    { id: 'talent' },
    { id: 'deals' },
    { id: 'messages' },
    { id: 'profile' },
  ];

  const businessNavItems = [
    { id: 'home' },
    { id: 'talent' },
    { id: 'messages' },
    { id: 'profile' },
  ];

  const navItems = userType === 'admin' ? adminNavItems : 
                   userType === 'business' ? businessNavItems : 
                   creatorNavItems;

  const handleTabPress = useCallback((id: string) => {
    triggerHaptic('light');
    setActiveSection(id);
    // Scroll to top when profile is clicked
    if (id === 'profile') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [setActiveSection]);

  const handleTouchStart = useCallback((id: string) => {
    setPressedItem(id);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setPressedItem(null);
  }, []);

  const renderIcon = (id: string, isActive: boolean) => {
    const color = 'currentColor';
    const strokeWidth = "3";
    
    switch (id) {
      case 'home':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <rect x="14" y="18" width="20" height="24" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none"/>
            <path d="M8 20L24 8L40 20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
            <path 
              d="M19 42V28C19 27.4477 19.4477 27 20 27H28C28.5523 27 29 27.4477 29 28V42" 
              fill={color}
              style={{ opacity: isActive ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
            />
            <ellipse 
              cx="24" 
              cy="38" 
              rx="7" 
              ry="9" 
              fill={color}
              style={{ opacity: isActive ? 0.4 : 0, transition: 'opacity 0.3s ease' }}
            />
          </svg>
        );
      case 'explore':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <circle cx="24" cy="24" r="18" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <circle cx="24" cy="24" r="14" stroke={color} strokeWidth="1" strokeOpacity="0.4" fill="none" />
            <line x1="24" y1="6" x2="24" y2="9" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="24" y1="39" x2="24" y2="42" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="6" y1="24" x2="9" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="39" y1="24" x2="42" y2="24" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="37" y1="11" x2="35" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="37" y1="37" x2="35" y2="35" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="37" x2="13" y2="35" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="11" y1="11" x2="13" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <g style={{
              transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
              transformOrigin: "24px 24px",
              transition: "transform 0.5s ease-in-out",
            }}>
              <path d="M24 10L28 24H20L24 10Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={isActive ? color : 'none'} />
              <path d="M24 38L28 24H20L24 38Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill="none" />
              <circle cx="24" cy="24" r="2.5" fill={color} />
            </g>
          </svg>
        );
      case 'talent':
        return (
          <div className="relative">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 overflow-visible">
              {/* 5 Stars - evenly spaced at top */}
              {[0, 1, 2, 3, 4].map((i) => {
                const cx = 8 + i * 8;
                return (
                  <polygon
                    key={i}
                    points={`${cx},2 ${cx + 1.2},5 ${cx + 4},5.5 ${cx + 2},7.5 ${cx + 2.5},11 ${cx},9 ${cx - 2.5},11 ${cx - 2},7.5 ${cx - 4},5.5 ${cx - 1.2},5`}
                    fill="currentColor"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? "scale(1) translateY(0)" : "scale(0.5) translateY(4px)",
                      transformOrigin: `${cx}px 6px`,
                      transition: `all 0.3s ease ${i * 0.06}s`,
                    }}
                  />
                );
              })}
              {/* Left person (behind) */}
              <circle
                cx="12"
                cy="22"
                r="5"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                style={{
                  opacity: 0.5,
                  transform: isActive ? "translateX(-3px)" : "translateX(0)",
                  transition: "all 0.3s ease",
                }}
              />
              <path
                d="M4 44C4 37 7 32 12 32"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                style={{
                  opacity: 0.5,
                  transform: isActive ? "translateX(-3px)" : "translateX(0)",
                  transition: "all 0.3s ease",
                }}
              />
              {/* Right person (behind) */}
              <circle
                cx="36"
                cy="22"
                r="5"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                style={{
                  opacity: 0.5,
                  transform: isActive ? "translateX(3px)" : "translateX(0)",
                  transition: "all 0.3s ease",
                }}
              />
              <path
                d="M44 44C44 37 41 32 36 32"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                style={{
                  opacity: 0.5,
                  transform: isActive ? "translateX(3px)" : "translateX(0)",
                  transition: "all 0.3s ease",
                }}
              />
              {/* Center person (front) */}
              <circle
                cx="24"
                cy="20"
                r="6"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                style={{
                  transform: isActive ? "scale(1.05)" : "scale(1)",
                  transformOrigin: "24px 20px",
                  transition: "transform 0.3s ease",
                }}
              />
              <path
                d="M12 44C12 35 17 30 24 30C31 30 36 35 36 44"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        );
      case 'deals':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <path
              d="M6 12 H20 V18 C20 20.2 18.2 22 16 22 C13.8 22 12 20.2 12 18 V12 H6 V36 H20 V30 C20 27.8 18.2 26 16 26 C13.8 26 12 27.8 12 30 V36 H6 Z"
              stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill="none"
              style={{ transform: isActive ? 'translateX(2px)' : 'translateX(-3px)', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            />
            <path
              d="M42 12 H28 V18 C28 20.2 29.8 22 32 22 C34.2 22 36 20.2 36 18 V12 H42 V36 H28 V30 C28 27.8 29.8 26 32 26 C34.2 26 36 27.8 36 30 V36 H42 Z"
              stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" fill="none"
              style={{ transform: isActive ? 'translateX(-2px)' : 'translateX(3px)', transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            />
            <line x1="24" y1="12" x2="24" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round"
              style={{ opacity: isActive ? 0.6 : 0, transition: 'opacity 0.3s ease 0.2s' }}
            />
          </svg>
        );
      case 'messages':
        return (
          <div className="relative w-7 h-7 flex items-center justify-center">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
              {/* Back bubble */}
              <path 
                d="M36 6H14C9.58172 6 6 9.58172 6 14V26C6 30.4183 9.58172 34 14 34H17L24 42L31 34H36C40.4183 34 44 30.4183 44 26V14C44 9.58172 40.4183 6 36 6Z" 
                stroke={color} 
                strokeWidth={strokeWidth} 
                fill="none"
              />
              {/* Front bubble */}
              <path 
                d="M34 16H12C8.68629 16 6 18.6863 6 22V32C6 35.3137 8.68629 38 12 38H15L21 46L27 38H34C37.3137 38 40 35.3137 40 32V22C40 18.6863 37.3137 16 34 16Z" 
                stroke={color} 
                strokeWidth={strokeWidth} 
                fill="var(--bg-sidebar)"
              />
              <g style={{ opacity: isActive ? 1 : 0.7, transition: 'opacity 0.3s ease' }}>
                <circle cx="15" cy="28" r="2" fill={color}/>
                <circle cx="23" cy="28" r="2" fill={color}/>
                <circle cx="31" cy="28" r="2" fill={color}/>
              </g>
            </svg>
            {activeSection !== 'messages' && unreadCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center">
                <div className="absolute w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75" />
                <div className="relative w-3 h-3 rounded-full bg-red-500 flex items-center justify-center shadow-lg" />
              </div>
            )}
          </div>
        );
      case 'profile':
        return (
          <div className="relative">
            <div 
              className="w-7 h-7 rounded-full overflow-hidden"
              style={{ 
                border: isActive ? '2px solid var(--text-primary)' : '2px solid var(--border-subtle)',
                transition: 'border-color 0.2s ease',
                opacity: 1
              }}
            >
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <circle cx="12" cy="8" r="4" fill="currentColor" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="currentColor" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        );
      case 'users':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <circle cx="12" cy="22" r="5" stroke={color} strokeWidth="2.5" fill="none" style={{ opacity: 0.5 }} />
            <path d="M4 44C4 37 7 32 12 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ opacity: 0.5 }} />
            <circle cx="36" cy="22" r="5" stroke={color} strokeWidth="2.5" fill="none" style={{ opacity: 0.5 }} />
            <path d="M44 44C44 37 41 32 36 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" style={{ opacity: 0.5 }} />
            <circle cx="24" cy="20" r="6" stroke={color} strokeWidth="2.5" fill={isActive ? color : 'none'} style={{ opacity: isActive ? 0.3 : 1 }} />
            <path d="M12 44C12 35 17 30 24 30C31 30 36 35 36 44" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'alerts':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <path d="M8 24L40 12L32 36L24 28L8 24Z" stroke={color} strokeWidth="2.5" strokeLinejoin="round" fill={isActive ? color : 'none'} style={{ opacity: isActive ? 0.2 : 1 }} />
            <path d="M8 24L40 12L24 28" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M24 28L32 36" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );
      case 'settings':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <path d="M24 6V10M24 38V42M42 24H38M10 24H6M37.5 10.5L34.5 13.5M13.5 34.5L10.5 37.5M37.5 37.5L34.5 34.5M13.5 13.5L10.5 10.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="2.5" fill={isActive ? color : 'none'} style={{ opacity: isActive ? 0.2 : 1 }} />
          </svg>
        );
      case 'applications':
        return (
          <div className="messages-icon-wrapper">
            <AdminApplicationsIconSVG />
          </div>
        );
      case 'data':
        return (
          <div className="messages-icon-wrapper">
            <AdminDataIconSVG />
          </div>
        );
      case 'users':
        return (
          <div className="messages-icon-wrapper">
            <AdminUsersIconSVG />
          </div>
        );
      case 'alerts':
        return (
          <div className="messages-icon-wrapper">
            <AdminAlertsIconSVG />
          </div>
        );
      case 'messages':
        return (
          <div className="messages-icon-wrapper">
            <AdminMessagesIconSVG />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderTop: `1px solid ${getBorderColor()}`,
        backgroundColor: getNavBackground()
      }}
    >
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = activeSection === item.id || (item.id === 'profile' && activeSection === 'settings');
          const isPressed = pressedItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabPress(item.id)}
              onTouchStart={() => handleTouchStart(item.id)}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200 group ${
                isActive ? '' : 'hover:opacity-70 active:scale-[0.95]'
              }`}
              style={{ 
                color: 'var(--text-primary)',
                opacity: isActive ? 1 : 0.4,
                height: '52px',
                transform: isPressed ? 'scale(0.9)' : 'scale(1)',
                transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                WebkitTapHighlightColor: 'transparent'
              }}
              aria-label={item.id}
            >
              <div
                className="w-7 h-7 flex items-center justify-center"
                style={{
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                {renderIcon(item.id, isActive)}
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
