export function SendFeedbackIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center overflow-visible">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 overflow-visible"
      >
        {/* Glow effect */}
        <circle
          cx="24"
          cy="20"
          r="14"
          fill="currentColor"
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
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill="none"
          style={{
            filter: isHovered ? 'drop-shadow(0 0 6px currentColor)' : 'none',
            opacity: isHovered ? 0.9 : 1,
            transition: 'filter 0.3s ease, opacity 0.3s ease'
          }}
        />
        {/* Base lines */}
        <line x1="18" y1="38" x2="30" y2="38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="20" y1="42" x2="28" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* Star inside bulb */}
        <path
          d="M24 12L25.5 17H30.5L26.5 20L28 25L24 22L20 25L21.5 20L17.5 17H22.5L24 12Z"
          stroke="currentColor"
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
