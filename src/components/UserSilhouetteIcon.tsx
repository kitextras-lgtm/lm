export function UserSilhouetteIcon({ isHovered = false }: { isHovered?: boolean }) {
  return (
    <div className="flex items-center justify-center pointer-events-none">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5"
      >
        {/* Head */}
        <circle
          cx="24"
          cy="16"
          r="6"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          style={{
            animation: isHovered ? 'userHeadPulse 0.6s ease-in-out' : 'none'
          }}
        />
        {/* Body/shoulders */}
        <path
          d="M12 40C12 32 17 28 24 28C31 28 36 32 36 40"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          style={{
            animation: isHovered ? 'userBodyPulse 0.6s ease-in-out' : 'none'
          }}
        />

        {/* Scan line 1 */}
        <line
          x1="8"
          y1="8"
          x2="40"
          y2="8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            opacity: 0,
            animation: isHovered ? 'scanDown 0.8s ease-out' : 'none'
          }}
        />

        {/* Scan line 2 */}
        <line
          x1="8"
          y1="8"
          x2="40"
          y2="8"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            opacity: 0,
            animation: isHovered ? 'scanDown 0.8s ease-out 0.15s' : 'none'
          }}
        />

        {/* Glow ring */}
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="white"
          strokeWidth="1.5"
          fill="none"
          style={{
            opacity: 0,
            animation: isHovered ? 'userGlow 0.6s ease-in-out' : 'none'
          }}
        />
        
        {/* Detection points - left */}
        <circle
          cx="18"
          cy="16"
          r="2"
          fill="white"
          style={{
            opacity: 0,
            animation: isHovered ? 'pointPulse 0.6s ease-in-out 0.2s' : 'none'
          }}
        />
        
        {/* Detection points - right */}
        <circle
          cx="30"
          cy="16"
          r="2"
          fill="white"
          style={{
            opacity: 0,
            animation: isHovered ? 'pointPulse 0.6s ease-in-out 0.3s' : 'none'
          }}
        />
      </svg>
      
      <style>{`
        @keyframes userHeadPulse {
          0% { 
            transform: scale(1); 
            opacity: 1;
          }
          50% { 
            transform: scale(1.15); 
            opacity: 1;
          }
          100% { 
            transform: scale(1); 
            opacity: 1;
          }
        }
        
        @keyframes userBodyPulse {
          0% { 
            transform: scale(1); 
            opacity: 1;
          }
          50% { 
            transform: scale(1.08); 
            opacity: 1;
          }
          100% { 
            transform: scale(1); 
            opacity: 1;
          }
        }
        
        @keyframes scanDown {
          0% { 
            opacity: 0; 
            transform: translateY(0); 
          }
          20% { 
            opacity: 0.8; 
          }
          80% {
            opacity: 0.6;
          }
          100% { 
            opacity: 0; 
            transform: translateY(32px); 
          }
        }
        
        @keyframes userGlow {
          0% { 
            opacity: 0; 
            transform: scale(0.8); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.05); 
          }
          100% { 
            opacity: 0; 
            transform: scale(1.1); 
          }
        }
        
        @keyframes pointPulse {
          0% { 
            opacity: 0; 
            transform: scale(0); 
          }
          30% { 
            opacity: 0.9; 
            transform: scale(1.5); 
          }
          60% {
            opacity: 0.6;
            transform: scale(1.2);
          }
          100% { 
            opacity: 0; 
            transform: scale(0.8); 
          }
        }
      `}</style>
    </div>
  )
}
