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
    <div
      className="bg-black min-h-screen"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
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
