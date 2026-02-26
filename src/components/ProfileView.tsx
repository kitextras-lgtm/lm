import { useState, useRef } from 'react';
import { Camera, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { DEFAULT_AVATAR_DATA_URI } from './DefaultAvatar';
import { useTranslation } from 'react-i18next';

interface ProfileViewProps {
  userProfile: {
    first_name?: string;
    last_name?: string;
    username?: string;
    profile_picture_url?: string;
    location?: string;
    created_at?: string;
    bio?: string;
    banner_url?: string;
    user_type?: 'artist' | 'creator' | 'freelancer' | 'business';
  } | null;
  cachedProfilePic?: string | null;
  onBack?: () => void;
  onUpdateProfile?: (updates: { profile_picture?: File; banner?: File; bio?: string }) => void;
  isEditing?: boolean;
  setIsEditing?: (editing: boolean) => void;
  onEditProfile?: () => void;
  appliedTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white';
}

// Account type icons with custom hover animations (matching UserTypeSelectionPage)
const ArtistIcon = () => (
  <div className="music-icon group w-5 h-5 flex-shrink-0">
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M12 28C12 20.268 18.268 14 26 14H22C29.732 14 36 20.268 36 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <rect x="8" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="32" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="10" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="34" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
    </svg>
    <div className="note note-1">
      <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
        <path d="M2 12V3L9 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="2" cy="12" r="2" fill="currentColor"/>
      </svg>
    </div>
    <div className="note note-2">
      <svg width="8" height="12" viewBox="0 0 10 14" fill="none">
        <path d="M2 12V3L9 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="2" cy="12" r="2" fill="currentColor"/>
      </svg>
    </div>
    <div className="note note-3">
      <svg width="6" height="10" viewBox="0 0 10 14" fill="none">
        <path d="M2 12V3L9 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="2" cy="12" r="2" fill="currentColor"/>
      </svg>
    </div>
  </div>
);

const CreatorIcon = () => (
  <div className="creators-icon group w-5 h-5 flex-shrink-0">
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="14" y="6" width="20" height="36" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="20" y="9" width="8" height="2" rx="1" fill="currentColor" opacity="0.4"/>
      <rect x="21" y="38" width="6" height="2" rx="1" fill="currentColor" opacity="0.4"/>
      <g className="app app-1">
        <rect x="16" y="14" width="10" height="8" rx="2" fill="currentColor" opacity="0.2"/>
        <path d="M20 16L23 18L20 20V16Z" fill="currentColor" opacity="0.8"/>
      </g>
      <g className="app app-2">
        <rect x="26" y="14" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8"/>
        <circle cx="30" cy="18" r="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8"/>
        <circle cx="32.5" cy="15.5" r="0.8" fill="currentColor" opacity="0.6"/>
      </g>
    </svg>
  </div>
);

const BrandIcon = () => (
  <div className="businesses-icon group w-5 h-5 flex-shrink-0">
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="6" y="18" width="36" height="22" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M18 18V14C18 12.8954 18.8954 12 20 12H28C29.1046 12 30 12.8954 30 14V18" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect className="lid" x="6" y="18" width="36" height="8" rx="3" stroke="currentColor" strokeWidth="2" fill="var(--bg-primary)"/>
      <rect className="clasp" x="21" y="24" width="6" height="4" rx="1" fill="currentColor"/>
      <g className="documents">
        <rect x="12" y="22" width="10" height="14" rx="1" fill="currentColor" opacity="0.2"/>
        <line x1="14" y1="25" x2="20" y2="25" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <line x1="14" y1="28" x2="18" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <line x1="14" y1="31" x2="20" y2="31" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        <rect x="26" y="22" width="10" height="14" rx="1" fill="currentColor" opacity="0.2"/>
        <path d="M28 33L31 28L33 30L36 25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
      </g>
    </svg>
  </div>
);

const FreelancerIcon = () => (
  <div className="creators-icon group w-5 h-5 flex-shrink-0 -mt-0.5">
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <g className="origin-center transition-transform duration-500 group-hover:rotate-[360deg]">
        {/* Hammer head */}
        <rect x="12" y="10" width="24" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Handle */}
        <rect x="21" y="20" width="6" height="24" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Handle grip */}
        <line x1="22" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="22" y1="37" x2="26" y2="37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  </div>
);

const getAccountTypeIcon = (userType?: 'artist' | 'creator' | 'freelancer' | 'business') => {
  switch (userType) {
    case 'artist':
      return <ArtistIcon />;
    case 'creator':
      return <CreatorIcon />;
    case 'freelancer':
      return <FreelancerIcon />;
    case 'business':
      return <BrandIcon />;
    default:
      return <CreatorIcon />; // Default to creator icon
  }
};

export function ProfileView({ 
  userProfile, 
  cachedProfilePic, 
  onBack,
  onUpdateProfile,
  isEditing: _isEditing = false,
  setIsEditing: _setIsEditing,
  onEditProfile,
  appliedTheme: _appliedTheme = 'dark'
}: ProfileViewProps) {
  const [bannerHovered, setBannerHovered] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [_bio, _setBio] = useState(userProfile?.bio || '');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const { t } = useTranslation();
  
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const profilePicUrl = userProfile?.profile_picture_url;
  const displayPic = cachedProfilePic || (profilePicUrl && !profilePicUrl.startsWith('blob:') ? profilePicUrl : null);
  
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return t('profile.joinedRecently');
    const date = new Date(dateString);
    return `${t('profile.joined')} ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  const handleBannerClick = () => {
    bannerInputRef.current?.click();
  };

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProfile) {
      // Show immediate preview
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
      setIsBannerUploading(true);
      
      try {
        await onUpdateProfile({ banner: file });
        console.log('✅ Banner uploaded successfully');
        // Clear preview immediately after successful upload
        setBannerPreview(null);
      } catch (err) {
        console.error('❌ Banner upload failed:', err);
        // Revert preview on error
        setBannerPreview(null);
      } finally {
        setIsBannerUploading(false);
      }
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProfile) {
      // Show immediate preview
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setIsAvatarUploading(true);
      
      try {
        await onUpdateProfile({ profile_picture: file });
        console.log('✅ Profile picture uploaded successfully');
      } catch (err) {
        console.error('❌ Profile picture upload failed:', err);
        // Revert preview on error
        setAvatarPreview(null);
      } finally {
        setIsAvatarUploading(false);
      }
    }
  };

  const tabs = [
    { id: 'overview', label: t('profile.overview') },
    { id: 'reviews', label: t('profile.reviews') },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)' }}>
        <div className="relative flex items-center justify-center px-4 py-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="absolute left-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            </button>
          )}
          <h1 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
            {userProfile?.first_name && userProfile?.last_name 
              ? `${userProfile.first_name} ${userProfile.last_name}`
              : t('profile.yourProfile')}
          </h1>
        </div>
      </div>

      {/* Banner */}
      <div 
        className="relative h-48 cursor-pointer group"
        style={{ backgroundColor: 'transparent' }}
        onMouseEnter={() => setBannerHovered(true)}
        onMouseLeave={() => setBannerHovered(false)}
        onClick={handleBannerClick}
      >
        {(bannerPreview || userProfile?.banner_url) && (
          <img
            src={bannerPreview || userProfile?.banner_url}
            alt="Banner"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        )}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${bannerHovered || isBannerUploading ? 'opacity-100' : 'opacity-0'}`}>
          {isBannerUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('common.uploading')}</span>
            </div>
          ) : (
            <Camera className="w-8 h-8" style={{ color: 'var(--text-primary)' }} />
          )}
        </div>
        <input 
          type="file" 
          ref={bannerInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleBannerChange}
        />
      </div>

      {/* Profile Info */}
      <div className="px-6 pb-6 relative">
        {/* Avatar */}
        <div 
          className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-[#111111] overflow-hidden cursor-pointer group"
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          onClick={handleAvatarClick}
        >
          <img
            src={avatarPreview || displayPic || DEFAULT_AVATAR_DATA_URI}
            alt="Profile"
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${avatarHovered || isAvatarUploading ? 'opacity-100' : 'opacity-0'}`}>
            {isAvatarUploading ? (
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{t('common.uploading')}</span>
              </div>
            ) : (
              <Camera className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            )}
          </div>
          <input 
            type="file" 
            ref={avatarInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Edit Profile Button */}
        <div className="flex justify-end pt-3">
          <button 
            onClick={onEditProfile}
            className="px-5 py-2 rounded-xl font-semibold text-sm hover:brightness-110 transition-all border"
            style={{ backgroundColor: 'transparent', borderColor: '#2f2f2f', color: 'var(--text-primary)' }}
          >
            {t('profile.editProfile')}
          </button>
        </div>

        {/* Name & Username */}
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>
              {userProfile?.first_name && userProfile?.last_name 
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : t('profile.yourName')}
            </h2>
            {getAccountTypeIcon(userProfile?.user_type)}
          </div>
          <p style={{ color: 'var(--text-primary)' }}>@{userProfile?.username || 'username'}</p>
        </div>

        {/* Bio */}
        <p className="mt-3" style={{ color: 'var(--text-primary)' }}>{userProfile?.bio || t('profile.noBio')}</p>

        {/* Location & Join Date */}
        <div className="flex items-center gap-4 mt-3" style={{ color: 'var(--text-primary)' }}>
          {userProfile?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{userProfile.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatJoinDate(userProfile?.created_at)}</span>
          </div>
        </div>

              </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: '#1a1a1a' }}>
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 py-4 text-center hover:bg-white/5 transition-colors relative"
            >
              <span style={{ color: 'var(--text-primary)', fontWeight: activeTab === tab.id ? 600 : 400, opacity: activeTab === tab.id ? 1 : 0.6 }}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full" style={{ backgroundColor: '#FFFFFF' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">
        {activeTab === 'overview' ? (
          <div style={{ color: 'var(--text-primary)' }}>
            <p className="text-center py-8" style={{ color: 'var(--text-primary)' }}>
              {t('profile.noContent')}
            </p>
          </div>
        ) : (
          <div style={{ color: 'var(--text-primary)' }}>
            <h3 className="font-semibold text-lg mb-4">{t('profile.reviews')}</h3>
            <div className="text-center py-8" style={{ color: 'var(--text-primary)' }}>
              <p>{t('profile.noReviews')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
