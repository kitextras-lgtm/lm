import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Check, Gift, Link2 } from 'lucide-react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

interface ReferralData {
  code: string;
  total_uses: number;
  total_earnings: number;
}

interface ReferralSectionProps {
  userType?: 'artist' | 'creator' | 'freelancer' | 'business';
  userId?: string;
}

const LANDING_PAGE: Record<string, string> = {
  artist: '/learn/artist',
  freelancer: '/learn/freelancer',
  business: '/learn/brands',
  creator: '/',
};

export function ReferralSection({ userType, userId: userIdProp }: ReferralSectionProps) {
  const { t } = useTranslation();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasAppliedCode, setHasAppliedCode] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      let authUserId: string | null = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        authUserId = user?.id || null;
      } catch (_) {}
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const userId = userIdProp || authUserId || verifiedUserId;
      
      if (!userId) {
        console.warn('No user ID found');
        setLoading(false);
        return;
      }

      // Get username from users table using Edge Function (bypasses RLS)
      let username = null;
      try {
        const fetchUrl = `${SUPABASE_URL}/functions/v1/get-profile?userId=${userId}`;
        const fetchResponse = await fetch(fetchUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (fetchResponse.ok) {
          const fetchData = await fetchResponse.json();
          if (fetchData.success && fetchData.profile) {
            username = fetchData.profile.username;
            console.log('✅ Fetched username from Edge Function:', username);
          }
        }
      } catch (fetchErr) {
        console.error('Error fetching via Edge Function:', fetchErr);
      }
      
      // Fallback: try users table first, then profiles table
      if (!username) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('username')
          .eq('id', userId)
          .maybeSingle();
        username = userProfile?.username;
        
        // If still no username, try profiles table (uses 'name' field)
        if (!username) {
          console.log('Trying profiles table for username...');
          const { data: profileData } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', userId)
            .maybeSingle();
          
          if (profileData?.name) {
            // Use first part of name as username, or full name without spaces
            username = profileData.name.replace(/\s+/g, '');
            console.log('✅ Using name from profiles table as username:', username);
          }
        }
      }

      if (username) {
        // Use username directly as the referral code
        // Also fetch stats from referral_codes table if it exists
        const { data: existingCode } = await supabase
          .from('referral_codes')
          .select('total_uses, total_earnings')
          .eq('user_id', userId)
          .maybeSingle();

        setReferralData({
          code: username.toUpperCase(),
          total_uses: existingCode?.total_uses || 0,
          total_earnings: existingCode?.total_earnings || 0,
        });
        console.log('✅ Set referral code to username:', username.toUpperCase());
      } else {
        console.error('No username found for user');
        console.log('User ID:', userId);
      }

      const { data: appliedCode } = await supabase
        .from('referral_applications')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      setHasAppliedCode(!!appliedCode);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    if (!referralData) return '';
    const base = window.location.origin;
    const page = LANDING_PAGE[userType || 'creator'] ?? '/';
    return `${base}${page}?ref=${referralData.code}`;
  };

  const handleCopy = async () => {
    if (!referralData) return;
    try {
      await navigator.clipboard.writeText(referralData.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleApplyCode = async () => {
    if (!inputCode.trim() || applying) return;

    setApplying(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.rpc('apply_referral_code', {
        p_code: inputCode.trim().toUpperCase(),
      });

      if (error) throw error;

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setInputCode('');
        setHasAppliedCode(true);
      } else {
        setMessage({ type: 'error', text: data.error });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('referral.failedToApply') });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <div className="text-center" style={{ color: '#CBD5E1' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Gift className="w-5 h-5" style={{ color: '#64748B' }} />
          <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('referral.yourCode')}</h3>
        </div>

        <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'transparent' }}>
          <div className="text-center">
            <div className="text-xs font-medium mb-2" style={{ color: '#64748B' }}>
              {t('referral.yourReferralCode')}
            </div>
            <div className="h-[60px] flex items-center justify-center mb-3">
              <div className="text-2xl sm:text-3xl font-bold tracking-wider" style={{ color: 'var(--text-primary)' }}>
                {referralData?.code || 'N/A'}
              </div>
            </div>
            <button
              onClick={handleCopy}
              disabled={!referralData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{t('referral.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>{t('referral.copyCode')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {referralData && (
          <div className="mb-5">
            <div className="text-xs font-medium mb-2" style={{ color: '#64748B' }}>YOUR REFERRAL LINK</div>
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}>
              <Link2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#64748B' }} />
              <span className="text-xs truncate flex-1" style={{ color: '#94A3B8' }}>
                {getReferralLink()}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 transition-all hover:opacity-80"
                style={{ color: 'var(--bg-primary)', backgroundColor: 'var(--text-primary)' }}
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedLink ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            {t('referral.yourStats')}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: 'transparent' }}>
              <span className="text-sm" style={{ color: '#CBD5E1' }}>{t('referral.totalUses')}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                {referralData?.total_uses || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: 'transparent' }}>
              <span className="text-sm" style={{ color: '#CBD5E1' }}>{t('referral.totalEarned')}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                ${referralData?.total_earnings?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2 mb-5">
          <Gift className="w-5 h-5" style={{ color: '#64748B' }} />
          <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('referral.enterACode')}</h3>
        </div>

        {hasAppliedCode ? (
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'transparent' }}>
            <Check className="w-12 h-12 mx-auto mb-3" style={{ color: '#10B981' }} />
            <p className="text-base font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
              {t('referral.codeApplied')}
            </p>
            <p className="text-sm" style={{ color: '#64748B' }}>
              {t('referral.alreadyApplied')}
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'transparent' }}>
              <div className="text-center">
                <label className="block text-xs font-medium mb-2" style={{ color: '#64748B' }}>
                  {t('referral.referralCode')}
                </label>
                <div className="h-[60px] flex items-center justify-center mb-3">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder={t('referral.enterCode')}
                    maxLength={8}
                    className="w-full px-4 py-2.5 rounded-lg text-2xl sm:text-3xl font-bold tracking-wider text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={{ backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                  />
                </div>
                <button
                  onClick={handleApplyCode}
                  disabled={!inputCode.trim() || applying}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
                >
                  {applying ? t('referral.applying') : t('referral.applyCode')}
                </button>
              </div>
            </div>

            {message && (
              <div
                className="rounded-lg p-3 text-sm text-center mb-5"
                style={{
                  backgroundColor: message.type === 'success' ? '#10B98120' : '#EF444420',
                  color: message.type === 'success' ? '#10B981' : '#EF4444',
                }}
              >
                {message.text}
              </div>
            )}

            <div>
              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                {t('referral.benefits')}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: 'transparent' }}>
                  <span className="text-sm" style={{ color: '#CBD5E1' }}>{t('referral.firstCampaignBonus')}</span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#10B981' }} />
                </div>
                <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: 'transparent' }}>
                  <span className="text-sm" style={{ color: '#CBD5E1' }}>{t('referral.supportCommunity')}</span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#10B981' }} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
