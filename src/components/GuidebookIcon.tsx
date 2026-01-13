interface AnimatedIconProps {
  isHovered?: boolean;
}

export function GuidebookIcon({ isHovered }: AnimatedIconProps) {
  return (
    <div className="relative w-6 h-6 flex items-center justify-center" style={{ perspective: '400px' }}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
        {/* Left page */}
        <path
          d="M12 14C12 12 14 10 24 10C34 10 36 12 36 14V32C36 34 34 36 24 36C14 36 12 34 12 32V14Z"
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
        
        {/* Center spine */}
        <line
          x1="24"
          y1="10"
          x2="24"
          y2="36"
          stroke="white"
          strokeWidth="2"
        />
        
        {/* Left page content lines */}
        <g opacity="0.4">
          <line x1="16" y1="16" x2="22" y2="16" stroke="white" strokeWidth="1" />
          <line x1="16" y1="20" x2="22" y2="20" stroke="white" strokeWidth="1" />
          <line x1="16" y1="24" x2="20" y2="24" stroke="white" strokeWidth="1" />
        </g>
        
        {/* Right page content lines - removed */}
        
        {/* Static right page (gets covered by flip) */}
        <path
          d="M24 10C24 10 24 10 24 10C34 10 36 12 36 14V32C36 34 34 36 24 36C24 36 24 36 24 36V10Z"
          stroke="white"
          strokeWidth="2"
          fill="white"
          fillOpacity="0.02"
          className="transition-all duration-700 ease-in-out opacity-0 group-hover:opacity-100"
          style={{
            transformOrigin: 'left center',
            transform: 'rotateY(0deg)'
          }}
        />
        <style>{`
          .group:hover .right-page {
            transform: rotateY(-170deg);
            opacity: 0;
          }
        `}</style>
        <path
          d="M24 10C24 10 24 10 24 10C34 10 36 12 36 14V32C36 34 34 36 24 36C24 36 24 36 24 36V10Z"
          stroke="white"
          strokeWidth="2"
          fill="white"
          fillOpacity="0.02"
          className="right-page transition-all duration-700 ease-in-out"
          style={{
            transformOrigin: 'left center'
          }}
        />
        
        {/* Flipping page - dramatic effect */}
        <g 
          className="transition-all duration-700 ease-in-out"
          style={{
            transform: 'rotateY(90deg)',
            transformOrigin: 'left center',
            opacity: 0
          }}
        >
          <style>{`
            .group:hover .page-flip {
              transform: rotateY(-90deg);
              opacity: 1;
            }
          `}</style>
          <g className="page-flip transition-all duration-700 ease-in-out" style={{ transformOrigin: 'left center' }}>
            {/* Page shadow for depth */}
            <path
              d="M24.5 10.5C24.5 10.5 26.5 11.5 28.5 12.5C30.5 13.5 32.5 14.5 34.5 16.5C36.5 18.5 36.5 20.5 36.5 22.5C36.5 24.5 36.5 26.5 34.5 28.5C32.5 30.5 30.5 31.5 28.5 32.5C26.5 33.5 24.5 34.5 24.5 34.5"
              stroke="black"
              strokeWidth="4"
              fill="none"
              opacity="0.3"
            />
            
            {/* Main flipping page */}
            <path
              d="M24 10C24 10 26 11 28 12C30 13 32 14 34 16C36 18 36 20 36 22C36 24 36 26 34 28C32 30 30 31 28 32C26 33 24 34 24 34"
              stroke="white"
              strokeWidth="2"
              fill="white"
              fillOpacity="0.1"
            />
            
            {/* Page content lines on flipping page */}
            <g opacity="0.3">
              <line x1="27" y1="16" x2="33" y2="16" stroke="white" strokeWidth="1" />
              <line x1="27" y1="20" x2="33" y2="20" stroke="white" strokeWidth="1" />
              <line x1="27" y1="24" x2="31" y2="24" stroke="white" strokeWidth="1" />
              <line x1="27" y1="28" x2="32" y2="28" stroke="white" strokeWidth="1" />
            </g>
            
            {/* Page curl effect */}
            <path
              d="M34 16C35 17 35 19 35 22C35 25 35 27 34 28"
              stroke="white"
              strokeWidth="1"
              fill="none"
              opacity="0.5"
            />
          </g>
        </g>
        
        {/* Next page revealed (behind the flipping page) */}
        <g 
          opacity="0"
          className="transition-all duration-700 ease-in-out group-hover:opacity-100"
          style={{
            transform: 'translateX(-2px)'
          }}
        >
          <path
            d="M24 10C24 10 25.5 10.5 27 11.5C28.5 12.5 30 13.5 31.5 15.5C33 17.5 33 19.5 33 22C33 24.5 33 26.5 31.5 28.5C30 30.5 28.5 31.5 27 32.5C25.5 33.5 24 34 24 34"
            stroke="white"
            strokeWidth="2"
            fill="white"
            fillOpacity="0.05"
          />
          <g opacity="0.2">
            <line x1="26" y1="16" x2="30" y2="16" stroke="white" strokeWidth="1" />
            <line x1="26" y1="20" x2="30" y2="20" stroke="white" strokeWidth="1" />
            <line x1="26" y1="24" x2="29" y2="24" stroke="white" strokeWidth="1" />
            <line x1="26" y1="28" x2="29" y2="28" stroke="white" strokeWidth="1" />
          </g>
        </g>
        
        {/* Page flip hint (small triangle) */}
        <path
          d="M34 16L36 14L36 18Z"
          fill="white"
          fillOpacity="0.3"
          className="transition-all duration-300 ease-in-out group-hover:opacity-0"
        />
      </svg>
    </div>
  );
}
