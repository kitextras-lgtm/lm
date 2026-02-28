import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isArtistPage, setIsArtistPage] = useState(false);
  const [isFreelancerPage, setIsFreelancerPage] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setIsArtistPage(location.pathname === '/learn/artist');
    setIsFreelancerPage(location.pathname === '/learn/freelancer');
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 w-full z-[9999] border-b border-white/5 backdrop-blur-xl transition-transform duration-300 ease-out"
      style={{
        WebkitFontSmoothing: 'antialiased',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        transform: visible ? 'translateY(0)' : 'translateY(-100%)',
      }}
    >
      <div className="h-16 md:h-20 px-6 md:px-8 flex items-center justify-between relative max-w-[1600px] mx-auto">
        <div className="flex items-center flex-shrink-0 z-10">
          <img
            src="/elevate_transparent_white_.png"
            alt="Elevate Logo"
            className="h-20 md:h-24 w-auto"
          />
        </div>

        <nav className="hidden md:flex items-center gap-10 absolute left-1/2 transform -translate-x-1/2">
          {[
            { label: 'Home', id: 'top' },
            { label: 'Benefits', id: 'partnership' },
            { label: 'Download', id: 'download' },
            { label: 'FAQ', id: 'about' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => {
                const el = document.getElementById(id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="text-white/60 hover:text-white text-[13px] font-medium tracking-wide cursor-pointer transition-all duration-300 ease-out relative group bg-transparent border-0 p-0"
            >
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white/80 group-hover:w-full transition-all duration-300"></span>
            </button>
          ))}
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
            onClick={() => navigate(isArtistPage ? '/signup?source=artist' : isFreelancerPage ? '/signup?source=freelancer' : '/signup')}
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