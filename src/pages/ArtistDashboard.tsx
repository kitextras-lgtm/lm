import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, Instagram, Music2, ArrowUpRight, LogOut, MapPin, Globe, Plus } from 'lucide-react';
import { BetaBadge } from '../components/BetaBadge';
import { SocialLinksForm } from '../components/SocialLinksForm';
import { ReferralSection } from '../components/ReferralSection';
import { DoorTransition } from '../components/DoorTransition';
import { EditIcon } from '../components/EditIcon';
import { UserSilhouetteIcon } from '../components/UserSilhouetteIcon';
import { PuzzlePiecesIcon } from '../components/PuzzlePiecesIcon';
import { CreditCardIcon } from '../components/CreditCardIcon';
import { BellIcon } from '../components/BellIcon';
import { supabase } from '../lib/supabase';

type SettingsSection = 'personal' | 'accounts' | 'payout' | 'notifications';

const SettingsNavButton = ({ 
  onClick, 
  isActive, 
  icon, 
  label 
}: { 
  onClick: () => void; 
  isActive: boolean; 
  icon: React.ReactElement; 
  label: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 ${
        isActive ? 'shadow-md' : 'hover:brightness-105'
      }`}
      style={{
        backgroundColor: isActive ? '#0f0f13' : 'transparent',
        color: '#F8FAFC'
      }}
    >
      {React.cloneElement(icon, { isHovered })}
      {label}
    </button>
  );
};

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

export function ArtistDashboard() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    location: '',
    language: '',
    email: ''
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const personalRef = useRef<HTMLDivElement>(null);
  const accountsRef = useRef<HTMLDivElement>(null);
  const payoutRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('currentDashboard', '/dashboard/artist');
    fetchUserProfile();
  }, []);

  // Debug: Log when formData changes
  useEffect(() => {
    console.log('formData changed:', formData);
  }, [formData]);

  // Re-fetch profile when component becomes visible (in case data was updated)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchUserProfile();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Try to get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      // Fallback: check localStorage for verifiedUserId
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const verifiedEmail = localStorage.getItem('verifiedEmail');
      
      let userId = user?.id || verifiedUserId;
      
      // If we have email but no userId, try to find user by email
      if (!userId && verifiedEmail) {
        console.log('No userId found, trying to find user by email:', verifiedEmail);
        const { data: usersByEmail, error: emailLookupError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', verifiedEmail)
          .maybeSingle();
        
        if (emailLookupError) {
          console.error('Error looking up user by email:', emailLookupError);
        }
        
        if (usersByEmail?.id) {
          userId = usersByEmail.id;
          localStorage.setItem('verifiedUserId', userId);
          console.log('Found user by email, userId:', userId);
        } else {
          console.warn('User not found in users table with email:', verifiedEmail);
          // Try to find in auth.users via Edge Function as last resort
          // This would require an API call, but for now we'll just log
        }
      }
      
      if (!userId) {
        console.warn('No user ID found. Auth error:', authError);
        console.warn('Verified email:', verifiedEmail);
        return;
      }

      console.log('Fetching profile for userId:', userId);
      console.log('Auth user:', user?.id);
      console.log('Is authenticated:', !!user);

      // Try Edge Function first (bypasses RLS) - more reliable
      let profile = null;
      let userData = null;
      
      try {
        console.log('Attempting to fetch via Edge Function...');
        const fetchUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-profile?userId=${userId}`;
        const fetchResponse = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Edge Function response status:', fetchResponse.status);
        
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          console.log('Edge Function response data:', fetchData);
          
          if (fetchData.success) {
            profile = fetchData.profile;
            userData = fetchData.user;
            console.log('Successfully fetched via Edge Function');
            console.log('Profile:', profile);
            console.log('User:', userData);
            console.log('Profile picture URL from database:', profile?.profile_picture_url || userData?.profile_picture_url);
            console.log('All profile keys:', profile ? Object.keys(profile) : 'null');
          } else {
            console.warn('Edge Function returned success:false', fetchData.message);
          }
        } else {
          const errorText = await fetchResponse.text();
          console.error('Edge Function fetch failed:', fetchResponse.status, errorText);
        }
      } catch (fetchErr) {
        console.error('Error fetching via Edge Function:', fetchErr);
      }

      // Fallback: Try direct query if Edge Function didn't work
      if (!profile) {
        console.log('Edge Function didn\'t return data, trying direct query...');
        const userResult = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // Log any errors with full details
        if (userResult.error) {
          console.error('Error fetching users table:', userResult.error);
          console.error('Error details:', {
            message: userResult.error.message,
            details: userResult.error.details,
            hint: userResult.error.hint,
            code: userResult.error.code
          });
        } else {
          console.log('users table query successful, data:', userResult.data);
          if (userResult.data) {
            profile = userResult.data;
          }
        }
        
        if (userResult.error) {
          console.error('Error fetching users:', userResult.error);
          console.error('Error details:', {
            message: userResult.error.message,
            details: userResult.error.details,
            hint: userResult.error.hint,
            code: userResult.error.code
          });
        } else {
          console.log('users query successful, data:', userResult.data);
          if (userResult.data) {
            profile = userResult.data;
            userData = userResult.data;
          }
        }
      }

      console.log('Final profile data:', profile);
      console.log('Final user data:', userData);

      // Prioritize userData from users table (new primary source of truth)
      const profileData = userData || profile;
      
      // Always set profile data, even if empty (use defaults)
      setUserProfile(profileData);
      setUserType(profileData?.user_type?.toUpperCase() || 'ARTIST');
      
      // Set form data from users table (primary source)
      const formDataToSet = {
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        username: profileData?.username || '',
        location: profileData?.location || '',
        language: profileData?.primary_language || '',
        email: profileData?.email || user?.email || verifiedEmail || ''
      };
      
      console.log('Setting form data from users table:', formDataToSet);
      setFormData(formDataToSet);
      
      // Clear any blob URLs first (they're temporary and shouldn't be used)
      if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
        console.log('Clearing blob URL:', profilePicturePreview);
        URL.revokeObjectURL(profilePicturePreview);
        setProfilePicturePreview(null);
      }
      
      // Only set profilePicturePreview from database URL (for settings page preview)
      // Header avatar will use userProfile.profile_picture_url directly
      if (profileData?.profile_picture_url && !profileData.profile_picture_url.startsWith('blob:')) {
        console.log('Setting profile picture preview from database:', profileData.profile_picture_url);
        setProfilePicturePreview(profileData.profile_picture_url);
      } else {
        console.log('No valid profile picture URL found in profile data');
        console.log('Profile data keys:', profileData ? Object.keys(profileData) : 'null');
        console.log('profile_picture_url value:', profileData?.profile_picture_url);
        setProfilePicturePreview(null);
      }
      
      if (profileData) {
        console.log('✅ Profile synced successfully from users table:', {
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          username: profileData?.username,
          location: profileData?.location,
          language: profileData?.primary_language,
          userType: profileData?.user_type,
          profilePicture: !!profileData?.profile_picture_url,
          email: profileData?.email
        });
        console.log('Form data has been set. Check if fields are displaying...');
      } else {
        console.warn('❌ No user data found for userId:', userId);
        console.warn('This might mean the user completed OTP but not onboarding');
        console.warn('Form data set with empty values - user needs to complete onboarding');
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setProfilePicturePreview(url);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Get user ID using same fallback logic as fetchUserProfile
      const { data: { user } } = await supabase.auth.getUser();
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const verifiedEmail = localStorage.getItem('verifiedEmail');
      
      let userId = user?.id || verifiedUserId;
      
      // If we have email but no userId, try to find user by email
      if (!userId && verifiedEmail) {
        const { data: usersByEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', verifiedEmail)
          .maybeSingle();
        
        if (usersByEmail?.id) {
          userId = usersByEmail.id;
          localStorage.setItem('verifiedUserId', userId);
        }
      }

      if (!userId) {
        setSaveError('You must be logged in to save changes');
        setIsSaving(false);
        return;
      }

      // Convert profile picture to base64 to send via Edge Function
      // Edge Function will upload it using service role (bypasses RLS)
      let profilePictureBase64 = null;
      let profilePictureFileName = null;
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
          
          profilePictureFileName = profilePicture.name;
          console.log('✅ Profile picture converted to base64');
        } catch (convertErr: any) {
          console.error('❌ Failed to convert image:', convertErr);
          setSaveError(`Failed to process profile picture: ${convertErr.message}`);
          setIsSaving(false);
          return;
        }
      }

      // Save profile using Edge Function (bypasses RLS)
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-profile`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          // Username is not included - it cannot be changed after onboarding
          location: formData.location,
          primaryLanguage: formData.language,
          profilePictureBase64: profilePictureBase64, // Send base64 instead of URL
          profilePictureFileName: profilePictureFileName,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to save changes');
      }

      // Refresh profile data
      await fetchUserProfile();
      setProfilePicture(null);
      setProfilePicturePreview(null);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const scrollToSection = (section: SettingsSection) => {
    setSettingsSection(section);
    const refs = {
      personal: personalRef,
      accounts: accountsRef,
      payout: payoutRef,
      notifications: notificationsRef
    };
    refs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const renderPersonalInfo = () => (
    <div ref={personalRef} className="scroll-mt-6 rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>Personal info</h2>
        <button
          onClick={() => {
            console.log('Manual refresh triggered');
            fetchUserProfile();
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
          style={{ backgroundColor: '#0f0f13', color: '#F8FAFC' }}
        >
          Refresh Data
        </button>
      </div>

      <div className="space-y-7">
        <div>
          <div className="flex items-center gap-4">
            <div
              onClick={handleProfilePictureClick}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-md cursor-pointer hover:brightness-110 transition-all duration-200"
            >
              {profilePicturePreview ? (
                <img 
                  src={profilePicturePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : userProfile?.profile_picture_url ? (
                <img 
                  src={userProfile.profile_picture_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-1" style={{ color: '#F8FAFC' }}>
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-sm" style={{ color: '#94A3B8' }}>{formData.email}</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>First name</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isEditing && !isSaving) {
                    handleSaveChanges();
                  }
                }}
                disabled={!isEditing}
                className="flex-1 h-12 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: '#F8FAFC',
                  background: '#0f0f13',
                  border: '1px solid rgba(75, 85, 99, 0.2)',
                }}
              />
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2.5 hover:brightness-110 transition-all rounded-lg"
                  style={{ color: '#64748B' }}
                >
                  <EditIcon />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Last name</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isEditing && !isSaving) {
                    handleSaveChanges();
                  }
                }}
                disabled={!isEditing}
                className="flex-1 h-12 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: '#F8FAFC',
                  background: '#0f0f13',
                  border: '1px solid rgba(75, 85, 99, 0.2)',
                }}
              />
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2.5 hover:brightness-110 transition-all rounded-lg"
                  style={{ color: '#64748B' }}
                >
                  <EditIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Username</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center h-12 px-4 rounded-xl transition-all opacity-70" style={{ background: '#0f0f13', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <span style={{ color: '#64748B' }}>@</span>
              <input
                type="text"
                value={formData.username}
                disabled={true}
                readOnly
                className="flex-1 bg-transparent text-sm focus:outline-none ml-1 cursor-not-allowed"
                style={{ color: '#F8FAFC' }}
                title="Username cannot be changed after onboarding"
              />
            </div>
            <div className="w-10 h-10"></div>
          </div>
          <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>
            Username cannot be changed after onboarding
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Location</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center h-12 px-4 rounded-xl focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: '#0f0f13', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#64748B' }} />
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isEditing && !isSaving) {
                    handleSaveChanges();
                  }
                }}
                disabled={!isEditing}
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: '#F8FAFC' }}
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country} style={{ background: '#0f0f13' }}>{country}</option>
                ))}
              </select>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 hover:brightness-110 transition-all rounded-lg"
                style={{ color: '#64748B' }}
              >
                <EditIcon />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Languages you post in</label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center h-12 px-4 rounded-xl focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: '#0f0f13', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <Globe className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#64748B' }} />
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isEditing && !isSaving) {
                    handleSaveChanges();
                  }
                }}
                disabled={!isEditing}
                className="flex-1 bg-transparent text-sm focus:outline-none"
                style={{ color: '#F8FAFC' }}
              >
                {LANGUAGES.map(language => (
                  <option key={language} value={language} style={{ background: '#0f0f13' }}>{language}</option>
                ))}
              </select>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 hover:brightness-110 transition-all rounded-lg"
                style={{ color: '#64748B' }}
              >
                <EditIcon />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2.5" style={{ color: '#94A3B8' }}>Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full h-12 px-4 rounded-xl text-sm focus:outline-none opacity-50"
            style={{
              color: '#F8FAFC',
              background: '#0f0f13',
              border: '1px solid rgba(75, 85, 99, 0.2)',
            }}
          />
        </div>

        {saveError && (
          <div className="text-red-500 text-sm mt-4">
            {saveError}
          </div>
        )}

        {saveError && (
          <div className="text-red-500 text-sm mt-4">
            {saveError}
          </div>
        )}

        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setIsEditing(false);
                setProfilePicture(null);
                setProfilePicturePreview(userProfile?.profile_picture_url || null);
                setSaveError(null);
                // Reset form data to original values
                fetchUserProfile();
              }}
              className="px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm"
              style={{ backgroundColor: '#0f0f13', color: '#F8FAFC' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-7 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E8E8E8', color: '#000000' }}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderConnectedAccounts = () => (
    <div ref={accountsRef} className="scroll-mt-6 rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>Connected accounts (0)</h2>
      <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
        Link the social media accounts where you post content.<br />
        An account must be connected to submit clips.
      </p>

      <button className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110" style={{ backgroundColor: '#0f0f13', color: '#94A3B8' }}>
        <Plus className="w-5 h-5" />
        Connect an account
      </button>
    </div>
  );

  const renderPayoutMethods = () => (
    <div ref={payoutRef} className="scroll-mt-6 rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>Payout methods</h2>
      <p className="text-sm mb-3" style={{ color: '#94A3B8' }}>
        Link an account to withdraw funds. Depending on your location, you can connect either a <span className="font-semibold" style={{ color: '#F8FAFC' }}>Stripe</span> or <span className="font-semibold" style={{ color: '#F8FAFC' }}>PayPal</span> account.
      </p>
      <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
        You can choose a preferred method when you cash out.
      </p>

      <button className="flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110" style={{ backgroundColor: '#0f0f13', color: '#94A3B8' }}>
        <Plus className="w-5 h-5" />
        Connect an account
      </button>
    </div>
  );

  const renderNotifications = () => (
    <div ref={notificationsRef} className="scroll-mt-6 rounded-2xl p-8 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
      <h2 className="text-2xl font-bold mb-8" style={{ color: '#F8FAFC' }}>Notifications</h2>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-6" style={{ color: '#F8FAFC' }}>Email</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: '#0f0f13' }}>
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F8FAFC' }}>New campaigns</h4>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Notify me when new clipping campaigns launch</p>
              </div>
              <button className="w-12 h-7 rounded-full transition-colors duration-200 flex items-center px-0.5" style={{ backgroundColor: '#3B82F6' }}>
                <div className="w-6 h-6 rounded-full bg-white shadow-sm ml-auto"></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F8FAFC' }}>Campaign updates</h4>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Send me status updates for campaigns I've joined</p>
              </div>
              <button className="w-12 h-7 rounded-full transition-colors duration-200 flex items-center px-0.5" style={{ backgroundColor: '#3B82F6' }}>
                <div className="w-6 h-6 rounded-full bg-white shadow-sm ml-auto"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white pb-20 md:pb-0" style={{ backgroundColor: '#111111' }}>
      <style>{`
        /* Custom scrollbar for settings content area */
        .settings-scrollable::-webkit-scrollbar {
          width: 8px;
        }
        
        .settings-scrollable::-webkit-scrollbar-track {
          background: rgba(15, 15, 19, 0.3);
          border-radius: 4px;
        }
        
        .settings-scrollable::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 4px;
          transition: background 0.2s ease;
        }
        
        .settings-scrollable::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
        
        /* Firefox scrollbar */
        .settings-scrollable {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.3) rgba(15, 15, 19, 0.3);
        }
      `}</style>
      <DoorTransition showTransition={location.state?.fromOnboarding === true} />
      <header className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16" style={{ backgroundColor: '#111111', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-1">
            <img 
              src="/elevate_transparent_white_.png" 
              alt="ELEVATE" 
              className="h-20 sm:h-28 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate('/')}
            />
            <BetaBadge />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <div
              className={`home-icon group ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => setActiveSection('home')}
            >
              <div className="home-icon-wrapper">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="14" y="18" width="20" height="24" rx="2" stroke="white" strokeWidth="2.5" fill="none"/>
                  <path d="M8 20L24 8L40 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path className="light-beam" d="M19 42V28C19 27.4477 19.4477 27 20 27H28C28.5523 27 29 27.4477 29 28V42" fill="white"/>
                  <ellipse className="glow-ellipse" cx="24" cy="35" rx="6" ry="8" fill="white"/>
                </svg>
                <div className="outer-glow"></div>
              </div>
              <span className="label">Home</span>
            </div>

            <div
              className={`messages-icon group ${activeSection === 'messages' ? 'active' : ''}`}
              onClick={() => setActiveSection('messages')}
            >
              <div className="messages-icon-wrapper">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path className="back-bubble" d="M32 12H18C14.6863 12 12 14.6863 12 18V26C12 29.3137 14.6863 32 18 32H20L24 36L28 32H32C35.3137 32 38 29.3137 38 26V18C38 14.6863 35.3137 12 32 12Z" stroke="white" strokeWidth="2.5" fill="none"/>
                  <path className="front-bubble" d="M30 20H16C13.2386 20 11 22.2386 11 25V31C11 33.7614 13.2386 36 16 36H18L21 40L24 36H30C32.7614 36 35 33.7614 35 31V25C35 22.2386 32.7614 20 30 20Z" stroke="white" strokeWidth="2.5" fill="rgba(0,0,0,0.8)"/>
                  <g className="dots">
                    <circle cx="17" cy="28" r="1.5" fill="white"/>
                    <circle cx="23" cy="28" r="1.5" fill="white"/>
                    <circle cx="29" cy="28" r="1.5" fill="white"/>
                  </g>
                </svg>
              </div>
              <span className="label">Messages</span>
            </div>

            <div
              className={`earnings-icon group ${activeSection === 'earnings' ? 'active' : ''}`}
              onClick={() => setActiveSection('earnings')}
            >
              <div className="icon-container">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
                  <ellipse cx="24" cy="28" rx="14" ry="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                  <ellipse cx="36" cy="28" rx="4" ry="3" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                  <circle cx="35" cy="27" r="0.8" fill="currentColor"/>
                  <circle cx="37" cy="27" r="0.8" fill="currentColor"/>
                  <path d="M16 20C16 20 14 16 18 14C22 12 24 16 24 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                  <path d="M16 36V40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M22 36V40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M26 36V40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M32 36V40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  <rect x="20" y="17" width="8" height="2" rx="1" fill="currentColor"/>
                  <circle cx="18" cy="25" r="1.5" fill="currentColor"/>
                </svg>
                <div className="coin coin-1">
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <text x="6" y="8" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold">$</text>
                  </svg>
                </div>
                <div className="coin coin-2">
                  <svg width="6" height="6" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <text x="6" y="8" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold">$</text>
                  </svg>
                </div>
              </div>
              <span className="label">Earnings</span>
            </div>
          </nav>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200 hover:brightness-110 cursor-pointer overflow-hidden relative"
              style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC' }}
            >
              {(() => {
                // ONLY use database URL for header avatar (never use blob URLs)
                const profilePicUrl = userProfile?.profile_picture_url;
                
                // Only render image if we have a valid database URL (not a blob URL)
                if (profilePicUrl && !profilePicUrl.startsWith('blob:')) {
                  return (
                    <>
                      {/* Show initials as placeholder while image loads */}
                      <span className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC' }}>
                        {userProfile?.first_name?.[0]?.toUpperCase() || 
                         userProfile?.last_name?.[0]?.toUpperCase() || 
                         formData.firstName?.[0]?.toUpperCase() || 
                         formData.lastName?.[0]?.toUpperCase() || 
                         'M'}
                      </span>
                      <img 
                        src={profilePicUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover relative z-10"
                        onLoad={(e) => {
                          // Hide placeholder when image loads
                          const placeholder = e.currentTarget.previousElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.opacity = '0';
                            placeholder.style.transition = 'opacity 0.2s';
                          }
                        }}
                        onError={(e) => {
                          console.error('Failed to load profile picture from database:', profilePicUrl);
                          // Show placeholder on error
                          const placeholder = e.currentTarget.previousElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.opacity = '1';
                          }
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </>
                  );
                }
                
                // Fallback to initials if no valid database URL
                return (
                  <span>
                    {userProfile?.first_name?.[0]?.toUpperCase() || 
                     userProfile?.last_name?.[0]?.toUpperCase() || 
                     formData.firstName?.[0]?.toUpperCase() || 
                     formData.lastName?.[0]?.toUpperCase() || 
                     'M'}
                  </span>
                );
              })()}
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-down"
                style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC' }}
              >
                <div className="p-6">
                  <div className="mb-5">
                    <div className="inline-block px-2.5 py-1 rounded-md text-xs font-bold tracking-wider mb-3" style={{ backgroundColor: '#111111', color: '#94A3B8' }}>
                      {userType || 'ARTIST'}
                    </div>
                    <h3 className="text-xl font-bold mb-0.5" style={{ color: '#F8FAFC' }}>
                      {formData.firstName || formData.lastName 
                        ? `${formData.firstName} ${formData.lastName}`.trim() 
                        : userProfile?.full_name || 'Your Name'}
                    </h3>
                    <p className="text-sm" style={{ color: '#64748B' }}>
                      {formData.email || localStorage.getItem('verifiedEmail') || 'No email'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setActiveSection('settings');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl text-sm font-bold mb-3 transition-all duration-200 hover:brightness-110"
                    style={{ backgroundColor: '#111111', color: '#F8FAFC' }}
                  >
                    Settings
                  </button>

                  <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-bold mb-1 transition-all duration-200 hover:brightness-110" style={{ backgroundColor: 'transparent', color: '#F8FAFC' }}>
                    <span>Give feedback</span>
                    <ArrowUpRight className="w-4 h-4" style={{ color: '#64748B' }} />
                  </button>

                  <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-bold mb-5 transition-all duration-200 hover:brightness-110" style={{ backgroundColor: 'transparent', color: '#F8FAFC' }}>
                    <span>Support</span>
                    <ArrowUpRight className="w-4 h-4" style={{ color: '#64748B' }} />
                  </button>

                  <button onClick={handleLogout} className="w-full flex items-center gap-2.5 py-3 px-4 text-sm font-bold transition-all duration-200 hover:opacity-70" style={{ color: '#F8FAFC' }}>
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </div>

                <div className="px-6 py-4 flex items-center gap-4 text-xs" style={{ color: '#64748B', borderTop: '1px solid #111111' }}>
                  <button className="transition-colors" style={{ color: '#64748B' }}>Privacy</button>
                  <button className="transition-colors" style={{ color: '#64748B' }}>Terms</button>
                  <button className="transition-colors" style={{ color: '#64748B' }}>Clipper Terms</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t" style={{ backgroundColor: '#111111', borderColor: '#1a1a1e' }}>
        <div className="flex items-center justify-around px-4 py-2">
          <div
            className={`home-icon group ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => setActiveSection('home')}
          >
            <div className="home-icon-wrapper">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="14" y="18" width="20" height="24" rx="2" stroke="white" strokeWidth="2.5" fill="none"/>
                <path d="M8 20L24 8L40 20" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path className="light-beam" d="M19 42V28C19 27.4477 19.4477 27 20 27H28C28.5523 27 29 27.4477 29 28V42" fill="white"/>
                <ellipse className="glow-ellipse" cx="24" cy="35" rx="6" ry="8" fill="white"/>
              </svg>
              <div className="outer-glow"></div>
            </div>
            <span className="label">Home</span>
          </div>

          <div
            className={`messages-icon group ${activeSection === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveSection('messages')}
          >
            <div className="messages-icon-wrapper">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className="back-bubble" d="M32 12H18C14.6863 12 12 14.6863 12 18V26C12 29.3137 14.6863 32 18 32H20L24 36L28 32H32C35.3137 32 38 29.3137 38 26V18C38 14.6863 35.3137 12 32 12Z" stroke="white" strokeWidth="2.5" fill="none"/>
                <path className="front-bubble" d="M30 20H16C13.2386 20 11 22.2386 11 25V31C11 33.7614 13.2386 36 16 36H18L21 40L24 36H30C32.7614 36 35 33.7614 35 31V25C35 22.2386 32.7614 20 30 20Z" stroke="white" strokeWidth="2.5" fill="rgba(0,0,0,0.8)"/>
                <g className="dots">
                  <circle cx="17" cy="28" r="1.5" fill="white"/>
                  <circle cx="23" cy="28" r="1.5" fill="white"/>
                  <circle cx="29" cy="28" r="1.5" fill="white"/>
                </g>
              </svg>
            </div>
            <span className="label">Messages</span>
          </div>

          <div
            className={`earnings-icon group ${activeSection === 'earnings' ? 'active' : ''}`}
            onClick={() => setActiveSection('earnings')}
          >
            <div className="icon-container">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
                <ellipse cx="24" cy="28" rx="14" ry="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                <ellipse cx="36" cy="28" rx="4" ry="3" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                <circle cx="35" cy="27" r="0.8" fill="currentColor"/>
                <circle cx="37" cy="27" r="0.8" fill="currentColor"/>
                <path d="M16 20C16 20 14 16 18 14C22 12 24 16 24 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                <path d="M16 36V40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M22 36V40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M26 36V40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M32 36V40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <rect x="20" y="17" width="8" height="2" rx="1" fill="currentColor"/>
                <circle cx="18" cy="25" r="1.5" fill="currentColor"/>
              </svg>
              <div className="coin coin-1">
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <text x="6" y="8" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold">$</text>
                </svg>
              </div>
              <div className="coin coin-2">
                <svg width="6" height="6" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <text x="6" y="8" textAnchor="middle" fill="currentColor" fontSize="6" fontWeight="bold">$</text>
                </svg>
              </div>
            </div>
            <span className="label">Earnings</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-12 pt-20 sm:pt-24">
        {activeSection === 'messages' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-250px)] sm:min-h-[calc(100vh-200px)] animate-fade-in">
            <div className="text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: '#1a1a1e' }}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: '#F8FAFC' }}>No messages yet</h3>
              <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Your conversations will appear here</p>
            </div>
          </div>
        )}

        {activeSection === 'earnings' && (
          <div className="flex items-center justify-center min-h-[calc(100vh-250px)] sm:min-h-[calc(100vh-200px)] animate-fade-in">
            <div className="text-center px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ backgroundColor: '#1a1a1e' }}>
                <svg className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#64748B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: '#F8FAFC' }}>No earnings yet</h3>
              <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Start posting clips to earn money</p>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="max-w-5xl mx-auto animate-fade-in pt-16">
            <div className="flex gap-6">
              <aside className="w-72 flex-shrink-0">
                <div className="rounded-2xl p-1 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
                  <nav className="space-y-1 p-2">
                    <SettingsNavButton
                      onClick={() => scrollToSection('personal')}
                      isActive={settingsSection === 'personal'}
                      icon={<UserSilhouetteIcon />}
                      label="Personal info"
                    />
                    <SettingsNavButton
                      onClick={() => scrollToSection('accounts')}
                      isActive={settingsSection === 'accounts'}
                      icon={<PuzzlePiecesIcon />}
                      label="Connected accounts"
                    />
                    <SettingsNavButton
                      onClick={() => scrollToSection('payout')}
                      isActive={settingsSection === 'payout'}
                      icon={<CreditCardIcon />}
                      label="Payout methods"
                    />
                    <SettingsNavButton
                      onClick={() => scrollToSection('notifications')}
                      isActive={settingsSection === 'notifications'}
                      icon={<BellIcon />}
                      label="Notifications"
                    />
                  </nav>
                </div>
              </aside>

              <div className="relative flex-1">
                <div className="settings-scrollable space-y-6 overflow-y-auto pb-6 scroll-smooth" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
                  {renderPersonalInfo()}
                  {renderConnectedAccounts()}
                  {renderPayoutMethods()}
                  {renderNotifications()}
                </div>
                {/* Scroll indicator gradient */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(to top, rgba(17, 17, 17, 0.9) 0%, rgba(17, 17, 17, 0.7) 40%, transparent 100%)'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'home' && (
          <div className="animate-fade-in">
        <section className="mb-10 sm:mb-20">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>Active campaigns</h2>
            <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Select a campaign to start clipping</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:brightness-105 cursor-pointer" style={{ backgroundColor: '#1a1a1e' }}>
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: '#F8FAFC' }}>DreamKey</h3>
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: '#64748B' }}>13d ago • Per view</p>
                </div>
              </div>

              <p className="mb-4 sm:mb-5 font-medium text-sm sm:text-base" style={{ color: '#F8FAFC' }}>VCTV9000 Channel Awareness</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#64748B' }} />
                  <Video className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#64748B' }} />
                  <Music2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#64748B' }} />
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#F8FAFC' }}>$1,000</div>
                  <div className="text-[10px] sm:text-xs font-medium tracking-wider mt-0.5" style={{ color: '#64748B' }}>PER 1M VIEWS</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:brightness-105 cursor-pointer" style={{ backgroundColor: '#1a1a1e' }}>
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-500 flex items-center justify-center text-black font-bold text-lg sm:text-xl flex-shrink-0">
                  1B
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                    <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: '#F8FAFC' }}>1 Billion Followers Sum...</h3>
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm" style={{ color: '#64748B' }}>24d ago • Per view</p>
                </div>
              </div>

              <p className="mb-4 sm:mb-5 font-medium text-sm sm:text-base" style={{ color: '#F8FAFC' }}>1 Billion Acts of Kindness</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#64748B' }} />
                  <Music2 className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#64748B' }} />
                  <Video className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#64748B' }} />
                </div>
                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-bold" style={{ color: '#F8FAFC' }}>$1,500</div>
                  <div className="text-[10px] sm:text-xs font-medium tracking-wider mt-0.5" style={{ color: '#64748B' }}>PER 1M VIEWS</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 sm:mb-20">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>My Accounts</h2>
            <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Add your social media channels and profiles</p>
          </div>

          <SocialLinksForm />
        </section>

        <section className="mb-8">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>Referral Section</h2>
            <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Support creators by using their code. Share yours to earn together.</p>
          </div>

          <ReferralSection />
        </section>
          </div>
        )}
      </main>
    </div>
  );
}
