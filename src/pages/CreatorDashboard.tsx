import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, AlertTriangle, Users, User, X, Search, Palette, Music, AlertCircle, Bell, ChevronRight, ChevronDown, Network, MapPin, Globe, Plus, Info } from 'lucide-react';
import { SuggestionIcon, BugReportIcon, FeatureRequestIcon, OtherIcon } from '../components/FeedbackIcons';
import { SocialLinksForm } from '../components/SocialLinksForm';
import { ReferralSection } from '../components/ReferralSection';
import { DoorTransition } from '../components/DoorTransition';
import { MessagesPage } from './MessagesPage';
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
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ProfileView } from '../components/ProfileView';
import { SettingsView } from '../components/SettingsView';
import { AccountTypeSection } from '../components/AccountTypeSection';
import { ToggleSwitch } from '../components/ToggleSwitch';
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
            stroke={'currentColor'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d={wavePath} stroke={'currentColor'} strokeWidth="2.5" strokeLinecap="round" fill="none" />
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
          fill={'currentColor'}
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
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
          <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* Header */}
        <div className="p-7 pb-5">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{campaign.name}</h2>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{campaign.timeAgo}</p>
            {campaign.title && <p className="text-base font-medium mt-1.5" style={{ color: 'var(--text-primary)' }}>{campaign.title}</p>}
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
            <div className="flex-1 text-center">
              <p className="text-xs mb-1.5" style={{ color: 'var(--text-primary)' }}>Pay Type</p>
              <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{campaign.payType}</p>
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
          onClick={(e) => {
            e.stopPropagation();
            if (onViewMore) onViewMore();
          }}
          className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
          style={{ color: 'var(--text-primary)' }}
        >
          <span>{t('home.viewMore')}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ActiveCollaborationsCard({ setActiveSection }: { setActiveSection: (section: string) => void }) {
  const { t } = useTranslation();
  return (
    <div 
      className="rounded-xl sm:rounded-2xl p-5 sm:p-7 pb-3 sm:pb-4 transition-all duration-200 hover:brightness-105 cursor-pointer border flex flex-col h-full" 
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-6 sm:mb-8">
        <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>
          <span className="sm:hidden">{t('home.activeCollaborationsDeals')}</span>
          <span className="hidden sm:inline">{t('home.activeCollaborations')}</span>
        </h3>
      </div>

      <div className="space-y-4 sm:space-y-5 flex-grow">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('home.total')}</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>0</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('home.pending')}</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>0</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('home.active')}</span>
          <span className="font-semibold text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>0</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t flex items-center justify-end" style={{ borderColor: 'var(--border-subtle)' }}>
        <button 
          className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
          style={{ color: 'var(--text-primary)' }}
          onClick={() => setActiveSection('deals')}
        >
          <span>{t('home.viewMore')}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface GearProps {
  cx: number
  cy: number
  outerRadius: number
  innerRadius: number
  holeRadius: number
  teeth: number
  rotation: number
  color: string
  id: string
}

function Gear({ cx, cy, outerRadius, innerRadius, holeRadius, teeth, rotation, color, id }: GearProps) {
  const toothWidth = (2 * Math.PI) / teeth / 2

  let pathD = ""

  for (let i = 0; i < teeth; i++) {
    const angle = (i * 2 * Math.PI) / teeth

    const outerStart = angle - toothWidth * 0.4
    const outerEnd = angle + toothWidth * 0.4
    const innerStart = angle + toothWidth * 0.6
    const innerEnd = angle + toothWidth * 1.4

    if (i === 0) {
      pathD += `M ${cx + Math.cos(outerStart) * outerRadius} ${cy + Math.sin(outerStart) * outerRadius} ` 
    }

    pathD += `A ${outerRadius} ${outerRadius} 0 0 1 ${cx + Math.cos(outerEnd) * outerRadius} ${cy + Math.sin(outerEnd) * outerRadius} ` 
    pathD += `L ${cx + Math.cos(innerStart) * innerRadius} ${cy + Math.sin(innerStart) * innerRadius} ` 
    pathD += `A ${innerRadius} ${innerRadius} 0 0 1 ${cx + Math.cos(innerEnd) * innerRadius} ${cy + Math.sin(innerEnd) * innerRadius} ` 

    if (i < teeth - 1) {
      const nextOuterStart = ((i + 1) * 2 * Math.PI) / teeth - toothWidth * 0.4
      pathD += `L ${cx + Math.cos(nextOuterStart) * outerRadius} ${cy + Math.sin(nextOuterStart) * outerRadius} ` 
    }
  }

  pathD += "Z"

  return (
    <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
      <defs>
        <linearGradient id={`gear-gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="50%" stopColor={color} stopOpacity="0.85" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Main gear body */}
      <path d={pathD} fill={`url(#gear-gradient-${id})`} opacity="0.6" />

      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={innerRadius * 0.7} fill="none" stroke={color} strokeWidth="0.3" opacity="0.4" />

      {/* Center hub */}
      <circle cx={cx} cy={cy} r={holeRadius + 4} fill={color} opacity="0.5" />

      {/* Center highlight dot */}
      <circle cx={cx - 1} cy={cy - 1} r={holeRadius * 0.3} fill={color} opacity="0.3" />

      {/* Spokes */}
      {[0, 90, 180, 270].map((spokeAngle) => (
        <line
          key={spokeAngle}
          x1={cx + Math.cos((spokeAngle * Math.PI) / 180) * (holeRadius + 5)}
          y1={cy + Math.sin((spokeAngle * Math.PI) / 180) * (holeRadius + 5)}
          x2={cx + Math.cos((spokeAngle * Math.PI) / 180) * (innerRadius * 0.65)}
          y2={cy + Math.sin((spokeAngle * Math.PI) / 180) * (innerRadius * 0.65)}
          stroke={color}
          strokeWidth="2"
          opacity="0.4"
          strokeLinecap="round"
        />
      ))}
    </g>
  )
}

function GearsWidget() {
  const [rotation, setRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.05) % 360)
    }, 16)
    return () => clearInterval(interval)
  }, [])

  return (
    <svg width="200" height="140" viewBox="0 0 200 140" className="overflow-visible">
      {/* Large gear - rotates clockwise */}
      <Gear
        cx={65}
        cy={70}
        outerRadius={42}
        innerRadius={34}
        holeRadius={8}
        teeth={16}
        rotation={rotation}
        color="#ffffff"
        id="large"
      />

      {/* Medium gear - rotates counter-clockwise */}
      <Gear
        cx={135}
        cy={70}
        outerRadius={32}
        innerRadius={25}
        holeRadius={6}
        teeth={12}
        rotation={-rotation * 1.33}
        color="#ffffff"
        id="medium"
      />

      {/* Small gear - rotates clockwise faster */}
      <Gear
        cx={158}
        cy={35}
        outerRadius={20}
        innerRadius={15}
        holeRadius={4}
        teeth={8}
        rotation={rotation * 1.6}
        color="#ffffff"
        id="small"
      />
    </svg>
  )
}

function PowerWidget() {
  const [wattage, setWattage] = useState(18.79)
  const [isPlugGlowing, setIsPlugGlowing] = useState(false)
  const [isBriefcaseGlowing, setIsBriefcaseGlowing] = useState(false)
  const [isCenterGlowing, setIsCenterGlowing] = useState(false)
  const [isCharging, setIsCharging] = useState(false)
  const [hue, setHue] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWattage((prev) => {
        const change = (Math.random() - 0.5) * 2
        return Math.max(0, Math.min(100, prev + change))
      })
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Create pulse sequence: Person → Center → Network
    const pulseSequence = () => {
      // Reset all states first
      setIsPlugGlowing(false)
      setIsCenterGlowing(false)
      setIsBriefcaseGlowing(false)
      
      // 1. Person icon pulses first (300ms)
      const leftTimer = setTimeout(() => {
        setIsPlugGlowing(true)
        setTimeout(() => setIsPlugGlowing(false), 400)
      }, 300)

      // 2. Center pulses when shimmer is in the middle (1600ms)
      const centerTimer = setTimeout(() => {
        setIsCenterGlowing(true)
        setTimeout(() => setIsCenterGlowing(false), 400)
      }, 1600)

      // 3. Network icon pulses last (2900ms)
      const rightTimer = setTimeout(() => {
        setIsBriefcaseGlowing(true)
        setTimeout(() => setIsBriefcaseGlowing(false), 400)
      }, 2900)

      return () => {
        clearTimeout(leftTimer)
        clearTimeout(centerTimer)
        clearTimeout(rightTimer)
      }
    }

    // Start immediately
    const cleanup = pulseSequence()
    
    // Repeat every 3.5 seconds to allow for the full sequence
    const interval = setInterval(pulseSequence, 3500)
    return () => {
      clearInterval(interval)
      cleanup?.()
    }
  }, [])

  useEffect(() => {
    // Hue rotation for rainbow effect
    const interval = setInterval(() => {
      setHue((prev) => (prev + 2) % 360)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  const getRainbowColor = (alpha = 1) => `hsla(${hue}, 100%, 60%, ${alpha})` 

  const getGlowStyle = (isGlowing: boolean, fallbackColor = "#a3a3a3", fallbackGlow = "none") => ({
    color: isGlowing ? getRainbowColor() : fallbackColor,
    filter:
      isGlowing
        ? `drop-shadow(0 0 12px ${getRainbowColor(1)}) drop-shadow(0 0 20px ${getRainbowColor(0.7)}) drop-shadow(0 0 30px ${getRainbowColor(0.5)})` 
        : fallbackGlow,
    transition: "color 0.3s ease-in-out, filter 0.3s ease-in-out",
  })

  return (
    <div
      className="relative flex items-center gap-1.5 p-1.5 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.5)]"
      style={{ 
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)'
      }}
    >
      {/* Left - User Button */}
      <div className="relative z-10">
        <button
          onClick={() => setIsCharging(!isCharging)}
          className="relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 overflow-hidden"
          style={{ 
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
        >
          <User className="w-6 h-6 relative z-10" style={getGlowStyle(isPlugGlowing, 'rgb(82, 82, 82)')} />
        </button>
      </div>

      {/* Center - Power Display */}
      <div className="relative flex items-center justify-center w-44 h-14 rounded-xl overflow-hidden"
        style={{ 
          background: 'linear-gradient(to bottom right, var(--bg-input), var(--bg-card))',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${getRainbowColor(0.15)}, ${getRainbowColor(0.35)}, ${getRainbowColor(0.15)}, transparent)`,
            width: "80px",
            animation: "shimmer 3s linear infinite",
          }}
        />
      </div>

      {/* Right - Briefcase Button */}
      <div className="relative z-10">
        <button
          className="relative flex items-center justify-center w-14 h-14 rounded-xl transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-input)')}
        >
          <Network
            className="w-6 h-6"
            style={getGlowStyle(
              isBriefcaseGlowing,
              'rgb(82, 82, 82)',
              "none",
            )}
          />
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-60px); }
          100% { transform: translateX(200px); }
        }
      `}</style>
    </div>
  )
}

function ActiveOpportunitiesCard({ onViewMore }: { onViewMore?: () => void }) {
  const { t } = useTranslation();
  return (
    <div 
      className="rounded-xl sm:rounded-2xl p-5 sm:p-7 pb-3 sm:pb-4 transition-all duration-200 hover:brightness-105 cursor-pointer border flex flex-col h-full" 
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
    >
      <div className="mb-4 sm:mb-5">
        <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: 'var(--text-primary)' }}>{t('home.activeOpportunities')}</h3>
      </div>
      
      <div className="flex flex-col items-center gap-3 mt-8 flex-grow">
        <PowerWidget />
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
          {t('home.status')} <span style={{ color: '#10b981' }}>{t('home.enabled')}</span>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t flex items-center justify-end" style={{ borderColor: 'var(--border-subtle)' }}>
        <button 
          className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
          style={{ color: 'var(--text-primary)' }}
          onClick={onViewMore}
        >
          <span>{t('home.viewMore')}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}


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
      <ChevronRight className="w-5 h-5 transition-transform duration-200" style={{ color: 'var(--text-primary)', transform: isHovered ? 'translateX(2px)' : 'translateX(0)' }} />
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

const COUNTRY_KEYS = [
  'unitedStatesOfAmerica', 'unitedKingdom', 'canada', 'australia', 'germany', 'france', 'spain', 'italy',
  'japan', 'southKorea', 'brazil', 'mexico', 'india', 'china', 'netherlands', 'sweden', 'norway', 'denmark',
  'finland', 'switzerland', 'austria', 'belgium', 'portugal', 'poland', 'greece', 'ireland', 'newZealand',
  'singapore', 'southAfrica', 'argentina', 'chile', 'colombia', 'peru', 'thailand', 'vietnam', 'malaysia',
  'indonesia', 'philippines', 'turkey', 'uae', 'saudiArabia', 'israel', 'egypt', 'nigeria', 'kenya', 'other'
];

const LANGUAGE_KEYS = [
  'english', 'spanish', 'french', 'german', 'italian', 'portuguese', 'dutch', 'russian',
  'chineseM', 'japanese', 'korean', 'arabic', 'hindi', 'bengali', 'turkish', 'vietnamese',
  'thai', 'indonesian', 'malay', 'tagalog', 'swedish', 'norwegian', 'danish', 'finnish',
  'polish', 'greek', 'hebrew', 'swahili', 'other'
];

export function CreatorDashboard() {
  // Use cached profile for instant loading (like Twitter/Instagram)
  const { profile: cachedProfile, userId: cachedUserId, updateProfile: updateCachedProfile, clearCache: clearProfileCache } = useUserProfile();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [homeSubPage, setHomeSubPage] = useState<'main' | 'opportunities' | 'analytics'>('main');
  const [analyticsView, setAnalyticsView] = useState<'weekly' | 'monthly' | 'lifetime'>('weekly');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [sidebarPermanentlyCollapsed, setSidebarPermanentlyCollapsed] = useState(false);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [earningsTab, setEarningsTab] = useState<'available' | 'pending' | 'paidout'>('available');
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('personal');
  const [mobileSettingsView, setMobileSettingsView] = useState<'menu' | SettingsSection>('menu');
  const [guideSearch, setGuideSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isTipaltiConnected, setIsTipaltiConnected] = useState(false);
  const [expandedOppsCard, setExpandedOppsCard] = useState<string | null>('campaigns');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  
  // Talent filter states
  const [locationFilterOpen, setLocationFilterOpen] = useState(false);
  const [talentTypeFilterOpen, setTalentTypeFilterOpen] = useState(false);
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [successRateFilterOpen, setSuccessRateFilterOpen] = useState(false);
  const [socialMediaFilterOpen, setSocialMediaFilterOpen] = useState(false);
  const [skillsFilterOpen, setSkillsFilterOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  
  // Selected filters state
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTalentTypes, setSelectedTalentTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSuccessRate, setSelectedSuccessRate] = useState<string>('');
  const [selectedSocialMedia, setSelectedSocialMedia] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
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
  const [assignedCampaigns, setAssignedCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [emailNewFeatures, setEmailNewFeatures] = useState<boolean>(true);
  const [emailPlatformUpdates, setEmailPlatformUpdates] = useState<boolean>(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [messageNotifications, setMessageNotifications] = useState<boolean>(true);
  
  // Use centralized theme from context
  const { theme: backgroundTheme, setTheme: setBackgroundTheme, flatBackground, setFlatBackground } = useTheme();
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
    console.log('🏷️ [CreatorDashboard] Badge Debug:', {
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
      console.log('[CreatorDashboard] 🚀 INSTANT: Loading from cached profile');
      setUserProfile(cachedProfile);
      setUserType('CREATOR');
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
    localStorage.setItem('currentDashboard', '/dashboard/creator');
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

  // Fetch campaigns assigned to this creator
  useEffect(() => {
    if (!currentUserId) return;
    const fetchAssignedCampaigns = async () => {
      setCampaignsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_campaigns')
          .select('campaign_id, campaigns(*)')
          .eq('user_id', currentUserId);
        if (error) throw error;
        const campaigns = (data || [])
          .map((row: any) => row.campaigns)
          .filter(Boolean);
        setAssignedCampaigns(campaigns);
      } catch (e) {
        console.error('[Campaigns] Error fetching assigned campaigns:', e);
      } finally {
        setCampaignsLoading(false);
      }
    };
    fetchAssignedCampaigns();
  }, [currentUserId]);

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
      
      if (!userId) {
        console.warn('❌ No user ID found. Auth error:', authError);
        console.warn('Verified email:', verifiedEmail);
        return;
      }

      setCurrentUserId(userId);

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
      setUserType('CREATOR');
      
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
      });
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
          <div className="relative">
            <button
              type="button"
              onClick={() => isEditing && setLocationDropdownOpen(!locationDropdownOpen)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
              style={{ 
                backgroundColor: locationDropdownOpen ? 'var(--bg-elevated)' : 'transparent', 
                borderColor: locationDropdownOpen ? '#FFFFFF' : 'var(--border-subtle)', 
                color: 'var(--text-primary)',
                opacity: isEditing ? 1 : 0.5,
                cursor: isEditing ? 'pointer' : 'not-allowed',
                transform: locationDropdownOpen ? 'translateY(-1px)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (isEditing) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (isEditing && !locationDropdownOpen) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 transition-all duration-200 group-hover:scale-110" style={{ color: 'var(--text-primary)' }} />
                <span className="transition-all duration-200">{formData.location || t('personalInfo.selectLocation')}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${locationDropdownOpen ? 'rotate-180' : ''}`} 
                style={{ color: 'var(--text-primary)' }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {locationDropdownOpen && (
              <div
                className="absolute z-50 w-full mt-1 rounded-lg shadow-xl overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
              >
                <div className="max-h-60 overflow-y-auto">
                  {COUNTRY_KEYS.map((countryKey) => {
                    const label = t(`countries.${countryKey}`);
                    return (
                    <button
                      key={countryKey}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, location: label });
                        setLocationDropdownOpen(false);
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-sm transition-all duration-200 flex items-center gap-2 group/option relative"
                      style={{
                        backgroundColor: label === formData.location ? 'var(--bg-elevated)' : 'transparent',
                        color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => {
                        if (label !== formData.location) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                        }
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        if (label !== formData.location) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {label === formData.location && <span className="text-white">✓</span>}
                      <span>{label}</span>
                    </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs lg:text-sm font-medium mb-1 lg:mb-1.5" style={{ color: 'var(--text-primary)' }}>{t('personalInfo.languagesPostIn')}</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => isEditing && setLanguageDropdownOpen(!languageDropdownOpen)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
              style={{ 
                backgroundColor: languageDropdownOpen ? 'var(--bg-elevated)' : 'transparent', 
                borderColor: languageDropdownOpen ? '#FFFFFF' : 'var(--border-subtle)', 
                color: 'var(--text-primary)',
                opacity: isEditing ? 1 : 0.5,
                cursor: isEditing ? 'pointer' : 'not-allowed',
                transform: languageDropdownOpen ? 'translateY(-1px)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (isEditing) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (isEditing && !languageDropdownOpen) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 transition-all duration-200 group-hover:scale-110" style={{ color: 'var(--text-primary)' }} />
                <span className="transition-all duration-200">{formData.language || t('personalInfo.selectLanguage')}</span>
              </div>
              <svg 
                className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${languageDropdownOpen ? 'rotate-180' : ''}`} 
                style={{ color: 'var(--text-primary)' }} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {languageDropdownOpen && (
              <div
                className="absolute z-50 w-full mt-1 rounded-lg shadow-xl overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
              >
                <div className="max-h-60 overflow-y-auto">
                  {LANGUAGE_KEYS.map((langKey) => {
                    const label = t(`languages.${langKey}`);
                    return (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, language: label });
                        setLanguageDropdownOpen(false);
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-sm transition-all duration-200 flex items-center gap-2 group/option relative"
                      style={{
                        backgroundColor: label === formData.language ? 'var(--bg-elevated)' : 'transparent',
                        color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => {
                        if (label !== formData.language) {
                          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                        }
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        if (label !== formData.language) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {label === formData.language && <span className="text-white">✓</span>}
                      <span>{label}</span>
                    </button>
                    );
                  })}
                </div>
              </div>
            )}
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
      <SocialLinksForm appliedTheme={appliedTheme} userType="creator" userId={currentUserId} />
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
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('payment.paymentMethod')}</h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>{t('payment.addPaymentDesc')}</p>
              </div>
              <button 
                onClick={() => setShowPaymentForm(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
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

  const renderGuides = () => {
    const guideCategories = [
      {
        icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>),
        title: 'Frequently Asked Questions', desc: 'Answers to questions we\'re asked the most often.', count: '27 articles',
        accent: 'rgba(99,102,241,0.15)', accentBorder: 'rgba(99,102,241,0.35)', accentColor: '#818CF8',
      },
      {
        icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
        title: 'The Basics', desc: 'How to get started as a creator on Elevate.', count: '18 articles',
        accent: 'rgba(34,197,94,0.12)', accentBorder: 'rgba(34,197,94,0.3)', accentColor: '#4ADE80',
      },
      {
        icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>),
        title: 'Uploading Content', desc: 'How to upload and publish your creative work.', count: '20 articles',
        accent: 'rgba(59,130,246,0.12)', accentBorder: 'rgba(59,130,246,0.3)', accentColor: '#60A5FA',
      },
      {
        icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>),
        title: 'Getting Paid', desc: 'How royalties and payouts work on Elevate.', count: '12 articles',
        accent: 'rgba(16,185,129,0.12)', accentBorder: 'rgba(16,185,129,0.3)', accentColor: '#34D399',
      },
      {
        icon: (<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" /></svg>),
        title: 'Campaigns & Earnings', desc: 'Submit clips and earn from brand campaigns.', count: '9 articles',
        accent: 'rgba(239,68,68,0.12)', accentBorder: 'rgba(239,68,68,0.3)', accentColor: '#F87171',
      },
    ];
    const filtered = guideCategories.filter(c =>
      !guideSearch.trim() ||
      c.title.toLowerCase().includes(guideSearch.toLowerCase()) ||
      c.desc.toLowerCase().includes(guideSearch.toLowerCase())
    );
    return (
      <div className="scroll-mt-6">
        <div className="relative mb-6">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-primary)', opacity: 0.5 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search for articles..." value={guideSearch} onChange={e => setGuideSearch(e.target.value)}
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
            <button key={idx} className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl text-left transition-all duration-200 hover:brightness-110"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
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
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>{cat.count}</p>
              </div>
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-primary)', opacity: 0.35 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderSendFeedback = () => (
    <div className="scroll-mt-6">
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
                border: feedbackCategory === 'suggestion' ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
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
                border: feedbackCategory === 'bug-report' ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
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
                border: feedbackCategory === 'feature-request' ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
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
                border: feedbackCategory === 'other' ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
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

        {/* Submit Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => setFeedbackCategory(null)}
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
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:brightness-105"
            style={{
              backgroundColor: feedbackCategory ? 'var(--text-primary)' : 'transparent',
              color: feedbackCategory ? 'var(--bg-primary)' : 'var(--text-primary)',
              border: feedbackCategory ? 'none' : '1px solid var(--border-subtle)',
            }}
            disabled={!feedbackCategory}
          >
            {t('feedback.submitFeedback')}
          </button>
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
                    backgroundTheme === 'light' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                <p className="text-sm" style={{ color: backgroundTheme === 'white' ? '#ffffff' : '#94A3B8' }}>{t('display.navyDesc')}</p>
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
                    backgroundTheme === 'grey' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                <p className="text-sm" style={{ color: backgroundTheme === 'white' ? '#ffffff' : '#94A3B8' }}>{t('display.greyDesc')}</p>
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
                    backgroundTheme === 'rose' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                <p className="text-sm" style={{ color: '#94A3B8' }}>Midnight rose</p>
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
                    backgroundTheme === 'dark' ? 'bg-white border-white' : 'bg-white border-gray-400'
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
                <p className="text-sm" style={{ color: '#94A3B8' }}>{t('display.darkDesc')}</p>
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
                    backgroundTheme === 'white' ? 'bg-gray-800 border-gray-800' : 'bg-gray-200 border-gray-400'
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
                  <ChevronDown 
                    className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} 
                    style={{ color: 'var(--text-primary)' }} 
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
          userType="creator"
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
              <MessagesPage currentUserId={currentUserId} backgroundTheme={backgroundTheme} userType="creator" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6 sm:mb-8">
              {/* Available Balance Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 flex flex-col border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t('earnings.availableBalance')}</h3>
                  <Info className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div className="mt-auto">
                  <div className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>$0.00</div>
                </div>
              </div>

              {/* Affiliate Earnings Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{t('earnings.affiliateEarnings')}</h3>
                  <Info className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>$0.00</div>
              </div>
            </div>

            {/* Transactions Section */}
            <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t('earnings.transactions')}</h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>{t('earnings.updatedEvery')}</p>
                </div>
                <button className="flex items-center gap-1 text-sm font-medium transition-opacity hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                  {t('earnings.viewAll')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <button 
                  onClick={() => setEarningsTab('available')}
                  className="pb-3 text-sm font-medium transition-all duration-200 border-b-2" 
                  style={{ 
                    color: earningsTab === 'available' ? 'var(--text-primary)' : 'var(--text-primary)',
                    borderColor: earningsTab === 'available' ? 'var(--text-primary)' : 'transparent'
                  }}
                >
                  {t('earnings.latest')}
                </button>
                <button 
                  onClick={() => setEarningsTab('pending')}
                  className="pb-3 text-sm font-medium transition-all duration-200 border-b-2" 
                  style={{ 
                    color: earningsTab === 'pending' ? 'var(--text-primary)' : 'var(--text-primary)',
                    borderColor: earningsTab === 'pending' ? 'var(--text-primary)' : 'transparent'
                  }}
                >
                  {t('earnings.upcoming')}
                </button>
              </div>

              {/* Transaction List */}
              <div className="space-y-0">
                {/* Transaction Row 1 */}
                <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-6">
                    <span className="text-sm w-24" style={{ color: 'var(--text-primary)' }}>16 Aug 2025</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('earnings.withdrawalTo')} JP Morgan Chase (0440)</p>
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{t('earnings.completed')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium" style={{ color: '#ef4444' }}>-1,275.79 USD</span>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:bg-white/5" style={{ borderColor: '#2f2f2f' }}>
                      <svg className="w-4 h-4" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Transaction Row 2 */}
                <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-6">
                    <span className="text-sm w-24" style={{ color: 'var(--text-primary)' }}>5 Aug 2025</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('earnings.withdrawalTo')} Citibank (2290)</p>
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{t('earnings.completed')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium" style={{ color: '#ef4444' }}>-202.99 USD</span>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:bg-white/5" style={{ borderColor: '#2f2f2f' }}>
                      <svg className="w-4 h-4" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Transaction Row 3 */}
                <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-6">
                    <span className="text-sm w-24" style={{ color: 'var(--text-primary)' }}>4 Aug 2025</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('earnings.paymentFrom')} Paddle</p>
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{t('earnings.completed')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium" style={{ color: '#10b981' }}>+5,651.56 USD</span>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:bg-white/5" style={{ borderColor: '#2f2f2f' }}>
                      <svg className="w-4 h-4" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Transaction Row 4 */}
                <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-6">
                    <span className="text-sm w-24" style={{ color: 'var(--text-primary)' }}>4 Aug 2025</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('earnings.withdrawalTo')} HSBC (5522)</p>
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{t('earnings.completed')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium" style={{ color: '#ef4444' }}>-1,679.35 USD</span>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:bg-white/5" style={{ borderColor: '#2f2f2f' }}>
                      <svg className="w-4 h-4" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Transaction Row 5 */}
                <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-center gap-6">
                    <span className="text-sm w-24" style={{ color: 'var(--text-primary)' }}>20 Aug 2025</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('earnings.withdrawalTo')} JP Morgan Chase (1133)</p>
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{t('earnings.completed')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium" style={{ color: '#ef4444' }}>-3,420.00 USD</span>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:bg-white/5" style={{ borderColor: '#2f2f2f' }}>
                      <svg className="w-4 h-4" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Transaction Row 6 */}
                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-6">
                    <span className="text-sm w-24" style={{ color: 'var(--text-primary)' }}>18 Aug 2025</span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('earnings.paymentFrom')} Stripe</p>
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{t('earnings.completed')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium" style={{ color: '#10b981' }}>+2,345.75 USD</span>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:bg-white/5" style={{ borderColor: '#2f2f2f' }}>
                      <svg className="w-4 h-4" style={{ color: 'var(--text-primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
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
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-0 lg:pt-8">
            {homeSubPage === 'main' ? (
              <>
                {/* Mobile Logo - Only show on small screens */}
                <div className="lg:hidden flex items-center justify-between mb-0 -mt-4 -mb-2">
                  {/* Notifications Icon - Left */}
                  <button
                    onClick={() => setActiveSection('notifications')}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Bell className="w-6 h-6" />
                  </button>
                  
                  {/* Logo - Center */}
                  <img 
                    src="/elevate_transparent_white_.png" 
                    alt="Elevate" 
                    className="h-24 w-auto"
                  />
                  
                  {/* Settings Icon - Right */}
                  <button
                    onClick={() => setActiveSection('settings')}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-white/10"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 overflow-visible">
                      <g style={{ transform: "rotate(0deg)", transformOrigin: "24px 24px", transition: "transform 0.5s ease-in-out" }}>
                        <path
                          d="M21 4H27V10L30 11.5L35 6L42 13L37 18L38.5 21H44V27H38.5L37 30L42 35L35 42L30 37L27 38.5V44H21V38.5L18 37L13 42L6 35L11 30L9.5 27H4V21H9.5L11 18L6 13L13 6L18 11L21 10V4Z"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </g>
                      <circle cx="24" cy="24" r="7" stroke="currentColor" strokeWidth="3" fill="none" />
                    </svg>
                  </button>
                </div>
                <AnnouncementBanner userId={currentUserId} userType="creator" />
        <section className="mb-10 sm:mb-20">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-semibold mb-1.5 sm:mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('home.overview')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            <RevenueAnalyticsCard onViewMore={() => setHomeSubPage('analytics')} />

            <ActiveCollaborationsCard setActiveSection={setActiveSection} />

            <ActiveOpportunitiesCard onViewMore={() => setHomeSubPage('opportunities')} />
          </div>
        </section>

        <section className="mb-10 sm:mb-20">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-semibold mb-1.5 sm:mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('home.myAccounts')}</h2>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{t('home.myAccountsDesc')}</p>
          </div>

          <SocialLinksForm appliedTheme={appliedTheme} userType="creator" userId={currentUserId} />
        </section>

        <section className="mb-8">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-xl sm:text-2xl font-semibold mb-1.5 sm:mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('home.referralSection')}</h2>
            <p className="text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{t('home.referralSectionDesc')}</p>
          </div>

          <ReferralSection userType="creator" userId={currentUserId} />
        </section>
              </>
            ) : homeSubPage === 'opportunities' ? (
              <>
                <div className="mb-6">
                  <button
                    onClick={() => setHomeSubPage('main')}
                    className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{t('common.back')}</span>
                  </button>
                </div>

                <div className="mb-8">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>Active Opportunities</h1>
                </div>

                <div className="space-y-3">

                  {/* Campaigns */}
                  <div className="rounded-xl overflow-hidden" style={{ border: expandedOppsCard === 'campaigns' ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setExpandedOppsCard(expandedOppsCard === 'campaigns' ? null : 'campaigns')}
                      className="w-full flex items-center justify-between px-5 py-4 transition-all hover:brightness-110"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                        <div className="text-left">
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('opportunities.campaign')}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>{assignedCampaigns.length} campaign{assignedCampaigns.length !== 1 ? 's' : ''} assigned</p>
                        </div>
                      </div>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${expandedOppsCard === 'campaigns' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.5 }}><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {expandedOppsCard === 'campaigns' && (
                      <div className="px-5 pb-5 pt-2" style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
                        {campaignsLoading ? (
                          <div className="flex items-center justify-center py-10">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '0ms' }} />
                              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '150ms' }} />
                              <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-primary)', animationDelay: '300ms' }} />
                            </div>
                          </div>
                        ) : assignedCampaigns.length === 0 ? (
                          <div className="text-center py-10">
                            <svg className="w-10 h-10 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.35 }}><path d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No campaigns available</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Campaigns will appear here once assigned to your account.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 mt-2">
                            {assignedCampaigns.map(c => {
                              const endsIn = c.ends_at ? new Date(c.ends_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing';
                              const isActive = c.status === 'active';
                              const platforms = (c.platforms || []).map((p: string) => p.toLowerCase());
                              const campaignData: CampaignData = { id: c.id, name: c.name, timeAgo: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), title: c.description || '', description: c.description || '', status: isActive ? 'Active' : 'Ended', endsIn, language: c.language || 'English', platforms: platforms as any, payType: c.pay_type || '', payout: c.payout || '', rules: c.rules || [] };
                              return (
                                <div key={c.id} className="rounded-xl p-4 cursor-pointer transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }} onClick={() => setSelectedCampaign(campaignData)}>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <h4 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</h4>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', opacity: isActive ? 1 : 0.5 }}>{isActive ? 'Active' : 'Ended'}</span>
                                  </div>
                                  {(c.bio || c.description) && <p className="text-xs mb-2 line-clamp-1" style={{ color: 'var(--text-primary)', opacity: 0.55 }}>{c.bio || c.description}</p>}
                                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-primary)', opacity: 0.6 }}>
                                    <span>Ends {endsIn}</span>
                                    {c.pay_type && <span>{c.pay_type}{c.payout ? ` · ${c.payout}` : ''}</span>}
                                    <div className="flex items-center gap-1 ml-auto">
                                      {platforms.includes('instagram') && <div className="w-3.5 h-3.5"><InstagramIconAnimated isHovered={true} /></div>}
                                      {platforms.includes('tiktok') && <div className="w-3.5 h-3.5"><TikTokIcon isHovered={true} /></div>}
                                      {platforms.includes('youtube') && <div className="w-3.5 h-3.5"><YouTubeIcon isHovered={true} /></div>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Enrolled Campaigns */}
                  <div className="rounded-xl overflow-hidden" style={{ border: expandedOppsCard === 'enrolled' ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setExpandedOppsCard(expandedOppsCard === 'enrolled' ? null : 'enrolled')}
                      className="w-full flex items-center justify-between px-5 py-4 transition-all hover:brightness-110"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                        <div className="text-left">
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('opportunities.enrolledCampaigns')}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>0 enrolled</p>
                        </div>
                      </div>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${expandedOppsCard === 'enrolled' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.5 }}><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {expandedOppsCard === 'enrolled' && (
                      <div className="px-5 pb-5 pt-2" style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
                        <div className="text-center py-10">
                          <svg className="w-10 h-10 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.35 }}><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('opportunities.noEnrolledCampaigns')}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>{t('opportunities.browseOpportunities')}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Detection */}
                  <div className="rounded-xl overflow-hidden" style={{ border: expandedOppsCard === 'detection' ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)' }}>
                    <button
                      onClick={() => setExpandedOppsCard(expandedOppsCard === 'detection' ? null : 'detection')}
                      className="w-full flex items-center justify-between px-5 py-4 transition-all hover:brightness-110"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                        <div className="text-left">
                          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Content Detection</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>0 detected · $0 revenue</p>
                        </div>
                      </div>
                      <svg className={`w-4 h-4 transition-transform duration-200 ${expandedOppsCard === 'detection' ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)', opacity: 0.5 }}><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    {expandedOppsCard === 'detection' && (
                      <div className="px-5 pb-5 pt-3" style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)' }}>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-primary)', opacity: 0.55 }}>We scan platforms for unauthorized copies of your content and automatically claim and monetize them on your behalf.</p>
                        <div className="space-y-2 mb-4">
                          {[{ step: '1', text: 'We scan platforms for unauthorized copies of your content' }, { step: '2', text: 'Detected reuploads are automatically claimed on your behalf' }, { step: '3', text: 'Revenue from those views flows directly to your account' }].map(({ step, text }) => (
                            <div key={step} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>{step}</div>
                              <p className="text-xs pt-0.5" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>{text}</p>
                            </div>
                          ))}
                        </div>
                        <button
                          className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:brightness-110"
                          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                        >
                          Get Started
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>

                        ) : homeSubPage === 'analytics' ? (
              <>
                <div className="mb-6">
                  <button 
                    onClick={() => setHomeSubPage('main')}
                    className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{t('common.back')}</span>
                  </button>
                </div>

                <section className="mb-10 sm:mb-20">
                  <div className="mb-5 sm:mb-7">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('analytics.advancedAnalytics')}</h2>
                      <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <button
                          onClick={() => setAnalyticsView('weekly')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            analyticsView === 'weekly'
                              ? 'bg-white text-black'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {t('analytics.weekly')}
                        </button>
                        <button
                          onClick={() => setAnalyticsView('monthly')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            analyticsView === 'monthly'
                              ? 'bg-white text-black'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {t('analytics.monthly')}
                        </button>
                        <button
                          onClick={() => setAnalyticsView('lifetime')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                            analyticsView === 'lifetime'
                              ? 'bg-white text-black'
                              : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {t('analytics.lifetime')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Breakdown - Animated Donut Chart */}
                    <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                      <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                        {analyticsView === 'monthly' ? t('analytics.revenueBreakdown') : t('analytics.revenueSources')}
                      </h3>
                      
                      {/* Donut Chart */}
                      <div className="flex flex-col items-center">
                        <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            {/* Sponsorship - 48% - Cream/Beige */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="#E8DFD0"
                              strokeWidth="12"
                              strokeDasharray={`${48 * 2.51} ${100 * 2.51}`}
                              strokeDashoffset="0"
                              className="donut-segment"
                              style={{
                                animation: 'donutGrow 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                                opacity: 0,
                              }}
                            />
                            {/* Campaign - 32% - Light Blue */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="#93C5FD"
                              strokeWidth="12"
                              strokeDasharray={`${32 * 2.51} ${100 * 2.51}`}
                              strokeDashoffset={`${-48 * 2.51}`}
                              className="donut-segment"
                              style={{
                                animation: 'donutGrow2 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards',
                                opacity: 0,
                              }}
                            />
                            {/* Affiliate - 13% - Gray */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="#6B7280"
                              strokeWidth="12"
                              strokeDasharray={`${13 * 2.51} ${100 * 2.51}`}
                              strokeDashoffset={`${-(48 + 32) * 2.51}`}
                              className="donut-segment"
                              style={{
                                animation: 'donutGrow3 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards',
                                opacity: 0,
                              }}
                            />
                            {/* Remaining - 7% - Dark Gray */}
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="transparent"
                              stroke="#4B5563"
                              strokeWidth="12"
                              strokeDasharray={`${7 * 2.51} ${100 * 2.51}`}
                              strokeDashoffset={`${-(48 + 32 + 13) * 2.51}`}
                              className="donut-segment"
                              style={{
                                animation: 'donutGrow4 1.2s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards',
                                opacity: 0,
                              }}
                            />
                          </svg>
                          
                          {/* Center Total */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                              $0.00
                            </span>
                          </div>
                        </div>
                        
                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-3 mt-6 w-full">
                          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E8DFD0' }}></div>
                              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('analytics.sponsorship')}</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>48%</span>
                          </div>
                          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#93C5FD' }}></div>
                              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('analytics.campaign')}</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>32%</span>
                          </div>
                          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6B7280' }}></div>
                              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('analytics.affiliate')}</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>13%</span>
                          </div>
                          <div className="flex items-center justify-between py-2.5 px-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4B5563' }}></div>
                              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{t('analytics.other')}</span>
                            </div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>7%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* CSS Animations */}
                      <style>{`
                        @keyframes donutGrow {
                          0% { 
                            stroke-dasharray: 0 251; 
                            opacity: 0;
                            transform: scale(0.95);
                          }
                          50% {
                            opacity: 1;
                          }
                          100% { 
                            stroke-dasharray: ${48 * 2.51} 251; 
                            opacity: 1;
                            transform: scale(1);
                          }
                        }
                        @keyframes donutGrow2 {
                          0% { 
                            stroke-dasharray: 0 251; 
                            opacity: 0;
                            transform: scale(0.95);
                          }
                          50% {
                            opacity: 1;
                          }
                          100% { 
                            stroke-dasharray: ${32 * 2.51} 251; 
                            opacity: 1;
                            transform: scale(1);
                          }
                        }
                        @keyframes donutGrow3 {
                          0% { 
                            stroke-dasharray: 0 251; 
                            opacity: 0;
                            transform: scale(0.95);
                          }
                          50% {
                            opacity: 1;
                          }
                          100% { 
                            stroke-dasharray: ${13 * 2.51} 251; 
                            opacity: 1;
                            transform: scale(1);
                          }
                        }
                        @keyframes donutGrow4 {
                          0% { 
                            stroke-dasharray: 0 251; 
                            opacity: 0;
                            transform: scale(0.95);
                          }
                          50% {
                            opacity: 1;
                          }
                          100% { 
                            stroke-dasharray: ${7 * 2.51} 251; 
                            opacity: 1;
                            transform: scale(1);
                          }
                        }
                        .donut-segment {
                          transform-origin: center;
                          transition: all 0.3s ease-out;
                        }
                        .donut-segment:hover {
                          filter: brightness(1.1);
                          transform: scale(1.02);
                        }
                      `}</style>
                    </div>

                    {/* Revenue Stat Chart */}
                    <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('analytics.revenueStat')}</h3>
                      </div>
                      
                      {/* Total Amount and Percentage */}
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                          $0.00
                        </p>
                        <div className="flex items-center gap-1">
                          <span style={{ color: 'var(--text-primary)' }} className="text-sm">—</span>
                        </div>
                      </div>
                      
                      {/* Chart with Y-axis */}
                      <div className="flex gap-4 h-72">
                        {/* Y-axis labels */}
                        <div className="flex flex-col justify-between text-right py-2" style={{ color: 'var(--text-primary)' }}>
                          <span className="text-xs">{analyticsView === 'weekly' ? '10K' : analyticsView === 'monthly' ? '50K' : '100K'}</span>
                          <span className="text-xs">{analyticsView === 'weekly' ? '8K' : analyticsView === 'monthly' ? '40K' : '80K'}</span>
                          <span className="text-xs">{analyticsView === 'weekly' ? '6K' : analyticsView === 'monthly' ? '30K' : '60K'}</span>
                          <span className="text-xs">{analyticsView === 'weekly' ? '4K' : analyticsView === 'monthly' ? '20K' : '40K'}</span>
                          <span className="text-xs">{analyticsView === 'weekly' ? '2K' : analyticsView === 'monthly' ? '10K' : '20K'}</span>
                          <span className="text-xs">0</span>
                        </div>
                        
                        {/* Bars */}
                        <div className="flex-1 flex items-end justify-between gap-3">
                          {analyticsView === 'weekly' ? (
                            // Weekly data (7 days)
                            [{day: 'Sat', value: 2400}, {day: 'Sun', value: 5800}, {day: 'Mon', value: 3200}, {day: 'Tue', value: 7200}, {day: 'Wed', value: 4800}, {day: 'Thu', value: 5600}, {day: 'Fri', value: 3600}].map((item, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                  className="w-full rounded-t-md transition-all duration-300 hover:opacity-80" 
                                  style={{ 
                                    backgroundColor: 'var(--text-primary)', 
                                    height: `${(item.value / 10000) * 100}%`,
                                    minHeight: '20px'
                                  }} 
                                />
                                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{item.day}</span>
                              </div>
                            ))
                          ) : analyticsView === 'monthly' ? (
                            // Monthly data (4 weeks)
                            [{week: 'Week 1', value: 12000}, {week: 'Week 2', value: 18000}, {week: 'Week 3', value: 15000}, {week: 'Week 4', value: 22000}].map((item, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                  className="w-full rounded-t-md transition-all duration-300 hover:opacity-80" 
                                  style={{ 
                                    backgroundColor: 'var(--text-primary)', 
                                    height: `${(item.value / 50000) * 100}%`,
                                    minHeight: '20px'
                                  }} 
                                />
                                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{item.week}</span>
                              </div>
                            ))
                          ) : (
                            // Lifetime data (12 months)
                            [{month: 'Jan', value: 18000}, {month: 'Feb', value: 22000}, {month: 'Mar', value: 28000}, {month: 'Apr', value: 35000}, {month: 'May', value: 42000}, {month: 'Jun', value: 48000}, {month: 'Jul', value: 55000}, {month: 'Aug', value: 62000}, {month: 'Sep', value: 70000}, {month: 'Oct', value: 78000}, {month: 'Nov', value: 85000}, {month: 'Dec', value: 95000}].map((item, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div 
                                  className="w-full rounded-t-md transition-all duration-300 hover:opacity-80" 
                                  style={{ 
                                    backgroundColor: 'var(--text-primary)', 
                                    height: `${(item.value / 100000) * 100}%`,
                                    minHeight: '20px'
                                  }} 
                                />
                                <span className="text-xs" style={{ color: 'var(--text-primary)' }}>{item.month}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mt-6">
                    {analyticsView === 'monthly' ? (
                      // Monthly metrics
                      <>
                        <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('analytics.averageRevenuePerUser')}</h4>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>$0.00</p>
                          <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>—</p>
                        </div>
                        <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('analytics.churnRate')}</h4>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>0%</p>
                          <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>—</p>
                        </div>
                        <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('analytics.lifetimeValue')}</h4>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>$0.00</p>
                          <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>—</p>
                        </div>
                      </>
                    ) : (
                      // Creator metrics
                      <>
                        <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('analytics.totalCollaborations')}</h4>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>0</p>
                          <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>—</p>
                        </div>
                        <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('analytics.totalReferred')}</h4>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>$0.00</p>
                          <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>—</p>
                          <div className="mt-6 pt-4 border-t flex items-center justify-start" style={{ borderColor: 'var(--border-subtle)' }}>
                            <button 
                              className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
                              style={{ color: 'var(--text-primary)' }}
                              onClick={() => setHomeSubPage('analytics')}
                            >
                              <span>{t('home.viewMore')}</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('analytics.affiliateRevenue')}</h4>
                          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>$0.00</p>
                          <p className="text-sm mt-2" style={{ color: 'var(--text-primary)' }}>—</p>
                          <div className="mt-6 pt-4 border-t flex items-center justify-start" style={{ borderColor: 'var(--border-subtle)' }}>
                            <button 
                              className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:opacity-80"
                              style={{ color: 'var(--text-primary)' }}
                              onClick={() => setHomeSubPage('analytics')}
                            >
                              <span>{t('home.viewMore')}</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </>
            ) : null}
          </div>
        )}

        {activeSection === 'talent' && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            <section className="mb-10 sm:mb-20">
              <div className="mb-5 sm:mb-7">
                <h2 className="text-xl sm:text-2xl font-semibold mb-1.5 sm:mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>{t('talent.discoverTitle')}</h2>
                <p className="text-sm sm:text-base" style={{ color: 'var(--text-primary)' }}>{t('talent.discoverDesc')}</p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <svg 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" 
                    style={{ color: 'var(--text-primary)' }} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={t('talent.searchTalent')}
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 border"
                    style={{ 
                      backgroundColor: 'var(--bg-card)', 
                      borderColor: searchFocused ? 'var(--text-primary)' : 'var(--border-subtle)', 
                      color: 'var(--text-primary)' 
                    }}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                {/* Left Sidebar Filters */}
                <div className="hidden lg:block w-56 flex-shrink-0">
                  {/* Active Filters */}
                  {(selectedLocations.length > 0 || selectedTalentTypes.length > 0 || selectedCategories.length > 0 || selectedSuccessRate || selectedSkills.length > 0) && (
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{t('talent.activeFilters')}</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedLocations.map((location) => (
                          <div
                            key={`location-${location}`}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs border"
                            style={{ 
                              backgroundColor: 'var(--bg-elevated)', 
                              borderColor: 'var(--border-subtle)', 
                              color: 'var(--text-primary)' 
                            }}
                          >
                            <span>{location}</span>
                            <button
                              onClick={() => setSelectedLocations(selectedLocations.filter(l => l !== location))}
                              className="ml-1 text-xs hover:opacity-70"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {selectedTalentTypes.map((type) => (
                          <div
                            key={`type-${type}`}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs border"
                            style={{ 
                              backgroundColor: 'var(--bg-elevated)', 
                              borderColor: 'var(--border-subtle)', 
                              color: 'var(--text-primary)' 
                            }}
                          >
                            <span>{type}</span>
                            <button
                              onClick={() => setSelectedTalentTypes(selectedTalentTypes.filter(t => t !== type))}
                              className="ml-1 text-xs hover:opacity-70"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {selectedCategories.map((category) => (
                          <div
                            key={`category-${category}`}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs border"
                            style={{ 
                              backgroundColor: 'var(--bg-elevated)', 
                              borderColor: 'var(--border-subtle)', 
                              color: 'var(--text-primary)' 
                            }}
                          >
                            <span>{category}</span>
                            <button
                              onClick={() => setSelectedCategories(selectedCategories.filter(c => c !== category))}
                              className="ml-1 text-xs hover:opacity-70"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {selectedSkills.map((skill) => (
                          <div
                            key={`skill-${skill}`}
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs border"
                            style={{ 
                              backgroundColor: 'var(--bg-elevated)', 
                              borderColor: 'var(--border-subtle)', 
                              color: 'var(--text-primary)' 
                            }}
                          >
                            <span>{skill}</span>
                            <button
                              onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                              className="ml-1 text-xs hover:opacity-70"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {selectedSuccessRate && (
                          <div
                            className="flex items-center gap-1 px-3 py-1 rounded-full text-xs border"
                            style={{ 
                              backgroundColor: 'var(--bg-elevated)', 
                              borderColor: 'var(--border-subtle)', 
                              color: 'var(--text-primary)' 
                            }}
                          >
                            <span>{selectedSuccessRate}</span>
                            <button
                              onClick={() => setSelectedSuccessRate('')}
                              className="ml-1 text-xs hover:opacity-70"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Location Filter */}
                    <div>
                      <button 
                        type="button"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
                        style={{ 
                          backgroundColor: 'var(--bg-elevated)', 
                          borderColor: locationFilterOpen ? 'var(--text-primary)' : 'var(--border-subtle)', 
                          color: 'var(--text-primary)',
                          transform: locationFilterOpen ? 'translateY(-1px)' : 'none'
                        }}
                        onClick={() => setLocationFilterOpen(!locationFilterOpen)}
                      >
                        <span className="font-medium transition-all duration-200">{t('talent.location')}</span>
                        <svg 
                          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${locationFilterOpen ? 'rotate-180' : ''}`} 
                          style={{ color: 'var(--text-primary)' }} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {locationFilterOpen && (
                        <div 
                          className="mt-2 max-h-48 overflow-y-auto rounded-lg border p-2"
                          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                        >
                          {[{key: 'unitedStates', label: t('countries.unitedStates')}, {key: 'unitedKingdom', label: t('countries.unitedKingdom')}, {key: 'canada', label: t('countries.canada')}, {key: 'australia', label: t('countries.australia')}, {key: 'germany', label: t('countries.germany')}, {key: 'france', label: t('countries.france')}, {key: 'spain', label: t('countries.spain')}, {key: 'italy', label: t('countries.italy')}, {key: 'netherlands', label: t('countries.netherlands')}, {key: 'sweden', label: t('countries.sweden')}, {key: 'japan', label: t('countries.japan')}, {key: 'southKorea', label: t('countries.southKorea')}, {key: 'china', label: t('countries.china')}, {key: 'india', label: t('countries.india')}, {key: 'brazil', label: t('countries.brazil')}, {key: 'mexico', label: t('countries.mexico')}, {key: 'argentina', label: t('countries.argentina')}, {key: 'chile', label: t('countries.chile')}, {key: 'southAfrica', label: t('countries.southAfrica')}, {key: 'egypt', label: t('countries.egypt')}, {key: 'nigeria', label: t('countries.nigeria')}, {key: 'kenya', label: t('countries.kenya')}, {key: 'morocco', label: t('countries.morocco')}, {key: 'russia', label: t('countries.russia')}, {key: 'poland', label: t('countries.poland')}, {key: 'ukraine', label: t('countries.ukraine')}, {key: 'turkey', label: t('countries.turkey')}, {key: 'saudiArabia', label: t('countries.saudiArabia')}, {key: 'uae', label: t('countries.uae')}, {key: 'israel', label: t('countries.israel')}, {key: 'thailand', label: t('countries.thailand')}, {key: 'vietnam', label: t('countries.vietnam')}, {key: 'philippines', label: t('countries.philippines')}, {key: 'singapore', label: t('countries.singapore')}, {key: 'malaysia', label: t('countries.malaysia')}, {key: 'indonesia', label: t('countries.indonesia')}, {key: 'newZealand', label: t('countries.newZealand')}].map(({key, label}) => (
                            <label 
                              key={key} 
                              className="flex items-center gap-2 py-1.5 px-2 text-xs rounded-md cursor-pointer transition-all duration-200 hover:bg-white/5" 
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-400 bg-transparent" 
                                checked={selectedLocations.includes(key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedLocations([...selectedLocations, key]);
                                  } else {
                                    setSelectedLocations(selectedLocations.filter(l => l !== key));
                                  }
                                }}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Talent Type Filter */}
                    <div>
                      <button 
                        type="button"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
                        style={{ 
                          backgroundColor: 'var(--bg-elevated)', 
                          borderColor: talentTypeFilterOpen ? 'var(--text-primary)' : 'var(--border-subtle)', 
                          color: 'var(--text-primary)',
                          transform: talentTypeFilterOpen ? 'translateY(-1px)' : 'none'
                        }}
                        onClick={() => setTalentTypeFilterOpen(!talentTypeFilterOpen)}
                      >
                        <span className="font-medium transition-all duration-200">{t('talent.talentType')}</span>
                        <svg 
                          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${talentTypeFilterOpen ? 'rotate-180' : ''}`} 
                          style={{ color: 'var(--text-primary)' }} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {talentTypeFilterOpen && (
                        <div 
                          className="mt-2 rounded-lg border p-2"
                          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                        >
                          {[{key: 'creator', label: t('talentFilters.creator')}, {key: 'brand', label: t('talentFilters.brand')}, {key: 'freelancer', label: t('talentFilters.freelancer')}].map(({key, label}) => (
                            <label 
                              key={key} 
                              className="flex items-center gap-2 py-1.5 px-2 text-xs rounded-md cursor-pointer transition-all duration-200 hover:bg-white/5" 
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-400 bg-transparent" 
                                checked={selectedTalentTypes.includes(key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTalentTypes([...selectedTalentTypes, key]);
                                  } else {
                                    setSelectedTalentTypes(selectedTalentTypes.filter(t => t !== key));
                                  }
                                }}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Category Filter */}
                    <div>
                      <button 
                        type="button"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
                        style={{ 
                          backgroundColor: 'var(--bg-elevated)', 
                          borderColor: categoryFilterOpen ? 'var(--text-primary)' : 'var(--border-subtle)', 
                          color: 'var(--text-primary)',
                          transform: categoryFilterOpen ? 'translateY(-1px)' : 'none'
                        }}
                        onClick={() => setCategoryFilterOpen(!categoryFilterOpen)}
                      >
                        <span className="font-medium transition-all duration-200">{t('talent.category')}</span>
                        <svg 
                          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${categoryFilterOpen ? 'rotate-180' : ''}`} 
                          style={{ color: 'var(--text-primary)' }} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {categoryFilterOpen && (
                        <div 
                          className="mt-2 rounded-lg border p-2"
                          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                        >
                          {[{key: 'gaming', label: t('talentFilters.gaming')}, {key: 'music', label: t('talentFilters.music')}, {key: 'vlogs', label: t('talentFilters.vlogs')}, {key: 'education', label: t('talentFilters.education')}, {key: 'comedy', label: t('talentFilters.comedy')}, {key: 'sports', label: t('talentFilters.sports')}, {key: 'travel', label: t('talentFilters.travel')}, {key: 'food', label: t('talentFilters.food')}, {key: 'fashion', label: t('talentFilters.fashion')}, {key: 'beauty', label: t('talentFilters.beauty')}, {key: 'technology', label: t('talentFilters.technology')}, {key: 'art', label: t('talentFilters.art')}, {key: 'dance', label: t('talentFilters.dance')}, {key: 'fitness', label: t('talentFilters.fitness')}, {key: 'lifestyle', label: t('talentFilters.lifestyle')}].map(({key, label}) => (
                            <label 
                              key={key} 
                              className="flex items-center gap-2 py-1.5 px-2 text-xs rounded-md cursor-pointer transition-all duration-200 hover:bg-white/5" 
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-400 bg-transparent" 
                                checked={selectedCategories.includes(key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCategories([...selectedCategories, key]);
                                  } else {
                                    setSelectedCategories(selectedCategories.filter(c => c !== key));
                                  }
                                }}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Success Rate Filter */}
                    <div>
                      <button 
                        type="button"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
                        style={{ 
                          backgroundColor: 'var(--bg-elevated)', 
                          borderColor: successRateFilterOpen ? 'var(--text-primary)' : 'var(--border-subtle)', 
                          color: 'var(--text-primary)',
                          transform: successRateFilterOpen ? 'translateY(-1px)' : 'none'
                        }}
                        onClick={() => setSuccessRateFilterOpen(!successRateFilterOpen)}
                      >
                        <span className="font-medium transition-all duration-200">{t('talent.successRate')}</span>
                        <svg 
                          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${successRateFilterOpen ? 'rotate-180' : ''}`} 
                          style={{ color: 'var(--text-primary)' }} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {successRateFilterOpen && (
                        <div 
                          className="mt-2 rounded-lg border p-2"
                          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                        >
                          {[{key: 'any', label: t('talentFilters.anyPercent')}, {key: '80up', label: t('talentFilters.eightyUp')}, {key: '90up', label: t('talentFilters.ninetyUp')}].map(({key, label}) => (
                            <label 
                              key={key} 
                              className="flex items-center gap-2 py-1.5 px-2 text-xs rounded-md cursor-pointer transition-all duration-200 hover:bg-white/5" 
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <input 
                                type="radio" 
                                name="successRate" 
                                className="rounded border-gray-400 bg-transparent" 
                                checked={selectedSuccessRate === key}
                                onChange={() => setSelectedSuccessRate(key)}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Social Media Filter */}
                    <div>
                      <button 
                        type="button"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
                        style={{ 
                          backgroundColor: 'var(--bg-elevated)', 
                          borderColor: socialMediaFilterOpen ? 'var(--text-primary)' : 'var(--border-subtle)', 
                          color: 'var(--text-primary)',
                          transform: socialMediaFilterOpen ? 'translateY(-1px)' : 'none'
                        }}
                        onClick={() => setSocialMediaFilterOpen(!socialMediaFilterOpen)}
                      >
                        <span className="font-medium transition-all duration-200">{t('talent.socialMedia')}</span>
                        <svg 
                          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${socialMediaFilterOpen ? 'rotate-180' : ''}`} 
                          style={{ color: 'var(--text-primary)' }} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {socialMediaFilterOpen && (
                        <div 
                          className="mt-2 rounded-lg border p-2"
                          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                        >
                          {[{key: 'youtube', label: t('platforms.youtube')}, {key: 'instagram', label: t('platforms.instagram')}, {key: 'tiktok', label: t('platforms.tiktok')}, {key: 'twitter', label: t('platforms.twitter')}, {key: 'linkedin', label: t('platforms.linkedin')}, {key: 'twitch', label: t('platforms.twitch')}].map(({key, label}) => (
                            <label 
                              key={key} 
                              className="flex items-center gap-2 py-1.5 px-2 text-xs rounded-md cursor-pointer transition-all duration-200 hover:bg-white/5" 
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-400 bg-transparent"
                                checked={selectedSocialMedia.includes(key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSocialMedia([...selectedSocialMedia, key]);
                                  } else {
                                    setSelectedSocialMedia(selectedSocialMedia.filter(s => s !== key));
                                  }
                                }}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Skills Filter */}
                    <div>
                      <button 
                        type="button"
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
                        style={{ 
                          backgroundColor: 'var(--bg-elevated)', 
                          borderColor: skillsFilterOpen ? 'var(--text-primary)' : 'var(--border-subtle)', 
                          color: 'var(--text-primary)',
                          transform: skillsFilterOpen ? 'translateY(-1px)' : 'none'
                        }}
                        onClick={() => setSkillsFilterOpen(!skillsFilterOpen)}
                      >
                        <span className="font-medium transition-all duration-200">{t('talent.skills')}</span>
                        <svg 
                          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${skillsFilterOpen ? 'rotate-180' : ''}`} 
                          style={{ color: 'var(--text-primary)' }} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
                        </svg>
                      </button>
                      {skillsFilterOpen && (
                        <div 
                          className="mt-2 rounded-lg border p-2"
                          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)' }}
                        >
                          {[{key: 'videoEditing', label: t('talentFilters.videoEditing')}, {key: 'photography', label: t('talentFilters.photography')}, {key: 'contentWriting', label: t('talentFilters.contentWriting')}, {key: 'graphicDesign', label: t('talentFilters.graphicDesign')}, {key: 'animation', label: t('talentFilters.animation')}, {key: 'voiceOver', label: t('talentFilters.voiceOver')}, {key: 'musicProduction', label: t('talentFilters.musicProduction')}, {key: 'dance', label: t('talentFilters.danceSkill')}, {key: 'acting', label: t('talentFilters.acting')}, {key: 'comedy', label: t('talentFilters.comedySkill')}, {key: 'publicSpeaking', label: t('talentFilters.publicSpeaking')}, {key: 'modeling', label: t('talentFilters.modeling')}, {key: 'cooking', label: t('talentFilters.cooking')}, {key: 'fitnessTraining', label: t('talentFilters.fitnessTraining')}, {key: 'makeupArtistry', label: t('talentFilters.makeupArtistry')}].map(({key, label}) => (
                            <label 
                              key={key} 
                              className="flex items-center gap-2 py-1.5 px-2 text-xs rounded-md cursor-pointer transition-all duration-200 hover:bg-white/5" 
                              style={{ color: 'var(--text-primary)' }}
                            >
                              <input 
                                type="checkbox" 
                                className="rounded border-gray-400 bg-transparent"
                                checked={selectedSkills.includes(key)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSkills([...selectedSkills, key]);
                                  } else {
                                    setSelectedSkills(selectedSkills.filter(s => s !== key));
                                  }
                                }}
                              />
                              <span>{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Talent Cards */}
                <div className="flex-1 space-y-4">
                  {/* Location Filter */}
                  <div className="flex items-center gap-3 mb-4">
                    <button 
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:brightness-110"
                      style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
                    >
                      {t('talent.suggested')}
                    </button>
                  </div>

                  {/* Talent Card 1 */}
                  <div 
                    className="rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Shawn Grows</h4>
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('talentCards.natureBlogger')}</p>
                        <p className="text-xs mb-3">
                          <a 
                            href="https://youtube.com/c/example" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            youtube.com/c/example
                          </a>
                        </p>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>📍 California, USA</p>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {[t('talentCards.nature'), 'YouTube', 'TikTok', 'Instagram'].map((skill, i) => (
                            <span 
                              key={i}
                              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                            >{skill}</span>
                          ))}
                        </div>

                        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {t('talentCards.natureBloggerDesc')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:brightness-110" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
                          <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:brightness-110" style={{ backgroundColor: 'var(--bg-active)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                          {t('talent.seeProfile')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Talent Card 2 */}
                  <div 
                    className="rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Sarah K.</h4>
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('talentCards.creativeDesigner')}</p>
                        <p className="text-xs mb-3">
                          <a 
                            href="https://youtube.com/c/example" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            youtube.com/c/example
                          </a>
                        </p>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>📍 London, UK</p>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {[t('talentCards.design'), t('talentCards.branding'), t('talentCards.uiux'), t('talentCards.figma')].map((skill, i) => (
                            <span 
                              key={i}
                              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                            >{skill}</span>
                          ))}
                        </div>

                        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {t('talentCards.creativeDesignerDesc')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:brightness-110" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
                          <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:brightness-110" style={{ backgroundColor: 'var(--bg-active)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                          {t('talent.seeProfile')}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Talent Card 3 */}
                  <div 
                    className="rounded-2xl p-5 border transition-all duration-200 hover:shadow-lg cursor-pointer"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Alex T.</h4>
                        </div>
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{t('talentCards.musicProducer')}</p>
                        <p className="text-xs mb-3">
                          <a 
                            href="https://youtube.com/c/example" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:opacity-80 transition-opacity"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            youtube.com/c/example
                          </a>
                        </p>
                        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>📍 Berlin, Germany</p>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {[t('explore.music'), t('talentCards.audio'), t('talentCards.production'), t('talentCards.mixing')].map((skill, i) => (
                            <span 
                              key={i}
                              className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                            >{skill}</span>
                          ))}
                        </div>

                        <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {t('talentCards.musicProducerDesc')}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <button className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-200 hover:brightness-110" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
                          <svg className="w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 hover:brightness-110" style={{ backgroundColor: 'var(--bg-active)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
                          {t('talent.seeProfile')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeSection === 'explore' && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8 relative">
            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              {/* Lock Icon with Animation */}
              <div className="mb-6" style={{ animation: 'float 3s ease-in-out infinite' }}>
                <svg 
                  width="64" 
                  height="64" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white transition-transform duration-300 hover:scale-110"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="16" r="1" fill="currentColor"/>
                </svg>
              </div>
              
              {/* Coming Soon Header */}
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 transition-all duration-300 hover:scale-105" style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>
                {t('explore.comingSoon')}
              </h1>
              <p className="text-lg text-white transition-all duration-300 hover:scale-105" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' }}>
                {t('explore.comingSoonDesc')}
              </p>
            </div>
            
            <style dangerouslySetInnerHTML={{
              __html: `
                @keyframes float {
                  0%, 100% {
                    transform: translateY(0px);
                  }
                  50% {
                    transform: translateY(-10px);
                  }
                }
              `
            }} />
            
            <div className="blur-[18px]" style={{ backdropFilter: 'blur(18px)' }}>
              {/* Trending Search Tags */}
              <section className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide">
                <div className="flex items-center justify-center gap-3 min-w-max pb-2">
                  {[
                    t('explore.contentCreationTips'),
                    t('explore.videoEditingTools'),
                    t('explore.musicProductionBasics'),
                    t('explore.socialMediaGrowth'),
                    t('explore.brandCollaboration'),
                    t('explore.monetizationStrategies'),
                  ].map((tag, index) => (
                    <button 
                      key={index}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 hover:brightness-110 border"
                      style={{ 
                        backgroundColor: 'var(--bg-card)', 
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      {tag}
                    </button>
                  ))}
                </div>
              </section>

              {/* Centered Tagline */}
              <section className="mb-6 mt-20 text-center">
                <img 
                  src="/test.png" 
                  alt="ELEVATE" 
                  className="h-32 mx-auto cursor-pointer hover:opacity-80 transition-opacity" 
                />
                <p className="text-sm font-semibold -mt-6" style={{ color: 'var(--text-primary)', lineHeight: '1' }}>
                  {t('explore.discoverServices')}
                </p>
              </section>

              {/* Search Bar */}
              <section className="mb-8">
                <div className="max-w-md mx-auto">
                  <div className="relative">
                    <svg 
                      className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4" 
                      style={{ color: 'var(--text-primary)' }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder={t('explore.searchServices')}
                      className="w-full pl-10 pr-4 py-3 rounded-full text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 border"
                      style={{ 
                        backgroundColor: 'var(--bg-card)', 
                        borderColor: 'var(--border-subtle)', 
                        color: 'var(--text-primary)' 
                      }}
                    />
                  </div>
                </div>
              </section>

              {/* Category Cards Grid */}
              <section className="mb-8">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl mx-auto">
                  {[
                    { name: t('explore.videoEditing'), image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop' },
                    { name: t('explore.music'), image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop' },
                    { name: t('explore.socialMedia'), image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop' },
                    { name: t('explore.contentCreation'), image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=400&h=300&fit=crop' },
                    { name: t('explore.marketing'), image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop' },
                    { name: t('explore.design'), image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop' },
                  ].map((category, index) => (
                    <div 
                      key={index} 
                      className="group cursor-pointer relative overflow-hidden rounded-xl aspect-[4/3] transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 p-3">
                        <h3 className="text-white font-semibold text-sm sm:text-base">{category.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Stats Section */}
              <section className="text-center">
                <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {t('explore.andMore')}
                </p>
              </section>
            </div>
          </div>
        )}
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
