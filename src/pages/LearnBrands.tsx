import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

// --- Local animation hooks ---
function useInView(threshold = 0.25) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired.current) {
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

function useEnteredDelay(inView: boolean, delay = 900) {
  const [entered, setEntered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);
  useEffect(() => {
    if (!inView || firedRef.current) return;
    firedRef.current = true;
    timerRef.current = setTimeout(() => setEntered(true), delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [inView, delay]);
  return entered;
}

function useCountUp(target: number, duration = 1400, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

interface BrandFeature {
  tag: string;
  title: string;
  description: string;
  visual: 'sponsorships' | 'content-strategy' | 'viral' | 'consulting' | 'brand-partnerships' | 'middleman';
}

const brandFeatures: BrandFeature[] = [
  {
    tag: 'Sponsorships',
    title: 'Superior\nSelection',
    description: 'Looking for the right creator to sponsor? We connect brands with carefully vetted talent, matched by audience, values, and performance, ensuring every partnership delivers real impact.',
    visual: 'sponsorships'
  },
  {
    tag: 'ROI',
    title: 'Measurable\nResults',
    description: 'Track every campaign with detailed analytics and clear ROI metrics.',
    visual: 'content-strategy'
  },
  {
    tag: 'Operations',
    title: 'Advanced\nEcosystem',
    description: 'Never jump between tools again. Manage clients, workflows, and payments from a single streamlined dashboard built for speed, clarity, and scale.',
    visual: 'content-strategy'
  },
  {
    tag: 'Scale',
    title: 'Scale\nEfficiently',
    description: 'Get access to our network of vetted creators across every major platform to strengthen your systems and accelerate growth.',
    visual: 'viral'
  },
  {
    tag: 'Support',
    title: 'Dedicated\nSupport',
    description: 'Get personalized guidance from our team of brand partnership experts.',
    visual: 'consulting'
  },
  {
    tag: 'Quality',
    title: 'Quality\nAssurance',
    description: 'All creators and freelancers are vetted for quality, authenticity, and safety.',
    visual: 'brand-partnerships'
  },
  {
    tag: 'Protection',
    title: 'Middleman\nProtection',
    description: 'Elevate acts as a neutral third-party facilitator, ensuring partnerships are executed securely and transparently. Funds, deliverables, and terms are protected through structured deal management, minimizing risk and preventing disputes.',
    visual: 'middleman'
  }
];

const brandFAQ = [
  {
    question: "What types of brands do Elevate accept?",
    answer: "We work with brands of all sizes across various industries - from emerging startups to established enterprises. Our focus is on brands that value authentic creator partnerships and meaningful audience engagement."
  },
  {
    question: "How do you match brands with creators?",
    answer: "Our proprietary matching algorithm considers brand values, target demographics, content style, engagement metrics, and audience authenticity to ensure perfect alignment between brands and creators."
  },
  {
    question: "What kind of ROI can we expect?",
    answer: "ROI varies by campaign type and goals, but our clients typically see 3-5x return on investment through increased brand awareness, engagement, and conversions. We provide detailed analytics to track every metric."
  },
  {
    question: "What platforms do you support?",
    answer: "We work across all major platforms including Instagram, TikTok, YouTube, Twitter/X, and emerging platforms. Our creators have expertise across the entire social media landscape."
  },
  {
    question: "How do you ensure brand safety?",
    answer: "All creators undergo rigorous vetting including content audits, engagement verification, and brand alignment checks. We monitor campaigns in real-time and provide full transparency throughout the partnership."
  }
];

// --- Visual Mockup Components ---

function SponsorshipsVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const totalReach = useCountUp(512, 1600, entered);
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setActiveIdx(i => (i + 1) % 3), 2200);
    return () => clearInterval(t);
  }, [entered]);
  const creators = [
    { creator: 'Sarah Chen',  platform: 'Instagram', reach: '2.4M', pct: 78, delay: 0 },
    { creator: 'Mike Torres', platform: 'TikTok',    reach: '1.8M', pct: 61, delay: 0.08 },
    { creator: 'Emma Wilson', platform: 'YouTube',   reach: '890K', pct: 44, delay: 0.16 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Active Campaigns</div>
          <div style={{ fontSize: '9px', color: '#bbb', marginTop: '1px' }}>Matched to your brand</div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#f5f5f5', opacity: entered ? 1 : 0, transition: 'opacity 0.4s ease 0.05s' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#111', animation: inView ? 'pulse 2s infinite' : 'none' }} />
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#111' }}>3 active</span>
        </div>
      </div>
      <div className="px-5 pt-4 pb-3" style={{ borderBottom: '1px solid #f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.45s ease 0.05s, transform 0.45s ease 0.05s' }}>
        <div style={{ fontSize: '9px', color: '#bbb', marginBottom: '2px' }}>Combined reach</div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1 }}>{totalReach / 10}M+</div>
      </div>
      <div className="px-5 py-3">
        <div className="space-y-3">
          {creators.map((c, i) => (
            <div key={c.creator} style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: `opacity 0.45s ease ${c.delay + 0.1}s, transform 0.45s ease ${c.delay + 0.1}s` }}>
              <div className="flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ background: activeIdx === i ? '#111' : '#f0f0f0', border: '1px solid #ebebeb', transition: 'background 0.4s ease' }}>
                  <span style={{ fontSize: '8px', fontWeight: 700, color: activeIdx === i ? '#fff' : '#888', transition: 'color 0.4s ease' }}>
                    {c.creator.split(' ').map((w: string) => w[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#111' }}>{c.creator}</div>
                  <div style={{ fontSize: '8px', color: '#bbb' }}>{c.platform}</div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#111' }}>{c.reach}</span>
              </div>
              <div className="relative overflow-hidden rounded-full" style={{ height: '4px', background: '#f0f0f0' }}>
                <div style={{ height: '4px', background: '#111', borderRadius: '9999px', width: entered ? `${c.pct}%` : '0%', transition: `width 1s cubic-bezier(0.22,1,0.36,1) ${c.delay + 0.3}s`, position: 'relative', overflow: 'hidden' }}>
                  {entered && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.45) 50%,transparent 100%)', animation: `shimmer 2.2s ease-in-out ${c.delay + 1.3}s infinite`, width: '30%' }} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [chalkIdx, setChalkIdx] = useState(0);
  const items = ['Payments', 'Analytics', 'Matching', 'Scheduling', 'Contracts', 'Messaging'];
  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setChalkIdx(i => (i + 1) % items.length), 1800);
    return () => clearInterval(t);
  }, [entered]);

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      <style>{`
        @keyframes chalkWrite{0%{stroke-dashoffset:120}100%{stroke-dashoffset:0}}
        @keyframes chalkFade{0%{opacity:0}100%{opacity:1}}
        @keyframes dustFloat{0%{opacity:0;transform:translateY(0)}60%{opacity:0.7}100%{opacity:0;transform:translateY(-14px)}}
        @keyframes lightSway{0%,100%{opacity:0.18}50%{opacity:0.28}}
      `}</style>
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Advanced Ecosystem</div>
          <div style={{ fontSize: '9px', color: '#bbb', marginTop: '1px' }}>Everything in one place</div>
        </div>
      </div>
      <div style={{ opacity: entered ? 1 : 0, transition: 'opacity 0.7s ease 0.1s' }}>
        <svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ display: 'block' }}>
          <defs>
            <radialGradient id="roomBg" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#1e1a14"/>
              <stop offset="100%" stopColor="#0e0c09"/>
            </radialGradient>
            <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,220,140,0.35)"/>
              <stop offset="100%" stopColor="rgba(255,220,140,0)"/>
            </radialGradient>
          </defs>

          {/* Room */}
          <rect width="280" height="200" fill="url(#roomBg)"/>
          {/* Floor */}
          <rect x="0" y="168" width="280" height="32" fill="#120f0a"/>
          {/* Floor boards */}
          {[0,56,112,168,224].map((x,i) => <line key={i} x1={x} y1="168" x2={x} y2="200" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
          {/* Back wall */}
          <rect x="0" y="0" width="280" height="168" fill="#1a1610"/>
          {/* Ceiling lamp */}
          <line x1="140" y1="0" x2="140" y2="22" stroke="#555" strokeWidth="1.5"/>
          <ellipse cx="140" cy="24" rx="14" ry="6" fill="#2a2520"/>
          <ellipse cx="140" cy="26" rx="10" ry="4" fill="rgba(255,220,140,0.9)"/>
          <ellipse cx="140" cy="50" rx="60" ry="35" fill="url(#lampGlow)" style={{animation:'lightSway 3s ease-in-out infinite'}}/>

          {/* Chalkboard frame */}
          <rect x="28" y="18" width="224" height="118" rx="3" fill="#1a2a1a" stroke="#3a3a2a" strokeWidth="2"/>
          {/* Chalkboard surface */}
          <rect x="32" y="22" width="216" height="110" rx="2" fill="#1e3020"/>
          {/* Board chalk dust texture */}
          <rect x="32" y="22" width="216" height="110" rx="2" fill="rgba(255,255,255,0.015)"/>

          {/* Board title */}
          <text x="140" y="38" textAnchor="middle" fontSize="8" fontFamily="system-ui" fontWeight="700" fill="rgba(255,255,255,0.55)" letterSpacing="0.12em">ELEVATE ECOSYSTEM</text>
          <line x1="55" y1="42" x2="225" y2="42" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8"/>

          {/* Feature nodes on board — 6 items in 2 rows */}
          {[
            {label:'Payments',    x:72,  y:62,  icon:'$'},
            {label:'Analytics',   x:140, y:62,  icon:'↗'},
            {label:'Matching',    x:208, y:62,  icon:'⟷'},
            {label:'Scheduling',  x:72,  y:100, icon:'◷'},
            {label:'Contracts',   x:140, y:100, icon:'✓'},
            {label:'Messaging',   x:208, y:100, icon:'✉'},
          ].map((node, i) => (
            <g key={i} style={{ opacity: entered ? 1 : 0, animation: entered ? `chalkFade 0.4s ease ${i * 0.18 + 0.2}s both` : 'none' }}>
              {/* Circle node */}
              <circle cx={node.x} cy={node.y} r="14" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1"
                style={{ strokeDasharray: 88, animation: entered ? `chalkWrite 0.6s ease ${i * 0.18 + 0.2}s both` : 'none' }}/>
              {/* Highlight ring on active */}
              {chalkIdx === i && <circle cx={node.x} cy={node.y} r="14" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>}
              {/* Icon */}
              <text x={node.x} y={node.y + 3} textAnchor="middle" fontSize="9" fontFamily="system-ui" fill={chalkIdx === i ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)'}>{node.icon}</text>
              {/* Label */}
              <text x={node.x} y={node.y + 23} textAnchor="middle" fontSize="6" fontFamily="system-ui" fill="rgba(255,255,255,0.35)" letterSpacing="0.04em">{node.label}</text>
            </g>
          ))}

          {/* Connector lines between nodes */}
          {[[72,62,140,62],[140,62,208,62],[72,100,140,100],[140,100,208,100],[72,62,72,100],[140,62,140,100],[208,62,208,100]].map(([x1,y1,x2,y2],i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="3 3"/>
          ))}

          {/* Chalk dust particles near active node */}
          {chalkIdx >= 0 && [{x:208+8,y:62},{x:208+12,y:58},{x:208+6,y:55}].map((pt,i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="1.2" fill="rgba(255,255,255,0.5)"
              style={{animation:`dustFloat 1.4s ease-out ${i*0.2}s infinite`}}/>
          ))}

          {/* Chalk tray */}
          <rect x="28" y="136" width="224" height="6" rx="2" fill="#2a2520"/>
          {/* Chalk sticks */}
          {[50,80,110].map((x,i) => <rect key={i} x={x} y="137" width="18" height="4" rx="2" fill={['rgba(255,255,255,0.6)','rgba(255,220,180,0.5)','rgba(180,220,255,0.5)'][i]}/>)}
          {/* Eraser */}
          <rect x="200" y="137" width="24" height="4" rx="2" fill="#5a4a3a"/>

          {/* Desk */}
          <rect x="60" y="155" width="160" height="14" rx="3" fill="#2a2010"/>
          <rect x="80" y="169" width="8" height="14" rx="2" fill="#1e1810"/>
          <rect x="192" y="169" width="8" height="14" rx="2" fill="#1e1810"/>
          {/* Books on desk */}
          <rect x="90" y="148" width="8" height="8" rx="1" fill="#3a2a1a"/>
          <rect x="99" y="149" width="6" height="7" rx="1" fill="#2a3a2a"/>
          <rect x="106" y="150" width="7" height="6" rx="1" fill="#3a2a3a"/>
          {/* Notebook */}
          <rect x="150" y="149" width="28" height="7" rx="1" fill="#f5f0e8" opacity="0.7"/>
          <line x1="153" y1="151" x2="175" y2="151" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8"/>
          <line x1="153" y1="153" x2="172" y2="153" stroke="rgba(0,0,0,0.2)" strokeWidth="0.8"/>
        </svg>

        {/* Caption */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: '10px', color: '#aaa', fontFamily: 'system-ui' }}>All tools, one dashboard</span>
          <div className="flex items-center gap-1.5">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#111', animation: inView ? 'pulse 2s infinite' : 'none' }}/>
            <span style={{ fontSize: '10px', color: '#aaa', fontFamily: 'system-ui' }}>6 modules</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatorNetworkVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Creator Network</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square rounded-xl flex items-center justify-center" style={{ background: '#f0f0f0' }}>
            <div className="w-12 h-12 rounded-full" style={{ background: '#e5e7eb' }} />
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl text-center" style={{ background: '#f0f0f0' }}>
        <div className="text-sm font-bold" style={{ color: '#111' }}>10,000+ Vetted Creators</div>
        <div className="text-[10px]" style={{ color: '#888' }}>Across all major platforms</div>
      </div>
    </div>
  );
}

function BrandPartnershipsVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [sparkTick, setSparkTick] = useState(0);
  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setSparkTick(s => s + 1), 1600);
    return () => clearInterval(t);
  }, [entered]);

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      <style>{`
        @keyframes dGlow{0%,100%{filter:drop-shadow(0 0 5px rgba(180,220,255,0.5))}50%{filter:drop-shadow(0 0 16px rgba(180,220,255,1))}}
        @keyframes torchFlicker{0%,100%{opacity:0.7;r:10}50%{opacity:1;r:13}}
        @keyframes sparkRise{0%{opacity:0;transform:translateY(0) scale(0.6)}40%{opacity:1;transform:translateY(-10px) scale(1)}100%{opacity:0;transform:translateY(-22px) scale(0.5)}}
        @keyframes caveBreath{0%,100%{opacity:0.5}50%{opacity:0.85}}
      `}</style>
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Quality Assurance</div>
          <div style={{ fontSize: '9px', color: '#bbb', marginTop: '1px' }}>Every creator, verified</div>
        </div>
      </div>
      <div style={{ opacity: entered ? 1 : 0, transition: 'opacity 0.7s ease 0.15s' }}>
        <svg viewBox="0 0 280 190" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ display: 'block' }}>
          <defs>
            <radialGradient id="bg1" cx="50%" cy="55%" r="65%">
              <stop offset="0%" stopColor="#1a1a2e"/>
              <stop offset="100%" stopColor="#08080f"/>
            </radialGradient>
            <radialGradient id="halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(160,210,255,0.22)"/>
              <stop offset="100%" stopColor="rgba(160,210,255,0)"/>
            </radialGradient>
            <linearGradient id="df1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#eaf5ff"/>
              <stop offset="100%" stopColor="#9ecfff"/>
            </linearGradient>
            <linearGradient id="df2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#c5e8ff"/>
              <stop offset="100%" stopColor="#5ab0f0"/>
            </linearGradient>
            <linearGradient id="df3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f0faff"/>
              <stop offset="100%" stopColor="#80c0f0"/>
            </linearGradient>
          </defs>

          {/* Cave bg */}
          <rect width="280" height="190" fill="url(#bg1)"/>

          {/* Ceiling stalactites */}
          <path d="M0 0 L0 28 Q15 48 32 22 Q48 6 64 32 Q80 52 100 18 Q118 2 138 28 Q156 50 176 16 Q192 2 212 26 Q228 46 248 14 Q262 2 280 20 L280 0Z" fill="#0c0c1a"/>
          {/* Floor stalagmites */}
          <path d="M0 190 L0 162 Q25 150 52 165 Q80 178 108 158 Q136 144 164 162 Q192 178 220 158 Q248 144 280 165 L280 190Z" fill="#0c0c1a"/>
          <polygon points="28,190 35,162 42,190" fill="#111122"/>
          <polygon points="88,190 94,168 100,190" fill="#111122"/>
          <polygon points="178,190 185,165 192,190" fill="#111122"/>
          <polygon points="242,190 248,170 254,190" fill="#111122"/>

          {/* Ambient halo behind diamond */}
          <ellipse cx="140" cy="100" rx="58" ry="46" fill="url(#halo)" style={{animation:'caveBreath 3s ease-in-out infinite'}}/>

          {/* Left torch */}
          <rect x="20" y="88" width="7" height="14" rx="2" fill="#5a3a1a"/>
          <ellipse cx="23.5" cy="86" rx="5" ry="7" fill="rgba(255,140,40,0.75)" style={{animation:'torchFlicker 1.4s ease-in-out infinite'}}/>
          <circle cx="23.5" cy="82" r="10" fill="rgba(255,140,40,0.1)" style={{animation:'caveBreath 1.4s ease-in-out infinite'}}/>

          {/* Right torch */}
          <rect x="253" y="88" width="7" height="14" rx="2" fill="#5a3a1a"/>
          <ellipse cx="256.5" cy="86" rx="5" ry="7" fill="rgba(255,140,40,0.75)" style={{animation:'torchFlicker 1.8s ease-in-out infinite'}}/>
          <circle cx="256.5" cy="82" r="10" fill="rgba(255,140,40,0.1)" style={{animation:'caveBreath 1.8s ease-in-out infinite'}}/>

          {/* Polishing arm left */}
          <line x1="55" y1="138" x2="112" y2="106" stroke="#3a3a4a" strokeWidth="3.5" strokeLinecap="round"/>
          <ellipse cx="52" cy="141" rx="9" ry="5.5" fill="#2a2a3a" transform="rotate(-28 52 141)"/>
          <ellipse cx="52" cy="141" rx="6" ry="3" fill="#444455" transform="rotate(-28 52 141)"/>

          {/* Polishing arm right */}
          <line x1="225" y1="136" x2="168" y2="106" stroke="#3a3a4a" strokeWidth="3.5" strokeLinecap="round"/>
          <ellipse cx="228" cy="139" rx="9" ry="5.5" fill="#2a2a3a" transform="rotate(28 228 139)"/>
          <ellipse cx="228" cy="139" rx="6" ry="3" fill="#444455" transform="rotate(28 228 139)"/>

          {/* Diamond — multi-facet */}
          <g style={{animation:'dGlow 2.8s ease-in-out infinite'}}>
            {/* Crown */}
            <polygon points="140,60 116,86 140,79 164,86" fill="url(#df1)"/>
            {/* Left upper facet */}
            <polygon points="116,86 105,100 140,79" fill="url(#df2)" opacity="0.88"/>
            {/* Right upper facet */}
            <polygon points="164,86 175,100 140,79" fill="url(#df1)" opacity="0.92"/>
            {/* Center girdle band */}
            <polygon points="116,86 140,79 164,86 156,100 124,100" fill="url(#df3)"/>
            {/* Left pavilion */}
            <polygon points="105,100 124,100 140,135" fill="url(#df2)" opacity="0.78"/>
            {/* Right pavilion */}
            <polygon points="175,100 156,100 140,135" fill="url(#df1)" opacity="0.72"/>
            {/* Center pavilion */}
            <polygon points="124,100 156,100 140,135" fill="url(#df3)" opacity="0.88"/>
            {/* Girdle highlight line */}
            <polyline points="105,100 124,100 156,100 175,100" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" fill="none"/>
            {/* Crown table highlight */}
            <polygon points="128,68 140,63 152,68 148,76 132,76" fill="rgba(255,255,255,0.35)"/>
          </g>

          {/* Sparkle crosses — cycle on sparkTick */}
          {[{x:122,y:63},{x:158,y:70},{x:106,y:94},{x:172,y:92},{x:140,y:54},{x:130,y:82}].map((pt,i) => (
            <g key={i} style={{
              opacity: 0,
              animation: sparkTick > 0 ? `sparkRise 1.6s ease-out ${((sparkTick*3+i)%6)*0.27}s 1` : 'none',
            }}>
              <line x1={pt.x} y1={pt.y} x2={pt.x} y2={pt.y-6} stroke="rgba(210,235,255,0.95)" strokeWidth="1.2"/>
              <line x1={pt.x-3.5} y1={pt.y-3} x2={pt.x+3.5} y2={pt.y-3} stroke="rgba(210,235,255,0.95)" strokeWidth="1.2"/>
            </g>
          ))}

          {/* Floor crystals */}
          {[[48,165],[68,170],[200,163],[222,168],[256,165]].map(([x,y],i) => (
            <polygon key={i} points={`${x},${y} ${x+5},${y-12} ${x+10},${y}`} fill="rgba(160,210,255,0.2)"/>
          ))}

          {/* Cave wall texture dots */}
          {[[15,50],[260,55],[12,120],[268,118],[140,20]].map(([x,y],i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,255,255,0.06)"/>
          ))}
        </svg>

        {/* Caption */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid #f0f0f0' }}>
          <span style={{ fontSize: '10px', color: '#aaa', fontFamily: 'system-ui' }}>Precision vetting process</span>
          <div className="flex items-center gap-1.5">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#111' }}/>
            <span style={{ fontSize: '10px', color: '#aaa', fontFamily: 'system-ui' }}>100% verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsultingVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [showReply, setShowReply] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  useEffect(() => {
    if (!entered) return;
    const t1 = setTimeout(() => setShowReply(true), 600);
    const t2 = setTimeout(() => setShowStatus(true), 1100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [entered]);
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Expert Support</div>
          <div style={{ fontSize: '9px', color: '#bbb', marginTop: '1px' }}>Dedicated brand team</div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#f5f5f5', opacity: entered ? 1 : 0, transition: 'opacity 0.4s ease 0.05s' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#111', animation: inView ? 'pulse 2s infinite' : 'none' }} />
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#111' }}>&lt;5 min response</span>
        </div>
      </div>
      <div className="px-5 py-4">
        <div className="space-y-3">
          {/* Brand message */}
          <div className="flex gap-2"
            style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s' }}>
            <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: '#f0f0f0', border: '1px solid #ebebeb' }} />
            <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs" style={{ background: '#f5f5f5', color: '#333' }}>
              We need a creator strategy for Q2 launch.
            </div>
          </div>
          {/* Elevate reply — left/receiving side */}
          <div className="flex gap-2"
            style={{ opacity: showReply ? 1 : 0, transform: showReply ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
            <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden" style={{ background: '#111' }}>
              <img src="/elevate solid white logo ver.jpeg" alt="Elevate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs max-w-[80%]" style={{ background: '#111', color: '#fff' }}>
              I'll put together a tailored creator brief and shortlist by tomorrow.
            </div>
          </div>
          {/* Status */}
          <div className="flex items-center gap-2 pt-1"
            style={{ opacity: showStatus ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#111' }} />
            <span className="text-[10px]" style={{ color: '#888' }}>Avg. response time: &lt;5 min</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ViralDistributionVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const platforms = [
    { platform: 'TikTok',    reach: '50M+', pct: 82, delay: 0 },
    { platform: 'Instagram', reach: '35M+', pct: 68, delay: 0.08 },
    { platform: 'YouTube',   reach: '28M+', pct: 55, delay: 0.16 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Reach Potential</div>
          <div style={{ fontSize: '9px', color: '#bbb', marginTop: '1px' }}>Across platforms</div>
        </div>
      </div>
      <div className="px-5 py-3">
        <div className="space-y-3">
          {platforms.map((p) => (
            <div key={p.platform}
              style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: `opacity 0.45s ease ${p.delay}s, transform 0.45s ease ${p.delay}s` }}>
              <div className="flex items-center justify-between mb-1.5">
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#111' }}>{p.platform}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{p.reach}</span>
              </div>
              <div className="w-full rounded-full" style={{ height: '5px', background: '#f0f0f0' }}>
                <div className="rounded-full" style={{
                  height: '5px',
                  background: '#111',
                  width: entered ? `${p.pct}%` : '0%',
                  transition: `width 0.9s cubic-bezier(0.22,1,0.36,1) ${p.delay + 0.2}s`,
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiddlemanVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Funds deposited',    icon: '↓', side: 'brand' },
    { label: 'Terms locked',       icon: '⚿', side: 'center' },
    { label: 'Work delivered',     icon: '✓', side: 'creator' },
    { label: 'Payment released',   icon: '→', side: 'brand' },
  ];
  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1800);
    return () => clearInterval(t);
  }, [entered]);

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Deal Protection</div>
          <div style={{ fontSize: '9px', color: '#bbb', marginTop: '1px' }}>Secure & transparent</div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#f5f5f5', opacity: entered ? 1 : 0, transition: 'opacity 0.4s ease 0.05s' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#111', animation: inView ? 'pulse 2s infinite' : 'none' }} />
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#111' }}>Escrow active</span>
        </div>
      </div>

      {/* Three-party diagram */}
      <div className="px-5 pt-4 pb-2" style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s' }}>
        <div className="flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f5f5f5', border: '1px solid #ebebeb' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="6" width="12" height="8" rx="1.5" stroke="#111" strokeWidth="1.2"/>
                <path d="M5 6V4.5a3 3 0 016 0V6" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: '8px', fontWeight: 600, color: '#111' }}>Brand</span>
          </div>

          {/* Arrow left */}
          <div style={{ flex: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ height: '1px', flex: 1, background: step === 0 || step === 3 ? '#111' : '#e0e0e0', transition: 'background 0.4s ease' }}/>
            <div style={{ width: '5px', height: '5px', borderTop: '1.5px solid', borderRight: '1.5px solid', borderColor: step === 0 || step === 3 ? '#111' : '#e0e0e0', transform: 'rotate(45deg)', marginLeft: '-3px', transition: 'border-color 0.4s ease' }}/>
          </div>

          {/* Elevate center */}
          <div className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ background: '#111', border: '1px solid #111' }}>
              <img src="/elevate solid white logo ver.jpeg" alt="Elevate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '8px', fontWeight: 600, color: '#111' }}>Elevate</span>
          </div>

          {/* Arrow right */}
          <div style={{ flex: 0.6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ height: '1px', flex: 1, background: step === 1 || step === 2 ? '#111' : '#e0e0e0', transition: 'background 0.4s ease' }}/>
            <div style={{ width: '5px', height: '5px', borderTop: '1.5px solid', borderRight: '1.5px solid', borderColor: step === 1 || step === 2 ? '#111' : '#e0e0e0', transform: 'rotate(45deg)', marginLeft: '-3px', transition: 'border-color 0.4s ease' }}/>
          </div>

          {/* Creator */}
          <div className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f5f5f5', border: '1px solid #ebebeb' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5.5" r="2.5" stroke="#111" strokeWidth="1.2"/>
                <path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontSize: '8px', fontWeight: 600, color: '#111' }}>Creator</span>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="px-5 pb-4" style={{ opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.25s' }}>
        <div className="space-y-1.5 mt-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5"
              style={{ opacity: step === i ? 1 : 0.3, transition: 'opacity 0.35s ease' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: step === i ? '#111' : '#f0f0f0', transition: 'background 0.35s ease' }}>
                <span style={{ fontSize: '8px', color: step === i ? '#fff' : '#888' }}>{s.icon}</span>
              </div>
              <span style={{ fontSize: '10px', fontWeight: step === i ? 600 : 400, color: '#111' }}>{s.label}</span>
              {step === i && (
                <div className="ml-auto px-1.5 py-0.5 rounded" style={{ background: '#f5f5f5' }}>
                  <span style={{ fontSize: '8px', fontWeight: 600, color: '#111' }}>Active</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getVisualComponent(visual: BrandFeature['visual']) {
  switch (visual) {
    case 'sponsorships': return <SponsorshipsVisual />;
    case 'content-strategy': return <AnalyticsVisual />;
    case 'viral': return <ViralDistributionVisual />;
    case 'consulting': return <ConsultingVisual />;
    case 'brand-partnerships': return <BrandPartnershipsVisual />;
    case 'middleman': return <MiddlemanVisual />;
    default: return <CreatorNetworkVisual />;
  }
}

// --- Feature Section Component ---

function FeatureSection({ feature, index }: { feature: BrandFeature; index: number }) {
  const { ref, isVisible } = useScrollAnimation(0.2);
  const isReversed = index % 2 !== 0;

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-20 md:mb-32`}
    >
      <div className={`${isReversed ? 'lg:order-2' : ''} scroll-hidden${isVisible ? ` ${isReversed ? 'scroll-reveal-right' : 'scroll-reveal-left'}` : ''}`}>
        <div className="mb-4">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)'
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
            letterSpacing: '-0.02em'
          }}
        >
          {feature.title}
        </h3>
        <p
          className="text-base leading-relaxed max-w-md"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#cccccc',
            fontWeight: 400
          }}
        >
          {feature.description}
        </p>
      </div>
      <div className={`${isReversed ? 'lg:order-1' : ''} scroll-hidden${isVisible ? ` ${isReversed ? 'scroll-reveal-left' : 'scroll-reveal-right'}` : ''}`} style={{ isolation: 'isolate' }}>
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#000000' }}>
          {getVisualComponent(feature.visual)}
        </div>
      </div>
    </div>
  );
}

// --- FAQ Component ---

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '12px',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-5 text-left flex items-center justify-between"
        style={{ background: isOpen ? 'rgba(255, 255, 255, 0.02)' : 'transparent' }}
      >
        <span
          className="text-base md:text-lg font-medium pr-4 leading-tight"
          style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: '#ffffff', fontWeight: 500 }}
        >
          {question}
        </span>
        <svg
          className="flex-shrink-0"
          width="20" height="20" viewBox="0 0 20 20" fill="none"
          style={{ color: '#999', transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
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
          <div className="px-5 pb-5">
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '16px' }}>
              <p
                className="text-base leading-relaxed"
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(204, 204, 204)', fontWeight: 400 }}
              >
                {answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export function LearnBrands() {
  const navigate = useNavigate();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation(0.1);
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation(0.1);
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation(0.1);

  const handleBrandSignup = () => {
    navigate('/signup?source=brand');
  };

  return (
    <div
      className="bg-black min-h-screen"
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.03\'/%3E%3C/svg%3E")'
      }}
    >
      <Header />

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 md:pt-32 pb-20">
        {/* Hero Section */}
        <div
          ref={heroRef}
          className={`text-center mb-20 md:mb-28 scroll-hidden${heroVisible ? ' scroll-blur-emerge' : ''}`}
        >
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-normal leading-snug"
            style={{ fontFamily: 'Fraunces, serif', color: '#ffffff', letterSpacing: '-0.02em' }}
          >
            <span style={{ fontWeight: 600 }}>Partner with Creators</span>
            <br />
            That Move Culture
          </h1>
          <p 
            className="text-base md:text-lg mt-6 max-w-2xl mx-auto"
            style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(204, 204, 204)', lineHeight: '1.7', fontWeight: 400 }}
          >
            Connect with authentic voices that resonate with your audience. Drive real results through strategic creator partnerships.
          </p>
        </div>

        {/* Features */}
        <div className="mb-20 md:mb-32">
          {brandFeatures.map((feature, index) => (
            <FeatureSection key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* FAQ Section */}
        <div
          ref={faqRef}
          className={`max-w-3xl mx-auto text-center scroll-hidden${faqVisible ? ' scroll-blur-emerge' : ''}`}
        >
          <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-normal mb-4"
              style={{ fontFamily: 'Fraunces, serif', color: '#ffffff', letterSpacing: '-0.02em' }}
            >
              Frequently Asked <span style={{ fontWeight: 600 }}>Questions</span>
            </h2>
            <p 
              className="text-base md:text-lg mx-auto"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(204, 204, 204)', fontWeight: 400 }}
            >
              Everything you need to know about partnering with brands on Elevate
            </p>
          <div className="space-y-6 mt-12">
            {brandFAQ.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        ref={ctaRef}
        className={`max-w-7xl mx-auto px-4 md:px-6 pb-24 scroll-hidden${ctaVisible ? ' scroll-reveal-up' : ''}`}
      >
        <div className="text-center">
          <button
            onClick={handleBrandSignup}
            className="group relative w-full sm:w-auto px-12 md:px-16 py-4 md:py-5 rounded-xl text-base md:text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              color: '#000000',
              boxShadow: '0 4px 24px rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            Sign up as a Brand
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 md:py-10 border-t border-white/5">
        <p className="text-neutral-500 text-xs md:text-sm text-center tracking-wide">
          © 2025 Elevate. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
