import React, { useState } from 'react';

interface ContentDetectionFormProps {
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
}

const TOTAL_STEPS = 9;

const inputStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-subtle)',
  color: 'var(--text-primary)',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
};

const labelStyle: React.CSSProperties = {
  color: 'var(--text-primary)',
  fontSize: '12px',
  fontWeight: 600,
  marginBottom: '6px',
  display: 'block',
};

const hintStyle: React.CSSProperties = {
  color: 'var(--text-primary)',
  opacity: 0.5,
  fontSize: '11px',
  marginTop: '4px',
};

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
        >
          {step}
        </div>
        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{title}</p>
      </div>
      <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.55 }}>{subtitle}</p>
    </div>
  );
}

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Step {step} of {TOTAL_STEPS}</p>
        <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.5 }}>{Math.round((step / TOTAL_STEPS) * 100)}% complete</p>
      </div>
      <div className="w-full h-1 rounded-full" style={{ backgroundColor: 'var(--border-subtle)' }}>
        <div
          className="h-1 rounded-full transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%`, backgroundColor: 'var(--text-primary)' }}
        />
      </div>
    </div>
  );
}

function CheckboxRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-lg transition-all hover:brightness-110"
      style={{ backgroundColor: checked ? 'var(--bg-card)' : 'transparent', border: `1px solid ${checked ? 'var(--border-subtle)' : 'transparent'}` }}
    >
      <div
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: checked ? 'var(--text-primary)' : 'transparent', border: `1.5px solid ${checked ? 'var(--text-primary)' : 'var(--border-subtle)'}` }}
      >
        {checked && (
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--bg-primary)' }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>
      <span className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>{label}</span>
    </button>
  );
}

export default function ContentDetectionForm({ onClose, onSubmit }: ContentDetectionFormProps) {
  const [step, setStep] = useState(1);
  const [showAbandonWarning, setShowAbandonWarning] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({
    // Step 1
    fullName: '',
    email: '',
    role: '',
    // Step 2
    contentType: [] as string[],
    otherContentType: '',
    // Step 3
    platforms: [] as string[],
    otherPlatform: '',
    // Step 4
    channelLinks: '',
    totalSubscribers: '',
    avgMonthlyViews: '',
    // Step 5
    contentVolume: '',
    uploadFrequency: '',
    // Step 6
    hasExperiencedTheft: '',
    theftDescription: '',
    // Step 7
    desiredOutcome: [] as string[],
    // Step 8
    additionalNotes: '',
    agreeToTerms: false,
    // Step 9 — review
  });

  const set = (key: string, val: any) => setFormData(prev => ({ ...prev, [key]: val }));

  const toggleArray = (key: string, val: string) => {
    const arr: string[] = formData[key] || [];
    set(key, arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val]);
  };

  const canAdvance = () => {
    switch (step) {
      case 1: return formData.fullName.trim() && formData.email.trim() && formData.role.trim();
      case 2: return formData.contentType.length > 0;
      case 3: return formData.platforms.length > 0;
      case 4: return formData.channelLinks.trim() && formData.totalSubscribers.trim();
      case 5: return formData.contentVolume.trim() && formData.uploadFrequency.trim();
      case 6: return formData.hasExperiencedTheft !== '';
      case 7: return formData.desiredOutcome.length > 0;
      case 8: return formData.agreeToTerms;
      default: return true;
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden animate-fade-in"
      style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}
    >
      <div className="px-5 py-5">
        <ProgressBar step={step} />

        {/* Step 1: Contact Info */}
        {step === 1 && (
          <>
            <StepHeader step={1} title="Contact Information" subtitle="Tell us who you are and how we can reach you." />
            <div className="space-y-3">
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  style={inputStyle}
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={e => set('fullName', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => set('email', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Your Role</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. YouTuber, Movie Studio, Live Streamer"
                  value={formData.role}
                  onChange={e => set('role', e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Step 2: Content Type */}
        {step === 2 && (
          <>
            <StepHeader step={2} title="Content Type" subtitle="Select all content types that apply to your work." />
            <div className="space-y-1">
              {['Long-form videos', 'Short-form clips / Reels', 'Live streams', 'Movies / Films', 'Music videos', 'Podcasts / Audio', 'Other'].map(opt => (
                <CheckboxRow
                  key={opt}
                  checked={formData.contentType.includes(opt)}
                  onChange={() => toggleArray('contentType', opt)}
                  label={opt}
                />
              ))}
            </div>
            {formData.contentType.includes('Other') && (
              <input
                style={{ ...inputStyle, marginTop: '10px' }}
                placeholder="Describe your content type"
                value={formData.otherContentType}
                onChange={e => set('otherContentType', e.target.value)}
              />
            )}
          </>
        )}

        {/* Step 3: Platforms */}
        {step === 3 && (
          <>
            <StepHeader step={3} title="Platforms" subtitle="Which platforms do you publish your content on?" />
            <div className="space-y-1">
              {['YouTube', 'TikTok', 'Instagram', 'Twitch', 'Facebook', 'X (Twitter)', 'Vimeo', 'Other'].map(opt => (
                <CheckboxRow
                  key={opt}
                  checked={formData.platforms.includes(opt)}
                  onChange={() => toggleArray('platforms', opt)}
                  label={opt}
                />
              ))}
            </div>
            {formData.platforms.includes('Other') && (
              <input
                style={{ ...inputStyle, marginTop: '10px' }}
                placeholder="Specify other platform(s)"
                value={formData.otherPlatform}
                onChange={e => set('otherPlatform', e.target.value)}
              />
            )}
          </>
        )}

        {/* Step 4: Channel / Audience Size */}
        {step === 4 && (
          <>
            <StepHeader step={4} title="Channel & Audience Size" subtitle="Help us understand the scale of your presence." />
            <div className="space-y-3">
              <div>
                <label style={labelStyle}>Channel / Profile Links</label>
                <textarea
                  style={{ ...inputStyle, resize: 'none', minHeight: '72px' }}
                  placeholder="Paste your channel or profile URLs (one per line)"
                  value={formData.channelLinks}
                  onChange={e => set('channelLinks', e.target.value)}
                />
                <p style={hintStyle}>Include all relevant platforms</p>
              </div>
              <div>
                <label style={labelStyle}>Total Subscribers / Followers</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. 500,000"
                  value={formData.totalSubscribers}
                  onChange={e => set('totalSubscribers', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Average Monthly Views <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span></label>
                <input
                  style={inputStyle}
                  placeholder="e.g. 2,000,000"
                  value={formData.avgMonthlyViews}
                  onChange={e => set('avgMonthlyViews', e.target.value)}
                />
              </div>
            </div>
          </>
        )}

        {/* Step 5: Content Volume */}
        {step === 5 && (
          <>
            <StepHeader step={5} title="Content Volume" subtitle="How much content do you produce and how often?" />
            <div className="space-y-3">
              <div>
                <label style={labelStyle}>Total Pieces of Content Published</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. 1,200 videos"
                  value={formData.contentVolume}
                  onChange={e => set('contentVolume', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Upload Frequency</label>
                <div className="space-y-1 mt-1">
                  {['Multiple times per day', 'Daily', 'A few times per week', 'Weekly', 'Monthly or less'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => set('uploadFrequency', opt)}
                      className="flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-lg transition-all hover:brightness-110"
                      style={{
                        backgroundColor: formData.uploadFrequency === opt ? 'var(--bg-elevated)' : 'transparent',
                        border: `1px solid ${formData.uploadFrequency === opt ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ border: `1.5px solid ${formData.uploadFrequency === opt ? 'var(--text-primary)' : 'var(--border-subtle)'}` }}
                      >
                        {formData.uploadFrequency === opt && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-primary)' }} />
                        )}
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 6: Content Theft Experience */}
        {step === 6 && (
          <>
            <StepHeader step={6} title="Content Theft Experience" subtitle="Have you had your content stolen or reuploaded without permission?" />
            <div className="space-y-1 mb-4">
              {[
                { val: 'yes_frequently', label: 'Yes — it happens frequently' },
                { val: 'yes_occasionally', label: 'Yes — it has happened occasionally' },
                { val: 'not_sure', label: "I'm not sure, but suspect it might be happening" },
                { val: 'no', label: 'No, not that I know of' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('hasExperiencedTheft', val)}
                  className="flex items-center gap-3 w-full text-left py-2.5 px-3 rounded-lg transition-all hover:brightness-110"
                  style={{
                    backgroundColor: formData.hasExperiencedTheft === val ? 'var(--bg-elevated)' : 'transparent',
                    border: `1px solid ${formData.hasExperiencedTheft === val ? 'rgba(255,255,255,0.2)' : 'transparent'}`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ border: `1.5px solid ${formData.hasExperiencedTheft === val ? 'var(--text-primary)' : 'var(--border-subtle)'}` }}
                  >
                    {formData.hasExperiencedTheft === val && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-primary)' }} />
                    )}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.85 }}>{label}</span>
                </button>
              ))}
            </div>
            {(formData.hasExperiencedTheft === 'yes_frequently' || formData.hasExperiencedTheft === 'yes_occasionally') && (
              <div>
                <label style={labelStyle}>Tell us more <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span></label>
                <textarea
                  style={{ ...inputStyle, resize: 'none', minHeight: '72px' }}
                  placeholder="Describe what happened, which platforms, etc."
                  value={formData.theftDescription}
                  onChange={e => set('theftDescription', e.target.value)}
                />
              </div>
            )}
          </>
        )}

        {/* Step 7: Desired Outcome */}
        {step === 7 && (
          <>
            <StepHeader step={7} title="Desired Outcome" subtitle="What do you hope to achieve with Content Detection?" />
            <div className="space-y-1">
              {[
                'Automatically claim unauthorized reuploads',
                'Monetize reuploaded content on my behalf',
                'Get notified when my content is detected',
                'Remove infringing content',
                'Track where my content is being shared',
              ].map(opt => (
                <CheckboxRow
                  key={opt}
                  checked={formData.desiredOutcome.includes(opt)}
                  onChange={() => toggleArray('desiredOutcome', opt)}
                  label={opt}
                />
              ))}
            </div>
          </>
        )}

        {/* Step 8: Terms & Notes */}
        {step === 8 && (
          <>
            <StepHeader step={8} title="Additional Notes & Agreement" subtitle="Any final details, and please confirm you agree to our terms." />
            <div className="space-y-4">
              <div>
                <label style={labelStyle}>Additional Notes <span style={{ fontWeight: 400, opacity: 0.5 }}>(optional)</span></label>
                <textarea
                  style={{ ...inputStyle, resize: 'none', minHeight: '88px' }}
                  placeholder="Anything else you'd like us to know about your situation or needs..."
                  value={formData.additionalNotes}
                  onChange={e => set('additionalNotes', e.target.value)}
                />
              </div>
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Terms of Service</p>
                <p className="text-xs mb-3" style={{ color: 'var(--text-primary)', opacity: 0.55 }}>
                  By submitting this application, you confirm that you are the rightful owner or authorized representative of the content described. You agree to allow us to scan platforms on your behalf and take action against unauthorized use of your content. We reserve the right to decline applications that do not meet our high-volume content threshold.
                </p>
                <CheckboxRow
                  checked={formData.agreeToTerms}
                  onChange={v => set('agreeToTerms', v)}
                  label="I agree to the Terms of Service and confirm I own the content described"
                />
              </div>
            </div>
          </>
        )}

        {/* Step 9: Review & Submit */}
        {step === 9 && (
          <>
            <StepHeader step={9} title="Review & Submit" subtitle="Review your information before submitting your application." />
            <div className="space-y-3">
              {[
                { label: 'Name', value: formData.fullName },
                { label: 'Email', value: formData.email },
                { label: 'Role', value: formData.role },
                { label: 'Content Types', value: formData.contentType.join(', ') || '—' },
                { label: 'Platforms', value: formData.platforms.join(', ') || '—' },
                { label: 'Total Subscribers', value: formData.totalSubscribers || '—' },
                { label: 'Content Volume', value: formData.contentVolume || '—' },
                { label: 'Upload Frequency', value: formData.uploadFrequency || '—' },
                { label: 'Theft Experience', value: formData.hasExperiencedTheft || '—' },
                { label: 'Desired Outcomes', value: formData.desiredOutcome.join(', ') || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3 py-2.5 px-3 rounded-lg" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-xs font-semibold w-32 flex-shrink-0" style={{ color: 'var(--text-primary)', opacity: 0.6 }}>{label}</p>
                  <p className="text-xs flex-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg px-4 py-3" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
              <p className="text-xs" style={{ color: 'var(--text-primary)', opacity: 0.55 }}>
                Once submitted, our team will review your application and reach out within 3–5 business days.
              </p>
            </div>
          </>
        )}

        {/* Abandon warning */}
        {showAbandonWarning && (
          <div className="mt-5 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Abandon application?</p>
            <p className="text-xs mb-3" style={{ color: 'var(--text-primary)', opacity: 0.55 }}>Your progress will be lost. Are you sure you want to leave this form?</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onClose()}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
              >
                Yes, abandon
              </button>
              <button
                type="button"
                onClick={() => setShowAbandonWarning(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
                style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                Keep going
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={() => {
              if (step === 1) {
                onClose();
              } else {
                setStep(s => s - 1);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 9 ? (
            <button
              type="button"
              onClick={() => canAdvance() && setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              Continue
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all hover:brightness-110"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              Submit Application
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
