import { useState, useRef } from 'react';
import { Camera, MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { DEFAULT_AVATAR_DATA_URI } from './DefaultAvatar';

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
  } | null;
  cachedProfilePic?: string | null;
  onBack?: () => void;
  onUpdateProfile?: (updates: { profile_picture?: File; banner?: File; bio?: string }) => void;
  isEditing?: boolean;
  setIsEditing?: (editing: boolean) => void;
}

export function ProfileView({ 
  userProfile, 
  cachedProfilePic, 
  onBack,
  onUpdateProfile,
  isEditing = false,
  setIsEditing
}: ProfileViewProps) {
  const [bannerHovered, setBannerHovered] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'replies' | 'highlights' | 'articles' | 'media' | 'likes'>('posts');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const profilePicUrl = userProfile?.profile_picture_url;
  const displayPic = cachedProfilePic || (profilePicUrl && !profilePicUrl.startsWith('blob:') ? profilePicUrl : null);
  
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Joined recently';
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
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
    { id: 'posts', label: 'Posts' },
    { id: 'replies', label: 'Replies' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'articles', label: 'Articles' },
    { id: 'media', label: 'Media' },
    { id: 'likes', label: 'Likes' },
  ];

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#111111]/80 backdrop-blur-md border-b border-[#1a1a1a]">
        <div className="flex items-center gap-6 px-4 py-3">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: '#F8FAFC' }} />
            </button>
          )}
          <div>
            <h1 className="font-bold text-xl" style={{ color: '#F8FAFC' }}>
              {userProfile?.first_name && userProfile?.last_name 
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : 'Your Profile'}
            </h1>
            <p className="text-sm" style={{ color: '#94A3B8' }}>0 posts</p>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div 
        className="relative h-48 cursor-pointer group border"
        style={{ backgroundColor: 'transparent', borderColor: '#2f2f2f' }}
        onMouseEnter={() => setBannerHovered(true)}
        onMouseLeave={() => setBannerHovered(false)}
        onClick={handleBannerClick}
      >
        {(bannerPreview || userProfile?.banner_url) && (
          <img 
            src={bannerPreview || userProfile?.banner_url} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        )}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${bannerHovered || isBannerUploading ? 'opacity-100' : 'opacity-0'}`}>
          {isBannerUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm" style={{ color: '#F8FAFC' }}>Uploading...</span>
            </div>
          ) : (
            <Camera className="w-8 h-8" style={{ color: '#F8FAFC' }} />
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
          />
          <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${avatarHovered || isAvatarUploading ? 'opacity-100' : 'opacity-0'}`}>
            {isAvatarUploading ? (
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-xs" style={{ color: '#F8FAFC' }}>Uploading...</span>
              </div>
            ) : (
              <Camera className="w-6 h-6" style={{ color: '#F8FAFC' }} />
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
            onClick={() => setIsEditing?.(!isEditing)}
            className="px-5 py-2 rounded-xl font-semibold text-sm hover:brightness-110 transition-all border"
            style={{ backgroundColor: 'transparent', borderColor: '#2f2f2f', color: '#F8FAFC' }}
          >
            Edit profile
          </button>
        </div>

        {/* Name & Username */}
        <div className="mt-12">
          <h2 className="font-bold text-xl" style={{ color: '#F8FAFC' }}>
            {userProfile?.first_name && userProfile?.last_name 
              ? `${userProfile.first_name} ${userProfile.last_name}`
              : 'Your Name'}
          </h2>
          <p style={{ color: '#64748B' }}>@{userProfile?.username || 'username'}</p>
        </div>

        {/* Bio */}
        <p className="mt-3" style={{ color: '#F8FAFC' }}>{userProfile?.bio || 'No bio yet.'}</p>

        {/* Location & Join Date */}
        <div className="flex items-center gap-4 mt-3" style={{ color: '#94A3B8' }}>
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

        {/* Following/Followers */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1">
            <span className="font-bold" style={{ color: '#F8FAFC' }}>0</span>
            <span style={{ color: '#94A3B8' }}>Following</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold" style={{ color: '#F8FAFC' }}>0</span>
            <span style={{ color: '#94A3B8' }}>Followers</span>
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
              <span style={{ color: activeTab === tab.id ? '#F8FAFC' : '#94A3B8', fontWeight: activeTab === tab.id ? 600 : 400 }}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full" style={{ backgroundColor: '#3B82F6' }} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8 text-center" style={{ color: '#94A3B8' }}>
        <p>No content yet.</p>
      </div>
    </div>
  );
}
