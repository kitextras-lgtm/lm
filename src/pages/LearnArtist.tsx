import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !fired.current) {
        fired.current = true;
        setInView(true);
      }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useEnteredDelay(inView: boolean, delay = 900) {
  const [entered, setEntered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  useEffect(() => {
    if (inView && !firedRef.current) {
      firedRef.current = true;
      timerRef.current = setTimeout(() => setEntered(true), delay > 900 ? 0 : 60);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [inView, delay]);
  return entered;
}

interface ArtistFeature {
  tag: string;
  title: string;
  description: string;
  visual: 'distribution' | 'growth' | 'royalty' | 'sync' | 'strategy' | 'support';
}

const artistFeatures: ArtistFeature[] = [
  {
    tag: 'Distribution',
    title: 'Strategic\nDistribution',
    description: 'Distribution is just the starting point. We provide flexibility along with strategic guidance and industry-leading revenue splits.',
    visual: 'distribution'
  },
  {
    tag: 'Marketing',
    title: 'Superior\nGrowth',
    description: "Marketing comes naturally at Elevate. We don't just support you. We invest in you.",
    visual: 'growth'
  },
  {
    tag: 'Royalties',
    title: 'Hidden\nGems',
    description: "There's more to your royalties than what traditional distributors collect. Elevate uncovers, manages, and safeguards your publishing income, making sure no label or third party profits from your work without you.",
    visual: 'royalty'
  },
  {
    tag: 'Sync',
    title: 'Your music,\non screen',
    description: 'Strategic music placement across film, TV, gaming, and advertising, designed to generate both exposure and revenue.',
    visual: 'sync'
  },
  {
    tag: 'Strategy',
    title: 'A roadmap\nbuilt for you',
    description: 'Personalized, long term planning for releases, branding, and positioning, built around where you should be, not just your next drop.',
    visual: 'strategy'
  },
  {
    tag: 'Support',
    title: 'Real human,\nreal support',
    description: 'Get access to real human support at all times.',
    visual: 'support'
  }
];
// Support is already last — no reordering needed for artist page (no middleman feature)

const artistFAQ = [
  {
    question: "What kind of artists does Elevate work with?",
    answer: "Elevate's vetting process is very strict, and it is strictly invite only as of now. We work with any genre."
  },
  {
    question: "How does Elevate help with music distribution?",
    answer: "We provide global distribution to all major platforms including Spotify, Apple Music, TikTok, and more. Our team handles the technical aspects while you focus on creating music, ensuring your releases reach audiences worldwide."
  },
  {
    question: "Do I retain ownership of my music?",
    answer: "Yes, you maintain 100% ownership of your music and masters. We're here to support your career, not take control of your creative work. Our agreements are designed to be artist-friendly."
  },
  {
    question: "What makes Elevate different from other distributors?",
    answer: "Unlike traditional distributors, we invest in your growth with marketing support, career strategy, and sync opportunities. We're partners in your success, not just a distribution service."
  },
  {
    question: "Do I have to pay for the services?",
    answer: "No, you do not need to pay a single dollar to access our services, as our distribution is strictly invite only and hand picked."
  },
  {
    question: "Can I still work with other labels or distributors?",
    answer: "Yes, we believe in flexibility. You can work with other partners while collaborating with Elevate. We're here to add value to your career, not restrict your opportunities."
  }
];

// --- Visual Mockup Components ---

function DistributionVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full" style={{ background: '#e5e7eb' }} />
        <div>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Your Release</div>
          <div className="text-xs" style={{ color: '#555' }}>Distributed globally</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {/* Spotify */}
        <div className="text-center">
          <div className="w-full aspect-square rounded-xl mb-1.5 flex items-center justify-center" style={{ background: '#f0f0f0' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="12" cy="12" r="12" fill="#1DB954"/>
              <path d="M17.5 10.5c-3.1-1.8-8.2-2-11.2-1.1-.5.1-.8.6-.7 1.1.1.5.6.8 1.1.7 2.6-.8 7.1-.6 9.8 1 .4.3 1 .1 1.3-.3.3-.5.1-1.1-.3-1.4zm-.4 2.9c-.3.4-.8.5-1.2.3-2.6-1.6-6.5-2-9.5-1.1-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 3.4-1 7.8-.5 10.7 1.3.4.2.5.7.3 1.1l.2-.1zm-1.3 2.8c-.2.3-.7.4-1 .2-2.2-1.4-5-1.7-8.3-.9-.3.1-.7-.1-.8-.4-.1-.3.1-.7.4-.8 3.6-.8 6.7-.5 9.2 1 .3.2.4.6.2.9h.3z" fill="white"/>
            </svg>
          </div>
          <span className="text-[10px]" style={{ color: '#555' }}>Spotify</span>
        </div>
        {/* Apple Music */}
        <div className="text-center">
          <div className="w-full aspect-square rounded-xl mb-1.5 flex items-center justify-center" style={{ background: '#f0f0f0' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FC3C44"/>
              <path d="M15.5 7.5c.1.8-.2 1.6-.7 2.1-.5.6-1.3.9-2 .8-.1-.7.2-1.5.7-2 .5-.6 1.3-1 2-.9zm1.8 8.2c-.3.7-.6 1.3-1.1 1.8-.4.5-.9.9-1.5.9-.6 0-.9-.4-1.7-.4-.8 0-1.1.4-1.7.4-.6 0-1.1-.4-1.5-.9-1.1-1.3-1.8-3.3-1.8-5.2 0-2.3 1.5-3.5 3-3.5.7 0 1.4.5 1.9.5.5 0 1.3-.5 2.1-.5 1 0 2 .6 2.5 1.6-.9.5-1.5 1.4-1.5 2.5 0 1.2.7 2.2 1.7 2.7l-.4.1z" fill="white"/>
            </svg>
          </div>
          <span className="text-[10px]" style={{ color: '#555' }}>Apple</span>
        </div>
        {/* TikTok */}
        <div className="text-center">
          <div className="w-full aspect-square rounded-xl mb-1.5 flex items-center justify-center" style={{ background: '#f0f0f0' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="12" cy="12" r="12" fill="#010101"/>
              <path d="M16.5 8.5c-.8-.5-1.4-1.3-1.6-2.2h-1.8v8.5c0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6s.7-1.6 1.6-1.6c.2 0 .3 0 .5.1V11c-.2 0-.3 0-.5 0-1.9 0-3.4 1.5-3.4 3.4s1.5 3.4 3.4 3.4 3.4-1.5 3.4-3.4V10c.7.5 1.5.8 2.4.8V9c-.8 0-1.5-.2-2.2-.5h-.6z" fill="white"/>
            </svg>
          </div>
          <span className="text-[10px]" style={{ color: '#555' }}>TikTok</span>
        </div>
        {/* YouTube */}
        <div className="text-center">
          <div className="w-full aspect-square rounded-xl mb-1.5 flex items-center justify-center" style={{ background: '#f0f0f0' }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FF0000"/>
              <path d="M18.5 9.5s-.2-1.2-.8-1.7c-.7-.8-1.5-.8-1.9-.8C13.7 7 12 7 12 7s-1.7 0-3.8.1c-.4 0-1.2.1-1.9.8-.6.5-.8 1.7-.8 1.7S5.3 10.8 5.3 12v1.1c0 1.2.2 2.5.2 2.5s.2 1.2.8 1.7c.7.8 1.7.7 2.1.8C9.7 18 12 18 12 18s1.7 0 3.8-.1c.4 0 1.2-.1 1.9-.8.6-.5.8-1.7.8-1.7s.2-1.2.2-2.5V12c0-1.2-.2-2.5-.2-2.5zm-9.5 5V9.5l5.2 2.5-5.2 2.5z" fill="white"/>
            </svg>
          </div>
          <span className="text-[10px]" style={{ color: '#555' }}>YouTube</span>
        </div>
      </div>
      <div className="px-3 py-2.5 rounded-xl" style={{ background: '#f0f0f0' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: '#555' }}>Status</span>
          <span className="text-xs font-bold" style={{ color: '#111' }}>Optimized</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
          <div className="h-full rounded-full" style={{ width: '92%', background: '#111' }} />
        </div>
      </div>
    </div>
  );
}

function GrowthVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Growth Analytics</div>
      <div className="text-xs mb-4" style={{ color: '#555' }}>Last 30 days</div>
      <div className="flex items-end gap-1.5 mb-4" style={{ height: '80px' }}>
        {[35, 42, 38, 55, 48, 62, 58, 72, 68, 85, 78, 95].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i >= 10 ? '#111' : '#d1d5db' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs" style={{ color: '#555' }}>Monthly Listeners</div>
          <div className="text-lg font-bold" style={{ color: '#111' }}>+247%</div>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: '#dcfce7', color: '#166534' }}>
          Trending Up
        </div>
      </div>
    </div>
  );
}

function RoyaltyVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [revealed, setRevealed] = useState<number>(-1);
  const [displayTotal, setDisplayTotal] = useState(0);

  const streams = [
    { label: 'Publishing',  sub: 'PRO royalties · sync',     amount: 1950 },
    { label: 'Sync',        sub: 'Film · TV · Ads',          amount: 3100 },
    { label: 'Other',       sub: 'Merch · live · licensing', amount: 1000 },
  ];

  useEffect(() => {
    if (!entered) return;
    streams.forEach((_, i) => {
      setTimeout(() => setRevealed(i), i * 700 + 300);
    });
  }, [entered]);

  const total = streams.slice(0, revealed + 1).reduce((sum, s) => sum + s.amount, 0);

  useEffect(() => {
    if (total === 0) return;
    const start = displayTotal;
    const end = total;
    const duration = 500;
    const startTime = performance.now();
    const raf = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayTotal(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [total]);

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <style>{`
        @keyframes pingRoy { 0%{transform:scale(1);opacity:1} 70%{transform:scale(2.4);opacity:0} 100%{transform:scale(2.4);opacity:0} }
        @keyframes revealSlide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes countUp { from{opacity:0.4} to{opacity:1} }
      `}</style>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Hidden Revenue</div>
      <div className="text-xs mb-4" style={{ color: '#555' }}>Streams you didn't know about</div>
      <div className="space-y-2.5 mb-4">
        {streams.map((s, i) => {
          const isRevealed = revealed >= i;
          return (
            <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
              {/* Blacked-out overlay — fades away on reveal */}
              <div style={{
                position: 'absolute', inset: 0, background: '#111', borderRadius: '12px',
                opacity: isRevealed ? 0 : 1,
                transition: 'opacity 0.55s ease',
                pointerEvents: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="6" width="10" height="7" rx="1.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2"/>
                  <path d="M4 6V4.5a3 3 0 016 0V6" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              {/* Ping ring on reveal */}
              {isRevealed && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '12px', border: '2px solid #111', animation: 'pingRoy 0.65s ease-out 1 forwards', pointerEvents: 'none' }} />
              )}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#e5e7eb' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="4.5" stroke="#555" strokeWidth="1.2"/>
                  <path d="M6 3.5v2.5l1.5 1.5" stroke="#555" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold" style={{ color: '#111' }}>{s.label}</div>
                <div className="text-[10px]" style={{ color: '#555' }}>{s.sub}</div>
              </div>
              <span className="text-xs font-bold" style={{ color: '#111' }}>
                ${s.amount.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
        style={{ background: '#111', opacity: revealed >= 0 ? 1 : 0, transition: 'opacity 0.5s ease' }}>
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Unlocked so far</span>
        <span className="text-sm font-bold" style={{ color: '#fff' }}>
          ${displayTotal.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function SyncVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Sync Opportunities</div>
      <div className="space-y-3">
        {[
          { type: 'Film', title: 'Netflix Original Series', status: 'Placed', fee: '$5,000' },
          { type: 'Ad', title: 'Nike Campaign', status: 'In Review', fee: '$8,500' },
          { type: 'Game', title: 'EA Sports Title', status: 'Matched', fee: '$3,200' },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#e5e7eb', color: '#555' }}>
              {item.type[0]}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium" style={{ color: '#111' }}>{item.title}</div>
              <div className="text-[10px]" style={{ color: '#555' }}>{item.status}</div>
            </div>
            <span className="text-xs font-bold" style={{ color: '#111' }}>{item.fee}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategyVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Release Calendar</div>
      <div className="space-y-3">
        {[
          { date: 'Mar 15', title: 'Single Drop', desc: 'Pre-save campaign live', done: true },
          { date: 'Apr 2', title: 'Music Video', desc: 'YouTube premiere scheduled', done: true },
          { date: 'May 10', title: 'EP Release', desc: 'Full rollout strategy', done: false },
          { date: 'Jun 20', title: 'Tour Announce', desc: 'Venue partnerships locked', done: false },
        ].map((item) => (
          <div key={item.date} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full" style={{ background: item.done ? '#111' : '#d1d5db', border: '2px solid ' + (item.done ? '#111' : '#d1d5db') }} />
              <div className="w-0.5 h-6" style={{ background: '#e5e7eb' }} />
            </div>
            <div className="flex-1 -mt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: '#111' }}>{item.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: item.done ? '#dcfce7' : '#f3f4f6', color: item.done ? '#166534' : '#444' }}>
                  {item.date}
                </span>
              </div>
              <div className="text-[11px]" style={{ color: '#555' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportVisual() {
  const [showReply, setShowReply] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [entered, setEntered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setEntered(true); obs.disconnect(); }
    }, { threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!entered) return;
    const t1 = setTimeout(() => setShowReply(true), 600);
    const t2 = setTimeout(() => setShowStatus(true), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [entered]);
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>Priority Support</div>
      <div className="space-y-3">
        <div className="flex gap-2 justify-end"
          style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s' }}>
          <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs max-w-[80%]" style={{ background: '#111', color: '#fff' }}>
            Hey! I need help with my upcoming release strategy.
          </div>
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#e5e7eb', color: '#555' }}>A</div>
        </div>
        <div className="flex gap-2"
          style={{ opacity: showReply ? 1 : 0, transform: showReply ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden" style={{ background: '#111' }}><img src="/elevate solid white logo ver.jpeg" alt="Elevate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs" style={{ background: '#f0f0f0', color: '#333' }}>
            Of course! I've reviewed your analytics. Let me put together a custom rollout plan. Give me 10 minutes.
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1"
          style={{ opacity: showStatus ? 1 : 0, transition: 'opacity 0.5s ease 0.3s' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.33)' }} />
          <span className="text-[10px]" style={{ color: '#555' }}>Avg. response time: &lt;5 min</span>
        </div>
      </div>
    </div>
  );
}

function ArtistFeatureVisual({ type }: { type: ArtistFeature['visual'] }) {
  switch (type) {
    case 'distribution': return <DistributionVisual />;
    case 'growth': return <GrowthVisual />;
    case 'royalty': return <RoyaltyVisual />;
    case 'sync': return <SyncVisual />;
    case 'strategy': return <StrategyVisual />;
    case 'support': return <SupportVisual />;
    default: return null;
  }
}

function FeatureSection({ feature, index }: { feature: ArtistFeature; index: number }) {
  const { ref, isVisible } = useScrollAnimation(0.15);
  const isReversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`}
    >
      <div className={`flex-1 w-full scroll-hidden${isVisible ? ` ${isReversed ? 'scroll-reveal-right' : 'scroll-reveal-left'}` : ''}`}>
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#888' }} />
          <span className="text-xs font-medium" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#999' }}>
            {feature.tag}
          </span>
        </div>

        <h3
          className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 leading-tight whitespace-pre-line"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff', letterSpacing: '-0.02em' }}
        >
          {feature.title}
        </h3>

        <p
          className="text-base leading-relaxed max-w-md"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(204, 204, 204)', fontWeight: 400 }}
        >
          {feature.description}
        </p>
      </div>

      <div className={`flex-1 w-full max-w-md md:max-w-none scroll-hidden${isVisible ? ` ${isReversed ? 'scroll-reveal-left' : 'scroll-reveal-right'}` : ''}`} style={{ isolation: 'isolate' }}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '16px', backgroundColor: '#000000' }}
        >
          <ArtistFeatureVisual type={feature.visual} />
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function LearnArtist() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation(0.1);
  const { ref: faqHeaderRef, isVisible: faqHeaderVisible } = useScrollAnimation(0.1);
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation(0.1);

  const handleArtistSignup = () => {
    navigate('/signup?source=artist');
  };

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="bg-black min-h-screen">
      <Header />
      
      {/* Hero */}
      <section className="relative pt-2 md:pt-8 pb-20 px-4 md:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div
            ref={heroRef}
            className={`text-center mb-20 md:mb-28 scroll-hidden${heroVisible ? ' scroll-blur-emerge' : ''}`}
          >
            <h1 
              className="text-4xl md:text-5xl lg:text-6xl font-normal leading-snug"
              style={{ fontFamily: 'Fraunces, serif', color: '#ffffff', letterSpacing: '-0.02em' }}
            >
              <span style={{ fontWeight: 600 }}>Artist</span> Services
            </h1>
            <p 
              className="text-base md:text-lg mt-6 max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(153, 153, 153)', lineHeight: '1.7' }}
            >
              We offer unique benefits found nowhere else regarding to distribution platforms. 
              You are not required to leave your current distributor to utilize our services.
            </p>
          </div>

          {/* Feature Sections - Alternating Split Layout */}
          <div className="space-y-24 md:space-y-32">
            {artistFeatures.map((feature, index) => (
              <FeatureSection key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-black py-16 md:py-28 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div
            ref={faqHeaderRef}
            className={`text-center mb-12 md:mb-20 scroll-hidden${faqHeaderVisible ? ' scroll-blur-emerge' : ''}`}
          >
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-normal mb-4"
              style={{ fontFamily: 'Fraunces, serif', color: '#ffffff', letterSpacing: '-0.02em' }}
            >
              Frequently Asked <span style={{ fontWeight: 600 }}>Questions</span>
            </h2>
            <p 
              className="text-base md:text-lg"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(153, 153, 153)' }}
            >
              Everything you need to know about joining Elevate as an artist
            </p>
          </div>

          <div className="space-y-0">
            {artistFAQ.map((item, index) => (
              <FAQItem key={index} item={item} index={index} isOpen={openItems.includes(index)} onToggle={() => toggleItem(index)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div
        ref={ctaRef}
        className={`max-w-7xl mx-auto px-4 md:px-6 pb-24 scroll-hidden${ctaVisible ? ' scroll-reveal-up' : ''}`}
      >
        <div className="text-center">
          <button
            onClick={handleArtistSignup}
            className="group relative w-full sm:w-auto px-12 md:px-16 py-4 md:py-5 rounded-xl text-base md:text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              color: '#000000',
              boxShadow: '0 4px 24px rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            Sign up as an Artist
          </button>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ item, index, isOpen, onToggle }: { item: { question: string; answer: string }; index: number; isOpen: boolean; onToggle: () => void }) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <div
      ref={ref}
      className={`scroll-hidden${isVisible ? ' scroll-reveal-up' : ''}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="py-1"
        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between text-left py-5 focus:outline-none group"
        >
          <h3 
            className="text-base md:text-lg font-medium pr-4 transition-colors duration-200 group-hover:text-white"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: isOpen ? '#ffffff' : '#cccccc' }}
          >
            {item.question}
          </h3>
          <div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
            style={{
              background: isOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.04)',
              border: '1px solid ' + (isOpen ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'),
            }}
          >
            {isOpen ? (
              <Minus className="w-4 h-4 text-gray-300" />
            ) : (
              <Plus className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </button>
        
        <div
          style={{
            display: 'grid',
            gridTemplateRows: isOpen ? '1fr' : '0fr',
            opacity: isOpen ? 1 : 0,
            transition: 'grid-template-rows 0.4s ease, opacity 0.3s ease',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            <div className="pb-5">
              <p 
                className="text-base leading-relaxed max-w-3xl"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(153, 153, 153)' }}
              >
                {item.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
