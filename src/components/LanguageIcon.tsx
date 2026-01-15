import React from 'react';

interface LanguageIconProps {
  isHovered?: boolean;
}

export const LanguageIcon: React.FC<LanguageIconProps> = ({ isHovered }) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      {/* Letter A - visible by default, fades out on hover */}
      <g className="transition-all duration-500 ease-out opacity-80 group-hover:opacity-0">
        {/* Left stroke of A */}
        <line x1="6" y1="18" x2="12" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Right stroke of A */}
        <line x1="18" y1="18" x2="12" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Middle bar of A */}
        <line x1="8" y1="13" x2="16" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Chinese character 文 (wén - meaning text/writing) - hidden by default, fades in on hover */}
      <g className="transition-all duration-500 ease-out opacity-0 group-hover:opacity-80">
        {/* Top horizontal stroke */}
        <line x1="5" y1="6" x2="19" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Vertical center stroke going down */}
        <line x1="12" y1="6" x2="12" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Left diagonal sweep (撇) */}
        <path d="M12 10 Q9 13 6 18" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right diagonal sweep (捺) */}
        <path d="M12 10 Q15 13 18 18" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};
