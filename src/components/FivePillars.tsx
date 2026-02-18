import { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface Pillar {
  key: string;
  title: string;
  subtitle: string;
  height: number; // percentage height of the bar
}

const pillars: Pillar[] = [
  {
    key: 'seek',
    title: 'Seek',
    subtitle: 'Discover and learn. Actively pursue knowledge and opportunities.',
    height: 55,
  },
  {
    key: 'connect',
    title: 'Connect',
    subtitle: 'Build relationships and networks. Foster meaningful connections with others.',
    height: 75,
  },
  {
    key: 'strategize',
    title: 'Strategize',
    subtitle: 'Plan and execute. The most pivotal step. Develop clear pathways to achieve your goals.',
    height: 100,
  },
  {
    key: 'earn',
    title: 'Earn',
    subtitle: 'Gain results and rewards. Generate more revenue.',
    height: 70,
  },
  {
    key: 'elevate',
    title: 'Elevate',
    subtitle: 'Rise to new heights and set even better goals.',
    height: 45,
  },
];

export function FivePillars() {
  const [activeIndex, setActiveIndex] = useState(0); // Start with first pillar
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);

  const handleClick = () => {
    setActiveIndex((prev) => (prev + 1) % pillars.length);
  };

  const handleBarClick = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(index);
  };

  return (
    <section
      className="relative py-20 md:py-32 px-4 md:px-6 overflow-hidden cursor-pointer select-none"
      style={{ background: '#000000' }}
      onClick={handleClick}
    >
      <div
        ref={sectionRef}
        className={`max-w-5xl mx-auto relative z-10 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        {/* Header */}
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-normal mb-16 md:mb-24 text-center leading-snug"
          style={{
            fontFamily: 'Fraunces, serif',
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          The 5 Pillars of <span style={{ fontWeight: 600 }}>Success</span>
        </h2>

        {/* Bars Illustration — vertically centered like the logo */}
        <div className="flex items-center justify-center mb-12 md:mb-16" style={{ height: '320px', maxHeight: '45vh' }}>
          <div className="relative flex items-center justify-center" style={{ height: '100%', gap: '12px' }}>
            {pillars.map((pillar, index) => {
              const isActive = index === activeIndex;
              const barHeight = `${pillar.height}%`;

              return (
                <div
                  key={pillar.key}
                  className="relative transition-all duration-500 ease-out"
                  style={{
                    height: barHeight,
                    width: 'clamp(36px, 8vw, 64px)',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => handleBarClick(index, e)}
                >
                  {/* Glow effect behind the bar */}
                  <div
                    className="absolute inset-0 rounded-full transition-all duration-700 ease-in-out"
                    style={{
                      background: isActive
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'transparent',
                      filter: isActive ? 'blur(20px)' : 'blur(0px)',
                      transform: isActive ? 'scale(1.3)' : 'scale(1)',
                    }}
                  />

                  {/* The bar itself */}
                  <div
                    className="relative w-full h-full rounded-full transition-all duration-500 ease-in-out"
                    style={{
                      background: isActive
                        ? 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                      border: `1.5px solid ${isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: isActive
                        ? '0 0 30px rgba(255,255,255,0.12), 0 0 60px rgba(255,255,255,0.06), inset 0 0 30px rgba(255,255,255,0.05)'
                        : 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Pillar Info */}
        <div className="text-center transition-all duration-500 ease-in-out" style={{ minHeight: '100px' }}>
          <h3
            className="text-2xl md:text-3xl font-medium mb-3 transition-all duration-300"
            style={{
              fontFamily: 'Fraunces, serif',
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}
          >
            {pillars[activeIndex].title}
          </h3>
          <p
            className="text-base max-w-xl mx-auto transition-all duration-300"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: 'rgb(204, 204, 204)',
              fontWeight: 400,
              lineHeight: '1.6',
            }}
          >
            {pillars[activeIndex].subtitle}
          </p>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {pillars.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleBarClick(index, e)}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: index === activeIndex ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.15)',
                  transform: index === activeIndex ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
