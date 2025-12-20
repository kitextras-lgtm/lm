import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        url?: string;
        'mouse-controls'?: string;
      };
    }
  }
}

const MAX_NAME_LENGTH = 15;
const MAX_USERNAME_LENGTH = 20;

export function MakeProfilePage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplineLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchUserType = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setUserType(data.user_type);
        }
      }
    };

    fetchUserType();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleContinue = async () => {
    if (!firstName || !username) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      localStorage.setItem('tempProfile', JSON.stringify({
        firstName,
        lastName,
        username,
        profilePicture: previewUrl
      }));

      navigate('/tell-us-about-yourself');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || 'Your name';
  const displayUsername = username ? `@${username}` : '@username';

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-8 sm:py-12 px-6"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
      <button
        onClick={() => navigate('/')}
        className="fixed top-6 left-6 z-50 flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-xs font-medium">Home</span>
      </button>

      {!isMobile && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ease-out overflow-hidden"
          style={{
            opacity: splineLoaded ? 1 : 0,
            transform: 'translateX(30%) scale(1.035)'
          }}
        >
          <spline-viewer
            url="https://prod.spline.design/hxB6DGH8u6Rcpq21/scene.splinecode"
            mouse-controls="false"
            className="spline-viewer-no-watermark"
          ></spline-viewer>
        </div>
      )}

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-3" style={{ color: '#F2F4F7' }}>
            Make your profile
          </h1>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Create your unique identity on Elevate
          </p>
        </div>

        <div
          className="w-full p-6 relative overflow-hidden"
          style={{
            background: 'rgba(10, 10, 15, 0.65)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
          }}
        >
          <div className="space-y-4 relative z-10">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-white/10">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {profilePicture && (
              <p className="text-sm text-center" style={{ color: '#9CA3AF' }}>
                {profilePicture.name}
              </p>
            )}

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
                What's your name?
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                  maxLength={MAX_NAME_LENGTH}
                  className="flex-1 min-w-0 h-11 px-4 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    color: '#F2F4F7',
                    background: 'transparent',
                    border: '1px solid rgba(75, 85, 99, 1)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                  maxLength={MAX_NAME_LENGTH}
                  className="flex-1 min-w-0 h-11 px-4 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    color: '#F2F4F7',
                    background: 'transparent',
                    border: '1px solid rgba(75, 85, 99, 1)',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
                Choose a username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#9CA3AF' }}>
                  @
                </span>
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => {
                    const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setUsername(sanitized.slice(0, MAX_USERNAME_LENGTH));
                  }}
                  maxLength={MAX_USERNAME_LENGTH}
                  className="w-full h-11 pl-10 pr-4 rounded-lg text-sm focus:outline-none transition-all"
                  style={{
                    color: '#F2F4F7',
                    background: 'transparent',
                    border: '1px solid rgba(75, 85, 99, 1)',
                  }}
                />
              </div>
            </div>

            {firstName && username && (
              <div className="pt-2 text-center">
                <h3 className="text-xl font-semibold mb-1" style={{ color: '#F2F4F7' }}>
                  {displayName}
                </h3>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {displayUsername}
                </p>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-xs text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!firstName || !username || isLoading}
              className={`
                w-full h-11 rounded-lg font-semibold transition-all duration-300
                ${firstName && username && !isLoading
                  ? 'hover:opacity-95'
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
              style={{
                background: firstName && username && !isLoading ? '#E8E8E8' : 'rgba(75, 85, 99, 1)',
                color: firstName && username && !isLoading ? '#000000' : '#9CA3AF',
              }}
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
