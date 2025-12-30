import { useState } from 'react';

interface MobileBottomNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  unreadCount?: number;
}

export function MobileBottomNav({ activeSection, setActiveSection, unreadCount = 0 }: MobileBottomNavProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Settings' },
  ];

  const renderIcon = (id: string, isActive: boolean, isHovered: boolean) => {
    const color = isActive || isHovered ? 'white' : '#9ca3af';
    
    switch (id) {
      case 'home':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <rect x="14" y="18" width="20" height="24" rx="2" stroke={color} strokeWidth="2.5" fill="none"/>
            <path d="M8 20L24 8L40 20" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path 
              d="M19 42V28C19 27.4477 19.4477 27 20 27H28C28.5523 27 29 27.4477 29 28V42" 
              fill={color}
              style={{ opacity: isActive ? 1 : 0.3 }}
            />
          </svg>
        );
      case 'explore':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <circle cx="24" cy="24" r="20" stroke={color} strokeWidth="2.5" fill="none" />
            <path d="M24 10L28 24H20L24 10Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} />
            <path d="M24 38L28 24H20L24 38Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill="none" />
            <circle cx="24" cy="24" r="2.5" fill={color} />
          </svg>
        );
      case 'messages':
        return (
          <div className="relative">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <path 
                d="M32 12H18C14.6863 12 12 14.6863 12 18V26C12 29.3137 14.6863 32 18 32H20L24 36L28 32H32C35.3137 32 38 29.3137 38 26V18C38 14.6863 35.3137 12 32 12Z" 
                stroke={color} 
                strokeWidth="2.5" 
                fill="none"
              />
              <path 
                d="M30 20H16C13.2386 20 11 22.2386 11 25V31C11 33.7614 13.2386 36 16 36H18L21 40L24 36H30C32.7614 36 35 33.7614 35 31V25C35 22.2386 32.7614 20 30 20Z" 
                stroke={color} 
                strokeWidth="2.5" 
                fill="rgba(0,0,0,0.8)"
              />
              <g style={{ opacity: 0.7 }}>
                <circle cx="17" cy="28" r="1.5" fill={color}/>
                <circle cx="23" cy="28" r="1.5" fill={color}/>
                <circle cx="29" cy="28" r="1.5" fill={color}/>
              </g>
            </svg>
            {activeSection !== 'messages' && unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center">
                <div className="absolute w-3 h-3 rounded-full bg-red-500 animate-ping opacity-75" />
                <div className="relative w-3 h-3 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
                  <span className="text-[8px] font-bold text-white leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
            <path
              d="M22 4H26V8.5L28.5 9.5L32 6.5L35 9.5L32 13L33 15.5H38V19.5H33L32 22L35 25.5L32 28.5L28.5 25.5L26 26.5V31H22V26.5L19.5 25.5L16 28.5L13 25.5L16 22L15 19.5H10V15.5H15L16 13L13 9.5L16 6.5L19.5 9.5L22 8.5V4Z"
              stroke={color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
              transform="translate(0, 6.5)"
            />
            <circle cx="24" cy="24" r="5" stroke={color} strokeWidth="2.5" fill="none" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-[#2f2f2f] px-2 py-2 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className="flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all duration-200"
              style={{ backgroundColor: isHovered ? 'rgba(255,255,255,0.1)' : 'transparent' }}
            >
              {renderIcon(item.id, isActive, isHovered)}
              <span 
                className="text-xs font-medium"
                style={{ color: isActive || isHovered ? 'white' : '#9ca3af' }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
