import { useState } from 'react';

interface AnimatedIconProps {
  className?: string;
  onClick?: () => void;
}

export function MoreIcon({ className, onClick }: AnimatedIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  const dots = [
    { cx: 12, cy: 12 },
    { cx: 24, cy: 12 },
    { cx: 36, cy: 12 },
    { cx: 12, cy: 24 },
    { cx: 24, cy: 24 },
    { cx: 36, cy: 24 },
    { cx: 12, cy: 36 },
    { cx: 24, cy: 36 },
    { cx: 36, cy: 36 },
  ];

  return (
    <div
      className={`cursor-pointer flex flex-col items-center gap-1 ${className || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative w-9 h-9 flex items-center justify-center overflow-visible">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[34px] h-[34px] overflow-visible"
          style={{
            transform: isHovered ? "rotate(90deg)" : "rotate(0deg)",
            transformOrigin: "50% 50%",
            transition: "transform 0.4s ease-in-out",
          }}
        >
          {dots.map((dot, i) => (
            <circle
              key={i}
              cx={dot.cx}
              cy={dot.cy}
              r="3"
              fill="white"
              style={{
                transform: isHovered ? "scale(1.15)" : "scale(1)",
                transformOrigin: `${dot.cx}px ${dot.cy}px`,
                transition: `transform 0.3s ease ${i * 0.03}s`,
              }}
            />
          ))}
        </svg>
      </div>
      <span
        className="text-xs font-medium transition-colors duration-300"
        style={{ color: isHovered ? "white" : "#F8FAFC" }}
      >
        More
      </span>
    </div>
  );
}

