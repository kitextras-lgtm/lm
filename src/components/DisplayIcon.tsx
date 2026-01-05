import React from 'react';

interface DisplayIconProps {
  isHovered?: boolean;
}

export const DisplayIcon: React.FC<DisplayIconProps> = ({ isHovered }) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      <rect 
        x="8" 
        y="10" 
        width="32" 
        height="24" 
        rx="2" 
        stroke="white" 
        strokeWidth="2.5" 
        fill="none"
        style={{ 
          opacity: isHovered ? 1 : 0.8,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
      <line 
        x1="16" 
        y1="38" 
        x2="32" 
        y2="38" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round"
        style={{ 
          opacity: isHovered ? 1 : 0.8,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
      <line 
        x1="20" 
        y1="42" 
        x2="28" 
        y2="42" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round"
        style={{ 
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
    </svg>
  );
};
