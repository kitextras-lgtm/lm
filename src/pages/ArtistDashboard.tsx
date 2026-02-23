import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SuggestionIcon, BugReportIcon, FeatureRequestIcon, OtherIcon } from '../components/FeedbackIcons';
import { BetaBadge } from '../components/BetaBadge';
import { SocialLinksForm } from '../components/SocialLinksForm';
import { ReferralSection } from '../components/ReferralSection';
import { DoorTransition } from '../components/DoorTransition';
import { MessagesPage } from './MessagesPage';
import { EditIcon } from '../components/EditIcon';
import { UserSilhouetteIcon } from '../components/UserSilhouetteIcon';
import { PuzzlePiecesIcon } from '../components/PuzzlePiecesIcon';
import { CreditCardIcon } from '../components/CreditCardIcon';
import { BellIcon } from '../components/BellIcon';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';
import { useCustomerConversations } from '../hooks/useChat';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { DEFAULT_AVATAR_DATA_URI, ELEVATE_ADMIN_AVATAR_URL } from '../components/DefaultAvatar';
import { FeedbackModal } from '../components/FeedbackModal';
import { getCachedImage, preloadAndCacheImage } from '../utils/imageCache';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../contexts/ThemeContext';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { MessageToast } from '../components/MessageToast';
import { TalentIcon } from '../components/TalentIcon';
import { PuzzleDealIcon } from '../components/PuzzleDealIcon';
import { MoreIcon } from '../components/MoreIcon';
import { ExploreIcon } from '../components/ExploreIcon';
import { SettingsIcon } from '../components/SettingsIcon';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ProfileView } from '../components/ProfileView';
import { SettingsView } from '../components/SettingsView';
import { AccountTypeSection } from '../components/AccountTypeSection';
import { ToggleSwitch } from '../components/ToggleSwitch';
import MoreView from '../components/MoreView';
import { useTranslation } from 'react-i18next';
import { LANGUAGE_MAP, LOCALE_TO_NAME } from '../i18n';

function YouTubeIcon({ isHovered }: { isHovered: boolean; backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white' }) {
  return (
    <div className="cursor-pointer flex items-center justify-center">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6">
        <rect 
          x="8" 
          y="12" 
          width="32" 
          height="24" 
          rx="6" 
          stroke={isHovered ? "#FF0000" : 'currentColor'}
          strokeWidth="2.5" 
          fill="none"
          style={{
            transition: "stroke 0.3s ease-in-out",
          }}
        />
        <path
          d="M20 18L32 24L20 30V18Z"
          stroke={isHovered ? "#FF0000" : 'currentColor'}
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill={isHovered ? "#FF0000" : 'currentColor'}
          style={{
            transform: isHovered ? "scale(1.15)" : "scale(1)",
            transformOrigin: "24px 24px",
            transition: "transform 0.3s ease-in-out, stroke 0.3s ease-in-out, fill 0.3s ease-in-out",
          }}
        />
      </svg>
    </div>
  );
}

function TikTokIcon({ isHovered }: { isHovered: boolean; backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white' }) {
  const notePath = "M32 8V28C32 34.6 26.6 40 20 40C13.4 40 8 34.6 8 28C8 21.4 13.4 16 20 16V22C16.7 22 14 24.7 14 28C14 31.3 16.7 34 20 34C23.3 34 26 31.3 26 28V8H32Z";
  const wavePath = "M32 8C32 8 36 9 38 12C40 15 40 18 40 18";

  return (
    <div className="cursor-pointer flex items-center justify-center" style={{ overflow: 'visible' }}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" style={{ overflow: 'visible' }}>
        <g
          style={{
            opacity: isHovered ? 0.5 : 0,
            transform: isHovered ? "translate(-1.5px, -0.5px)" : "translate(0, 0)",
            transition: isHovered ? "all 0.25s ease-in-out" : "all 0.3s ease 0.2s",
          }}
        >
          <path
            d={notePath}
            stroke="#00f7f7"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d={wavePath} stroke="#00f7f7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
        <g
          style={{
            opacity: isHovered ? 0.5 : 0,
            transform: isHovered ? "translate(1.5px, 0.5px)" : "translate(0, 0)",
            transition: isHovered ? "all 0.25s ease-in-out 0.05s" : "all 0.3s ease 0.15s",
          }}
        >
          <path
            d={notePath}
            stroke="#ff2d55"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d={wavePath} stroke="#ff2d55" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
        <g
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
            transformOrigin: "24px 24px",
            transition: "transform 0.3s ease-in-out",
          }}
        >
          <path
            d={notePath}
            stroke='currentColor'
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d={wavePath} stroke='currentColor' strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

function InstagramIconAnimated({ isHovered }: { isHovered: boolean; backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white' }) {
  return (
    <div className="cursor-pointer flex items-center justify-center">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6">
        <defs>
          <linearGradient id="igGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="25%" stopColor="#fa7e1e" />
            <stop offset="50%" stopColor="#d62976" />
            <stop offset="75%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </linearGradient>
        </defs>
        <rect 
          x="10" 
          y="10" 
          width="28" 
          height="28" 
          rx="8" 
          stroke={isHovered ? "url(#igGradient)" : 'currentColor'}
          strokeWidth="2.5" 
          fill="none"
          style={{
            transition: "stroke 0.3s ease-in-out",
          }}
        />
        <circle
          cx="24"
          cy="24"
          r="7"
          stroke={isHovered ? "url(#igGradient)" : 'currentColor'}
          strokeWidth="2.5"
          fill="none"
          style={{
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            transformOrigin: "24px 24px",
            transition: "transform 0.3s ease-in-out, stroke 0.3s ease-in-out",
          }}
        />
        <circle
          cx="32"
          cy="16"
          r="2"
          fill='currentColor'
          style={{
            opacity: isHovered ? 1 : 0.6,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      </svg>
    </div>
  );
}

type SettingsSection = 'personal' | 'accounts' | 'payout' | 'notifications';

interface CampaignData {
  id: string;
  name: string;
  avatar?: string;
  timeAgo: string;
  title: string;
  description: string;
  status: 'Active' | 'Ended' | 'Coming Soon';
  endsIn: string;
  paidOutPercent?: string;
  language: string;
  platforms: ('instagram' | 'tiktok' | 'youtube')[];
  payType: string;
  payout: string;
  rules: string[];
  requiredHashtags?: string[];
}

const CAMPAIGNS: CampaignData[] = [
  {
    id: 'fighter-music',
    name: 'Fighter Music',
    timeAgo: '13d ago',
    title: 'Turn Pain into Power',
    description: 'Fighter Music is a passionate artist turning pain into power, and scars into sound. Create clips showcasing their music and earn your share of the budget!',
    status: 'Active',
    endsIn: '6d',
    paidOutPercent: '87.37%',
    language: 'English',
    platforms: ['instagram', 'tiktok', 'youtube'],
    payType: 'Per view',
    payout: '$1.00 cpm',
    rules: [
      'Allowed Content: Use footage from provided music videos only. No unrelated footage or outside content.',
      'Minimum video length: 15 seconds',
      'Must include audio from the official track',
      'No explicit or inappropriate content'
    ],
    requiredHashtags: ['#FighterMusic', '#ElevateMusic']
  },
  {
    id: 'asta-violina',
    name: 'Asta Violina',
    timeAgo: '13d ago',
    title: 'Classical Meets Modern',
    description: 'Asta Violina brings classical violin to the modern age. Create engaging content featuring their unique sound and earn from every view!',
    status: 'Active',
    endsIn: '10d',
    paidOutPercent: '45.20%',
    language: 'English',
    platforms: ['instagram', 'tiktok', 'youtube'],
    payType: 'Per view',
    payout: '$0.80 cpm',
    rules: [
      'Allowed Content: Use footage from provided music videos only.',
      'Minimum video length: 10 seconds',
      'Must include audio from the official track',
      'Family-friendly content only'
    ],
    requiredHashtags: ['#AstaViolina', '#ClassicalVibes']
  }
];

const OPPORTUNITIES: CampaignData[] = [
  {
    id: 'nova-beats',
    name: 'Nova Beats',
    timeAgo: '5d ago',
    title: 'Future Sound',
    description: 'Nova Beats is pushing the boundaries of electronic music. Create viral content with their tracks and earn from every view!',
    status: 'Active',
    endsIn: '14d',
    paidOutPercent: '23.50%',
    language: 'English',
    platforms: ['instagram', 'tiktok', 'youtube'],
    payType: 'Per view',
    payout: '$1.20 cpm',
    rules: [
      'Allowed Content: Use footage from provided music videos only.',
      'Minimum video length: 10 seconds',
      'Must include audio from the official track',
      'Creative transitions encouraged'
    ],
    requiredHashtags: ['#NovaBeats', '#FutureSound']
  },
  {
    id: 'electronic-vibes',
    name: 'Electronic Vibes',
    timeAgo: '2d ago',
    title: 'Digital Dreams',
    description: 'Electronic Vibes creates immersive electronic experiences. Join their latest campaign and showcase your creativity with cutting-edge sound design!',
    status: 'Active',
    endsIn: '8d',
    paidOutPercent: '15.30%',
    language: 'English',
    platforms: ['instagram', 'tiktok', 'youtube'],
    payType: 'Per view',
    payout: '$1.50 cpm',
    rules: [
      'Allowed Content: Electronic music videos and performances only.',
      'Minimum video length: 20 seconds',
      'Must include audio from the official track',
      'Visual effects and transitions encouraged'
    ],
    requiredHashtags: ['#ElectronicVibes', '#DigitalDreams']
  },
  {
    id: 'urban-beats',
    name: 'Urban Beats',
    timeAgo: '1d ago',
    title: 'Street Culture',
    description: 'Urban Beats brings authentic hip-hop and street culture to life. Create content that captures the essence of urban music and lifestyle!',
    status: 'Active',
    endsIn: '12d',
    paidOutPercent: '8.75%',
    language: 'English',
    platforms: ['instagram', 'tiktok', 'youtube'],
    payType: 'Per view',
    payout: '$0.90 cpm',
    rules: [
      'Allowed Content: Hip-hop and urban music content only.',
      'Minimum video length: 30 seconds',
      'Must include audio from the official track',
      'Street style and authenticity required'
    ],
    requiredHashtags: ['#UrbanBeats', '#StreetCulture']
  }
];

function CampaignDetailModal({ campaign, onClose }: { campaign: CampaignData | null; onClose: () => void; backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white' }) {
  const [showFullRules, setShowFullRules] = useState(false);

  if (!campaign) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl"
        style={{ 
          backgroundColor: 'var(--bg-card)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          animation: 'popOut 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full transition-colors z-10"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: 'var(--text-primary)' }}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>

        {/* Header */}
        <div className="p-7 pb-5">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{campaign.name}</h2>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{campaign.timeAgo}</p>
              <p className="text-base font-medium mt-1.5" style={{ color: 'var(--text-primary)' }}>{campaign.title}</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-7 mb-6 rounded-2xl py-5 px-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="flex items-start">
            <div className="flex-1 text-center" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-primary)' }}>Ends</p>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{campaign.endsIn}</p>
            </div>
            <div className="flex-1 text-center" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-primary)' }}>Language</p>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{campaign.language}</p>
            </div>
            <div className="flex-1 text-center" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p className="text-xs mb-2" style={{ color: 'var(--text-primary)' }}>Platforms</p>
              <div className="flex items-center justify-center gap-2">
                {campaign.platforms.includes('instagram') && (
                  <div className="w-5 h-5">
                    <InstagramIconAnimated isHovered={true} />
                  </div>
                )}
                {campaign.platforms.includes('tiktok') && (
                  <div className="w-5 h-5">
                    <TikTokIcon isHovered={true} />
                  </div>
                )}
                {campaign.platforms.includes('youtube') && (
                  <div className="w-5 h-5">
                    <YouTubeIcon isHovered={true} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 text-center" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-primary)' }}>Pay Type</p>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{campaign.payType}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-primary)' }}>Payout</p>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{campaign.payout}</p>
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="px-7 pb-5">
          <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Details</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{campaign.description}</p>
        </div>

        {/* Rules section */}
        <div className="px-7 pb-5">
          <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Rules</h3>
          <div className={`text-sm leading-relaxed ${!showFullRules ? 'line-clamp-2' : ''}`} style={{ color: 'var(--text-primary)' }}>
            {campaign.rules.map((rule, index) => (
              <p key={index} className="mb-1.5">• {rule}</p>
            ))}
          </div>
          {campaign.rules.length > 1 && (
            <button
              onClick={() => setShowFullRules(!showFullRules)}
              className="text-sm font-semibold mt-3 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              {showFullRules ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* What to include */}
        {campaign.requiredHashtags && campaign.requiredHashtags.length > 0 && (
          <div className="px-7 pb-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>What to include</h3>
            <div className="flex items-start gap-4">
              <svg className="w-6 h-6 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <div>
                <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>Caption, tags, text</p>
                <p className="text-xs font-semibold mt-2" style={{ color: 'var(--text-primary)' }}>REQUIRED HASHTAGS</p>
                <p className="text-sm mt-1.5" style={{ color: 'var(--text-primary)' }}>{campaign.requiredHashtags.join(' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Join button */}
        <div className="px-7 pb-7">
          <button
            className="w-full py-4 rounded-xl text-black font-semibold text-base transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          >
            Join campaign
          </button>
        </div>
      </div>
    </div>
  );
}

function RevenueAnalyticsCard({ onViewMore }: { onViewMore?: () => void }) {
  const { t } = useTranslation();
  return (
    <div 
      className="rounded-xl sm:rounded-2xl p-5 sm:p-7 pb-3 sm:pb-4 transition-all duration-200 hover:brightness-105 cursor-pointer border flex flex-col h-full" 
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6 sm:mb-8">
        <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>{t('home.monthlyRecurringRevenue')}</h3>
      </div>

      <div className="space-y-6 sm:space-y-8 flex-grow">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('home.totalRevenue')}</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>$0.00</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('home.change')}</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>—</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t flex items-center justify-end" style={{ borderColor: 'var(--border-subtle)' }}>
        <button
          onClick={(e) => { e.stopPropagation(); if (onViewMore) onViewMore(); }}
          className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
          style={{ color: 'var(--text-primary)' }}
        >
          <span>{t('home.viewMore')}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}

interface ElectricArc {
  id: number
  path: string
  opacity: number
  duration: number
  delay: number
}

interface PowerWidgetDischargedProps {
}

function PowerWidgetDischarged({ }: PowerWidgetDischargedProps) {
  const [arcs, setArcs] = useState<ElectricArc[]>([])
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number; scale: number }[]>([])

  const generateArcPath = useCallback(() => {
    const startX = 0
    const endX = 24
    const midY = 12
    const segments = 4 + Math.floor(Math.random() * 3)
    
    let path = `M ${startX} ${midY + (Math.random() - 0.5) * 8}` 
    
    for (let i = 1; i <= segments; i++) {
      const x = (endX / segments) * i
      const y = midY + (Math.random() - 0.5) * 16
      path += ` L ${x} ${y}` 
    }
    
    return path
  }, [])

  useEffect(() => {
    const generateArc = () => {
      const newArc: ElectricArc = {
        id: Date.now() + Math.random(),
        path: generateArcPath(),
        opacity: 0.6 + Math.random() * 0.4,
        duration: 80 + Math.random() * 120,
        delay: 0,
      }
      
      setArcs(prev => [...prev.slice(-4), newArc])
      
      setTimeout(() => {
        setArcs(prev => prev.filter(a => a.id !== newArc.id))
      }, newArc.duration + 100)
    }

    generateArc()
    setTimeout(generateArc, 100)
    setTimeout(generateArc, 200)

    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        generateArc()
        if (Math.random() > 0.5) {
          setTimeout(generateArc, 50 + Math.random() * 100)
        }
      }
    }, 200 + Math.random() * 300)

    return () => clearInterval(interval)
  }, [generateArcPath])

  useEffect(() => {
    const generateSpark = () => {
      const newSpark = {
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 4,
        y: 8 + Math.random() * 8,
        scale: 0.3 + Math.random() * 0.7,
      }
      
      setSparks(prev => [...prev.slice(-6), newSpark])
      
      setTimeout(() => {
        setSparks(prev => prev.filter(s => s.id !== newSpark.id))
      }, 300)
    }

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        generateSpark()
      }
    }, 150)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="relative flex items-center gap-1.5 p-1.5 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.5)]"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {/* Left - Person Button with Cracks */}
      <div className="relative z-10">
        <button
          className="relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 overflow-hidden"
          style={{ 
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 56 56">
            <defs>
              <linearGradient id="crackGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(80,80,80,0.6)" />
                <stop offset="50%" stopColor="rgba(60,60,60,0.8)" />
                <stop offset="100%" stopColor="rgba(40,40,40,0.5)" />
              </linearGradient>
            </defs>
            <path d="M 44 8 L 38 16 L 42 22 L 36 30 L 40 36 L 32 48" fill="none" stroke="url(#crackGradientLeft)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 38 16 L 32 14 L 28 18" fill="none" stroke="rgba(70,70,70,0.5)" strokeWidth="1" strokeLinecap="round" />
            <path d="M 36 30 L 30 32 L 26 28" fill="none" stroke="rgba(70,70,70,0.5)" strokeWidth="1" strokeLinecap="round" />
            <path d="M 44 8 L 38 16 L 42 22 L 36 30 L 40 36 L 32 48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeLinecap="round" transform="translate(-0.5, -0.5)" />
          </svg>
          <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: "#525252" }}><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>

      {/* Center - Split Display with Gap */}
      <div className="relative flex items-center h-14">
        {/* Left half with cracks */}
        <div className="relative flex items-center justify-end w-[72px] h-14 rounded-l-xl overflow-hidden" style={{ 
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderRight: 'none'
        }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 72 56">
            <path d="M 60 0 L 52 12 L 58 20 L 50 32 L 56 42 L 48 56" fill="none" stroke="rgba(80,80,80,0.5)" strokeWidth="1" strokeLinecap="round" />
            <path d="M 52 12 L 44 16 L 40 12" fill="none" stroke="rgba(70,70,70,0.4)" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M 50 32 L 42 36 L 38 32" fill="none" stroke="rgba(70,70,70,0.4)" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M 60 0 L 52 12 L 58 20 L 50 32 L 56 42 L 48 56" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeLinecap="round" transform="translate(-0.5, -0.5)" />
          </svg>
        </div>

        {/* Gap with electricity */}
        <div className="relative w-8 h-14 flex items-center justify-center overflow-visible">
          <div className="absolute inset-0" style={{ background: 'var(--bg-card)' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute left-0 w-1 h-8 rounded-r-sm" style={{ background: "linear-gradient(to bottom, transparent, #404040, #505050, #404040, transparent)", boxShadow: "inset -1px 0 2px rgba(0,0,0,0.5)" }} />
            <div className="absolute right-0 w-1 h-8 rounded-l-sm" style={{ background: "linear-gradient(to bottom, transparent, #404040, #505050, #404040, transparent)", boxShadow: "inset 1px 0 2px rgba(0,0,0,0.5)" }} />
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 24 24" style={{ overflow: "visible" }}>
            <defs>
              <filter id="electricGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            {arcs.map((arc) => (
              <g key={arc.id}>
                <path d={arc.path} fill="none" stroke="#60a5fa" strokeWidth="4" strokeLinecap="round" opacity={arc.opacity * 0.3} filter="url(#electricGlow)" style={{ animation: `arcFlash ${arc.duration}ms ease-out forwards` }} />
                <path d={arc.path} fill="none" stroke="url(#arcGradient)" strokeWidth="1.5" strokeLinecap="round" opacity={arc.opacity} filter="url(#electricGlow)" style={{ animation: `arcFlash ${arc.duration}ms ease-out forwards` }} />
                <path d={arc.path} fill="none" stroke="#ffffff" strokeWidth="0.5" strokeLinecap="round" opacity={arc.opacity * 0.8} style={{ animation: `arcFlash ${arc.duration}ms ease-out forwards` }} />
              </g>
            ))}
            {sparks.map((spark) => (
              <g key={spark.id} transform={`translate(${spark.x}, ${spark.y}) scale(${spark.scale})`}>
                <circle cx="0" cy="0" r="1.5" fill="#93c5fd" opacity="0.9" style={{ animation: "sparkPop 300ms ease-out forwards" }} />
                <circle cx="0" cy="0" r="3" fill="#3b82f6" opacity="0.4" style={{ animation: "sparkPop 300ms ease-out forwards" }} />
              </g>
            ))}
          </svg>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)", animation: "ambientPulse 1.5s ease-in-out infinite" }} />
        </div>

        {/* Right half with cracks */}
        <div className="relative flex items-center justify-start w-[72px] h-14 rounded-r-xl overflow-hidden" style={{ 
          background: 'var(--bg-input)',
          border: '1px solid var(--border-subtle)',
          borderLeft: 'none'
        }}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 72 56">
            <path d="M 12 0 L 20 10 L 14 18 L 22 28 L 16 38 L 24 48 L 18 56" fill="none" stroke="rgba(80,80,80,0.5)" strokeWidth="1" strokeLinecap="round" />
            <path d="M 20 10 L 28 14 L 32 10" fill="none" stroke="rgba(70,70,70,0.4)" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M 22 28 L 30 32 L 34 28" fill="none" stroke="rgba(70,70,70,0.4)" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M 12 0 L 20 10 L 14 18 L 22 28 L 16 38 L 24 48 L 18 56" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" strokeLinecap="round" transform="translate(0.5, -0.5)" />
          </svg>
        </div>
      </div>

      {/* Right - Briefcase Button with Cracks */}
      <div className="relative z-10">
        <button
          className="relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 overflow-hidden"
          style={{ 
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
        >
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 56 56">
            <defs>
              <linearGradient id="crackGradientRight" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(80,80,80,0.6)" />
                <stop offset="50%" stopColor="rgba(60,60,60,0.8)" />
                <stop offset="100%" stopColor="rgba(40,40,40,0.5)" />
              </linearGradient>
            </defs>
            <path d="M 12 6 L 18 14 L 14 20 L 20 28 L 16 34 L 22 44 L 18 52" fill="none" stroke="url(#crackGradientRight)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 18 14 L 24 12 L 28 16" fill="none" stroke="rgba(70,70,70,0.5)" strokeWidth="1" strokeLinecap="round" />
            <path d="M 20 28 L 26 30 L 30 26" fill="none" stroke="rgba(70,70,70,0.5)" strokeWidth="1" strokeLinecap="round" />
            <path d="M 16 34 L 10 38 L 8 44" fill="none" stroke="rgba(70,70,70,0.4)" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M 12 6 L 18 14 L 14 20 L 20 28 L 16 34 L 22 44 L 18 52" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeLinecap="round" transform="translate(0.5, -0.5)" />
          </svg>
          <svg className="w-6 h-6 relative z-10" style={{ color: "#525252", filter: "none" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <circle cx="11" cy="11" r="8"></circle>
  <path d="m21 21-4.35-4.35"></path>
  <text x="11" y="14" textAnchor="middle" fontSize="10" fill="currentColor" stroke="none">$</text>
</svg>
        </button>
      </div>

      <style>{`
        @keyframes arcFlash {
          0% { opacity: 1; stroke-width: 2; }
          50% { opacity: 0.8; }
          100% { opacity: 0; stroke-width: 0.5; }
        }
        @keyframes sparkPop {
          0% { transform: scale(0); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(0.5); opacity: 0; }
        }
        @keyframes ambientPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes iconPulse {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.5)); }
          50% { filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.8)); }
        }
      `}</style>
    </div>
  )
}

function FighterMusicCard({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="rounded-xl sm:rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:brightness-105 cursor-pointer border" 
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
      onClick={onClick}
    >
      <div className="mb-4 sm:mb-5">
        <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>Publishing Revenue Status</h3>
      </div>
      
      <div className="flex flex-col items-center gap-3 mt-8">
        <PowerWidgetDischarged />
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Status: <span style={{ color: '#ef4444' }}>Disconnected</span>
        </div>
      </div>
    </div>
  );
}

function TotalSongsDistributedCard() {
  return (
    <div 
      className="rounded-xl sm:rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:brightness-105 cursor-pointer border" 
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6 sm:mb-8">
        <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>Total Songs Distributed</h3>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Total Songs</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>0</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>This Month</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>—</span>
        </div>
      </div>
    </div>
  );
}

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
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white';
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
        backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
        color: 'var(--text-primary)'
      }}
    >
      {React.cloneElement(icon, { isHovered })}
      {label}
    </button>
  );
};

const MobileSettingsButton = ({ 
  onClick, 
  isActive, 
  icon, 
  label
}: { 
  onClick: () => void; 
  isActive: boolean; 
  icon: React.ReactElement; 
  label: string;
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' | 'white';
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      className="lg:hidden w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200"
      style={{ 
        backgroundColor: isActive ? 'var(--bg-active)' : (isHovered ? 'var(--bg-active)' : 'transparent'),
        transform: isHovered ? 'scale(0.98)' : 'scale(1)'
      }}
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200" 
          style={{ 
            backgroundColor: isActive || isHovered ? 'rgba(148, 163, 184, 0.1)' : 'rgba(75, 85, 99, 0.1)'
          }}
        >
          {React.cloneElement(icon, { isHovered: isHovered || isActive })}
        </div>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
      </div>
      <svg className="w-5 h-5 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', transform: isHovered ? 'translateX(2px)' : 'translateX(0)' }}><path d="M9 18l6-6-6-6"/></svg>
    </button>
  );
};

const MobileSettingsMenuItem = ({ 
  onClick, 
  icon, 
  label,
  showBorder
}: { 
  onClick: () => void; 
  icon: React.ReactElement; 
  label: string;
  showBorder: boolean;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full flex items-center justify-between px-4 py-4 transition-colors"
      style={{ borderBottom: showBorder ? '1px solid rgba(75, 85, 99, 0.2)' : 'none' }}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: 'var(--text-primary)' }}>{React.cloneElement(icon, { isHovered })}</span>
        <span className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{label}</span>
      </div>
      <svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
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
  // Use cached profile for instant loading (like Twitter/Instagram)
  const { profile: cachedProfile, userId: cachedUserId, updateProfile: updateCachedProfile, clearCache: clearProfileCache } = useUserProfile();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarPermanentlyCollapsed, setSidebarPermanentlyCollapsed] = useState(false);
  const [releaseStep, setReleaseStep] = useState(1);
  const [showReleaseForm, setShowReleaseForm] = useState(false);
  const [myReleasesTab, setMyReleasesTab] = useState<'in-progress' | 'complete' | 'inactive'>('in-progress');
  const [releasesFilter, setReleasesFilter] = useState('Any release type');
  const [releasesFilterOpen, setReleasesFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [releaseChecklist, setReleaseChecklist] = useState([false, false, false]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftLoading, setDraftLoading] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<any[]>([]);
  const [deletingDraftId, setDeletingDraftId] = useState<string | null>(null);
  const [artistNames, setArtistNames] = useState<string[]>([]);
  const draftSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [releaseForm, setReleaseForm] = useState({
    title: '',
    copyrightHolder: '',
    copyrightYear: String(new Date().getFullYear()),
    productionHolder: '',
    productionYear: String(new Date().getFullYear()),
    recordLabel: 'Independent',
    releaseArtists: '',
    genre: '',
    secondaryGenre: '',
    language: 'English',
    releaseDate: '',
    countryRestrictions: false,
    releasedBefore: false,
    originalReleaseDate: '',
    stores: [] as string[],
    tracks: [] as { title: string; featuring: string; explicit: boolean; duration: number; fileName: string; fileObject: File | null; audioUrl?: string; previewStart: number; addLyrics: boolean; lyricsText: string; lyricsDocName: string; lyricsDocUrl?: string; isrcMode: 'auto' | 'manual'; isrcCode: string; credits: { composer: string; songwriter: string; songwriterRole: string; engineer: string; engineerRole: string; performer: string; performerRole: string }; extraCredits?: { name: string; role: string }[] }[],
    artworkFile: null as File | null,
    artworkPreview: '' as string,
  });
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [earningsTab, setEarningsTab] = useState<'available' | 'pending' | 'paidout'>('available');
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('personal');
  const [mobileSettingsView, setMobileSettingsView] = useState<'menu' | SettingsSection>('menu');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isTipaltiConnected, setIsTipaltiConnected] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    paymentType: 'card' as 'card' | 'paypal' | 'apple',
    nameOnCard: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    city: '',
    billingAddress: ''
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    location: '',
    language: '',
    email: ''
  });
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [emailNewFeatures, setEmailNewFeatures] = useState<boolean>(true);
  const [emailPlatformUpdates, setEmailPlatformUpdates] = useState<boolean>(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [messageNotifications, setMessageNotifications] = useState<boolean>(true);
  const [copyrightOption, setCopyrightOption] = useState<'none' | 'upload'>('none');
  const [copyrightDocs, setCopyrightDocs] = useState<File[]>([]);
  const [uploadingTracks, setUploadingTracks] = useState<{ name: string; size: number; progress: number; done: boolean }[]>([]);
  const [editingTrackIndex, setEditingTrackIndex] = useState<number | null>(null);
  const [copiedTrackIndex, setCopiedTrackIndex] = useState<number | null>(null);
  const [releaseArtistError, setReleaseArtistError] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, boolean>>({});
  const [guideSubpage, setGuideSubpage] = useState<string | null>(null);
  const [guideArticle, setGuideArticle] = useState<string | null>(null);
  const [releaseDateMode, setReleaseDateMode] = useState<'most-recent' | 'specific'>('most-recent');
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [storeDistType, setStoreDistType] = useState<'all' | 'downloads' | 'streaming' | 'custom'>('all');
  const [showAllStores, setShowAllStores] = useState(false);
  const [playingTrackIndex, setPlayingTrackIndex] = useState<number | null>(null);
  // Always-fresh ref to tracks — used in scrubber drag to avoid stale closures
  const latestTracksRef = useRef(releaseForm.tracks);
  latestTracksRef.current = releaseForm.tracks;

  // Stable object URL cache — created once per file, never recreated on re-render
  const trackObjectUrls = useRef<Map<string, string>>(new Map());
  const getTrackUrl = (track: { fileObject: File | null; fileName: string }) => {
    if (!track.fileObject) return null;
    const key = track.fileName;
    if (!trackObjectUrls.current.has(key)) {
      trackObjectUrls.current.set(key, URL.createObjectURL(track.fileObject));
    }
    return trackObjectUrls.current.get(key)!;
  };
  const releaseFormScrollRef = useRef<HTMLDivElement>(null);
  const artworkInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const isUploading = uploadingTracks.some(t => !t.done);
  const handleAudioFiles = useCallback((files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f: File) => f.name.endsWith('.wav') || f.name.endsWith('.mp3'));
    if (!fileArr.length) return;
    // Prevent duplicate uploads
    const existingNames = new Set(releaseFormRef.current.tracks.map((t: any) => t.fileName));
    const newFiles = fileArr.filter((f: File) => !existingNames.has(f.name));
    if (!newFiles.length) return;
    newFiles.forEach((file: File) => {
      setUploadingTracks(prev => [...prev, { name: file.name, size: file.size, progress: 0, done: false }]);
      // Read actual audio duration
      const audioEl = new Audio();
      const objectUrl = URL.createObjectURL(file);
      audioEl.src = objectUrl;
      let audioDuration = 0;
      audioEl.addEventListener('loadedmetadata', () => {
        audioDuration = audioEl.duration;
      });
      // Animate progress while uploading
      const startTime = Date.now();
      const simDuration = 3000 + Math.random() * 2000;
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(95, Math.round((elapsed / simDuration) * 95));
        setUploadingTracks(prev => prev.map(t => t.name === file.name && !t.done ? { ...t, progress } : t));
      }, 80);
      // Actually upload to Supabase storage
      (async () => {
        try {
          const uid = localStorage.getItem('verifiedUserId') || '';
          const dId = draftIdRef.current;
          let audioUrl = '';
          if (uid) {
            const ext = file.name.split('.').pop() || 'mp3';
            const path = `${uid}/${dId || 'pending'}/${file.name}`;
            const { error: upErr } = await supabase.storage.from('release-audio').upload(path, file, { upsert: true });
            if (upErr) {
              console.error('[audio upload] storage error:', upErr);
            } else {
              const { data: urlData } = supabase.storage.from('release-audio').getPublicUrl(path);
              audioUrl = urlData.publicUrl;
            }
          }
          clearInterval(interval);
          URL.revokeObjectURL(objectUrl);
          setUploadingTracks(prev => prev.map(t => t.name === file.name ? { ...t, progress: 100, done: true } : t));
          setReleaseForm(f => ({ ...f, tracks: [...f.tracks, { title: file.name.replace(/\.(wav|mp3)$/i, ''), featuring: '', explicit: false, duration: audioDuration, fileName: file.name, fileObject: file, audioUrl, previewStart: 0, addLyrics: false, lyricsText: '', lyricsDocName: '', lyricsDocUrl: '', isrcMode: 'auto' as const, isrcCode: '', credits: { composer: '', songwriter: '', songwriterRole: '', engineer: '', engineerRole: '', performer: '', performerRole: '' } }] }));
        } catch (e) {
          console.error('[audio upload] exception:', e);
          clearInterval(interval);
          setUploadingTracks(prev => prev.map(t => t.name === file.name ? { ...t, progress: 100, done: true } : t));
          setReleaseForm(f => ({ ...f, tracks: [...f.tracks, { title: file.name.replace(/\.(wav|mp3)$/i, ''), featuring: '', explicit: false, duration: audioDuration, fileName: file.name, fileObject: file, audioUrl: '', previewStart: 0, addLyrics: false, lyricsText: '', lyricsDocName: '', lyricsDocUrl: '', isrcMode: 'auto' as const, isrcCode: '', credits: { composer: '', songwriter: '', songwriterRole: '', engineer: '', engineerRole: '', performer: '', performerRole: '' } }] }));
        }
      })();
    });
  }, []);
  // DOM element refs for drop zones
  const artworkDropElRef = useRef<HTMLDivElement>(null);
  const audioDropElRef = useRef<HTMLDivElement>(null);

  // Handler refs — always point to latest logic, never stale
  const artworkDropHandlerRef = useRef<(e: DragEvent) => void>(() => {});
  const audioDropHandlerRef = useRef<(e: DragEvent) => void>(() => {});

  // Keep artwork handler ref up to date every render
  useEffect(() => {
    artworkDropHandlerRef.current = (e: DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      const el = artworkDropElRef.current;
      if (el) { el.style.borderColor = 'var(--border-subtle)'; el.style.backgroundColor = 'var(--bg-elevated)'; }
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg'))) {
        const url = URL.createObjectURL(file);
        setReleaseForm(f => ({ ...f, artworkFile: file, artworkPreview: url }));
      }
    };
  });

  // Keep audio handler ref up to date every render
  useEffect(() => {
    audioDropHandlerRef.current = (e: DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      const el = audioDropElRef.current;
      if (el) { el.style.borderColor = 'var(--border-subtle)'; el.style.backgroundColor = 'var(--bg-elevated)'; }
      if (e.dataTransfer?.files) handleAudioFiles(e.dataTransfer.files);
    };
  });

  // Attach/detach artwork drop listeners — stable, no stale closures
  useEffect(() => {
    const el = artworkDropElRef.current;
    if (!el) return;
    const onDragEnter = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDragOver  = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); el.style.borderColor = 'var(--text-primary)'; el.style.backgroundColor = 'var(--bg-card)'; };
    const onDragLeave = (e: DragEvent) => { if (el.contains(e.relatedTarget as Node)) return; e.preventDefault(); e.stopPropagation(); el.style.borderColor = 'var(--border-subtle)'; el.style.backgroundColor = 'var(--bg-elevated)'; };
    const onDrop      = (e: DragEvent) => artworkDropHandlerRef.current(e);
    el.addEventListener('dragenter', onDragEnter);
    el.addEventListener('dragover',  onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop',      onDrop);
    return () => {
      el.removeEventListener('dragenter', onDragEnter);
      el.removeEventListener('dragover',  onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop',      onDrop);
    };
  }, [releaseStep, showReleaseForm, activeSection]); // re-attach when form mounts or step changes

  // Attach/detach audio drop listeners — stable, no stale closures
  useEffect(() => {
    const el = audioDropElRef.current;
    if (!el) return;
    const onDragEnter = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const onDragOver  = (e: DragEvent) => { e.preventDefault(); e.stopPropagation(); el.style.borderColor = 'var(--text-primary)'; el.style.backgroundColor = 'var(--bg-card)'; };
    const onDragLeave = (e: DragEvent) => { if (el.contains(e.relatedTarget as Node)) return; e.preventDefault(); e.stopPropagation(); el.style.borderColor = 'var(--border-subtle)'; el.style.backgroundColor = 'var(--bg-elevated)'; };
    const onDrop      = (e: DragEvent) => audioDropHandlerRef.current(e);
    el.addEventListener('dragenter', onDragEnter);
    el.addEventListener('dragover',  onDragOver);
    el.addEventListener('dragleave', onDragLeave);
    el.addEventListener('drop',      onDrop);
    return () => {
      el.removeEventListener('dragenter', onDragEnter);
      el.removeEventListener('dragover',  onDragOver);
      el.removeEventListener('dragleave', onDragLeave);
      el.removeEventListener('drop',      onDrop);
    };
  }, [releaseStep, showReleaseForm, activeSection]); // re-attach when form mounts or step changes

  // Scroll to top when release step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [releaseStep]);

  // Prevent browser from navigating away when files are dropped outside a drop zone
  useEffect(() => {
    const prevent = (e: DragEvent) => { e.preventDefault(); };
    document.addEventListener('dragover', prevent);
    document.addEventListener('drop', prevent);
    return () => {
      document.removeEventListener('dragover', prevent);
      document.removeEventListener('drop', prevent);
    };
  }, []);


  // Use centralized theme from context
  const { theme: backgroundTheme, setTheme: setBackgroundTheme, flatBackground, setFlatBackground } = useTheme();
  // appliedTheme is now the same as backgroundTheme (single source of truth)
  const appliedTheme = backgroundTheme;
  
  const [feedbackCategory, setFeedbackCategory] = useState<'suggestion' | 'bug-report' | 'feature-request' | 'other' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackMedia, setFeedbackMedia] = useState<File | null>(null);
  const [feedbackMediaPreview, setFeedbackMediaPreview] = useState<string | null>(null);
  const feedbackMediaInputRef = useRef<HTMLInputElement>(null);
  const [guideSearch, setGuideSearch] = useState('');
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(() => LOCALE_TO_NAME[i18n.language] || 'English');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [cachedProfilePic, setCachedProfilePic] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const personalRef = useRef<HTMLDivElement>(null);
  const accountsRef = useRef<HTMLDivElement>(null);
  const accountTypeRef = useRef<HTMLDivElement>(null);
  const payoutRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get unread message count for badge indicator
  // Only fetch conversations if currentUserId is available
  const { conversations, refetch: refetchConversations } = useCustomerConversations(currentUserId || '');
  const handleNavigateToMessages = useCallback(() => setActiveSection('messages'), [setActiveSection]);
  const unreadCount = useUnreadCount(currentUserId || '');
  
  // Only show badge when not in messages section and there are unread messages
  const shouldShowBadge = activeSection !== 'messages' && unreadCount > 0;
  
  // Debug: Log badge state - this should update when conversations change
  useEffect(() => {
    console.log('🏷️ [ArtistDashboard] Badge Debug:', {
      currentUserId,
      conversationsCount: conversations.length,
      unreadCount,
      activeSection,
      shouldShowBadge,
      conversations: conversations.map(c => ({
        id: c.id,
        customer_id: c.customer_id,
        unread_count_customer: c.unread_count_customer,
        unread_count_admin: c.unread_count_admin,
        effectiveUnread: c.customer_id === currentUserId ? c.unread_count_customer : c.unread_count_admin,
        last_message: c.last_message?.substring(0, 30)
      }))
    });
  }, [currentUserId, conversations, unreadCount, activeSection, shouldShowBadge]);

  // INSTANT: Initialize from cached profile immediately (like Twitter/Instagram)
  useEffect(() => {
    if (cachedProfile && !userProfile) {
      console.log('[ArtistDashboard] 🚀 INSTANT: Loading from cached profile');
      setUserProfile(cachedProfile);
      setUserType('ARTIST');
      if (cachedUserId) {
        setCurrentUserId(cachedUserId);
      }
      setFormData({
        firstName: cachedProfile.first_name || '',
        lastName: cachedProfile.last_name || '',
        username: cachedProfile.username || '',
        bio: '',
        location: cachedProfile.location || '',
        language: cachedProfile.primary_language || '',
        email: cachedProfile.email || ''
      });
      if (cachedProfile.profile_picture_url) {
        setProfilePicturePreview(cachedProfile.profile_picture_url);
      }
    }
  }, [cachedProfile, cachedUserId, userProfile]);

  useEffect(() => {
    localStorage.setItem('currentDashboard', '/dashboard/artist');
    // Only fetch if no cached profile (background refresh happens in context)
    if (!cachedProfile) {
      fetchUserProfile();
    }
  }, [cachedProfile]);

  // Update cached image when userProfile changes
  useEffect(() => {
    if (userProfile?.profile_picture_url && !userProfile.profile_picture_url.startsWith('blob:')) {
      const cachedImage = getCachedImage(userProfile.profile_picture_url);
      if (cachedImage && cachedImage !== cachedProfilePic) {
        setCachedProfilePic(cachedImage);
      } else if (!cachedImage) {
        // If not cached yet, check again after a short delay (in case caching completed)
        const timeoutId = setTimeout(() => {
          const newlyCached = getCachedImage(userProfile.profile_picture_url);
          if (newlyCached) {
            setCachedProfilePic(newlyCached);
          }
        }, 500);
        return () => clearTimeout(timeoutId);
      }
    } else {
      setCachedProfilePic(null);
    }
  }, [userProfile?.profile_picture_url, cachedProfilePic]);

  // Refetch conversations when navigating back to home to ensure badge count is up to date
  useEffect(() => {
    if (currentUserId && activeSection !== 'messages') {
      // Small delay to ensure any pending database updates have completed
      const timeoutId = setTimeout(() => {
        refetchConversations();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [activeSection, currentUserId, refetchConversations]);

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
      
      console.log('🔍 User ID resolution:', {
        'auth user id': user?.id,
        'verifiedUserId from localStorage': verifiedUserId,
        'verifiedEmail from localStorage': verifiedEmail,
        'final userId': userId
      });
      
      // If we have email but no userId, try to find user by email
      if (!userId && verifiedEmail) {
        console.log('No userId found, trying to find user by email:', verifiedEmail);
        const { data: usersByEmail, error: emailLookupError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', verifiedEmail)
          .maybeSingle();
        
        if (emailLookupError) {
          console.error('❌ Error looking up user by email:', emailLookupError);
          console.error('Error details:', {
            message: emailLookupError.message,
            details: emailLookupError.details,
            hint: emailLookupError.hint,
            code: emailLookupError.code
          });
        }
        
        if (usersByEmail?.id) {
          userId = usersByEmail.id;
          if (userId) {
            localStorage.setItem('verifiedUserId', userId);
            setCurrentUserId(userId);
          }
          console.log('✅ Found user by email, userId:', userId);
        } else {
          console.warn('⚠️ User not found in users table with email:', verifiedEmail);
          console.warn('Query result:', usersByEmail);
        }
      }

      if (userId) {
        setCurrentUserId(userId);
      } else {
        console.warn('❌ No user ID found. Auth error:', authError);
        console.warn('Verified email:', verifiedEmail);
        return;
      }

      console.log('📥 Fetching profile for userId:', userId);
      console.log('Auth user:', user?.id);
      console.log('Is authenticated:', !!user);

      // Try Edge Function first (bypasses RLS) - more reliable
      let profile = null;
      let userData = null;
      
      try {
        console.log('Attempting to fetch via Edge Function...');
        const fetchUrl = `${SUPABASE_URL}/functions/v1/get-profile?userId=${userId}`;
        console.log('Edge Function URL:', fetchUrl);
        
        const fetchResponse = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Edge Function response status:', fetchResponse.status);
        console.log('Edge Function response headers:', Object.fromEntries(fetchResponse.headers.entries()));
        
        const contentType = fetchResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await fetchResponse.text();
          console.warn('⚠️ Edge Function returned non-JSON response (likely HTML error page)');
          console.warn('Response preview:', textResponse.substring(0, 200));
          console.warn('This usually means the Edge Function does not exist or is misconfigured');
          // Don't throw error, just skip Edge Function and use direct query
        } else if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          console.log('✅ Edge Function response data:', fetchData);
          
          if (fetchData.success) {
            profile = fetchData.profile;
            userData = fetchData.user;
            console.log('✅ Successfully fetched via Edge Function');
            console.log('Profile:', profile);
            console.log('User:', userData);
            console.log('Profile picture URL from database:', profile?.profile_picture_url || userData?.profile_picture_url);
            console.log('All profile keys:', profile ? Object.keys(profile) : 'null');
          } else {
            console.warn('⚠️ Edge Function returned success:false', fetchData.message);
          }
        } else {
          const errorText = await fetchResponse.text();
          console.error('❌ Edge Function fetch failed:', fetchResponse.status, errorText.substring(0, 200));
        }
      } catch (fetchErr) {
        console.error('❌ Error fetching via Edge Function:', fetchErr);
        // Continue to direct query fallback
      }

      // Fallback: Try direct query if Edge Function didn't work
      if (!profile) {
        console.log('🔍 Edge Function didn\'t return data, trying direct query...');
        console.log('Querying users table for userId:', userId);
        
        // First try by ID
        const userResult = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        // If no result by ID, try by email as fallback
        if (!userResult.data && !userResult.error) {
          const verifiedEmail = localStorage.getItem('verifiedEmail');
          if (verifiedEmail) {
            console.log('🔍 User not found by ID, trying email:', verifiedEmail);
            const emailResult = await supabase
              .from('users')
              .select('*')
              .eq('email', verifiedEmail)
              .maybeSingle();
            
            if (emailResult.data) {
              console.log('✅ Found user by email:', emailResult.data);
              console.log('📦 Username from users table:', emailResult.data.username);
              // Use this data
              userResult.data = emailResult.data;
            } else {
              console.warn('⚠️ User not found by email either');
              // List some users for debugging
              const { data: sampleUsers } = await supabase
                .from('users')
                .select('id, email, username, first_name')
                .limit(5);
              console.log('📋 Sample users in table:', sampleUsers);
            }
          }
        }

        console.log('📊 Users table query result:', {
          hasData: !!userResult.data,
          hasError: !!userResult.error,
          data: userResult.data,
          error: userResult.error
        });

        // Log any errors with full details
        if (userResult.error) {
          console.error('❌ Error fetching users table:', userResult.error);
          console.error('Error details:', {
            message: userResult.error.message,
            details: userResult.error.details,
            hint: userResult.error.hint,
            code: userResult.error.code
          });
        } else {
          console.log('✅ users table query successful');
          if (userResult.data) {
            console.log('📦 User data found:', Object.keys(userResult.data));
            profile = userResult.data;
            userData = userResult.data;
          } else {
            console.warn('⚠️ users table query returned no data (null)');
            console.warn('Trying profiles table as fallback...');
            
            // Try profiles table as fallback
            const profileResult = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .maybeSingle();
            
            console.log('📊 Profiles table query result:', {
              hasData: !!profileResult.data,
              hasError: !!profileResult.error,
              data: profileResult.data,
              error: profileResult.error
            });
            
            if (profileResult.error) {
              console.error('❌ Error fetching profiles table:', profileResult.error);
            } else if (profileResult.data) {
              console.log('✅ Found user in profiles table');
              const profileData = profileResult.data;
              
              // Map profiles table structure to users table structure
              // Profiles has: name, avatar_url
              // Users has: first_name, last_name, profile_picture_url
              const nameParts = profileData.name ? profileData.name.split(' ') : [];
              const mappedProfile = {
                ...profileData,
                // Map to users table structure
                first_name: nameParts[0] || '',
                last_name: nameParts.slice(1).join(' ') || '',
                username: profileData.name || '',
                profile_picture_url: profileData.avatar_url || '',
                // Keep original fields too
                name: profileData.name,
                avatar_url: profileData.avatar_url,
              };
              
              console.log('📦 Mapped profile data:', mappedProfile);
              profile = mappedProfile;
              userData = mappedProfile;
            } else {
              console.warn('⚠️ User not found in either users or profiles table');
              console.warn('This could mean:');
              console.warn('1. User does not exist in database');
              console.warn('2. RLS policy is blocking access');
              console.warn('3. userId mismatch');
            }
          }
        }
      }

      console.log('Final profile data:', profile);
      console.log('Final user data:', userData);

      // Prioritize userData from users table (new primary source of truth)
      const profileData = userData || profile;
      
      // Preload profile picture immediately when profile data is available
      // Check both profile_picture_url (users table) and avatar_url (profiles table)
      const profilePicUrl = profileData?.profile_picture_url || profileData?.avatar_url;
      if (profilePicUrl && !profilePicUrl.startsWith('blob:')) {
        const cachedImage = getCachedImage(profilePicUrl);
        if (cachedImage) {
          setCachedProfilePic(cachedImage);
        } else {
          // Start preloading immediately
          preloadAndCacheImage(profilePicUrl);
        }
      }
      
      // Always set profile data, even if empty (use defaults)
      setUserProfile(profileData);
      // Tag should always match the dashboard route (Creator Dashboard = CREATOR)
      setUserType('ARTIST');
      
      // Set form data from users table (primary source)
      const formDataToSet = {
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        username: profileData?.username || '',
        bio: profileData?.bio || '',
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
      // Header avatar will use userProfile.profile_picture_url or avatar_url directly
      const picUrl = profileData?.profile_picture_url || profileData?.avatar_url;
      if (picUrl && !picUrl.startsWith('blob:')) {
        console.log('Setting profile picture preview from database:', picUrl);
        setProfilePicturePreview(picUrl);
      } else {
        console.log('No valid profile picture URL found in profile data');
        console.log('Profile data keys:', profileData ? Object.keys(profileData) : 'null');
        console.log('profile_picture_url value:', profileData?.profile_picture_url);
        console.log('avatar_url value:', profileData?.avatar_url);
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
        
        // Set notification preferences (default to true if not set)
        setEmailNewFeatures(profileData?.email_new_features ?? true);
        setEmailPlatformUpdates(profileData?.email_platform_updates ?? true);
      } else {
        console.warn('❌ No user data found for userId:', userId);
        console.warn('This might mean the user completed OTP but not onboarding');
        console.warn('Form data set with empty values - user needs to complete onboarding');
      }
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
    }
  };

  // ── Draft persistence ──────────────────────────────────────────────────────

  const fetchDrafts = async (uid?: string) => {
    // Always use the authenticated session uid for RLS compliance
    const { data: { user } } = await supabase.auth.getUser();
    const resolvedUid = user?.id || uid || localStorage.getItem('verifiedUserId') || '';
    if (!resolvedUid) return;
    const { data, error } = await supabase
      .from('release_drafts')
      .select('*')
      .eq('user_id', resolvedUid)
      .order('updated_at', { ascending: false });
    if (error) { console.error('[fetchDrafts] error:', error); return; }
    if (data) setSavedDrafts(data);
  };

  const fetchArtistNames = async (uid: string) => {
    const { data } = await supabase
      .from('social_links')
      .select('display_name')
      .eq('user_id', uid);
    if (data) {
      const names = data.map((r: any) => r.display_name).filter(Boolean);
      setArtistNames(names);
    }
  };

  const saveDraft = useCallback(async (form: typeof releaseForm, step: number, checklist: boolean[], _uid: string, overrideDraftId?: string | null) => {
    // Always resolve uid from Supabase auth session — this is what RLS checks
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveUid = user?.id || _uid || localStorage.getItem('verifiedUserId') || '';
    if (!effectiveUid) {
      console.warn('[saveDraft] No authenticated user — skipping save');
      return;
    }
    setDraftSaving(true);
    try {
      const tracksForDb = form.tracks.map(t => ({
        title: t.title,
        featuring: t.featuring,
        explicit: t.explicit,
        duration: t.duration,
        fileName: t.fileName,
        previewStart: t.previewStart,
        addLyrics: t.addLyrics,
        lyricsText: t.lyricsText,
        lyricsDocName: t.lyricsDocName,
        isrcMode: t.isrcMode,
        isrcCode: t.isrcCode,
        credits: t.credits,
      }));

      const payload: any = {
        user_id: effectiveUid,
        status: 'incomplete',
        current_step: step,
        title: form.title,
        copyright_holder: form.copyrightHolder,
        copyright_year: form.copyrightYear,
        production_holder: form.productionHolder,
        production_year: form.productionYear,
        record_label: form.recordLabel,
        release_artists: form.releaseArtists,
        genre: form.genre,
        secondary_genre: form.secondaryGenre,
        language: form.language,
        release_date: form.releaseDate,
        released_before: form.releasedBefore,
        original_release_date: form.originalReleaseDate,
        country_restrictions: form.countryRestrictions,
        tracks: tracksForDb,
        checklist: checklist,
        stores: form.stores,
        updated_at: new Date().toISOString(),
      };

      const effectiveDraftId = overrideDraftId !== undefined ? overrideDraftId : draftId;
      if (effectiveDraftId) {
        const { error } = await supabase.from('release_drafts').update(payload).eq('id', effectiveDraftId);
        if (error) console.error('[saveDraft] update error:', error);
      } else {
        const { data, error } = await supabase.from('release_drafts').insert(payload).select('id').single();
        if (error) console.error('[saveDraft] insert error:', error);
        if (data?.id) setDraftId(data.id);
      }
      await fetchDrafts(effectiveUid);
    } catch (e) {
      console.error('[saveDraft] exception:', e);
    } finally {
      setDraftSaving(false);
    }
  }, [draftId]);

  const uploadArtwork = async (file: File, uid: string, dId: string): Promise<string> => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${uid}/${dId}.${ext}`;
    const { error } = await supabase.storage.from('release-artwork').upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('release-artwork').getPublicUrl(path);
    return data.publicUrl;
  };

  const loadDraftIntoForm = (draft: any) => {
    const tracks = (draft.tracks || []).map((t: any) => ({
      title: t.title || '',
      featuring: t.featuring || '',
      explicit: t.explicit || false,
      duration: t.duration || 0,
      fileName: t.fileName || '',
      fileObject: null,
      previewStart: t.previewStart || 0,
      addLyrics: t.addLyrics || false,
      lyricsText: t.lyricsText || '',
      lyricsDocName: t.lyricsDocName || '',
      isrcMode: (t.isrcMode as 'auto' | 'manual') || 'auto',
      isrcCode: t.isrcCode || '',
      credits: t.credits || { composer: '', songwriter: '', songwriterRole: '', engineer: '', engineerRole: '', performer: '', performerRole: '' },
    }));
    setReleaseForm({
      title: draft.title || '',
      copyrightHolder: draft.copyright_holder || '',
      copyrightYear: draft.copyright_year || String(new Date().getFullYear()),
      productionHolder: draft.production_holder || '',
      productionYear: draft.production_year || String(new Date().getFullYear()),
      recordLabel: draft.record_label || 'Independent',
      releaseArtists: draft.release_artists || '',
      genre: draft.genre || '',
      secondaryGenre: draft.secondary_genre || '',
      language: draft.language || 'English',
      releaseDate: draft.release_date || '',
      countryRestrictions: draft.country_restrictions || false,
      releasedBefore: draft.released_before || false,
      originalReleaseDate: draft.original_release_date || '',
      stores: draft.stores || [],
      tracks,
      artworkFile: null,
      artworkPreview: draft.artwork_url || '',
    });
    setReleaseChecklist(draft.checklist || [false, false, false]);
    setReleaseStep(draft.current_step || 1);
    setDraftId(draft.id);
  };

  // Auto-save draft whenever releaseForm or step changes (debounced 1.5s)
  const releaseFormRef = useRef(releaseForm);
  const releaseStepRef = useRef(releaseStep);
  const releaseChecklistRef = useRef(releaseChecklist);
  const draftIdRef = useRef(draftId);
  useEffect(() => { releaseFormRef.current = releaseForm; }, [releaseForm]);
  useEffect(() => { releaseStepRef.current = releaseStep; }, [releaseStep]);
  useEffect(() => { releaseChecklistRef.current = releaseChecklist; }, [releaseChecklist]);
  useEffect(() => { draftIdRef.current = draftId; }, [draftId]);

  useEffect(() => {
    if (!showReleaseForm) return;
    if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current = setTimeout(() => {
      const uid = currentUserId || localStorage.getItem('verifiedUserId') || '';
      if (!uid) return;
      saveDraft(releaseFormRef.current, releaseStepRef.current, releaseChecklistRef.current, uid, draftIdRef.current);
    }, 1500);
    return () => { if (draftSaveTimer.current) clearTimeout(draftSaveTimer.current); };
  }, [releaseForm, releaseStep, releaseChecklist, showReleaseForm, currentUserId]);

  // Fetch drafts and artist names when user ID is known (also check localStorage fallback)
  useEffect(() => {
    const uid = currentUserId || localStorage.getItem('verifiedUserId') || '';
    if (uid) {
      fetchDrafts(uid);
      fetchArtistNames(uid);
    }
  }, [currentUserId]);

  // ──────────────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    clearProfileCache(); // Clear cached profile state
    // Clear all localStorage except theme
    const theme = localStorage.getItem('theme');
    const backgroundTheme = localStorage.getItem('backgroundTheme');
    const appliedTheme = localStorage.getItem('appliedTheme');
    localStorage.clear();
    // Restore theme settings
    if (theme) localStorage.setItem('theme', theme);
    if (backgroundTheme) localStorage.setItem('backgroundTheme', backgroundTheme);
    if (appliedTheme) localStorage.setItem('appliedTheme', appliedTheme);
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
      // Use cached user ID for instant access
      const userId = currentUserId || localStorage.getItem('verifiedUserId');
      
      if (!userId) {
        setSaveError('You must be logged in to save changes');
        setIsSaving(false);
        return;
      }

      // Only process image if there's actually a new one
      let profilePictureBase64 = null;
      let profilePictureFileName = null;
      
      if (profilePicture) {
        try {
          // Convert file to base64
          const reader = new FileReader();
          profilePictureBase64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const result = reader.result as string;
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(profilePicture);
          });
          profilePictureFileName = profilePicture.name;
        } catch (convertErr: any) {
          setSaveError('Failed to process profile picture');
          setIsSaving(false);
          return;
        }
      }

      // Save profile using Edge Function
      const apiUrl = `${SUPABASE_URL}/functions/v1/save-profile`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          bio: formData.bio,
          location: formData.location,
          primaryLanguage: formData.language,
          profilePictureBase64,
          profilePictureFileName,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to save changes');
      }

      // Update cache instantly (no need to refresh from server)
      updateCachedProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        location: formData.location,
        primary_language: formData.language,
        profile_picture_url: data.profilePictureUrl || userProfile?.profile_picture_url || null,
      });
      
      // Update local state instantly
      setUserProfile((prev: any) => prev ? {
        ...prev,
        first_name: formData.firstName,
        last_name: formData.lastName,
        bio: formData.bio,
        location: formData.location,
        primary_language: formData.language,
        profile_picture_url: data.profilePictureUrl || prev.profile_picture_url,
      } : null);
      
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

  const handleUpdateProfile = async (updates: { profile_picture?: File; banner?: File; bio?: string }) => {
    if (!currentUserId) return;

    try {
      console.log('📝 Updating profile with:', updates);

      // Convert files to base64 for Edge Function
      let profilePictureBase64 = null;
      let profilePictureFileName = null;
      let bannerBase64 = null;
      let bannerFileName = null;

      if (updates.profile_picture) {
        console.log('🖼️ Converting profile picture to base64...');
        const file = updates.profile_picture;
        const reader = new FileReader();
        profilePictureBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1]; // Remove data URL prefix
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        profilePictureFileName = file.name;
      }

      if (updates.banner) {
        console.log('🖼️ Converting banner to base64...');
        const file = updates.banner;
        const reader = new FileReader();
        bannerBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1]; // Remove data URL prefix
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        bannerFileName = file.name;
      }

      // Call Edge Function to update profile
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/save-profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId: currentUserId,
            profilePictureBase64,
            profilePictureFileName,
            bannerBase64,
            bannerFileName,
            bio: updates.bio,
          }),
        }
      );

      const data = await response.json();

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response data:', data);

      if (!response.ok || !data.success) {
        const errorMessage = data.message || data.error || 'Failed to update profile';
        console.error('❌ Profile update failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('✅ Profile updated successfully');
      
      // Refresh profile data
      await fetchUserProfile();
      
    } catch (err: any) {
      console.error('❌ Error updating profile:', err);
      throw err;
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
    const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setReleasesFilterOpen(false); };
    if (releasesFilterOpen) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [releasesFilterOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isLanguageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isLanguageDropdownOpen]);

  const renderPersonalInfo = () => (
    <div ref={personalRef} className="scroll-mt-6 space-y-3 lg:space-y-4">
        <div className="mb-1 lg:mb-0">
          <div className="flex items-center gap-2 lg:gap-3">
            <div
              onClick={handleProfilePictureClick}
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-md cursor-pointer hover:brightness-110 transition-all duration-200"
            >
              {profilePicturePreview ? (
                <img 
                  src={profilePicturePreview} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : userProfile?.profile_picture_url ? (
                <img 
                  src={userProfile.profile_picture_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <svg className="w-6 h-6 lg:w-8 lg:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-sm lg:text-base font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-xs lg:text-sm" style={{ color: 'var(--text-primary)' }}>
                {(formData.username || userProfile?.username) ? `@${formData.username || userProfile?.username}` : t('personalInfo.noUsername')}
              </p>
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

        <div className="grid grid-cols-2 gap-2 lg:gap-3">
          <div>
            <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: 'var(--text-primary)' }}>{t('personalInfo.firstName')}</label>
            <div className="flex items-center gap-1 lg:gap-2">
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
                className="flex-1 min-w-0 h-9 lg:h-10 px-2 lg:px-3 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: 'var(--text-primary)',
                  background: 'transparent',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: 'var(--text-primary)' }}>{t('personalInfo.lastName')}</label>
            <div className="flex items-center gap-1 lg:gap-2">
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                className="flex-1 min-w-0 h-9 lg:h-10 px-2 lg:px-3 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: 'var(--text-primary)',
                  background: 'transparent',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: 'var(--text-primary)' }}>{t('personalInfo.username')}</label>
          <div className="flex items-center gap-1 lg:gap-2">
            <div className="flex-1 flex items-center h-9 lg:h-10 px-2 lg:px-3 rounded-lg" style={{ background: 'transparent', border: '1px solid rgba(75, 85, 99, 0.5)' }}>
              <span className="text-xs lg:text-sm" style={{ color: 'var(--text-primary)' }}>@</span>
              <input
                type="text"
                value={formData.username}
                disabled
                className="flex-1 bg-transparent text-xs lg:text-sm focus:outline-none ml-1 opacity-50"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: 'var(--text-primary)' }}>{t('personalInfo.bio')}</label>
          <div className="flex items-center gap-1 lg:gap-2">
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              placeholder={t('personalInfo.bioPlaceholder')}
              className="flex-1 min-w-0 h-20 lg:h-24 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none"
              style={{
                color: 'var(--text-primary)',
                background: 'transparent',
                border: '1px solid rgba(75, 85, 99, 0.5)',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: 'var(--text-primary)' }}>{t('personalInfo.location')}</label>
          <div className="flex items-center gap-1 lg:gap-2">
            <div className="flex-1 min-w-0 flex items-center h-9 lg:h-10 px-2 lg:px-3 rounded-lg focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: 'transparent', border: '1px solid rgba(75, 85, 99, 0.5)' }}>
              <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isEditing && !isSaving) {
                    handleSaveChanges();
                  }
                }}
                disabled={!isEditing}
                className="flex-1 min-w-0 bg-transparent text-xs lg:text-sm focus:outline-none"
                style={{ color: 'var(--text-primary)' }}
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country} style={{ background: 'var(--bg-card)' }}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: 'var(--text-primary)' }}>{t('personalInfo.languagesPostIn')}</label>
          <div className="flex items-center gap-1 lg:gap-2">
            <div className="flex-1 min-w-0 flex items-center h-9 lg:h-10 px-2 lg:px-3 rounded-lg focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: 'transparent', border: '1px solid rgba(75, 85, 99, 0.5)' }}>
              <svg className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isEditing && !isSaving) {
                    handleSaveChanges();
                  }
                }}
                disabled={!isEditing}
                className="flex-1 min-w-0 bg-transparent text-xs lg:text-sm focus:outline-none"
                style={{ color: 'var(--text-primary)' }}
              >
                {LANGUAGES.map(language => (
                  <option key={language} value={language} style={{ background: 'var(--bg-card)' }}>{language}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: 'var(--text-primary)' }}>{t('personalInfo.email')}</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full h-9 lg:h-10 px-2 lg:px-3 rounded-lg text-xs lg:text-sm focus:outline-none opacity-50"
            style={{
              color: 'var(--text-primary)',
              background: 'transparent',
              border: '1px solid rgba(75, 85, 99, 0.5)',
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
          <div className="flex gap-3 pt-3 lg:pt-4">
            <button
              onClick={() => {
                setIsEditing(false);
                setProfilePicture(null);
                setProfilePicturePreview(userProfile?.profile_picture_url || null);
                setSaveError(null);
                // Reset form data to original values
                fetchUserProfile();
              }}
              className="px-6 py-2.5 lg:px-7 lg:py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm"
              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-2.5 lg:px-7 lg:py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              {isSaving ? t('common.saving') : t('personalInfo.saveChanges')}
            </button>
          </div>
        )}
      </div>
  );

  const renderConnectedAccounts = () => (
    <div ref={accountsRef} className="scroll-mt-6">
      <SocialLinksForm appliedTheme={appliedTheme} userType="artist" userId={currentUserId} />
    </div>
  );

  const renderAccountType = () => (
    <div ref={accountTypeRef} className="scroll-mt-6">
      <AccountTypeSection userType={userType} />
    </div>
  );

  const renderPayoutMethods = () => (
    <div ref={payoutRef} className="scroll-mt-6">
      {/* Tipalti Status at the top */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-2 h-2 rounded-full ${isTipaltiConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
          Tipalti: {isTipaltiConnected ? t('payment.tipaltiConnected') : t('payment.tipaltiNotConnected')}
        </span>
      </div>
      
      {/* Connect Account Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
        <button 
          onClick={() => setShowPaymentForm(true)}
          className="flex items-center gap-2.5 lg:gap-3 px-5 py-3.5 lg:px-5 lg:py-4 rounded-xl text-sm lg:text-sm font-medium transition-all duration-200 hover:brightness-110 border" 
          style={{ 
            backgroundColor: 'var(--bg-card)', 
            borderColor: 'var(--border-subtle)', 
            color: 'var(--text-primary)' 
          }}>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          {t('payment.connectPayment')}
        </button>
      </div>

      {/* Payment Method Form */}
      {showPaymentForm && (
        <div className="mt-8 w-full max-w-[450px] mx-auto">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('payment.paymentMethod')}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{t('payment.addPaymentDesc')}</p>
              </div>
              <button 
                onClick={() => setShowPaymentForm(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: 'var(--text-primary)' }}><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Error Message */}
            {saveError && (
              <div className="text-red-500 text-sm p-3 rounded-lg mb-6" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                {saveError}
              </div>
            )}

            <div className="space-y-6">
              {/* Payment Type Selection */}
              <div className="grid grid-cols-3 gap-4">
                <label className="flex flex-col items-center justify-between rounded-lg border p-4 cursor-pointer transition-all hover:bg-white/5" style={{ borderColor: paymentFormData.paymentType === 'card' ? 'var(--text-primary)' : '#2f2f2f', backgroundColor: paymentFormData.paymentType === 'card' ? 'rgba(255, 255, 255, 0.05)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="card"
                    checked={paymentFormData.paymentType === 'card'}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentType: e.target.value as 'card' | 'paypal' | 'apple' })}
                    className="sr-only"
                  />
                  <svg className="mb-3 h-6 w-6" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/>
                    <path d="M2 10h20" strokeWidth="2"/>
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('payment.card')}</span>
                </label>

                <label className="flex flex-col items-center justify-between rounded-lg border p-4 cursor-pointer transition-all hover:bg-white/5" style={{ borderColor: paymentFormData.paymentType === 'paypal' ? 'var(--text-primary)' : '#2f2f2f', backgroundColor: paymentFormData.paymentType === 'paypal' ? 'rgba(255, 255, 255, 0.05)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="paypal"
                    checked={paymentFormData.paymentType === 'paypal'}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentType: e.target.value as 'card' | 'paypal' | 'apple' })}
                    className="sr-only"
                  />
                  <svg className="mb-3 h-6 w-6" style={{ color: 'var(--text-primary)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('payment.paypal')}</span>
                </label>

                <label className="flex flex-col items-center justify-between rounded-lg border p-4 cursor-pointer transition-all hover:bg-white/5" style={{ borderColor: paymentFormData.paymentType === 'apple' ? 'var(--text-primary)' : '#2f2f2f', backgroundColor: paymentFormData.paymentType === 'apple' ? 'rgba(255, 255, 255, 0.05)' : 'transparent' }}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="apple"
                    checked={paymentFormData.paymentType === 'apple'}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentType: e.target.value as 'card' | 'paypal' | 'apple' })}
                    className="sr-only"
                  />
                  <svg className="mb-3 h-6 w-6" style={{ color: 'var(--text-primary)' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('payment.apple')}</span>
                </label>
              </div>

              {/* Card Details */}
              {paymentFormData.paymentType === 'card' && (
                <>
                  {/* Name on Card */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('payment.nameOnCard')}</label>
                    <input
                      type="text"
                      value={paymentFormData.nameOnCard}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, nameOnCard: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                      style={{
                        color: 'var(--text-primary)',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                      }}
                      placeholder="John Doe"
                      onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('payment.city')}</label>
                    <input
                      type="text"
                      value={paymentFormData.city}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, city: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                      style={{
                        color: 'var(--text-primary)',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                      }}
                      placeholder=""
                      onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('payment.cardNumber')}</label>
                    <input
                      type="text"
                      value={paymentFormData.cardNumber}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, cardNumber: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                      style={{
                        color: 'var(--text-primary)',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                      }}
                      placeholder=""
                      onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                    />
                  </div>

                  {/* Expiry and CVC */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Expiry Month */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('payment.expires')}</label>
                      <select
                        value={paymentFormData.expiryMonth}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, expiryMonth: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                        style={{
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                      >
                        <option value="" style={{ background: 'var(--bg-card)' }}>{t('payment.month')}</option>
                        <option value="1" style={{ background: 'var(--bg-card)' }}>{t('payment.january')}</option>
                        <option value="2" style={{ background: 'var(--bg-card)' }}>{t('payment.february')}</option>
                        <option value="3" style={{ background: 'var(--bg-card)' }}>{t('payment.march')}</option>
                        <option value="4" style={{ background: 'var(--bg-card)' }}>{t('payment.april')}</option>
                        <option value="5" style={{ background: 'var(--bg-card)' }}>{t('payment.may')}</option>
                        <option value="6" style={{ background: 'var(--bg-card)' }}>{t('payment.june')}</option>
                        <option value="7" style={{ background: 'var(--bg-card)' }}>{t('payment.july')}</option>
                        <option value="8" style={{ background: 'var(--bg-card)' }}>{t('payment.august')}</option>
                        <option value="9" style={{ background: 'var(--bg-card)' }}>{t('payment.september')}</option>
                        <option value="10" style={{ background: 'var(--bg-card)' }}>{t('payment.october')}</option>
                        <option value="11" style={{ background: 'var(--bg-card)' }}>{t('payment.november')}</option>
                        <option value="12" style={{ background: 'var(--bg-card)' }}>{t('payment.december')}</option>
                      </select>
                    </div>

                    {/* Expiry Year */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('payment.year')}</label>
                      <select
                        value={paymentFormData.expiryYear}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, expiryYear: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                        style={{
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                      >
                        <option value="" style={{ background: 'var(--bg-card)' }}>{t('payment.year')}</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i} value={`${new Date().getFullYear() + i}`} style={{ background: 'var(--bg-card)' }}>
                            {new Date().getFullYear() + i}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* CVC */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('payment.cvc')}</label>
                      <input
                        type="text"
                        value={paymentFormData.cvc}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, cvc: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                        style={{
                          color: 'var(--text-primary)',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                        }}
                        placeholder="CVC"
                        onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PayPal/Apple Pay placeholder */}
              {(paymentFormData.paymentType === 'paypal' || paymentFormData.paymentType === 'apple') && (
                <div className="text-center py-8" style={{ color: 'var(--text-primary)' }}>
                  <p className="text-sm">{paymentFormData.paymentType === 'paypal' ? t('payment.redirectPaypal') : t('payment.redirectApple')}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSavePaymentMethod}
                disabled={isSaving}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                {isSaving ? t('payment.processing') : t('payment.addPaymentMethod')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const handleToggleNewFeatures = async () => {
    const newValue = !emailNewFeatures;
    setEmailNewFeatures(newValue);
    await saveNotificationPreference('email_new_features', newValue);
  };

  const handleToggleMessageNotifications = () => {
    setMessageNotifications(prev => !prev);
  };

  const handleTogglePlatformUpdates = async () => {
    const newValue = !emailPlatformUpdates;
    setEmailPlatformUpdates(newValue);
    await saveNotificationPreference('email_platform_updates', newValue);
  };

  const handleSavePaymentMethod = async () => {
    if (!currentUserId) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Validate required fields
      if (paymentFormData.paymentType === 'card') {
        if (!paymentFormData.nameOnCard || !paymentFormData.cardNumber || !paymentFormData.expiryMonth || !paymentFormData.expiryYear || !paymentFormData.cvc) {
          setSaveError(t('payment.fillAllFields'));
          return;
        }
      }
      
      // Here you would typically send the payment method data to your backend
      // For now, we'll just simulate a successful save
      console.log('Saving payment method:', paymentFormData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      alert(t('payment.paymentSuccess'));
      
      // Reset form and close
      setPaymentFormData({
        paymentType: 'card',
        nameOnCard: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        city: '',
        billingAddress: ''
      });
      setShowPaymentForm(false);
      
      // Update Tipalti status to connected
      setIsTipaltiConnected(true);
      
    } catch (error: any) {
      console.error('Error saving payment method:', error);
      setSaveError(error.message || 'Failed to save payment method');
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotificationPreference = async (field: 'email_new_features' | 'email_platform_updates', value: boolean) => {
    if (!currentUserId) return;

    setIsSavingNotifications(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ [field]: value })
        .eq('id', currentUserId);

      if (error) {
        console.error('Error saving notification preference:', error);
        // Revert the state change on error
        if (field === 'email_new_features') {
          setEmailNewFeatures(!value);
        } else {
          setEmailPlatformUpdates(!value);
        }
      }
    } catch (err) {
      console.error('Error saving notification preference:', err);
      // Revert the state change on error
      if (field === 'email_new_features') {
        setEmailNewFeatures(!value);
      } else {
        setEmailPlatformUpdates(!value);
      }
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const renderNotifications = () => (
    <div ref={notificationsRef} className="scroll-mt-6">

      <div className="space-y-3 lg:space-y-8">
        <div>
          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: 'var(--text-primary)' }}>Interface</h3>
          <div className="space-y-3 lg:space-y-6">
            <div className="flex items-center justify-between pb-3 lg:pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Message Notifications</h4>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Show notification dropdown for unread messages</p>
              </div>
              <ToggleSwitch
                isActive={messageNotifications}
                onToggle={handleToggleMessageNotifications}
                backgroundTheme={backgroundTheme}
              />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: 'var(--text-primary)' }}>{t('notifications.email')}</h3>

          <div className="space-y-3 lg:space-y-6">
            <div className="flex items-center justify-between pb-3 lg:pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('notifications.newFeatures')}</h4>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('notifications.newFeaturesDesc')}</p>
              </div>
              <ToggleSwitch
                isActive={emailNewFeatures}
                onToggle={handleToggleNewFeatures}
                backgroundTheme={backgroundTheme}
                disabled={isSavingNotifications}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('notifications.platformUpdates')}</h4>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('notifications.platformUpdatesDesc')}</p>
              </div>
              <ToggleSwitch
                isActive={emailPlatformUpdates}
                onToggle={handleTogglePlatformUpdates}
                backgroundTheme={backgroundTheme}
                disabled={isSavingNotifications}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSendFeedback = () => {
    const categoryMap: Record<string, string> = {
      'suggestion': 'suggestion',
      'bug-report': 'bug',
      'feature-request': 'feature',
      'other': 'other',
    };
    const handleSubmitFeedback = async () => {
      if (!feedbackCategory || !feedbackText.trim()) return;
      setFeedbackSubmitting(true);
      try {
        let mediaUrl: string | null = null;
        if (feedbackMedia) {
          const ext = feedbackMedia.name.split('.').pop();
          const path = `feedback/${currentUserId}/${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from('feedback-media').upload(path, feedbackMedia, { upsert: true });
          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from('feedback-media').getPublicUrl(path);
            mediaUrl = urlData?.publicUrl ?? null;
          }
        }
        const { error } = await supabase.from('feedback').insert({
          user_id: currentUserId,
          category: categoryMap[feedbackCategory],
          content: feedbackText.trim(),
          status: 'pending',
          ...(mediaUrl ? { media_url: mediaUrl } : {}),
        });
        if (error) {
          console.error('❌ Feedback insert error:', error);
        } else {
          setFeedbackSubmitted(true);
          setFeedbackCategory(null);
          setFeedbackText('');
          setFeedbackMedia(null);
          setFeedbackMediaPreview(null);
          setTimeout(() => setFeedbackSubmitted(false), 4000);
        }
      } finally {
        setFeedbackSubmitting(false);
      }
    };
    return (
    <div className="scroll-mt-6">
      {feedbackSubmitted && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--text-primary)' }}>
          <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#22C55E' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Thanks! Your feedback has been submitted and will help shape the product roadmap.
        </div>
      )}
      <div className="space-y-5">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('feedback.category')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFeedbackCategory('suggestion')}
              className="w-full text-left px-3 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 hover:brightness-105"
              style={{
                backgroundColor: feedbackCategory === 'suggestion' ? 'var(--bg-elevated)' : 'transparent',
                color: 'var(--text-primary)',
                border: feedbackCategory === 'suggestion' ? '1px solid var(--text-primary)' : `1px solid var(--border-subtle)`,
              }}
            >
              <SuggestionIcon isHovered={feedbackCategory === 'suggestion'} />
              <span>{t('feedback.suggestion')}</span>
            </button>
            
            <button
              onClick={() => setFeedbackCategory('bug-report')}
              className="w-full text-left px-3 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 hover:brightness-105"
              style={{
                backgroundColor: feedbackCategory === 'bug-report' ? 'var(--bg-elevated)' : 'transparent',
                color: 'var(--text-primary)',
                border: feedbackCategory === 'bug-report' ? '1px solid var(--text-primary)' : `1px solid var(--border-subtle)`,
              }}
            >
              <BugReportIcon isHovered={feedbackCategory === 'bug-report'} />
              <span>{t('feedback.bugReport')}</span>
            </button>
            
            <button
              onClick={() => setFeedbackCategory('feature-request')}
              className="w-full text-left px-3 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 hover:brightness-105"
              style={{
                backgroundColor: feedbackCategory === 'feature-request' ? 'var(--bg-elevated)' : 'transparent',
                color: 'var(--text-primary)',
                border: feedbackCategory === 'feature-request' ? '1px solid var(--text-primary)' : `1px solid var(--border-subtle)`,
              }}
            >
              <FeatureRequestIcon isHovered={feedbackCategory === 'feature-request'} />
              <span>{t('feedback.featureRequest')}</span>
            </button>
            
            <button
              onClick={() => setFeedbackCategory('other')}
              className="w-full text-left px-3 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 hover:brightness-105"
              style={{
                backgroundColor: feedbackCategory === 'other' ? 'var(--bg-elevated)' : 'transparent',
                color: 'var(--text-primary)',
                border: feedbackCategory === 'other' ? '1px solid var(--text-primary)' : `1px solid var(--border-subtle)`,
              }}
            >
              <OtherIcon isHovered={feedbackCategory === 'other'} />
              <span>{t('feedback.other')}</span>
            </button>
          </div>
        </div>

        {/* Feedback Textarea */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('feedback.yourFeedback')}
          </label>
          <textarea
            placeholder={t('feedback.feedbackPlaceholder')}
            rows={5}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200 focus:outline-none"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
          />
        </div>

        {/* Media Attachment */}
        <div>
          <input
            ref={feedbackMediaInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFeedbackMedia(file);
                setFeedbackMediaPreview(URL.createObjectURL(file));
              }
            }}
          />
          {feedbackMediaPreview ? (
            <div className="relative inline-block">
              {feedbackMedia?.type.startsWith('video/') ? (
                <video src={feedbackMediaPreview} className="max-h-40 rounded-xl object-cover" controls />
              ) : (
                <img src={feedbackMediaPreview} alt="Attachment" className="max-h-40 rounded-xl object-cover" />
              )}
              <button
                onClick={() => { setFeedbackMedia(null); setFeedbackMediaPreview(null); }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all hover:brightness-110"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ color: 'var(--text-primary)' }}><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => feedbackMediaInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:brightness-110"
              style={{ backgroundColor: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Attach image or video
            </button>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => { setFeedbackCategory(null); setFeedbackText(''); setFeedbackMedia(null); setFeedbackMediaPreview(null); }}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmitFeedback}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-105"
            style={{
              backgroundColor: feedbackCategory && feedbackText.trim() ? 'var(--text-primary)' : 'transparent',
              color: feedbackCategory && feedbackText.trim() ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: feedbackCategory && feedbackText.trim() ? 'none' : '1px solid var(--border-subtle)',
              opacity: feedbackSubmitting ? 0.7 : 1,
            }}
            disabled={!feedbackCategory || !feedbackText.trim() || feedbackSubmitting}
          >
            {feedbackSubmitting ? 'Submitting...' : t('feedback.submitFeedback')}
          </button>
        </div>
      </div>
    </div>
    );
  };

  const renderGuides = () => {
    const guideCategories = [
      {
        id: 'faq',
        icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
        title: 'Frequently Asked Questions',
        desc: 'Answers to questions we\'re asked the most often.',
        count: '27 articles',
        articles: [],
      },
      {
        id: 'basics',
        icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>),
        title: 'The Basics',
        desc: 'How to get started releasing music.',
        count: '6 articles',
        articles: [
          { id: 'amazon-artist-id', title: 'How do I find my Amazon Music Artist ID?' },
          { id: 'apple-music-id', title: 'How do I find my Apple Music ID?' },
          { id: 'spotify-id', title: 'How do I find my Spotify ID?' },
          { id: 'soundcloud-id', title: 'How do I find my SoundCloud ID?' },
          { id: 'deezer-id', title: 'How do I find my Deezer Artist ID?' },
          { id: 'audiomack-id', title: 'How do I find my Audiomack Artist ID?' },
        ],
      },
      {
        id: 'uploading',
        icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>),
        title: 'Uploading Music',
        desc: 'Advice on using our Release Builder.',
        count: '23 articles',
        articles: [],
      },
      {
        id: 'edits',
        icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>),
        title: 'Making Edits',
        desc: 'How to make changes to your releases.',
        count: '5 articles',
        articles: [],
      },
      {
        id: 'paid',
        icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>),
        title: 'Getting Paid',
        desc: 'How royalties and payouts work on Elevate.',
        count: '12 articles',
        articles: [],
      },
      {
        id: 'campaigns',
        icon: (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 11l19-9-9 19-2-8-8-2z" /></svg>),
        title: 'Campaigns & Earnings',
        desc: 'Submit clips and earn from brand campaigns.',
        count: '9 articles',
        articles: [],
      },
    ];

    type GuideArticle = { id: string; title: string };

    // Shared breadcrumb row
    const Breadcrumb = ({ crumbs }: { crumbs: { label: string; onClick?: () => void }[] }) => (
      <div className="flex items-center gap-1.5 flex-wrap mb-5">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.3 }}><path d="M9 18l6-6-6-6"/></svg>
            )}
            {crumb.onClick ? (
              <button onClick={crumb.onClick} className="text-xs font-medium transition-all hover:opacity-100" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>{crumb.label}</button>
            ) : (
              <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );

    // Article detail page
    if (guideArticle && guideSubpage) {
      const cat = guideCategories.find(c => c.id === guideSubpage);
      const article = (cat?.articles as GuideArticle[])?.find(a => a.id === guideArticle);
      type ArticleBlock =
        | { type: 'p'; text: string }
        | { type: 'note'; text: string }
        | { type: 'step'; n: number; text: string }
        | { type: 'img'; src: string; alt: string };

      const articleContent: Record<string, ArticleBlock[]> = {
        'amazon-artist-id': [
          { type: 'p', text: 'Your Amazon Music Artist ID allows us to correctly link your releases to the right artist profile on Amazon Music.' },
          { type: 'p', text: 'To locate your Artist ID, go to Amazon Music and search for your artist name. Open your artist profile page once you\'ve found it.' },
          { type: 'p', text: 'Look at the URL in your browser\'s address bar. In the link, find the section that appears after /artists/ — the combination of letters and numbers that follows is your Artist ID.' },
          { type: 'img', src: '/ff.png', alt: 'Amazon Music artist page URL example' },
          { type: 'p', text: 'Be sure to add your Amazon Music Artist ID to your Elevate Artist Dashboard before submitting any new releases to Amazon Music.' },
        ],
        'apple-music-id': [
          { type: 'p', text: 'Your Apple Music Artist ID is a unique numeric identifier that links your releases to the correct artist profile on Apple Music.' },
          { type: 'p', text: 'How to locate your Apple Music ID:' },
          { type: 'step', n: 1, text: 'Visit your Artist Page on Apple Music and click the three dots beneath your profile image.' },
          { type: 'step', n: 2, text: 'Choose Share, then select Copy Link.' },
          { type: 'img', src: '/ww.png', alt: 'Apple Music share menu' },
          { type: 'step', n: 3, text: 'Paste the copied link into your browser. The series of numbers at the end of the URL is your Apple Music Artist ID.' },
          { type: 'img', src: '/Screenshot 2026-02-23 at 1.20.05 PM.png', alt: 'Apple Music URL showing Artist ID' },
          { type: 'note', text: 'Important: Always include your Apple Music Artist ID when uploading new releases to ensure your music is delivered to the correct profile.' },
          { type: 'note', text: 'You can add an Apple Music ID for any artist on your account by going to their Artist Dashboard and entering the ID into the Apple Music ID field.' },
          { type: 'note', text: 'If you experience any issues adding your Apple Music ID, please contact our support team and we\'ll be happy to help.' },
        ],
        'spotify-id': [
          { type: 'p', text: 'Your Spotify ID is a unique string of characters that identifies your artist profile on Spotify.' },
          { type: 'p', text: 'Here\'s how to find it:' },
          { type: 'step', n: 1, text: 'Head to your Artist Page on Spotify and click on the 3 dots below your artist name.' },
          { type: 'step', n: 2, text: 'Select Share from the menu and click Copy link to artist.' },
          { type: 'img', src: '/Screenshot 2026-02-23 at 1.21.05 PM.png', alt: 'Spotify share menu' },
          { type: 'step', n: 3, text: 'Paste this link into a browser. Your Spotify ID is the string of characters located between /artist/ and ?' },
          { type: 'img', src: '/Screenshot 2026-02-23 at 1.22.29 PM.png', alt: 'Spotify URL showing Artist ID' },
          { type: 'note', text: 'Note: Make sure you provide your Spotify ID whenever you upload new releases to Spotify. This will make sure your music is always mapped to the correct artist profile.' },
          { type: 'note', text: 'You can enter your Spotify ID for any artists on your account by heading to their Artist Dashboard and pasting it into the Spotify ID field.' },
          { type: 'note', text: 'If you\'re having trouble with your Spotify ID, please reach out to our support team.' },
        ],
        'soundcloud-id': [
          { type: 'p', text: 'Your SoundCloud ID helps identify your artist profile on SoundCloud.' },
          { type: 'p', text: 'To find your ID, just head to your SoundCloud Artist Page and copy the name after the \'/\' as shown below.' },
          { type: 'p', text: 'This is your SoundCloud ID.' },
          { type: 'img', src: '/Screenshot 2026-02-23 at 1.30.09 PM.png', alt: 'SoundCloud URL showing artist ID' },
          { type: 'note', text: 'Don\'t forget to provide your SoundCloud ID before you upload new releases to SoundCloud. This will make sure your music is always mapped to the correct artist profile.' },
          { type: 'note', text: 'You can enter your SoundCloud ID for any artists on your account by heading to their Artist Dashboard and pasting it into the SoundCloud ID field.' },
        ],
        'deezer-id': [
          { type: 'p', text: 'Your Deezer Artist ID helps us to map your music to the right profile on Deezer.' },
          { type: 'p', text: 'You\'ll find your Deezer ID at the end of your Deezer Artist Profile URL.' },
          { type: 'img', src: '/Screenshot 2026-02-23 at 1.31.06 PM.png', alt: 'Deezer artist profile URL showing ID' },
          { type: 'note', text: 'Make sure to add your Deezer ID on your Artist Dashboard before you upload new releases to Deezer.' },
          { type: 'note', text: 'You can submit the Deezer ID of any artists on your account by heading to their Artist Dashboard. Hit the Edit artist profile button and paste it into the Deezer ID field.' },
        ],
        'audiomack-id': [
          { type: 'p', text: 'Your Audiomack Artist ID helps us link your music to the correct artist profile on Audiomack. Here\'s how to find it.' },
          { type: 'p', text: 'Log into your Audiomack account or create a new one and select Creator Dashboard from the dropdown arrow at the top right next to your profile picture.' },
          { type: 'p', text: 'You\'ll find your Audiomack Artist ID in the top left corner below your name and profile picture. You can click it and select Copy Artist ID.' },
          { type: 'img', src: '/Screenshot 2026-02-23 at 1.32.47 PM.png', alt: 'Audiomack Creator Dashboard showing Artist ID' },
          { type: 'note', text: 'Make sure to add your Audiomack ID on your Artist Dashboard.' },
          { type: 'note', text: 'You can submit it for any artists on your account by heading to your Artist Dashboard. Hit the Edit artist profile button and paste it into the Audiomack ID field.' },
        ],
      };
      const blocks = articleContent[guideArticle];

      const renderBlock = (block: ArticleBlock, i: number) => {
        switch (block.type) {
          case 'p':
            return <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>{block.text}</p>;
          case 'note':
            return <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)', opacity: 0.65 }}>{block.text}</p>;
          case 'step':
            return (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>{block.n}</span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>{block.text}</span>
              </li>
            );
          case 'img':
            return (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                <img
                  src={block.src}
                  alt={block.alt}
                  className="w-full block"
                  style={{ display: 'block' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).parentElement!.style.display = 'none'; }}
                />
              </div>
            );
          default:
            return null;
        }
      };

      // Group consecutive steps into <ol> wrappers
      const groupedBlocks: React.ReactNode[] = [];
      let stepBuffer: ArticleBlock[] = [];
      let stepStartIdx = 0;
      let notesDividerAdded = false;
      blocks?.forEach((block, i) => {
        if (block.type === 'step') {
          if (stepBuffer.length === 0) stepStartIdx = i;
          stepBuffer.push(block);
        } else {
          if (stepBuffer.length > 0) {
            groupedBlocks.push(
              <ol key={`ol-${stepStartIdx}`} className="space-y-3 pl-1">
                {stepBuffer.map((s, si) => renderBlock(s, stepStartIdx + si))}
              </ol>
            );
            stepBuffer = [];
          }
          if (block.type === 'note' && !notesDividerAdded) {
            notesDividerAdded = true;
            groupedBlocks.push(<div key="notes-divider" style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '16px' }} />);
          }
          groupedBlocks.push(renderBlock(block, i));
        }
      });
      if (stepBuffer.length > 0) {
        groupedBlocks.push(
          <ol key={`ol-${stepStartIdx}`} className="space-y-3 pl-1">
            {stepBuffer.map((s, si) => renderBlock(s, stepStartIdx + si))}
          </ol>
        );
      }

      return (
        <div key={`article-${guideArticle}`} className="scroll-mt-6 animate-fade-in">
          <Breadcrumb crumbs={[
            { label: 'Guides', onClick: () => { setGuideSubpage(null); setGuideArticle(null); } },
            { label: cat?.title || '', onClick: () => setGuideArticle(null) },
            { label: article?.title || '' },
          ]} />
          <h2 className="text-xl font-bold mb-6 leading-snug" style={{ color: 'var(--text-primary)' }}>{article?.title}</h2>
          {blocks ? (
            <div className="space-y-4">{groupedBlocks}</div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Content coming soon.</p>
          )}
        </div>
      );
    }

    // Category subpage (article list)
    if (guideSubpage) {
      const cat = guideCategories.find(c => c.id === guideSubpage);
      if (cat) {
        const arts = cat.articles as GuideArticle[];
        return (
          <div key={`subpage-${guideSubpage}`} className="scroll-mt-6 animate-fade-in">
            <Breadcrumb crumbs={[
              { label: 'Guides', onClick: () => setGuideSubpage(null) },
              { label: cat.title },
            ]} />
            <h3 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{cat.title}</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-primary)', opacity: 0.55 }}>{arts.length} articles</p>
            {arts.length > 0 ? (
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                {arts.map((article, idx) => (
                  <button
                    key={article.id}
                    onClick={() => setGuideArticle(article.id)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left transition-all"
                    style={{ backgroundColor: 'var(--bg-card)', borderBottom: idx < arts.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
                  >
                    <span className="text-sm font-medium pr-4" style={{ color: 'var(--text-primary)' }}>{article.title}</span>
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.4 }}><path d="M9 5l7 7-7 7"/></svg>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-sm rounded-2xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', opacity: 0.5 }}>
                No articles yet in this category.
              </div>
            )}
          </div>
        );
      }
    }

    // Root guides list
    const filtered = guideCategories.filter(c =>
      !guideSearch.trim() ||
      c.title.toLowerCase().includes(guideSearch.toLowerCase()) ||
      c.desc.toLowerCase().includes(guideSearch.toLowerCase())
    );
    return (
      <div key="guides-root" className="scroll-mt-6 animate-fade-in">
        <div className="px-1 pb-6">
          <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>How can we help?</h3>
          <p className="text-sm" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>Browse guides and tutorials to get the most out of Elevate.</p>
        </div>
        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-primary)', opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Search for articles..."
            value={guideSearch}
            onChange={e => setGuideSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm focus:outline-none transition-all"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
            onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
          />
        </div>
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>No articles found for "{guideSearch}"</div>
          ) : filtered.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => (cat.articles as GuideArticle[]).length > 0 ? setGuideSubpage(cat.id) : undefined}
              className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl text-left transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', cursor: (cat.articles as GuideArticle[]).length > 0 ? 'pointer' : 'default' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
              onMouseDown={e => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
              onMouseUp={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                {cat.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{cat.title}</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)', opacity: 0.6 }}>{cat.desc}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm" style={{ color: 'var(--text-primary)', opacity: 0.45 }}>{cat.count}</span>
                <svg className="w-4 h-4" style={{ color: 'var(--text-primary)', opacity: 0.35 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderLogOut = () => (
    <div className="scroll-mt-6 flex gap-3">
      <button 
        className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110" 
        style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
        onClick={() => {
          // Clear user session and redirect to login
          // Clear all localStorage except theme
          const theme = localStorage.getItem('theme');
          const backgroundTheme = localStorage.getItem('backgroundTheme');
          const appliedTheme = localStorage.getItem('appliedTheme');
          localStorage.clear();
          // Restore theme settings
          if (theme) localStorage.setItem('theme', theme);
          if (backgroundTheme) localStorage.setItem('backgroundTheme', backgroundTheme);
          if (appliedTheme) localStorage.setItem('appliedTheme', appliedTheme);
          sessionStorage.clear();
          window.location.href = '/login';
        }}
      >
        {t('common.logOut')}
      </button>
      <button 
        className="px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200" 
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
        onClick={() => setActiveSection('home')}
      >
        {t('common.cancel')}
      </button>
    </div>
  );

  const renderDisplay = () => {
    const getPreviewBackground = () => 'var(--bg-primary)';
    const getPreviewTextColor = () => 'var(--text-primary)';
    const getPreviewSecondaryTextColor = () => 'var(--text-primary)';

    return (
      <div className="scroll-mt-6">
        <div className="space-y-6 lg:space-y-8">
          {/* Preview Section */}
          <div>
            <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: 'var(--text-primary)' }}>{t('display.preview')}</h3>
            <div 
              className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border transition-all duration-300"
              style={{ 
                backgroundColor: getPreviewBackground(), 
                borderColor: 'var(--border-subtle)' 
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden"
                  style={{ 
                    backgroundColor: 'var(--bg-elevated)',
                  }}
                >
                  <img
                    src={ELEVATE_ADMIN_AVATAR_URL}
                    alt="Elevate"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 flex items-center">
                  <h4 className="font-semibold" style={{ color: getPreviewTextColor() }}>Elevate</h4>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="mb-3" style={{ color: getPreviewTextColor() }}>
                  {t('display.previewText')}
                </p>
              </div>
            </div>
          </div>

          {/* Background Selector */}
          <div>
            <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: 'var(--text-primary)' }}>{t('display.backgroundTheme')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {/* Navy Option */}
              <div 
                className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                  backgroundTheme === 'light' ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: '#192231' }}
                onClick={() => setBackgroundTheme('light')}
              >
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    backgroundTheme === 'light' 
                      ? 'bg-white border-white' 
                      : 'bg-white border-gray-400'
                  }`}>
                    {backgroundTheme === 'light' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="w-full h-20 rounded-lg bg-gray-700 mb-2"></div>
                  <div className="h-2 bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                </div>
                <h4 className="font-semibold mb-1" style={{ color: '#ffffff' }}>{t('display.navy')}</h4>
                <p className="text-sm" style={{ color: backgroundTheme === 'white' ? '#ffffff' : '#CBD5E1' }}>{t('display.navyDesc')}</p>
              </div>

              {/* Grey Option */}
              <div 
                className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                  backgroundTheme === 'grey' ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: '#222226' }}
                onClick={() => setBackgroundTheme('grey')}
              >
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    backgroundTheme === 'grey' 
                      ? 'bg-white border-white' 
                      : 'bg-white border-gray-400'
                  }`}>
                    {backgroundTheme === 'grey' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="w-full h-20 rounded-lg bg-gray-800 mb-2"></div>
                  <div className="h-2 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                </div>
                <h4 className="font-semibold mb-1" style={{ color: '#ffffff' }}>{t('display.grey')}</h4>
                <p className="text-sm" style={{ color: backgroundTheme === 'white' ? '#ffffff' : '#CBD5E1' }}>{t('display.greyDesc')}</p>
              </div>

              {/* Rose Option */}
              <div
                className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                  backgroundTheme === 'rose' ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: '#140a12' }}
                onClick={() => setBackgroundTheme('rose')}
              >
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    backgroundTheme === 'rose'
                      ? 'bg-white border-white'
                      : 'bg-white border-gray-400'
                  }`}>
                    {backgroundTheme === 'rose' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="w-full h-20 rounded-lg mb-2" style={{ backgroundColor: '#1C1018' }}></div>
                  <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: '#2E1A28' }}></div>
                  <div className="h-2 rounded w-1/2" style={{ backgroundColor: '#2E1A28' }}></div>
                </div>
                <h4 className="font-semibold mb-1" style={{ color: '#ffffff' }}>Rose</h4>
                <p className="text-sm" style={{ color: backgroundTheme === 'white' ? '#ffffff' : '#CBD5E1' }}>Midnight rose</p>
              </div>

              {/* Dark Option */}
              <div 
                className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                  backgroundTheme === 'dark' ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: '#0a0a0a' }}
                onClick={() => setBackgroundTheme('dark')}
              >
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    backgroundTheme === 'dark' 
                      ? 'bg-white border-white' 
                      : 'bg-white border-gray-400'
                  }`}>
                    {backgroundTheme === 'dark' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="w-full h-20 rounded-lg bg-gray-900 mb-2"></div>
                  <div className="h-2 bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-gray-800 rounded w-1/2"></div>
                </div>
                <h4 className="font-semibold mb-1" style={{ color: '#ffffff' }}>{t('display.dark')}</h4>
                <p className="text-sm" style={{ color: backgroundTheme === 'white' ? '#ffffff' : '#CBD5E1' }}>{t('display.darkDesc')}</p>
              </div>

              {/* Light Option */}
              <div
                className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                  backgroundTheme === 'white' ? 'border-gray-400' : 'border-gray-300'
                }`}
                style={{ backgroundColor: '#FFFFFF' }}
                onClick={() => setBackgroundTheme('white')}
              >
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    backgroundTheme === 'white'
                      ? 'bg-gray-800 border-gray-800'
                      : 'bg-gray-200 border-gray-400'
                  }`}>
                    {backgroundTheme === 'white' && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="w-full h-20 rounded-lg mb-2" style={{ backgroundColor: '#F1F5F9' }}></div>
                  <div className="h-2 rounded w-3/4 mb-2" style={{ backgroundColor: '#CBD5E1' }}></div>
                  <div className="h-2 rounded w-1/2" style={{ backgroundColor: '#CBD5E1' }}></div>
                </div>
                <h4 className="font-semibold mb-1 text-gray-900">Light</h4>
                <p className="text-sm text-gray-600">Clean white</p>
              </div>
            </div>

            {/* Flat background toggle */}
            <div className="flex items-center justify-between mt-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
              <div>
                <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No secondary color</h4>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>Use a single flat color across the entire background</p>
              </div>
              <ToggleSwitch isActive={flatBackground} onToggle={() => setFlatBackground(!flatBackground)} backgroundTheme={backgroundTheme} />
            </div>
          </div>

          {/* Sidebar Settings */}
          <div>
            <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: 'var(--text-primary)' }}>{t('display.sidebar')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('display.keepCollapsed')}</p>
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{t('display.keepCollapsedDesc')}</p>
                  </div>
                </div>
                <ToggleSwitch
                  isActive={sidebarPermanentlyCollapsed}
                  onToggle={() => setSidebarPermanentlyCollapsed(!sidebarPermanentlyCollapsed)}
                  backgroundTheme={backgroundTheme}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const languageOptions: { name: string; icon: string }[] = [
    { name: 'English', icon: 'EN' },
    { name: 'Spanish', icon: 'ES' },
    { name: 'French', icon: 'FR' },
    { name: 'German', icon: 'DE' },
    { name: 'Italian', icon: 'IT' },
    { name: 'Portuguese', icon: 'PT' },
    { name: 'Dutch', icon: 'NL' },
    { name: 'Russian', icon: 'RU' },
    { name: 'Chinese (Mandarin)', icon: '中文' },
    { name: 'Japanese', icon: '日本語' },
    { name: 'Korean', icon: '한국어' },
    { name: 'Arabic', icon: 'العربية' },
    { name: 'Hindi', icon: 'हिन्दी' },
    { name: 'Bengali', icon: 'বাংলা' },
    { name: 'Turkish', icon: 'TR' },
  ];

  const getLanguageIcon = (languageName: string) => {
    const lang = languageOptions.find(l => l.name === languageName);
    return lang?.icon || '🌐';
  };

  const renderLanguages = () => (
    <div className="scroll-mt-6">

      <div className="space-y-3 lg:space-y-8">
        <div>
          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: 'var(--text-primary)' }}>{t('language.interfaceLanguage')}</h3>

          <div className="space-y-3 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 lg:pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('language.displayLanguage')}</h4>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('language.chooseLanguage')}</p>
              </div>
              <div className="relative w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]" ref={languageDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
                  style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base lg:text-lg transition-all duration-200 group-hover:scale-110">{getLanguageIcon(selectedLanguage)}</span>
                    <span className="transition-all duration-200">{selectedLanguage}</span>
                  </div>
                  <svg className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M6 9l6 6 6-6"/></svg>
                </button>

                {isLanguageDropdownOpen && (
                  <div
                    className="absolute z-50 w-full mt-1 rounded-lg shadow-xl overflow-hidden animate-fade-in-down"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="max-h-60 overflow-y-auto">
                      {languageOptions.map((option) => {
                        const isSelected = option.name === selectedLanguage;
                        return (
                          <button
                            key={option.name}
                            type="button"
                            onClick={() => {
                              setSelectedLanguage(option.name);
                              const localeCode = LANGUAGE_MAP[option.name] || 'en';
                              i18n.changeLanguage(localeCode);
                              localStorage.setItem('displayLanguage', localeCode);
                              setIsLanguageDropdownOpen(false);
                            }}
                            className="w-full px-3 lg:px-4 py-2 lg:py-2.5 text-left text-sm lg:text-base transition-all duration-200 flex items-center gap-2 group/option relative"
                            style={{
                              backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
                              color: 'var(--text-primary)',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                              }
                              e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                              e.currentTarget.style.transform = 'translateX(0)';
                            }}
                          >
                            <span className="text-base transition-all duration-300 group-hover/option:scale-125">{option.icon}</span>
                            <span className="transition-all duration-200">{option.name}</span>
                            {isSelected && (
                              <span className="ml-auto text-xs transition-all duration-200" style={{ color: 'var(--text-primary)' }}>✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: 'var(--text-primary)' }}>{t('language.contentPreferences')}</h3>

          <div className="space-y-3 lg:space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('language.autoTranslate')}</h4>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('language.autoTranslateDesc')}</p>
              </div>
              <ToggleSwitch
                isActive={false}
                onToggle={() => {}}
                backgroundTheme={backgroundTheme}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <FeedbackModal 
        isOpen={showFeedbackModal && !!currentUserId} 
        onClose={() => setShowFeedbackModal(false)} 
        userId={currentUserId || ''}
      />
      <MessageToast
        userId={currentUserId || null}
        activeSection={activeSection}
        onNavigateToMessages={handleNavigateToMessages}
        theme={backgroundTheme}
        enabled={messageNotifications}
      />
      <div className="min-h-screen text-white flex transition-colors duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <DoorTransition showTransition={false} />
        
        {/* Left Sidebar - Desktop Only */}
        <CollapsibleSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          userProfile={userProfile || cachedProfile}
          unreadCount={unreadCount}
          cachedProfilePic={cachedProfilePic}
          isCollapsed={sidebarPermanentlyCollapsed ? true : sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          permanentlyCollapsed={sidebarPermanentlyCollapsed}
          userType="artist"
        />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          unreadCount={unreadCount}
          profilePicture={cachedProfilePic || profilePicturePreview || userProfile?.profile_picture_url}
          backgroundTheme={appliedTheme}
        />

        {/* Main Content Area - margin adjusts based on sidebar state */}
        <main 
          className={`flex-1 min-h-screen pb-20 lg:pb-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarPermanentlyCollapsed || sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[240px]'}`}
          style={{ 
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
          }}
        >

        {activeSection === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            cachedProfilePic={cachedProfilePic}
            onBack={() => setActiveSection('home')}
            onUpdateProfile={handleUpdateProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            onEditProfile={() => {
              setActiveSection('settings');
              setIsEditing(true);
            }}
            appliedTheme={backgroundTheme}
          />
        )}

        {activeSection === 'messages' && (
          <div className="animate-fade-in flex-1 flex flex-col min-h-0 overflow-hidden h-[calc(100vh-80px)] lg:h-screen">
            {currentUserId ? (
              <MessagesPage currentUserId={currentUserId} backgroundTheme={backgroundTheme} userType="artist" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'earnings' && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            {/* Summary Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
              {/* Available Balance Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 flex flex-col border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t('earnings.availableBalance')}</h3>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="mt-auto">
                  <div className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>0.00</div>
                </div>
              </div>

              {/* Pending Balance Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Pending balance</h3>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>0.00</div>
              </div>

              {/* Lifetime Earnings Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Lifetime earnings</h3>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>0.00</div>
              </div>

              {/* Affiliate Earnings Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t('earnings.affiliateEarnings')}</h3>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>0.00</div>
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setEarningsTab('available')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200" 
                  style={{ backgroundColor: earningsTab === 'available' ? 'var(--bg-elevated)' : 'transparent', color: earningsTab === 'available' ? 'var(--text-primary)' : '#CBD5E1', border: earningsTab === 'available' ? '1.5px solid rgba(148, 163, 184, 0.3)' : '1px solid transparent' }}
                >
                  Available
                </button>
                <button 
                  onClick={() => setEarningsTab('pending')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-105" 
                  style={{ backgroundColor: earningsTab === 'pending' ? 'var(--bg-elevated)' : 'transparent', color: earningsTab === 'pending' ? 'var(--text-primary)' : '#CBD5E1', border: earningsTab === 'pending' ? '1.5px solid rgba(148, 163, 184, 0.3)' : '1px solid transparent' }}
                >
                  Pending
                </button>
                <button 
                  onClick={() => setEarningsTab('paidout')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-105" 
                  style={{ backgroundColor: earningsTab === 'paidout' ? 'var(--bg-elevated)' : 'transparent', color: earningsTab === 'paidout' ? 'var(--text-primary)' : '#CBD5E1', border: earningsTab === 'paidout' ? '1.5px solid rgba(148, 163, 184, 0.3)' : '1px solid transparent' }}
                >
                  Paid out
                </button>
              </div>

              {/* Table Headers */}
              <div className="hidden sm:grid grid-cols-4 gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Date</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Clip</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Campaign/Description</div>
                <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Amount</div>
              </div>

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: 'var(--text-primary)' }}>
                  {earningsTab === 'available' && 'No available earnings'}
                  {earningsTab === 'pending' && 'No pending earnings'}
                  {earningsTab === 'paidout' && 'No paid out earnings'}
                </h3>
                <p className="text-sm sm:text-base text-center" style={{ color: 'var(--text-primary)' }}>Submit clips to campaigns and start earning!</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <>
            {/* Mobile Settings View */}
            <div className="lg:hidden px-4 pt-4">
              <SettingsView
                renderPersonalInfo={renderPersonalInfo}
                renderConnectedAccounts={renderConnectedAccounts}
                renderAccountType={renderAccountType}
                renderPayoutMethods={renderPayoutMethods}
                renderDisplay={renderDisplay}
                renderLanguages={renderLanguages}
                renderNotifications={renderNotifications}
                renderSendFeedback={renderSendFeedback}
                renderGuides={renderGuides}
                renderLogOut={renderLogOut}
                isMobile={true}
                onBack={() => setActiveSection('home')}
                appliedTheme={appliedTheme}
                userType={userType}
              />
            </div>

            {/* Desktop Settings View - Twitter/X Style */}
            <div className="hidden lg:block">
              <SettingsView
                renderPersonalInfo={renderPersonalInfo}
                renderConnectedAccounts={renderConnectedAccounts}
                renderAccountType={renderAccountType}
                renderPayoutMethods={renderPayoutMethods}
                renderDisplay={renderDisplay}
                renderLanguages={renderLanguages}
                renderNotifications={renderNotifications}
                renderSendFeedback={renderSendFeedback}
                renderGuides={renderGuides}
                renderLogOut={renderLogOut}
                isMobile={false}
                appliedTheme={appliedTheme}
                userType={userType}
              />
            </div>
          </>
        )}

        
        {activeSection === 'home' && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            <AnnouncementBanner userId={currentUserId} userType="artist" />
        <section className="mb-10 sm:mb-20">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('home.overview')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <RevenueAnalyticsCard />

            <FighterMusicCard />

            <TotalSongsDistributedCard />
          </div>
        </section>

        <section className="mb-10 sm:mb-20">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('home.myAccounts')}</h2>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Add New Artist</p>
          </div>

          <SocialLinksForm appliedTheme={appliedTheme} userType="artist" userId={currentUserId} />
        </section>

        <section className="mb-8">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('home.referralSection')}</h2>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{t('home.referralSectionDesc')}</p>
          </div>

          <ReferralSection userType="artist" userId={currentUserId} />
        </section>
          </div>
        )}

        {activeSection === 'talent' && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            <section className="mb-10 sm:mb-20">
              <div className="mb-5 sm:mb-7">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>Discover Talent</h2>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>Find and connect with talented creators</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <FighterMusicCard onClick={() => setSelectedCampaign(CAMPAIGNS[0])} />
              </div>
            </section>
          </div>
        )}

        {activeSection === 'explore' && !showReleaseForm && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-6 lg:px-12 pt-10 lg:pt-14">

            {/* Page header */}
            <div className="mb-10">
              <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>Distribution</h1>
              <p className="text-base" style={{ color: 'var(--text-primary)' }}>Distribute your music to all major streaming platforms worldwide.</p>
            </div>

            {/* New Release section */}
            <div className="mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: 'var(--text-primary)', letterSpacing: '0.12em' }}>New Release</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Standard Release card */}
                <div
                  className="group rounded-2xl p-6 flex flex-col gap-5 cursor-pointer transition-all duration-200 hover:brightness-110"
                  style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                  onClick={() => {
                    setDraftId(null);
                    setReleaseForm({ title: '', copyrightHolder: '', copyrightYear: String(new Date().getFullYear()), productionHolder: '', productionYear: String(new Date().getFullYear()), recordLabel: 'Independent', releaseArtists: '', genre: '', secondaryGenre: '', language: 'English', releaseDate: '', countryRestrictions: false, releasedBefore: false, originalReleaseDate: '', stores: [], tracks: [], artworkFile: null, artworkPreview: '' });
                    setReleaseChecklist([false, false, false]);
                    setReleaseStep(1);
                    setShowReleaseForm(true);
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Standard Release</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>Singles, EPs and albums distributed to all major stores.</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDraftId(null);
                      setReleaseForm({ title: '', copyrightHolder: '', copyrightYear: String(new Date().getFullYear()), productionHolder: '', productionYear: String(new Date().getFullYear()), recordLabel: 'Independent', releaseArtists: '', genre: '', secondaryGenre: '', language: 'English', releaseDate: '', countryRestrictions: false, releasedBefore: false, originalReleaseDate: '', stores: [], tracks: [], artworkFile: null, artworkPreview: '' });
                      setReleaseChecklist([false, false, false]);
                      setReleaseStep(1);
                      setShowReleaseForm(true);
                    }}
                    className="self-start flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
                    style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    Create New
                  </button>
                </div>
              </div>
            </div>

            {/* My Releases section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>My Releases</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Filter by:</span>
                  <div className="relative" ref={filterRef}>
                    <button
                      type="button"
                      onClick={() => setReleasesFilterOpen(o => !o)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border"
                      style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      {releasesFilter}
                      <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${releasesFilterOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {releasesFilterOpen && (
                      <div className="absolute right-0 z-50 mt-1 rounded-xl overflow-hidden shadow-xl animate-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', minWidth: '160px' }}>
                        {['Any release type', 'Single', 'EP', 'Album'].map(opt => (
                          <button key={opt} type="button" onClick={() => { setReleasesFilter(opt); setReleasesFilterOpen(false); }} className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between transition-all" style={{ color: 'var(--text-primary)', backgroundColor: releasesFilter === opt ? 'var(--bg-elevated)' : 'transparent' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = releasesFilter === opt ? 'var(--bg-elevated)' : 'transparent'; e.currentTarget.style.transform = ''; }}>
                            {opt}{releasesFilter === opt && <span style={{ color: 'var(--text-primary)' }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-0 mb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {(['in-progress', 'complete', 'inactive'] as const).map((tab) => {
                  const label = tab === 'in-progress' ? 'In-Progress' : tab.charAt(0).toUpperCase() + tab.slice(1);
                  const active = myReleasesTab === tab;
                  const count = tab === 'in-progress' ? savedDrafts.filter(d => d.status === 'incomplete').length : tab === 'complete' ? savedDrafts.filter(d => d.status === 'submitted' || d.status === 'approved').length : savedDrafts.filter(d => d.status === 'inactive').length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setMyReleasesTab(tab)}
                      className="px-4 py-3 text-sm font-semibold transition-all duration-200 relative flex items-center gap-2"
                      style={{ color: 'var(--text-primary)', opacity: active ? 1 : 0.5 }}
                    >
                      {label}
                      {count > 0 && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>{count}</span>}
                      {active && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--text-primary)' }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Draft cards — In-Progress tab */}
              {myReleasesTab === 'in-progress' && (() => {
                const drafts = savedDrafts.filter(d => d.status === 'incomplete');
                if (drafts.length === 0) return (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                    </div>
                    <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No releases in progress</p>
                    <p className="text-sm max-w-xs" style={{ color: 'var(--text-primary)' }}>Create a new release above to get started.</p>
                  </div>
                );
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {drafts.map(draft => (
                      <div
                        key={draft.id}
                        className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:brightness-110"
                        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                        onClick={() => { loadDraftIntoForm(draft); setShowReleaseForm(true); }}
                      >
                        {/* Artwork */}
                        <div className="relative aspect-square">
                          {draft.artwork_url ? (
                            <img src={draft.artwork_url} alt={draft.title || 'Release'} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.3 }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            </div>
                          )}
                          {/* INCOMPLETE badge */}
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider" style={{ backgroundColor: '#EF4444', color: '#fff' }}>
                            INCOMPLETE
                          </div>
                        </div>
                        {/* Info */}
                        <div className="p-4">
                          <p className="font-semibold text-sm truncate mb-1" style={{ color: 'var(--text-primary)' }}>{draft.title || 'Untitled Release'}</p>
                          <p className="text-xs mb-3" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>
                            {draft.tracks?.length ? `${draft.tracks.length} track${draft.tracks.length !== 1 ? 's' : ''}` : 'No tracks yet'}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                              {draft.copyright_year || new Date().getFullYear()}
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingDraftId(draft.id); }}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:opacity-70"
                              style={{ backgroundColor: 'var(--bg-elevated)' }}
                            >
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {/* Delete draft confirmation dialog */}
              {deletingDraftId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
                  <div className="w-full max-w-sm rounded-2xl p-6 animate-scale-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ color: 'var(--text-primary)' }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    </div>
                    <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Delete this draft?</h3>
                    <p className="text-sm mb-6" style={{ color: 'var(--text-primary)', opacity: 0.55 }}>This action cannot be undone. The draft and any uploaded artwork will be permanently removed.</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setDeletingDraftId(null)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          const uid = currentUserId || localStorage.getItem('verifiedUserId') || '';
                          await supabase.from('release_drafts').delete().eq('id', deletingDraftId);
                          setDeletingDraftId(null);
                          await fetchDrafts(uid);
                        }}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                        style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete tab */}
              {myReleasesTab === 'complete' && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </div>
                  <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No completed releases</p>
                  <p className="text-sm max-w-xs" style={{ color: 'var(--text-primary)' }}>Submitted releases will appear here once processed.</p>
                </div>
              )}

              {/* Inactive tab */}
              {myReleasesTab === 'inactive' && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                  </div>
                  <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No inactive releases</p>
                  <p className="text-sm max-w-xs" style={{ color: 'var(--text-primary)' }}>Inactive releases will appear here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'explore' && showReleaseForm && (() => {
          const steps = ['Details', 'Tracks', 'Schedule', 'Stores', 'Review'];
          const currentYear = new Date().getFullYear();
          const years = Array.from({ length: 10 }, (_, i) => String(currentYear + 1 - i));
          const allStores = [
            'Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Tidal', 'Deezer', 'Pandora', 'SoundCloud',
            'iTunes', 'Shazam', 'I Heart Radio', 'LiveOne', 'YouTube Content ID', 'YouTube Shorts',
            'Audible Magic', 'Broadtime', 'ViaPath Technologies', 'JPay', 'Keefe', '7digital',
            'Soundtrack Your Brand', 'Snapchat', 'Musixmatch', 'ROXi', 'Stationhead', 'Soundmouse',
            'Netease Cloud Music', 'Taobao', 'QQ Music', 'Kugou', 'Kuwo', 'WeSing', 'Boomplay Music',
            'Ayoba', 'TikTok', 'CapCut', 'Audiomack', 'Joox', 'Twitch Soundtrack', 'ACRCloud',
            'Peloton', 'Instagram', 'WhatsApp', 'Facebook', 'Mixcloud', 'Trebel',
            'KUACK', 'D\'Music', 'Lola Music', 'Movistar Música', 'Audible Magic - Rights360',
            'LyricFind', 'Gracenote', 'Qobuz', 'KKBox', 'Saavn', 'AWA Music', 'Anghami Music',
            'Claro Musica', 'Gaana', 'Lissen', 'Rythm', 'Flo', 'Meta Rights Manager',
            'TikTok Content ID', 'Jaxsta',
          ];
          const rf = releaseForm;
          const setRf = (patch: Partial<typeof releaseForm>) => setReleaseForm(f => ({ ...f, ...patch }));

          const inputCls = 'w-full px-4 py-3 rounded-xl text-base focus:outline-none transition-all';
          const inputStyle = { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' };
          const labelStyle = { color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px', display: 'block' };

          // Inline tooltip label component
          const InfoLabel = ({ text, tip }: { text: string; tip: string }) => {
            const [show, setShow] = React.useState(false);
            return (
              <div className="flex items-center gap-1.5 mb-2">
                <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.04em' }}>{text}</span>
                <div className="relative flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
                  <svg className="w-3.5 h-3.5 cursor-default" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.85, filter: 'drop-shadow(0 0 4px currentColor)' }}>
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {show && (
                    <div className="absolute bottom-full left-1/2 mb-2 z-50 animate-fade-in" style={{ transform: 'translateX(-50%)', width: '220px' }}>
                      <div className="px-3 py-2 rounded-xl text-xs leading-relaxed" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                        {tip}
                        <div className="absolute top-full left-1/2" style={{ transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--border-default)' }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          };

          const ReleaseDropdown = ({ value, options, onChange, triggerStyle }: { value: string; options: string[]; onChange: (v: string) => void; triggerStyle?: React.CSSProperties }) => {
            const [open, setOpen] = React.useState(false);
            const ref = React.useRef<HTMLDivElement>(null);
            React.useEffect(() => {
              const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
              if (open) document.addEventListener('mousedown', handler);
              return () => document.removeEventListener('mousedown', handler);
            }, [open]);
            return (
              <div className="relative" ref={ref}>
                <button
                  type="button"
                  onClick={() => setOpen(v => !v)}
                  className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all duration-200 flex items-center justify-between group border"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)', ...triggerStyle }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <span className="transition-all duration-200">{value || options[0]}</span>
                  <svg className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M6 9l6 6 6-6"/></svg>
                </button>
                {open && (
                  <div className="absolute z-50 w-full mt-1 rounded-xl shadow-xl overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                    <div className="max-h-52 overflow-y-auto">
                      {options.map(opt => {
                        const isSelected = opt === value;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => { onChange(opt); setOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm transition-all duration-200 flex items-center justify-between group/opt"
                            style={{ backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent', color: 'var(--text-primary)' }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}
                          >
                            <span className="transition-all duration-200">{opt}</span>
                            {isSelected && <span className="text-xs" style={{ color: 'var(--text-primary)' }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          };

          return (
            <div ref={releaseFormScrollRef} className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            <div className="flex gap-10 items-start justify-center">
            <div className="w-full max-w-6xl min-w-0">

              {/* Back to lobby */}
              <button
                onClick={() => {
                const uid = currentUserId || localStorage.getItem('verifiedUserId') || '';
                if (uid) saveDraft(releaseFormRef.current, releaseStepRef.current, releaseChecklistRef.current, uid, draftIdRef.current);
                setShowReleaseForm(false);
              }}
                className="flex items-center gap-2 mb-6 text-sm font-medium transition-all hover:opacity-70"
                style={{ color: 'var(--text-primary)' }}
              >
                <svg className="w-4 h-4 rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                Back to My Music
              </button>

              {/* Step labels (no connector lines) */}
              <div className="flex items-center gap-8 mb-10">
                {steps.map((step, i) => {
                  const num = i + 1;
                  const done = releaseStep > num;
                  const active = releaseStep === num;
                  return (
                    <button
                      key={step}
                      onClick={() => done && setReleaseStep(num)}
                      className="flex items-center gap-2"
                      style={{ cursor: done ? 'pointer' : 'default', opacity: active || done ? 1 : 0.4 }}
                    >
                      <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{num}</span>
                      <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{step}</span>
                    </button>
                  );
                })}
              </div>

              {/* Title */}
              <h2 className="text-3xl sm:text-4xl font-bold mb-10 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Create your release
              </h2>

              {/* ── STEP 1: Details ── */}
              {releaseStep === 1 && (
                <div className="space-y-8">
                  {/* Section header */}
                  <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>1</div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Release <span className="font-bold">Information</span></h3>
                  </div>

                  {/* Title */}
                  <div>
                    <InfoLabel text="Title of album, EP or single" tip="Enter your release title exactly as you want it displayed across all streaming services and digital stores. Important: Do not add extra details in this field, such as version information, producer names, songwriter credits, or release dates." />
                    <input
                      type="text"
                      value={rf.title}
                      onChange={e => { setRf({ title: e.target.value }); if (e.target.value) setStepErrors(prev => { const n = {...prev}; delete n.title; return n; }); }}
                      className={inputCls}
                      style={{ ...inputStyle, ...(stepErrors.title ? { borderColor: 'rgba(239,68,68,0.8)', boxShadow: '0 0 0 2px rgba(239,68,68,0.2)' } : {}) }}
                      placeholder=""
                      onFocus={(e) => e.target.style.borderColor = stepErrors.title ? 'rgba(239,68,68,0.8)' : 'var(--text-primary)'}
                      onBlur={(e) => e.target.style.borderColor = stepErrors.title ? 'rgba(239,68,68,0.8)' : 'var(--border-subtle)'}
                    />
                    {stepErrors.title && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.9)' }}><svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Release title is required.</p>}
                  </div>

                  {/* Copyright row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <InfoLabel text="Copyright Holder" tip="Provide the name of the individual or company that owns the ℗ (sound recording) copyright. This copyright applies specifically to the master recordings of the tracks included in the release. If a record label owns the release, enter the label's name. If there is no label involved, the copyright holder is usually the artist, band, or group — enter their name instead." />
                      <input type="text" value={rf.copyrightHolder} onChange={e => setRf({ copyrightHolder: e.target.value })} className={inputCls} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                    </div>
                    <div>
                      <InfoLabel text="Copyright Year" tip="Specify the year the single, EP, or album is being released (or was originally released)." />
                      <ReleaseDropdown value={rf.copyrightYear} options={years} onChange={v => setRf({ copyrightYear: v })} />
                    </div>
                  </div>

                  {/* Production row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Production Holder</label>
                      <input type="text" value={rf.productionHolder} onChange={e => setRf({ productionHolder: e.target.value })} className={inputCls} style={inputStyle} onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Production Year</label>
                      <ReleaseDropdown value={rf.productionYear} options={years} onChange={v => setRf({ productionYear: v })} />
                    </div>
                  </div>

                  {/* Release artists */}
                  <div>
                    <InfoLabel text="Release artist(s)" tip="The primary artist name(s) that will appear on all streaming platforms. Add artists via My Accounts → Connected Accounts first." />
                    {artistNames.length > 0 ? (
                      <>
                        <ReleaseDropdown
                          value={rf.releaseArtists || 'Select artist'}
                          options={['Select artist', ...artistNames]}
                          onChange={v => { setRf({ releaseArtists: v === 'Select artist' ? '' : v }); setReleaseArtistError(false); }}
                          triggerStyle={releaseArtistError ? { border: '1px solid rgba(239,68,68,0.8)', boxShadow: '0 0 0 2px rgba(239,68,68,0.2)' } : undefined}
                        />
                        {releaseArtistError && (
                          <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.9)' }}>
                            <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            Please select a release artist to continue.
                          </p>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="w-full px-4 py-3 rounded-xl text-sm flex items-center justify-between"
                        style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', opacity: 0.45, cursor: 'not-allowed' }}
                      >
                        <span>No Artists Available</span>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                      </button>
                    )}
                    {artistNames.length === 0 && (
                      <p className="text-xs mt-1.5" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Add artists in My Accounts to populate this dropdown.</p>
                    )}
                  </div>

                  {/* Genre — primary, secondary, language */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label style={labelStyle}>Primary genre</label>
                        <ReleaseDropdown value={rf.genre || 'Select genre'} options={['Select genre', 'Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Country', 'Latin', 'Afrobeats', 'Alternative Rock', 'Indie', 'Soul', 'Other']} onChange={v => { setRf({ genre: v === 'Select genre' ? '' : v }); if (v !== 'Select genre') setStepErrors(prev => { const n = {...prev}; delete n.genre; return n; }); }} triggerStyle={stepErrors.genre ? { border: '1px solid rgba(239,68,68,0.8)', boxShadow: '0 0 0 2px rgba(239,68,68,0.2)' } : undefined} />
                        {stepErrors.genre && <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.9)' }}><svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Primary genre is required.</p>}
                      </div>
                      <div>
                        <label style={labelStyle}>Secondary genre</label>
                        <ReleaseDropdown value={rf.secondaryGenre || 'Optional'} options={['Optional', 'Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Country', 'Latin', 'Afrobeats', 'Alternative Rock', 'Indie', 'Soul', 'Samba', 'Other']} onChange={v => setRf({ secondaryGenre: v === 'Optional' ? '' : v })} />
                      </div>
                      <div>
                        <label style={labelStyle}>Language</label>
                        <ReleaseDropdown value={rf.language} options={['English', 'Spanish', 'French', 'Portuguese', 'German', 'Italian', 'Japanese', 'Korean', 'Mandarin', 'Arabic', 'Hindi', 'Instrumental']} onChange={v => setRf({ language: v })} />
                      </div>
                    </div>

                    {/* Info boxes */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          Keep in mind that not every genre is supported by every store. If a selected genre is unavailable on a specific platform, we will assign the closest matching category. Stores use your chosen genre(s) to classify your release.<br /><br />
                          Selecting a primary genre is required, while adding a secondary genre is optional.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          If your tracks are instrumental and do not contain lyrics, you can use this field to help reach a language-specific audience.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Release Artwork */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>2</div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Release <span className="font-bold">Artwork</span></h3>
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                      {/* Preview */}
                      <div className="aspect-square rounded-xl overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                        {rf.artworkPreview ? (
                          <img src={rf.artworkPreview} alt="Cover art preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span className="text-xs" style={{ color: 'var(--text-primary)' }}>No artwork</span>
                          </div>
                        )}
                      </div>

                      {/* Requirements */}
                      <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                        <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--text-primary)' }}>
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Artwork Guidelines:</p>
                          <p>Your cover image must be a square .jpg or .jpeg file with a minimum resolution of 1400 x 1400 pixels. The image should be clear (not blurry or pixelated) and must not exceed 10MB in file size.</p>
                          <p>The following elements are not permitted on cover art:</p>
                          <ul className="space-y-0.5 list-none">
                            <li>- Social media icons or usernames</li>
                            <li>- Website URLs</li>
                            <li>- Brand or record label logos</li>
                            <li>- Any text other than the artist name and/or release title</li>
                          </ul>
                          <p>If your artwork includes any of these prohibited elements, your release will be declined. These requirements are mandated by the digital music platforms and must be strictly followed.</p>
                        </div>
                      </div>

                      {/* Upload */}
                      <input
                        ref={artworkInputRef}
                        type="file"
                        accept=".jpg,.jpeg"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = URL.createObjectURL(file);
                          setRf({ artworkFile: file, artworkPreview: url });
                          // Upload to storage immediately and persist URL
                          try {
                            // Always use auth session uid for storage path (matches RLS/bucket policies)
                            const { data: { user } } = await supabase.auth.getUser();
                            const uid = user?.id || currentUserId || localStorage.getItem('verifiedUserId') || '';
                            if (!uid) { console.warn('[artwork] No uid — skipping upload'); return; }
                            let id = draftIdRef.current;
                            if (!id) {
                              // Create draft first to get an ID
                              const { data, error } = await supabase.from('release_drafts').insert({ user_id: uid, status: 'incomplete', current_step: releaseStep }).select('id').single();
                              if (error) console.error('[artwork] draft insert error:', error);
                              if (data?.id) { id = data.id; setDraftId(data.id); draftIdRef.current = data.id; }
                            }
                            if (id) {
                              const artworkUrl = await uploadArtwork(file, uid, id);
                              const { error: updErr } = await supabase.from('release_drafts').update({ artwork_url: artworkUrl }).eq('id', id);
                              if (updErr) console.error('[artwork] update error:', updErr);
                              await fetchDrafts(uid);
                            }
                          } catch (err) {
                            console.error('Artwork upload error:', err);
                          }
                        }}
                      />
                      <div
                        ref={artworkDropElRef}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl transition-all duration-200 cursor-pointer"
                        style={{ border: '2px dashed var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                        onClick={() => artworkInputRef.current?.click()}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                      >
                        <div className="text-center">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Drag files here</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>or</p>
                        </div>
                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:brightness-110" style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>
                          Select file
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Tracks ── */}
              {releaseStep === 2 && (
                <div className="space-y-8">
                  {/* Section 1: Tracks and metadata */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>1</div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Tracks <span className="font-normal">and</span> <span className="font-bold">metadata</span></h3>
                    </div>

                    {/* Upload row */}
                    <div className="flex gap-4 items-start">
                      <input ref={audioInputRef} type="file" accept=".wav,.mp3" multiple className="hidden" disabled={isUploading}
                        onChange={(e) => { if (e.target.files) handleAudioFiles(e.target.files); }} />
                      <div
                        ref={audioDropElRef}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl transition-all duration-200 flex-shrink-0"
                        style={{ border: '2px dashed var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', cursor: isUploading ? 'not-allowed' : 'pointer', width: '200px', minHeight: '160px' }}
                        onClick={() => { if (!isUploading) audioInputRef.current?.click(); }}
                        onMouseEnter={(e) => { if (!isUploading) e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                      >
                        {isUploading ? (
                          <svg className="w-8 h-8 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--text-primary)' }}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>
                        ) : (
                          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                        )}
                        <div className="text-center">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{isUploading ? 'Uploading...' : 'Drag files here'}</p>
                          {!isUploading && <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>or</p>}
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                          style={{ border: `1px solid ${isUploading ? 'var(--border-subtle)' : 'var(--text-primary)'}`, color: 'var(--text-primary)', opacity: isUploading ? 0.5 : 1 }}
                        >Select files</span>
                      </div>

                      {/* Audio requirements */}
                      <div className="flex items-start gap-3 p-4 rounded-xl flex-1" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Audio File Guidelines</p>
                          <div className="space-y-0.5 text-sm" style={{ color: 'var(--text-primary)' }}>
                            <p className="flex items-start gap-1"><svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>Accepted formats: .wav or .mp3 (we recommend submitting a .wav file for best quality).</p>
                            <p className="flex items-start gap-1"><svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>Maximum file size: 200MB.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Track list table */}
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                      {/* Header: always show title; show columns only when tracks exist */}
                      <div className="px-5 py-3" style={{ backgroundColor: 'var(--bg-elevated)' }}>
                        <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Track List</p>
                        {(rf.tracks.length > 0 || uploadingTracks.filter(t => !t.done).length > 0) && (
                          <div className="grid gap-4 mt-2.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)', gridTemplateColumns: '48px 56px 1fr 180px 90px 140px' }}>
                            <span>Order</span>
                            <span>Play</span>
                            <span>Title / Artist(s) / Copyright</span>
                            <span>Metadata</span>
                            <span>Status</span>
                            <span>Actions</span>
                          </div>
                        )}
                      </div>

                      {/* Uploading rows */}
                      {uploadingTracks.filter(t => !t.done).map((ut, i) => (
                        <div key={i} className="px-5 py-4 space-y-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ color: 'var(--text-primary)' }}><path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round"/></svg>
                            <span className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>{ut.name}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-subtle)' }}>
                              <div className="h-full rounded-full transition-all duration-150" style={{ width: `${ut.progress}%`, backgroundColor: 'var(--text-primary)' }} />
                            </div>
                            <span className="text-xs font-medium flex-shrink-0 w-36 text-right" style={{ color: 'var(--text-primary)' }}>
                              {ut.progress}% &nbsp;{(ut.size * ut.progress / 100 / 1024 / 1024).toFixed(1)}Mb of {(ut.size / 1024 / 1024).toFixed(1)}Mb
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Empty state */}
                      {rf.tracks.length === 0 && uploadingTracks.filter(t => !t.done).length === 0 && (
                        <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)' }}>
                          No tracks yet — drag & drop or select files above to add tracks.
                        </div>
                      )}

                      {/* Track rows */}
                      {rf.tracks.map((track, i) => (
                        <div key={i}>
                          <div className="grid gap-4 px-5 py-4 items-center" style={{ gridTemplateColumns: '48px 56px 1fr 180px 90px 140px', borderTop: '1px solid var(--border-subtle)' }}>
                            {/* Order */}
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{i + 1}</span>
                            {/* Play — shares audio-preview-{i} with the edit panel */}
                            <button
                              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:opacity-70 relative overflow-hidden"
                              style={{
                                backgroundColor: playingTrackIndex === i ? 'var(--text-primary)' : 'var(--bg-card)',
                                border: '1px solid var(--border-default)',
                              }}
                              onClick={() => {
                                const url = getTrackUrl(track);
                                if (!url) return;
                                // Use fileName as ID so reordering/deletion never causes stale src
                                const elId = `audio-preview-${track.fileName}`;
                                let el = document.getElementById(elId) as HTMLAudioElement | null;
                                if (!el) {
                                  el = document.createElement('audio');
                                  el.id = elId;
                                  el.src = url;
                                  el.onended = () => setPlayingTrackIndex(null);
                                  document.body.appendChild(el);
                                } else if (el.src !== url) {
                                  // src changed (e.g. object URL refreshed) — update it
                                  el.src = url;
                                }
                                if (playingTrackIndex === i) {
                                  el.pause();
                                  setPlayingTrackIndex(null);
                                } else {
                                  // Pause any currently playing track
                                  if (playingTrackIndex !== null) {
                                    const prevTrack = rf.tracks[playingTrackIndex];
                                    if (prevTrack) {
                                      const prev = document.getElementById(`audio-preview-${prevTrack.fileName}`) as HTMLAudioElement | null;
                                      if (prev) prev.pause();
                                    }
                                  }
                                  el.currentTime = 0;
                                  el.play().catch(() => {});
                                  setPlayingTrackIndex(i);
                                }
                              }}
                            >
                              {playingTrackIndex === i ? (
                                /* Animated bars — playing indicator */
                                <span className="flex items-end gap-px h-4">
                                  {[1, 2, 3].map(b => (
                                    <span key={b} className="w-0.5 rounded-full" style={{
                                      backgroundColor: 'var(--bg-primary)',
                                      height: `${b === 2 ? 16 : 10}px`,
                                      animation: `barBounce${b} 0.7s ease-in-out infinite alternate`,
                                    }} />
                                  ))}
                                </span>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5" style={{ color: 'var(--text-primary)' }}><path d="M8 5v14l11-7z"/></svg>
                              )}
                            </button>
                            {/* Title / Artist / Copyright */}
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{track.title || 'Untitled'}</p>
                              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>{track.featuring ? `by ${track.featuring}` : 'by —'}</p>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)' }}>© {new Date().getFullYear()}</p>
                            </div>
                            {/* Metadata */}
                            <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              Explicit: {track.explicit ? 'Yes' : 'No'}
                            </div>
                            {/* Status — Approved */}
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)' }}>
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bg-primary)' }}><polyline points="20 6 9 17 4 12"/></svg>
                              </div>
                              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Approved</span>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingTrackIndex(editingTrackIndex === i ? null : i)}
                                className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:opacity-70"
                                style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Edit
                              </button>
                              <button
                                onClick={() => { setRf({ tracks: rf.tracks.filter((_, j) => j !== i) }); if (editingTrackIndex === i) setEditingTrackIndex(null); }}
                                className="w-7 h-7 flex items-center justify-center rounded transition-all hover:opacity-70"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                              </button>
                            </div>
                          </div>

                          {/* Inline edit panel */}
                          {editingTrackIndex === i && (() => {
                            const previewW = track.duration > 0 ? Math.min(100, (30 / track.duration) * 100) : 20;
                            const previewLeft = track.duration > 0 ? (track.previewStart / track.duration) * 100 : 0;
                            const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
                            return (
                            <div className="px-5 pb-8 space-y-8" style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                              <div className="flex items-center justify-between pt-5">
                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Track Editing</p>
                                <button onClick={() => setEditingTrackIndex(null)} className="flex items-center gap-1.5 text-xs font-semibold transition-all hover:opacity-70" style={{ color: 'var(--text-primary)' }}>
                                  Close <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                              </div>

                              {/* Uploaded file */}
                              <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                                <span>Uploaded file:</span>
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{track.fileName || track.title}</span>
                                <button className="text-xs underline transition-all hover:opacity-70" style={{ color: 'var(--text-primary)' }}>Replace audio file</button>
                              </div>

                              {/* Track number + preview scrubber */}
                              <div className="flex items-start gap-5 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <div className="space-y-1.5 flex-shrink-0">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Track</p>
                                  <div className="w-20 px-3 py-2.5 rounded-xl text-sm text-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>{i + 1}</div>
                                </div>
                                <div className="flex-1 space-y-2">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Select your track preview start time</p>
                                  {/* Time markers */}
                                  {track.duration > 0 && (
                                    <div className="flex justify-between text-xs px-10" style={{ color: 'var(--text-primary)' }}>
                                      <span>0:00</span>
                                      <span>{fmtTime(track.duration * 0.25)}</span>
                                      <span>{fmtTime(track.duration * 0.5)}</span>
                                      <span>{fmtTime(track.duration * 0.75)}</span>
                                      <span>{fmtTime(track.duration)}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    {/* Audio element is created/owned by the row play button (audio-preview-{i}) */}
                                    {/* Play/pause button — icon driven by React state */}
                                    <button
                                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:opacity-70"
                                      style={{
                                        backgroundColor: playingTrackIndex === i ? 'var(--text-primary)' : 'var(--bg-elevated)',
                                        border: '1px solid var(--border-subtle)',
                                      }}
                                      onClick={() => {
                                        const el = document.getElementById(`audio-preview-${i}`) as HTMLAudioElement | null;
                                        if (!el) return;
                                        if (playingTrackIndex === i) {
                                          el.pause();
                                          setPlayingTrackIndex(null);
                                        } else {
                                          // Pause any other playing track
                                          if (playingTrackIndex !== null) {
                                            const prev = document.getElementById(`audio-preview-${playingTrackIndex}`) as HTMLAudioElement | null;
                                            if (prev) prev.pause();
                                          }
                                          el.currentTime = track.previewStart;
                                          el.play();
                                          setPlayingTrackIndex(i);
                                        }
                                      }}
                                    >
                                      {playingTrackIndex === i ? (
                                        <span className="flex items-end gap-px h-4">
                                          {[1, 2, 3].map(b => (
                                            <span key={b} className="w-0.5 rounded-full" style={{
                                              backgroundColor: 'var(--bg-primary)',
                                              height: `${b === 2 ? 16 : 10}px`,
                                              animation: `barBounce${b} 0.7s ease-in-out infinite alternate`,
                                            }} />
                                          ))}
                                        </span>
                                      ) : (
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5" style={{ color: 'var(--text-primary)' }}><path d="M8 5v14l11-7z"/></svg>
                                      )}
                                    </button>
                                    {/* Scrubber track */}
                                    <div
                                      className="flex-1 h-10 rounded-lg relative cursor-pointer select-none"
                                      style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                                      onMouseDown={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const trackDuration = track.duration;
                                        const trackIdx = i;
                                        // Pause audio during drag to prevent static noise
                                        const audioEl = document.getElementById(`audio-preview-${trackIdx}`) as HTMLAudioElement | null;
                                        const wasPlaying = audioEl && !audioEl.paused;
                                        if (audioEl && wasPlaying) audioEl.pause();
                                        const onMove = (mv: MouseEvent) => {
                                          const pct = Math.max(0, Math.min(1, (mv.clientX - rect.left) / rect.width));
                                          const maxStart = Math.max(0, trackDuration - 30);
                                          const newStart = Math.min(Math.round(pct * trackDuration), maxStart);
                                          setReleaseForm(f => ({ ...f, tracks: latestTracksRef.current.map((t, j) => j === trackIdx ? { ...t, previewStart: newStart } : t) }));
                                          const el = document.getElementById(`audio-preview-${trackIdx}`) as HTMLAudioElement | null;
                                          if (el) el.currentTime = newStart;
                                        };
                                        const onUp = () => {
                                          window.removeEventListener('mousemove', onMove);
                                          window.removeEventListener('mouseup', onUp);
                                          // Resume playback from new position after drag ends
                                          if (wasPlaying && audioEl) audioEl.play();
                                        };
                                        window.addEventListener('mousemove', onMove);
                                        window.addEventListener('mouseup', onUp);
                                        onMove(e.nativeEvent);
                                      }}
                                    >
                                      {/* Preview window (30 sec highlight) */}
                                      <div
                                        className="absolute inset-y-1 rounded flex items-center justify-center text-xs font-semibold pointer-events-none"
                                        style={{ left: `${previewLeft}%`, width: `${previewW}%`, backgroundColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                                      >
                                        {track.duration > 0 ? `${fmtTime(track.previewStart)} – ${fmtTime(Math.min(track.previewStart + 30, track.duration))}` : '30 sec'}
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Drag the preview bar to select your track preview start time. The 30-second preview will be featured on your SmartLink and platforms such as TikTok.</p>
                                </div>
                              </div>

                              {/* Track title + mix version */}
                              <div className="grid grid-cols-2 gap-4 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Track title</p>
                                  <input type="text" placeholder="Track title" value={track.title} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, title: e.target.value } : t) })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Track mix version</p>
                                  <input type="text" placeholder="Track mix version" className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                </div>
                              </div>

                              {/* Track artist */}
                              <div className="space-y-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Track artist(s)</p>
                                  {artistNames.length > 0 ? (
                                    <ReleaseDropdown
                                      value={track.featuring || 'Select artist'}
                                      options={['Select artist', ...artistNames]}
                                      onChange={v => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, featuring: v === 'Select artist' ? '' : v } : t) })}
                                    />
                                  ) : (
                                    <button type="button" disabled className="w-full px-4 py-3 rounded-xl text-sm flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', opacity: 0.45, cursor: 'not-allowed' }}>
                                      <span>No Artists Available — add via My Accounts</span>
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                                    </button>
                                  )}
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Release Artist</p>
                                  {artistNames.length > 0 ? (
                                    <ReleaseDropdown
                                      value={rf.releaseArtists || 'Select artist'}
                                      options={['Select artist', ...artistNames]}
                                      onChange={v => setRf({ releaseArtists: v === 'Select artist' ? '' : v })}
                                    />
                                  ) : (
                                    <button type="button" disabled className="w-full px-4 py-3 rounded-xl text-sm flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', opacity: 0.45, cursor: 'not-allowed' }}>
                                      <span>No Artists Available</span>
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Do you want to add primary, featuring or remix artists?</p>
                                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-70" style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}>
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg> Add another track artist
                                </button>
                              </div>

                              {/* Copyright / ISRC / Production */}
                              <div className="grid grid-cols-3 gap-4 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Copyright year</p>
                                  <input type="text" placeholder={String(new Date().getFullYear())} value={rf.copyrightYear} onChange={e => setRf({ copyrightYear: e.target.value })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Copyright holder</p>
                                  <input type="text" placeholder="Copyright holder name" value={rf.copyrightHolder} onChange={e => setRf({ copyrightHolder: e.target.value })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>ISRC code</p>
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.5 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                  </div>
                                  <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                                    {/* Auto / Manual toggle */}
                                    <button
                                      type="button"
                                      onClick={() => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, isrcMode: t.isrcMode === 'auto' ? 'manual' : 'auto' } : t) })}
                                      className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold flex-shrink-0 transition-all hover:opacity-80"
                                      style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', borderRight: '1px solid var(--border-subtle)' }}
                                    >
                                      {track.isrcMode === 'auto' ? 'Auto' : 'Manual'}
                                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                                    </button>
                                    {track.isrcMode === 'auto' ? (
                                      <div className="flex-1 px-4 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', opacity: 0.4 }}>Auto Generated</div>
                                    ) : (
                                      <input
                                        type="text"
                                        placeholder="e.g. USRC17607839"
                                        value={track.isrcCode}
                                        onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, isrcCode: e.target.value } : t) })}
                                        className="flex-1 px-4 py-2.5 text-sm focus:outline-none"
                                        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Year published</p>
                                  <input type="text" placeholder={String(new Date().getFullYear())} value={rf.productionYear} onChange={e => setRf({ productionYear: e.target.value })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Sound recording copyright</p>
                                  <input type="text" placeholder="Enter phonograph holder" value={rf.productionHolder} onChange={e => setRf({ productionHolder: e.target.value })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                </div>
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Digital audio fingerprint</p>
                                  <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', opacity: 0.35, pointerEvents: 'none', minHeight: '46px' }} />
                                </div>
                              </div>

                              {/* Do you want to add lyrics? */}
                              <div className="space-y-4 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Do you want to add lyrics?</span>
                                  {[{ val: false, label: 'No' }, { val: true, label: 'Yes' }].map(({ val, label }) => (
                                    <button
                                      key={String(val)}
                                      onClick={() => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, addLyrics: val } : t) })}
                                      className="px-5 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                                      style={{
                                        backgroundColor: track.addLyrics === val ? 'var(--text-primary)' : 'transparent',
                                        color: track.addLyrics === val ? 'var(--bg-primary)' : 'var(--text-primary)',
                                        border: '1px solid var(--border-default)'
                                      }}
                                    >{label}</button>
                                  ))}
                                </div>
                                {track.addLyrics && (
                                  <div className="grid grid-cols-2 gap-5 animate-fade-in">
                                    {/* Lyrics textarea */}
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Add Lyrics</p>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.5 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                      </div>
                                      <textarea
                                        placeholder="Enter lyrics"
                                        value={track.lyricsText}
                                        onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, lyricsText: e.target.value } : t) })}
                                        rows={10}
                                        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none transition-all resize-none"
                                        style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                                      />
                                    </div>
                                    {/* Upload doc */}
                                    <div className="space-y-2">
                                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Or upload a document with lyrics</p>
                                      <label
                                        className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all duration-200 h-[calc(100%-2rem)]"
                                        style={{ border: '2px dashed var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                                        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                                        onDragLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                                        onDrop={e => {
                                          e.preventDefault();
                                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                          const file = e.dataTransfer.files[0];
                                          if (file) setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, lyricsDocName: file.name } : t) });
                                        }}
                                      >
                                        <input type="file" accept=".docx,.txt" className="hidden" onChange={e => {
                                          const file = e.target.files?.[0];
                                          if (file) setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, lyricsDocName: file.name } : t) });
                                        }} />
                                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.5 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                        {track.lyricsDocName ? (
                                          <p className="text-sm font-medium text-center" style={{ color: 'var(--text-primary)' }}>{track.lyricsDocName}</p>
                                        ) : (
                                          <>
                                            <p className="text-sm text-center" style={{ color: 'var(--text-primary)' }}>Drag .docx/.txt file here<br/>or</p>
                                            <span className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:brightness-110" style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>Select file</span>
                                          </>
                                        )}
                                      </label>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Explicit */}
                              <div className="space-y-2">
                                <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Explicit content</p>
                                <div className="flex items-center gap-6">
                                  {[{ val: true, label: 'Yes, these lyrics contain explicit content.' }, { val: false, label: 'No explicit content.' }].map(({ val, label }) => (
                                    <label key={String(val)} className="flex items-center gap-2 cursor-pointer" onClick={() => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, explicit: val } : t) })}>
                                      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all" style={{ borderColor: track.explicit === val ? 'var(--text-primary)' : 'var(--border-default)', backgroundColor: track.explicit === val ? 'var(--text-primary)' : 'transparent' }}>
                                        {track.explicit === val && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--bg-primary)' }} />}
                                      </div>
                                      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {/* Track Credits */}
                              <div className="space-y-4 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <div>
                                  <p className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Track Credits</p>
                                  <p className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>You need to add <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>at least one name for each category</span> of credits on this release.</p>
                                </div>
                                {/* Composer */}
                                <div className="space-y-1.5">
                                  <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Composer</p>
                                  <input type="text" placeholder="Name" value={track.credits.composer} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, credits: { ...t.credits, composer: e.target.value } } : t) })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                </div>
                                {/* Songwriter */}
                                {(() => {
                                  const roleOpts = ['Arranger','Author','Conductor','Librettist','Lyricist'];
                                  const prodOpts = ['Assistant Producer','Mastering Engineer','Mixing Engineer','Musical Director','Producer','Sound Engineer'];
                                  const perfOpts = ['Acoustic Guitar','Alto Saxophone','Background Vocals','Banjo','Baritone Saxophone','Bass Clarinet','Bass Guitar','Bass Trombone','Bassoon','Bongos','Bouzouki','Cello','Choir','Chorus','Clarinet','Classical Guitar','Congas','Cornet','DJ','Djembe','Double Bass','Drums','Electric Guitar','Fiddle','First Violin','Flugelhorn','Flute','Guitar','Hammond Organ','Harmonica','Harmony Vocals','Harp','Harpsichord','Keyboards','Kora','Lead Guitar','Lead Vocals','Mandolin','Mezzo-soprano Vocals','Oboe','Organ','Pedal Steel Guitar','Percussion','Performer','Piano','Piccolo','Remixer','Rhodes Piano','Rhythm Guitar','Saxophone','Second Violin','Sitar','Sopranino Saxophone','Tabla','Tambourine','Tenor Saxophone','Timbales','Timpani','Trombone','Trumpet','Tuba','Ukulele','Viola','Violin'];
                                  const CreditDropdown = ({ value, options, onChange, placeholder }: { value: string; options: string[]; onChange: (v: string) => void; placeholder: string }) => {
                                    const [open, setOpen] = React.useState(false);
                                    const ref = React.useRef<HTMLDivElement>(null);
                                    React.useEffect(() => {
                                      const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
                                      document.addEventListener('mousedown', handler);
                                      return () => document.removeEventListener('mousedown', handler);
                                    }, []);
                                    return (
                                      <div ref={ref} className="relative">
                                        <button type="button" onClick={() => setOpen(v => !v)}
                                          className="w-full px-4 py-3 rounded-xl text-sm flex items-center justify-between focus:outline-none transition-all"
                                          style={{ backgroundColor: 'var(--bg-elevated)', color: value ? 'var(--text-primary)' : 'var(--text-primary)', border: '1px solid var(--border-subtle)', opacity: value ? 1 : 0.6 }}
                                          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                                        >
                                          <span style={{ color: 'var(--text-primary)', opacity: value ? 1 : 0.5 }}>{value || placeholder}</span>
                                          <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M6 9l6 6 6-6"/></svg>
                                        </button>
                                        {open && (
                                          <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', maxHeight: '200px', overflowY: 'auto' }}>
                                            {options.map(opt => (
                                              <button key={opt} type="button"
                                                onClick={() => { onChange(opt); setOpen(false); }}
                                                className="w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-all"
                                                style={{ backgroundColor: value === opt ? 'var(--bg-elevated)' : 'transparent', color: 'var(--text-primary)' }}
                                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = value === opt ? 'var(--bg-elevated)' : 'transparent'; e.currentTarget.style.transform = 'none'; }}
                                              >
                                                {opt}
                                                {value === opt && <span style={{ color: '#CBD5E1', fontSize: '0.75rem' }}>✓</span>}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  };
                                  return (
                                    <>
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Songwriter</p>
                                          <input type="text" placeholder="Name" value={track.credits.songwriter} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, credits: { ...t.credits, songwriter: e.target.value } } : t) })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                        </div>
                                        <div className="space-y-1.5">
                                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Role (e.g. Lyricist)</p>
                                          <CreditDropdown value={track.credits.songwriterRole} options={roleOpts} placeholder="Select role" onChange={v => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, credits: { ...t.credits, songwriterRole: v } } : t) })} />
                                        </div>
                                      </div>
                                      {/* Production/Engineer */}
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Production/Engineer</p>
                                          <input type="text" placeholder="Name" value={track.credits.engineer} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, credits: { ...t.credits, engineer: e.target.value } } : t) })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                        </div>
                                        <div className="space-y-1.5">
                                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Production (e.g. Producer)</p>
                                          <CreditDropdown value={track.credits.engineerRole} options={prodOpts} placeholder="Select role" onChange={v => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, credits: { ...t.credits, engineerRole: v } } : t) })} />
                                        </div>
                                      </div>
                                      {/* Performer */}
                                      <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Performer</p>
                                          <input type="text" placeholder="Name" value={track.credits.performer} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, credits: { ...t.credits, performer: e.target.value } } : t) })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                        </div>
                                        <div className="space-y-1.5">
                                          <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Performance / Instrument</p>
                                          <CreditDropdown value={track.credits.performerRole} options={perfOpts} placeholder="Select instrument" onChange={v => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, credits: { ...t.credits, performerRole: v } } : t) })} />
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                                {/* Add more / Copy to all tracks */}
                                {(track.extraCredits || []).map((ec: {name: string; role: string}, ei: number) => (
                                  <div key={ei} className="grid grid-cols-2 gap-3 items-end">
                                    <div className="space-y-1.5">
                                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Contributor name</p>
                                      <input type="text" placeholder="Name" value={ec.name} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, extraCredits: (t.extraCredits || []).map((x: any, xi: number) => xi === ei ? { ...x, name: e.target.value } : x) } : t) })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                    </div>
                                    <div className="space-y-1.5 flex gap-2 items-end">
                                      <div className="flex-1 space-y-1.5">
                                        <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Contributor role</p>
                                        <input type="text" placeholder="Role" value={ec.role} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, extraCredits: (t.extraCredits || []).map((x: any, xi: number) => xi === ei ? { ...x, role: e.target.value } : x) } : t) })} className={inputCls} style={inputStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
                                      </div>
                                      <button onClick={() => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, extraCredits: (t.extraCredits || []).filter((_: any, xi: number) => xi !== ei) } : t) })} className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl transition-all hover:opacity-70 mb-0.5" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, extraCredits: [...(t.extraCredits || []), { name: '', role: '' }] } : t) })} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-70" style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg> Add more
                                  </button>
                                  <button
                                    onClick={() => {
                                      const credits = rf.tracks[i].credits;
                                      setRf({ tracks: rf.tracks.map((t, j) => j === i ? t : { ...t, credits: { ...credits } }) });
                                      setCopiedTrackIndex(i);
                                      setTimeout(() => setCopiedTrackIndex(null), 2000);
                                    }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-70"
                                    style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', backgroundColor: copiedTrackIndex === i ? 'var(--bg-elevated)' : 'transparent' }}
                                  >
                                    {copiedTrackIndex === i ? (
                                      <>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        Copied!
                                      </>
                                    ) : 'Copy to all tracks'}
                                  </button>
                                </div>
                              </div>

                              {/* Finished button */}
                              <div className="flex justify-end pt-2">
                                <button onClick={() => setEditingTrackIndex(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>
                                  Finished editing track
                                </button>
                              </div>
                            </div>
                            );
                          })()}
                        </div>
                      ))}

                      {/* Footer: track count + total duration */}
                      {rf.tracks.length > 0 && (() => {
                        const totalSecs = rf.tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
                        const mins = Math.floor(totalSecs / 60);
                        const secs = Math.floor(totalSecs % 60);
                        const timeStr = totalSecs > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : '—:——';
                        return (
                          <div className="flex items-center gap-3 px-4 py-3 text-sm" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                            <span>{rf.tracks.length} track{rf.tracks.length !== 1 ? 's' : ''}</span>
                            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>
                            <span>{timeStr}</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Before moving forward, make sure you've completed the checklist below.</p>
                        <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>Be aware that providing inaccurate information in response to these questions may cause delays in delivering your release to streaming platforms and digital stores.</p>
                      </div>
                    </div>
                    {[
                      "I understand my release may be rejected from stores if I don't correctly label tracks as explicit that contain swear words or obscenities.",
                      "I am authorised to distribute this music to stores and territories I select.",
                      "I'm not using any other artist's name in my name, song titles, or album title, without their approval.",
                    ].map((item, i) => (
                      <label key={i} className="flex items-start gap-3 cursor-pointer" onClick={() => setReleaseChecklist(prev => prev.map((v, j) => j === i ? !v : v))}>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-200"
                          style={{
                            borderColor: releaseChecklist[i] ? 'var(--text-primary)' : 'var(--border-default)',
                            backgroundColor: releaseChecklist[i] ? 'var(--text-primary)' : 'transparent',
                          }}
                        >
                          {releaseChecklist[i] && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--bg-primary)' }} />}
                        </div>
                        <span className="text-sm select-none" style={{ color: 'var(--text-primary)' }}>{item}</span>
                      </label>
                    ))}
                  </div>

                  {/* Section 2: Covers and Copyrighted Materials */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>2</div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Covers <span className="font-normal">and</span> <span className="font-bold">Copyrighted Materials</span></h3>
                    </div>

                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      If your release contains any copyrighted material such as samples, please upload the documentation proving you own the copyright to the audio.<br />
                      Without the required licensing documentation, music containing copyrighted material may be rejected by stores.
                    </p>

                    <div className="space-y-3">
                      {([
                        { id: 'none', label: 'Continue without uploading copyright documentation' },
                        { id: 'upload', label: 'Upload documentation proving I own the copyright to the audio' },
                      ] as { id: 'none' | 'upload'; label: string }[]).map(({ id, label }) => (
                        <label key={id} className="flex items-center gap-3 cursor-pointer" onClick={() => setCopyrightOption(id)}>
                          <div
                            className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
                            style={{
                              borderColor: copyrightOption === id ? 'var(--text-primary)' : 'var(--border-default)',
                              backgroundColor: copyrightOption === id ? 'var(--text-primary)' : 'transparent',
                            }}
                          >
                            {copyrightOption === id && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--bg-primary)' }} />}
                          </div>
                          <span className="text-sm font-medium select-none" style={{ color: 'var(--text-primary)' }}>{label}</span>
                        </label>
                      ))}
                    </div>

                    {copyrightOption === 'upload' && (
                      <div className="grid grid-cols-2 gap-5 mt-5">
                        {/* File upload */}
                        <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>File Upload</p>
                          <label
                            className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all duration-200"
                            style={{ border: '2px dashed var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--text-primary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.style.borderColor = 'var(--border-subtle)';
                              const files = Array.from(e.dataTransfer.files);
                              setCopyrightDocs(prev => [...prev, ...files]);
                            }}
                          >
                            <input
                              type="file"
                              className="hidden"
                              multiple
                              onChange={(e) => {
                                if (e.target.files) setCopyrightDocs(prev => [...prev, ...Array.from(e.target.files!)]);
                              }}
                            />
                            <svg className="w-10 h-10" style={{ color: 'var(--text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Drag here to upload</p>
                          </label>
                          <button
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                            onClick={() => (document.querySelector('input[type=file]') as HTMLInputElement)?.click()}
                          >
                            Select files...
                          </button>
                        </div>

                        {/* Documents list */}
                        <div className="rounded-xl p-5 space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Documents</p>
                          {copyrightDocs.length === 0 ? (
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>No documents uploaded yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {copyrightDocs.map((f, i) => (
                                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                  <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                                  <button onClick={() => setCopyrightDocs(prev => prev.filter((_, j) => j !== i))} style={{ color: 'var(--text-primary)' }}>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Schedule ── */}
              {releaseStep === 3 && (
                <div className="space-y-10">
                  <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>3</div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Release <span className="font-bold">Schedule</span></h3>
                  </div>

                  {/* Release date */}
                  <div className="space-y-4">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Release date</p>
                    <div className="flex items-center gap-3">
                      {([{ val: 'most-recent', label: 'Most Recent' }, { val: 'specific', label: 'Release Date' }] as const).map(({ val, label }) => (
                        <button
                          key={val}
                          onClick={() => { setReleaseDateMode(val); if (val === 'most-recent') setRf({ releaseDate: '' }); }}
                          className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                          style={{
                            backgroundColor: releaseDateMode === val ? 'var(--text-primary)' : 'transparent',
                            color: releaseDateMode === val ? 'var(--bg-primary)' : 'var(--text-primary)',
                            border: '1px solid var(--border-default)'
                          }}
                        >{label}</button>
                      ))}
                    </div>
                    {stepErrors.releaseDate && (
                    <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.9)' }}><svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Please select a specific release date to continue.</p>
                  )}
                  {releaseDateMode === 'specific' && (() => {
                      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                      const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                      const firstDay = new Date(calYear, calMonth, 1).getDay();
                      const parsed = rf.releaseDate ? new Date(rf.releaseDate + 'T00:00:00') : null;
                      return (
                        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', maxWidth: '320px' }}>
                          <div className="flex items-center justify-between">
                            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:opacity-70" style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>
                            </button>
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{monthNames[calMonth]} {calYear}</span>
                            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:opacity-70" style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 18l6-6-6-6"/></svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-xs font-medium py-1" style={{ color: 'var(--text-primary)' }}>{d}</div>)}
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                              const day = i + 1;
                              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                              const isSelected = parsed && parsed.getFullYear() === calYear && parsed.getMonth() === calMonth && parsed.getDate() === day;
                              return (
                                <button key={day} onClick={() => setRf({ releaseDate: dateStr })} className="w-full aspect-square rounded-full text-xs font-medium transition-all hover:opacity-80" style={{ backgroundColor: isSelected ? 'var(--text-primary)' : 'transparent', color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)' }}>{day}</button>
                              );
                            })}
                          </div>
                          {rf.releaseDate && <p className="text-xs text-center" style={{ color: 'var(--text-primary)' }}>Selected: <strong style={{ color: 'var(--text-primary)' }}>{rf.releaseDate}</strong></p>}
                        </div>
                      );
                    })()}
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Releases typically take 2–5 business days to appear on all stores. We recommend scheduling at least 7 days in advance.</p>
                  </div>

                  {/* Country restrictions */}
                  <div className="space-y-4" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem' }}>
                    <p className="text-base" style={{ color: 'var(--text-primary)' }}>Would you like to add <strong>country restrictions</strong> and limit the availability of your release?</p>
                    <div className="flex items-center gap-3">
                      {[{ val: false, label: 'No' }, { val: true, label: 'Yes' }].map(({ val, label }) => (
                        <button
                          key={String(val)}
                          onClick={() => setRf({ countryRestrictions: val })}
                          className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                          style={{
                            backgroundColor: rf.countryRestrictions === val ? 'var(--text-primary)' : 'transparent',
                            color: rf.countryRestrictions === val ? 'var(--bg-primary)' : 'var(--text-primary)',
                            border: '1px solid var(--border-default)'
                          }}
                        >{label}</button>
                      ))}
                    </div>
                    {rf.countryRestrictions && (() => {
                      const allCountries = ['Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Belarus','Belgium','Belize','Benin','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cambodia','Cameroon','Canada','Chad','Chile','China','Colombia','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Dominican Republic','Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Finland','France','Gabon','Georgia','Germany','Ghana','Greece','Guatemala','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Libya','Lithuania','Luxembourg','Madagascar','Malaysia','Mali','Malta','Mexico','Moldova','Mongolia','Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saudi Arabia','Senegal','Serbia','Singapore','Slovakia','Slovenia','Somalia','South Africa','South Korea','Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'];
                      const filtered = allCountries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()));
                      return (
                        <div className="space-y-3">
                          <div className="relative">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-primary)' }}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                            <input
                              type="text"
                              placeholder="Search countries..."
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                            />
                          </div>
                          {selectedCountries.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {selectedCountries.map(c => (
                                <div key={c} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                                  {c}
                                  <button onClick={() => setSelectedCountries(prev => prev.filter(x => x !== c))} className="hover:opacity-70"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)', maxHeight: '200px', overflowY: 'auto' }}>
                            {filtered.map(c => {
                              const isSel = selectedCountries.includes(c);
                              return (
                                <button
                                  key={c}
                                  onClick={() => setSelectedCountries(prev => isSel ? prev.filter(x => x !== c) : [...prev, c])}
                                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-all hover:opacity-80"
                                  style={{ backgroundColor: isSel ? 'var(--bg-elevated)' : 'transparent', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-subtle)' }}
                                >
                                  {c}
                                  {isSel && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-primary)' }}><polyline points="20 6 9 17 4 12"/></svg>}
                                </button>
                              );
                            })}
                            {filtered.length === 0 && <p className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>No countries found</p>}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Released before */}
                  <div className="space-y-4" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '2rem' }}>
                    <p className="text-base" style={{ color: 'var(--text-primary)' }}>Has this been <strong>released before?</strong></p>
                    <div className="flex items-start gap-8">
                      <div className="flex items-center gap-3">
                        {[{ val: false, label: 'No' }, { val: true, label: 'Yes' }].map(({ val, label }) => (
                          <button
                            key={String(val)}
                            onClick={() => setRf({ releasedBefore: val })}
                            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                            style={{
                              backgroundColor: rf.releasedBefore === val ? 'var(--text-primary)' : 'transparent',
                              color: rf.releasedBefore === val ? 'var(--bg-primary)' : 'var(--text-primary)',
                              border: '1px solid var(--border-default)'
                            }}
                          >{label}</button>
                        ))}
                      </div>
                      {rf.releasedBefore && (() => {
                        const [origCalOpen, setOrigCalOpen] = React.useState(false);
                        const origMonthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                        const [origCalYear, setOrigCalYear] = React.useState(new Date().getFullYear());
                        const [origCalMonth, setOrigCalMonth] = React.useState(new Date().getMonth());
                        const origDaysInMonth = new Date(origCalYear, origCalMonth + 1, 0).getDate();
                        const origFirstDay = new Date(origCalYear, origCalMonth, 1).getDay();
                        const origParsed = rf.originalReleaseDate ? new Date(rf.originalReleaseDate + 'T00:00:00') : null;
                        const origRef = React.useRef<HTMLDivElement>(null);
                        React.useEffect(() => {
                          const handler = (e: MouseEvent) => { if (origRef.current && !origRef.current.contains(e.target as Node)) setOrigCalOpen(false); };
                          if (origCalOpen) document.addEventListener('mousedown', handler);
                          return () => document.removeEventListener('mousedown', handler);
                        }, [origCalOpen]);
                        return (
                          <div className="space-y-1.5 flex-1 relative" style={{ maxWidth: '280px' }} ref={origRef}>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Enter the <strong style={{ color: 'var(--text-primary)' }}>original release date</strong></p>
                            <button
                              type="button"
                              onClick={() => setOrigCalOpen(v => !v)}
                              className="w-full px-4 py-3 rounded-xl text-sm flex items-center justify-between focus:outline-none transition-all"
                              style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                              onFocus={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                            >
                              <span style={{ opacity: rf.originalReleaseDate ? 1 : 0.5 }}>{rf.originalReleaseDate || 'Select date'}</span>
                              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </button>
                            {origCalOpen && (
                              <div className="absolute z-50 mt-1 rounded-xl p-4 space-y-3 animate-fade-in" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', minWidth: '280px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                                <div className="flex items-center justify-between">
                                  <button onClick={() => { if (origCalMonth === 0) { setOrigCalMonth(11); setOrigCalYear(y => y - 1); } else setOrigCalMonth(m => m - 1); }} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:opacity-70" style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M15 18l-6-6 6-6"/></svg>
                                  </button>
                                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{origMonthNames[origCalMonth]} {origCalYear}</span>
                                  <button onClick={() => { if (origCalMonth === 11) { setOrigCalMonth(0); setOrigCalYear(y => y + 1); } else setOrigCalMonth(m => m + 1); }} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:opacity-70" style={{ border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M9 18l6-6-6-6"/></svg>
                                  </button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center">
                                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} className="text-xs font-medium py-1" style={{ color: 'var(--text-primary)' }}>{d}</div>)}
                                  {Array.from({ length: origFirstDay }).map((_, idx) => <div key={`e${idx}`} />)}
                                  {Array.from({ length: origDaysInMonth }).map((_, idx) => {
                                    const day = idx + 1;
                                    const dateStr = `${origCalYear}-${String(origCalMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                                    const isSel = origParsed && origParsed.getFullYear() === origCalYear && origParsed.getMonth() === origCalMonth && origParsed.getDate() === day;
                                    return (
                                      <button key={day} onClick={() => { setRf({ originalReleaseDate: dateStr }); setOrigCalOpen(false); }} className="w-full aspect-square rounded-full text-xs font-medium transition-all hover:opacity-80" style={{ backgroundColor: isSel ? 'var(--text-primary)' : 'transparent', color: isSel ? 'var(--bg-primary)' : 'var(--text-primary)' }}>{day}</button>
                                    );
                                  })}
                                </div>
                                {rf.originalReleaseDate && <p className="text-xs text-center" style={{ color: 'var(--text-primary)' }}>Selected: <strong>{rf.originalReleaseDate}</strong></p>}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Stores ── */}
              {releaseStep === 4 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>4</div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Select <span className="font-bold">Stores</span></h3>
                  </div>

                  {/* Store distribution type */}
                  <div className="space-y-4">
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>Which stores would you like to distribute your release on?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { val: 'all', label: 'All stores', desc: `Select all ${allStores.length} stores.` },
                        { val: 'downloads', label: "Elevate's Package", desc: 'Specifically curated for services we provide such as publishing and others.' },
                        { val: 'streaming', label: 'Streaming only stores', desc: "Only select stores which allow fans to stream your music. Your tracks will not be available for personal download." },
                        { val: 'custom', label: 'Custom selection of stores', desc: 'Choose your own mix of streaming, download and social platforms.' },
                      ] as const).map(({ val, label, desc }) => {
                        const isSel = storeDistType === val;
                        return (
                          <button
                            key={val}
                            onClick={() => { setStoreDistType(val); setRf({ stores: val === 'all' ? [...allStores] : [] }); }}
                            className="flex items-start gap-3 p-4 rounded-xl text-left transition-all hover:opacity-90"
                            style={{ backgroundColor: 'var(--bg-elevated)', border: `2px solid ${isSel ? 'var(--text-primary)' : 'var(--border-subtle)'}` }}
                          >
                            <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all" style={{ borderColor: isSel ? 'var(--text-primary)' : 'var(--border-default)', backgroundColor: isSel ? 'var(--text-primary)' : 'transparent' }}>
                              {isSel && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--bg-primary)' }} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>{desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      {(showAllStores ? allStores : allStores.slice(0, 12)).map(store => {
                        const selected = rf.stores.includes(store);
                        return (
                          <button
                            key={store}
                            onClick={() => setRf({ stores: selected ? rf.stores.filter(s => s !== store) : [...rf.stores, store] })}
                            className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                            style={{
                              backgroundColor: selected ? 'var(--text-primary)' : 'var(--bg-elevated)',
                              color: selected ? 'var(--bg-primary)' : 'var(--text-primary)',
                              border: `1px solid ${selected ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
                            }}
                          >
                            {store}
                          </button>
                        );
                      })}
                    </div>
                    {stepErrors.stores && (
                      <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.9)' }}><svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Please select at least one store to distribute to.</p>
                    )}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowAllStores(v => !v)}
                        className="text-sm font-medium transition-all hover:opacity-80 flex items-center gap-1.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {showAllStores ? 'Show fewer stores' : `Show all stores (${allStores.length})`}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 transition-transform ${showAllStores ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 5: Review ── */}
              {releaseStep === 5 && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Review Your Release</h2>
                  </div>

                  {/* Release Info Card */}
                  <div className="rounded-2xl p-5 border" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                    <div className="flex gap-5">
                      {/* Artwork */}
                      <div className="flex-shrink-0">
                        {rf.artworkPreview ? (
                          <img src={rf.artworkPreview} alt="Artwork" className="w-36 h-36 rounded-xl object-cover" />
                        ) : (
                          <div className="w-36 h-36 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                            <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{rf.title || 'Untitled'}</h3>
                        <p className="text-sm mb-4" style={{ color: '#3B82F6' }}>{rf.releaseArtists || '[Untitled]'}</p>

                        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Release Type: </span><span style={{ color: 'var(--text-primary)' }}>{rf.tracks.length >= 7 ? 'Album' : rf.tracks.length >= 4 ? 'EP' : rf.tracks.length >= 1 ? 'Single' : '—'}</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Price Band: </span><span style={{ color: 'var(--text-primary)' }}>Budget</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Primary Genre: </span><span style={{ color: 'var(--text-primary)' }}>{rf.genre || '—'}</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Release Date: </span><span style={{ color: 'var(--text-primary)' }}>{releaseDateMode === 'most-recent' ? 'Most Recent' : rf.releaseDate || '—'}</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Secondary Genre: </span><span style={{ color: 'var(--text-primary)' }}>{rf.secondaryGenre || '—'}</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Original Release Date: </span><span style={{ color: 'var(--text-primary)' }}>{rf.originalReleaseDate || 'N/A'}</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Language: </span><span style={{ color: 'var(--text-primary)' }}>{rf.language || '—'}</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Release Time: </span><span style={{ color: 'var(--text-primary)' }}>N/A</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Copyright: </span><span style={{ color: 'var(--text-primary)' }}>© {rf.copyrightYear}, {rf.copyrightHolder || '—'}</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Label: </span><span style={{ color: 'var(--text-primary)' }}>{rf.recordLabel || 'Independent'}</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Production: </span><span style={{ color: 'var(--text-primary)' }}>{rf.productionYear}, {rf.productionHolder || '—'}</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Extras: </span><span style={{ color: 'var(--text-primary)' }}>N/A</span></div>
                          <div><span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Various Artists: </span><span style={{ color: 'var(--text-primary)' }}>No</span></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracklist */}
                  <div>
                    <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Tracklist</h3>
                    {stepErrors.tracks && (
                      <p className="text-xs mb-2 flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.9)' }}><svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>At least one track must be uploaded before continuing.</p>
                    )}
                    {rf.tracks.length === 0 ? (
                      <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: `1px solid ${stepErrors.tracks ? 'rgba(239,68,68,0.8)' : 'var(--border-subtle)'}`, color: 'var(--text-primary)', ...(stepErrors.tracks ? { boxShadow: '0 0 0 2px rgba(239,68,68,0.15)' } : {}) }}>
                        No uploaded tracks yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {rf.tracks.map((track, i) => {
                          const mins = Math.floor((track.duration || 0) / 60);
                          const secs = String(Math.floor((track.duration || 0) % 60)).padStart(2, '0');
                          const dur = track.duration > 0 ? `${mins}:${secs}` : '—:——';
                          return (
                          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                            <span className="w-5 text-center font-medium opacity-50" style={{ color: 'var(--text-primary)' }}>{i + 1}</span>
                            <span className="flex-1 font-medium" style={{ color: 'var(--text-primary)' }}>{track.title || 'Untitled'}</span>
                            {track.explicit && <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>E</span>}
                            {(!track.title || !track.credits.composer || !track.credits.songwriter || !track.credits.performer) && (
                              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.7 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            )}
                            <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>{dur}</span>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Bottom Complete Release button */}
                  <div className="flex flex-col items-center gap-2 pt-2">
                    {!rf.releaseArtists && (
                      <p className="text-xs flex items-center gap-1" style={{ color: 'rgba(239,68,68,0.9)' }}>
                        <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        A release artist must be selected before completing.
                      </p>
                    )}
                    <button
                      disabled={!rf.releaseArtists}
                      onClick={() => { setReleaseStep(1); setUploadingTracks([]); setEditingTrackIndex(null); setReleaseForm({ title: '', copyrightHolder: '', copyrightYear: String(new Date().getFullYear()), productionHolder: '', productionYear: String(new Date().getFullYear()), recordLabel: 'Independent', releaseArtists: '', genre: '', secondaryGenre: '', language: 'English', releaseDate: '', countryRestrictions: false, releasedBefore: false, originalReleaseDate: '', stores: [], tracks: [], artworkFile: null, artworkPreview: '' }); }}
                      className="flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Complete Release
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation buttons + progress bar */}
              <div className="mt-10 pt-6 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)', display: releaseStep === 5 ? 'none' : undefined }}>
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Step {releaseStep} of {steps.length}</span>
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{steps[releaseStep - 1]}</span>
                  </div>
                  <div className="flex gap-1">
                    {steps.map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ backgroundColor: releaseStep > i ? 'var(--text-primary)' : 'var(--border-subtle)' }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                <button
                  onClick={() => releaseStep > 1 ? setReleaseStep(s => s - 1) : setActiveSection('home')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                  style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  {releaseStep > 1 ? 'Back' : 'Cancel'}
                </button>

                {releaseStep < 5 ? (() => {
                  const checklistBlocked = releaseStep === 2 && !releaseChecklist.every(Boolean);
                  const artistBlocked = releaseStep === 1 && !rf.releaseArtists;

                  const validateStep = () => {
                    const errors: Record<string, boolean> = {};
                    if (releaseStep === 1) {
                      if (!rf.title) errors.title = true;
                      if (!rf.releaseArtists) { errors.releaseArtists = true; setReleaseArtistError(true); }
                      if (!rf.genre) errors.genre = true;
                    }
                    if (releaseStep === 2) {
                      if (rf.tracks.length === 0) errors.tracks = true;
                    }
                    if (releaseStep === 3) {
                      if (releaseDateMode === 'specific' && !rf.releaseDate) errors.releaseDate = true;
                    }
                    if (releaseStep === 4) {
                      if (rf.stores.length === 0) errors.stores = true;
                    }
                    setStepErrors(errors);
                    return Object.keys(errors).length === 0;
                  };

                  return (
                    <div className="flex flex-col items-end gap-2">
                      {checklistBlocked && (
                        <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.6 }}>Please check all boxes above to continue.</p>
                      )}
                      <button
                        onClick={() => {
                          if (!validateStep()) return;
                          if (!checklistBlocked) setReleaseStep(s => s + 1);
                        }}
                        disabled={checklistBlocked}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                      >
                        Continue <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                      </button>
                    </div>
                  );
                })() : (
                  <button
                    onClick={async () => {
                      if (draftId) {
                        await supabase.from('release_drafts').update({ status: 'submitted' }).eq('id', draftId);
                        await fetchDrafts(currentUserId);
                      }
                      setReleaseStep(1);
                      setUploadingTracks([]);
                      setEditingTrackIndex(null);
                      setDraftId(null);
                      setReleaseForm({ title: '', copyrightHolder: '', copyrightYear: String(new Date().getFullYear()), productionHolder: '', productionYear: String(new Date().getFullYear()), recordLabel: 'Independent', releaseArtists: '', genre: '', secondaryGenre: '', language: 'English', releaseDate: '', countryRestrictions: false, releasedBefore: false, originalReleaseDate: '', stores: [], tracks: [], artworkFile: null, artworkPreview: '' });
                      setReleaseChecklist([false, false, false]);
                      setShowReleaseForm(false);
                      setMyReleasesTab('complete');
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                    style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                  >
                    Submit Release
                  </button>
                )}
              </div>
                </div>
            </div>


            </div>
          </div>
          );
        })()}

              </main>

      {/* Campaign Detail Modal */}
      <CampaignDetailModal 
        campaign={selectedCampaign} 
        onClose={() => setSelectedCampaign(null)} 
        backgroundTheme={backgroundTheme}
      />
    </div>
    </>
  );
}
