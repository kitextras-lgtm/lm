import React from 'react';

interface LanguageIconProps {
  isHovered?: boolean;
}

export const LanguageIcon: React.FC<LanguageIconProps> = ({ isHovered }) => {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      <circle 
        cx="24" 
        cy="24" 
        r="16" 
        stroke="white" 
        strokeWidth="2.5" 
        fill="none"
        style={{ 
          opacity: isHovered ? 1 : 0.8,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
      <path 
        d="M24 8C24 8 16 16 16 24C16 32 24 40 24 40C24 40 32 32 32 24C32 16 24 8 24 8Z"
        stroke="white" 
        strokeWidth="2" 
        fill="none"
        style={{ 
          opacity: isHovered ? 1 : 0.7,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
      <line 
        x1="12" 
        y1="24" 
        x2="36" 
        y2="24" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round"
        style={{ 
          opacity: isHovered ? 1 : 0.6,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
      <path 
        d="M20 12C20 12 24 18 24 24C24 30 20 36 20 36"
        stroke="white" 
        strokeWidth="1.5" 
        fill="none"
        style={{ 
          opacity: isHovered ? 1 : 0.5,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
      <path 
        d="M28 12C28 12 24 18 24 24C24 30 28 36 28 36"
        stroke="white" 
        strokeWidth="1.5" 
        fill="none"
        style={{ 
          opacity: isHovered ? 1 : 0.5,
          transition: 'opacity 0.2s ease-in-out'
        }}
      />
    </svg>
  );
};
