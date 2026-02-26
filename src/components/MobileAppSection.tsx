import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const SEARCH_WORD = 'Elevate';

// Desktop feature slides cycling through real dashboard sections
const DESKTOP_FEATURES = [
  {
    label: 'Analytics',
    desc: 'Track streams, revenue & audience in real time',
    screen: 'analytics',
  },
  {
    label: 'Release Manager',
    desc: 'Upload, distribute and manage every release',
    screen: 'releases',
  },
  {
    label: 'Publishing',
    desc: 'Register works and collect royalties worldwide',
    screen: 'publishing',
  },
  {
    label: 'Messages',
    desc: 'Collaborate with your team from anywhere',
    screen: 'messages',
  },
];

function AnalyticsScreen() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="flex flex-col gap-1.5 py-2 px-2 flex-shrink-0" style={{ width: '44px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-7 h-7 rounded-md mx-auto mb-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="w-6 h-6 rounded mx-auto" style={{ background: i === 1 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      {/* Main */}
      <div className="flex-1 p-3 overflow-hidden">
        <div className="text-[6px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>OVERVIEW</div>
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {[['Streams','2.4M','↑ 12%'],['Revenue','$1,842','↑ 8%'],['Saves','31.2K','↑ 5%']].map(([l,v,d]) => (
            <div key={l} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.4)', marginBottom: '3px' }}>{l}</div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{d}</div>
            </div>
          ))}
        </div>
        {/* Chart */}
        <div className="rounded-lg p-2 mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.3)', marginBottom: '5px' }}>Streams — Last 30 days</div>
          <svg viewBox="0 0 220 36" width="100%" height="28" preserveAspectRatio="none">
            <defs>
              <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </linearGradient>
            </defs>
            <polyline points="0,30 15,26 30,28 45,18 60,22 75,12 90,15 105,8 120,12 135,5 150,9 165,4 180,7 195,2 220,5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polygon points="0,30 15,26 30,28 45,18 60,22 75,12 90,15 105,8 120,12 135,5 150,9 165,4 180,7 195,2 220,5 220,36 0,36" fill="url(#ag)"/>
          </svg>
        </div>
        {/* Platform row */}
        <div className="grid grid-cols-4 gap-1">
          {[['Spotify','841K'],['Apple','312K'],['Tidal','98K'],['Other','149K']].map(([p,n]) => (
            <div key={p} className="rounded-md p-1.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '4.5px', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>{p}</div>
              <div style={{ fontSize: '7px', fontWeight: 700, color: '#fff' }}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReleasesScreen() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col gap-1.5 py-2 px-2 flex-shrink-0" style={{ width: '44px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-7 h-7 rounded-md mx-auto mb-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="w-6 h-6 rounded mx-auto" style={{ background: i === 2 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      <div className="flex-1 p-3 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div style={{ fontSize: '6px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>RELEASES</div>
          <div className="px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.12)', fontSize: '5px', color: '#fff' }}>+ New</div>
        </div>
        {/* Release rows */}
        {[
          { title: 'Night Drive', type: 'Single', status: 'Live', tracks: 1 },
          { title: 'Horizon EP', type: 'EP', status: 'Live', tracks: 5 },
          { title: 'Solstice', type: 'Album', status: 'Draft', tracks: 12 },
          { title: 'Coastal', type: 'Single', status: 'In Review', tracks: 1 },
        ].map((r, i) => (
          <div key={r.title} className="flex items-center gap-2 px-2 py-1.5 rounded-lg mb-1" style={{ background: i === 0 ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-7 h-7 rounded-md flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: '6.5px', fontWeight: 600, color: '#fff', marginBottom: '1px' }}>{r.title}</div>
              <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.35)' }}>{r.type} · {r.tracks} track{r.tracks > 1 ? 's' : ''}</div>
            </div>
            <div className="px-1.5 py-0.5 rounded" style={{ background: r.status === 'Live' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)', fontSize: '4.5px', color: r.status === 'Live' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }}>{r.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublishingScreen() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col gap-1.5 py-2 px-2 flex-shrink-0" style={{ width: '44px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-7 h-7 rounded-md mx-auto mb-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="w-6 h-6 rounded mx-auto" style={{ background: i === 3 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      <div className="flex-1 p-3 overflow-hidden">
        <div style={{ fontSize: '6px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>PUBLISHING</div>
        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
          {[['Works Registered','4'],['Publishing Balance','$312.40']].map(([l,v]) => (
            <div key={l} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: '4.5px', color: 'rgba(255,255,255,0.35)', marginBottom: '2px' }}>{l}</div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: '#fff' }}>{v}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-2 mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.4)', marginBottom: '5px' }}>PRO Registration Check</div>
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="flex-1" style={{ fontSize: '5.5px', color: 'rgba(255,255,255,0.5)' }}>Night Drive</div>
            <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.25)' }}>Title ▾</div>
          </div>
        </div>
        {[{t:'Night Drive',p:'BMI',s:'Registered'},{t:'Horizon',p:'ASCAP',s:'Registered'},{t:'Solstice',p:'—',s:'Pending'}].map(r => (
          <div key={r.t} className="flex items-center gap-2 px-1.5 py-1 rounded mb-0.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: '6px', fontWeight: 500, color: 'rgba(255,255,255,0.6)', flex: 1 }}>{r.t}</div>
            <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.3)' }}>{r.p}</div>
            <div style={{ fontSize: '5px', color: r.s === 'Registered' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)' }}>{r.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessagesScreen() {
  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex flex-col gap-1.5 py-2 px-2 flex-shrink-0" style={{ width: '44px', background: '#111', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="w-7 h-7 rounded-md mx-auto mb-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="w-6 h-6 rounded mx-auto" style={{ background: i === 4 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>
      {/* Conversation list */}
      <div className="flex flex-col" style={{ width: '80px', borderRight: '1px solid rgba(255,255,255,0.05)', background: '#0d0d0d' }}>
        <div style={{ fontSize: '6px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', padding: '8px 6px 4px' }}>MESSAGES</div>
        {[{n:'Elevate',m:'Welcome to Elevate!',u:2},{n:'Jake P.',m:'Sent the stems 🎵',u:0},{n:'Maya L.',m:'Thanks for collab',u:1}].map((c,i) => (
          <div key={c.n} className="flex items-center gap-1.5 px-2 py-1.5" style={{ background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: '5.5px', fontWeight: 600, color: '#fff', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.n}</div>
              <div style={{ fontSize: '4.5px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.m}</div>
            </div>
            {c.u > 0 && <div className="w-3 h-3 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.8)', fontSize: '4px', color: '#000', fontWeight: 700 }}>{c.u}</div>}
          </div>
        ))}
      </div>
      {/* Chat area */}
      <div className="flex-1 flex flex-col p-2 gap-1.5">
        <div className="flex items-center gap-1.5 pb-1.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-4 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
          <div style={{ fontSize: '6px', fontWeight: 600, color: '#fff' }}>Elevate</div>
        </div>
        <div className="flex-1 flex flex-col gap-1 justify-end">
          <div className="self-start rounded-lg px-2 py-1 max-w-[80%]" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '5px', color: 'rgba(255,255,255,0.8)' }}>Welcome to Elevate! 🎉</div>
          <div className="self-start rounded-lg px-2 py-1 max-w-[80%]" style={{ background: 'rgba(255,255,255,0.1)', fontSize: '5px', color: 'rgba(255,255,255,0.8)' }}>Your profile is live. Start releasing today.</div>
          <div className="self-end rounded-lg px-2 py-1 max-w-[80%]" style={{ background: 'rgba(255,255,255,0.2)', fontSize: '5px', color: '#fff' }}>Thanks, excited to get started!</div>
        </div>
        <div className="flex items-center gap-1 rounded-md px-2 py-1" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.3)', flex: 1 }}>Message Elevate…</div>
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.2)' }}>↑</div>
        </div>
      </div>
    </div>
  );
}

const SCREEN_MAP: Record<string, () => JSX.Element> = {
  analytics: AnalyticsScreen,
  releases: ReleasesScreen,
  publishing: PublishingScreen,
  messages: MessagesScreen,
};

export function MobileAppSection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.2);

  // Mobile animation state
  const [typedChars, setTypedChars] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [cursorOn, setCursorOn] = useState(true);

  // Split layout state
  const [showMobileContent, setShowMobileContent] = useState(false);
  const [showDesktopContent, setShowDesktopContent] = useState(false);
  const [showDesktopCard, setShowDesktopCard] = useState(false);

  // Desktop feature cycling
  const [activeFeature, setActiveFeature] = useState(0);
  const [screenVisible, setScreenVisible] = useState(true);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    const t1 = setTimeout(() => setShowMobileContent(true), 400);
    const t2 = setTimeout(() => setShowDesktopContent(true), 800);
    const t3 = setTimeout(() => setShowDesktopCard(true), 2200);

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
      return () => clearInterval(typeInterval);
    }, 1200);

    // Start cycling features after desktop content is visible
    const cycleStart = setTimeout(() => {
      cycleRef.current = setInterval(() => {
        setScreenVisible(false);
        setTimeout(() => {
          setActiveFeature(f => (f + 1) % DESKTOP_FEATURES.length);
          setScreenVisible(true);
        }, 350);
      }, 3200);
    }, 3000);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(typeTimeout); clearTimeout(cycleStart);
      clearInterval(cursorInterval);
      if (cycleRef.current) clearInterval(cycleRef.current);
    };
  }, [isVisible]);

  const typedText = SEARCH_WORD.slice(0, typedChars);

  return (
    <section ref={sectionRef} id="download" className="relative py-16 md:py-24 px-4 md:px-6 overflow-hidden" style={{ background: '#000' }}>
      <div className="max-w-6xl mx-auto" style={isVisible ? { animation: 'liftIn 0.75s cubic-bezier(0.22,1,0.36,1) forwards' } : { opacity: 0 }}>
        {/* Outer white card — expands then splits */}
        <div className="rounded-3xl md:rounded-[2.5rem] shadow-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg,#fff 0%,#f5f5f5 100%)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div className={`flex flex-col md:flex-row transition-all duration-700 ease-in-out`} style={{ minHeight: '560px' }}>

            {/* ── LEFT: Mobile ── */}
            <div
              className="flex-1 flex flex-col items-center justify-center p-8 md:p-14"
              style={{
                opacity: showMobileContent ? 1 : 0,
                transform: showMobileContent ? 'none' : 'translateX(-20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                borderRight: showMobileContent ? '1px solid rgba(0,0,0,0.07)' : 'none',
              }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-10 leading-tight" style={{ fontFamily: 'Fraunces, serif', color: '#000', letterSpacing: '-0.02em' }}>
                Fully Integrated<br />With Mobile
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Phone mockup */}
                <div className="relative flex-shrink-0" style={{ width: '180px' }}>
                  <div className="absolute top-24 -right-0.5 w-1 h-10 rounded-r-sm" style={{ background: '#2a2a2a' }} />
                  <div className="absolute top-16 -left-0.5 w-1 h-7 rounded-l-sm" style={{ background: '#2a2a2a' }} />
                  <div className="absolute top-28 -left-0.5 w-1 h-7 rounded-l-sm" style={{ background: '#2a2a2a' }} />
                  <div className="relative rounded-[2.4rem] overflow-hidden" style={{ width: '180px', height: '360px', background: '#1a1a1a', border: '2px solid #333', boxShadow: '0 32px 64px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.07)' }}>
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-3.5 rounded-full z-10" style={{ background: '#1a1a1a' }} />
                    <div className="absolute inset-[2px] rounded-[2.2rem] overflow-hidden" style={{ background: '#f2f2f7' }}>
                      <div className="flex items-center justify-between px-5 pt-4 pb-1">
                        <span style={{ fontSize: '9px', fontWeight: 600, color: '#1a1a1a' }}>9:41</span>
                        <div className="flex items-center gap-1">
                          <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><rect x="0" y="2" width="2" height="6" rx="0.5" fill="#1a1a1a" opacity="0.4"/><rect x="3" y="1" width="2" height="7" rx="0.5" fill="#1a1a1a" opacity="0.6"/><rect x="6" y="0" width="2" height="8" rx="0.5" fill="#1a1a1a" opacity="0.8"/><rect x="9" y="0" width="2" height="8" rx="0.5" fill="#1a1a1a"/></svg>
                          <svg width="14" height="8" viewBox="0 0 14 8" fill="none"><rect x="0.5" y="0.5" width="11" height="7" rx="2" stroke="#1a1a1a" strokeOpacity="0.35"/><rect x="12" y="2.5" width="1.5" height="3" rx="0.75" fill="#1a1a1a" fillOpacity="0.4"/><rect x="1.5" y="1.5" width="8" height="5" rx="1.5" fill="#1a1a1a"/></svg>
                        </div>
                      </div>
                      <div className="px-4 pt-1">
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a1a1a', fontFamily: 'system-ui', marginBottom: '8px' }}>App Store</div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: '#e5e5ea' }}>
                          <svg width="10" height="10" viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="6" stroke="#8e8e93" strokeWidth="2.5"/><path d="M13.5 13.5L17 17" stroke="#8e8e93" strokeWidth="2.5" strokeLinecap="round"/></svg>
                          <span style={{ fontSize: '10px', color: typedChars > 0 ? '#1a1a1a' : '#8e8e93', fontFamily: 'system-ui' }}>
                            {typedChars > 0 ? typedText : 'Games, Apps, Stories…'}
                          </span>
                          {typedChars > 0 && typedChars < SEARCH_WORD.length && (
                            <span style={{ display: 'inline-block', width: '1.5px', height: '11px', background: '#007aff', opacity: cursorOn ? 1 : 0, marginLeft: '-2px', verticalAlign: 'middle' }} />
                          )}
                        </div>
                        <div style={{ opacity: showResults ? 1 : 0, transform: showResults ? 'none' : 'translateY(5px)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}>
                          {[
                            { label: 'Elevate', sub: 'Creator Platform', icon: true },
                            { label: 'Elevate — Brain Training', sub: 'Education', icon: false },
                            { label: 'Elevate Fitness', sub: 'Health & Fitness', icon: false },
                          ].map((r, i) => (
                            <div key={r.label} className="flex items-center gap-2.5 py-2" style={{ borderBottom: i < 2 ? '0.5px solid rgba(0,0,0,0.1)' : 'none' }}>
                              <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: r.icon ? '#000' : '#d1d5db', boxShadow: r.icon ? '0 2px 8px rgba(0,0,0,0.25)' : 'none' }}>
                                {r.icon && <img src="/elevate solid white logo ver.jpeg" alt="Elevate" style={{ width: '26px', height: '26px', objectFit: 'cover', borderRadius: '4px' }} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div style={{ fontSize: '9px', fontWeight: r.icon ? 600 : 500, color: '#1a1a1a', fontFamily: 'system-ui' }}>{r.label}</div>
                                <div style={{ fontSize: '7px', color: '#8e8e93', fontFamily: 'system-ui' }}>{r.sub}</div>
                                {r.icon && (
                                  <div className="flex items-center gap-0.5 mt-0.5">
                                    {[1,2,3,4,5].map(s => <svg key={s} width="6" height="6" viewBox="0 0 20 20" fill="#ff9500"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                                  </div>
                                )}
                              </div>
                              <div className="px-2 py-1 rounded-full flex-shrink-0" style={{ background: '#e5e5ea', fontSize: '8px', fontWeight: 600, color: '#007aff', fontFamily: 'system-ui' }}>GET</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.25)' }} />
                  </div>
                </div>

                {/* QR card */}
                <div style={{ opacity: showQR ? 1 : 0, transform: showQR ? 'translateX(0) scale(1)' : 'translateX(-16px) scale(0.96)', transition: 'opacity 0.55s cubic-bezier(0.34,1.2,0.64,1), transform 0.55s cubic-bezier(0.34,1.2,0.64,1)' }}>
                  <div className="p-5 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', minWidth: '170px' }}>
                    <div className="text-center mb-3">
                      <p style={{ fontSize: '10px', color: '#555', fontFamily: 'system-ui' }}>Scan to download</p>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#000', fontFamily: 'Fraunces, serif', marginTop: '2px' }}>Elevate</p>
                    </div>
                    <div className="w-28 h-28 mx-auto mb-4">
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
                    <div className="flex flex-col gap-1.5">
                      <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl transition-transform duration-200 hover:scale-[1.02]" style={{ background: '#000' }}>
                        <svg width="12" height="15" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                        <div><div style={{ color: '#fff', fontSize: '7px', lineHeight: 1, opacity: 0.75 }}>Download on the</div><div style={{ color: '#fff', fontSize: '11px', fontWeight: 600, lineHeight: 1.3 }}>App Store</div></div>
                      </a>
                      <a href="https://play.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-xl transition-transform duration-200 hover:scale-[1.02]" style={{ background: '#000' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M3.5 1.5L14 12 3.5 22.5" stroke="#EA4335" strokeWidth="2" strokeLinecap="round"/><path d="M3.5 1.5L20 10.5" stroke="#FBBC04" strokeWidth="2" strokeLinecap="round"/><path d="M3.5 22.5L20 13.5" stroke="#34A853" strokeWidth="2" strokeLinecap="round"/><path d="M20 10.5L20 13.5" stroke="#4285F4" strokeWidth="2" strokeLinecap="round"/></svg>
                        <div><div style={{ color: '#fff', fontSize: '7px', lineHeight: 1, opacity: 0.75 }}>GET IT ON</div><div style={{ color: '#fff', fontSize: '11px', fontWeight: 600, lineHeight: 1.3 }}>Google Play</div></div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Desktop ── */}
            <div
              className="flex-1 flex flex-col items-center justify-center p-8 md:p-14"
              style={{
                opacity: showDesktopContent ? 1 : 0,
                transform: showDesktopContent ? 'none' : 'translateX(20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                background: 'linear-gradient(135deg,#f8f8f8 0%,#efefef 100%)',
              }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 leading-tight" style={{ fontFamily: 'Fraunces, serif', color: '#000', letterSpacing: '-0.02em' }}>
                Fully Integrated<br />With Desktop
              </h2>

              {/* Feature label + desc cycling */}
              <div className="text-center mb-6" style={{ minHeight: '40px' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: '#000', opacity: 0.8 }}>
                  {DESKTOP_FEATURES[activeFeature].label}
                </p>
                <p className="text-xs" style={{ color: '#555' }}>
                  {DESKTOP_FEATURES[activeFeature].desc}
                </p>
                {/* Dot indicators */}
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  {DESKTOP_FEATURES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setScreenVisible(false); setTimeout(() => { setActiveFeature(i); setScreenVisible(true); }, 300); }}
                      className="rounded-full transition-all duration-300"
                      style={{ width: i === activeFeature ? '16px' : '6px', height: '6px', background: i === activeFeature ? '#000' : 'rgba(0,0,0,0.2)' }}
                    />
                  ))}
                </div>
              </div>

              {/* MacBook mockup */}
              <div className="flex flex-col items-center gap-5">
                <div className="relative" style={{ width: '320px' }}>
                  {/* Screen lid */}
                  <div className="relative rounded-t-xl overflow-hidden" style={{ width: '320px', height: '210px', background: '#1a1a1a', border: '2px solid #2a2a2a', borderBottom: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-3 rounded-b-lg z-10" style={{ background: '#1a1a1a' }} />
                    {/* Screen content */}
                    <div className="absolute inset-[3px] rounded-lg overflow-hidden" style={{ background: '#0a0a0a' }}>
                      {/* Window chrome */}
                      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0" style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: '#ff5f57' }} />
                          <div className="w-2 h-2 rounded-full" style={{ background: '#febc2e' }} />
                          <div className="w-2 h-2 rounded-full" style={{ background: '#28c840' }} />
                        </div>
                        <div className="flex items-center gap-2 px-3 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <svg width="7" height="7" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/><path d="M10.5 10.5L14 14" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          <span style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.3)', fontFamily: 'system-ui' }}>app.sayelevate.com</span>
                        </div>
                        <div style={{ width: '36px' }} />
                      </div>
                      {/* Cycling dashboard screen */}
                      <div
                        className="h-full overflow-hidden"
                        style={{
                          opacity: screenVisible ? 1 : 0,
                          transform: screenVisible ? 'translateY(0)' : 'translateY(6px)',
                          transition: 'opacity 0.3s ease, transform 0.3s ease',
                        }}
                      >
                        {(() => {
                          const Screen = SCREEN_MAP[DESKTOP_FEATURES[activeFeature].screen];
                          return <Screen />;
                        })()}
                      </div>
                    </div>
                  </div>
                  {/* Base/hinge */}
                  <div style={{ width: '320px', height: '8px', background: 'linear-gradient(180deg,#2a2a2a 0%,#1a1a1a 100%)', borderLeft: '2px solid #2a2a2a', borderRight: '2px solid #2a2a2a', borderBottom: '2px solid #1a1a1a' }} />
                  <div className="mx-auto" style={{ width: '280px', height: '5px', background: '#222', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }} />
                  <div className="mx-auto mt-px" style={{ width: '240px', height: '3px', background: '#1a1a1a', borderRadius: '0 0 6px 6px' }} />
                </div>

                {/* Download buttons — pop in together */}
                <div
                  className="flex flex-wrap items-center justify-center gap-3"
                  style={{ opacity: showDesktopCard ? 1 : 0, transform: showDesktopCard ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)', transition: 'opacity 0.55s cubic-bezier(0.34,1.2,0.64,1), transform 0.55s cubic-bezier(0.34,1.2,0.64,1)' }}
                >
                  {/* macOS */}
                  <a
                    href="#"
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
                    style={{ background: '#000', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', textDecoration: 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', lineHeight: 1, fontFamily: 'system-ui' }}>Download for</div>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, lineHeight: 1.3, fontFamily: 'system-ui' }}>macOS</div>
                    </div>
                  </a>
                  {/* Windows */}
                  <a
                    href="#"
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-200 hover:scale-[1.03] hover:shadow-xl"
                    style={{ background: '#000', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', textDecoration: 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.549H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/></svg>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '8px', lineHeight: 1, fontFamily: 'system-ui' }}>Download for</div>
                      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700, lineHeight: 1.3, fontFamily: 'system-ui' }}>Windows</div>
                    </div>
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
