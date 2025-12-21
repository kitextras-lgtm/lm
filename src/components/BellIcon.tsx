export function BellIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center pointer-events-none">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        <g
          style={{
            transform: isHovered ? 'rotate(0deg)' : 'rotate(0deg)',
            transformOrigin: '24px 8px',
            animation: isHovered ? 'bellRing 0.6s ease-in-out' : 'none'
          }}
        >
          <path
            d="M24 6C24 6 24 8 24 10C18 10 14 15 14 22V30L10 34H38L34 30V22C34 15 30 10 24 10C24 8 24 6 24 6Z"
            stroke="white"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M20 34C20 37 22 40 24 40C26 40 28 37 28 34"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
        
        {/* First ripple */}
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="white"
          strokeWidth="2"
          style={{
            opacity: isHovered ? 0 : 0,
            transform: isHovered ? 'scale(1.3)' : 'scale(1)',
            transformOrigin: 'center',
            animation: isHovered ? 'ripple1 0.8s ease-out' : 'none'
          }}
        />
        
        {/* Second ripple */}
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="white"
          strokeWidth="2"
          style={{
            opacity: isHovered ? 0 : 0,
            transform: isHovered ? 'scale(1.4)' : 'scale(1)',
            transformOrigin: 'center',
            animation: isHovered ? 'ripple2 0.8s ease-out 0.15s' : 'none'
          }}
        />
        
        {/* Third ripple */}
        <circle
          cx="24"
          cy="24"
          r="18"
          stroke="white"
          strokeWidth="1.5"
          style={{
            opacity: isHovered ? 0 : 0,
            transform: isHovered ? 'scale(1.5)' : 'scale(1)',
            transformOrigin: 'center',
            animation: isHovered ? 'ripple3 0.8s ease-out 0.3s' : 'none'
          }}
        />
      </svg>
      
      <style>{`
        @keyframes bellRing {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(-15deg); }
          30% { transform: rotate(12deg); }
          50% { transform: rotate(-10deg); }
          70% { transform: rotate(6deg); }
          85% { transform: rotate(-3deg); }
          100% { transform: rotate(0deg); }
        }
        
        @keyframes ripple1 {
          0% { 
            opacity: 0; 
            transform: scale(1); 
          }
          20% { 
            opacity: 0.5; 
          }
          100% { 
            opacity: 0; 
            transform: scale(1.3); 
          }
        }
        
        @keyframes ripple2 {
          0% { 
            opacity: 0; 
            transform: scale(1); 
          }
          20% { 
            opacity: 0.4; 
          }
          100% { 
            opacity: 0; 
            transform: scale(1.4); 
          }
        }
        
        @keyframes ripple3 {
          0% { 
            opacity: 0; 
            transform: scale(1); 
          }
          20% { 
            opacity: 0.3; 
          }
          100% { 
            opacity: 0; 
            transform: scale(1.5); 
          }
        }
      `}</style>
    </div>
  )
}
