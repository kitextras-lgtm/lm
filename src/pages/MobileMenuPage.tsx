import React from 'react';
import { useNavigate } from 'react-router-dom';

export function MobileMenuPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-black min-h-screen">
      <header className="sticky top-0 w-full z-[9999] border-b border-white/5 backdrop-blur-xl" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center flex-shrink-0">
            <img
              src="/elevate text logo v2.png"
              alt="Elevate Logo"
              className="h-20 w-auto"
            />
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center"
            aria-label="Close Menu"
          >
            <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </header>

      <nav className="flex flex-col px-6 py-8">
        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={() => navigate('/login')}
            className="w-full px-5 py-4 text-[13px] font-medium tracking-wide text-white/90 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg transition-all duration-200 animate-domino-drop"
            style={{ animationDelay: '0ms' }}
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="w-full px-5 py-4 text-[13px] font-medium tracking-wide text-black rounded-lg transition-all duration-200 animate-domino-drop"
            style={{
              background: '#E8E8E8',
              animationDelay: '80ms'
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

        <div className="flex flex-col space-y-1 pt-6 border-t border-white/[0.08]">
          <a
            href="/#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="text-white/70 hover:text-white text-[13px] font-medium tracking-wide py-4 px-4 rounded-lg hover:bg-white/[0.05] transition-all duration-200 animate-domino-drop"
            style={{ animationDelay: '160ms' }}
          >
            Home
          </a>
          <a
            href="/#partnership"
            onClick={(e) => {
              e.preventDefault();
              navigate('/#partnership');
            }}
            className="text-white/70 hover:text-white text-[13px] font-medium tracking-wide py-4 px-4 rounded-lg hover:bg-white/[0.05] transition-all duration-200 animate-domino-drop"
            style={{ animationDelay: '240ms' }}
          >
            Benefits
          </a>
          <a
            href="/#about"
            onClick={(e) => {
              e.preventDefault();
              navigate('/#about');
            }}
            className="text-white/70 hover:text-white text-[13px] font-medium tracking-wide py-4 px-4 rounded-lg hover:bg-white/[0.05] transition-all duration-200 animate-domino-drop"
            style={{ animationDelay: '320ms' }}
          >
            About Us
          </a>
        </div>
      </nav>
    </div>
  );
}
