import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function CallToAction() {
  const navigate = useNavigate();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  return (
    <section className="bg-black">
      <div
        ref={ctaRef}
        className={`py-10 md:py-24 lg:py-32 px-4 md:px-6 lg:px-8 xl:px-12 transition-all duration-1000 ease-out ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-normal leading-tight mb-6 md:mb-8"
            style={{
              fontFamily: 'Fraunces, serif',
              letterSpacing: '-0.02em'
            }}
          >
            <span style={{ color: '#ffffff' }}>Elevating the Next</span>
            <br />
            <span style={{ color: '#d4d4d4' }}>Generation of Talent</span>
          </h2>

          <p
            className="text-lg md:text-xl lg:text-2xl text-neutral-300 max-w-2xl mx-auto mb-8 md:mb-10"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: 300,
              letterSpacing: '0.01em',
              lineHeight: '1.6'
            }}
          >
            Everything you need to scale and grow, right at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto px-10 md:px-14 py-3.5 md:py-4 rounded-lg text-base md:text-lg font-semibold transition-all duration-200"
              style={{
                background: '#E8E8E8',
                color: '#000000'
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
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-10 md:px-14 py-3.5 md:py-4 rounded-lg text-base md:text-lg font-semibold transition-all duration-200 hover:border-neutral-300 hover:text-neutral-300"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      <div className="py-8 md:py-10 border-t border-white/5">
        <p className="text-neutral-500 text-xs md:text-sm text-center tracking-wide">
          © 2025 Elevate. All Rights Reserved.
        </p>
      </div>
    </section>
  );
}