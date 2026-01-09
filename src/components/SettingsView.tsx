import { useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import { UserSilhouetteIcon } from './UserSilhouetteIcon';
import { PuzzlePiecesIcon } from './PuzzlePiecesIcon';
import { CreditCardIcon } from './CreditCardIcon';
import { BellIcon } from './BellIcon';
import { DisplayIcon } from './DisplayIcon';
import { LanguageIcon } from './LanguageIcon';
import { SendFeedbackIcon } from './SendFeedbackIcon';
import { LogOutIcon } from './LogOutIcon';

interface SettingsViewProps {
  renderPersonalInfo: () => React.ReactNode;
  renderConnectedAccounts: () => React.ReactNode;
  renderPayoutMethods: () => React.ReactNode;
  renderDisplay: () => React.ReactNode;
  renderLanguages: () => React.ReactNode;
  renderNotifications: () => React.ReactNode;
  renderSendFeedback: () => React.ReactNode;
  renderLogOut: () => React.ReactNode;
  isMobile?: boolean;
  onBack?: () => void;
}

// Settings menu items with descriptions and animated icons
const settingsMenuItems = [
  {
    id: 'personal',
    label: 'Personal info',
    IconComponent: UserSilhouetteIcon,
  },
  {
    id: 'accounts',
    label: 'Connected accounts',
    IconComponent: PuzzlePiecesIcon,
  },
  {
    id: 'payout',
    label: 'Payment method',
    IconComponent: CreditCardIcon,
  },
  {
    id: 'display',
    label: 'Display',
    IconComponent: DisplayIcon,
  },
  {
    id: 'languages',
    label: 'Languages',
    IconComponent: LanguageIcon,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    IconComponent: BellIcon,
  },
  {
    id: 'feedback',
    label: 'Send feedback',
    IconComponent: SendFeedbackIcon,
  },
  {
    id: 'logout',
    label: 'Log out',
    IconComponent: LogOutIcon,
  },
];

function SettingsMenuItem({ 
  label, 
  IconComponent, 
  onClick, 
  isActive,
  showBorder = true 
}: { 
  label: string; 
  IconComponent: React.ComponentType<{ isHovered?: boolean }>;
  onClick?: () => void;
  isActive?: boolean;
  showBorder?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

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
        <div className="text-[15px]" style={{ color: '#F8FAFC' }}>{label}</div>
      </div>
      <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: '#94A3B8' }} />
    </div>
  );
}

export function SettingsView({ 
  renderPersonalInfo, 
  renderConnectedAccounts, 
  renderPayoutMethods,
  renderDisplay,
  renderLanguages,
  renderNotifications,
  renderSendFeedback,
  renderLogOut,
  isMobile = false,
  onBack
}: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileDetailView, setMobileDetailView] = useState<string | null>(null);

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'personal':
        return 'Personal info';
      case 'accounts':
        return 'Connected accounts';
      case 'payout':
        return 'Payment method';
      case 'display':
        return 'Display';
      case 'languages':
        return 'Languages';
      case 'notifications':
        return 'Notifications';
      case 'feedback':
        return 'Send feedback';
      case 'logout':
        return 'Log out';
      default:
        return '';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'personal':
        return 'See information about your account, download an archive of your data, or learn about your account deactivation options.';
      case 'accounts':
        return 'Manage your connected social media accounts and third-party integrations.';
      case 'payout':
        return 'Manage your payment methods and payout settings.';
      case 'display':
        return 'Customize your display preferences and appearance settings.';
      case 'languages':
        return 'Set your language preferences and regional settings.';
      case 'notifications':
        return 'Select the kinds of notifications you get about your activities and recommendations.';
      case 'feedback':
        return 'Help us improve the platform by sharing your feedback and suggestions.';
      case 'logout':
        return 'Sign out of your account and return to the login page.';
      default:
        return '';
    }
  };

  const renderOriginalContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfo();
      case 'accounts':
        return renderConnectedAccounts();
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
          <h1 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>Settings</h1>
          {onBack && (
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" style={{ color: '#94A3B8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search Settings"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#3B82F6]"
            style={{ backgroundColor: 'transparent', borderColor: '#2f2f2f', color: '#F8FAFC' }}
          />
        </div>

        {/* Menu Items */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'transparent' }}>
          {settingsMenuItems.map((item, index) => (
            <SettingsMenuItem
              key={item.id}
              label={item.label}
              IconComponent={item.IconComponent}
              onClick={() => {
                setActiveSection(item.id);
                setMobileDetailView(item.id);
              }}
              showBorder={index < settingsMenuItems.length - 1}
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
          <h1 className="text-xl font-bold mb-4" style={{ color: '#F8FAFC' }}>Settings</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search Settings"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border rounded-full py-2.5 pl-10 pr-4 text-[15px] focus:outline-none focus:border-[#3B82F6]"
              style={{ borderColor: '#2f2f2f', color: '#F8FAFC' }}
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          {settingsMenuItems.map((item, index) => (
            <SettingsMenuItem
              key={item.id}
              label={item.label}
              IconComponent={item.IconComponent}
              onClick={() => setActiveSection(item.id)}
              isActive={activeSection === item.id}
              showBorder={index < settingsMenuItems.length - 1}
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
              <h2 className="text-xl font-bold mb-2" style={{ color: '#F8FAFC' }}>{getSectionTitle()}</h2>
              <p className="text-[15px] leading-relaxed" style={{ color: '#94A3B8' }}>{getSectionDescription()}</p>
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
