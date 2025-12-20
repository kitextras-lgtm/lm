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
        className={`py-10 md:py-24 lg:py-32 px-4 md:px-6 text-center transition-all duration-1000 ease-out ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-10">
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-normal leading-snug"
            style={{
              fontFamily: 'Fraunces, serif',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            It's Time to Elevate
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <button
              onClick={() => navigate('/contact')}
              className="group w-full sm:w-auto px-10 md:px-14 py-3.5 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(180deg, #ffffff 0%, #d0d0d0 100%)',
                color: '#000000',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
              }}
            >
              Start Here
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-10 md:px-14 py-3.5 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 hover:border-neutral-300 hover:text-neutral-300 hover:scale-105 active:scale-95"
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