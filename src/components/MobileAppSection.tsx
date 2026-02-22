import { useState, useEffect } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const SEARCH_WORD = 'Elevate';

export function MobileAppSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);
  const [typedChars, setTypedChars] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    if (!isVisible) return;
    const cursorInterval = setInterval(() => setCursorOn(c => !c), 530);
    let charCount = 0;
    const typeTimeout = setTimeout(() => {
      const typeInterval = setInterval(() => {
        charCount++;
        setTypedChars(charCount);
        if (charCount >= SEARCH_WORD.length) {
          clearInterval(typeInterval);
          setTimeout(() => setShowResults(true), 400);
          setTimeout(() => setShowQR(true), 1100);
        }
      }, 120);
    }, 700);
    return () => {
      clearTimeout(typeTimeout);
      clearInterval(cursorInterval);
    };
  }, [isVisible]);

  const typedText = SEARCH_WORD.slice(0, typedChars);

  return (
    <section ref={sectionRef} className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden" style={{ background: '#000' }}>
      <div className="max-w-5xl mx-auto" style={isVisible ? { animation: 'liftIn 0.75s cubic-bezier(0.22,1,0.36,1) forwards' } : { opacity: 0 }}>
        <div className="rounded-3xl md:rounded-[2.5rem] p-8 md:p-16 shadow-2xl" style={{ background: 'linear-gradient(135deg,#fff 0%,#f5f5f5 100%)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 md:mb-16 leading-tight" style={{ fontFamily: 'Fraunces, serif', color: '#000', letterSpacing: '-0.02em' }}>
            Fully Integrated<br />With Mobile
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14">
            {/* ── Phone ── */}
            <div className="relative flex-shrink-0" style={{ width: '200px' }}>
              <div className="absolute top-24 -right-0.5 w-1 h-10 rounded-r-sm" style={{ background: '#2a2a2a' }} />
              <div className="absolute top-16 -left-0.5 w-1 h-7 rounded-l-sm" style={{ background: '#2a2a2a' }} />
              <div className="absolute top-28 -left-0.5 w-1 h-7 rounded-l-sm" style={{ background: '#2a2a2a' }} />
              <div className="relative rounded-[2.4rem] overflow-hidden" style={{ width: '200px', height: '400px', background: '#1a1a1a', border: '2px solid #333', boxShadow: '0 32px 64px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.07)' }}>
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full z-10" style={{ background: '#1a1a1a' }} />
                <div className="absolute inset-[2px] rounded-[2.2rem] overflow-hidden" style={{ background: '#f2f2f7' }}>
                  {/* Status bar */}
                  <div className="flex items-center justify-between px-5 pt-4 pb-1">
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#1a1a1a' }}>9:41</span>
                    <div className="flex items-center gap-1">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><rect x="0" y="2" width="2" height="6" rx="0.5" fill="#1a1a1a" opacity="0.4"/><rect x="3" y="1" width="2" height="7" rx="0.5" fill="#1a1a1a" opacity="0.6"/><rect x="6" y="0" width="2" height="8" rx="0.5" fill="#1a1a1a" opacity="0.8"/><rect x="9" y="0" width="2" height="8" rx="0.5" fill="#1a1a1a"/></svg>
                      <svg width="14" height="8" viewBox="0 0 14 8" fill="none"><rect x="0.5" y="0.5" width="11" height="7" rx="2" stroke="#1a1a1a" strokeOpacity="0.35"/><rect x="12" y="2.5" width="1.5" height="3" rx="0.75" fill="#1a1a1a" fillOpacity="0.4"/><rect x="1.5" y="1.5" width="8" height="5" rx="1.5" fill="#1a1a1a"/></svg>
                    </div>
                  </div>
                  {/* App Store header */}
                  <div className="px-4 pt-1">
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#1a1a1a', fontFamily: 'system-ui', marginBottom: '8px' }}>App Store</div>
                    {/* Search bar */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: '#e5e5ea' }}>
                      <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#8e8e93" strokeWidth="2.5"/><path d="M13.5 13.5L17 17" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round"/></svg>
                      <span style={{ fontSize: '10px', color: typedChars > 0 ? '#1a1a1a' : '#8e8e93', fontFamily: 'system-ui' }}>
                        {typedChars > 0 ? typedText : 'Games, Apps, Stories…'}
                      </span>
                      {typedChars > 0 && typedChars < SEARCH_WORD.length && (
                        <span style={{ display: 'inline-block', width: '1.5px', height: '11px', background: '#007aff', opacity: cursorOn ? 1 : 0, marginLeft: '-2px', verticalAlign: 'middle' }} />
                      )}
                    </div>
                    {/* Results */}
                    <div style={{ opacity: showResults ? 1 : 0, transform: showResults ? 'none' : 'translateY(5px)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}>
                      {[
                        { label: 'Elevate', sub: 'Creator Platform', icon: true },
                        { label: 'Elevate — Brain Training', sub: 'Education', icon: false },
                        { label: 'Elevate Fitness', sub: 'Health & Fitness', icon: false },
                      ].map((r, i) => (
                        <div key={r.label} className="flex items-center gap-2.5 py-2" style={{ borderBottom: i < 2 ? '0.5px solid rgba(0,0,0,0.1)' : 'none' }}>
                          <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: r.icon ? '#000' : '#d1d5db', boxShadow: r.icon ? '0 2px 8px rgba(0,0,0,0.25)' : 'none' }}>
                            {r.icon && <img src="/elevate solid white logo ver.jpeg" alt="Elevate" style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: '10px', fontWeight: r.icon ? 600 : 500, color: '#1a1a1a', fontFamily: 'system-ui' }}>{r.label}</div>
                            <div style={{ fontSize: '8px', color: '#8e8e93', fontFamily: 'system-ui' }}>{r.sub}</div>
                            {r.icon && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                {[1,2,3,4,5].map(s => <svg key={s} width="7" height="7" viewBox="0 0 20 20" fill="#ff9500"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                              </div>
                            )}
                          </div>
                          <div className="px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: '#e5e5ea', fontSize: '9px', fontWeight: 600, color: '#007aff', fontFamily: 'system-ui' }}>GET</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />
              </div>
            </div>

            {/* ── QR card ── */}
            <div style={{ opacity: showQR ? 1 : 0, transform: showQR ? 'translateX(0) scale(1)' : 'translateX(-16px) scale(0.96)', transition: 'opacity 0.55s cubic-bezier(0.34,1.2,0.64,1), transform 0.55s cubic-bezier(0.34,1.2,0.64,1)' }}>
              <div className="p-6 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: '190px' }}>
                <div className="text-center mb-4">
                  <p style={{ fontSize: '11px', color: '#555', fontFamily: 'system-ui' }}>Scan to download</p>
                  <p style={{ fontSize: '17px', fontWeight: 700, color: '#000', fontFamily: 'Fraunces, serif', marginTop: '2px' }}>Elevate</p>
                </div>
                <div className="w-36 h-36 mx-auto mb-5">
                  <svg viewBox="0 0 90 90" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                    <rect width="90" height="90" fill="#fff"/>
                    <rect x="8" y="8" width="24" height="24" rx="3" fill="#000"/><rect x="12" y="12" width="16" height="16" rx="2" fill="#fff"/><rect x="15" y="15" width="10" height="10" rx="1" fill="#000"/>
                    <rect x="58" y="8" width="24" height="24" rx="3" fill="#000"/><rect x="62" y="12" width="16" height="16" rx="2" fill="#fff"/><rect x="65" y="15" width="10" height="10" rx="1" fill="#000"/>
                    <rect x="8" y="58" width="24" height="24" rx="3" fill="#000"/><rect x="12" y="62" width="16" height="16" rx="2" fill="#fff"/><rect x="15" y="65" width="10" height="10" rx="1" fill="#000"/>
                    <rect x="38" y="8" width="5" height="5" fill="#000"/><rect x="45" y="8" width="5" height="5" fill="#000"/>
                    <rect x="38" y="15" width="5" height="5" fill="#000"/><rect x="45" y="22" width="5" height="5" fill="#000"/>
                    <rect x="8" y="38" width="5" height="5" fill="#000"/><rect x="15" y="38" width="5" height="5" fill="#000"/><rect x="22" y="38" width="5" height="5" fill="#000"/>
                    <rect x="38" y="38" width="5" height="5" fill="#000"/><rect x="45" y="38" width="5" height="5" fill="#000"/><rect x="52" y="38" width="5" height="5" fill="#000"/>
                    <rect x="59" y="38" width="5" height="5" fill="#000"/><rect x="66" y="38" width="5" height="5" fill="#000"/><rect x="73" y="38" width="5" height="5" fill="#000"/>
                    <rect x="38" y="45" width="5" height="5" fill="#000"/><rect x="52" y="45" width="5" height="5" fill="#000"/><rect x="66" y="45" width="5" height="5" fill="#000"/>
                    <rect x="38" y="52" width="5" height="5" fill="#000"/><rect x="45" y="52" width="5" height="5" fill="#000"/><rect x="59" y="52" width="5" height="5" fill="#000"/>
                    <rect x="38" y="59" width="5" height="5" fill="#000"/><rect x="52" y="59" width="5" height="5" fill="#000"/><rect x="66" y="59" width="5" height="5" fill="#000"/><rect x="73" y="59" width="5" height="5" fill="#000"/>
                    <rect x="38" y="66" width="5" height="5" fill="#000"/><rect x="45" y="66" width="5" height="5" fill="#000"/><rect x="52" y="66" width="5" height="5" fill="#000"/>
                    <rect x="66" y="73" width="5" height="5" fill="#000"/><rect x="73" y="66" width="5" height="5" fill="#000"/>
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-transform duration-200 hover:scale-[1.02]" style={{ background: '#000' }}>
                    <svg width="14" height="17" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    <div><div style={{ color: '#fff', fontSize: '8px', lineHeight: 1, opacity: 0.75 }}>Download on the</div><div style={{ color: '#fff', fontSize: '12px', fontWeight: 600, lineHeight: 1.3 }}>App Store</div></div>
                  </a>
                  <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-transform duration-200 hover:scale-[1.02]" style={{ background: '#000' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3.5 1.5L14 12 3.5 22.5" stroke="#EA4335" strokeWidth="2" strokeLinecap="round"/><path d="M3.5 1.5L20 10.5" stroke="#FBBC04" strokeWidth="2" strokeLinecap="round"/><path d="M3.5 22.5L20 13.5" stroke="#34A853" strokeWidth="2" strokeLinecap="round"/><path d="M20 10.5L20 13.5" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"/></svg>
                    <div><div style={{ color: '#fff', fontSize: '8px', lineHeight: 1, opacity: 0.75 }}>GET IT ON</div><div style={{ color: '#fff', fontSize: '12px', fontWeight: 600, lineHeight: 1.3 }}>Google Play</div></div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
