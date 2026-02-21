import React from 'react';

interface DisplayIconProps {
  isHovered?: boolean;
}

export const DisplayIcon: React.FC<DisplayIconProps> = ({ isHovered: _isHovered }) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      {/* Sun - fades and shrinks on hover */}
      <g className="origin-center transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] group-hover:scale-0 group-hover:opacity-0">
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <g className="origin-center transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] group-hover:rotate-45">
          <line x1="24" y1="6" x2="24" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="24" y1="36" x2="24" y2="42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="24" x2="12" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="24" x2="42" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="11.3" y1="11.3" x2="15.5" y2="15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="32.5" y1="32.5" x2="36.7" y2="36.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="11.3" y1="36.7" x2="15.5" y2="32.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="32.5" y1="15.5" x2="36.7" y2="11.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>

      {/* Thick crescent moon */}
      <g className="origin-center translate-x-4 -translate-y-4 scale-0 opacity-0 transition-all duration-[800ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] group-hover:translate-x-0 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
        <path
          d="M30 12 A 14 14 0 1 0 30 36 A 10 10 0 1 1 30 12Z"
          fill="currentColor"
          fillOpacity="0.15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M28 16 A 10 10 0 1 0 28 32 A 7 7 0 1 1 28 16Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.5"
        />
        <circle cx="18" cy="22" r="2.5" fill="currentColor" fillOpacity="0.2" />
        <circle cx="15" cy="28" r="2" fill="currentColor" fillOpacity="0.15" />
        <circle cx="22" cy="30" r="1.5" fill="currentColor" fillOpacity="0.1" />
        <path d="M26 20 Q 25 24 26 28" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
      </g>

      {/* Stars */}
      <path d="M8 14L9 11L10 14L13 15L10 16L9 19L8 16L5 15Z" fill="currentColor" className="scale-0 opacity-0 transition-all duration-[600ms] delay-300 [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] group-hover:scale-100 group-hover:opacity-90" />
      <circle cx="40" cy="12" r="2.5" fill="currentColor" className="scale-0 opacity-0 transition-all duration-[600ms] delay-[400ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] group-hover:scale-100 group-hover:opacity-70" />
      <circle cx="42" cy="36" r="2" fill="currentColor" className="scale-0 opacity-0 transition-all duration-[600ms] delay-500ms [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] group-hover:scale-100 group-hover:opacity-60" />
      <circle cx="6" cy="34" r="1.5" fill="currentColor" className="scale-0 opacity-0 transition-all duration-[600ms] delay-550ms [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] group-hover:scale-100 group-hover:opacity-50" />
    </svg>
  );
};
