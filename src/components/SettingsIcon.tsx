import { useState } from 'react';

interface AnimatedIconProps {
  className?: string;
  onClick?: () => void;
}

export function SettingsIcon({ className, onClick }: AnimatedIconProps) {
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
          <g
            style={{
              transform: isHovered ? "rotate(45deg)" : "rotate(0deg)",
              transformOrigin: "24px 24px",
              transition: "transform 0.5s ease-in-out",
            }}
          >
            {/* Proper gear with rectangular teeth */}
            <path
              d="M22 4H26V8.5L28.5 9.5L32 6.5L35 9.5L32 13L33 15.5H38V19.5H33L32 22L35 25.5L32 28.5L28.5 25.5L26 26.5V31H22V26.5L19.5 25.5L16 28.5L13 25.5L16 22L15 19.5H10V15.5H15L16 13L13 9.5L16 6.5L19.5 9.5L22 8.5V4Z"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
              transform="translate(0, 6.5) scale(1)"
            />
          </g>
          {/* Center hole */}
          <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="2.5" fill="none" />
        </svg>
      </div>
      <span
        className="text-xs font-medium transition-colors duration-300"
        style={{ color: 'var(--text-primary)' }}
      >
        Settings
      </span>
    </div>
  );
}
