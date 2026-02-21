import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
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
    // Check if artist or freelancer type was passed from navigation state
    if (location.state?.userType === 'artist') {
      setUserType('artist');
      return;
    }
    if (location.state?.userType === 'freelancer') {
      setUserType('freelancer');
      return;
    }

    const fetchUserType = async () => {
      // First check localStorage for verifiedUserId (in case user just completed OTP)
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      
      // Try to get authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || verifiedUserId;
      
      if (userId) {
        const { data } = await supabase
          .from('users')
          .select('user_type')
          .eq('id', userId)
          .maybeSingle();

        if (data) {
          setUserType(data.user_type);
        }
      }
    };

    fetchUserType();
  }, [location.state]);

  // Load saved data from localStorage when coming back from next page
  useEffect(() => {
    const savedProfile = localStorage.getItem('tempProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.firstName) setFirstName(profile.firstName);
        if (profile.lastName) setLastName(profile.lastName);
        if (profile.username) setUsername(profile.username);
        if (profile.profilePicture) setPreviewUrl(profile.profilePicture);
        console.log('Restored profile data from localStorage:', profile);
      } catch (err) {
        console.error('Error loading saved profile:', err);
      }
    }
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
      // Get user ID from auth or localStorage
      const { data: { user } } = await supabase.auth.getUser();
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const verifiedEmail = localStorage.getItem('verifiedEmail');
      
      // Debug logging
      console.log('MakeProfile - Auth user:', user?.id);
      console.log('MakeProfile - Verified userId from localStorage:', verifiedUserId);
      console.log('MakeProfile - Verified email from localStorage:', verifiedEmail);
      
      const userId = user?.id || verifiedUserId;

      if (!userId) {
        // More helpful error message
        if (!verifiedEmail) {
          setError('Please complete sign-up first. Go back to sign up page.');
        } else {
          setError('User ID not found. Please try signing up again or contact support.');
        }
        setIsLoading(false);
        return;
      }

      // Convert profile picture to base64 to send via Edge Function
      // Edge Function will upload it using service role (bypasses RLS)
      let profilePictureBase64 = null;
      if (profilePicture) {
        try {
          console.log('🖼️ Converting profile picture to base64...');
          console.log('File:', profilePicture.name, 'Size:', profilePicture.size);
          
          // Convert file to base64
          const reader = new FileReader();
          profilePictureBase64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data:image/...;base64, prefix
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(profilePicture);
          });
          
          console.log('✅ Profile picture converted to base64');
        } catch (convertErr: any) {
          console.error('❌ Failed to convert image:', convertErr);
          setError(`Failed to process profile picture: ${convertErr.message}`);
          setIsLoading(false);
          return;
        }
      }

      // Save profile using Edge Function (bypasses RLS)
      // Edge Function will handle profile picture upload using service role
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-profile`;
      console.log('🔑 MakeProfile - Using userId:', userId);
      console.log('Saving profile with data:', {
        userId,
        firstName,
        lastName,
        username,
        userType,
        hasProfilePicture: !!profilePictureBase64
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          firstName,
          lastName,
          username,
          email: localStorage.getItem('verifiedEmail'),
          ...(userType && { userType }), // Only include userType if it's set
          profilePictureBase64,
          profilePictureFileName: profilePicture?.name || null,
        }),
      });

      console.log('📤 save-profile response status:', response.status);
      const data = await response.json();
      console.log('📤 save-profile response data:', data);

      if (!data.success) {
        console.error('❌ save-profile failed:', data.message);
        throw new Error(data.message || 'Failed to save profile');
      }
      
      console.log('✅ Profile saved successfully to database');

      // Also save to localStorage as backup
      const tempProfileData = {
        firstName,
        lastName,
        username,
        profilePicture: previewUrl, // Use preview URL for localStorage (blob URL)
        userType // Include userType for artist flow
      };
      console.log('💾 Saving to localStorage:', tempProfileData);
      localStorage.setItem('tempProfile', JSON.stringify(tempProfileData));
      console.log('💾 Saved to localStorage. Verifying:', localStorage.getItem('tempProfile'));

      // Check if this is an artist or freelancer flow
      if (userType === 'artist' || location.state?.userType === 'artist') {
        navigate('/tell-us-about-yourself', { state: { userType: 'artist' } });
      } else if (userType === 'freelancer' || location.state?.userType === 'freelancer') {
        navigate('/tell-us-about-yourself', { state: { userType: 'freelancer' } });
      } else {
        navigate('/tell-us-about-yourself');
      }
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
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
        onClick={() => {
          // Check if we came from artist page via URL parameter
          const urlParams = new URLSearchParams(window.location.search);
          const fromArtist = urlParams.get('source') === 'artist';
          
          // Clear stored credentials to prevent cross-account contamination
          localStorage.removeItem('verifiedUserId');
          localStorage.removeItem('verifiedEmail');
          localStorage.removeItem('tempProfile');
          
          // For artists, go back to artist page; for regular users, go back to signup
          navigate(fromArtist ? '/learn/artist' : '/signup');
        }}
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

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-3" style={{ color: '#F2F4F7' }}>
            Make your profile
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
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

            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-primary)' }}>
                What's your name?
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value.slice(0, MAX_NAME_LENGTH))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && firstName && username && !isLoading) {
                      handleContinue();
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && firstName && username && !isLoading) {
                      handleContinue();
                    }
                  }}
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
              <label className="block text-xs mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Choose a username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-primary)' }}>
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && firstName && username && !isLoading) {
                      handleContinue();
                    }
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
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
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
                color: firstName && username && !isLoading ? '#000000' : 'var(--text-primary)',
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
