interface AnimatedIconProps {
  className?: string;
}

const CraftsmanshipIcon = ({ className }: AnimatedIconProps) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${className || ''}`}>
    <g className="origin-center">
      {/* Hammer head */}
      <rect x="12" y="10" width="24" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Handle */}
      <rect x="21" y="20" width="6" height="24" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
      {/* Handle grip */}
      <line x1="22" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="22" y1="37" x2="26" y2="37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </g>
  </svg>
);

interface AccountTypeSectionProps {
  userType?: string;
}

export function AccountTypeSection({ userType }: AccountTypeSectionProps) {
  // Normalize userType to lowercase for consistent comparison
  const normalizedUserType = userType?.toLowerCase();
  // Account type icons
  const ArtistIcon = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
      <path d="M12 28C12 20.268 18.268 14 26 14H22C29.732 14 36 20.268 36 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
      <rect x="8" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="32" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="10" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      <rect x="34" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
    </svg>
  );

  const CreatorIcon = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
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
  );

  const BrandIcon = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
      <rect x="6" y="18" width="36" height="22" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M18 18V14C18 12.8954 18.8954 12 20 12H28C29.1046 12 30 12.8954 30 14V18" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect className="lid" x="6" y="18" width="36" height="8" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
      <rect className="clasp" x="21" y="24" width="6" height="4" rx="1" fill="currentColor"/>
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Current Account Type */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>Current Account Type</h3>
        <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            {normalizedUserType === 'artist' && <ArtistIcon />}
            {normalizedUserType === 'creator' && <CreatorIcon />}
            {(normalizedUserType === 'brand' || normalizedUserType === 'business') && <BrandIcon />}
          </div>
          <div>
            <p className="font-medium text-lg" style={{ color: '#F8FAFC' }}>
              {normalizedUserType === 'artist' ? 'Artist' : normalizedUserType === 'creator' ? 'Creator' : normalizedUserType === 'brand' || normalizedUserType === 'business' ? 'Brand' : 'Unknown'}
            </p>
            <p className="text-sm" style={{ color: '#CBD5E1' }}>
              {normalizedUserType === 'artist' && 'Musicians and Artists'}
              {normalizedUserType === 'creator' && 'Content Creators, YouTubers, Influencers'}
              {(normalizedUserType === 'brand' || normalizedUserType === 'business') && 'Companies and Businesses'}
            </p>
          </div>
        </div>
      </div>

      {/* Need to Change Account Type */}
      <div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: '#F8FAFC' }}>Are you a freelancer?</h3>
        <p className="text-sm mb-4" style={{ color: '#CBD5E1' }}>
          To gain a freelancer role, please apply below.
        </p>
        </div>

      {/* Duplicate Account Type Section */}
      <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          {normalizedUserType === 'artist' && <ArtistIcon />}
          {normalizedUserType === 'creator' && <CraftsmanshipIcon />}
          {(normalizedUserType === 'brand' || normalizedUserType === 'business') && <BrandIcon />}
        </div>
        <div>
          <p className="font-medium text-lg" style={{ color: '#F8FAFC' }}>
            {normalizedUserType === 'artist' ? 'Artist' : normalizedUserType === 'creator' ? 'Freelancer' : normalizedUserType === 'brand' || normalizedUserType === 'business' ? 'Brand' : 'Unknown'}
          </p>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>
            {normalizedUserType === 'artist' && 'Musicians and Artists'}
            {normalizedUserType === 'creator' && 'For those who specialize in providing services'}
            {(normalizedUserType === 'brand' || normalizedUserType === 'business') && 'Companies and Businesses'}
          </p>
        </div>
      </div>
    </div>
  );
}
