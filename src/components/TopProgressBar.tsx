import React, { useEffect, useState } from 'react';

interface TopProgressBarProps {
  isLoading?: boolean;
}

export function TopProgressBar({ isLoading = true }: TopProgressBarProps) {
  const [shouldShow, setShouldShow] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldShow(true);
    } else {
      // Fade out smoothly
      const timer = setTimeout(() => {
        setShouldShow(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldShow) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 pointer-events-none"
      style={{
        height: '3px',
        zIndex: 100000,
      }}
    >
      <div
        className="progress-bar-indicator"
        style={{
          height: '100%',
          width: '40%',
          background: 'linear-gradient(to right, transparent, #E8E8E8 50%, transparent)',
          opacity: 0.8,
        }}
      />
    </div>
  );
}
