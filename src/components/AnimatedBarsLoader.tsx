import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedBarsLoaderProps {
  text?: string;
  barCount?: number;
  className?: string;
}

export function AnimatedBarsLoader({ 
  text = 'Loading...', 
  barCount = 5,
  className = '' 
}: AnimatedBarsLoaderProps) {
  const { tokens } = useTheme();
  
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-end gap-1.5 mb-4">
        {Array.from({ length: barCount }).map((_, index) => (
          <div
            key={index}
            className="w-1.5 rounded-full animate-bar"
            style={{
              backgroundColor: tokens.text.primary,
              height: '32px',
              animationDelay: `${index * 0.05}s`,
            }}
          />
        ))}
      </div>
      {text && (
        <p className="text-sm" style={{ color: tokens.text.secondary }}>
          {text}
        </p>
      )}
    </div>
  );
}
