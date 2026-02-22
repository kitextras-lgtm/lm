import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Partnership } from '../components/Partnership';
import { MobileAppSection } from '../components/MobileAppSection';
import { FivePillars } from '../components/FivePillars';
import { FAQ } from '../components/FAQ';

export function HomePage() {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const currentDashboard = localStorage.getItem('currentDashboard');
    if (currentDashboard && window.location.pathname === '/') {
      setIsRedirecting(true);
      navigate(currentDashboard);
    }
  }, [navigate]);

  // Don't render anything if redirecting
  if (isRedirecting) {
    return null;
  }

  return (
    <div className="bg-black min-h-screen">
      <Header />
      <Hero />
      <Partnership showArtists={false} />
      <MobileAppSection />
      <FAQ />
      <FivePillars />
      
      {/* Footer */}
      <div className="py-8 md:py-10 border-t border-white/5">
        <p className="text-neutral-500 text-xs md:text-sm text-center tracking-wide">
          © 2025 Elevate. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
