import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, MapPin, Globe } from 'lucide-react';
import { BetaBadge } from '../components/BetaBadge';
import { supabase } from '../lib/supabase';

type SettingsSection = 'personal' | 'accounts' | 'payout' | 'notifications' | 'close';

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

export function SettingsPage() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SettingsSection>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    location: 'United States of America',
    language: 'English',
    email: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

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
    setIsLoading(true);
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
        const { data: usersByEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', verifiedEmail)
          .maybeSingle();
        
        if (usersByEmail?.id) {
          userId = usersByEmail.id;
          localStorage.setItem('verifiedUserId', userId);
          console.log('Found user by email, userId:', userId);
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
          console.log('users query successful, data:', userResult.data);
          if (userResult.data) {
            profile = userResult.data;
            userData = userResult.data;
          }
        }
      }

      console.log('Final profile data:', profile);
      console.log('Final user data:', userData);

      // Prioritize userData from users table (new primary source)
      const profileData = userData || profile;
      
      if (profileData) {
        setUserProfile(profileData);
        
        // Set form data from users table (primary source)
        const newFormData = {
          firstName: profileData?.first_name || '',
          lastName: profileData?.last_name || '',
          username: profileData?.username || '',
          location: profileData?.location || 'United States of America',
          language: profileData?.primary_language || 'English',
          email: profileData?.email || user?.email || verifiedEmail || ''
        };
        
        console.log('Setting formData to:', newFormData);
        setFormData(newFormData);
        
        // Set profile picture preview if available
        if (profileData?.profile_picture_url) {
          setProfilePicturePreview(profileData.profile_picture_url);
        } else {
          setProfilePicturePreview(null);
        }
        
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
      } else {
        console.warn('❌ No user data found for userId:', userId);
        console.warn('This might mean the user completed OTP but not onboarding');
        
        // Set at least the email if we have it
        if (verifiedEmail) {
          setFormData(prev => ({ ...prev, email: verifiedEmail }));
        }
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    const currentDashboard = localStorage.getItem('currentDashboard');
    if (currentDashboard) {
      navigate(currentDashboard);
    } else {
      navigate('/dashboard/creator');
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Get userId with fallback to localStorage (same logic as fetchUserProfile)
      const { data: { user } } = await supabase.auth.getUser();
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const userId = user?.id || verifiedUserId;

      if (!userId) {
        setSaveError('You must be logged in to save changes');
        setIsSaving(false);
        return;
      }

      console.log('💾 Saving profile changes for userId:', userId);
      console.log('Form data:', formData);

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
      console.log('📤 Sending save request to:', apiUrl);
      
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
      console.log('📥 Save response:', data);

      if (!data.success) {
        throw new Error(data.message || 'Failed to save changes');
      }

      console.log('✅ Profile saved successfully, refreshing data...');

      // Clear blob URLs if any
      if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePicturePreview);
      }

      // Refresh profile data
      await fetchUserProfile();
      
      // Reset editing state and clear temporary picture
      setProfilePicture(null);
      setProfilePicturePreview(null);
      setIsEditing(false);
      
      console.log('✅ All changes saved and profile refreshed');
    } catch (err: any) {
      console.error('❌ Error saving profile:', err);
      setSaveError(err.message || 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const renderPersonalInfo = () => (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>Personal info</h2>
        <button
          onClick={() => {
            console.log('Manual refresh triggered');
            console.log('Current formData:', formData);
            console.log('Current userProfile:', userProfile);
            fetchUserProfile();
          }}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#0f0f13', color: '#F8FAFC' }}
        >
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {/* Debug panel - remove this after testing */}
      <div className="mb-6 p-4 rounded-lg text-xs space-y-1" style={{ backgroundColor: '#0f0f13', color: '#94A3B8' }}>
        <div className="font-bold mb-2 text-white">🔍 Debug Info:</div>
        <div><span className="font-semibold">userId:</span> {localStorage.getItem('verifiedUserId') || '❌ Not found'}</div>
        <div><span className="font-semibold">Email:</span> {localStorage.getItem('verifiedEmail') || '❌ Not found'}</div>
        <div><span className="font-semibold">Has Profile Data:</span> {userProfile ? '✅ Yes' : '❌ No'}</div>
        {userProfile && (
          <div className="pl-4 text-green-400">
            <div>✓ Profile ID: {userProfile.id?.substring(0, 8)}...</div>
            <div>✓ User Type: {userProfile.user_type}</div>
          </div>
        )}
        <div className="font-semibold mt-2">Form Data:</div>
        <div className="pl-4">
          <div>• First Name: {formData.firstName || '(empty)'}</div>
          <div>• Last Name: {formData.lastName || '(empty)'}</div>
          <div>• Username: {formData.username || '(empty)'}</div>
          <div>• Email: {formData.email || '(empty)'}</div>
          <div>• Location: {formData.location}</div>
          <div>• Language: {formData.language}</div>
        </div>
        {!userProfile && (
          <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#7f1d1d', color: '#fecaca' }}>
            ⚠️ NO PROFILE DATA FOUND! This user hasn't completed onboarding yet.
          </div>
        )}
        <div className="mt-2 text-yellow-400">
          👉 Open browser console (F12) and click "Refresh Data" to see detailed logs
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="space-y-7">
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: '#94A3B8' }}>Profile picture</label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-md">
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
            <label className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm cursor-pointer"
              style={{ backgroundColor: '#0f0f13', color: '#F8FAFC' }}>
              <Camera className="w-4 h-4" />
              Replace picture
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setProfilePicture(file);
                    const url = URL.createObjectURL(file);
                    setProfilePicturePreview(url);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
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
              <div className="w-10 h-10"></div>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
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
          <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>
            Email cannot be changed
          </p>
        </div>

        {saveError && (
          <div className="text-red-500 text-sm mt-4">
            {saveError}
          </div>
        )}

        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                // Clear blob URLs if any
                if (profilePicturePreview && profilePicturePreview.startsWith('blob:')) {
                  URL.revokeObjectURL(profilePicturePreview);
                }
                
                setIsEditing(false);
                setProfilePicture(null);
                setProfilePicturePreview(userProfile?.profile_picture_url || null);
                
                // Reset form data to original values from userProfile
                if (userProfile) {
                  setFormData({
                    firstName: userProfile?.first_name || '',
                    lastName: userProfile?.last_name || '',
                    username: userProfile?.username || '',
                    location: userProfile?.location || 'United States of America',
                    language: userProfile?.primary_language || 'English',
                    email: userProfile?.email || formData.email
                  });
                }
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
      )}
    </div>
  );

  const renderPlaceholder = (title: string, description: string) => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2" style={{ color: '#F8FAFC' }}>{title}</h3>
        <p className="text-sm" style={{ color: '#94A3B8' }}>{description}</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen text-white overflow-hidden flex flex-col" style={{ backgroundColor: '#111111' }}>
      <header className="flex-shrink-0 h-16 z-50" style={{ backgroundColor: '#111111', borderBottom: '1px solid #1a1a1a' }}>
        <div className="max-w-7xl mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm transition-colors hover:brightness-110"
              style={{ color: '#94A3B8' }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-6 w-px" style={{ backgroundColor: '#1a1a1a' }} />
            <img 
              src="/elevate_transparent_white_.png" 
              alt="ELEVATE" 
              className="h-28 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate('/')}
            />
            <BetaBadge />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden pt-8 pb-8">
        <div className="h-full max-w-5xl mx-auto px-8 flex flex-col">
          <div className="flex items-center gap-6 mb-10 flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-lg">
              {userProfile?.profile_picture_url ? (
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
              <h1 className="text-3xl font-bold mb-1" style={{ color: '#F8FAFC' }}>
                {formData.firstName || formData.lastName 
                  ? `${formData.firstName} ${formData.lastName}`.trim() 
                  : 'Your Name'}
              </h1>
              <p className="text-base" style={{ color: '#64748B' }}>
                {formData.username ? `@${formData.username}` : ''} {formData.email}
              </p>
            </div>
          </div>

          <div className="flex gap-6 flex-1 overflow-hidden min-h-0">
            <aside className="w-72 flex-shrink-0">
              <div className="rounded-2xl p-1 shadow-xl h-full" style={{ backgroundColor: '#1a1a1e' }}>
                <nav className="space-y-1 p-2">
                  <button
                    onClick={() => setActiveSection('personal')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'personal' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'personal' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Personal info
                  </button>
                  <button
                    onClick={() => setActiveSection('accounts')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'accounts' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'accounts' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Connected accounts
                  </button>
                  <button
                    onClick={() => setActiveSection('payout')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'payout' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'payout' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Payout methods
                  </button>
                  <button
                    onClick={() => setActiveSection('notifications')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'notifications' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'notifications' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveSection('close')}
                    className={`w-full text-left px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      activeSection === 'close' ? 'shadow-md' : 'hover:brightness-105'
                    }`}
                    style={{
                      backgroundColor: activeSection === 'close' ? '#0f0f13' : 'transparent',
                      color: '#F8FAFC'
                    }}
                  >
                    Close account
                  </button>
                </nav>
              </div>
            </aside>

            <main className="flex-1 rounded-2xl p-8 shadow-xl overflow-y-auto" style={{ backgroundColor: '#1a1a1e' }}>
              {activeSection === 'personal' && renderPersonalInfo()}
              {activeSection === 'accounts' && renderPlaceholder('Connected accounts', 'Manage your social media connections')}
              {activeSection === 'payout' && renderPlaceholder('Payout methods', 'Add your payout information')}
              {activeSection === 'notifications' && renderPlaceholder('Notifications', 'Manage your notification preferences')}
              {activeSection === 'close' && renderPlaceholder('Close account', 'Delete your account and data')}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
