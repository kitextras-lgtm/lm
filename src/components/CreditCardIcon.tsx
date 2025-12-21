export function CreditCardIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center pointer-events-none">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
        style={{
          animation: isHovered ? 'cardSpin 0.6s ease-in-out' : 'none'
        }}
      >
        {/* Main card rectangle */}
        <rect
          x="6"
          y="12"
          width="36"
          height="24"
          rx="3"
          stroke="white"
          strokeWidth="2.5"
        />
        {/* Magnetic stripe */}
        <line
          x1="6"
          y1="20"
          x2="42"
          y2="20"
          stroke="white"
          strokeWidth="2.5"
        />
        {/* Chip */}
        <rect
          x="12"
          y="26"
          width="8"
          height="6"
          rx="1"
          stroke="white"
          strokeWidth="2.5"
        />
        {/* Card number line */}
        <line
          x1="26"
          y1="29"
          x2="36"
          y2="29"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="2 4"
        />
        {/* Shimmer/scan effect */}
        <rect
          x="-2"
          y="12"
          width="10"
          height="24"
          fill="url(#shimmer-credit)"
          style={{
            opacity: isHovered ? 0 : 0,
            animation: isHovered ? 'shimmerSweep 0.6s ease-out' : 'none'
          }}
        />
        {/* Glow effect */}
        <rect
          x="6"
          y="12"
          width="36"
          height="24"
          rx="3"
          stroke="white"
          strokeWidth="3"
          fill="none"
          style={{
            opacity: isHovered ? 0 : 0,
            animation: isHovered ? 'cardGlow 0.6s ease-in-out' : 'none'
          }}
        />
        <defs>
          <linearGradient id="shimmer-credit" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      <style>{`
        @keyframes cardSpin {
          0% { 
            transform: rotateY(0deg); 
          }
          50% { 
            transform: rotateY(180deg) scale(1.1); 
          }
          100% { 
            transform: rotateY(360deg); 
          }
        }
        
        @keyframes shimmerSweep {
          0% { 
            opacity: 0; 
            transform: translateX(0); 
          }
          30% { 
            opacity: 0.7; 
          }
          100% { 
            opacity: 0; 
            transform: translateX(50px); 
          }
        }
        
        @keyframes cardGlow {
          0% { 
            opacity: 0; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.5; 
            transform: scale(1.15); 
          }
          100% { 
            opacity: 0; 
            transform: scale(1); 
          }
        }
      `}</style>
    </div>
  )
}
