// Original Admin Dashboard Icons

export function AdminHomeIconSVG({ }: { isHovered?: boolean; isActive?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
      <path
        d="M8 24L24 8L40 24"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-300 group-hover:-translate-y-1"
      />
      <path
        d="M12 22V38C12 39.1046 12.8954 40 14 40H20V32C20 30.8954 20.8954 30 22 30H26C27.1046 30 28 30.8954 28 32V40H34C35.1046 40 36 39.1046 36 38V22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="38" cy="12" r="1.5" fill="white" className="opacity-0 group-hover:opacity-80 transition-opacity duration-300" />
      <circle cx="10" cy="14" r="1" fill="white" className="opacity-0 group-hover:opacity-60 transition-opacity duration-300 delay-100" />
    </svg>
  );
}

export function AdminSettingsIconSVG({ }: { isHovered?: boolean; isActive?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
      <g className="transition-transform duration-500 origin-center group-hover:rotate-45">
        <circle cx="24" cy="24" r="6" stroke="white" strokeWidth="2.5" fill="none" />
        <path
          d="M24 4V10M24 38V44M4 24H10M38 24H44M9.86 9.86L14.1 14.1M33.9 33.9L38.14 38.14M38.14 9.86L33.9 14.1M14.1 33.9L9.86 38.14"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </g>
      <circle cx="24" cy="24" r="3" fill="white" className="opacity-0 group-hover:opacity-60 transition-opacity duration-300" />
    </svg>
  );
}

export function AdminApplicationsIconSVG({ isHovered, isActive }: { isHovered?: boolean; isActive?: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className="relative w-7 h-7">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 overflow-visible">
        <rect x="12" y="8" width="24" height="32" rx="3" stroke="white" strokeWidth="3.5" fill="none" />
      <path
        d="M19 8V6C19 4.89543 19.8954 4 21 4H27C28.1046 4 29 4.89543 29 6V8"
        stroke="white"
        strokeWidth="3.5"
        fill="none"
      />
      <line x1="17" y1="16" x2="31" y2="16" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="opacity-50" />
      <line x1="17" y1="22" x2="28" y2="22" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="opacity-50" />
      <path
        d="M18 30L22 34L30 26"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="20"
        strokeDashoffset={shouldAnimate ? "0" : "20"}
        className="transition-all duration-500 ease-out"
      />
      <circle cx="36" cy="12" r="2" fill="white" className={`transition-all duration-300 delay-200 ${shouldAnimate ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
      <circle cx="40" cy="18" r="1.5" fill="white" className={`transition-all duration-300 delay-300 ${shouldAnimate ? 'opacity-70 scale-100' : 'opacity-0 scale-0'}`} />
      <circle cx="38" cy="24" r="1" fill="white" className={`transition-all duration-300 delay-400 ${shouldAnimate ? 'opacity-50 scale-100' : 'opacity-0 scale-0'}`} />
    </svg>
    </div>
  );
}

export function AdminAlertsIconSVG({ isHovered, isActive }: { isHovered?: boolean; isActive?: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className="relative w-7 h-7">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 overflow-visible">
      <g className="transition-all duration-400 ease-out origin-center" style={{ transform: shouldAnimate ? 'translateX(8px) translateY(-4px) rotate(6deg)' : 'translate(0, 0) rotate(0deg)' }}>
        <path d="M8 24L40 12L32 36L24 28L8 24Z" stroke="white" strokeWidth="3.5" strokeLinejoin="round" fill="none" />
        <path d="M8 24L40 12L24 28" stroke="white" strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M24 28L32 36" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      </g>
      <g className={`transition-all duration-300 ${shouldAnimate ? 'opacity-100' : 'opacity-0'}`}>
        <path d="M4 22L10 24" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="opacity-70" />
        <path d="M6 28L12 26" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="opacity-50" />
        <path d="M2 25L8 25" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="opacity-30" />
      </g>
      <g className={`transition-all duration-300 delay-150 ${shouldAnimate ? 'opacity-100' : 'opacity-0'}`}>
        <circle cx="42" cy="10" r="1" fill="white" />
        <path d="M44 8L46 6" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M44 12L46 14" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      </g>
    </svg>
    </div>
  );
}

export function AdminMessagesIconSVG({ isHovered, isActive, unreadCount = 0 }: { isHovered?: boolean; isActive?: boolean; unreadCount?: number }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className={`relative w-7 h-7`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
        <path 
          d="M36 6H14C9.58172 6 6 9.58172 6 14V26C6 30.4183 9.58172 34 14 34H17L24 42L31 34H36C40.4183 34 44 30.4183 44 26V14C44 9.58172 40.4183 6 36 6Z" 
          stroke="white" 
          strokeWidth="3.5" 
          fill="none"
          style={{ transform: shouldAnimate ? 'scale(1.05) translate(-2px, -2px)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 0.3s ease' }}
        />
        <path 
          d="M34 16H12C8.68629 16 6 18.6863 6 22V32C6 35.3137 8.68629 38 12 38H15L21 46L27 38H34C37.3137 38 40 35.3137 40 32V22C40 18.6863 37.3137 16 34 16Z" 
          stroke="white" 
          strokeWidth="3.5" 
          fill="rgba(0,0,0,0.8)"
          style={{ transform: shouldAnimate ? 'scale(1.08) translate(2px, 2px)' : 'scale(1)', transformOrigin: 'center', transition: 'transform 0.3s ease' }}
        />
        <g style={{ opacity: shouldAnimate ? 1 : 0.7, transition: 'opacity 0.3s ease' }}>
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

export function AdminUsersIconSVG({ isHovered, isActive }: { isHovered?: boolean; isActive?: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className="relative w-7 h-7">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 overflow-visible">
      <g className="transition-transform duration-300" style={{ transform: shouldAnimate ? 'scale(0.95)' : 'scale(1)' }}>
        <circle cx="12" cy="28" r="4" stroke="white" strokeWidth="3.5" fill="none" className="opacity-50" />
        <path d="M6 42C6 38 8 36 12 36C16 36 18 38 18 42" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="opacity-50" />
        <circle cx="24" cy="26" r="5" stroke="white" strokeWidth="3.5" fill="none" className="opacity-70" />
        <path d="M16 42C16 37 19 34 24 34C29 34 32 37 32 42" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="opacity-70" />
        <circle cx="36" cy="28" r="4" stroke="white" strokeWidth="3.5" fill="none" className="opacity-50" />
        <path d="M30 42C30 38 32 36 36 36C40 36 42 38 42 42" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="opacity-50" />
      </g>
      <g className="transition-all duration-300 origin-center" style={{ transform: shouldAnimate ? 'scale(1.10)' : 'scale(1)' }}>
        <circle cx="32" cy="14" r="8" stroke="white" strokeWidth="3.5" fill="black" className="fill-black/80" />
        <path d="M38 20L44 26" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M28 11C29 10 31 10 32 11" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="opacity-60" />
      </g>
      <circle cx="24" cy="26" r="7" stroke="white" strokeWidth="3.5" fill="none" className={`transition-opacity duration-300 ${shouldAnimate ? 'opacity-50' : 'opacity-0'}`} strokeDasharray="4 2" />
    </svg>
    </div>
  );
}

export function AdminDataIconSVG({ isHovered, isActive }: { isHovered?: boolean; isActive?: boolean }) {
  const shouldAnimate = isHovered || isActive;
  return (
    <div className="relative w-7 h-7">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 overflow-visible">
      <ellipse cx="24" cy="36" rx="12" ry="4" stroke="white" strokeWidth="3.5" fill="none" />
      <path d="M12 36V32C12 30.34 17.37 29 24 29C30.63 29 36 30.34 36 32V36" stroke="white" strokeWidth="3.5" className="transition-transform duration-300" />
      <ellipse cx="24" cy="28" rx="12" ry="4" stroke="white" strokeWidth="3.5" fill="none" className="transition-transform duration-300" style={{ transform: shouldAnimate ? 'translateY(-4px)' : 'translateY(0)' }} />
      <path d="M12 28V24C12 22.34 17.37 21 24 21C30.63 21 36 22.34 36 24V28" stroke="white" strokeWidth="3.5" className="transition-transform duration-300" style={{ transform: shouldAnimate ? 'translateY(-4px)' : 'translateY(0)' }} />
      <ellipse cx="24" cy="20" rx="12" ry="4" stroke="white" strokeWidth="3.5" fill="none" className="transition-transform duration-300" style={{ transform: shouldAnimate ? 'translateY(-8px)' : 'translateY(0)' }} />
      <circle cx="38" cy="22" r="1.5" fill="white" className={`transition-opacity duration-300 animate-pulse ${shouldAnimate ? 'opacity-80' : 'opacity-0'}`} />
      <circle cx="10" cy="28" r="1" fill="white" className={`transition-opacity duration-300 delay-100 animate-pulse ${shouldAnimate ? 'opacity-60' : 'opacity-0'}`} />
    </svg>
    </div>
  );
}

export function AdminNotificationsIconSVG({ }: { isHovered?: boolean; isActive?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="overflow-visible">
      <path
        d="M24 8C18.4772 8 14 12.4772 14 18V26L10 32H38L34 26V18C34 12.4772 29.5228 8 24 8Z"
        stroke="white"
        strokeWidth="2.5"
        fill="none"
        className="transition-transform duration-300 group-hover:scale-105"
      />
      <path
        d="M20 36C20 38.2091 21.7909 40 24 40C26.2091 40 28 38.2091 28 36"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="transition-transform duration-300 group-hover:translate-y-1"
      />
      <circle
        cx="32"
        cy="18"
        r="4"
        fill="white"
        className="opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
      />
    </svg>
  );
}
