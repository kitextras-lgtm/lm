import { useState } from 'react';

interface AnimatedIconProps {
  className?: string;
  onClick?: () => void;
}

export function ExploreIcon({ className, onClick }: AnimatedIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`cursor-pointer flex flex-col items-center gap-1 ${className || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative w-9 h-9 flex items-center justify-center overflow-visible">
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[34px] h-[34px] overflow-visible">
          {/* Outer compass circle */}
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none" />
          {/* Inner ring */}
          <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" fill="none" />

          {/* Cardinal direction ticks - N E S W (longer) */}
          <line x1="24" y1="4" x2="24" y2="8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="40" x2="24" y2="44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="4" y1="24" x2="8" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />

          {/* Intercardinal ticks - NE SE SW NW (shorter) */}
          <line x1="38.1" y1="9.9" x2="36" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="38.1" y1="38.1" x2="36" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="9.9" y1="38.1" x2="12" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="9.9" y1="9.9" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

          {/* Compass needle group */}
          <g
            style={{
              transform: isHovered ? "rotate(180deg)" : "rotate(0deg)",
              transformOrigin: "24px 24px",
              transition: "transform 0.5s ease-in-out",
            }}
          >
            {/* North pointer (filled) */}
            <path d="M24 10L28 24H20L24 10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" />
            {/* South pointer (outline) */}
            <path d="M24 38L28 24H20L24 38Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
          </g>

          {/* Center dot */}
          <circle cx="24" cy="24" r="2.5" fill="currentColor" />
        </svg>
      </div>
      <span
        className="text-xs font-medium transition-colors duration-300"
        style={{ color: 'var(--text-primary)' }}
      >
        Explore
      </span>
    </div>
  );
}

