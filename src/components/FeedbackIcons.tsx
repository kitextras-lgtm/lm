export function SuggestionIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center overflow-visible">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 overflow-visible"
      >
        {/* Glow effect */}
        <circle
          cx="24"
          cy="20"
          r="14"
          fill="white"
          style={{
            opacity: isHovered ? 0.15 : 0,
            transform: isHovered ? 'scale(1.3)' : 'scale(1)',
            transformOrigin: '24px 20px',
            filter: 'blur(8px)',
            transition: 'all 0.4s ease'
          }}
        />
        {/* Bulb */}
        <path
          d="M24 6C17.4 6 12 11.4 12 18C12 22.4 14.4 26.2 18 28.4V34H30V28.4C33.6 26.2 36 22.4 36 18C36 11.4 30.6 6 24 6Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
          style={{
            filter: isHovered ? 'drop-shadow(0 0 6px rgba(255,255,255,0.6))' : 'none',
            transition: 'filter 0.3s ease'
          }}
        />
        {/* Base lines */}
        <line x1="18" y1="38" x2="30" y2="38" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="42" x2="28" y2="42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        {/* Star inside bulb */}
        <path
          d="M24 12L25.5 17H30.5L26.5 20L28 25L24 22L20 25L21.5 20L17.5 17H22.5L24 12Z"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
          style={{
            opacity: isHovered ? 1 : 0.5,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transformOrigin: '24px 18px',
            transition: 'all 0.3s ease'
          }}
        />
      </svg>
    </div>
  );
}

export function BugReportIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center overflow-visible">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 overflow-visible"
        style={{
          transform: isHovered ? 'rotate(5deg)' : 'rotate(0deg)',
          transition: 'transform 0.15s ease-in-out'
        }}
      >
        {/* Bug body - oval */}
        <ellipse 
          cx="24" 
          cy="28" 
          rx="10" 
          ry="12" 
          stroke="white" 
          strokeWidth="2.5" 
          fill="none"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            transformOrigin: '24px 28px',
            transition: 'transform 0.3s ease'
          }}
        />
        {/* Bug head */}
        <circle cx="24" cy="14" r="5" stroke="white" strokeWidth="2.5" fill="none" />
        {/* Antennae */}
        <path 
          d="M20 10L16 4" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'rotate(-15deg)' : 'rotate(0deg)',
            transformOrigin: '20px 10px',
            transition: 'transform 0.2s ease'
          }}
        />
        <path 
          d="M28 10L32 4" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'rotate(15deg)' : 'rotate(0deg)',
            transformOrigin: '28px 10px',
            transition: 'transform 0.2s ease'
          }}
        />
        {/* Body segments */}
        <line x1="14" y1="24" x2="34" y2="24" stroke="white" strokeWidth="2.5" />
        <line x1="14" y1="32" x2="34" y2="32" stroke="white" strokeWidth="2.5" />
        {/* Legs - left */}
        <path 
          d="M14 24L8 20" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'rotate(-10deg)' : 'rotate(0deg)',
            transformOrigin: '14px 24px',
            transition: 'transform 0.2s ease 0.05s'
          }}
        />
        <path 
          d="M14 28L6 28" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'translateX(-2px)' : 'translateX(0)',
            transition: 'transform 0.2s ease 0.1s'
          }}
        />
        <path 
          d="M14 32L8 36" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'rotate(10deg)' : 'rotate(0deg)',
            transformOrigin: '14px 32px',
            transition: 'transform 0.2s ease 0.15s'
          }}
        />
        {/* Legs - right */}
        <path 
          d="M34 24L40 20" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'rotate(10deg)' : 'rotate(0deg)',
            transformOrigin: '34px 24px',
            transition: 'transform 0.2s ease 0.05s'
          }}
        />
        <path 
          d="M34 28L42 28" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
            transition: 'transform 0.2s ease 0.1s'
          }}
        />
        <path 
          d="M34 32L40 36" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'rotate(-10deg)' : 'rotate(0deg)',
            transformOrigin: '34px 32px',
            transition: 'transform 0.2s ease 0.15s'
          }}
        />
      </svg>
    </div>
  );
}

export function FeatureRequestIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center overflow-visible">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 overflow-visible"
        style={{
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Wand */}
        <path
          d="M8 40L28 20"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: isHovered ? 'rotate(-5deg)' : 'rotate(0deg)',
            transformOrigin: '8px 40px',
            transition: 'transform 0.3s ease'
          }}
        />
        {/* Wand tip */}
        <path
          d="M28 20L32 16L36 20L32 24L28 20Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
          style={{
            transform: isHovered ? 'rotate(-5deg)' : 'rotate(0deg)',
            transformOrigin: '8px 40px',
            transition: 'transform 0.3s ease'
          }}
        />
        {/* Sparkles */}
        <circle
          cx="38"
          cy="10"
          r="2"
          fill="white"
          style={{
            opacity: isHovered ? 1 : 0.5,
            transform: isHovered ? 'scale(1.3)' : 'scale(1)',
            transformOrigin: '38px 10px',
            transition: 'all 0.3s ease'
          }}
        />
        <circle
          cx="42"
          cy="18"
          r="1.5"
          fill="white"
          style={{
            opacity: isHovered ? 1 : 0.3,
            transform: isHovered ? 'scale(1.5)' : 'scale(1)',
            transformOrigin: '42px 18px',
            transition: 'all 0.3s ease 0.1s'
          }}
        />
        <circle
          cx="34"
          cy="6"
          r="1.5"
          fill="white"
          style={{
            opacity: isHovered ? 1 : 0.3,
            transform: isHovered ? 'scale(1.5)' : 'scale(1)',
            transformOrigin: '34px 6px',
            transition: 'all 0.3s ease 0.15s'
          }}
        />
        {/* Star sparkle */}
        <path
          d="M18 8L19 11L22 12L19 13L18 16L17 13L14 12L17 11L18 8Z"
          fill="white"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'scale(1.2) rotate(15deg)' : 'scale(0.8) rotate(0deg)',
            transformOrigin: '18px 12px',
            transition: 'all 0.3s ease 0.05s'
          }}
        />
      </svg>
    </div>
  );
}

export function OtherIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center overflow-visible">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 overflow-visible"
        style={{
          transform: isHovered ? 'rotate(-8deg) translateY(-2px)' : 'rotate(0deg) translateY(0)',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Pencil body */}
        <path
          d="M12 36L8 40L12 44L36 20L32 16L12 36Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Pencil tip */}
        <path
          d="M36 20L40 16L44 12L40 8L36 12L32 16L36 20Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Eraser band */}
        <line x1="14" y1="34" x2="18" y2="38" stroke="white" strokeWidth="2.5" />
        {/* Writing lines - appear on hover */}
        <line
          x1="6"
          y1="28"
          x2="14"
          y2="28"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'all 0.3s ease'
          }}
        />
        <line
          x1="6"
          y1="22"
          x2="18"
          y2="22"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'all 0.3s ease 0.1s'
          }}
        />
        <line
          x1="6"
          y1="16"
          x2="12"
          y2="16"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateX(0)' : 'translateX(-4px)',
            transition: 'all 0.3s ease 0.15s'
          }}
        />
      </svg>
    </div>
  );
}

