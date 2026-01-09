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
        <line x1="5" y1="20" x2="12" y2="4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Right stroke of A */}
        <line x1="19" y1="20" x2="12" y2="4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Middle bar of A */}
        <line x1="7.5" y1="14" x2="16.5" y2="14" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Chinese character 文 (wén - meaning text/writing) - hidden by default, fades in on hover */}
      <g className="transition-all duration-500 ease-out opacity-0 group-hover:opacity-80">
        {/* Top horizontal stroke */}
        <line x1="4" y1="5" x2="20" y2="5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Vertical center stroke going down */}
        <line x1="12" y1="5" x2="12" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Left diagonal sweep (撇) */}
        <path d="M12 10 Q8 14 4 20" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Right diagonal sweep (捺) */}
        <path d="M12 10 Q16 14 20 20" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};
