import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserSilhouetteIcon } from './UserSilhouetteIcon';
import { PuzzlePiecesIcon } from './PuzzlePiecesIcon';
import { CreditCardIcon } from './CreditCardIcon';
import { BellIcon } from './BellIcon';
import { DisplayIcon } from './DisplayIcon';
import { LanguageIcon } from './LanguageIcon';
import { SendFeedbackIcon } from './SendFeedbackIcon';
import { GuidebookIcon } from './GuidebookIcon';
import { LogOutIcon } from './LogOutIcon';

interface SettingsViewProps {
  renderPersonalInfo: () => React.ReactNode;
  renderConnectedAccounts: () => React.ReactNode;
  renderAccountType: () => React.ReactNode;
  renderPayoutMethods: () => React.ReactNode;
  renderDisplay: () => React.ReactNode;
  renderLanguages: () => React.ReactNode;
  renderNotifications: () => React.ReactNode;
  renderSendFeedback: () => React.ReactNode;
  renderGuides?: () => React.ReactNode;
  renderLogOut: () => React.ReactNode;
  isMobile?: boolean;
  onBack?: () => void;
  userType?: string;
  appliedTheme?: 'light' | 'grey' | 'dark' | 'rose';
}

// Account Type Icon Component
const AccountTypeIcon = () => (
  <div className="group">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
      {/* Card A */}
      <g className="transition-all duration-300 group-hover:rotate-[-5deg] group-hover:-translate-x-0.5 origin-center">
        <rect x="5" y="3" width="9" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" transform="rotate(-10 9.5 9.5)" />
        <text x="8.5" y="11" fill="currentColor" fontSize="6" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" fontFamily="system-ui, sans-serif" transform="rotate(-10 8.5 11)">A</text>
      </g>
      {/* Card B */}
      <g className="transition-all duration-300 group-hover:rotate-[5deg] group-hover:translate-x-0.5 origin-center">
        <rect x="10" y="5" width="9" height="13" rx="1" fill="rgba(0,0,0,0.6)" stroke="currentColor" strokeWidth="1.5" transform="rotate(10 14.5 11.5)" />
        <text x="15.5" y="13" fill="currentColor" fontSize="6" fontWeight="bold" textAnchor="middle" dominantBaseline="middle" fontFamily="system-ui, sans-serif" transform="rotate(10 15.5 13)">B</text>
      </g>
    </svg>
  </div>
);

// Settings menu items with translation keys and animated icons
const settingsMenuItems = [
  { id: 'personal', labelKey: 'settings.personalInfo', IconComponent: UserSilhouetteIcon },
  { id: 'accounts', labelKey: 'settings.connectedAccounts', IconComponent: PuzzlePiecesIcon },
  { id: 'accountType', labelKey: 'settings.accountType', IconComponent: AccountTypeIcon },
  { id: 'payout', labelKey: 'settings.paymentMethod', IconComponent: CreditCardIcon },
  { id: 'display', labelKey: 'settings.display', IconComponent: DisplayIcon },
  { id: 'languages', labelKey: 'settings.languages', IconComponent: LanguageIcon },
  { id: 'notifications', labelKey: 'settings.notifications', IconComponent: BellIcon },
  { id: 'feedback', labelKey: 'settings.sendFeedback', IconComponent: SendFeedbackIcon },
  { id: 'guides', labelKey: 'settings.guides', IconComponent: GuidebookIcon },
  { id: 'logout', labelKey: 'settings.logOut', IconComponent: LogOutIcon },
];

// Admin settings menu items (only Display and Log out)
const adminSettingsMenuItems = [
  { id: 'display', labelKey: 'settings.display', IconComponent: DisplayIcon },
  { id: 'logout', labelKey: 'settings.logOut', IconComponent: LogOutIcon },
];

function SettingsMenuItem({ 
  label, 
  labelKey,
  IconComponent, 
  onClick, 
  isActive,
  showBorder = true 
}: { 
  label?: string;
  labelKey?: string; 
  IconComponent: React.ComponentType<{ isHovered?: boolean }>;
  onClick?: () => void;
  isActive?: boolean;
  showBorder?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useTranslation();
  const displayLabel = labelKey ? t(labelKey) : label || '';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center gap-4 px-4 py-4 cursor-pointer transition-colors ${
        isActive ? 'bg-white/5' : 'hover:bg-white/5'
      } ${showBorder ? 'border-b border-[#2f2f2f]' : ''}`}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        <IconComponent isHovered={isHovered} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px]" style={{ color: '#F8FAFC' }}>{displayLabel}</div>
      </div>
      <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#CBD5E1' }} />
    </div>
  );
}

export function SettingsView({ 
  renderPersonalInfo, 
  renderConnectedAccounts, 
  renderAccountType,
  renderPayoutMethods,
  renderDisplay,
  renderLanguages,
  renderNotifications,
  renderSendFeedback,
  renderGuides,
  renderLogOut,
  isMobile = false,
  onBack,
  userType,
  appliedTheme
}: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<string | null>(userType === 'admin' ? 'display' : 'personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDetailView, setMobileDetailView] = useState<string | null>(null);
  const { t } = useTranslation();

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'personal': return t('settings.personalInfo');
      case 'accounts': return t('settings.connectedAccounts');
      case 'accountType': return t('settings.accountType');
      case 'payout': return t('settings.paymentMethod');
      case 'display': return t('settings.display');
      case 'languages': return t('settings.languages');
      case 'notifications': return t('settings.notifications');
      case 'feedback': return t('settings.sendFeedback');
      case 'guides': return t('settings.guides');
      case 'logout': return t('settings.logOut');
      default: return '';
    }
  };

  // Artist icon component (same as "What are you" page)
  const ArtistIcon = () => (
    <div className="w-5 h-5 flex-shrink-0">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M12 28C12 20.268 18.268 14 26 14H22C29.732 14 36 20.268 36 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <rect x="8" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="32" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect x="10" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
        <rect x="34" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
      </svg>
    </div>
  );

  // Creator icon component (same as "What are you" page)
  const CreatorIcon = () => (
    <div className="w-5 h-5 flex-shrink-0">
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

  // Brand icon component (same as "What are you" page)
  const BrandIcon = () => (
    <div className="w-5 h-5 flex-shrink-0">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <rect x="6" y="18" width="36" height="22" rx="3" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M18 18V14C18 12.8954 18.8954 12 20 12H28C29.1046 12 30 12.8954 30 14V18" stroke="currentColor" strokeWidth="2" fill="none"/>
        <rect className="lid" x="6" y="18" width="36" height="8" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
        <rect className="clasp" x="21" y="24" width="6" height="4" rx="1" fill="currentColor"/>
      </svg>
    </div>
  );

  // Account type indicator component
  const AccountTypeIndicator = () => {
    if (!userType) return null;

    const getAccountTypeInfo = (type: string) => {
      switch (type?.toLowerCase()) {
        case 'artist':
          return {
            label: t('accountTypes.artist'),
            icon: ArtistIcon,
            color: 'var(--text-primary)',
            bgColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)'
          };
        case 'creator':
          return {
            label: t('accountTypes.creator'),
            icon: CreatorIcon,
            color: 'var(--text-primary)',
            bgColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)'
          };
        case 'brand':
        case 'business':
          return {
            label: t('accountTypes.brand'),
            icon: BrandIcon,
            color: 'var(--text-primary)',
            bgColor: 'var(--bg-elevated)',
            borderColor: 'var(--border-default)'
          };
        default:
          return null;
      }
    };

    const accountInfo = getAccountTypeInfo(userType);
    if (!accountInfo) return null;

    const Icon = accountInfo.icon;

    return (
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
        style={{ 
          backgroundColor: accountInfo.bgColor,
          color: accountInfo.color,
          borderColor: accountInfo.borderColor
        }}
      >
        <Icon />
        <span>{accountInfo.label}</span>
      </div>
    );
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'personal': return t('settings.personalInfoDesc');
      case 'accounts': return t('settings.connectedAccountsDesc');
      case 'accountType': return t('settings.accountTypeDesc');
      case 'payout': return t('settings.paymentMethodDesc');
      case 'display': return t('settings.displayDesc');
      case 'languages': return t('settings.languagesDesc');
      case 'notifications': return t('settings.notificationsDesc');
      case 'feedback': return t('settings.sendFeedbackDesc');
      case 'guides': return t('settings.guidesDesc');
      case 'logout': return t('settings.logOutDesc');
      default: return '';
    }
  };

  const renderOriginalContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfo();
      case 'accounts':
        return renderConnectedAccounts();
      case 'accountType':
        return renderAccountType();
      case 'payout':
        return renderPayoutMethods();
      case 'display':
        return renderDisplay();
      case 'languages':
        return renderLanguages();
      case 'notifications':
        return renderNotifications();
      case 'feedback':
        return renderSendFeedback();
      case 'guides':
        return renderGuides ? renderGuides() : (
          <div className="px-4 py-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>{t('guides.title')}</h3>
            <p className="text-sm" style={{ color: '#CBD5E1' }}>{t('guides.comingSoon')}</p>
          </div>
        );
      case 'logout':
        return renderLogOut();
      default:
        return null;
    }
  };

  // Mobile view
  if (isMobile) {
    if (mobileDetailView) {
      return (
        <div className="animate-fade-in pb-20">
          {/* Mobile Header with back button */}
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={() => setMobileDetailView(null)}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" style={{ color: '#F8FAFC' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{getSectionTitle()}</h1>
          </div>
          
          {/* Render original content */}
          {renderOriginalContent()}
        </div>
      );
    }

    return (
      <div className="animate-fade-in pb-20">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>{t('settings.title')}</h1>
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" style={{ color: '#CBD5E1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#CBD5E1' }} />
          <input
            type="text"
            placeholder={t('settings.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#3B82F6]"
            style={{ backgroundColor: 'transparent', borderColor: '#2f2f2f', color: '#F8FAFC' }}
            onFocus={(e) => e.target.style.borderColor = '#ffffff'}
            onBlur={(e) => e.target.style.borderColor = '#2f2f2f'}
          />
        </div>

        {/* Menu Items */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'transparent' }}>
          {(userType === 'admin' ? adminSettingsMenuItems : settingsMenuItems).map((item, index) => (
            <SettingsMenuItem
              key={item.id}
              labelKey={item.labelKey}
              IconComponent={item.IconComponent}
              onClick={() => {
                setActiveSection(item.id);
                setMobileDetailView(item.id);
              }}
              showBorder={index < (userType === 'admin' ? adminSettingsMenuItems : settingsMenuItems).length - 1}
            />
          ))}
        </div>
      </div>
    );
  }

  // Desktop view - Twitter/X style
  return (
    <div className="flex h-[calc(100vh-2rem)] animate-fade-in">
      {/* Left Panel - Settings Menu */}
      <div className="w-[380px] flex-shrink-0 border-r flex flex-col" style={{ borderColor: '#2f2f2f' }}>
        {/* Header */}
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4" style={{ color: '#F8FAFC' }}>{t('settings.title')}</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#CBD5E1' }} />
            <input
              type="text"
              placeholder={t('settings.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border rounded-full py-2.5 pl-10 pr-4 text-[15px] focus:outline-none focus:border-[#3B82F6]"
              style={{ borderColor: '#2f2f2f', color: '#F8FAFC' }}
              onFocus={(e) => e.target.style.borderColor = '#ffffff'}
              onBlur={(e) => e.target.style.borderColor = '#2f2f2f'}
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          {(userType === 'admin' ? adminSettingsMenuItems : settingsMenuItems).map((item, index) => (
            <SettingsMenuItem
              key={item.id}
              labelKey={item.labelKey}
              IconComponent={item.IconComponent}
              onClick={() => setActiveSection(item.id)}
              isActive={activeSection === item.id}
              showBorder={index < (userType === 'admin' ? adminSettingsMenuItems : settingsMenuItems).length - 1}
            />
          ))}
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection && (
          <>
            {/* Section Header */}
            <div className="p-6 border-b" style={{ borderColor: '#2f2f2f' }}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold" style={{ color: '#F8FAFC' }}>{getSectionTitle()}</h2>
                <AccountTypeIndicator />
              </div>
              <p className="text-[15px] leading-relaxed" style={{ color: '#CBD5E1' }}>{getSectionDescription()}</p>
            </div>

            {/* Original Content */}
            <div className="p-6">
              {renderOriginalContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
