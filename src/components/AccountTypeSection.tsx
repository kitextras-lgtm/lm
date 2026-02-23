import { useTranslation } from 'react-i18next';

interface AccountTypeSectionProps {
  userType?: string;
}

export function AccountTypeSection({ userType }: AccountTypeSectionProps) {
  const { t } = useTranslation();
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

  const FreelancerIcon = () => (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
      <g className="origin-center">
        <rect x="12" y="10" width="24" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/>
        <rect x="21" y="20" width="6" height="24" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="22" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="22" y1="37" x2="26" y2="37" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </g>
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Current Account Type */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('accountType.currentAccountType')}</h3>
        <div className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-center">
            {normalizedUserType === 'artist' && <ArtistIcon />}
            {normalizedUserType === 'creator' && <CreatorIcon />}
            {normalizedUserType === 'freelancer' && <FreelancerIcon />}
            {(normalizedUserType === 'brand' || normalizedUserType === 'business') && <BrandIcon />}
          </div>
          <div>
            <p className="font-medium text-lg" style={{ color: 'var(--text-primary)' }}>
              {normalizedUserType === 'artist' ? t('accountTypes.artist') : normalizedUserType === 'creator' ? t('accountTypes.creator') : normalizedUserType === 'freelancer' ? t('accountTypes.freelancer') : normalizedUserType === 'brand' || normalizedUserType === 'business' ? t('accountTypes.brand') : t('accountType.unknown')}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {normalizedUserType === 'artist' && t('accountType.artistDesc')}
              {normalizedUserType === 'creator' && t('accountType.creatorDesc')}
              {normalizedUserType === 'freelancer' && t('accountType.freelancerDesc')}
              {(normalizedUserType === 'brand' || normalizedUserType === 'business') && t('accountType.brandDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Account Status and Policy Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Status */}
        <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: 'var(--text-primary)' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>Account Status</p>
            <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Healthy</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>No policy violations</p>
          </div>
        </div>

        {/* Policy Warnings */}
        <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: 'var(--text-primary)' }}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="17" r="1" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>Policy Warnings</p>
            <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>0 warnings</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>Compliant with Terms of Service</p>
          </div>
        </div>
      </div>
    </div>
  );
}
