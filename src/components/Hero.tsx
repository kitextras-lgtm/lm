import React, { useState, useEffect, lazy, Suspense, memo } from 'react';
import { useNavigate } from 'react-router-dom';

const SplineViewer = memo(() => {
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    // Set loaded immediately since script is preloaded
    setSplineLoaded(true);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {isMobile ? (
        <spline-viewer
          key="mobile-spline"
          url="https://prod.spline.design/j6Vui4oX3PbVT0Bv/scene.splinecode"
          loading="eager"
          style={{
            position: 'absolute',
            top: '72%',
            left: '54%',
            width: '100vw',
            height: '100vh',
            zIndex: 1,
            transform: 'translate(-50%, -50%)',
            transformOrigin: 'center center',
            opacity: splineLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            pointerEvents: 'none',
            backgroundColor: '#000000'
          }}
        />
      ) : (
        <spline-viewer
          key="desktop-spline"
          url="https://prod.spline.design/LrLPFXR2ZuBzIAV8/scene.splinecode"
          loading="eager"
          style={{
            position: 'absolute',
            top: 0,
            left: '42%',
            width: '50vw',
            height: '100vh',
            zIndex: 1,
            transform: 'scaleX(-1)',
            transformOrigin: 'center center',
            opacity: splineLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            pointerEvents: 'none',
            backgroundColor: '#000000'
          }}
        />
      )}
    </>
  );
});

SplineViewer.displayName = 'SplineViewer';

export const Hero = memo(() => {
  const navigate = useNavigate();
  const words = ['Presence', 'Marketing', 'Management', 'Distribution', 'Solutions', 'Development', 'Revenue'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center relative isolate">
      <style>
        {`
          spline-viewer canvas {
            background-color: #000000 !important;
          }
        `}
      </style>
      <Suspense fallback={null}>
        <SplineViewer />
      </Suspense>

      <div className="relative z-10 px-6 max-w-6xl mx-auto -mt-80 md:mt-12 pointer-events-none hero-content md:mr-auto md:ml-32 lg:ml-40 xl:ml-48">
        <div className="relative md:text-left">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-transparent blur-3xl -z-10"></div>

            <h1
              className="hero-heading text-6xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-center md:text-left"
              style={{
                fontFamily: '"Fraunces", serif',
                fontWeight: 400,
                lineHeight: '1.05',
                letterSpacing: '-0.02em',
                willChange: 'transform, opacity',
                margin: 0,
                padding: 0,
                marginBottom: '2rem'
              }}
            >
            <span
              style={{
                display: 'inline-block',
                filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))'
              }}
            >
              <span
                style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #d0d0d0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block'
                }}
              >
                Elevate Your
              </span>
            </span>
            <br />
            <span
              key={currentWordIndex}
              className="inline-block animate-word-scroll pb-2"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #d0d0d0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block'
              }}
            >
              {words[currentWordIndex]}
            </span>
          </h1>

          <p className="text-base md:text-xl lg:text-2xl text-gray-400 leading-relaxed max-w-sm sm:max-w-md md:max-w-3xl mx-auto md:mx-0 font-light drop-shadow-lg text-center md:text-left" style={{ willChange: 'transform, opacity', marginBottom: '3rem', lineHeight: '1.8' }}>
            Elevate is a curated 360° multimedia network and agency built<br />
            to drive growth for talents and brands.
          </p>

          <div className="flex justify-center md:justify-start">
            <button
              onClick={() => navigate('/signup')}
              className="text-black px-10 py-3.5 md:px-14 md:py-5 rounded-lg text-base md:text-lg font-semibold transition-all duration-200 pointer-events-auto"
              style={{
                background: '#E8E8E8'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#D8D8D8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#E8E8E8';
              }}
            >
              Start Here
            </button>
          </div>
        </div>
      </div>

    </main>
  );
});

Hero.displayName = 'Hero';