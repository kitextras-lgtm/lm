import React from 'react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();

  return (
    <header
      className="sticky top-0 w-full z-[9999] border-b border-white/5 backdrop-blur-xl"
      style={{
        WebkitFontSmoothing: 'antialiased',
        position: 'sticky',
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
      }}
    >
      <div className="h-16 md:h-20 px-6 md:px-8 flex items-center justify-between relative max-w-[1600px] mx-auto">
        <div className="flex items-center flex-shrink-0 z-10">
          <img
            src="/elevate text logo v2.png"
            alt="Elevate Logo"
            className="h-20 md:h-24 w-auto"
          />
        </div>

        <nav className="hidden md:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
          <a
            href="#top"
            className="text-white/60 hover:text-white text-[13px] font-medium tracking-wide cursor-pointer transition-all duration-300 ease-out relative group"
          >
            Home
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/80 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#partnership"
            className="text-white/60 hover:text-white text-[13px] font-medium tracking-wide cursor-pointer transition-all duration-300 ease-out relative group"
          >
            Benefits
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/80 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#about"
            className="text-white/60 hover:text-white text-[13px] font-medium tracking-wide cursor-pointer transition-all duration-300 ease-out relative group"
          >
            FAQ
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/80 group-hover:w-full transition-all duration-300"></span>
          </a>
        </nav>

        <div className="hidden md:flex items-center gap-2 z-10">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 text-[13px] font-medium bg-transparent border border-white/10 rounded-lg cursor-pointer transition-all duration-300 ease-out"
            style={{ color: '#FFFFFF' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C9CBD1';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-5 py-2 text-[13px] font-semibold text-black cursor-pointer transition-all duration-200 rounded-lg"
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
            Sign Up
          </button>
        </div>

        <button
          onClick={() => navigate('/menu')}
          className="md:hidden flex items-center justify-center z-10"
          aria-label="Menu"
        >
          <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
}