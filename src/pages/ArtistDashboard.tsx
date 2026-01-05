import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Video, Instagram, Music2, ArrowUpRight, LogOut, MapPin, Globe, Plus, Info, X, MessageSquare, ChevronRight } from 'lucide-react';
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
import { DEFAULT_AVATAR_DATA_URI } from '../components/DefaultAvatar';
import { FeedbackModal } from '../components/FeedbackModal';
import { getCachedImage, preloadAndCacheImage } from '../utils/imageCache';
import { useUserProfile } from '../contexts/UserProfileContext';
import { AnnouncementBanner } from '../components/AnnouncementBanner';
import { MoreView } from '../components/MoreView';
import { TalentIcon } from '../components/TalentIcon';
import { PuzzleDealIcon } from '../components/PuzzleDealIcon';
import { MoreIcon } from '../components/MoreIcon';
import { ExploreIcon } from '../components/ExploreIcon';
import { SettingsIcon } from '../components/SettingsIcon';
import { CollapsibleSidebar } from '../components/CollapsibleSidebar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { ProfileView } from '../components/ProfileView';
import { SettingsView } from '../components/SettingsView';

function YouTubeIcon({ isHovered }: { isHovered: boolean }) {
  return (
    <div className="cursor-pointer flex items-center justify-center">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6">
        <rect 
          x="8" 
          y="12" 
          width="32" 
          height="24" 
          rx="6" 
          stroke={isHovered ? "#FF0000" : "#64748B"} 
          strokeWidth="2.5" 
          fill="none"
          style={{
            transition: "stroke 0.3s ease-in-out",
          }}
        />
        <path
          d="M20 18L32 24L20 30V18Z"
          stroke={isHovered ? "#FF0000" : "#64748B"}
          strokeWidth="2.5"
          strokeLinejoin="round"
          fill={isHovered ? "#FF0000" : "#64748B"}
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

function TikTokIcon({ isHovered }: { isHovered: boolean }) {
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
            stroke="#64748B"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path d={wavePath} stroke="#64748B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
}

function InstagramIconAnimated({ isHovered }: { isHovered: boolean }) {
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
          stroke={isHovered ? "url(#igGradient)" : "#64748B"}
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
          stroke={isHovered ? "url(#igGradient)" : "#64748B"}
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
          fill={isHovered ? "#64748B" : "#64748B"}
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

function CampaignDetailModal({ campaign, onClose }: { campaign: CampaignData | null; onClose: () => void }) {
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
          backgroundColor: '#1a1a1e',
          border: '1px solid rgba(255, 255, 255, 0.08)',
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
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm" style={{ color: '#64748B' }}>{campaign.timeAgo}</p>
              <p className="text-base font-medium mt-1.5" style={{ color: '#94A3B8' }}>{campaign.title}</p>
            </div>
            <div 
              className="px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0"
              style={{ 
                backgroundColor: campaign.status === 'Active' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                color: campaign.status === 'Active' ? '#22c55e' : '#fbbf24',
                border: `1px solid ${campaign.status === 'Active' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`
              }}
            >
              {campaign.status}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-7 mb-7 rounded-2xl overflow-hidden" style={{ backgroundColor: '#111111', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div className="grid grid-cols-5 divide-x" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
            <div className="p-4 text-center">
              <p className="text-xs mb-1.5" style={{ color: '#64748B' }}>Ends</p>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>{campaign.endsIn}</p>
              {campaign.paidOutPercent && (
                <p className="text-xs font-medium mt-1" style={{ color: '#3b82f6' }}>{campaign.paidOutPercent} PAID OUT</p>
              )}
            </div>
            <div className="p-4 text-center">
              <p className="text-xs mb-1.5" style={{ color: '#64748B' }}>Language</p>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>{campaign.language}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs mb-1.5" style={{ color: '#64748B' }}>Platforms</p>
              <div className="flex items-center justify-center gap-2 mt-1">
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
            <div className="p-4 text-center">
              <p className="text-xs mb-1.5" style={{ color: '#64748B' }}>Pay Type</p>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>{campaign.payType}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs mb-1.5" style={{ color: '#64748B' }}>Payout</p>
              <p className="text-base font-semibold" style={{ color: '#F8FAFC' }}>{campaign.payout}</p>
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="px-7 pb-5">
          <h3 className="text-lg font-bold mb-3" style={{ color: '#F8FAFC' }}>Details</h3>
          <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{campaign.description}</p>
        </div>

        {/* Rules section */}
        <div className="px-7 pb-5">
          <h3 className="text-lg font-bold mb-3" style={{ color: '#F8FAFC' }}>Rules</h3>
          <div className={`text-sm leading-relaxed ${!showFullRules ? 'line-clamp-2' : ''}`} style={{ color: '#94A3B8' }}>
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
          <div className="px-7 pb-7 pt-5 mt-2" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: '#F8FAFC' }}>What to include</h3>
            <div className="flex items-start gap-4">
              <MessageSquare className="w-6 h-6 mt-0.5" style={{ color: '#64748B' }} />
              <div>
                <p className="text-base font-medium" style={{ color: '#F8FAFC' }}>Caption, tags, text</p>
                <p className="text-xs font-semibold mt-2" style={{ color: '#3b82f6' }}>REQUIRED HASHTAGS</p>
                <p className="text-sm mt-1.5" style={{ color: '#94A3B8' }}>{campaign.requiredHashtags.join(' ')}</p>
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

function FighterMusicCard({ onClick }: { onClick: () => void }) {
  const [isCardHovered, setIsCardHovered] = useState(false);
  
  return (
    <div 
      className="rounded-xl sm:rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:brightness-105 cursor-pointer" 
      style={{ backgroundColor: '#1a1a1e' }}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: '#F8FAFC' }}>Fighter Music</h3>
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </div>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: '#64748B' }}>13d ago • Varied</p>
        </div>
      </div>

      <p className="mb-4 sm:mb-5 font-medium text-sm sm:text-base" style={{ color: '#F8FAFC' }}>Fighter Music, A passionate artist turning pain into power, and scars into sound.</p>

      <div className="flex items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <InstagramIconAnimated isHovered={isCardHovered} />
          <TikTokIcon isHovered={isCardHovered} />
          <YouTubeIcon isHovered={isCardHovered} />
        </div>
      </div>
    </div>
  );
}

function AstaViolinaCard({ onClick }: { onClick: () => void }) {
  const [isCardHovered, setIsCardHovered] = useState(false);
  
  return (
    <div 
      className="rounded-xl sm:rounded-2xl p-5 sm:p-7 transition-all duration-200 hover:brightness-105 cursor-pointer" 
      style={{ backgroundColor: '#1a1a1e' }}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <h3 className="font-semibold text-base sm:text-lg truncate" style={{ color: '#F8FAFC' }}>Asta Violina</h3>
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </div>
          </div>
          <p className="text-xs sm:text-sm" style={{ color: '#64748B' }}>13d ago • Varied</p>
        </div>
      </div>

      <p className="mb-4 sm:mb-5 font-medium text-sm sm:text-base" style={{ color: '#F8FAFC' }}>Fighter Music, A passionate artist turning pain into power, and scars into sound.</p>

      <div className="flex items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <InstagramIconAnimated isHovered={isCardHovered} />
          <TikTokIcon isHovered={isCardHovered} />
          <YouTubeIcon isHovered={isCardHovered} />
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
        backgroundColor: isActive ? '#0f0f13' : 'transparent',
        color: '#F8FAFC'
      }}
    >
      {React.cloneElement(icon, { isHovered })}
      {label}
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
      className="w-full flex items-center justify-between px-4 py-4 hover:bg-white/5 transition-colors"
      style={{ borderBottom: showBorder ? '1px solid rgba(75, 85, 99, 0.2)' : 'none' }}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: '#94A3B8' }}>{React.cloneElement(icon, { isHovered })}</span>
        <span className="text-base font-medium" style={{ color: '#F8FAFC' }}>{label}</span>
      </div>
      <svg className="w-5 h-5" style={{ color: '#64748B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
  const [earningsTab, setEarningsTab] = useState<'available' | 'pending' | 'paidout'>('available');
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('personal');
  const [mobileSettingsView, setMobileSettingsView] = useState<'menu' | SettingsSection>('menu');
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isTipaltiConnected, setIsTipaltiConnected] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    location: '',
    language: '',
    email: ''
  });
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [emailNewFeatures, setEmailNewFeatures] = useState<boolean>(true);
  const [emailPlatformUpdates, setEmailPlatformUpdates] = useState<boolean>(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [cachedProfilePic, setCachedProfilePic] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const personalRef = useRef<HTMLDivElement>(null);
  const accountsRef = useRef<HTMLDivElement>(null);
  const payoutRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get unread message count for badge indicator
  // Only fetch conversations if currentUserId is available
  const { conversations, refetch: refetchConversations } = useCustomerConversations(currentUserId || '');
  
  // Calculate unreadCount - use JSON.stringify of unread counts as dependency to force recalculation
  // This ensures we detect changes even if the array reference doesn't change
  const unreadCountsString = JSON.stringify(conversations.map(c => ({ id: c.id, unread: c.unread_count_customer || 0 })));
  const unreadCount = useMemo(() => {
    if (!currentUserId || conversations.length === 0) return 0;
    const total = conversations.reduce((total, conv) => total + (conv.unread_count_customer || 0), 0);
    console.log('🏷️ [ArtistDashboard] Calculating unreadCount from conversations:', {
      conversationsArray: conversations.map(c => ({ id: c.id, unread: c.unread_count_customer })),
      calculatedTotal: total,
      unreadCountsString
    });
    return total;
  }, [currentUserId, conversations, unreadCountsString]);
  
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
        unread_count_customer: c.unread_count_customer,
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
    console.log('[ArtistDashboard] Component mounted');
    localStorage.setItem('currentDashboard', '/dashboard/artist');
    // Only fetch if no cached profile (background refresh happens in context)
    if (!cachedProfile) {
      fetchUserProfile();
    }
  }, [cachedProfile]);
  
  // Debug: Log when activeSection changes
  useEffect(() => {
    console.log('[ArtistDashboard] activeSection changed:', activeSection);
    if (activeSection === 'messages') {
      console.log('[ArtistDashboard] Messages section activated!', {
        currentUserId,
        hasCurrentUserId: !!currentUserId,
        conversationsCount: conversations.length
      });
    }
  }, [activeSection, currentUserId, conversations.length]);

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
      
      // If we have email but no userId, try to find user by email
      if (!userId && verifiedEmail) {
        console.log('No userId found, trying to find user by email:', verifiedEmail);
        const { data: usersByEmail, error: emailLookupError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', verifiedEmail)
          .maybeSingle();
        
        if (emailLookupError) {
          console.error('Error looking up user by email:', emailLookupError);
        }
        
        if (usersByEmail?.id) {
          userId = usersByEmail.id;
          localStorage.setItem('verifiedUserId', userId);
          setCurrentUserId(userId);
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
      
      console.log('[ArtistDashboard] ✅ Setting currentUserId:', userId);
      console.log('[ArtistDashboard] Fetching profile for userId:', userId);
      console.log('[ArtistDashboard] Auth user:', user?.id);
      console.log('[ArtistDashboard] Is authenticated:', !!user);

      // Try Edge Function first (bypasses RLS) - more reliable
      let profile = null;
      let userData = null;
      
      try {
        console.log('Attempting to fetch via Edge Function...');
        const fetchUrl = `${SUPABASE_URL}/functions/v1/get-profile?userId=${userId}`;
        const fetchResponse = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Edge Function response status:', fetchResponse.status);
        
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          console.log('Edge Function response data:', fetchData);
          
          if (fetchData.success) {
            profile = fetchData.profile;
            userData = fetchData.user;
            console.log('Successfully fetched via Edge Function');
            console.log('Profile:', profile);
            console.log('User:', userData);
            console.log('Profile picture URL from database:', profile?.profile_picture_url || userData?.profile_picture_url);
            console.log('All profile keys:', profile ? Object.keys(profile) : 'null');
          } else {
            console.warn('Edge Function returned success:false', fetchData.message);
          }
        } else {
          const errorText = await fetchResponse.text();
          console.error('Edge Function fetch failed:', fetchResponse.status, errorText);
        }
      } catch (fetchErr) {
        console.error('Error fetching via Edge Function:', fetchErr);
      }

      // Fallback: Try direct query if Edge Function didn't work
      if (!profile) {
        console.log('Edge Function didn\'t return data, trying direct query...');
        const userResult = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        // Log any errors with full details
        if (userResult.error) {
          console.error('Error fetching users table:', userResult.error);
          console.error('Error details:', {
            message: userResult.error.message,
            details: userResult.error.details,
            hint: userResult.error.hint,
            code: userResult.error.code
          });
        } else {
          console.log('users table query successful, data:', userResult.data);
          if (userResult.data) {
            profile = userResult.data;
          }
        }
        
        if (userResult.error) {
          console.error('Error fetching users:', userResult.error);
          console.error('Error details:', {
            message: userResult.error.message,
            details: userResult.error.details,
            hint: userResult.error.hint,
            code: userResult.error.code
          });
        } else {
          console.log('users query successful, data:', userResult.data);
          if (userResult.data) {
            profile = userResult.data;
            userData = userResult.data;
          }
        }
      }

      console.log('Final profile data:', profile);
      console.log('Final user data:', userData);

      // Prioritize userData from users table (new primary source of truth)
      const profileData = userData || profile;
      
      // Always set profile data, even if empty (use defaults)
      setUserProfile(profileData);
      // Tag should always match the dashboard route (Artist Dashboard = ARTIST)
      setUserType('ARTIST');
      
      // Set form data from users table (primary source)
      const formDataToSet = {
        firstName: profileData?.first_name || '',
        lastName: profileData?.last_name || '',
        username: profileData?.username || '',
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
      // Header avatar will use userProfile.profile_picture_url directly
      if (profileData?.profile_picture_url && !profileData.profile_picture_url.startsWith('blob:')) {
        console.log('Setting profile picture preview from database:', profileData.profile_picture_url);
        setProfilePicturePreview(profileData.profile_picture_url);
      } else {
        console.log('No valid profile picture URL found in profile data');
        console.log('Profile data keys:', profileData ? Object.keys(profileData) : 'null');
        console.log('profile_picture_url value:', profileData?.profile_picture_url);
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
    localStorage.clear();
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
      // Get user ID using same fallback logic as fetchUserProfile
      const { data: { user } } = await supabase.auth.getUser();
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const verifiedEmail = localStorage.getItem('verifiedEmail');
      
      let userId = user?.id || verifiedUserId;
      
      // If we have email but no userId, try to find user by email
      if (!userId && verifiedEmail) {
        const { data: usersByEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', verifiedEmail)
          .maybeSingle();
        
        if (usersByEmail?.id) {
          userId = usersByEmail.id;
          localStorage.setItem('verifiedUserId', userId);
        }
      }

      if (!userId) {
        setSaveError('You must be logged in to save changes');
        setIsSaving(false);
        return;
      }

      // Convert profile picture to base64 to send via Edge Function
      // Edge Function will upload it using service role (bypasses RLS)
      let profilePictureBase64 = null;
      let profilePictureFileName = null;
      if (profilePicture) {
        try {
          console.log('🖼️ Converting profile picture to base64...');
          console.log('File:', profilePicture.name, 'Size:', profilePicture.size);
          
          // Convert file to base64
          const reader = new FileReader();
          profilePictureBase64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const result = reader.result as string;
              // Remove data:image/...;base64, prefix
              const base64 = result.split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(profilePicture);
          });
          
          profilePictureFileName = profilePicture.name;
          console.log('✅ Profile picture converted to base64');
        } catch (convertErr: any) {
          console.error('❌ Failed to convert image:', convertErr);
          setSaveError(`Failed to process profile picture: ${convertErr.message}`);
          setIsSaving(false);
          return;
        }
      }

      // Save profile using Edge Function (bypasses RLS)
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
          // Username is not included - it cannot be changed after onboarding
          location: formData.location,
          primaryLanguage: formData.language,
          profilePictureBase64: profilePictureBase64, // Send base64 instead of URL
          profilePictureFileName: profilePictureFileName,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to save changes');
      }

      // Update cache with new profile data for instant loading next time
      updateCachedProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        location: formData.location,
        primary_language: formData.language,
        profile_picture_url: data.profilePictureUrl || userProfile?.profile_picture_url || null,
      });
      
      // Refresh profile data
      await fetchUserProfile();
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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const renderPersonalInfo = () => (
    <div ref={personalRef} className="scroll-mt-6 rounded-2xl p-3 lg:p-4 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
      <div className="mb-2 lg:mb-4 hidden lg:block">
        <h2 className="text-base lg:text-lg font-bold" style={{ color: '#F8FAFC' }}>Personal info</h2>
      </div>

      <div className="space-y-3 lg:space-y-4">
        <div className="mb-2 lg:mb-0">
          <div className="flex items-center gap-2.5 lg:gap-4">
            <div
              onClick={handleProfilePictureClick}
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-md cursor-pointer hover:brightness-110 transition-all duration-200"
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
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-semibold mb-0.5 lg:mb-1" style={{ color: '#F8FAFC' }}>
                {formData.firstName} {formData.lastName}
              </h3>
              <p className="text-base lg:text-sm" style={{ color: '#94A3B8' }}>
                {(formData.username || userProfile?.username) ? `@${formData.username || userProfile?.username}` : 'No username'}
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

        <div className="grid grid-cols-2 gap-2.5 lg:gap-5">
          <div>
            <label className="block text-sm lg:text-sm font-medium mb-2 lg:mb-2.5" style={{ color: '#94A3B8' }}>First name</label>
            <div className="flex items-center gap-1 lg:gap-3">
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
                className="flex-1 min-w-0 h-11 lg:h-12 px-2.5 lg:px-4 rounded-xl text-sm lg:text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: '#F8FAFC',
                  background: '#0f0f13',
                  border: '1px solid rgba(75, 85, 99, 0.2)',
                }}
              />
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 lg:p-2.5 hover:brightness-110 transition-all rounded-lg flex-shrink-0"
                  style={{ color: '#64748B' }}
                >
                  <EditIcon />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm lg:text-sm font-medium mb-2 lg:mb-2.5" style={{ color: '#94A3B8' }}>Last name</label>
            <div className="flex items-center gap-1 lg:gap-3">
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing}
                className="flex-1 min-w-0 h-11 lg:h-12 px-2.5 lg:px-4 rounded-xl text-sm lg:text-sm focus:outline-none focus:ring-2 focus:ring-white/10 transition-all"
                style={{
                  color: '#F8FAFC',
                  background: '#0f0f13',
                  border: '1px solid rgba(75, 85, 99, 0.2)',
                }}
              />
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 lg:p-2.5 hover:brightness-110 transition-all rounded-lg flex-shrink-0"
                  style={{ color: '#64748B' }}
                >
                  <EditIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm lg:text-sm font-medium mb-2 lg:mb-2.5" style={{ color: '#94A3B8' }}>Username</label>
          <div className="flex items-center gap-1.5 lg:gap-3">
            <div className="flex-1 flex items-center h-11 lg:h-12 px-3 lg:px-4 rounded-xl" style={{ background: '#0f0f13', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <span className="text-sm lg:text-sm" style={{ color: '#64748B' }}>@</span>
              <input
                type="text"
                value={formData.username}
                disabled
                className="flex-1 bg-transparent text-sm lg:text-sm focus:outline-none ml-1 opacity-50"
                style={{ color: '#F8FAFC' }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm lg:text-sm font-medium mb-2 lg:mb-2.5" style={{ color: '#94A3B8' }}>Location</label>
          <div className="flex items-center gap-1.5 lg:gap-3">
            <div className="flex-1 min-w-0 flex items-center h-11 lg:h-12 px-2.5 lg:px-4 rounded-xl focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: '#0f0f13', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <MapPin className="w-4 h-4 lg:w-4 lg:h-4 mr-1.5 lg:mr-2 flex-shrink-0" style={{ color: '#64748B' }} />
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isEditing && !isSaving) {
                    handleSaveChanges();
                  }
                }}
                disabled={!isEditing}
                className="flex-1 min-w-0 bg-transparent text-sm lg:text-sm focus:outline-none"
                style={{ color: '#F8FAFC' }}
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country} style={{ background: '#0f0f13' }}>{country}</option>
                ))}
              </select>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 lg:p-2.5 hover:brightness-110 transition-all rounded-lg flex-shrink-0"
                style={{ color: '#64748B' }}
              >
                <EditIcon />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 lg:mb-2.5" style={{ color: '#94A3B8' }}>Languages you post in</label>
          <div className="flex items-center gap-1.5 lg:gap-3">
            <div className="flex-1 min-w-0 flex items-center h-11 lg:h-12 px-2.5 lg:px-4 rounded-xl focus-within:ring-2 focus-within:ring-white/10 transition-all" style={{ background: '#0f0f13', border: '1px solid rgba(75, 85, 99, 0.2)' }}>
              <Globe className="w-4 h-4 mr-1.5 lg:mr-2 flex-shrink-0" style={{ color: '#64748B' }} />
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isEditing && !isSaving) {
                    handleSaveChanges();
                  }
                }}
                disabled={!isEditing}
                className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
                style={{ color: '#F8FAFC' }}
              >
                {LANGUAGES.map(language => (
                  <option key={language} value={language} style={{ background: '#0f0f13' }}>{language}</option>
                ))}
              </select>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 lg:p-2.5 hover:brightness-110 transition-all rounded-lg flex-shrink-0"
                style={{ color: '#64748B' }}
              >
                <EditIcon />
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm lg:text-sm font-medium mb-2 lg:mb-2.5" style={{ color: '#94A3B8' }}>Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full h-11 lg:h-12 px-3 lg:px-4 rounded-xl text-sm lg:text-sm focus:outline-none opacity-50"
            style={{
              color: '#F8FAFC',
              background: '#0f0f13',
              border: '1px solid rgba(75, 85, 99, 0.2)',
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
              style={{ backgroundColor: '#0f0f13', color: '#F8FAFC' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-6 py-2.5 lg:px-7 lg:py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:brightness-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E8E8E8', color: '#000000' }}
            >
              {isSaving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderConnectedAccounts = () => (
    <div ref={accountsRef} className="scroll-mt-6 rounded-2xl p-4 lg:p-8 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
      <h2 className="hidden lg:block text-lg lg:text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>Connected accounts (0)</h2>
      <p className="text-sm lg:text-sm mb-4 lg:mb-6" style={{ color: '#94A3B8' }}>
        Add social links to display your portfolio and verify account ownership.
      </p>

      <button className="flex items-center gap-3 px-5 py-3.5 lg:py-4 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110" style={{ backgroundColor: '#0f0f13', color: '#94A3B8' }}>
        <Plus className="w-5 h-5" />
        Connect an account
      </button>
    </div>
  );

  const renderPayoutMethods = () => (
    <div ref={payoutRef} className="scroll-mt-6 rounded-2xl p-4 lg:p-8 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
      <h2 className="hidden lg:block text-lg lg:text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>Payment Method</h2>
      <p className="text-sm lg:text-sm mb-4 lg:mb-6" style={{ color: '#94A3B8' }}>
        Payments are typically processed automatically through Tipalti. If a payout needs to be issued outside of Tipalti, you can add an alternative payment method.
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
        <button className="flex items-center gap-2.5 lg:gap-3 px-5 py-3.5 lg:px-5 lg:py-4 rounded-xl text-sm lg:text-sm font-medium transition-all duration-200 hover:brightness-110" style={{ backgroundColor: '#0f0f13', color: '#94A3B8' }}>
          <Plus className="w-5 h-5" />
          Connect an account
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isTipaltiConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
          <span className="text-sm" style={{ color: '#94A3B8' }}>
            Tipalti: {isTipaltiConnected ? 'Connected' : 'Not connected'}
          </span>
        </div>
      </div>
    </div>
  );

  const handleToggleNewFeatures = async () => {
    const newValue = !emailNewFeatures;
    setEmailNewFeatures(newValue);
    await saveNotificationPreference('email_new_features', newValue);
  };

  const handleTogglePlatformUpdates = async () => {
    const newValue = !emailPlatformUpdates;
    setEmailPlatformUpdates(newValue);
    await saveNotificationPreference('email_platform_updates', newValue);
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
    <div ref={notificationsRef} className="scroll-mt-6 rounded-2xl p-3 lg:p-8 shadow-xl" style={{ backgroundColor: '#1a1a1e' }}>
      <h2 className="hidden lg:block text-lg lg:text-2xl font-bold mb-3 lg:mb-8" style={{ color: '#F8FAFC' }}>Notifications</h2>

      <div className="space-y-3 lg:space-y-8">
        <div>
          <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-6" style={{ color: '#F8FAFC' }}>Email</h3>

          <div className="space-y-3 lg:space-y-6">
            <div className="flex items-center justify-between pb-3 lg:pb-6 border-b" style={{ borderColor: '#0f0f13' }}>
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F8FAFC' }}>New Features</h4>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Notify me about new platform features and updates</p>
              </div>
              <button
                onClick={handleToggleNewFeatures}
                disabled={isSavingNotifications}
                className="w-12 h-7 rounded-full transition-colors duration-200 flex items-center px-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: emailNewFeatures ? '#3B82F6' : '#64748B' }}
              >
                <div
                  className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ transform: emailNewFeatures ? 'translateX(20px)' : 'translateX(0px)' }}
                ></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold mb-1" style={{ color: '#F8FAFC' }}>Platform Updates</h4>
                <p className="text-sm" style={{ color: '#94A3B8' }}>Send me updates about platform improvements</p>
              </div>
              <button
                onClick={handleTogglePlatformUpdates}
                disabled={isSavingNotifications}
                className="w-12 h-7 rounded-full transition-colors duration-200 flex items-center px-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: emailPlatformUpdates ? '#3B82F6' : '#64748B' }}
              >
                <div
                  className="w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200"
                  style={{ transform: emailPlatformUpdates ? 'translateX(20px)' : 'translateX(0px)' }}
                ></div>
              </button>
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
      <div className="min-h-screen text-white flex" style={{ backgroundColor: '#111111' }}>
        <DoorTransition showTransition={location.state?.fromOnboarding === true} />
        
        {/* Left Sidebar - Desktop Only */}
        <CollapsibleSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          userProfile={userProfile}
          unreadCount={unreadCount}
          cachedProfilePic={cachedProfilePic}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          unreadCount={unreadCount}
          profilePicture={cachedProfilePic || profilePicturePreview || userProfile?.profile_picture_url}
        />

        {/* Main Content Area - margin adjusts based on sidebar state */}
        <main 
          className={`flex-1 min-h-screen pb-20 lg:pb-0 transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[240px]'}`}
        >
        {activeSection === 'messages' && (
          <div className="animate-fade-in flex-1 flex flex-col min-h-0 overflow-hidden h-screen">
            {(() => {
              console.log('🔴🔴🔴 [ArtistDashboard] RENDERING MESSAGES SECTION:', {
                activeSection,
                currentUserId,
                hasCurrentUserId: !!currentUserId,
                currentUserIdLength: currentUserId?.length || 0,
                conversationsCount: conversations.length,
                timestamp: new Date().toISOString()
              });
              
              if (currentUserId) {
                console.log('🔴🔴🔴 [ArtistDashboard] Passing currentUserId to MessagesPage:', currentUserId);
                return <MessagesPage currentUserId={currentUserId} />;
              } else {
                console.warn('🔴🔴🔴 [ArtistDashboard] ❌ NO currentUserId - showing loading spinner');
                console.warn('🔴🔴🔴 [ArtistDashboard] This means fetchUserProfile has not set currentUserId yet');
                return (
                  <div className="flex items-center justify-center flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#64748B', animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#64748B', animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#64748B', animationDelay: '300ms' }} />
              </div>
            </div>
                );
              }
            })()}
          </div>
        )}

        {activeSection === 'earnings' && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            {/* Summary Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
              {/* Available Balance Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 flex flex-col" style={{ backgroundColor: '#1a1a1e' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#F8FAFC' }}>Available balance</h3>
                  <Info className="w-4 h-4" style={{ color: '#64748B' }} />
                </div>
                <div className="mt-auto">
                  <div className="text-3xl sm:text-4xl font-bold" style={{ color: '#F8FAFC' }}>0.00</div>
                </div>
              </div>

              {/* Pending Balance Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7" style={{ backgroundColor: '#1a1a1e' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#F8FAFC' }}>Pending balance</h3>
                  <Info className="w-4 h-4" style={{ color: '#64748B' }} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: '#F8FAFC' }}>0.00</div>
              </div>

              {/* Lifetime Earnings Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7" style={{ backgroundColor: '#1a1a1e' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#F8FAFC' }}>Lifetime earnings</h3>
                  <Info className="w-4 h-4" style={{ color: '#64748B' }} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: '#F8FAFC' }}>0.00</div>
              </div>

              {/* Affiliate Earnings Card */}
              <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7" style={{ backgroundColor: '#1a1a1e' }}>
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm sm:text-base font-semibold" style={{ color: '#F8FAFC' }}>Affiliate earnings</h3>
                  <Info className="w-4 h-4" style={{ color: '#64748B' }} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold" style={{ color: '#F8FAFC' }}>0.00</div>
              </div>
            </div>

            {/* Transaction History Section */}
            <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7" style={{ backgroundColor: '#1a1a1e' }}>
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setEarningsTab('available')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200" 
                  style={{ backgroundColor: earningsTab === 'available' ? '#0f0f13' : 'transparent', color: earningsTab === 'available' ? '#F8FAFC' : '#64748B' }}
                >
                  Available
                </button>
                <button 
                  onClick={() => setEarningsTab('pending')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-105" 
                  style={{ backgroundColor: earningsTab === 'pending' ? '#0f0f13' : 'transparent', color: earningsTab === 'pending' ? '#F8FAFC' : '#64748B' }}
                >
                  Pending
                </button>
                <button 
                  onClick={() => setEarningsTab('paidout')}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:brightness-105" 
                  style={{ backgroundColor: earningsTab === 'paidout' ? '#0f0f13' : 'transparent', color: earningsTab === 'paidout' ? '#F8FAFC' : '#64748B' }}
                >
                  Paid out
                </button>
              </div>

              {/* Table Headers */}
              <div className="hidden sm:grid grid-cols-4 gap-4 pb-4 border-b" style={{ borderColor: '#0f0f13' }}>
                <div className="text-xs font-medium" style={{ color: '#64748B' }}>Date</div>
                <div className="text-xs font-medium" style={{ color: '#64748B' }}>Clip</div>
                <div className="text-xs font-medium" style={{ color: '#64748B' }}>Campaign/Description</div>
                <div className="text-xs font-medium" style={{ color: '#64748B' }}>Amount</div>
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
                renderPayoutMethods={renderPayoutMethods}
                renderNotifications={renderNotifications}
                isMobile={true}
                onBack={() => setActiveSection('home')}
              />
            </div>

            {/* Desktop Settings View - Twitter/X Style */}
            <div className="hidden lg:block">
              <SettingsView
                renderPersonalInfo={renderPersonalInfo}
                renderConnectedAccounts={renderConnectedAccounts}
                renderPayoutMethods={renderPayoutMethods}
                renderNotifications={renderNotifications}
                isMobile={false}
              />
            </div>
          </>
        )}

        {activeSection === 'more' && (
          <div className="h-full">
            <MoreView />
          </div>
        )}

        {activeSection === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            cachedProfilePic={cachedProfilePic}
            onBack={() => setActiveSection('home')}
            onUpdateProfile={handleUpdateProfile}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        )}

        {activeSection === 'home' && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            <AnnouncementBanner userId={currentUserId} userType="artist" />
        <section className="mb-10 sm:mb-20">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>Overview</h2>
            <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Campaigns available for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <FighterMusicCard onClick={() => setSelectedCampaign(CAMPAIGNS[0])} />

            <AstaViolinaCard onClick={() => setSelectedCampaign(CAMPAIGNS[1])} />
          </div>
        </section>

        <section className="mb-10 sm:mb-20">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>My Accounts</h2>
            <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Add your social media channels and profiles</p>
          </div>

          <SocialLinksForm />
        </section>

        <section className="mb-8">
          <div className="mb-5 sm:mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>Referral Section</h2>
            <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Support creators by using their code. Share yours to earn together.</p>
          </div>

          <ReferralSection />
        </section>
          </div>
        )}

        {activeSection === 'explore' && (
          <div className="animate-fade-in pb-20 lg:pb-0 px-4 lg:px-8 pt-4 lg:pt-8">
            <section className="mb-10 sm:mb-20">
              <div className="mb-5 sm:mb-7">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 tracking-tight" style={{ color: '#F8FAFC' }}>Opportunities</h2>
                <p className="text-sm sm:text-base" style={{ color: '#94A3B8' }}>Discover new opportunities and collaborations</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <FighterMusicCard onClick={() => setSelectedCampaign(CAMPAIGNS[0])} />
                <AstaViolinaCard onClick={() => setSelectedCampaign(CAMPAIGNS[1])} />
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Campaign Detail Modal */}
      <CampaignDetailModal 
        campaign={selectedCampaign} 
        onClose={() => setSelectedCampaign(null)} 
      />
    </div>
    </>
  );
}
