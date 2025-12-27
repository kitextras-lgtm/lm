import React from 'react';

export function PremiumLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="relative" style={{ width: '100px', height: '100px' }}>
        {/* Outer subtle glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: '100px',
            height: '100px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.06) 0%, transparent 70%)',
            animation: 'premium-pulse 2.5s ease-in-out infinite',
          }}
        />
        
        {/* Middle layer */}
        <div
          className="absolute rounded-full"
          style={{
            width: '70px',
            height: '70px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
            animation: 'premium-pulse 2.5s ease-in-out infinite 0.4s',
          }}
        />
        
        {/* Inner accent */}
        <div
          className="absolute rounded-full"
          style={{
            width: '40px',
            height: '40px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 60%)',
            animation: 'premium-pulse 2.5s ease-in-out infinite 0.8s',
          }}
        />
        
        {/* Center dot - subtle */}
        <div
          className="absolute rounded-full"
          style={{
            width: '3px',
            height: '3px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 0 6px rgba(255, 255, 255, 0.2)',
          }}
        />
      </div>
    </div>
  );
}
