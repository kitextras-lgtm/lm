import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function useCountUp(target: number, duration = 1400, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

function useEnteredDelay(inView: boolean, delay = 900) {
  const [entered, setEntered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  useEffect(() => {
    if (inView && !firedRef.current) {
      firedRef.current = true;
      timerRef.current = setTimeout(() => setEntered(true), delay);
    }
    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); }
    };
  }, [inView, delay]);
  return entered;
}

function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const fired = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || fired.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired.current) {
          fired.current = true;
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

interface FeatureItem {
  tag: string;
  title: string;
  description: string;
  visual: 'distribution' | 'growth' | 'royalty' | 'sync' | 'strategy' | 'support' |
          'copyright' | 'monetization' | 'licensing' | 'brand-partnerships' | 'content-strategy' | 'creator-support' |
          'viral' | 'sponsorships' | 'consulting' | 'marketplace';
}

// --- Visual Mockup Components ---

function DistributionVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const platforms = ['Spotify', 'Apple', 'TikTok', 'YouTube'];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="flex items-center gap-3 mb-4" style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
        <div className="w-10 h-10 rounded-full" style={{ background: '#e5e7eb' }} />
        <div>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Your Release</div>
          <div className="text-xs" style={{ color: '#888' }}>Distributed globally</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {platforms.map((p, i) => (
          <div key={p} className="text-center" style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(12px)', transition: `opacity 0.5s ease ${0.1 + i * 0.08}s, transform 0.5s ease ${0.1 + i * 0.08}s` }}>
            <div className="w-full aspect-square rounded-xl mb-1.5 flex items-center justify-center" style={{ background: '#f0f0f0' }}>
              <span className="text-xs font-medium" style={{ color: '#555' }}>{p[0]}</span>
            </div>
            <span className="text-[10px]" style={{ color: '#888' }}>{p}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.45s' }}>
        <span className="text-xs font-medium" style={{ color: '#555' }}>Revenue Split</span>
        <span className="text-sm font-bold" style={{ color: '#111' }}>Industry Leading</span>
      </div>
    </div>
  );
}

function GrowthVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const bars = [35, 42, 38, 55, 48, 62, 58, 72, 68, 85, 78, 95];
  const count = useCountUp(247, 1600, entered);
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Growth Analytics</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>Last 30 days</div>
      <div className="flex items-end gap-1.5 mb-4" style={{ height: '80px' }}>
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm" style={{ height: entered ? `${h}%` : '0%', background: i >= 10 ? '#111' : '#d1d5db', transition: `height 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.05}s` }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs" style={{ color: '#888' }}>Monthly Listeners</div>
          <div className="text-lg font-bold" style={{ color: '#111' }}>+{count}%</div>
        </div>
        <div className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: '#f0f0f0', color: '#111', opacity: entered ? 1 : 0, transition: 'opacity 0.6s ease 0.8s' }}>
          Trending Up
        </div>
      </div>
    </div>
  );
}

function RoyaltyVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const total = useCountUp(9330, 1800, entered);
  const rows = [
    { label: 'Streaming', amount: '$4,280', pct: 85 },
    { label: 'Publishing', amount: '$1,950', pct: 65 },
    { label: 'Sync', amount: '$3,100', pct: 75 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Royalty Dashboard</div>
      <div className="space-y-3">
        {rows.map((item, i) => (
          <div key={item.label} style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateX(-8px)', transition: `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s` }}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: '#555' }}>{item.label}</span>
              <span className="font-semibold" style={{ color: '#111' }}>{item.amount}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ width: entered ? `${item.pct}%` : '0%', background: '#111', transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${0.2 + i * 0.15}s` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 flex justify-between items-center" style={{ borderTop: '1px solid #e5e7eb', opacity: entered ? 1 : 0, transition: 'opacity 0.6s ease 0.7s' }}>
        <span className="text-xs" style={{ color: '#888' }}>Total Collected</span>
        <span className="text-lg font-bold" style={{ color: '#111' }}>${total.toLocaleString()}</span>
      </div>
    </div>
  );
}

function SyncVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const items = [
    { type: 'Film', title: 'Netflix Original Series', status: 'Placed', fee: '$5,000' },
    { type: 'Ad', title: 'Nike Campaign', status: 'In Review', fee: '$8,500' },
    { type: 'Game', title: 'EA Sports Title', status: 'Matched', fee: '$3,200' },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Sync Opportunities</div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={item.title} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(10px)', transition: `opacity 0.5s ease ${i * 0.13}s, transform 0.5s ease ${i * 0.13}s` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#e5e7eb', color: '#555' }}>
              {item.type[0]}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium" style={{ color: '#111' }}>{item.title}</div>
              <div className="text-[10px]" style={{ color: '#888' }}>{item.status}</div>
            </div>
            <span className="text-xs font-bold" style={{ color: '#111' }}>{item.fee}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategyVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const milestones = [
    { date: 'Mar 15', title: 'Single Drop', desc: 'Pre-save campaign live', done: true },
    { date: 'Apr 2', title: 'Music Video', desc: 'YouTube premiere scheduled', done: true },
    { date: 'May 10', title: 'EP Release', desc: 'Full rollout strategy', done: false },
    { date: 'Jun 20', title: 'Tour Announce', desc: 'Venue partnerships locked', done: false },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Release Calendar</div>
      <div className="space-y-3">
        {milestones.map((item, i) => (
          <div key={item.date} className="flex items-start gap-3" style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateX(-10px)', transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s` }}>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full" style={{ background: item.done ? '#111' : '#d1d5db', border: '2px solid ' + (item.done ? '#111' : '#d1d5db'), transform: entered ? 'scale(1)' : 'scale(0)', transition: `transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.1 + i * 0.1}s` }} />
              <div className="w-0.5 h-6" style={{ background: '#e5e7eb' }} />
            </div>
            <div className="flex-1 -mt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: '#111' }}>{item.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: '#555' }}>{item.date}</span>
              </div>
              <div className="text-[11px]" style={{ color: '#888' }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [showTyping, setShowTyping] = useState(false);
  const [showReply, setShowReply] = useState(false);
  useEffect(() => {
    if (!entered) return;
    const t1 = setTimeout(() => setShowTyping(true), 200);
    const t2 = setTimeout(() => { setShowTyping(false); setShowReply(true); }, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [entered]);
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Priority Support</div>
      <div className="space-y-3">
        <div className="flex gap-2" style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s' }}>
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#111', color: '#fff' }}>E</div>
          <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs" style={{ background: '#f0f0f0', color: '#333' }}>Hey! I need help with my upcoming release strategy.</div>
        </div>
        {showTyping && (
          <div className="flex gap-2 justify-end items-end" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
            <div className="px-4 py-3 rounded-2xl rounded-tr-sm flex items-center gap-1" style={{ background: '#111' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fff', display: 'inline-block', animation: 'bounce 1s infinite 0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fff', display: 'inline-block', animation: 'bounce 1s infinite 150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#fff', display: 'inline-block', animation: 'bounce 1s infinite 300ms' }} />
            </div>
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#e5e7eb', color: '#555' }}>A</div>
          </div>
        )}
        {showReply && (
          <div className="flex gap-2 justify-end" style={{ animation: 'fadeInUp 0.4s ease forwards' }}>
            <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs" style={{ background: '#111', color: '#fff' }}>Of course! I've reviewed your analytics. Let me put together a custom rollout plan. Give me 10 minutes.</div>
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#e5e7eb', color: '#555' }}>A</div>
          </div>
        )}
        <div className="flex items-center gap-2 pt-1" style={{ opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.3s' }}>
          <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 5px #22c55e55' }} />
          <span className="text-[10px]" style={{ color: '#888' }}>Avg. response time: &lt;5 min</span>
        </div>
      </div>
    </div>
  );
}

function CopyrightVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [showAlert, setShowAlert] = useState(false);
  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => setShowAlert(true), 400);
    return () => clearTimeout(t);
  }, [entered]);
  const detected = useCountUp(1247, 1400, entered);
  const monetized = useCountUp(1180, 1400, entered);
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Content Detection</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>This month</div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Detected', display: detected.toLocaleString() },
          { label: 'Monetized', display: monetized.toLocaleString() },
          { label: 'Revenue', display: '$48.2K' },
        ].map((s, i) => (
          <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s` }}>
            <div className="text-sm font-bold" style={{ color: '#111' }}>{s.display}</div>
            <div className="text-[10px]" style={{ color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: '#f0f0f0', opacity: showAlert ? 1 : 0, transform: showAlert ? 'none' : 'translateY(6px)', transition: 'opacity 0.5s ease, transform 0.5s ease' }}>
        <div className="w-8 h-8 rounded-lg" style={{ background: '#e5e7eb' }} />
        <div className="flex-1">
          <div className="text-xs font-medium" style={{ color: '#111' }}>Unauthorized reupload detected</div>
          <div className="text-[10px]" style={{ color: '#888' }}>Claimed &amp; monetized automatically</div>
        </div>
        <span className="text-xs font-bold" style={{ color: '#111' }}>+$420</span>
      </div>
    </div>
  );
}

function MonetizationVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const total = useCountUp(37000, 1800, entered);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setPulse(p => (p + 1) % 3), 1800);
    return () => clearInterval(t);
  }, [entered]);
  const campaigns = [
    { brand: 'NovaTech', type: 'Sponsored Post', payout: '$12,000', delay: 0 },
    { brand: 'Luminary', type: 'Brand Deal', payout: '$18,500', delay: 0.1 },
    { brand: 'Apex Co.', type: 'Ambassador', payout: '$6,500', delay: 0.2 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold" style={{ color: '#111' }}>Exclusive Campaigns</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#111', opacity: inView ? 1 : 0, animation: inView ? 'pulse 2s infinite' : 'none' }} />
          <span className="text-[10px] font-medium" style={{ color: '#555' }}>Live</span>
        </div>
      </div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>Matched to your profile</div>
      <div className="space-y-2.5 mb-4">
        {campaigns.map((c, i) => (
          <div key={c.brand} className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: pulse === i ? '#111' : '#f0f0f0', transition: 'background 0.4s ease', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(10px)', transitionDelay: `${c.delay}s` }}>
            <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: pulse === i ? 'rgba(255,255,255,0.15)' : '#e5e7eb', transition: 'background 0.4s ease' }} />
            <div className="flex-1">
              <div className="text-xs font-semibold" style={{ color: pulse === i ? '#fff' : '#111', transition: 'color 0.4s ease' }}>{c.brand}</div>
              <div className="text-[10px]" style={{ color: pulse === i ? 'rgba(255,255,255,0.6)' : '#888', transition: 'color 0.4s ease' }}>{c.type}</div>
            </div>
            <span className="text-xs font-bold" style={{ color: pulse === i ? '#fff' : '#111', transition: 'color 0.4s ease' }}>{c.payout}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transition: 'opacity 0.6s ease 0.5s' }}>
        <span className="text-xs" style={{ color: '#555' }}>Total available</span>
        <span className="text-sm font-bold" style={{ color: '#111' }}>${total.toLocaleString()}</span>
      </div>
    </div>
  );
}

function LicensingVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const earned = useCountUp(13700, 1600, entered);
  const deals = [
    { platform: 'Viral Page', reach: '2.4M views', fee: '$3,500', pct: 72, delay: 0 },
    { platform: 'TV Network', reach: 'Prime time', fee: '$8,000', pct: 100, delay: 0.12 },
    { platform: 'News Outlet', reach: 'National', fee: '$2,200', pct: 48, delay: 0.24 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Licensing Deals</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>Your content, paying you</div>
      <div className="space-y-3 mb-4">
        {deals.map((d) => (
          <div key={d.platform} style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateX(-8px)', transition: `opacity 0.5s ease ${d.delay}s, transform 0.5s ease ${d.delay}s` }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold" style={{ background: '#e5e7eb', color: '#555' }}>{d.platform[0]}</div>
                <div>
                  <div className="text-xs font-medium" style={{ color: '#111' }}>{d.platform}</div>
                  <div className="text-[9px]" style={{ color: '#888' }}>{d.reach}</div>
                </div>
              </div>
              <span className="text-xs font-bold" style={{ color: '#111' }}>{d.fee}</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ width: entered ? `${d.pct}%` : '0%', background: '#111', transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${0.3 + d.delay}s` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transition: 'opacity 0.6s ease 0.6s' }}>
        <span className="text-xs" style={{ color: '#555' }}>Total earned</span>
        <span className="text-sm font-bold" style={{ color: '#111' }}>${earned.toLocaleString()}</span>
      </div>
    </div>
  );
}

function BrandPartnershipsVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [hovered, setHovered] = useState<number | null>(null);

  const cards = [
    { name: 'Pulse',   category: 'Newsletter',         deal: '$8,400' },
    { name: 'Vertex',  category: 'Education Platform', deal: '$12,000' },
    { name: 'Nexus',   category: 'VPN Provider',       deal: '$6,200' },
    { name: 'Quantum', category: 'Consumer App',       deal: '$9,800' },
    { name: 'Zenith',  category: 'E-Commerce',         deal: '$15,500' },
  ];

  const n = cards.length;
  const CARD_W = 72;
  const CARD_H = 108;
  // Horizontal offsets: spread cards evenly across the container width
  // Center card at 0, others step out left/right
  const step = 52; // px between card centers
  const centerIdx = Math.floor(n / 2); // index 2
  // Slight vertical arc: outer cards sit a bit lower
  const arcY = [10, 4, 0, 4, 10];
  // z-index: center card on top, outer cards behind
  const zOrder = [1, 2, 5, 2, 1];

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Brand Network</div>
      <div className="text-xs mb-3" style={{ color: '#888' }}>200+ matched sponsors</div>

      {/* Horizontal card spread */}
      <div className="relative mb-3" style={{ height: '120px' }}>
        <div style={{ position: 'absolute', bottom: 0, left: '50%' }}>
          {cards.map((card, i) => {
            const isHov = hovered === i;
            const isDark = isHov;
            const offsetX = (i - centerIdx) * step;
            const offsetY = isHov ? -14 : arcY[i];
            // Entry: cards slide in from center
            const entryX = entered ? offsetX : 0;
            const entryY = entered ? offsetY : 20;
            const entryOpacity = entered ? 1 : 0;

            return (
              <div
                key={card.name}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: `-${CARD_W / 2}px`,
                  width: `${CARD_W}px`,
                  height: `${CARD_H}px`,
                  borderRadius: '10px',
                  background: isDark ? '#111' : '#ffffff',
                  border: isDark ? '1px solid #111' : '1px solid rgba(17,17,17,0.13)',
                  boxShadow: isHov
                    ? '0 16px 36px rgba(0,0,0,0.22)'
                    : '0 3px 12px rgba(0,0,0,0.09)',
                  transform: `translateX(${entryX}px) translateY(${-entryY}px)`,
                  transition: `transform 0.55s cubic-bezier(0.34,1.1,0.64,1) ${i * 0.055}s, opacity 0.45s ease ${i * 0.055}s, background 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease`,
                  opacity: entryOpacity,
                  zIndex: isHov ? 10 : zOrder[i],
                  cursor: 'pointer',
                  padding: '10px 9px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  userSelect: 'none',
                }}
              >
                <div>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.14)' : '#f0f0f0', marginBottom: '6px', transition: 'background 0.18s ease' }} />
                  <div style={{ fontSize: '9px', fontWeight: 700, color: isDark ? '#fff' : '#111', lineHeight: 1.2, transition: 'color 0.18s ease' }}>{card.name}</div>
                  <div style={{ fontSize: '8px', color: isDark ? 'rgba(255,255,255,0.5)' : '#999', marginTop: '2px', transition: 'color 0.18s ease' }}>{card.category}</div>
                </div>
                <div style={{ fontSize: '10px', fontWeight: 700, color: isDark ? '#fff' : '#111', transition: 'color 0.18s ease' }}>{card.deal}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom label */}
      <div
        className="flex items-center justify-between px-3 py-2.5 rounded-xl"
        style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}
      >
        <div>
          <div className="text-xs font-semibold" style={{ color: '#111' }}>
            {hovered !== null ? cards[hovered].name : 'Brand Network'}
          </div>
          <div className="text-[10px]" style={{ color: '#888' }}>
            {hovered !== null ? cards[hovered].category : 'Hover a card'}
          </div>
        </div>
        <div className="text-sm font-bold" style={{ color: '#111' }}>
          {hovered !== null ? cards[hovered].deal : '200+'}
        </div>
      </div>
    </div>
  );
}

function ContentStrategyVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const views = useCountUp(21, 1400, entered);
  const weeks = [18, 24, 20, 32, 28, 45, 38, 56, 50, 68, 62, 85];
  const metrics = [
    { label: 'Hook Rate', val: 78, delay: 0 },
    { label: 'Retention', val: 64, delay: 0.1 },
    { label: 'Share Rate', val: 91, delay: 0.2 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold" style={{ color: '#111' }}>Content Performance</div>
        <span className="text-xs font-bold" style={{ color: '#111', opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.8s' }}>{views}M views</span>
      </div>
      <div className="text-xs mb-3" style={{ color: '#888' }}>Last 12 weeks</div>
      <div className="flex items-end gap-1 mb-4" style={{ height: '56px' }}>
        {weeks.map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm" style={{ height: entered ? `${h}%` : '0%', background: i >= 10 ? '#111' : i >= 8 ? '#555' : '#d1d5db', transition: `height 0.6s cubic-bezier(0.34,1.2,0.64,1) ${i * 0.04}s` }} />
        ))}
      </div>
      <div className="space-y-2">
        {metrics.map((m) => (
          <div key={m.label} style={{ opacity: entered ? 1 : 0, transition: `opacity 0.4s ease ${0.4 + m.delay}s` }}>
            <div className="flex justify-between text-[10px] mb-1">
              <span style={{ color: '#555' }}>{m.label}</span>
              <span className="font-semibold" style={{ color: '#111' }}>{m.val}%</span>
            </div>
            <div className="w-full h-1 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ width: entered ? `${m.val}%` : '0%', background: '#111', transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${0.5 + m.delay}s` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViralDistributionVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const views = useCountUp(142, 1600, entered);
  const creators = useCountUp(48, 1200, entered);
  const nodeAngles = [0, 60, 120, 180, 240, 300];
  const nodeRadii  = [52, 48, 54, 50, 46, 52];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Viral Distribution</div>
      <div className="text-xs mb-3" style={{ color: '#888' }}>Organic clip network</div>
      <div className="flex items-center justify-center mb-3" style={{ height: '120px' }}>
        <div className="relative" style={{ width: '120px', height: '120px' }}>
          {[1, 2].map((ring) => (
            <div key={ring} className="absolute rounded-full" style={{ inset: `${ring * 18}px`, border: '1px solid rgba(17,17,17,0.1)', opacity: entered ? 1 : 0, animation: entered ? `pulse ${1.4 + ring * 0.4}s ease-in-out infinite` : 'none', transition: 'opacity 0.5s ease' }} />
          ))}
          <div className="absolute" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '28px', height: '28px', borderRadius: '50%', background: '#111', opacity: entered ? 1 : 0, transition: 'opacity 0.4s ease 0.1s' }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            {nodeAngles.map((ang, i) => {
              const rad = (ang * Math.PI) / 180;
              const x2 = 60 + Math.cos(rad) * nodeRadii[i];
              const y2 = 60 + Math.sin(rad) * nodeRadii[i];
              return <line key={i} x1="60" y1="60" x2={x2} y2={y2} stroke="rgba(17,17,17,0.12)" strokeWidth="1" strokeDasharray="3 3" style={{ opacity: entered ? 1 : 0, transition: `opacity 0.4s ease ${0.2 + i * 0.06}s` }} />;
            })}
          </svg>
          {nodeAngles.map((ang, i) => {
            const rad = (ang * Math.PI) / 180;
            const x = 60 + Math.cos(rad) * nodeRadii[i] - 8;
            const y = 60 + Math.sin(rad) * nodeRadii[i] - 8;
            return <div key={i} style={{ position: 'absolute', left: x, top: y, width: '16px', height: '16px', borderRadius: '50%', background: '#e5e7eb', border: '1.5px solid #d1d5db', opacity: entered ? 1 : 0, transform: entered ? 'scale(1)' : 'scale(0)', transition: `opacity 0.4s ease ${0.15 + i * 0.07}s, transform 0.5s cubic-bezier(0.34,1.4,0.64,1) ${0.15 + i * 0.07}s` }} />;
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Total Views', value: `${views}M` },
          { label: 'Creators', value: `${creators}` },
          { label: 'Engagement', value: '8.4%' },
          { label: 'ROI vs Paid', value: '12x' },
        ].map((s, i) => (
          <div key={s.label} className="p-2.5 rounded-xl text-center" style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: `opacity 0.4s ease ${0.3 + i * 0.07}s, transform 0.4s ease ${0.3 + i * 0.07}s` }}>
            <div className="text-sm font-bold" style={{ color: '#111' }}>{s.value}</div>
            <div className="text-[9px]" style={{ color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SponsorshipsVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const creators = [
    { name: 'Alex M.', niche: 'Lifestyle', followers: '1.2M', match: 98, delay: 0 },
    { name: 'Jordan K.', niche: 'Tech', followers: '850K', match: 94, delay: 0.1 },
    { name: 'Sam R.', niche: 'Fitness', followers: '2.1M', match: 91, delay: 0.2 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Creator Matching</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>AI-powered alignment score</div>
      <div className="space-y-3">
        {creators.map((c) => (
          <div key={c.name} style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(10px)', transition: `opacity 0.5s ease ${c.delay}s, transform 0.5s ease ${c.delay}s` }}>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-8 h-8 rounded-full flex-shrink-0" style={{ background: '#e5e7eb' }} />
              <div className="flex-1">
                <div className="text-xs font-semibold" style={{ color: '#111' }}>{c.name}</div>
                <div className="text-[10px]" style={{ color: '#888' }}>{c.niche} · {c.followers}</div>
              </div>
              <span className="text-xs font-bold" style={{ color: '#111' }}>{c.match}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ width: entered ? `${c.match}%` : '0%', background: 'linear-gradient(90deg, #555 0%, #111 100%)', transition: `width 1s cubic-bezier(0.4,0,0.2,1) ${0.3 + c.delay}s` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsultingVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const trends = [
    { label: 'Short-form', value: 92, delay: 0 },
    { label: 'Live Commerce', value: 74, delay: 0.08 },
    { label: 'Gen Z Reach', value: 88, delay: 0.16 },
    { label: 'Community', value: 65, delay: 0.24 },
    { label: 'AI Content', value: 81, delay: 0.32 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Cultural Pulse</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>Real-time trend signals</div>
      <div className="space-y-2.5 mb-4">
        {trends.map((t) => (
          <div key={t.label} style={{ opacity: entered ? 1 : 0, transition: `opacity 0.4s ease ${t.delay}s` }}>
            <div className="flex justify-between text-[10px] mb-1">
              <span style={{ color: '#555' }}>{t.label}</span>
              <span className="font-semibold" style={{ color: '#111' }}>{t.value}</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ width: entered ? `${t.value}%` : '0%', background: '#111', transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${0.25 + t.delay}s` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[
          { text: 'Short-form is dominating — pivot now', delay: 0.4 },
          { text: 'Gen Z prefers authentic over polished', delay: 0.5 },
        ].map((ins) => (
          <div key={ins.text} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: `opacity 0.4s ease ${ins.delay}s, transform 0.4s ease ${ins.delay}s` }}>
            <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: '#111' }} />
            <span className="text-[10px]" style={{ color: '#555' }}>{ins.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketplaceVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [dotFrame, setDotFrame] = useState(0);

  useEffect(() => {
    if (!entered) return;
    const id = setInterval(() => setDotFrame(f => (f + 1) % 3), 500);
    return () => clearInterval(id);
  }, [entered]);

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>1-on-1 Consultation</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>Matched with a dedicated strategist</div>

      {/* Illustration */}
      <div
        className="flex items-center justify-center mb-4"
        style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(10px)', transition: 'opacity 0.6s ease 0.05s, transform 0.6s ease 0.05s' }}
      >
        <svg width="220" height="148" viewBox="0 0 220 148" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Floor shadow */}
          <ellipse cx="110" cy="138" rx="80" ry="8" fill="#e5e7eb" opacity="0.5" />

          {/* Table top (isometric) */}
          <path d="M60 72 L110 58 L160 72 L110 86 Z" fill="#d1fae5" stroke="#a7f3d0" strokeWidth="1" />
          {/* Table left face */}
          <path d="M60 72 L60 90 L110 104 L110 86 Z" fill="#a7f3d0" stroke="#6ee7b7" strokeWidth="0.8" />
          {/* Table right face */}
          <path d="M160 72 L160 90 L110 104 L110 86 Z" fill="#6ee7b7" stroke="#34d399" strokeWidth="0.8" />

          {/* Table legs */}
          <line x1="65" y1="88" x2="65" y2="108" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          <line x1="155" y1="88" x2="155" y2="108" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
          <line x1="110" y1="102" x2="110" y2="122" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />

          {/* Notebook on table */}
          <rect x="97" y="74" width="14" height="10" rx="1" fill="#60a5fa" opacity="0.9" />
          <rect x="97" y="74" width="14" height="1.5" rx="0.5" fill="#3b82f6" />

          {/* Left coffee cup */}
          <rect x="72" y="77" width="8" height="6" rx="1.5" fill="#fff" stroke="#d1d5db" strokeWidth="0.8" />
          <path d="M80 79.5 Q83 79.5 83 81.5 Q83 83.5 80 83.5" stroke="#d1d5db" strokeWidth="0.8" fill="none" />
          <ellipse cx="76" cy="77.5" rx="3.5" ry="1" fill="#92400e" opacity="0.3" />
          {/* Steam left */}
          <path d="M74 76 Q74.5 74.5 74 73" stroke="#d1d5db" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />
          <path d="M77 76 Q77.5 74 77 72.5" stroke="#d1d5db" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />

          {/* Right coffee cup */}
          <rect x="140" y="77" width="8" height="6" rx="1.5" fill="#fff" stroke="#d1d5db" strokeWidth="0.8" />
          <path d="M148 79.5 Q151 79.5 151 81.5 Q151 83.5 148 83.5" stroke="#d1d5db" strokeWidth="0.8" fill="none" />
          <ellipse cx="144" cy="77.5" rx="3.5" ry="1" fill="#92400e" opacity="0.3" />
          {/* Steam right */}
          <path d="M142 76 Q142.5 74.5 142 73" stroke="#d1d5db" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.6" />
          <path d="M145 76 Q145.5 74 145 72.5" stroke="#d1d5db" strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.4" />

          {/* Left person — chair */}
          <path d="M52 108 L52 90 Q52 88 54 88 L72 88 Q74 88 74 90 L74 108" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <line x1="52" y1="96" x2="74" y2="96" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
          {/* Left person — body */}
          <rect x="57" y="72" width="12" height="16" rx="4" fill="#e5e7eb" />
          {/* Left person — head */}
          <circle cx="63" cy="66" r="7" fill="#fde68a" />
          {/* Left person — hair */}
          <path d="M56 64 Q57 58 63 58 Q69 58 70 64" fill="#374151" />
          {/* Left person — face details */}
          <circle cx="61" cy="66" r="0.8" fill="#374151" />
          <circle cx="65" cy="66" r="0.8" fill="#374151" />
          <path d="M61 69 Q63 70.5 65 69" stroke="#374151" strokeWidth="0.8" strokeLinecap="round" fill="none" />
          {/* Left person — arms (hands folded on table) */}
          <path d="M57 80 Q54 82 54 84 Q54 86 58 86 L68 86 Q72 86 72 84 Q72 82 69 80" stroke="#fde68a" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Right person — chair */}
          <path d="M148 108 L148 90 Q148 88 150 88 L168 88 Q170 88 170 90 L170 108" stroke="#9ca3af" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <line x1="148" y1="96" x2="170" y2="96" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
          {/* Right person — body */}
          <rect x="151" y="72" width="12" height="16" rx="4" fill="#d1d5db" />
          {/* Right person — head */}
          <circle cx="157" cy="66" r="7" fill="#d97706" opacity="0.7" />
          {/* Right person — glasses */}
          <rect x="152.5" y="63.5" width="4" height="3" rx="1.5" fill="none" stroke="#374151" strokeWidth="0.8" />
          <rect x="158" y="63.5" width="4" height="3" rx="1.5" fill="none" stroke="#374151" strokeWidth="0.8" />
          <line x1="156.5" y1="65" x2="158" y2="65" stroke="#374151" strokeWidth="0.8" />
          {/* Right person — hair */}
          <path d="M150 63 Q151 57 157 57 Q163 57 164 63" fill="#1f2937" />
          {/* Right person — face */}
          <circle cx="155" cy="66" r="0.8" fill="#1f2937" />
          <circle cx="159" cy="66" r="0.8" fill="#1f2937" />
          {/* Right person — thinking hand */}
          <path d="M163 72 Q167 74 168 78 Q168 82 165 83" stroke="#d97706" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
          <circle cx="165" cy="84" r="2" fill="#d97706" opacity="0.5" />

          {/* Speech bubble */}
          <circle cx="110" cy="44" r="14" fill="#fff" stroke="#d1d5db" strokeWidth="1" />
          <path d="M106 52 L110 58 L114 52" fill="#fff" stroke="#d1d5db" strokeWidth="1" strokeLinejoin="round" />
          {/* Animated dots */}
          <circle cx="103" cy="44" r="2" fill="#60a5fa" opacity={dotFrame === 0 ? 1 : 0.3} />
          <circle cx="110" cy="44" r="2" fill="#60a5fa" opacity={dotFrame === 1 ? 1 : 0.3} />
          <circle cx="117" cy="44" r="2" fill="#60a5fa" opacity={dotFrame === 2 ? 1 : 0.3} />
        </svg>
      </div>

      {/* Info row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Avg. Session', value: '45 min', delay: 0.2 },
          { label: 'Match Rate',   value: '98%',    delay: 0.28 },
          { label: 'Satisfaction', value: '4.9★',   delay: 0.36 },
        ].map((s) => (
          <div
            key={s.label}
            className="p-2.5 rounded-xl text-center"
            style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: `opacity 0.4s ease ${s.delay}s, transform 0.4s ease ${s.delay}s` }}
          >
            <div className="text-sm font-bold" style={{ color: '#111' }}>{s.value}</div>
            <div className="text-[9px]" style={{ color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeatureVisual({ type }: { type: FeatureItem['visual'] }) {
  switch (type) {
    case 'distribution': return <DistributionVisual />;
    case 'growth': return <GrowthVisual />;
    case 'royalty': return <RoyaltyVisual />;
    case 'sync': return <SyncVisual />;
    case 'strategy': return <StrategyVisual />;
    case 'support': return <SupportVisual />;
    case 'copyright': return <CopyrightVisual />;
    case 'monetization': return <MonetizationVisual />;
    case 'licensing': return <LicensingVisual />;
    case 'brand-partnerships': return <BrandPartnershipsVisual />;
    case 'content-strategy': return <ContentStrategyVisual />;
    case 'creator-support': return <SupportVisual />;
    case 'viral': return <ViralDistributionVisual />;
    case 'sponsorships': return <SponsorshipsVisual />;
    case 'consulting': return <ConsultingVisual />;
    case 'marketplace': return <MarketplaceVisual />;
    default: return null;
  }
}

// --- Main Component ---

export function Partnership({ showArtists = true }: { showArtists?: boolean }) {
  const [activeTab, setActiveTab] = useState(showArtists ? 'artists' : 'creators');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.1);

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setIsTransitioning(true);
      setActiveTab(tabId);
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  const tabs = [
    ...(showArtists ? [{ id: 'artists', label: 'Artists' }] : []),
    { id: 'creators', label: 'Creators' },
    { id: 'brands', label: 'Brands' }
  ];

  const artistFeatures: FeatureItem[] = [
    { tag: 'Distribution', title: 'Go global with\none click', description: 'Distribution is just the starting point. We provide flexibility along with strategic guidance and industry-leading revenue splits.', visual: 'distribution' },
    { tag: 'Marketing', title: 'Growth that\ncompounds', description: "Marketing comes naturally at Elevate. We don't just support you. We invest in you.", visual: 'growth' },
    { tag: 'Royalties', title: 'Every dollar\naccounted for', description: "There's more to your royalties than what traditional distributors collect. Elevate uncovers, manages, and safeguards your publishing income.", visual: 'royalty' },
    { tag: 'Sync', title: 'Your music,\non screen', description: 'Strategic music placement across film, TV, gaming, and advertising, designed to generate both exposure and revenue.', visual: 'sync' },
    { tag: 'Strategy', title: 'A roadmap\nbuilt for you', description: "Personalized, long term planning for releases, branding, and positioning, built around where you should be, not just your next drop.", visual: 'strategy' },
    { tag: 'Consulting', title: 'Stay culturally\nrelevant', description: "The landscape and culture is always shifting. We advise brands on how to move correctly in music, creator, and youth culture.", visual: 'consulting' },
  ];

  const creatorFeatures: FeatureItem[] = [
    { tag: 'Protection', title: 'Turn theft into\nrevenue', description: 'Convert unauthorized re uploads into measurable revenue. Our content detection and monetization tools have helped clients unlock up to $50,000+ per month.', visual: 'copyright' },
    { tag: 'Monetization', title: 'Exclusive\ncampaigns', description: 'Get access to exclusive campaigns and opportunities. Earning extra income has never been easier.', visual: 'monetization' },
    { tag: 'Licensing', title: 'Your content\npays you', description: 'When your content reaches viral pages or television, it should pay you. We handle licensing, negotiations, and compliance.', visual: 'licensing' },
    { tag: 'Partnerships', title: 'Brands that\nfit you', description: 'Find sponsorships that align perfectly with your goals and boost your chances of landing high quality, relevant partnerships.', visual: 'brand-partnerships' },
    { tag: 'Strategy', title: 'Scale with\nexperts', description: 'Find and match up with experienced experts to assist you with your growth.', visual: 'marketplace' },
    { tag: 'Support', title: 'Real Support,\nReal People', description: 'Priority, human first support built specifically for creators. Fast responses, real solutions.', visual: 'creator-support' },
  ];

  const brandFeatures: FeatureItem[] = [
    { tag: 'Sponsorships', title: 'Authentic\nConnections', description: 'Connect with creators who genuinely align with your brand values and target audience.', visual: 'sponsorships' },
    { tag: 'ROI', title: 'Measurable\nResults', description: 'Track every campaign with detailed analytics and clear ROI metrics.', visual: 'content-strategy' },
    { tag: 'Creative', title: 'Creative\nFreedom', description: 'Collaborate with creators while maintaining your brand voice and message.', visual: 'content-strategy' },
    { tag: 'Scale', title: 'Scale\nEfficiently', description: 'Reach millions through our network of vetted creators across all platforms.', visual: 'viral' },
    { tag: 'Support', title: 'Dedicated\nSupport', description: 'Get personalized guidance from our team of brand partnership experts.', visual: 'consulting' },
    { tag: 'Quality', title: 'Quality\nAssurance', description: 'All creators are vetted for engagement, authenticity, and brand safety.', visual: 'brand-partnerships' },
  ];

  const features = activeTab === 'artists' && showArtists ? artistFeatures : activeTab === 'creators' ? creatorFeatures : activeTab === 'brands' ? brandFeatures : creatorFeatures;

  return (
    <section
      id="partnership"
      className="relative pt-2 md:pt-8 pb-20 px-4 md:px-6 overflow-hidden"
      style={{ background: '#000000' }}
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <div
          ref={headerRef}
          className={`mb-12 md:mb-20 scroll-hidden${headerVisible ? ' scroll-blur-emerge' : ''}`}
        >
          <div className="flex flex-col items-center mb-8 md:mb-16">
            <div className="max-w-3xl text-center">
              <div className="space-y-4 mb-1 flex flex-col items-center">
                {showArtists && (
                  <div className="artist-button flex items-center gap-3">
                  <div className="music-icon group w-10 h-10 flex-shrink-0">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M12 28C12 20.268 18.268 14 26 14H22C29.732 14 36 20.268 36 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                      <rect x="8" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <rect x="32" y="26" width="8" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <rect x="10" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
                      <rect x="34" y="28" width="4" height="8" rx="1" fill="currentColor" opacity="0.3"/>
                    </svg>
                    <div className="note note-1">
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                        <path d="M2 12V3L9 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="2" cy="12" r="2" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="note note-2">
                      <svg width="8" height="12" viewBox="0 0 10 14" fill="none">
                        <path d="M2 12V3L9 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="2" cy="12" r="2" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="note note-3">
                      <svg width="6" height="10" viewBox="0 0 10 14" fill="none">
                        <path d="M2 12V3L9 1V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="2" cy="12" r="2" fill="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <p
                    className="text-xl md:text-2xl"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      color: '#ffffff',
                      lineHeight: '1.4'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Artists</span> saw a <span style={{ fontWeight: 300 }}>95% increase in revenue and reach</span>
                  </p>
                </div>
                )}
                              </div>

                          </div>
          </div>
        </div>

        {/* Feature Section Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 
            className="text-3xl md:text-4xl lg:text-5xl font-normal leading-snug"
            style={{ fontFamily: 'Fraunces, serif', color: '#ffffff', letterSpacing: '-0.02em' }}
          >
            One Platform. <span style={{ fontWeight: 600 }}>Everything You Need.</span>
          </h2>
        </div>

        {/* Feature Sections - Alternating Split Layout */}
        <div
          className="space-y-24 md:space-y-32"
          style={{
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 150ms ease-in-out',
          }}
        >
          {features.map((feature, index) => (
            <FeatureSection key={`${activeTab}-${index}`} feature={feature} index={index} />
          ))}
        </div>

        {/* Revenue Statistics - Moved Below Features */}
        <div className="text-center mt-24 md:mt-32">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-normal leading-snug"
            style={{
              fontFamily: 'Fraunces, serif',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            <span style={{ fontWeight: 600 }}>Elevate's</span> users on average saw an increase of <span style={{ fontWeight: 300 }}>2x to 5x</span> their current revenue.
          </h2>
        </div>
      </div>
    </section>
  );
}

function FeatureSection({ feature, index }: { feature: FeatureItem; index: number }) {
  const { ref, isVisible } = useScrollAnimation(0.15);
  const isReversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16`}
    >
      {/* Text Side */}
      <div
        className={`flex-1 w-full scroll-hidden${isVisible ? ` ${isReversed ? 'scroll-reveal-right' : 'scroll-reveal-left'}` : ''}`}
      >
        <div
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#888' }} />
          <span
            className="text-xs font-medium"
            style={{
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              color: '#999',
            }}
          >
            {feature.tag}
          </span>
        </div>

        <h3
          className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 leading-tight whitespace-pre-line"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          {feature.title}
        </h3>

        <p
          className="text-base leading-relaxed max-w-md"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: 'rgb(204, 204, 204)',
            fontWeight: 400,
          }}
        >
          {feature.description}
        </p>
      </div>

      {/* Visual Side */}
      <div
        className={`flex-1 w-full max-w-md md:max-w-none scroll-hidden${isVisible ? ` ${isReversed ? 'scroll-reveal-left' : 'scroll-reveal-right'}` : ''}`}
        style={{ isolation: 'isolate' }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '16px',
            backgroundColor: '#000000',
          }}
        >
          <FeatureVisual type={feature.visual} />
        </div>
      </div>
    </div>
  );
}