import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DoorTransition } from '../components/DoorTransition';

export function BusinessDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('currentDashboard', '/dashboard/business');
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('currentDashboard');
    localStorage.removeItem('selectedUserType');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <DoorTransition showTransition={location.state?.fromOnboarding === true} />
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
                Business Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, Business!</h2>
          <p className="text-gray-400">Manage campaigns, track ROI, and connect with creators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-[#6366f1] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Campaigns</h3>
              <svg className="w-6 h-6 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm mb-4">Create and manage campaigns</p>
            <button className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 text-white py-2 rounded-lg transition-all duration-300">
              Manage Campaigns
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-[#6366f1] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Analytics</h3>
              <svg className="w-6 h-6 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm mb-4">Track campaign performance</p>
            <button className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 text-white py-2 rounded-lg transition-all duration-300">
              View Analytics
            </button>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 hover:border-[#6366f1] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Partnerships</h3>
              <svg className="w-6 h-6 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm mb-4">Connect with creators and artists</p>
            <button className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:opacity-90 text-white py-2 rounded-lg transition-all duration-300">
              Find Partners
            </button>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-4">Business Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Campaigns</p>
              <p className="text-3xl font-bold text-[#6366f1]">0</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Reach</p>
              <p className="text-3xl font-bold text-[#8b5cf6]">0</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Partnerships</p>
              <p className="text-3xl font-bold text-[#6366f1]">0</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
