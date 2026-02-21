import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MoreViewProps {
  isMobile?: boolean;
}

// More menu items with descriptions and icons
const moreMenuItems = [
  {
    id: 'appearance',
    label: 'Switch appearance',
    description: 'Customize your theme and display preferences.',
    IconComponent: ({ isHovered, isActive }: { isHovered?: boolean; isActive?: boolean }) => {
      const shouldAnimate = isHovered || isActive;
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M24 2v4M24 42v4M8.44 8.44l2.84 2.84M36.72 36.72l2.84 2.84M2 24h4M42 24h4M8.44 39.56l2.84-2.84M36.72 11.28l2.84-2.84" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="4" fill="currentColor" style={{ opacity: shouldAnimate ? 0.8 : 0.3, transition: 'opacity 0.3s ease' }}/>
        </svg>
      );
    },
  },
  {
    id: 'feedback',
    label: 'Send feedback',
    description: 'Share your thoughts and suggestions to help us improve.',
    IconComponent: ({ isHovered, isActive }: { isHovered?: boolean; isActive?: boolean }) => {
      const shouldAnimate = isHovered || isActive;
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <path d="M8 12L24 4L40 12V32C40 34.2 38.2 36 36 36H12C9.8 36 8 34.2 8 32V12Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M16 20H32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: shouldAnimate ? 1 : 0.5, transition: 'opacity 0.3s ease' }}/>
          <path d="M16 26H28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ opacity: shouldAnimate ? 1 : 0.5, transition: 'opacity 0.3s ease' }}/>
        </svg>
      );
    },
  },
  {
    id: 'report',
    label: 'Report a problem',
    description: 'Help us improve by reporting issues or suggesting features.',
    IconComponent: ({ isHovered, isActive }: { isHovered?: boolean; isActive?: boolean }) => {
      const shouldAnimate = isHovered || isActive;
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M24 14v12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="24" cy="32" r="2" fill="currentColor" style={{ opacity: shouldAnimate ? 1 : 0.3, transition: 'opacity 0.3s ease' }}/>
        </svg>
      );
    },
  },
  {
    id: 'logout',
    label: 'Log out',
    description: 'Sign out of your account and return to the login page.',
    IconComponent: ({ isHovered, isActive }: { isHovered?: boolean; isActive?: boolean }) => {
      const shouldAnimate = isHovered || isActive;
      return (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
          <path d="M18 42H10a4 4 0 01-4-4V10a4 4 0 014-4h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M32 16L40 24L32 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: shouldAnimate ? 1 : 0.7, transition: 'opacity 0.3s ease' }}/>
          <path d="M40 24H18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    },
  },
];

function MoreMenuItem({ 
  label, 
  IconComponent, 
  onClick, 
  isActive,
  showBorder = true 
}: { 
  label: string; 
  IconComponent: React.ComponentType<{ isHovered?: boolean; isActive?: boolean }>;
  onClick?: () => void;
  isActive?: boolean;
  showBorder?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={(e) => { setIsHovered(true); (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-elevated)'; }}
      onMouseLeave={(e) => { setIsHovered(false); (e.currentTarget as HTMLElement).style.backgroundColor = ''; }}
      className={`flex items-center gap-4 px-4 py-4 cursor-pointer transition-colors ${showBorder ? 'border-b' : ''}`}
      style={{ borderColor: showBorder ? 'var(--border-subtle)' : undefined }}
    >
      <div className="w-6 h-6 flex items-center justify-center">
        <IconComponent isHovered={isHovered} isActive={isActive} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px]" style={{ color: 'var(--text-primary)' }}>{label}</div>
      </div>
      <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-primary)' }} />
    </div>
  );
}

export function MoreView({ isMobile: _isMobile = false }: MoreViewProps) {
  const [activeSection, setActiveSection] = useState<string>('appearance');
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'appearance':
        return 'Switch appearance';
      case 'feedback':
        return 'Send feedback';
      case 'report':
        return 'Report a problem';
      case 'logout':
        return 'Log out';
      default:
        return '';
    }
  };

  const getSectionDescription = () => {
    switch (activeSection) {
      case 'appearance':
        return 'Customize your theme and display preferences.';
      case 'feedback':
        return 'Share your thoughts and suggestions to help us improve.';
      case 'report':
        return 'Help us improve by reporting issues or suggesting features.';
      case 'logout':
        return 'Sign out of your account and return to the login page.';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Theme</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Dark mode</span>
                  <input type="radio" name="theme" defaultChecked className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                </label>
                <label className="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Light mode</span>
                  <input type="radio" name="theme" className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                </label>
                <label className="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>System</span>
                  <input type="radio" name="theme" className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                </label>
              </div>
            </div>
            
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Display</h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Compact view</span>
                  <input type="checkbox" className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                </label>
                <label className="flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>Show animations</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                </label>
              </div>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-6">
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Share your feedback</h3>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We'd love to hear your thoughts and suggestions to improve your experience.
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                  <input type="radio" name="feedback-type" defaultChecked className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                  <span style={{ color: 'var(--text-primary)' }}>General feedback</span>
                </label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                  <input type="radio" name="feedback-type" className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                  <span style={{ color: 'var(--text-primary)' }}>Feature suggestion</span>
                </label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors" style={{ borderColor: 'var(--border-subtle)' }}>
                  <input type="radio" name="feedback-type" className="w-4 h-4" style={{ accentColor: '#3B82F6' }} />
                  <span style={{ color: 'var(--text-primary)' }}>User experience</span>
                </label>
              </div>
            </div>
            
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Your feedback</h3>
              <textarea 
                className="w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:border-[#3B82F6]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                rows={6}
                placeholder="Share your thoughts, suggestions, or ideas..."
              />
              <button className="mt-4 px-6 py-2.5 rounded-full font-medium transition-colors" style={{ backgroundColor: '#3B82F6', color: 'white' }}>
                Send feedback
              </button>
            </div>
          </div>
        );

      case 'report':
        return (
          <div className="space-y-6">
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>What issue are you experiencing?</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 rounded-lg border transition-colors" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                  Bug report
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border transition-colors" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                  Feature request
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg border transition-colors" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}>
                  General feedback
                </button>
              </div>
            </div>
            
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Additional details</h3>
              <textarea 
                className="w-full px-4 py-3 rounded-lg border resize-none focus:outline-none focus:border-[#3B82F6]"
                style={{ backgroundColor: 'var(--bg-input)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                rows={6}
                placeholder="Describe your issue in detail..."
              />
              <button className="mt-4 px-6 py-2.5 rounded-full font-medium transition-colors" style={{ backgroundColor: '#3B82F6', color: 'white' }}>
                Submit report
              </button>
            </div>
          </div>
        );
      
      case 'logout':
        return (
          <div className="space-y-6">
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Are you sure you want to log out?</h3>
              <p className="mb-6" style={{ color: 'var(--text-primary)' }}>
                You'll need to sign in again to access your account.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={handleLogout}
                  className="px-6 py-2.5 rounded-full font-medium transition-colors" 
                  style={{ backgroundColor: '#EF4444', color: 'white' }}
                >
                  Log out
                </button>
                <button 
                  className="px-6 py-2.5 rounded-full font-medium border transition-colors hover:bg-white/5" 
                  style={{ borderColor: '#2f2f2f', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Desktop view - Twitter/X style split screen
  return (
    <div className="flex h-[calc(100vh-2rem)] animate-fade-in">
      {/* Left Panel - More Menu */}
      <div className="w-[380px] flex-shrink-0 border-r flex flex-col" style={{ borderColor: '#1a1a1a' }}>
        {/* Header */}
        <div className="p-4">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>More</h1>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          {moreMenuItems.map((item, index) => (
            <MoreMenuItem
              key={item.id}
              label={item.label}
              IconComponent={item.IconComponent}
              onClick={() => setActiveSection(item.id)}
              isActive={activeSection === item.id}
              showBorder={index < moreMenuItems.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection && (
          <>
            {/* Section Header */}
            <div className="p-6 border-b" style={{ borderColor: '#1a1a1a' }}>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{getSectionTitle()}</h2>
              <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{getSectionDescription()}</p>
            </div>

            {/* Content */}
            <div className="p-6">
              {renderContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MoreView;
