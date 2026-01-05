import { useState } from 'react'

interface EditIconProps {
  onClick?: () => void
  className?: string
}

export function EditIcon({ onClick, className }: EditIconProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-2.5 rounded-lg transition-colors ${className || ''}`}
      aria-label="Edit"
    >
      <svg 
        viewBox="0 0 48 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-6 h-6 overflow-visible"
      >
        {/* Square/paper background */}
        <rect 
          x="8" 
          y="10" 
          width="28" 
          height="28" 
          rx="3" 
          stroke="white" 
          stroke-width="3.5" 
          fill="none"
        />
        
        {/* Corner fold (paper detail) */}
        <path
          d="M36 10 L36 16 L30 16"
          stroke="white"
          stroke-width="3.5"
          fill="none"
        />

        {/* Pencil - animated group */}
        <g 
          style={{
            transform: isHovered ? "translate(-2px, -2px) rotate(-5deg)" : "translate(0, 0) rotate(0deg)",
            transformOrigin: "32px 14px",
            transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
        >
          {/* Pencil body */}
          <path
            d="M40 8 L28 20 L22 14 L34 2 C34.8 1.2 36.2 1.2 37 2 L40 5 C40.8 5.8 40.8 7.2 40 8 Z"
            stroke="white"
            stroke-width="3.5"
            fill="rgba(0,0,0,0.9)"
            strokeLinejoin="round"
          />
          
          {/* Pencil tip highlight */}
          <path
            d="M28 20 L22 14 L20 16 L26 22 Z"
            fill="white"
            opacity="0.7"
          />
        </g>

        {/* Underline that draws out on hover */}
        <line
          x1="12"
          y1="20"
          x2="28"
          y2="20"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            opacity: isHovered ? 0.5 : 0,
            strokeDasharray: "16",
            strokeDashoffset: isHovered ? "0" : "16",
            transition: "all 0.4s ease 0.2s"
          }}
        />

        {/* Sparkle effect on hover */}
        <circle
          cx="36"
          cy="10"
          r="2"
          fill="white"
          style={{
            opacity: isHovered ? 0.8 : 0,
            transform: isHovered ? "scale(1)" : "scale(0)",
            transformOrigin: "36px 10px",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s"
          }}
        />

        {/* Glow effect on hover */}
        <rect 
          x="8" 
          y="10" 
          width="28" 
          height="28" 
          rx="3" 
          fill="white"
          style={{
            opacity: isHovered ? 0.1 : 0,
            transition: "opacity 0.3s ease"
          }}
        />
      </svg>
    </button>
  )
}
