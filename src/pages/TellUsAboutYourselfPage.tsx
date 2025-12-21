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

const COUNTRIES = [
  'United States of America',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Japan',
  'South Korea',
  'Brazil',
  'Mexico',
  'India',
  'China',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Switzerland',
  'Austria',
  'Belgium',
  'Portugal',
  'Poland',
  'Greece',
  'Ireland',
  'New Zealand',
  'Singapore',
  'South Africa',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  'Thailand',
  'Vietnam',
  'Malaysia',
  'Indonesia',
  'Philippines',
  'Turkey',
  'United Arab Emirates',
  'Saudi Arabia',
  'Israel',
  'Egypt',
  'Nigeria',
  'Kenya',
  'Other'
];

const LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Russian',
  'Chinese (Mandarin)',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Bengali',
  'Turkish',
  'Vietnamese',
  'Thai',
  'Indonesian',
  'Malay',
  'Tagalog',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Polish',
  'Greek',
  'Hebrew',
  'Swahili',
  'Other'
];

export function TellUsAboutYourselfPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [primaryLanguage, setPrimaryLanguage] = useState('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
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
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setUserType(data.user_type);
          setProfileData(data);
        }
      }
    };

    fetchUserProfile();
  }, []);

  // Load saved data from localStorage when coming back
  useEffect(() => {
    const savedProfile = localStorage.getItem('tempProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.location) setLocation(profile.location);
        if (profile.primaryLanguage) setPrimaryLanguage(profile.primaryLanguage);
        console.log('Restored location/language data from localStorage:', profile);
      } catch (err) {
        console.error('Error loading saved profile:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchLocationData = async () => {
      // Only auto-detect location if not already set
      if (location) return;
      
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();

        if (data.country_name) {
          const countryMap: { [key: string]: string } = {
            'United States': 'United States of America',
            'United Kingdom': 'United Kingdom',
            'Canada': 'Canada',
            'Australia': 'Australia',
            'Germany': 'Germany',
            'France': 'France',
            'Spain': 'Spain',
            'Italy': 'Italy',
            'Japan': 'Japan',
            'South Korea': 'South Korea',
            'Brazil': 'Brazil',
            'Mexico': 'Mexico',
            'India': 'India',
            'China': 'China',
            'Netherlands': 'Netherlands',
            'Sweden': 'Sweden',
            'Norway': 'Norway',
            'Denmark': 'Denmark',
            'Finland': 'Finland',
            'Switzerland': 'Switzerland',
            'Austria': 'Austria',
            'Belgium': 'Belgium',
            'Portugal': 'Portugal',
            'Poland': 'Poland',
            'Greece': 'Greece',
            'Ireland': 'Ireland',
            'New Zealand': 'New Zealand',
            'Singapore': 'Singapore',
            'South Africa': 'South Africa',
            'Argentina': 'Argentina',
            'Chile': 'Chile',
            'Colombia': 'Colombia',
            'Peru': 'Peru',
            'Thailand': 'Thailand',
            'Vietnam': 'Vietnam',
            'Malaysia': 'Malaysia',
            'Indonesia': 'Indonesia',
            'Philippines': 'Philippines',
            'Turkey': 'Turkey',
            'United Arab Emirates': 'United Arab Emirates',
            'Saudi Arabia': 'Saudi Arabia',
            'Israel': 'Israel',
            'Egypt': 'Egypt',
            'Nigeria': 'Nigeria',
            'Kenya': 'Kenya'
          };

          const languageMap: { [key: string]: string } = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'nl': 'Dutch',
            'ru': 'Russian',
            'zh': 'Chinese (Mandarin)',
            'ja': 'Japanese',
            'ko': 'Korean',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'bn': 'Bengali',
            'tr': 'Turkish',
            'vi': 'Vietnamese',
            'th': 'Thai',
            'id': 'Indonesian',
            'ms': 'Malay',
            'tl': 'Tagalog',
            'sv': 'Swedish',
            'no': 'Norwegian',
            'da': 'Danish',
            'fi': 'Finnish',
            'pl': 'Polish',
            'el': 'Greek',
            'he': 'Hebrew',
            'sw': 'Swahili'
          };

          const detectedCountry = countryMap[data.country_name] || 'Other';
          const detectedLanguage = languageMap[data.languages?.split(',')[0]] || 'English';

          setLocation(detectedCountry);
          setPrimaryLanguage(detectedLanguage);
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    };

    fetchLocationData();
  }, []);

  const handleBack = () => {
    navigate('/make-profile');
  };

  const handleContinue = async () => {
    if (!location || !primaryLanguage) {
      setError('Please complete all fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user ID from auth or localStorage
      const { data: { user } } = await supabase.auth.getUser();
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const userId = user?.id || verifiedUserId;

      if (userId) {
        // Save profile using Edge Function (bypasses RLS)
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-profile`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            location,
            primaryLanguage,
          }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to save profile');
        }

        // Also save to localStorage as backup
        const existingProfile = localStorage.getItem('tempProfile');
        const profileData = existingProfile ? JSON.parse(existingProfile) : {};

        localStorage.setItem('tempProfile', JSON.stringify({
          ...profileData,
          location,
          primaryLanguage
        }));
      } else {
        // No user ID - save to localStorage only
        const existingProfile = localStorage.getItem('tempProfile');
        const profileData = existingProfile ? JSON.parse(existingProfile) : {};

        localStorage.setItem('tempProfile', JSON.stringify({
          ...profileData,
          location,
          primaryLanguage
        }));
      }

      navigate('/user-type-selection');
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
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
        onClick={handleBack}
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
            Tell us about yourself
          </h1>
          <p className="text-sm" style={{ color: '#9CA3AF' }}>
            This helps us accurately create your profile.
          </p>
        </div>

        <div
          className="w-full p-6 relative"
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
            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
                Your location
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="w-full h-11 px-4 rounded-lg text-left flex items-center justify-between transition-all text-sm"
                  style={{
                    color: '#F2F4F7',
                    background: 'transparent',
                    border: '1px solid rgba(75, 85, 99, 1)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span style={{ color: location ? '#F2F4F7' : '#9CA3AF' }}>
                      {location || 'Select your location'}
                    </span>
                  </div>
                  <svg className="w-4 h-4" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showLocationDropdown && (
                  <div className="absolute z-20 w-full mt-2 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{
                    background: 'rgba(10, 10, 15, 0.95)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(75, 85, 99, 1)',
                  }}>
                    {COUNTRIES.map((country) => (
                      <button
                        key={country}
                        onClick={() => {
                          setLocation(country);
                          setShowLocationDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left transition-colors text-sm"
                        style={{ color: '#F2F4F7' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75, 85, 99, 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {country}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#9CA3AF' }}>
                What is your Primary Language?
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                  className="w-full h-11 px-4 rounded-lg text-left flex items-center justify-between transition-all text-sm"
                  style={{
                    color: '#F2F4F7',
                    background: 'transparent',
                    border: '1px solid rgba(75, 85, 99, 1)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span style={{ color: primaryLanguage ? '#F2F4F7' : '#9CA3AF' }}>
                      {primaryLanguage || 'Select your language'}
                    </span>
                  </div>
                  <svg className="w-4 h-4" style={{ color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showLanguageDropdown && (
                  <div className="absolute z-20 w-full mt-2 rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{
                    background: 'rgba(10, 10, 15, 0.95)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(75, 85, 99, 1)',
                  }}>
                    {LANGUAGES.map((language) => (
                      <button
                        key={language}
                        onClick={() => {
                          setPrimaryLanguage(language);
                          setShowLanguageDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left transition-colors text-sm"
                        style={{ color: '#F2F4F7' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75, 85, 99, 0.5)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleContinue}
              disabled={!location || !primaryLanguage || isLoading}
              className={`
                w-full h-11 rounded-lg font-semibold transition-all duration-300
                ${location && primaryLanguage && !isLoading
                  ? 'hover:opacity-95'
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
              style={{
                background: location && primaryLanguage && !isLoading ? '#E8E8E8' : 'rgba(75, 85, 99, 1)',
                color: location && primaryLanguage && !isLoading ? '#000000' : '#9CA3AF',
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
