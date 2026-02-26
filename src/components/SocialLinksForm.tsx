import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Youtube, Instagram, Music2, Twitter, Twitch, Link2, ChevronDown, CheckCircle, Check, ExternalLink, Loader, User, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPABASE_URL, SUPABASE_ANON_KEY, supabase } from '../lib/supabase';
import { AnimatedLinkIcon } from './AnimatedLinkIcon';

const SOCIAL_LINKS_FN = `${SUPABASE_URL}/functions/v1/social-links`;
const VERIFY_FN = `${SUPABASE_URL}/functions/v1/verify-social-link`;
const fnHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` };

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  display_name: string;
  channel_type: string;
  channel_description: string;
  verified: boolean;
}

const platformIcons: { [key: string]: any } = {
  YouTube: Youtube,
  Instagram: Instagram,
  TikTok: Music2,
  Twitter: Twitter,
  Twitch: Twitch,
  Other: Link2,
};


interface DropdownOption {
  key: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  platformIcons: { [key: string]: any };
}

function CustomDropdown({ value, options, onChange, platformIcons }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedIcon = platformIcons[value] || null;
  const SelectedIcon = selectedIcon;
  const selectedOption = options.find(o => o.key === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 flex items-center justify-between group border"
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
          {SelectedIcon && (
            <SelectedIcon 
              className="w-4 h-4 transition-all duration-200 group-hover:scale-110" 
              style={{ color: 'var(--text-primary)' }} 
            />
          )}
          <span className="transition-all duration-200">{selectedOption?.label || value}</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${isOpen ? 'rotate-180' : ''}`} 
          style={{ color: 'var(--text-primary)' }} 
        />
      </button>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-lg shadow-xl overflow-hidden animate-fade-in-down"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => {
              const Icon = platformIcons[option.key] || null;
              const isSelected = option.key === value;
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    onChange(option.key);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-sm transition-all duration-200 flex items-center gap-2 group/option relative"
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
                  {Icon && (
                    <div className="relative group/icon">
                      <Icon 
                        className="w-4 h-4 transition-all duration-300 group-hover/option:scale-125 group-hover/option:rotate-12 group-hover/icon:scale-150 group-hover/icon:rotate-180" 
                        style={{ color: 'var(--text-primary)' }} 
                      />
                      <div className="absolute inset-0 w-4 h-4 rounded-full opacity-0 group-hover/icon:opacity-20 group-hover/icon:scale-150 transition-all duration-300" style={{ backgroundColor: 'var(--text-primary)' }}></div>
                    </div>
                  )}
                  <span className="transition-all duration-200">{option.label}</span>
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
  );
}

const fCls = 'w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all border';
const fStyle = { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' };

function ArtistDD({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen(o => !o)} className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all border flex items-center justify-between" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: open ? 'var(--text-primary)' : 'var(--border-subtle)', color: 'var(--text-primary)' }}>
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-xl animate-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
          {options.map(opt => (
            <button key={opt} type="button" onClick={() => { onChange(opt); setOpen(false); }} className="w-full px-4 py-2.5 text-sm text-left flex items-center justify-between transition-all" style={{ color: 'var(--text-primary)', backgroundColor: value === opt ? 'var(--bg-elevated)' : 'transparent' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.backgroundColor = value === opt ? 'var(--bg-elevated)' : 'transparent'; }}>
              {opt}{value === opt && <span style={{ color: 'var(--text-primary)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ArtistRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-sm font-medium flex-shrink-0 w-40 text-right pt-2.5" style={{ color: 'var(--text-primary)' }}>{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function AddArtistForm({ onClose, onSubmit, onOpenArticle }: { onClose: () => void; onSubmit: (name: string, imageFile: File | null, formData?: Record<string, string>) => void; onOpenArticle?: (articleId: string) => void }) {
  const [af, setAfState] = useState({ name: '', imageFile: null as File | null, imagePreview: '', appleMusicId: '', spotifyId: '', soundcloudId: '', deezerId: '', audiomackId: '', amazonId: '', type: 'Solo Artist', role: 'Artist role', genre: 'Select a main genre', bio: '', country: 'United States', websiteUrl: '', facebookUrl: '', xHandle: '', instagramHandle: '', youtubeChannel: '', tiktokUsername: '' });
  const setAf = (p: Partial<typeof af>) => setAfState(f => ({ ...f, ...p }));
  return (
    <div className="space-y-5 mb-6">
      <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Add <span className="font-bold">New Artist</span></h3>
        <button onClick={onClose} style={{ color: 'var(--text-primary)' }}><X className="w-5 h-5" /></button>
      </div>

      <ArtistRow label="Artist name:">
        <input type="text" placeholder="Enter stage name" value={af.name} onChange={e => setAf({ name: e.target.value })} className={fCls} style={fStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
      </ArtistRow>

      <ArtistRow label="Artist image:">
        <div className="flex gap-4">
          <div className="w-32 h-32 rounded-xl flex items-center justify-center flex-shrink-0" style={{ border: '2px dashed var(--border-subtle)', backgroundColor: 'var(--bg-elevated)' }}>
            {af.imagePreview ? <img src={af.imagePreview} alt="preview" className="w-full h-full object-cover rounded-xl" /> : <User className="w-10 h-10" style={{ color: 'var(--text-primary)' }} />}
          </div>
          <label className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all duration-200" style={{ border: '2px dashed var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', minHeight: '128px' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'} onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--text-primary)'; }} onDragLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'} onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-subtle)'; const file = e.dataTransfer.files[0]; if (file) setAf({ imageFile: file, imagePreview: URL.createObjectURL(file) }); }}>
            <input type="file" accept="image/*" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) setAf({ imageFile: file, imagePreview: URL.createObjectURL(file) }); }} />
            <Info className="w-6 h-6" style={{ color: 'var(--text-primary)' }} />
            <p className="text-xs text-center" style={{ color: 'var(--text-primary)' }}>Drag image here<br />or</p>
            <span className="px-4 py-1 rounded-full text-xs font-semibold" style={{ border: '1px solid var(--text-primary)', color: 'var(--text-primary)' }}>Select file</span>
          </label>
        </div>
      </ArtistRow>

      {(['appleMusicId', 'spotifyId', 'soundcloudId', 'deezerId', 'audiomackId', 'amazonId'] as const).map((key) => {
        const labels: Record<string, string> = { appleMusicId: 'Apple Music ID:', spotifyId: 'Spotify ID:', soundcloudId: 'Soundcloud ID:', deezerId: 'Deezer ID:', audiomackId: 'Audiomack ID:', amazonId: 'Amazon ID:' };
        const articleIds: Record<string, string> = { appleMusicId: 'apple-music-id', spotifyId: 'spotify-id', soundcloudId: 'soundcloud-id', deezerId: 'deezer-id', audiomackId: 'audiomack-id', amazonId: 'amazon-artist-id' };
        return (
          <ArtistRow key={key} label={labels[key]}>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Enter ID if you already have one" value={af[key]} onChange={e => setAf({ [key]: e.target.value } as any)} className={fCls} style={fStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
              {onOpenArticle && (
                <button
                  type="button"
                  onClick={() => onOpenArticle(articleIds[key])}
                  className="flex-shrink-0 transition-all hover:opacity-70"
                  style={{ color: 'var(--text-primary)' }}
                  title={`How to find your ${labels[key].replace(':', '')}`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </button>
              )}
            </div>
          </ArtistRow>
        );
      })}

      <ArtistRow label="Type"><ArtistDD value={af.type} options={['Solo Artist', 'Band / Group', 'Orchestra', 'Choir']} onChange={v => setAf({ type: v })} /></ArtistRow>
      <ArtistRow label="Role"><ArtistDD value={af.role} options={['Main Artist', 'Featured Artist', 'Composer', 'Producer', 'Lyricist']} onChange={v => setAf({ role: v })} /></ArtistRow>
      <ArtistRow label="Main Genre"><ArtistDD value={af.genre} options={['Pop', 'Hip-Hop / Rap', 'R&B / Soul', 'Rock', 'Electronic', 'Jazz', 'Classical', 'Country', 'Latin', 'Reggae', 'Gospel', 'Other']} onChange={v => setAf({ genre: v })} /></ArtistRow>

      <ArtistRow label="Artist bio:">
        <textarea placeholder="Add a short description of you and your music" value={af.bio} onChange={e => setAf({ bio: e.target.value })} rows={4} className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all border resize-none" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
      </ArtistRow>

      <ArtistRow label="Country"><ArtistDD value={af.country} options={['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'Nigeria', 'South Africa', 'India', 'Other']} onChange={v => setAf({ country: v })} /></ArtistRow>

      {(['websiteUrl', 'facebookUrl', 'xHandle', 'instagramHandle', 'youtubeChannel', 'tiktokUsername'] as const).map((key) => {
        const meta: Record<string, string> = { websiteUrl: 'Website URL:|Enter your website address', facebookUrl: 'Facebook URL:|Enter page name', xHandle: 'X handle:|Enter X user name', instagramHandle: 'Instagram handle:|Enter Instagram user name', youtubeChannel: 'YouTube channel:|Enter YouTube channel name', tiktokUsername: 'TikTok username:|Enter TikTok page name' };
        const [label, ph] = meta[key].split('|');
        return (
          <ArtistRow key={key} label={label}>
            <input type="text" placeholder={ph} value={af[key]} onChange={e => setAf({ [key]: e.target.value } as any)} className={fCls} style={fStyle} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'} />
          </ArtistRow>
        );
      })}

      <div className="flex justify-end pt-2">
        <button type="button" className="px-8 py-3 rounded-full text-sm font-bold transition-all hover:brightness-110" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }} onClick={() => onSubmit(af.name, af.imageFile, { bio: af.bio, country: af.country, type: af.type, role: af.role, genre: af.genre, websiteUrl: af.websiteUrl, facebookUrl: af.facebookUrl, xHandle: af.xHandle, instagramHandle: af.instagramHandle, youtubeChannel: af.youtubeChannel, tiktokUsername: af.tiktokUsername, appleMusicId: af.appleMusicId, spotifyId: af.spotifyId, soundcloudId: af.soundcloudId, deezerId: af.deezerId, audiomackId: af.audiomackId, amazonId: af.amazonId })}>
          Create Artist
        </button>
      </div>
    </div>
  );
}

interface SocialLinksFormProps {
  appliedTheme?: string;
  userType?: 'artist' | 'creator' | 'freelancer' | 'business';
  userId?: string;
  onOpenArticle?: (articleId: string) => void;
  onArtistAdded?: () => void;
}

export function SocialLinksForm({ appliedTheme, userType, userId, onOpenArticle, onArtistAdded }: SocialLinksFormProps) {
  const { t } = useTranslation();
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState({
    platform: 'YouTube',
    url: '',
    display_name: '',
    channel_type: '',
    channel_description: '',
  });
  const [_loading, setLoading] = useState(false);
  const [linksLoaded, setLinksLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [verifyModal, setVerifyModal] = useState<{ link: SocialLink; phrase: string } | null>(null);
  const [verifyChecking, setVerifyChecking] = useState(false);
  const [verifyResult, setVerifyResult] = useState<'idle' | 'success' | 'fail'>('idle');
  const [copiedPhrase, setCopiedPhrase] = useState(false);

  useEffect(() => {
    if (userId) loadLinks();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'social_links_updated') loadLinks();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [userId]);

  const loadLinks = async () => {
    try {
      if (!userId) return;
      const res = await fetch(`${SOCIAL_LINKS_FN}?userId=${userId}`, { headers: fnHeaders });
      const json = await res.json();
      if (json.success) setLinks(json.links || []);
    } catch (error) {
      console.error('Error loading links:', error);
    } finally {
      setLoading(false);
      setLinksLoaded(true);
    }
  };

  const detectPlatform = (url: string): string => {
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube';
    if (lower.includes('instagram.com')) return 'Instagram';
    if (lower.includes('tiktok.com')) return 'TikTok';
    if (lower.includes('twitter.com') || lower.includes('x.com')) return 'Twitter';
    if (lower.includes('twitch.tv')) return 'Twitch';
    return 'Other';
  };

  const validateUrl = (url: string): { valid: boolean; normalized: string; error?: string } => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (!trimmed.match(/^https:\/\//i)) {
      return { valid: false, normalized: trimmed, error: 'URL must start with https:// (e.g. https://www.youtube.com/@YourChannel)' };
    }
    return { valid: true, normalized: trimmed };
  };

  const checkWhitelisted = async (url: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('whitelisted_channels')
        .select('url_pattern');
      if (!data) return false;
      const lower = url.toLowerCase();
      return data.some(row => lower.includes(row.url_pattern.toLowerCase()));
    } catch {
      return false;
    }
  };

  const handleAddLink = async () => {
    if (!newLink.url.trim() || !userId) return;

    const { valid, normalized: normalizedUrl, error: validationError } = validateUrl(newLink.url);
    if (!valid) {
      setUrlError(validationError || 'Invalid URL');
      return;
    }
    setUrlError(null);

    setSaving(true);
    try {

      const isWhitelisted = await checkWhitelisted(normalizedUrl);

      const body: Record<string, string | boolean> = {
        userId,
        platform: newLink.platform,
        url: normalizedUrl,
        display_name: newLink.display_name.trim() || newLink.platform,
        ...(isWhitelisted ? { verified: true } : {}),
      };
      if (userType === 'creator') {
        body.channel_type = newLink.channel_type.trim();
        body.channel_description = newLink.channel_description.trim();
      }

      const res = await fetch(SOCIAL_LINKS_FN, {
        method: 'POST',
        headers: fnHeaders,
        body: JSON.stringify(body),
      });
      const json = await res.json();

      if (json.duplicate) {
        if (json.own) {
          alert(t('socialLinks.linkAlreadyRegistered'));
        } else {
          alert('This link is already registered and verified by another user. Each social link can only belong to one account.');
        }
        return;
      }
      if (!json.success) throw new Error(json.message || 'Insert failed');

      await loadLinks();
      localStorage.setItem('social_links_updated', Date.now().toString());
      setNewLink({ platform: 'YouTube', url: '', display_name: '', channel_type: '', channel_description: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding link:', error);
      alert(t('socialLinks.errorAddingLink'));
    } finally {
      setSaving(false);
    }
  };

  const openVerifyModal = async (link: SocialLink) => {
    setVerifyResult('idle');
    const res = await fetch(VERIFY_FN, {
      method: 'POST',
      headers: fnHeaders,
      body: JSON.stringify({ action: 'get-phrase', linkId: link.id, userId }),
    });
    const json = await res.json();
    if (json.success) {
      setVerifyModal({ link, phrase: json.phrase });
    }
  };

  const handleCheckVerification = async () => {
    if (!verifyModal) return;
    setVerifyChecking(true);
    setVerifyResult('idle');
    try {
      const res = await fetch(VERIFY_FN, {
        method: 'POST',
        headers: fnHeaders,
        body: JSON.stringify({ action: 'check', linkId: verifyModal.link.id, userId }),
      });
      const json = await res.json();
      if (json.verified) {
        setVerifyResult('success');
        await loadLinks();
        setTimeout(() => {
          setVerifyModal(null);
          setVerifyResult('idle');
        }, 2000);
      } else {
        setVerifyResult('fail');
      }
    } finally {
      setVerifyChecking(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch(`${SOCIAL_LINKS_FN}?id=${id}&userId=${userId}`, {
        method: 'DELETE',
        headers: fnHeaders,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      await loadLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  return (
    <>
    <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center justify-end mb-5 sm:mb-6">
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 border"
            style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <Plus className="w-4 h-4" />
            <span>{userType === 'artist' ? 'Add New Artist' : t('socialLinks.addLink')}</span>
          </button>
        )}
      </div>

      {isAdding && userType !== 'artist' && (
        <div className="mb-5 p-4 sm:p-5 rounded-xl" style={{ backgroundColor: 'transparent' }}>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('socialLinks.platform')}
              </label>
              <CustomDropdown
                value={newLink.platform}
                options={[
                  {key: 'YouTube', label: t('platforms.youtube')},
                  {key: 'Instagram', label: t('platforms.instagram')},
                  {key: 'TikTok', label: t('platforms.tiktok')},
                  {key: 'Twitter', label: t('platforms.twitter')},
                  {key: 'Twitch', label: t('platforms.twitch')},
                  {key: 'Other', label: t('platforms.other')}
                ]}
                onChange={(value) => setNewLink({ ...newLink, platform: value })}
                platformIcons={platformIcons}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('socialLinks.url')}
              </label>
              <input
                type="text"
                value={newLink.url}
                onChange={(e) => {
                  const val = e.target.value;
                  const platform = detectPlatform(val);
                  setNewLink(prev => ({ ...prev, url: val, platform }));
                  if (urlError) setUrlError(null);
                }}
                placeholder="https://www.youtube.com/@YourChannel"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 border"
                style={{ backgroundColor: 'transparent', borderColor: urlError ? '#ef4444' : 'var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={(e) => { if (!urlError) e.target.style.borderColor = 'var(--text-primary)'; }}
                onBlur={(e) => { if (!urlError) e.target.style.borderColor = 'var(--border-subtle)'; }}
              />
              {urlError && (
                <p className="mt-1.5 text-xs" style={{ color: '#ef4444' }}>{urlError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('socialLinks.displayName')}
              </label>
              <input
                type="text"
                value={newLink.display_name}
                onChange={(e) => setNewLink({ ...newLink, display_name: e.target.value })}
                placeholder={t('socialLinks.displayNamePlaceholder')}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 border"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
              />
            </div>

            {userType === 'creator' && (
              <>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {t('socialLinks.channelType')}
                  </label>
                  <CustomDropdown
                    value={newLink.channel_type || '__select__'}
                    options={[
                      {key: '__select__', label: t('socialLinks.selectChannelType')},
                      {key: 'Music', label: t('channelTypes.music')},
                      {key: 'Gaming', label: t('channelTypes.gaming')},
                      {key: 'Lifestyle', label: t('channelTypes.lifestyle')},
                      {key: 'Education', label: t('channelTypes.education')},
                      {key: 'Comedy', label: t('channelTypes.comedy')},
                      {key: 'Sports', label: t('channelTypes.sports')},
                      {key: 'Technology', label: t('channelTypes.technology')},
                      {key: 'Art & Design', label: t('channelTypes.artDesign')},
                      {key: 'Fashion', label: t('channelTypes.fashion')},
                      {key: 'Food & Cooking', label: t('channelTypes.foodCooking')},
                      {key: 'Travel', label: t('channelTypes.travel')},
                      {key: 'Fitness', label: t('channelTypes.fitness')},
                      {key: 'Business', label: t('channelTypes.business')},
                      {key: 'Entertainment', label: t('channelTypes.entertainment')},
                      {key: 'Other', label: t('channelTypes.other')}
                    ]}
                    onChange={(value) => setNewLink({ ...newLink, channel_type: value === '__select__' ? '' : value })}
                    platformIcons={{}}
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    {t('socialLinks.channelDescription')}
                  </label>
                  <textarea
                    value={newLink.channel_description}
                    onChange={(e) => setNewLink({ ...newLink, channel_description: e.target.value })}
                    placeholder={t('socialLinks.channelDescPlaceholder')}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 border resize-none"
                    style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--text-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 sm:gap-3 pt-2">
              <button
                onClick={handleAddLink}
                disabled={saving}
                className="flex-1 px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-60"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                {saving ? 'Saving...' : t('socialLinks.save')}
              </button>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewLink({ platform: 'YouTube', url: '', display_name: '', channel_type: '', channel_description: '' });
                }}
                className="px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-90 border"
                style={{ backgroundColor: 'transparent', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
              >
                {t('socialLinks.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdding && userType === 'artist' && (
        <AddArtistForm
          onClose={() => setIsAdding(false)}
          onOpenArticle={onOpenArticle}
          onSubmit={async (name, imageFile, formData) => {
            setIsAdding(false);
            if (userId) {
              try {
                const { data: userData } = await supabase
                  .from('users')
                  .select('email, username, first_name, last_name')
                  .eq('id', userId)
                  .single();
                // Upload artist image if provided
                let uploadedImageUrl: string | null = null;
                if (imageFile) {
                  const ext = imageFile.name.split('.').pop() || 'jpg';
                  const path = `artist-images/${userId}/${Date.now()}.${ext}`;
                  const { error: uploadError } = await supabase.storage
                    .from('artist-images')
                    .upload(path, imageFile, { upsert: true });
                  if (!uploadError) {
                    const { data: urlData } = supabase.storage.from('artist-images').getPublicUrl(path);
                    uploadedImageUrl = urlData?.publicUrl || null;
                  } else {
                    console.error('Artist image upload error:', uploadError);
                  }
                }
                // Save artist entry via Edge Function (uses service role key, bypasses RLS)
                const slRes = await fetch(SOCIAL_LINKS_FN, {
                  method: 'POST',
                  headers: fnHeaders,
                  body: JSON.stringify({
                    userId,
                    platform: 'Artist',
                    url: uploadedImageUrl || `artist:${userId}:${Date.now()}`,
                    display_name: name || 'New Artist',
                    verified: false,
                  }),
                });
                const slJson = await slRes.json();
                if (slJson.success || slJson.duplicate) {
                  await loadLinks();
                  localStorage.setItem('social_links_updated', Date.now().toString());
                  onArtistAdded?.();
                } else {
                  console.error('Error saving artist to social_links:', slJson);
                }
                // Submit application
                await supabase.from('applications').insert({
                  user_id: userId,
                  application_type: 'artist_account',
                  status: 'pending',
                  full_name: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || null : null,
                  email: userData?.email || null,
                  username: userData?.username || null,
                  category: name || null,
                  bio: formData?.bio || null,
                  country: formData?.country || null,
                  image_url: uploadedImageUrl,
                  artist_type: formData?.type || null,
                  artist_role: formData?.role || null,
                  artist_genre: formData?.genre || null,
                  website_url: formData?.websiteUrl || null,
                  facebook_url: formData?.facebookUrl || null,
                  x_handle: formData?.xHandle || null,
                  instagram_handle: formData?.instagramHandle || null,
                  youtube_channel: formData?.youtubeChannel || null,
                  tiktok_username: formData?.tiktokUsername || null,
                  apple_music_id: formData?.appleMusicId || null,
                  spotify_id: formData?.spotifyId || null,
                  soundcloud_id: formData?.soundcloudId || null,
                  deezer_id: formData?.deezerId || null,
                  audiomack_id: formData?.audiomackId || null,
                  amazon_id: formData?.amazonId || null,
                  created_at: new Date().toISOString(),
                });
              } catch (e) {
                console.error('Error submitting artist application:', e);
              }
            }
          }}
        />
      )}

      <div className="space-y-3">
        {!linksLoaded ? null : links.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <AnimatedLinkIcon />
            <p className="text-sm sm:text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {userType === 'artist' ? 'No Artists added yet' : t('socialLinks.noLinksYet')}
            </p>
            {userType === 'artist' ? (
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
                Artists added will show up here
              </p>
            ) : (
              userType === 'creator' || userType === 'business' ? null : (
                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-primary)' }}>
                  {t('socialLinks.distributeToStart')}
                </p>
              )
            )}
          </div>
        ) : (
          links.map((link) => {
            const Icon = platformIcons[link.platform] || Link2;
            return (
              <div
                key={link.id}
                className="flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-200 hover:brightness-105"
                style={{ backgroundColor: 'transparent' }}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                    {link.platform === 'Artist' && link.url
                      ? <img src={link.url} alt={link.display_name} className="w-full h-full object-cover rounded-lg" />
                      : link.platform === 'Artist'
                        ? <User className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--text-primary)' }} />
                        : <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--text-primary)' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm sm:text-base font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {link.display_name || link.platform}
                    </div>
                    {link.platform !== 'Artist' && (
                      <div className="text-xs sm:text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {link.url.replace(/^https?:\/\//i, '')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  {link.verified ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg> Verified
                    </span>
                  ) : link.platform === 'Artist' ? (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                      Pending
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-elevated)' }}>
                        Unverified
                      </span>
                      <button
                        onClick={() => openVerifyModal(link)}
                        className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all duration-200 hover:opacity-80"
                        style={{ color: 'var(--bg-primary)', backgroundColor: 'var(--text-primary)' }}
                      >
                        Verify Now
                      </button>
                    </div>
                  )}
                  {!link.verified && (
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 rounded-lg transition-all duration-200 hover:brightness-110"
                      style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

    {/* Verification Modal */}
    {verifyModal && (() => {
      const vm = verifyModal;
      return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.18s ease-out forwards' }}>
        <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl border animate-modal-in" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Verify Ownership</h3>
            {verifyResult !== 'success' && (
              <button onClick={() => { setVerifyModal(null); setVerifyResult('idle'); }} className="p-1 rounded-lg" style={{ color: 'var(--text-primary)' }}>
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mb-5 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-subtle)', border: '1px solid' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-primary)' }}>Link being verified</p>
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{vm.link.url}</p>
          </div>

          <div className="mb-5">
            <p className="text-sm mb-3 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              Add this phrase to your bio to verify account ownership and prevent impersonation.
            </p>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="text-base font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>{vm.phrase}</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(vm.phrase);
                  setCopiedPhrase(true);
                  setTimeout(() => setCopiedPhrase(false), 2000);
                }}
                className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-all hover:opacity-80"
                style={{ color: 'var(--bg-primary)', backgroundColor: 'var(--text-primary)' }}
              >
                {copiedPhrase ? <><Check className="w-3 h-3" /> Copied</> : 'Copy'}
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--text-primary)' }}>
              You can remove it once the check is complete.
            </p>
          </div>

          <div className="mb-4">
            <a
              href={vm.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm transition-all hover:opacity-70"
              style={{ color: 'var(--text-primary)' }}
            >
              <ExternalLink className="w-4 h-4" />
              Open {vm.link.platform} to add the phrase
            </a>
          </div>

          {verifyResult === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ backgroundColor: '#22C55E10', border: '1px solid #22C55E40' }}>
              <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#22C55E' }} />
              <p className="text-sm font-medium" style={{ color: '#22C55E' }}>Verified! This link is now exclusively yours.</p>
            </div>
          )}

          {verifyResult === 'fail' && (
            <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#EF444410', border: '1px solid #EF444440' }}>
              <p className="text-sm font-medium" style={{ color: '#EF4444' }}>Phrase not found. Make sure you saved the change on {verifyModal.link.platform} and try again.</p>
            </div>
          )}

          <button
            onClick={handleCheckVerification}
            disabled={verifyChecking || verifyResult === 'success'}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
          >
            {verifyChecking ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : 'Check Verification'}
          </button>
        </div>
      </div>
      );
    })()}
    </>
  );
}
