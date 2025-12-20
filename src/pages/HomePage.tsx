import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Partnership } from '../components/Partnership';
import { FAQ } from '../components/FAQ';
import { CallToAction } from '../components/CallToAction';

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const currentDashboard = localStorage.getItem('currentDashboard');
    if (currentDashboard && window.location.pathname === '/') {
      navigate(currentDashboard);
    }
  }, [navigate]);

  return (
    <div
      className="bg-black min-h-screen"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
      <Header />
      <Hero />
      <Partnership />
      <FAQ />
      <CallToAction />
    </div>
  );
}
