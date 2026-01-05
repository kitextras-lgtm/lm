import { useState, useEffect } from 'react';
import { Copy, Check, Gift } from 'lucide-react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase';

interface ReferralData {
  code: string;
  total_uses: number;
  total_earnings: number;
}

export function ReferralSection() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasAppliedCode, setHasAppliedCode] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const verifiedUserId = localStorage.getItem('verifiedUserId');
      const userId = user?.id || verifiedUserId;
      
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
      setMessage({ type: 'error', text: error.message || 'Failed to apply code' });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8 border" style={{ backgroundColor: '#111111', borderColor: '#2f2f2f' }}>
        <div className="text-center" style={{ color: '#94A3B8' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: '#111111', borderColor: '#2f2f2f' }}>
        <div className="flex items-center gap-2 mb-5">
          <Gift className="w-5 h-5" style={{ color: '#64748B' }} />
          <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#F8FAFC' }}>Your Code</h3>
        </div>

        <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'transparent' }}>
          <div className="text-center">
            <div className="text-xs font-medium mb-2" style={{ color: '#64748B' }}>
              YOUR REFERRAL CODE
            </div>
            <div className="h-[60px] flex items-center justify-center mb-3">
              <div className="text-2xl sm:text-3xl font-bold tracking-wider" style={{ color: '#F8FAFC' }}>
                {referralData?.code || 'N/A'}
              </div>
            </div>
            <button
              onClick={handleCopy}
              disabled={!referralData}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#F8FAFC', color: '#111111' }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>
            Your Stats
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: 'transparent' }}>
              <span className="text-sm" style={{ color: '#94A3B8' }}>Total uses</span>
              <span className="text-sm font-bold" style={{ color: '#F8FAFC' }}>
                {referralData?.total_uses || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: 'transparent' }}>
              <span className="text-sm" style={{ color: '#94A3B8' }}>Total earned</span>
              <span className="text-sm font-bold" style={{ color: '#F8FAFC' }}>
                ${referralData?.total_earnings?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7 border" style={{ backgroundColor: '#111111', borderColor: '#2f2f2f' }}>
        <div className="flex items-center gap-2 mb-5">
          <Gift className="w-5 h-5" style={{ color: '#64748B' }} />
          <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#F8FAFC' }}>Enter a Code</h3>
        </div>

        {hasAppliedCode ? (
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: 'transparent' }}>
            <Check className="w-12 h-12 mx-auto mb-3" style={{ color: '#10B981' }} />
            <p className="text-base font-medium mb-1" style={{ color: '#F8FAFC' }}>
              Code Applied!
            </p>
            <p className="text-sm" style={{ color: '#64748B' }}>
              You've already applied a referral code
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'transparent' }}>
              <div className="text-center">
                <label className="block text-xs font-medium mb-2" style={{ color: '#64748B' }}>
                  REFERRAL CODE
                </label>
                <div className="h-[60px] flex items-center justify-center mb-3">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Enter code..."
                    maxLength={8}
                    className="w-full px-4 py-2.5 rounded-lg text-2xl sm:text-3xl font-bold tracking-wider text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20"
                    style={{ backgroundColor: 'transparent', color: '#F8FAFC' }}
                  />
                </div>
                <button
                  onClick={handleApplyCode}
                  disabled={!inputCode.trim() || applying}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#F8FAFC', color: '#111111' }}
                >
                  {applying ? 'Applying...' : 'Apply Code'}
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
              <div className="text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>
                Benefits
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: 'transparent' }}>
                  <span className="text-sm" style={{ color: '#94A3B8' }}>10% first campaign bonus</span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#10B981' }} />
                </div>
                <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: 'transparent' }}>
                  <span className="text-sm" style={{ color: '#94A3B8' }}>Support the community</span>
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
