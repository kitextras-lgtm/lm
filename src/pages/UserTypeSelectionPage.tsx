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

export function UserTypeSelectionPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [splineLoaded, setSplineLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const navigate = useNavigate();

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

  // Check if this is an artist signup flow and skip directly to make-profile
  useEffect(() => {
    const signupSource = localStorage.getItem('signupSource');
    if (signupSource === 'artist') {
      // Clear the flag and navigate directly to make-profile with artist type
      localStorage.removeItem('signupSource');
      navigate('/make-profile', { state: { userType: 'artist' } });
    }
  }, [navigate]);

  const userTypes = [
    {
      id: 'creator',
      title: 'Creator',
      description: 'Content Creators, Youtubers, Influencers'
    },
    {
      id: 'business',
      title: 'Brand',
      description: 'Companies and Businesses'
    }
  ];

  const renderIcon = (typeId: string) => {
    switch (typeId) {
      case 'artist':
        return (
          <div className="music-icon group w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path d="M12 28C12 20.268 18.268 14 26 14H22C29.732 14 36 20.268 36 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <rect x="8" y="26" width="8" height="12" rx="2" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="32" y="26" width="8" height="12" rx="2" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="10" y="28" width="4" height="8" rx="1" fill="white" opacity="0.3"/>
              <rect x="34" y="28" width="4" height="8" rx="1" fill="white" opacity="0.3"/>
            </svg>
            <div className="note note-1">
              <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                <path d="M2 12V3L9 1V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="2" cy="12" r="2" fill="white"/>
              </svg>
            </div>
            <div className="note note-2">
              <svg width="8" height="12" viewBox="0 0 10 14" fill="none">
                <path d="M2 12V3L9 1V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="2" cy="12" r="2" fill="white"/>
              </svg>
            </div>
            <div className="note note-3">
              <svg width="6" height="10" viewBox="0 0 10 14" fill="none">
                <path d="M2 12V3L9 1V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="2" cy="12" r="2" fill="white"/>
              </svg>
            </div>
          </div>
        );
      case 'creator':
        return (
          <div className="creators-icon group w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect x="14" y="6" width="20" height="36" rx="3" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="20" y="9" width="8" height="2" rx="1" fill="white" opacity="0.4"/>
              <rect x="21" y="38" width="6" height="2" rx="1" fill="white" opacity="0.4"/>
              <g className="app app-1">
                <rect x="16" y="14" width="10" height="8" rx="2" fill="white" opacity="0.2"/>
                <path d="M20 16L23 18L20 20V16Z" fill="white" opacity="0.8"/>
              </g>
              <g className="app app-2">
                <rect x="26" y="14" width="8" height="8" rx="2" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                <circle cx="30" cy="18" r="2" stroke="white" strokeWidth="1" fill="none" opacity="0.8"/>
                <circle cx="32.5" cy="15.5" r="0.8" fill="white" opacity="0.6"/>
              </g>
              <g className="app app-3">
                <rect x="16" y="26" width="10" height="8" rx="2" fill="white" opacity="0.2"/>
                <path d="M19 32V28L23 27V31" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8"/>
                <circle cx="19" cy="32" r="1.2" fill="white" opacity="0.8"/>
              </g>
              <g className="app app-4">
                <rect x="26" y="26" width="8" height="8" rx="2" fill="white" opacity="0.2"/>
                <rect x="27.5" y="27.5" width="2" height="2" rx="0.5" fill="white" opacity="0.8"/>
                <rect x="30.5" y="27.5" width="2" height="2" rx="0.5" fill="white" opacity="0.8"/>
                <rect x="27.5" y="30.5" width="2" height="2" rx="0.5" fill="white" opacity="0.8"/>
                <rect x="30.5" y="30.5" width="2" height="2" rx="0.5" fill="white" opacity="0.8"/>
              </g>
            </svg>
          </div>
        );
      case 'business':
        return (
          <div className="businesses-icon group w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect x="6" y="18" width="36" height="22" rx="3" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M18 18V14C18 12.8954 18.8954 12 20 12H28C29.1046 12 30 12.8954 30 14V18" stroke="white" strokeWidth="2" fill="none"/>
              <rect className="lid" x="6" y="18" width="36" height="8" rx="3" stroke="white" strokeWidth="2" fill="black"/>
              <rect className="clasp" x="21" y="24" width="6" height="4" rx="1" fill="white"/>
              <g className="documents">
                <rect x="12" y="22" width="10" height="14" rx="1" fill="white" opacity="0.2"/>
                <line x1="14" y1="25" x2="20" y2="25" stroke="white" strokeWidth="1" opacity="0.6"/>
                <line x1="14" y1="28" x2="18" y2="28" stroke="white" strokeWidth="1" opacity="0.6"/>
                <line x1="14" y1="31" x2="20" y2="31" stroke="white" strokeWidth="1" opacity="0.6"/>
                <rect x="26" y="22" width="10" height="14" rx="1" fill="white" opacity="0.2"/>
                <path d="M28 33L31 28L33 30L36 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
              </g>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleContinue = async () => {
    if (!selectedType) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get userId from auth or from localStorage (if verified but not signed in yet)
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const verifiedEmail = localStorage.getItem('verifiedEmail');
      const userId = user?.id || verifiedUserId;

      console.log('UserTypeSelection - Auth check:', {
        hasAuthUser: !!user,
        authUserId: user?.id,
        verifiedUserId: verifiedUserId ? verifiedUserId.substring(0, 8) + '...' : null,
        verifiedEmail: verifiedEmail ? verifiedEmail.substring(0, 10) + '...' : null,
        finalUserId: userId ? userId.substring(0, 8) + '...' : null
      });

      if (userId) {
        console.log('✅ UserTypeSelection - Saving profile with userId:', userId.substring(0, 8) + '...');
        const tempProfile = localStorage.getItem('tempProfile');
        const profileData = tempProfile ? JSON.parse(tempProfile) : {};

        // Save profile using Edge Function (bypasses RLS)
        // Don't send blob URLs - they're temporary and the image should already be in storage
        // The profile picture should have been uploaded during MakeProfilePage
        const profilePictureUrl = profileData.profilePicture && !profileData.profilePicture.startsWith('blob:')
          ? profileData.profilePicture
          : null;
        
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-profile`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            userType: selectedType,
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            username: profileData.username || '',
            profilePictureUrl: profilePictureUrl, // Only send if it's a valid storage URL
            location: profileData.location || '',
            primaryLanguage: profileData.primaryLanguage || '',
          }),
        });

        const data = await response.json();

        if (!data.success) {
          console.error('Error saving to database:', data.message);
          setError(data.message || 'Failed to save profile');
          setIsLoading(false);
          return;
        } else {
          // Keep verifiedUserId - needed for dashboard access
          // Only remove tempProfile data
          localStorage.removeItem('tempProfile');
          console.log('✅ Profile saved successfully, keeping verifiedUserId for dashboard access');
        }
      } else {
        // No user ID available - store selection for later
        localStorage.setItem('selectedUserType', selectedType);
        setError('Please complete sign-up first');
        return;
      }

      switch (selectedType) {
        case 'artist':
          navigate('/dashboard/artist', { state: { fromOnboarding: true } });
          break;
        case 'creator':
          navigate('/dashboard/creator', { state: { fromOnboarding: true } });
          break;
        case 'business':
          navigate('/dashboard/business', { state: { fromOnboarding: true } });
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      console.error('Error in user type selection:', err);
      localStorage.setItem('selectedUserType', selectedType);

      switch (selectedType) {
        case 'artist':
          navigate('/dashboard/artist', { state: { fromOnboarding: true } });
          break;
        case 'creator':
          navigate('/dashboard/creator', { state: { fromOnboarding: true } });
          break;
        case 'business':
          navigate('/dashboard/business', { state: { fromOnboarding: true } });
          break;
        default:
          navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden py-8 sm:py-12 px-6"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
      <button
        onClick={() => navigate('/tell-us-about-yourself')}
        className="fixed top-6 left-6 z-50 flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-xs font-medium">Back</span>
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

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-3" style={{ color: '#F2F4F7' }}>
            What are you?
          </h1>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            Select the option that best describes you
          </p>
        </div>

        <div className="w-full space-y-3 mb-6">
          {userTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSelect(type.id)}
              className={`relative w-full p-5 rounded-lg transition-all duration-300 flex items-center gap-4 hover:scale-[1.01] ${type.id}-button`}
              style={selectedType === type.id ? {
                background: 'rgba(10, 10, 15, 0.65)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 1)',
                boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
              } : {
                background: 'rgba(10, 10, 15, 0.4)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(75, 85, 99, 1)',
              }}
            >
              {renderIcon(type.id)}
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold mb-1" style={{ color: '#F2F4F7' }}>
                  {type.title}
                </h3>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {type.description}
                </p>
              </div>

              {selectedType === type.id && (
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#E8E8E8' }}>
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 text-center text-red-500 text-xs">
            {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selectedType || isLoading}
          className={`
            w-full h-11 rounded-lg font-semibold transition-all duration-300
            ${selectedType && !isLoading
              ? 'hover:opacity-95'
              : 'opacity-50 cursor-not-allowed'
            }
          `}
          style={{
            background: selectedType && !isLoading ? '#E8E8E8' : 'rgba(75, 85, 99, 1)',
            color: selectedType && !isLoading ? '#000000' : '#9CA3AF',
          }}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
