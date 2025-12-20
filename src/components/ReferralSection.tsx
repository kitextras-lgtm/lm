import { useState, useEffect } from 'react';
import { Copy, Check, Gift } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
      if (!user) return;

      const { data: existingCode } = await supabase
        .from('referral_codes')
        .select('code, total_uses, total_earnings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingCode) {
        setReferralData(existingCode);
      } else {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('username')
          .eq('id', user.id)
          .maybeSingle();

        const username = userProfile?.username;

        if (username) {
          const { data: insertedCode, error: insertError } = await supabase
            .from('referral_codes')
            .insert({
              user_id: user.id,
              code: username.toUpperCase(),
            })
            .select('code, total_uses, total_earnings')
            .single();

          if (!insertError && insertedCode) {
            setReferralData(insertedCode);
          } else {
            console.error('Error inserting referral code:', insertError);
          }
        } else {
          console.error('No username found for user');
        }
      }

      const { data: appliedCode } = await supabase
        .from('referral_applications')
        .select('id')
        .eq('user_id', user.id)
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
      <div className="rounded-xl sm:rounded-2xl p-6 sm:p-8" style={{ backgroundColor: '#1a1a1e' }}>
        <div className="text-center" style={{ color: '#94A3B8' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
      <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7" style={{ backgroundColor: '#1a1a1e' }}>
        <div className="flex items-center gap-2 mb-5">
          <Gift className="w-5 h-5" style={{ color: '#64748B' }} />
          <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#F8FAFC' }}>Your Code</h3>
        </div>

        <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: '#111111' }}>
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
            <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: '#111111' }}>
              <span className="text-sm" style={{ color: '#94A3B8' }}>Total uses</span>
              <span className="text-sm font-bold" style={{ color: '#F8FAFC' }}>
                {referralData?.total_uses || 0}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: '#111111' }}>
              <span className="text-sm" style={{ color: '#94A3B8' }}>Total earned</span>
              <span className="text-sm font-bold" style={{ color: '#F8FAFC' }}>
                ${referralData?.total_earnings?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl sm:rounded-2xl p-5 sm:p-7" style={{ backgroundColor: '#1a1a1e' }}>
        <div className="flex items-center gap-2 mb-5">
          <Gift className="w-5 h-5" style={{ color: '#64748B' }} />
          <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#F8FAFC' }}>Enter a Code</h3>
        </div>

        {hasAppliedCode ? (
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#111111' }}>
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
            <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: '#111111' }}>
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
                    style={{ backgroundColor: '#1a1a1e', color: '#F8FAFC' }}
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
                <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: '#111111' }}>
                  <span className="text-sm" style={{ color: '#94A3B8' }}>10% first campaign bonus</span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#10B981' }} />
                </div>
                <div className="flex items-center justify-between py-3 px-3 rounded-lg" style={{ backgroundColor: '#111111' }}>
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
