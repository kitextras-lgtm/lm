import { useState } from 'react';

interface AnimatedIconProps {
  className?: string;
  onClick?: () => void;
}

export function TalentIcon({ className, onClick }: AnimatedIconProps) {
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
          {/* 5 Stars - evenly spaced at top */}
          {[0, 1, 2, 3, 4].map((i) => {
            const cx = 8 + i * 8;
            return (
              <polygon
                key={i}
                points={`${cx},2 ${cx + 1.2},5 ${cx + 4},5.5 ${cx + 2},7.5 ${cx + 2.5},11 ${cx},9 ${cx - 2.5},11 ${cx - 2},7.5 ${cx - 4},5.5 ${cx - 1.2},5`}
                fill="currentColor"
                style={{
                  opacity: isHovered ? 1 : 0,
                  transform: isHovered ? "scale(1) translateY(0)" : "scale(0.5) translateY(4px)",
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
              transform: isHovered ? "translateX(-3px)" : "translateX(0)",
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
              transform: isHovered ? "translateX(-3px)" : "translateX(0)",
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
              transform: isHovered ? "translateX(3px)" : "translateX(0)",
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
              transform: isHovered ? "translateX(3px)" : "translateX(0)",
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
              transform: isHovered ? "scale(1.05)" : "scale(1)",
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
      <span
        className="text-xs font-medium transition-colors duration-300"
        style={{ color: 'var(--text-primary)' }}
      >
        Talent
      </span>
    </div>
  );
}

