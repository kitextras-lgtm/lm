import { useState } from 'react';

interface AnimatedIconProps {
  className?: string;
  onClick?: () => void;
}

export function PuzzleDealIcon({ className, onClick }: AnimatedIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`cursor-pointer flex flex-col items-center gap-1 overflow-visible ${className || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative w-9 h-9 flex items-center justify-center overflow-visible">
        {/* Shadow/lift effect */}
        <div
          className="absolute w-9 h-2 rounded-full bg-white/20 blur-sm"
          style={{
            bottom: "-2px",
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "scaleX(1.1)" : "scaleX(0.8)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[34px] h-[34px] overflow-visible">
          {/* Left puzzle piece - slides right to connect on hover */}
          <g
            style={{
              transform: isHovered ? "translateX(2px) rotate(0deg)" : "translateX(-3px) rotate(-2deg)",
              transformOrigin: "16px 24px",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <path
              d="M6 12C6 10.9 6.9 10 8 10H18V14C18 15.66 16.66 17 15 17C13.34 17 12 15.66 12 14V10H8C6.9 10 6 10.9 6 12V20H10C11.66 20 13 21.34 13 23C13 24.66 11.66 26 10 26H6V34C6 35.1 6.9 36 8 36H18V32C18 30.34 16.66 29 15 29C13.34 29 12 30.34 12 32V36H18V10"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Left piece tab (protrudes right) */}
            <path
              d="M18 18V16C19.66 16 21 17.34 21 19V21H23C24.66 21 26 22.34 26 24C26 25.66 24.66 27 23 27H21V29C21 30.66 19.66 32 18 32V30"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* Right puzzle piece - slides left to connect on hover */}
          <g
            style={{
              transform: isHovered ? "translateX(-2px) rotate(0deg)" : "translateX(3px) rotate(2deg)",
              transformOrigin: "32px 24px",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <path
              d="M42 12C42 10.9 41.1 10 40 10H30V14C30 15.66 31.34 17 33 17C34.66 17 36 15.66 36 14V10H40C41.1 10 42 10.9 42 12V20H38C36.34 20 35 21.34 35 23C35 24.66 36.34 26 38 26H42V34C42 35.1 41.1 36 40 36H30V32C30 30.34 31.34 29 33 29C34.66 29 36 30.34 36 32V36H30V10"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Right piece slot (indents left) */}
            <path
              d="M30 18V16C28.34 16 27 17.34 27 19V21H25C23.34 21 22 22.34 22 24C22 25.66 23.34 27 25 27H27V29C27 30.66 28.34 32 30 32V30"
              stroke="white"
              strokeWidth="2.5"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* Connection glow at center when pieces meet */}
          <ellipse
            cx="24"
            cy="24"
            rx="4"
            ry="6"
            fill="white"
            style={{
              opacity: isHovered ? 0.6 : 0,
              transform: isHovered ? "scale(1)" : "scale(0.5)",
              transformOrigin: "24px 24px",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
              filter: "blur(3px)",
            }}
          />

          {/* Connection spark line */}
          <line
            x1="24"
            y1="16"
            x2="24"
            y2="32"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              opacity: isHovered ? 1 : 0,
              strokeDasharray: "4 4",
              strokeDashoffset: isHovered ? "0" : "16",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s",
            }}
          />

          {/* Particle sparkles bursting from connection */}
          <circle
            cx="24"
            cy="12"
            r="2"
            fill="white"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(-4px) scale(1)" : "translateY(0) scale(0)",
              transformOrigin: "24px 12px",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s",
            }}
          />
          <circle
            cx="24"
            cy="36"
            r="2"
            fill="white"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateY(4px) scale(1)" : "translateY(0) scale(0)",
              transformOrigin: "24px 36px",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.25s",
            }}
          />
          <circle
            cx="16"
            cy="24"
            r="1.5"
            fill="white"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateX(-4px) scale(1)" : "translateX(0) scale(0)",
              transformOrigin: "16px 24px",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s",
            }}
          />
          <circle
            cx="32"
            cy="24"
            r="1.5"
            fill="white"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "translateX(4px) scale(1)" : "translateX(0) scale(0)",
              transformOrigin: "32px 24px",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s",
            }}
          />

          {/* Corner sparkles */}
          <circle
            cx="8"
            cy="8"
            r="1.5"
            fill="white"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "scale(1)" : "scale(0)",
              transformOrigin: "8px 8px",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s",
            }}
          />
          <circle
            cx="40"
            cy="40"
            r="1.5"
            fill="white"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? "scale(1)" : "scale(0)",
              transformOrigin: "40px 40px",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s",
            }}
          />
        </svg>
      </div>
      <span className="text-xs font-medium transition-colors duration-300 hover:text-white" style={{ color: "#F8FAFC" }}>
        Deals
      </span>
    </div>
  );
}

