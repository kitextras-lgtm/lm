import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, Instagram, Music2, LogOut, MapPin, Globe, Plus, Info, ArrowLeft, ChevronRight, ChevronDown, Loader2, X, MessageSquare, User, ImageIcon } from 'lucide-react';
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

function YouTubeIcon({ isHovered }: { isHovered: boolean; backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' }) {
  return (
    <div className="cursor-pointer flex items-center justify-center">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6">
        <rect 
          x="8" 
          y="12" 
          width="32" 
          height="24" 
          rx="6" 
          stroke={isHovered ? "#FF0000" : '#94A3B8'} 
          strokeWidth="2.5" 
          fill="none"
          style={{
            transition: "stroke 0.3s ease-in-out",
          }}
        />
        <path
          d="M20 18L32 24L20 30V18Z"
          stroke={isHovered ? "#FF0000" : '#94A3B8'}
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill={isHovered ? "#FF0000" : '#94A3B8'}
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

function TikTokIcon({ isHovered }: { isHovered: boolean; backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' }) {
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
            stroke='#94A3B8'
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d={wavePath} stroke='#94A3B8' strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

function InstagramIconAnimated({ isHovered }: { isHovered: boolean; backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' }) {
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
          stroke={isHovered ? "url(#igGradient)" : '#94A3B8'}
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
          stroke={isHovered ? "url(#igGradient)" : '#94A3B8'}
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
          fill='#94A3B8'
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

function CampaignDetailModal({ campaign, onClose }: { campaign: CampaignData | null; onClose: () => void; backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose' }) {
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
          <X className="w-5 h-5" style={{ color: '#94A3B8' }} />
        </button>

        {/* Header */}
        <div className="p-7 pb-5">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Video className="w-9 h-9 text-white" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="text-2xl font-bold" style={{ color: '#F8FAFC' }}>{campaign.name}</h2>
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm" style={{ color: '#CBD5E1' }}>{campaign.timeAgo}</p>
              <p className="text-base font-medium mt-1.5" style={{ color: '#CBD5E1' }}>{campaign.title}</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-7 mb-6 rounded-2xl py-5 px-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
          <div className="flex items-start">
            <div className="flex-1 text-center" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p className="text-xs mb-1.5" style={{ color: '#CBD5E1' }}>Ends</p>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>{campaign.endsIn}</p>
            </div>
            <div className="flex-1 text-center" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p className="text-xs mb-1.5" style={{ color: '#CBD5E1' }}>Language</p>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>{campaign.language}</p>
            </div>
            <div className="flex-1 text-center" style={{ borderRight: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <p className="text-xs mb-2" style={{ color: '#CBD5E1' }}>Platforms</p>
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
              <p className="text-xs mb-1.5" style={{ color: '#CBD5E1' }}>Pay Type</p>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>{campaign.payType}</p>
            </div>
            <div className="flex-1 text-center">
              <p className="text-xs mb-1.5" style={{ color: '#CBD5E1' }}>Payout</p>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>{campaign.payout}</p>
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="px-7 pb-5">
          <h3 className="text-lg font-bold mb-3" style={{ color: '#F8FAFC' }}>Details</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>{campaign.description}</p>
        </div>

        {/* Rules section */}
        <div className="px-7 pb-5">
          <h3 className="text-lg font-bold mb-3" style={{ color: '#F8FAFC' }}>Rules</h3>
          <div className={`text-sm leading-relaxed ${!showFullRules ? 'line-clamp-2' : ''}`} style={{ color: '#CBD5E1' }}>
            {campaign.rules.map((rule, index) => (
              <p key={index} className="mb-1.5">• {rule}</p>
            ))}
          </div>
          {campaign.rules.length > 1 && (
            <button
              onClick={() => setShowFullRules(!showFullRules)}
              className="text-sm font-semibold mt-3 hover:opacity-80 transition-opacity"
              style={{ color: '#F8FAFC' }}
            >
              {showFullRules ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* What to include */}
        {campaign.requiredHashtags && campaign.requiredHashtags.length > 0 && (
          <div className="px-7 pb-6">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#F8FAFC' }}>What to include</h3>
            <div className="flex items-start gap-4">
              <MessageSquare className="w-6 h-6 mt-0.5" style={{ color: '#CBD5E1' }} />
              <div>
                <p className="text-base font-medium" style={{ color: '#F8FAFC' }}>Caption, tags, text</p>
                <p className="text-xs font-semibold mt-2" style={{ color: '#CBD5E1' }}>REQUIRED HASHTAGS</p>
                <p className="text-sm mt-1.5" style={{ color: '#CBD5E1' }}>{campaign.requiredHashtags.join(' ')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Join button */}
        <div className="px-7 pb-7">
          <button
            className="w-full py-4 rounded-xl text-black font-semibold text-base transition-all hover:opacity-90"
            style={{ backgroundColor: '#F8FAFC' }}
          >
            Join campaign
          </button>
        </div>
      </div>
    </div>
  );
}

function RevenueAnalyticsCard() {
  const { t } = useTranslation();
  return (
    <div 
      className="rounded-xl sm:rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:brightness-105 cursor-pointer border" 
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6 sm:mb-8">
        <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>{t('home.monthlyRecurringRevenue')}</h3>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('home.totalRevenue')}</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>$2,847.50</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('home.change')}</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: '#10b981' }}>+6.1%</span>
        </div>
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
          <User className="w-6 h-6 relative z-10" style={{ color: "#525252", filter: "none" }} />
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
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>127</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>This Month</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: '#10b981' }}>+12</span>
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
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose';
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
  backgroundTheme?: 'light' | 'grey' | 'dark' | 'rose';
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
        <span className="text-base font-medium" style={{ color: '#F8FAFC' }}>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 transition-transform duration-200" style={{ color: '#64748B', transform: isHovered ? 'translateX(2px)' : 'translateX(0)' }} />
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
        <span style={{ color: '#F8FAFC' }}>{React.cloneElement(icon, { isHovered })}</span>
        <span className="text-base font-medium" style={{ color: '#F8FAFC' }}>{label}</span>
      </div>
      <svg className="w-5 h-5" style={{ color: '#F8FAFC' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    stores: [] as string[],
    tracks: [] as { title: string; featuring: string; explicit: boolean }[],
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
  
  // Use centralized theme from context
  const { theme: backgroundTheme, setTheme: setBackgroundTheme } = useTheme();
  // appliedTheme is now the same as backgroundTheme (single source of truth)
  const appliedTheme = backgroundTheme;
  
  const [feedbackCategory, setFeedbackCategory] = useState<'suggestion' | 'bug-report' | 'feature-request' | 'other' | null>(null);
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
              <h3 className="text-sm lg:text-base font-semibold mb-0.5" style={{ color: '#F8FAFC' }}>
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-xs lg:text-sm" style={{ color: '#CBD5E1' }}>
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
            <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: '#F8FAFC' }}>{t('personalInfo.firstName')}</label>
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
                  color: '#F8FAFC',
                  background: 'transparent',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                }}
                onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: '#F8FAFC' }}>{t('personalInfo.lastName')}</label>
            <div className="flex items-center gap-1 lg:gap-2">
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                className="flex-1 min-w-0 h-9 lg:h-10 px-2 lg:px-3 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: '#F8FAFC',
                  background: 'transparent',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                }}
                onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: '#F8FAFC' }}>{t('personalInfo.username')}</label>
          <div className="flex items-center gap-1 lg:gap-2">
            <div className="flex-1 flex items-center h-9 lg:h-10 px-2 lg:px-3 rounded-lg" style={{ background: 'transparent', border: '1px solid rgba(75, 85, 99, 0.5)' }}>
              <span className="text-xs lg:text-sm" style={{ color: '#F8FAFC' }}>@</span>
              <input
                type="text"
                value={formData.username}
                disabled
                className="flex-1 bg-transparent text-xs lg:text-sm focus:outline-none ml-1 opacity-50"
                style={{ color: '#F8FAFC' }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: '#F8FAFC' }}>{t('personalInfo.bio')}</label>
          <div className="flex items-center gap-1 lg:gap-2">
            <textarea
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              disabled={!isEditing}
              placeholder={t('personalInfo.bioPlaceholder')}
              className="flex-1 min-w-0 h-20 lg:h-24 px-2 lg:px-3 py-2 rounded-lg text-xs lg:text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all resize-none"
              style={{
                color: '#F8FAFC',
                background: 'transparent',
                border: '1px solid rgba(75, 85, 99, 0.5)',
              }}
              onFocus={(e) => e.target.style.borderColor = '#ffffff'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: '#F8FAFC' }}>{t('personalInfo.location')}</label>
          <div className="flex items-center gap-1 lg:gap-2">
            <div className="flex-1 min-w-0 flex items-center h-9 lg:h-10 px-2 lg:px-3 rounded-lg focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: 'transparent', border: '1px solid rgba(75, 85, 99, 0.5)' }}>
              <MapPin className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 flex-shrink-0" style={{ color: '#F8FAFC' }} />
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
                style={{ color: '#F8FAFC' }}
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country} style={{ background: 'var(--bg-card)' }}>{country}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: '#F8FAFC' }}>{t('personalInfo.languagesPostIn')}</label>
          <div className="flex items-center gap-1 lg:gap-2">
            <div className="flex-1 min-w-0 flex items-center h-9 lg:h-10 px-2 lg:px-3 rounded-lg focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: 'transparent', border: '1px solid rgba(75, 85, 99, 0.5)' }}>
              <Globe className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-1.5 flex-shrink-0" style={{ color: '#F8FAFC' }} />
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
                style={{ color: '#F8FAFC' }}
              >
                {LANGUAGES.map(language => (
                  <option key={language} value={language} style={{ background: 'var(--bg-card)' }}>{language}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: '#F8FAFC' }}>{t('personalInfo.email')}</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full h-9 lg:h-10 px-2 lg:px-3 rounded-lg text-xs lg:text-sm focus:outline-none opacity-50"
            style={{
              color: '#F8FAFC',
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
        <span className="text-sm" style={{ color: '#F8FAFC' }}>
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
            color: '#94A3B8' 
          }}>
          <Plus className="w-5 h-5" />
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
                <h3 className="text-lg font-semibold" style={{ color: '#F8FAFC' }}>{t('payment.paymentMethod')}</h3>
                <p className="text-sm mt-1" style={{ color: '#CBD5E1' }}>{t('payment.addPaymentDesc')}</p>
              </div>
              <button 
                onClick={() => setShowPaymentForm(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: '#F8FAFC' }} />
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
                  <svg className="mb-3 h-6 w-6" style={{ color: '#F8FAFC' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/>
                    <path d="M2 10h20" strokeWidth="2"/>
                  </svg>
                  <span className="text-sm" style={{ color: '#F8FAFC' }}>{t('payment.card')}</span>
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
                  <svg className="mb-3 h-6 w-6" style={{ color: '#F8FAFC' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                  </svg>
                  <span className="text-sm" style={{ color: '#F8FAFC' }}>{t('payment.paypal')}</span>
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
                  <svg className="mb-3 h-6 w-6" style={{ color: '#F8FAFC' }} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                  </svg>
                  <span className="text-sm" style={{ color: '#F8FAFC' }}>{t('payment.apple')}</span>
                </label>
              </div>

              {/* Card Details */}
              {paymentFormData.paymentType === 'card' && (
                <>
                  {/* Name on Card */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{t('payment.nameOnCard')}</label>
                    <input
                      type="text"
                      value={paymentFormData.nameOnCard}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, nameOnCard: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                      style={{
                        color: '#F8FAFC',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                      }}
                      placeholder="John Doe"
                      onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{t('payment.city')}</label>
                    <input
                      type="text"
                      value={paymentFormData.city}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, city: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                      style={{
                        color: '#F8FAFC',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                      }}
                      placeholder=""
                      onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                    />
                  </div>

                  {/* Card Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{t('payment.cardNumber')}</label>
                    <input
                      type="text"
                      value={paymentFormData.cardNumber}
                      onChange={(e) => setPaymentFormData({ ...paymentFormData, cardNumber: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                      style={{
                        color: '#F8FAFC',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(75, 85, 99, 0.5)',
                      }}
                      placeholder=""
                      onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                    />
                  </div>

                  {/* Expiry and CVC */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Expiry Month */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{t('payment.expires')}</label>
                      <select
                        value={paymentFormData.expiryMonth}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, expiryMonth: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                        style={{
                          color: '#F8FAFC',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#ffffff'}
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
                      <label className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{t('payment.year')}</label>
                      <select
                        value={paymentFormData.expiryYear}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, expiryYear: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                        style={{
                          color: '#F8FAFC',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#ffffff'}
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
                      <label className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{t('payment.cvc')}</label>
                      <input
                        type="text"
                        value={paymentFormData.cvc}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, cvc: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                        style={{
                          color: '#F8FAFC',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(75, 85, 99, 0.5)',
                        }}
                        placeholder="CVC"
                        onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PayPal/Apple Pay placeholder */}
              {(paymentFormData.paymentType === 'paypal' || paymentFormData.paymentType === 'apple') && (
                <div className="text-center py-8" style={{ color: '#CBD5E1' }}>
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
          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: '#F8FAFC' }}>Interface</h3>
          <div className="space-y-3 lg:space-y-6">
            <div className="flex items-center justify-between pb-3 lg:pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F8FAFC' }}>Message Notifications</h4>
                <p className="text-sm" style={{ color: '#CBD5E1' }}>Show notification dropdown for unread messages</p>
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
          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: '#F8FAFC' }}>{t('notifications.email')}</h3>

          <div className="space-y-3 lg:space-y-6">
            <div className="flex items-center justify-between pb-3 lg:pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F8FAFC' }}>{t('notifications.newFeatures')}</h4>
                <p className="text-sm" style={{ color: '#CBD5E1' }}>{t('notifications.newFeaturesDesc')}</p>
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
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F8FAFC' }}>{t('notifications.platformUpdates')}</h4>
                <p className="text-sm" style={{ color: '#CBD5E1' }}>{t('notifications.platformUpdatesDesc')}</p>
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

  const renderSendFeedback = () => (
    <div className="scroll-mt-6">
      <div className="space-y-5">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>
            {t('feedback.category')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFeedbackCategory('suggestion')}
              className="w-full text-left px-3 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 hover:brightness-105"
              style={{
                backgroundColor: feedbackCategory === 'suggestion' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: '#F8FAFC',
                border: feedbackCategory === 'suggestion' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.25)',
              }}
            >
              <SuggestionIcon isHovered={feedbackCategory === 'suggestion'} />
              <span>{t('feedback.suggestion')}</span>
            </button>
            
            <button
              onClick={() => setFeedbackCategory('bug-report')}
              className="w-full text-left px-3 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 hover:brightness-105"
              style={{
                backgroundColor: feedbackCategory === 'bug-report' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: '#F8FAFC',
                border: feedbackCategory === 'bug-report' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.25)',
              }}
            >
              <BugReportIcon isHovered={feedbackCategory === 'bug-report'} />
              <span>{t('feedback.bugReport')}</span>
            </button>
            
            <button
              onClick={() => setFeedbackCategory('feature-request')}
              className="w-full text-left px-3 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 hover:brightness-105"
              style={{
                backgroundColor: feedbackCategory === 'feature-request' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: '#F8FAFC',
                border: feedbackCategory === 'feature-request' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.25)',
              }}
            >
              <FeatureRequestIcon isHovered={feedbackCategory === 'feature-request'} />
              <span>{t('feedback.featureRequest')}</span>
            </button>
            
            <button
              onClick={() => setFeedbackCategory('other')}
              className="w-full text-left px-3 py-4 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-3 hover:brightness-105"
              style={{
                backgroundColor: feedbackCategory === 'other' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: '#F8FAFC',
                border: feedbackCategory === 'other' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(75, 85, 99, 0.25)',
              }}
            >
              <OtherIcon isHovered={feedbackCategory === 'other'} />
              <span>{t('feedback.other')}</span>
            </button>
          </div>
        </div>

        {/* Feedback Textarea */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#F8FAFC' }}>
            {t('feedback.yourFeedback')}
          </label>
          <textarea
            placeholder={t('feedback.feedbackPlaceholder')}
            rows={5}
            className="w-full px-4 py-3 rounded-xl text-sm resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/10 placeholder:text-slate-400 hover:border-slate-500/40"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              color: '#F8FAFC',
            }}
            onFocus={(e) => e.target.style.borderColor = '#ffffff'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(75, 85, 99, 0.5)'}
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setFeedbackCategory(null)}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(75, 85, 99, 0.25)',
              color: '#94A3B8',
            }}
          >
            {t('common.cancel')}
          </button>
          <button
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-105"
            style={{
              backgroundColor: feedbackCategory ? '#F8FAFC' : 'transparent',
              color: feedbackCategory ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: feedbackCategory ? 'none' : '1px solid rgba(75, 85, 99, 0.25)',
            }}
            disabled={!feedbackCategory}
          >
            {t('feedback.submitFeedback')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderGuides = () => (
    <div className="scroll-mt-6 px-4 lg:px-6 py-6">
      <h3 className="text-xl font-bold mb-4" style={{ color: '#F8FAFC' }}>Guides</h3>
      <p className="text-sm mb-6" style={{ color: '#CBD5E1' }}>Coming soon! We're working on creating helpful guides and tutorials for you.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <h4 className="font-semibold mb-2" style={{ color: '#F8FAFC' }}>Getting Started</h4>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>Learn the basics of using Elevate and setting up your profile.</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <h4 className="font-semibold mb-2" style={{ color: '#F8FAFC' }}>Campaign Tips</h4>
          <p className="text-sm" style={{ color: '#CBD5E1' }}>Discover best practices for creating successful campaign submissions.</p>
        </div>
      </div>
    </div>
  );

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
        style={{ borderColor: 'var(--border-subtle)', color: '#F8FAFC' }}
        onClick={() => setActiveSection('home')}
      >
        {t('common.cancel')}
      </button>
    </div>
  );

  const renderDisplay = () => {
    const getPreviewBackground = () => {
      switch (backgroundTheme) {
        case 'light':
          return '#0F172A';
        case 'grey':
          return '#1A1A1E';
        case 'rose':
          return '#120810';
        case 'dark':
        default:
          return '#000000';
      }
    };

    const getPreviewTextColor = () => {
      switch (backgroundTheme) {
        case 'light':
          return '#FFFFFF';
        case 'grey':
        case 'dark':
        default:
          return '#FFFFFF';
      }
    };

    const getPreviewSecondaryTextColor = () => {
      switch (backgroundTheme) {
        case 'light':
          return '#64748B';
        case 'grey':
        case 'dark':
        default:
          return '#94A3B8';
      }
    };

    return (
      <div className="scroll-mt-6">
        <div className="space-y-6 lg:space-y-8">
          {/* Preview Section */}
          <div>
            <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: '#F8FAFC' }}>{t('display.preview')}</h3>
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
            <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: '#F8FAFC' }}>{t('display.backgroundTheme')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Light Option */}
              <div 
                className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                  backgroundTheme === 'light' ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: '#0F172A' }}
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
                
                <h4 className="font-semibold text-white mb-1">{t('display.navy')}</h4>
                <p className="text-sm text-gray-300">{t('display.navyDesc')}</p>
              </div>

              {/* Grey Option */}
              <div 
                className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                  backgroundTheme === 'grey' ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: '#1A1A1E' }}
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
                
                <h4 className="font-semibold text-white mb-1">{t('display.grey')}</h4>
                <p className="text-sm text-gray-400">{t('display.greyDesc')}</p>
              </div>

              {/* Dark Option */}
              <div 
                className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                  backgroundTheme === 'dark' ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: '#000000' }}
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
                
                <h4 className="font-semibold text-white mb-1">{t('display.dark')}</h4>
                <p className="text-sm text-gray-400">{t('display.darkDesc')}</p>
              </div>

              {/* Rose Option */}
              <div
                className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-7 border-2 cursor-pointer transition-all duration-200 ${
                  backgroundTheme === 'rose' ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: '#120810' }}
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
                <h4 className="font-semibold text-white mb-1">Rose</h4>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Midnight rose</p>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div>
            <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: '#F8FAFC' }}>{t('display.sidebar')}</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border transition-all duration-200" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" style={{ color: '#CBD5E1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#F8FAFC' }}>{t('display.keepCollapsed')}</p>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{t('display.keepCollapsedDesc')}</p>
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
          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: '#F8FAFC' }}>{t('language.interfaceLanguage')}</h3>

          <div className="space-y-3 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 lg:pb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F8FAFC' }}>{t('language.displayLanguage')}</h4>
                <p className="text-sm" style={{ color: '#CBD5E1' }}>{t('language.chooseLanguage')}</p>
              </div>
              <div className="relative w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]" ref={languageDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="w-full px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
                  style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: '#F8FAFC' }}
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
                  <ChevronDown 
                    className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} 
                    style={{ color: '#94A3B8' }} 
                  />
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
                              color: '#F8FAFC',
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
                              <span className="ml-auto text-xs transition-all duration-200" style={{ color: '#94A3B8' }}>✓</span>
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
          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: '#F8FAFC' }}>{t('language.contentPreferences')}</h3>

          <div className="space-y-3 lg:space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F8FAFC' }}>{t('language.autoTranslate')}</h4>
                <p className="text-sm" style={{ color: '#94A3B8' }}>{t('language.autoTranslateDesc')}</p>
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
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#64748B', animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#64748B', animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#64748B', animationDelay: '300ms' }} />
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
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#F8FAFC' }}>{t('earnings.availableBalance')}</h3>
                  <Info className="w-4 h-4" style={{ color: '#94A3B8' }} />
                </div>
                <div className="mt-auto">
                  <div className="text-3xl sm:text-4xl font-bold" style={{ color: '#F8FAFC' }}>0.00</div>
                </div>
              </div>

              {/* Pending Balance Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#F8FAFC' }}>Pending balance</h3>
                  <Info className="w-4 h-4" style={{ color: '#94A3B8' }} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: '#F8FAFC' }}>0.00</div>
              </div>

              {/* Lifetime Earnings Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#F8FAFC' }}>Lifetime earnings</h3>
                  <Info className="w-4 h-4" style={{ color: '#94A3B8' }} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: '#F8FAFC' }}>0.00</div>
              </div>

              {/* Affiliate Earnings Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#F8FAFC' }}>{t('earnings.affiliateEarnings')}</h3>
                  <Info className="w-4 h-4" style={{ color: '#94A3B8' }} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: '#F8FAFC' }}>0.00</div>
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setEarningsTab('available')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200" 
                  style={{ backgroundColor: earningsTab === 'available' ? 'var(--bg-elevated)' : 'transparent', color: earningsTab === 'available' ? '#F8FAFC' : '#94A3B8', border: earningsTab === 'available' ? '1.5px solid rgba(148, 163, 184, 0.3)' : '1px solid transparent' }}
                >
                  Available
                </button>
                <button 
                  onClick={() => setEarningsTab('pending')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-105" 
                  style={{ backgroundColor: earningsTab === 'pending' ? 'var(--bg-elevated)' : 'transparent', color: earningsTab === 'pending' ? '#F8FAFC' : '#94A3B8', border: earningsTab === 'pending' ? '1.5px solid rgba(148, 163, 184, 0.3)' : '1px solid transparent' }}
                >
                  Pending
                </button>
                <button 
                  onClick={() => setEarningsTab('paidout')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-105" 
                  style={{ backgroundColor: earningsTab === 'paidout' ? 'var(--bg-elevated)' : 'transparent', color: earningsTab === 'paidout' ? '#F8FAFC' : '#94A3B8', border: earningsTab === 'paidout' ? '1.5px solid rgba(148, 163, 184, 0.3)' : '1px solid transparent' }}
                >
                  Paid out
                </button>
              </div>

              {/* Table Headers */}
              <div className="hidden sm:grid grid-cols-4 gap-4 pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="text-xs font-medium" style={{ color: '#94A3B8' }}>Date</div>
                <div className="text-xs font-medium" style={{ color: '#94A3B8' }}>Clip</div>
                <div className="text-xs font-medium" style={{ color: '#94A3B8' }}>Campaign/Description</div>
                <div className="text-xs font-medium" style={{ color: '#94A3B8' }}>Amount</div>
              </div>

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3" style={{ color: '#F8FAFC' }}>
                  {earningsTab === 'available' && 'No available earnings'}
                  {earningsTab === 'pending' && 'No pending earnings'}
                  {earningsTab === 'paidout' && 'No paid out earnings'}
                </h3>
                <p className="text-sm sm:text-base text-center" style={{ color: '#94A3B8' }}>Submit clips to campaigns and start earning!</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>{t('home.overview')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <RevenueAnalyticsCard />

            <FighterMusicCard />

            <TotalSongsDistributedCard />
          </div>
        </section>

        <section className="mb-10 sm:mb-20">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>{t('home.myAccounts')}</h2>
            <p className="text-sm sm:text-base" style={{ color: '#CBD5E1' }}>Add New Artist</p>
          </div>

          <SocialLinksForm appliedTheme={appliedTheme} userType="artist" userId={currentUserId} />
        </section>

        <section className="mb-8">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>{t('home.referralSection')}</h2>
            <p className="text-sm sm:text-base" style={{ color: '#CBD5E1' }}>{t('home.referralSectionDesc')}</p>
          </div>

          <ReferralSection userType="artist" userId={currentUserId} />
        </section>
          </div>
        )}

        {activeSection === 'talent' && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            <section className="mb-10 sm:mb-20">
              <div className="mb-5 sm:mb-7">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>Discover Talent</h2>
                <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Find and connect with talented creators</p>
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
              <p className="text-base" style={{ color: '#CBD5E1' }}>Distribute your music to all major streaming platforms worldwide.</p>
            </div>

            {/* New Release section */}
            <div className="mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#CBD5E1', letterSpacing: '0.12em' }}>New Release</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Standard Release card */}
                <div
                  className="group rounded-2xl p-6 flex flex-col gap-5 cursor-pointer transition-all duration-200 hover:brightness-110"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                  onClick={() => { setShowReleaseForm(true); setReleaseStep(1); }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <Music2 className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Standard Release</p>
                    <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>Singles, EPs and albums distributed to all major stores.</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowReleaseForm(true); setReleaseStep(1); }}
                    className="self-start flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-110"
                    style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    <Plus className="w-3.5 h-3.5" />
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
                  <span className="text-sm" style={{ color: '#CBD5E1' }}>Filter by:</span>
                  <div className="relative" ref={filterRef}>
                    <button
                      type="button"
                      onClick={() => setReleasesFilterOpen(o => !o)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border"
                      style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#ffffff'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      {releasesFilter}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${releasesFilterOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {releasesFilterOpen && (
                      <div className="absolute right-0 z-50 mt-1 rounded-xl overflow-hidden shadow-xl animate-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)', minWidth: '160px' }}>
                        {['Any release type', 'Single', 'EP', 'Album'].map(opt => (
                          <button key={opt} type="button" onClick={() => { setReleasesFilter(opt); setReleasesFilterOpen(false); }} className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between transition-all" style={{ color: 'var(--text-primary)', backgroundColor: releasesFilter === opt ? 'var(--bg-elevated)' : 'transparent' }} onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = releasesFilter === opt ? 'var(--bg-elevated)' : 'transparent'; e.currentTarget.style.transform = ''; }}>
                            {opt}{releasesFilter === opt && <span style={{ color: '#CBD5E1' }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-0 mb-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {(['in-progress', 'complete', 'inactive'] as const).map((tab) => {
                  const label = tab === 'in-progress' ? 'In-Progress' : tab.charAt(0).toUpperCase() + tab.slice(1);
                  const active = myReleasesTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setMyReleasesTab(tab)}
                      className="px-4 py-3 text-sm font-semibold transition-all duration-200 relative"
                      style={{ color: active ? 'var(--text-primary)' : '#CBD5E1' }}
                    >
                      {label}
                      {active && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--text-primary)' }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Empty state */}
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <Music2 className="w-6 h-6" style={{ color: '#CBD5E1' }} />
                </div>
                <p className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {myReleasesTab === 'in-progress' ? 'No releases in progress' : myReleasesTab === 'complete' ? 'No completed releases' : 'No inactive releases'}
                </p>
                <p className="text-sm max-w-xs" style={{ color: '#CBD5E1' }}>
                  {myReleasesTab === 'in-progress' ? 'Create a new release above to get started.' : 'Submitted releases will appear here once processed.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'explore' && showReleaseForm && (() => {
          const steps = ['Details', 'Tracks', 'Schedule', 'Stores', 'Review'];
          const currentYear = new Date().getFullYear();
          const years = Array.from({ length: 10 }, (_, i) => String(currentYear + 1 - i));
          const allStores = ['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'Tidal', 'Deezer', 'Pandora', 'SoundCloud'];
          const rf = releaseForm;
          const setRf = (patch: Partial<typeof releaseForm>) => setReleaseForm(f => ({ ...f, ...patch }));

          const inputCls = 'w-full px-4 py-3 rounded-xl text-base focus:outline-none transition-all';
          const inputStyle = { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' };
          const labelStyle = { color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '8px', display: 'block' };

          const ReleaseDropdown = ({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) => {
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
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#ffffff'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <span className="transition-all duration-200">{value || options[0]}</span>
                  <ChevronDown className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${open ? 'rotate-180' : ''}`} style={{ color: '#CBD5E1' }} />
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
                            {isSelected && <span className="text-xs" style={{ color: '#CBD5E1' }}>✓</span>}
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
            <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            <div className="flex gap-10 items-start">
            <div className="flex-1 min-w-0">

              {/* Back to lobby */}
              <button
                onClick={() => setShowReleaseForm(false)}
                className="flex items-center gap-2 mb-6 text-sm font-medium transition-all hover:opacity-70"
                style={{ color: '#CBD5E1' }}
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
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
                    <label style={labelStyle}>Title of album, EP or single</label>
                    <input
                      type="text"
                      value={rf.title}
                      onChange={e => setRf({ title: e.target.value })}
                      className={inputCls}
                      style={inputStyle}
                      placeholder=""
                      onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                    />
                  </div>

                  {/* Copyright row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Copyright Holder</label>
                      <input type="text" value={rf.copyrightHolder} onChange={e => setRf({ copyrightHolder: e.target.value })} className={inputCls} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ffffff'} onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Copyright Year</label>
                      <ReleaseDropdown value={rf.copyrightYear} options={years} onChange={v => setRf({ copyrightYear: v })} />
                    </div>
                  </div>

                  {/* Production row */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={labelStyle}>Production Holder</label>
                      <input type="text" value={rf.productionHolder} onChange={e => setRf({ productionHolder: e.target.value })} className={inputCls} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ffffff'} onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Production Year</label>
                      <ReleaseDropdown value={rf.productionYear} options={years} onChange={v => setRf({ productionYear: v })} />
                    </div>
                  </div>

                  {/* Record label row */}
                  <div>
                    <label style={labelStyle}>Record label</label>
                    <ReleaseDropdown value={rf.recordLabel} options={['Independent', 'Sony Music', 'Universal Music', 'Warner Music']} onChange={v => setRf({ recordLabel: v })} />
                  </div>

                  {/* Release artists */}
                  <div>
                    <label style={labelStyle}>Release artist(s)</label>
                    <input type="text" value={rf.releaseArtists} onChange={e => setRf({ releaseArtists: e.target.value })} className={inputCls} style={inputStyle} placeholder="Artist name" onFocus={(e) => e.target.style.borderColor = '#ffffff'} onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                  </div>

                  {/* Genre — primary, secondary, language */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label style={labelStyle}>Primary genre</label>
                        <ReleaseDropdown value={rf.genre || 'Select genre'} options={['Select genre', 'Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Country', 'Latin', 'Afrobeats', 'Alternative Rock', 'Indie', 'Soul', 'Other']} onChange={v => setRf({ genre: v === 'Select genre' ? '' : v })} />
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
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#CBD5E1' }} />
                        <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>
                          Not all genres are available on every store. When a genre you have selected does not exist on a specific store, we will select the closest alternative. The stores we distribute to will use this info when they categorize your release.<br /><br />
                          You must select a primary genre, but a secondary genre is optional.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#CBD5E1' }} />
                        <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>
                          If your tracks have no lyrics, this can be used to target a language-specific audience.
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
                            <ImageIcon className="w-10 h-10" style={{ color: '#CBD5E1' }} />
                            <span className="text-xs" style={{ color: '#CBD5E1' }}>No artwork</span>
                          </div>
                        )}
                      </div>

                      {/* Requirements */}
                      <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#93C5FD' }} />
                        <div className="text-sm leading-relaxed space-y-2 text-center" style={{ color: '#CBD5E1' }}>
                          <p className="font-semibold" style={{ color: '#F8FAFC' }}>Artwork requirements:</p>
                          <p>Cover art must be a square .jpg or .jpeg file, at least 1400x1400 pixels, not blurry or pixelated and no more than 10MB in size.</p>
                          <p>Cover art cannot contain:</p>
                          <ul className="space-y-0.5 pl-3 list-none">
                            <li className="flex items-start gap-1"><span>-</span><span>Social media logos or handles</span></li>
                            <li className="flex items-start gap-1"><span>-</span><span>Website links or brand/record label logos</span></li>
                            <li className="flex items-start gap-1"><span>-</span><span>Any text except for artist names and/or the name of the release</span></li>
                          </ul>
                          <p>If your cover art contains any of the above, we will have to reject your release. These rules are set by the music stores and we have to follow them.</p>
                        </div>
                      </div>

                      {/* Upload */}
                      <label
                        className="aspect-square rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200"
                        style={{ border: '2px dashed var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ffffff')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                      >
                        <input
                          type="file"
                          accept=".jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setRf({ artworkFile: file, artworkPreview: url });
                            }
                          }}
                        />
                        <ImageIcon className="w-8 h-8" style={{ color: '#CBD5E1' }} />
                        <div className="text-center">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Drag files here</p>
                          <p className="text-xs mt-0.5" style={{ color: '#CBD5E1' }}>or</p>
                        </div>
                        <span className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all hover:brightness-110" style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>
                          Select file
                        </span>
                      </label>
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

                    <div className="grid grid-cols-2 gap-5">
                      {/* Left: audio upload + requirements */}
                      <div className="space-y-4">
                        <label
                          className="flex flex-col items-center justify-center gap-3 p-8 rounded-xl cursor-pointer transition-all duration-200"
                          style={{ border: '2px dashed var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ffffff')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                          onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#ffffff'; e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}
                          onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
                          onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
                        >
                          <input type="file" accept=".wav,.mp3" className="hidden" />
                          <Music2 className="w-9 h-9" style={{ color: '#CBD5E1' }} />
                          <div className="text-center">
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Drag files here</p>
                            <p className="text-xs mt-0.5" style={{ color: '#CBD5E1' }}>or</p>
                          </div>
                          <span className="px-4 py-1.5 rounded-full text-xs font-semibold" style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>Select files</span>
                        </label>

                        {/* Audio requirements */}
                        <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#CBD5E1' }} />
                          <div className="space-y-1">
                            <p className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>Audio file requirements</p>
                            <div className="space-y-0.5 text-sm" style={{ color: '#CBD5E1' }}>
                              <p className="flex items-start gap-1"><ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />file format must be .wav or .mp3 (.wav is preferred)</p>
                              <p className="flex items-start gap-1"><ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />file size no larger than 200Mb</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: track list */}
                      <div className="rounded-xl p-5 space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Track List</p>

                        {rf.tracks.length === 0 && (
                          <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#CBD5E1' }} />
                            <p className="text-sm" style={{ color: '#CBD5E1' }}>This release does not have any tracks, use the button on the left to start adding some.</p>
                          </div>
                        )}

                        {rf.tracks.map((track, i) => (
                          <div key={i} className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Track {i + 1}</span>
                              <button onClick={() => setRf({ tracks: rf.tracks.filter((_, j) => j !== i) })} style={{ color: 'var(--text-primary)' }}>
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <input type="text" placeholder="Track title" value={track.title} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, title: e.target.value } : t) })} className={inputCls} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ffffff'} onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                            <input type="text" placeholder="Featuring artists (optional)" value={track.featuring} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, featuring: e.target.value } : t) })} className={inputCls} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#ffffff'} onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'} />
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={track.explicit} onChange={e => setRf({ tracks: rf.tracks.map((t, j) => j === i ? { ...t, explicit: e.target.checked } : t) })} className="w-4 h-4 rounded" />
                              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Explicit content</span>
                            </label>
                          </div>
                        ))}

                        <button
                          onClick={() => setRf({ tracks: [...rf.tracks, { title: '', featuring: '', explicit: false }] })}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold w-full justify-center transition-all hover:brightness-110"
                          style={{ border: '1px dashed var(--border-default)', color: 'var(--text-primary)', backgroundColor: 'transparent' }}
                        >
                          <Plus className="w-4 h-4" /> Add track
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#CBD5E1' }} />
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>Please complete the following checklist before proceeding</p>
                        <p className="text-sm mt-0.5" style={{ color: '#CBD5E1' }}>Please note that answering incorrectly to any of the following questions may result in delays to your music being sent to retailers.</p>
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

                    <p className="text-sm leading-relaxed" style={{ color: '#CBD5E1' }}>
                      If your release contains any copyrighted material such as samples, please upload the documentation proving you own the copyright to the audio.<br />
                      Without the required licensing documentation, music containing copyrighted material may be rejected by stores.
                    </p>

                    {(() => {
                      const [copyrightOption, setCopyrightOption] = React.useState<'none' | 'upload'>('none');
                      const [copyrightDocs, setCopyrightDocs] = React.useState<File[]>([]);
                      return (
                        <>
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
                                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ffffff')}
                                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#ffffff'; }}
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
                                  <svg className="w-10 h-10" style={{ color: '#CBD5E1' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                  <p className="text-sm" style={{ color: '#CBD5E1' }}>Drag here to upload</p>
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
                                  <p className="text-sm" style={{ color: '#CBD5E1' }}>No documents uploaded yet.</p>
                                ) : (
                                  <div className="space-y-2">
                                    {copyrightDocs.map((f, i) => (
                                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                                        <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{f.name}</span>
                                        <button onClick={() => setCopyrightDocs(prev => prev.filter((_, j) => j !== i))} style={{ color: '#CBD5E1' }}>
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ── STEP 3: Schedule ── */}
              {releaseStep === 3 && (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>3</div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Release <span className="font-bold">Schedule</span></h3>
                  </div>
                  <div>
                    <label style={labelStyle}>Release date</label>
                    <input
                      type="date"
                      value={rf.releaseDate}
                      onChange={e => setRf({ releaseDate: e.target.value })}
                      className={inputCls}
                      style={{ ...inputStyle, colorScheme: 'dark' }}
                      onFocus={(e) => e.target.style.borderColor = '#ffffff'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                    />
                  </div>
                  <div className="rounded-xl p-5 space-y-2" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Delivery timeline</p>
                    <p className="text-xs" style={{ color: 'var(--text-primary)' }}>Releases typically take 2–5 business days to appear on all stores. We recommend scheduling at least 7 days in advance for best results.</p>
                  </div>
                </div>
              )}

              {/* ── STEP 4: Stores ── */}
              {releaseStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>4</div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Select <span className="font-bold">Stores</span></h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {allStores.map(store => {
                      const selected = rf.stores.includes(store);
                      return (
                        <button
                          key={store}
                          onClick={() => setRf({ stores: selected ? rf.stores.filter(s => s !== store) : [...rf.stores, store] })}
                          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110"
                          style={{
                            backgroundColor: selected ? 'var(--bg-active)' : 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            border: `1px solid ${selected ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                          }}
                        >
                          {store}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setRf({ stores: rf.stores.length === allStores.length ? [] : [...allStores] })}
                    className="text-sm font-medium transition-all hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {rf.stores.length === allStores.length ? 'Deselect all' : 'Select all stores'}
                  </button>
                </div>
              )}

              {/* ── STEP 5: Review ── */}
              {releaseStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>5</div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Review <span className="font-bold">& Submit</span></h3>
                  </div>

                  {[
                    { label: 'Title', value: rf.title || '—' },
                    { label: 'Artist(s)', value: rf.releaseArtists || '—' },
                    { label: 'Genre', value: rf.genre || '—' },
                    { label: 'Record Label', value: rf.recordLabel },
                    { label: 'Copyright', value: `${rf.copyrightHolder || '—'} (${rf.copyrightYear})` },
                    { label: 'Production', value: `${rf.productionHolder || '—'} (${rf.productionYear})` },
                    { label: 'Release Date', value: rf.releaseDate || '—' },
                    { label: 'Tracks', value: rf.tracks.length ? rf.tracks.map(t => t.title || 'Untitled').join(', ') : '—' },
                    { label: 'Stores', value: rf.stores.length ? rf.stores.join(', ') : '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <span className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{label}</span>
                      <span className="text-sm text-right" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation buttons + progress bar */}
              <div className="mt-10 pt-6 space-y-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
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
                  <ArrowLeft className="w-4 h-4" />
                  {releaseStep > 1 ? 'Back' : 'Cancel'}
                </button>

                {releaseStep < 5 ? (
                  <button
                    onClick={() => setReleaseStep(s => s + 1)}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                    style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => { setReleaseStep(1); setReleaseForm({ title: '', copyrightHolder: '', copyrightYear: String(new Date().getFullYear()), productionHolder: '', productionYear: String(new Date().getFullYear()), recordLabel: 'Independent', releaseArtists: '', genre: '', secondaryGenre: '', language: 'English', releaseDate: '', stores: [], tracks: [], artworkFile: null, artworkPreview: '' }); }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                    style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                  >
                    Submit Release
                  </button>
                )}
              </div>
                </div>
            </div>

            {/* Right-side summary panel */}
            <div className="hidden lg:block w-72 flex-shrink-0 sticky top-8">
              <div className="rounded-2xl p-6 space-y-5" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                <h3 className="text-base font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Release Summary</h3>

                <div className="space-y-3">
                  {[
                    { label: 'Title', value: rf.title || '—' },
                    { label: 'Artist', value: rf.releaseArtists || '—' },
                    { label: 'Genre', value: rf.genre || '—' },
                    { label: 'Label', value: rf.recordLabel },
                    { label: 'Release Date', value: rf.releaseDate || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-3">
                      <span className="text-sm flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{label}</span>
                      <span className="text-sm text-right font-medium" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {rf.tracks.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Tracks ({rf.tracks.length})</p>
                    <div className="space-y-1">
                      {rf.tracks.map((t, i) => (
                        <p key={i} className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{i + 1}. {t.title || 'Untitled'}</p>
                      ))}
                    </div>
                  </div>
                )}

                {rf.stores.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Stores ({rf.stores.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rf.stores.map(s => (
                        <span key={s} className="text-sm px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-active)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

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
