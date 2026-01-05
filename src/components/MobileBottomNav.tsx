import { useState, useCallback } from 'react';

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  unreadCount?: number;
  profilePicture?: string | null;
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

export function MobileBottomNav({ activeSection, setActiveSection, unreadCount = 0, profilePicture }: MobileBottomNavProps) {
  const [pressedItem, setPressedItem] = useState<string | null>(null);

  const navItems = [
    { id: 'home' },
    { id: 'explore' },
    { id: 'deals' },
    { id: 'messages' },
    { id: 'profile' },
  ];

  const handleTabPress = useCallback((id: string) => {
    triggerHaptic('light');
    setActiveSection(id);
  }, [setActiveSection]);

  const handleTouchStart = useCallback((id: string) => {
    setPressedItem(id);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setPressedItem(null);
  }, []);

  const renderIcon = (id: string, isActive: boolean) => {
    const color = 'white';
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
      case 'deals':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
            <path
              d="M6 12 H20 V18 C20 20.2 18.2 22 16 22 C13.8 22 12 20.2 12 18 V12 H6 V36 H20 V30 C20 27.8 18.2 26 16 26 C13.8 26 12 27.8 12 30 V36 H6 Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              fill="none"
              style={{ transform: isActive ? "translateX(2px)" : "translateX(-3px)", transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            />
            <path
              d="M42 12 H28 V18 C28 20.2 29.8 22 32 22 C34.2 22 36 20.2 36 18 V12 H42 V36 H28 V30 C28 27.8 29.8 26 32 26 C34.2 26 36 27.8 36 30 V36 H42 Z"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
              fill="none"
              style={{ transform: isActive ? "translateX(-2px)" : "translateX(3px)", transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            />
          </svg>
        );
      case 'messages':
        return (
          <div className="relative">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
              <path 
                d="M32 12H18C14.6863 12 12 14.6863 12 18V26C12 29.3137 14.6863 32 18 32H20L24 36L28 32H32C35.3137 32 38 29.3137 38 26V18C38 14.6863 35.3137 12 32 12Z" 
                stroke={color} 
                strokeWidth={strokeWidth} 
                fill="none"
                              />
              <path 
                d="M30 20H16C13.2386 20 11 22.2386 11 25V31C11 33.7614 13.2386 36 16 36H18L21 40L24 36H30C32.7614 36 35 33.7614 35 31V25C35 22.2386 32.7614 20 30 20Z" 
                stroke={color} 
                strokeWidth={strokeWidth} 
                fill="rgba(0,0,0,0.9)"
                              />
              <g style={{ opacity: isActive ? 1 : 0.3, transition: 'opacity 0.3s ease' }}>
                <circle cx="17" cy="28" r="2" fill={color}/>
                <circle cx="23" cy="28" r="2" fill={color}/>
                <circle cx="29" cy="28" r="2" fill={color}/>
              </g>
            </svg>
            {activeSection !== 'messages' && unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center">
                <div className="absolute w-3.5 h-3.5 rounded-full bg-red-500 animate-ping opacity-75" />
                <div className="relative w-3.5 h-3.5 rounded-full bg-red-500 flex items-center justify-center shadow-lg" />
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
                border: isActive ? '2px solid white' : '2px solid rgba(255,255,255,0.4)',
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
                    <circle cx="12" cy="8" r="4" fill="white" />
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="white" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111]"
      style={{ 
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      <div className="flex items-center justify-around py-2 px-4">
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
              className="flex items-center justify-center p-3 rounded-full"
              style={{ 
                transform: isPressed ? 'scale(0.9)' : 'scale(1)',
                transition: 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                WebkitTapHighlightColor: 'transparent'
              }}
              aria-label={item.id}
            >
              <div
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
