import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_AVATAR_DATA_URI } from './DefaultAvatar';

interface LeftSidebarProps {
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
}

// Consistent icon size for all icons - 28px
const ICON_SIZE = "w-7 h-7";

// Individual icon SVGs for sidebar - all with consistent sizing
function HomeIconSVG({ isHovered }: { isHovered: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}>
      <rect x="12" y="20" width="24" height="26" rx="2" stroke="white" strokeWidth="2.5" fill="none"/>
      <path d="M4 22L24 4L44 22" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path 
        d="M18 46V30C18 29.4477 18.4477 29 19 29H29C29.5523 29 30 29.4477 30 30V46" 
        fill="white"
        style={{ opacity: isHovered ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
      />
      <ellipse 
        cx="24" 
        cy="38" 
        rx="7" 
        ry="9" 
        fill="white"
        style={{ opacity: isHovered ? 0.4 : 0, transition: 'opacity 0.3s ease' }}
      />
    </svg>
  );
}

function ExploreIconSVG({ isHovered }: { isHovered: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}>
      <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="24" cy="24" r="16" stroke="white" strokeWidth="1" strokeOpacity="0.4" fill="none" />
      <line x1="24" y1="4" x2="24" y2="8" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="40" x2="24" y2="44" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="4" y1="24" x2="8" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="40" y1="24" x2="44" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="38.1" y1="9.9" x2="36" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="38.1" y1="38.1" x2="36" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="9.9" y1="38.1" x2="12" y2="36" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="9.9" y1="9.9" x2="12" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <g style={{
        transform: isHovered ? "rotate(180deg)" : "rotate(0deg)",
        transformOrigin: "24px 24px",
        transition: "transform 0.5s ease-in-out",
      }}>
        <path d="M24 10L28 24H20L24 10Z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="white" />
        <path d="M24 38L28 24H20L24 38Z" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none" />
      </g>
      <circle cx="24" cy="24" r="2.5" fill="white" />
    </svg>
  );
}

function TalentIconSVG({ isHovered }: { isHovered: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${ICON_SIZE} overflow-visible`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const cx = 8 + i * 8;
        return (
          <polygon
            key={i}
            points={`${cx},2 ${cx + 1.2},5 ${cx + 4},5.5 ${cx + 2},7.5 ${cx + 2.5},11 ${cx},9 ${cx - 2.5},11 ${cx - 2},7.5 ${cx - 4},5.5 ${cx - 1.2},5`}
            fill="white"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "scale(1) translateY(0)" : "scale(0.5) translateY(4px)",
              transformOrigin: `${cx}px 6px`,
              transition: `all 0.3s ease ${i * 0.06}s`,
            }}
          />
        );
      })}
      <circle cx="12" cy="22" r="5" stroke="white" strokeWidth="2.5" fill="none"
        style={{ opacity: 0.5, transform: isHovered ? "translateX(-3px)" : "translateX(0)", transition: "all 0.3s ease" }} />
      <path d="M4 44C4 37 7 32 12 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"
        style={{ opacity: 0.5, transform: isHovered ? "translateX(-3px)" : "translateX(0)", transition: "all 0.3s ease" }} />
      <circle cx="36" cy="22" r="5" stroke="white" strokeWidth="2.5" fill="none"
        style={{ opacity: 0.5, transform: isHovered ? "translateX(3px)" : "translateX(0)", transition: "all 0.3s ease" }} />
      <path d="M44 44C44 37 41 32 36 32" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"
        style={{ opacity: 0.5, transform: isHovered ? "translateX(3px)" : "translateX(0)", transition: "all 0.3s ease" }} />
      <circle cx="24" cy="20" r="6" stroke="white" strokeWidth="2.5" fill="none"
        style={{ transform: isHovered ? "scale(1.05)" : "scale(1)", transformOrigin: "24px 20px", transition: "transform 0.3s ease" }} />
      <path d="M12 44C12 35 17 30 24 30C31 30 36 35 36 44" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function DealsIconSVG({ isHovered }: { isHovered: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${ICON_SIZE} overflow-visible`}>
      <g style={{ transform: isHovered ? "translateX(2px) rotate(0deg)" : "translateX(-3px) rotate(-2deg)", transformOrigin: "16px 24px", transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <path d="M6 12C6 10.9 6.9 10 8 10H18V14C18 15.66 16.66 17 15 17C13.34 17 12 15.66 12 14V10H8C6.9 10 6 10.9 6 12V20H10C11.66 20 13 21.34 13 23C13 24.66 11.66 26 10 26H6V34C6 35.1 6.9 36 8 36H18V32C18 30.34 16.66 29 15 29C13.34 29 12 30.34 12 32V36H18V10" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
        <path d="M18 18V16C19.66 16 21 17.34 21 19V21H23C24.66 21 26 22.34 26 24C26 25.66 24.66 27 23 27H21V29C21 30.66 19.66 32 18 32V30" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
      </g>
      <g style={{ transform: isHovered ? "translateX(-2px) rotate(0deg)" : "translateX(3px) rotate(2deg)", transformOrigin: "32px 24px", transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <path d="M42 12C42 10.9 41.1 10 40 10H30V14C30 15.66 31.34 17 33 17C34.66 17 36 15.66 36 14V10H40C41.1 10 42 10.9 42 12V20H38C36.34 20 35 21.34 35 23C35 24.66 36.34 26 38 26H42V34C42 35.1 41.1 36 40 36H30V32C30 30.34 31.34 29 33 29C34.66 29 36 30.34 36 32V36H30V10" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
        <path d="M30 18V16C28.34 16 27 17.34 27 19V21H25C23.34 21 22 22.34 22 24C22 25.66 23.34 27 25 27H27V29C27 30.66 28.34 32 30 32V30" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none" />
      </g>
      <ellipse cx="24" cy="24" rx="4" ry="6" fill="white" style={{ opacity: isHovered ? 0.6 : 0, transform: isHovered ? "scale(1)" : "scale(0.5)", transformOrigin: "24px 24px", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s", filter: "blur(3px)" }} />
    </svg>
  );
}

function MessagesIconSVG({ isHovered, unreadCount = 0 }: { isHovered: boolean; unreadCount?: number }) {
  return (
    <div className={`relative ${ICON_SIZE}`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}>
        <path 
          d="M36 6H14C9.58172 6 6 9.58172 6 14V26C6 30.4183 9.58172 34 14 34H17L24 42L31 34H36C40.4183 34 44 30.4183 44 26V14C44 9.58172 40.4183 6 36 6Z" 
          stroke="white" 
          strokeWidth="2.5" 
          fill="none"
          style={{ transform: isHovered ? 'scale(1.05) translate(-2px, -2px)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 0.3s ease' }}
        />
        <path 
          d="M34 16H12C8.68629 16 6 18.6863 6 22V32C6 35.3137 8.68629 38 12 38H15L21 46L27 38H34C37.3137 38 40 35.3137 40 32V22C40 18.6863 37.3137 16 34 16Z" 
          stroke="white" 
          strokeWidth="2.5" 
          fill="rgba(0,0,0,0.8)"
          style={{ transform: isHovered ? 'scale(1.08) translate(2px, 2px)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 0.3s ease' }}
        />
        <g style={{ opacity: isHovered ? 1 : 0.7, transition: 'opacity 0.3s ease' }}>
          <circle cx="15" cy="28" r="2" fill="white"/>
          <circle cx="23" cy="28" r="2" fill="white"/>
          <circle cx="31" cy="28" r="2" fill="white"/>
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

function EarningsIconSVG({ isHovered }: { isHovered: boolean }) {
  return (
    <div className={`relative ${ICON_SIZE} overflow-visible`}>
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className={ICON_SIZE}
        style={{
          animation: isHovered ? 'piggyWiggle 0.4s ease-in-out' : 'none'
        }}
      >
        {/* Piggy body - larger */}
        <ellipse cx="24" cy="26" rx="18" ry="14" stroke="white" strokeWidth="2.5" fill="none"/>
        {/* Snout */}
        <ellipse cx="40" cy="26" rx="5" ry="4" stroke="white" strokeWidth="2.5" fill="none"/>
        {/* Eyes */}
        <circle cx="39" cy="24" r="1" fill="white"/>
        <circle cx="42" cy="24" r="1" fill="white"/>
        {/* Ear */}
        <path d="M14 16C14 16 11 10 16 8C21 6 24 12 24 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        {/* Legs */}
        <path d="M14 38V46" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M22 38V46" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M28 38V46" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M36 38V46" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Coin slot */}
        <rect x="19" y="12" width="10" height="3" rx="1.5" fill="white"/>
        {/* Spot */}
        <circle cx="16" cy="22" r="2" fill="white"/>
      </svg>
      {/* Coin 1 */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{ 
          opacity: isHovered ? 0 : 0,
          animation: isHovered ? 'coinDrop1 0.6s ease-in forwards' : 'none'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.5" fill="none"/>
          <text x="6" y="8" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">$</text>
        </svg>
      </div>
      {/* Coin 2 */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{ 
          opacity: isHovered ? 0 : 0,
          animation: isHovered ? 'coinDrop2 0.6s ease-in 0.15s forwards' : 'none'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="5" stroke="white" strokeWidth="1.5" fill="none"/>
          <text x="6" y="8" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">$</text>
        </svg>
      </div>
      <style>{`
        @keyframes piggyWiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        @keyframes coinDrop1 {
          0% { opacity: 1; transform: translateX(-50%) translateY(-8px); }
          100% { opacity: 0; transform: translateX(-50%) translateY(14px); }
        }
        @keyframes coinDrop2 {
          0% { opacity: 1; transform: translateX(-50%) translateY(-8px); }
          100% { opacity: 0; transform: translateX(-50%) translateY(14px); }
        }
      `}</style>
    </div>
  );
}

function SettingsIconSVG({ isHovered }: { isHovered: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${ICON_SIZE} overflow-visible`}>
      {/* Gear teeth - rotates on hover */}
      <g style={{ transform: isHovered ? "rotate(45deg)" : "rotate(0deg)", transformOrigin: "24px 24px", transition: "transform 0.5s ease-in-out" }}>
        <path
          d="M21 4H27V10L30 11.5L35 6L42 13L37 18L38.5 21H44V27H38.5L37 30L42 35L35 42L30 37L27 38.5V44H21V38.5L18 37L13 42L6 35L11 30L9.5 27H4V21H9.5L11 18L6 13L13 6L18 11L21 10V4Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
      {/* Center circle - stays fixed */}
      <circle cx="24" cy="24" r="7" stroke="white" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

function MoreIconSVG({ isHovered }: { isHovered: boolean }) {
  const dots = [
    { cx: 8, cy: 8 }, { cx: 24, cy: 8 }, { cx: 40, cy: 8 },
    { cx: 8, cy: 24 }, { cx: 24, cy: 24 }, { cx: 40, cy: 24 },
    { cx: 8, cy: 40 }, { cx: 24, cy: 40 }, { cx: 40, cy: 40 },
  ];
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={ICON_SIZE}
      style={{ transform: isHovered ? "rotate(90deg)" : "rotate(0deg)", transformOrigin: "50% 50%", transition: "transform 0.4s ease-in-out" }}>
      {dots.map((dot, i) => (
        <circle key={i} cx={dot.cx} cy={dot.cy} r="4" fill="white"
          style={{ transform: isHovered ? "scale(1.15)" : "scale(1)", transformOrigin: `${dot.cx}px ${dot.cy}px`, transition: `transform 0.3s ease ${i * 0.03}s` }} />
      ))}
    </svg>
  );
}

export function LeftSidebar({ 
  activeSection, 
  setActiveSection, 
  userProfile,
  unreadCount = 0,
  cachedProfilePic
}: LeftSidebarProps) {
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIconSVG },
    { id: 'explore', label: 'Explore', icon: ExploreIconSVG },
    { id: 'talent', label: 'Talent', icon: TalentIconSVG },
    { id: 'deals', label: 'Deals', icon: DealsIconSVG },
    { id: 'messages', label: 'Messages', icon: MessagesIconSVG },
    { id: 'earnings', label: 'Earnings', icon: EarningsIconSVG },
    { id: 'settings', label: 'Settings', icon: SettingsIconSVG },
    { id: 'more', label: 'More', icon: MoreIconSVG },
  ];

  const profilePicUrl = userProfile?.profile_picture_url;
  const displayPic = cachedProfilePic || (profilePicUrl && !profilePicUrl.startsWith('blob:') ? profilePicUrl : null);

  return (
    <aside className="hidden lg:flex flex-col h-screen w-[275px] fixed left-0 top-0 border-r border-[#1a1a1a] bg-[#111111] z-40">
      {/* Logo - Large and prominent */}
      <div className="px-4 pt-4 pb-4">
        <img 
          src="/elevate_transparent_white_.png" 
          alt="ELEVATE" 
          className="h-24 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate('/')}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isHovered = hoveredItem === item.id;
          const isActive = activeSection === item.id;
          const IconComponent = item.icon;

          return (
            <div
              key={item.id}
              className="cursor-pointer flex items-center gap-5 px-4 py-3 rounded-full transition-all duration-200 my-0.5"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => setActiveSection(item.id)}
              style={{ 
                backgroundColor: isHovered ? 'rgba(255,255,255,0.08)' : 'transparent',
              }}
            >
              <div className="w-7 h-7 flex items-center justify-center overflow-visible">
                {item.id === 'messages' ? (
                  <IconComponent isHovered={isHovered} unreadCount={activeSection !== 'messages' ? unreadCount : 0} />
                ) : (
                  <IconComponent isHovered={isHovered} />
                )}
              </div>
              <span
                className="text-lg transition-colors duration-300"
                style={{ 
                  color: isHovered || isActive ? "#ffffff" : "#F8FAFC",
                  fontWeight: isActive ? 700 : 400
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      {/* Profile Section at Bottom */}
      <div 
        className="p-3 mb-4 mx-3 rounded-full cursor-pointer transition-all duration-200 hover:bg-white/10"
        onClick={() => setActiveSection('profile')}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {displayPic ? (
              <img 
                src={displayPic} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={DEFAULT_AVATAR_DATA_URI} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-[#F8FAFC] text-sm truncate">
              {userProfile?.first_name && userProfile?.last_name 
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : 'Your Name'}
            </div>
            <div className="text-[#94A3B8] text-sm truncate">
              @{userProfile?.username || 'username'}
            </div>
          </div>
          <div className="text-[#94A3B8]">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
            </svg>
          </div>
        </div>
      </div>
    </aside>
  );
}
