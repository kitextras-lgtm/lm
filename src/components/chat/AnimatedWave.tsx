import { memo, useEffect } from 'react';

export const AnimatedWave = memo(function AnimatedWave() {
  useEffect(() => {
    // Inject keyframes if not already present
    if (!document.getElementById('wave-hand-keyframes')) {
      const style = document.createElement('style');
      style.id = 'wave-hand-keyframes';
      style.textContent = `
        @keyframes wave-hand {
          0%, 100% {
            transform: rotate(0deg);
          }
          10%, 30% {
            transform: rotate(14deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          40%, 60% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(10deg);
          }
          70% {
            transform: rotate(0deg);
          }
          80% {
            transform: rotate(-5deg);
          }
          90% {
            transform: rotate(0deg);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <span 
      className="inline-block" 
      style={{ 
        display: 'inline-block',
        transformOrigin: '70% 70%',
        animation: 'wave-hand 1s ease-in-out infinite'
      }}
    >
      👋
    </span>
  );
});
