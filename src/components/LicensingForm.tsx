import React, { useState, useRef, useEffect } from 'react';

interface LicensingFormProps {
  onClose: () => void;
  onSubmit?: () => void;
}

const TOTAL_STEPS = 9;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="h-1 rounded-full flex-1 transition-all duration-300"
          style={{ backgroundColor: i < current ? 'var(--text-primary)' : 'var(--border-subtle)' }}
        />
      ))}
    </div>
  );
}

function CheckItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3 w-full text-left transition-all"
    >
      <div
        className="w-4 h-4 rounded flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
        style={{ border: `1px solid ${checked ? 'var(--text-primary)' : 'var(--border-subtle)'}`, backgroundColor: checked ? 'var(--text-primary)' : 'transparent' }}
      >
        {checked && (
          <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="var(--bg-primary)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </div>
      <span className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>{label}</span>
    </button>
  );
}

function LabeledInput({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all"
        style={{
          backgroundColor: 'var(--bg-elevated)',
          border: `1px solid ${focused ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
          color: 'var(--text-primary)',
        }}
      />
    </div>
  );
}

function SimpleDropdown({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref}>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all outline-none"
          style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <span style={{ opacity: value ? 1 : 0.5 }}>{value || 'Select…'}</span>
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden animate-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onMouseEnter={() => setHovered(opt)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-all"
                style={{
                  backgroundColor: hovered === opt ? 'var(--bg-elevated)' : 'transparent',
                  color: 'var(--text-primary)',
                  transform: hovered === opt ? 'translateX(4px)' : '',
                }}
              >
                {opt}
                {value === opt && <span style={{ color: '#CBD5E1' }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LicensingForm({ onClose, onSubmit }: LicensingFormProps) {
  const [step, setStep] = useState(1);
  const [showAbandonWarning, setShowAbandonWarning] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSig, setHasSig] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const [form, setForm] = useState({
    // Step 1 - Creator Info
    legalName: '',
    brandName: '',
    email: '',
    phone: '',
    country: '',
    youtube: '',
    instagram: '',
    tiktok: '',
    twitch: '',
    // Step 2 - Authorization
    authConfirm: false,
    // Step 3 - Ownership
    ownsContent: false,
    noThirdParty: false,
    noSamples: false,
    noCovers: false,
    noDisputes: false,
    indemnify: false,
    // Step 4 - Scope
    exclusivity: '',
    territory: '',
    platforms: [] as string[],
    // Step 5 - Revenue
    revenuePercent: '',
    thresholdAgree: false,
    reportingAgree: false,
    // Step 6 - Licensing Prefs
    minFee: '',
    autoLicense: '',
    // Step 7 - Compliance
    noUnlawful: false,
    cooperate: false,
    updateInfo: false,
    acceptModeration: false,
    // Step 8 - Term
    termLength: '',
    // Step 9 - Payment
    payoutMethod: '',
    paypalEmail: '',
    bankName: '',
    bankAcct: '',
    taxForm: '',
    signerName: '',
  });

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));
  const togglePlatform = (p: string) => set('platforms', form.platforms.includes(p) ? form.platforms.filter(x => x !== p) : [...form.platforms, p]);

  // Signature canvas helpers
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !sigCanvasRef.current) return;
    const ctx = sigCanvasRef.current.getContext('2d')!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = 'var(--text-primary)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasSig(true);
  };

  const stopDraw = () => { setIsDrawing(false); lastPos.current = null; };

  const clearSig = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
  };

  const handleSubmit = () => {
    onSubmit?.();
    onClose();
  };

  const COUNTRIES = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'Brazil', 'India', 'Nigeria', 'South Africa', 'Mexico', 'Other'];
  const EXCLUSIVITY_OPTS = ['Exclusive', 'Non-exclusive'];
  const TERRITORY_OPTS = ['Worldwide', 'North America', 'Europe', 'Asia-Pacific', 'Latin America', 'Africa', 'Custom'];
  const TERM_OPTS = ['6 months', '12 months', '24 months', 'Indefinite (until terminated)'];
  const AUTO_LICENSE_OPTS = ['Auto-approve all license requests', 'Require my approval for each request'];
  const PAYOUT_OPTS = ['PayPal', 'Bank Transfer (ACH/Wire)', 'Check'];
  const TAX_OPTS = ['W-9 (US persons)', 'W-8BEN (non-US individuals)', 'W-8BEN-E (non-US entities)', 'Not sure — I will confirm later'];

  return (
    <div className="mt-4 rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Licensing Application</p>
          <button
            type="button"
            onClick={() => step === 1 ? onClose() : setShowAbandonWarning(true)}
            className="flex items-center gap-1.5 text-xs font-semibold transition-all hover:opacity-70"
            style={{ color: 'var(--text-primary)' }}
          >
            Cancel
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Step {step} of {TOTAL_STEPS}</p>
      </div>

      <div className="px-5 py-5">
        <StepIndicator current={step} total={TOTAL_STEPS} />

        {/* ── STEP 1: Creator Information ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Creator Information</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Tell us about yourself and your brand so we can set up your licensing profile.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <LabeledInput label="Legal Name" value={form.legalName} onChange={v => set('legalName', v)} placeholder="Full legal name" />
              <LabeledInput label="Brand / Stage Name" value={form.brandName} onChange={v => set('brandName', v)} placeholder="How fans know you" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <LabeledInput label="Email Address" value={form.email} onChange={v => set('email', v)} placeholder="you@example.com" type="email" />
              <LabeledInput label="Phone Number" value={form.phone} onChange={v => set('phone', v)} placeholder="+1 (555) 000-0000" type="tel" />
            </div>
            <SimpleDropdown label="Country of Residence" value={form.country} options={COUNTRIES} onChange={v => set('country', v)} />
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Account Links <span className="font-normal" style={{ opacity: 0.5 }}>(optional)</span></p>
              <div className="space-y-2.5">
                <LabeledInput label="YouTube Channel URL" value={form.youtube} onChange={v => set('youtube', v)} placeholder="https://youtube.com/c/yourchannel" />
                <LabeledInput label="Instagram Profile URL" value={form.instagram} onChange={v => set('instagram', v)} placeholder="https://instagram.com/yourhandle" />
                <LabeledInput label="TikTok Profile URL" value={form.tiktok} onChange={v => set('tiktok', v)} placeholder="https://tiktok.com/@yourhandle" />
                <LabeledInput label="Twitch Channel URL" value={form.twitch} onChange={v => set('twitch', v)} placeholder="https://twitch.tv/yourchannel" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Representation Authorization ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Representation Authorization</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>You must agree to the following authorization points before we can represent your content.</p>
            </div>
            <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <CheckItem
                label="I authorize Elevate to act as my official licensing representative for all qualifying content submitted under this agreement."
                checked={form.authConfirm}
                onChange={v => set('authConfirm', v)}
              />
              <p className="text-xs pl-7" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>By checking the above, you acknowledge that Elevate is granted non-exclusive rights to license, sublicense, and monetize your submitted content on platforms including but not limited to YouTube, Meta, TikTok, Twitch, and other digital distribution networks. This authorization allows Elevate to:</p>
              <ul className="pl-7 space-y-2">
                {[
                  'Issue Content ID claims on qualifying uploads.',
                  'Negotiate licensing agreements with third-party platforms and brands on your behalf.',
                  'Collect and distribute royalties and licensing fees as outlined in the Revenue Share Agreement.',
                  'Enforce intellectual property rights where applicable under applicable law.',
                  'Sub-license your content to vetted brand partners for synchronization, advertising, and promotional use.',
                ].map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-primary)', opacity: 0.7 }}>
                    <svg className="w-3 h-3 flex-shrink-0 mt-0.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>This authorization does not transfer ownership of your content. You retain all intellectual property rights. You may terminate this agreement at any time with 30 days written notice.</p>
            </div>
          </div>
        )}

        {/* ── STEP 3: Ownership Declaration ── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Ownership Declaration</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>You must confirm that you own or control all rights to the content you are submitting for licensing.</p>
            </div>
            <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <CheckItem label="I own or control all rights to the content submitted, including audio, video, images, and any other media." checked={form.ownsContent} onChange={v => set('ownsContent', v)} />
              <CheckItem label="My content does not contain any third-party copyrighted material, trademarks, or intellectual property that I do not have rights to use." checked={form.noThirdParty} onChange={v => set('noThirdParty', v)} />
              <CheckItem label="My content does not include uncleared samples, interpolations, or replayed elements from other recordings." checked={form.noSamples} onChange={v => set('noSamples', v)} />
              <CheckItem label="My content does not include cover songs, remixes, or derivative works without the appropriate mechanical licenses or permissions." checked={form.noCovers} onChange={v => set('noCovers', v)} />
              <CheckItem label="My content is not subject to any existing exclusive licensing agreements, legal disputes, or third-party claims that would prevent this authorization." checked={form.noDisputes} onChange={v => set('noDisputes', v)} />
              <CheckItem label="I agree to indemnify and hold harmless Elevate from any claims arising from false ownership declarations." checked={form.indemnify} onChange={v => set('indemnify', v)} />
            </div>
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Submitting false ownership information may result in immediate termination of your account and potential legal liability.</p>
            </div>
          </div>
        )}

        {/* ── STEP 4: Scope of Representation ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Scope of Representation</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Define where and how we are authorized to represent your content.</p>
            </div>
            <SimpleDropdown label="Exclusivity" value={form.exclusivity} options={EXCLUSIVITY_OPTS} onChange={v => set('exclusivity', v)} />
            <SimpleDropdown label="Territory" value={form.territory} options={TERRITORY_OPTS} onChange={v => set('territory', v)} />
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Platforms</p>
              <div className="flex flex-wrap gap-2">
                {['YouTube', 'TikTok', 'Instagram / Meta', 'Twitch', 'Facebook', 'Snapchat', 'X (Twitter)', 'All Platforms'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePlatform(p)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: form.platforms.includes(p) ? 'var(--text-primary)' : 'var(--bg-elevated)',
                      color: form.platforms.includes(p) ? 'var(--bg-primary)' : 'var(--text-primary)',
                      border: `1px solid ${form.platforms.includes(p) ? 'rgba(255,255,255,0.2)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Non-exclusive means we can represent your content alongside other representatives. Exclusive means only Elevate can monetize on your behalf for the selected platforms and territory.</p>
            </div>
          </div>
        )}

        {/* ── STEP 5: Revenue Share Agreement ── */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Revenue Share Agreement</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Define how licensing revenue will be split between you and Elevate.</p>
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Your Revenue Share (%)</p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.revenuePercent}
                  onChange={e => set('revenuePercent', e.target.value)}
                  placeholder="e.g. 70"
                  className="w-28 px-3 py-2.5 rounded-xl text-xs outline-none transition-all"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
                />
                <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>% of net licensing revenue paid to you. Elevate retains the remainder as a service fee.</p>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>Standard creator share is 70–80%. Final split is subject to Elevate's approval based on your content tier and catalog size.</p>
            </div>
            <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <CheckItem label="I understand that payments are subject to a minimum payout threshold of $25 USD before disbursement." checked={form.thresholdAgree} onChange={v => set('thresholdAgree', v)} />
              <CheckItem label="I agree that Elevate will provide monthly revenue reports accessible via my dashboard, and that any disputes must be raised within 60 days of the report date." checked={form.reportingAgree} onChange={v => set('reportingAgree', v)} />
            </div>
          </div>
        )}

        {/* ── STEP 6: Licensing Preferences ── */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Licensing Preferences</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Set your preferences for how your content is licensed to third parties.</p>
            </div>
            <LabeledInput label="Minimum Licensing Fee (USD)" value={form.minFee} onChange={v => set('minFee', v)} placeholder="e.g. 500" type="number" />
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>This is the minimum fee you will accept for a single licensing deal. Elevate will not accept offers below this amount without your explicit consent.</p>
            </div>
            <SimpleDropdown label="License Approval Preference" value={form.autoLicense} options={AUTO_LICENSE_OPTS} onChange={v => set('autoLicense', v)} />
            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Auto-approve allows faster deal closure. If you select approval required, you will receive notifications for each license request and must respond within 72 hours or the request will expire.</p>
            </div>
          </div>
        )}

        {/* ── STEP 7: Compliance & Risk Disclosure ── */}
        {step === 7 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Compliance & Risk Disclosure</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Please confirm your understanding of the following compliance obligations.</p>
            </div>
            <div className="rounded-xl p-4 space-y-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <CheckItem label="I confirm that my content does not promote, glorify, or depict any unlawful activity, hate speech, or content that violates applicable platform guidelines." checked={form.noUnlawful} onChange={v => set('noUnlawful', v)} />
              <CheckItem label="I agree to cooperate fully with any platform-required audits, content reviews, or takedown requests that Elevate is legally or contractually obligated to comply with." checked={form.cooperate} onChange={v => set('cooperate', v)} />
              <CheckItem label="I will promptly update Elevate with any changes to ownership status, content disputes, or third-party claims that may affect the validity of this agreement." checked={form.updateInfo} onChange={v => set('updateInfo', v)} />
              <CheckItem label="I understand that Elevate may temporarily suspend monetization of my content while investigating potential copyright violations or platform policy breaches, without this constituting a breach of this agreement." checked={form.acceptModeration} onChange={v => set('acceptModeration', v)} />
            </div>
          </div>
        )}

        {/* ── STEP 8: Term & Termination ── */}
        {step === 8 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Term & Termination</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Select how long this licensing agreement should remain active.</p>
            </div>
            <SimpleDropdown label="Agreement Term Length" value={form.termLength} options={TERM_OPTS} onChange={v => set('termLength', v)} />
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              {[
                { title: 'Renewal', body: 'At the end of the selected term, this agreement will automatically renew for the same period unless either party provides 30 days written notice of non-renewal.' },
                { title: 'Early Termination', body: 'Either party may terminate this agreement early with 30 days written notice. Pending licensing deals at the time of termination will be honored through completion.' },
                { title: 'Effect of Termination', body: 'Upon termination, Elevate will cease all active licensing efforts. Revenue from deals closed prior to termination will continue to be distributed per the agreed revenue share.' },
              ].map(({ title, body }) => (
                <div key={title}>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 9: Payment Information & Signature ── */}
        {step === 9 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Payment Information & Signature</p>
              <p className="text-xs mb-4" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Select your preferred payout method and sign to finalize your application.</p>
            </div>

            <SimpleDropdown label="Payout Method" value={form.payoutMethod} options={PAYOUT_OPTS} onChange={v => set('payoutMethod', v)} />

            {form.payoutMethod === 'PayPal' && (
              <LabeledInput label="PayPal Email" value={form.paypalEmail} onChange={v => set('paypalEmail', v)} placeholder="paypal@example.com" type="email" />
            )}
            {form.payoutMethod === 'Bank Transfer (ACH/Wire)' && (
              <div className="space-y-3">
                <LabeledInput label="Bank Name" value={form.bankName} onChange={v => set('bankName', v)} placeholder="e.g. Chase, Wells Fargo" />
                <LabeledInput label="Account Number" value={form.bankAcct} onChange={v => set('bankAcct', v)} placeholder="Account number" />
              </div>
            )}

            <SimpleDropdown label="Tax Form on File" value={form.taxForm} options={TAX_OPTS} onChange={v => set('taxForm', v)} />

            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>Payouts are processed on the 15th of each month for the prior month's revenue. A completed tax form is required before your first payout.</p>
            </div>

            {/* Digital Signature */}
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Printed Name</p>
              <input
                type="text"
                value={form.signerName}
                onChange={e => set('signerName', e.target.value)}
                placeholder="Type your full legal name"
                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-all mb-4"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              />
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Digital Signature</p>
                <button
                  type="button"
                  onClick={clearSig}
                  className="text-xs transition-all hover:opacity-70"
                  style={{ color: 'var(--text-primary)', opacity: 0.5 }}
                >
                  Clear
                </button>
              </div>
              <canvas
                ref={sigCanvasRef}
                width={520}
                height={100}
                className="w-full rounded-xl touch-none"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', cursor: 'crosshair' }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-primary)', opacity: 0.4 }}>Draw your signature above using your mouse or finger.</p>
            </div>

            <div className="rounded-xl px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>By submitting this application, you confirm that all information provided is accurate and that you agree to Elevate's Licensing Terms and Conditions. Your application will be reviewed within 5–7 business days.</p>
            </div>
          </div>
        )}

        {/* Abandon warning */}
        {showAbandonWarning && (
          <div className="mt-5 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Abandon application?</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-primary)', opacity: 0.55 }}>Your progress will be lost. Are you sure you want to leave?</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>Yes, abandon</button>
              <button type="button" onClick={() => setShowAbandonWarning(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}>Keep going</button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => step === 1 ? onClose() : setStep(s => s - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              Continue
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!form.signerName || !hasSig}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              Submit Application
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
