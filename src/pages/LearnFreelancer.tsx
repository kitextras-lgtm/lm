import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface FreelancerFeature {
  tag: string;
  title: string;
  description: string;
  visual: 'marketplace' | 'payments' | 'career' | 'matching' | 'flexible' | 'support';
}

const freelancerFeatures: FreelancerFeature[] = [
  {
    tag: 'Marketplace',
    title: 'Clients from\naround the world',
    description: 'Access a worldwide network of clients looking for your skills. Our platform connects you with high-quality projects across industries.',
    visual: 'marketplace'
  },
  {
    tag: 'Payments',
    title: 'Get paid on\ntime, every time',
    description: 'Our payment protection ensures your work is compensated fairly with multiple payout options including PayPal, wire transfer, and direct deposit.',
    visual: 'payments'
  },
  {
    tag: 'Growth',
    title: 'Build your\nreputation',
    description: 'Build your reputation with verified reviews and a professional profile. Our tools help you showcase your best work and attract premium clients.',
    visual: 'career'
  },
  {
    tag: 'Matching',
    title: 'Projects that\nfit your skills',
    description: 'Our intelligent matching system connects you with projects that align with your expertise, ensuring you work on what you do best.',
    visual: 'matching'
  },
  {
    tag: 'Flexibility',
    title: 'Work on\nyour terms',
    description: 'Set your own rates, choose your hours, and work from anywhere. You have full control over your freelance career.',
    visual: 'flexible'
  },
  {
    tag: 'Support',
    title: 'Real people,\nreal fast',
    description: 'Priority, human-first support built specifically for freelancers. Fast responses, real solutions, and guidance when you need it.',
    visual: 'support'
  }
];

const freelancerFAQ = [
  {
    question: "What types of freelancers does Elevate work with?",
    answer: "Elevate works with freelancers across a wide range of disciplines including design, development, writing, marketing, video production, consulting, and more. We welcome skilled professionals who are passionate about delivering quality work."
  },
  {
    question: "How do I get paid for my work?",
    answer: "We handle payments through our trusted partner, Tipalti. When it's time for your payout, our finance team will guide you through the onboarding process, allowing you to select your preferred payment method, whether PayPal, wire transfer, or direct bank deposit."
  },
  {
    question: "Is there a fee to join as a freelancer?",
    answer: "There's no upfront cost to join Elevate as a freelancer. We operate on a service fee model where a small percentage is deducted from your earnings to cover platform services, payment protection, and customer support."
  },
  {
    question: "How does Elevate protect my work and payments?",
    answer: "We use escrow-based payment protection. Clients fund projects before work begins, and payments are released upon completion. This ensures you always get paid for your approved work."
  },
  {
    question: "Can I set my own rates?",
    answer: "Yes, you have full control over your hourly rate and project pricing. You can adjust your rate at any time and set different rates for different types of projects."
  },
  {
    question: "Can I work with clients outside of Elevate?",
    answer: "Yes, you can work with other clients and platforms while using Elevate. We believe in flexibility and do not impose exclusive restrictions that limit your opportunities for growth."
  }
];

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

// --- Visual Mockup Components ---

function NetworkingRoom({ entered }: { entered: boolean }) {
  const [bubble, setBubble] = useState(0);
  const msgs = ['Love your portfolio!', "Let's collaborate", 'Open to projects?', 'Great work!'];
  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setBubble(b => (b + 1) % msgs.length), 2000);
    return () => clearInterval(t);
  }, [entered]);

  // Tight bubble widths: measure text at ~6px per char + padding
  const pad = 16;
  const bw = msgs.map(m => m.length * 5.6 + pad);

  return (
    <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(10px)', transition: 'opacity 0.55s ease 0.35s, transform 0.55s ease 0.35s' }}>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(160deg,#1a1a1a 0%,#111 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <svg viewBox="0 0 280 175" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ display: 'block' }}>

          {/* Floor shadow */}
          <ellipse cx="140" cy="163" rx="128" ry="10" fill="rgba(255,255,255,0.03)" />

          {/* ── Person A — far left — Male, dark skin, short hair ── */}
          {/* Shadow */}
          <ellipse cx="42" cy="162" rx="11" ry="3.5" fill="rgba(0,0,0,0.35)" />
          {/* Legs */}
          <rect x="36" y="140" width="5" height="22" rx="2.5" fill="#1a202c" />
          <rect x="43" y="140" width="5" height="22" rx="2.5" fill="#1a202c" />
          {/* Body */}
          <rect x="33" y="112" width="18" height="30" rx="5" fill="#2563eb" />
          {/* Left arm — relaxed down */}
          <path d="M33 118 Q26 126 27 136" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Right arm — relaxed down */}
          <path d="M51 118 Q58 126 57 136" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Neck */}
          <rect x="39" y="106" width="6" height="8" rx="3" fill="#6b3a2a" />
          {/* Head */}
          <circle cx="42" cy="99" r="10" fill="#6b3a2a" />
          {/* Eyes */}
          <circle cx="39" cy="98" r="1.2" fill="#1a0a00" />
          <circle cx="45" cy="98" r="1.2" fill="#1a0a00" />
          {/* Smile */}
          <path d="M39 102 Q42 105 45 102" stroke="#1a0a00" strokeWidth="1" strokeLinecap="round" fill="none" />
          {/* Short hair — close crop */}
          <path d="M32 97 Q33 88 42 87 Q51 88 52 97 Q50 90 42 89 Q34 90 32 97Z" fill="#1a0a00" />

          {/* ── Person B — center-left — Female, light skin, long hair ── */}
          <ellipse cx="90" cy="162" rx="11" ry="3.5" fill="rgba(0,0,0,0.33)" />
          <rect x="84" y="140" width="5" height="22" rx="2.5" fill="#374151" />
          <rect x="91" y="140" width="5" height="22" rx="2.5" fill="#374151" />
          {/* Dress/skirt body */}
          <path d="M80 112 Q80 138 85 142 L95 142 Q100 138 100 112Z" fill="#9333ea" />
          <rect x="80" y="110" width="20" height="16" rx="5" fill="#9333ea" />
          {/* Left arm — relaxed */}
          <path d="M80 116 Q73 124 74 134" stroke="#9333ea" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Right arm — relaxed */}
          <path d="M100 116 Q107 124 106 134" stroke="#9333ea" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Neck */}
          <rect x="87" y="104" width="6" height="8" rx="3" fill="#f5d5b8" />
          {/* Head */}
          <circle cx="90" cy="97" r="10" fill="#f5d5b8" />
          {/* Eyes */}
          <circle cx="87" cy="96" r="1.2" fill="#2d1b00" />
          <circle cx="93" cy="96" r="1.2" fill="#2d1b00" />
          {/* Smile */}
          <path d="M87 100 Q90 103 93 100" stroke="#2d1b00" strokeWidth="1" strokeLinecap="round" fill="none" />
          {/* Long hair — flows past shoulders */}
          <path d="M80 95 Q80 87 90 86 Q100 87 100 95 Q99 88 90 87 Q81 88 80 95Z" fill="#7c3f00" />
          <path d="M80 95 Q78 108 80 118" stroke="#7c3f00" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M100 95 Q102 108 100 118" stroke="#7c3f00" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* ── Person C — center — Male, medium skin, curly hair ── */}
          <ellipse cx="140" cy="162" rx="11" ry="3.5" fill="rgba(0,0,0,0.31)" />
          <rect x="134" y="140" width="5" height="22" rx="2.5" fill="#1a202c" />
          <rect x="141" y="140" width="5" height="22" rx="2.5" fill="#1a202c" />
          <rect x="131" y="110" width="18" height="32" rx="5" fill="#16a34a" />
          {/* Left arm — slightly raised, conversational */}
          <path d="M131 116 Q122 120 124 130" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" fill="none" />
          {/* Right arm — slightly raised */}
          <path d="M149 116 Q157 120 155 130" stroke="#16a34a" strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="137" y="104" width="6" height="8" rx="3" fill="#c68642" />
          <circle cx="140" cy="97" r="10" fill="#c68642" />
          <circle cx="137" cy="96" r="1.2" fill="#1a0a00" />
          <circle cx="143" cy="96" r="1.2" fill="#1a0a00" />
          <path d="M137 100 Q140 103 143 100" stroke="#1a0a00" strokeWidth="1" strokeLinecap="round" fill="none" />
          {/* Curly hair */}
          <circle cx="133" cy="93" r="4.5" fill="#1a0a00" />
          <circle cx="140" cy="90" r="5" fill="#1a0a00" />
          <circle cx="147" cy="93" r="4.5" fill="#1a0a00" />
          <circle cx="136" cy="97" r="3.5" fill="#1a0a00" />
          <circle cx="144" cy="97" r="3.5" fill="#1a0a00" />

          {/* ── Person D — center-right — Female, tan skin, ponytail ── */}
          <ellipse cx="190" cy="162" rx="11" ry="3.5" fill="rgba(0,0,0,0.29)" />
          <rect x="184" y="140" width="5" height="22" rx="2.5" fill="#374151" />
          <rect x="191" y="140" width="5" height="22" rx="2.5" fill="#374151" />
          {/* Dress body */}
          <path d="M180 112 Q180 138 185 142 L195 142 Q200 138 200 112Z" fill="#e11d48" />
          <rect x="180" y="110" width="20" height="16" rx="5" fill="#e11d48" />
          <path d="M180 116 Q173 124 174 134" stroke="#e11d48" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M200 116 Q207 124 206 134" stroke="#e11d48" strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="187" y="104" width="6" height="8" rx="3" fill="#d4956a" />
          <circle cx="190" cy="97" r="10" fill="#d4956a" />
          <circle cx="187" cy="96" r="1.2" fill="#2d1b00" />
          <circle cx="193" cy="96" r="1.2" fill="#2d1b00" />
          <path d="M187 100 Q190 103 193 100" stroke="#2d1b00" strokeWidth="1" strokeLinecap="round" fill="none" />
          {/* Ponytail */}
          <path d="M180 93 Q181 86 190 85 Q199 86 200 93 Q198 87 190 86 Q182 87 180 93Z" fill="#5c3317" />
          <path d="M190 85 Q193 80 191 75" stroke="#5c3317" strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* ── Person E — far right — Male, light skin, side-part hair ── */}
          <ellipse cx="238" cy="162" rx="11" ry="3.5" fill="rgba(0,0,0,0.27)" />
          <rect x="232" y="140" width="5" height="22" rx="2.5" fill="#1a202c" />
          <rect x="239" y="140" width="5" height="22" rx="2.5" fill="#1a202c" />
          <rect x="229" y="112" width="18" height="30" rx="5" fill="#92400e" />
          <path d="M229 118 Q222 126 223 136" stroke="#92400e" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M247 118 Q254 126 253 136" stroke="#92400e" strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="235" y="106" width="6" height="8" rx="3" fill="#f5cba7" />
          <circle cx="238" cy="99" r="10" fill="#f5cba7" />
          <circle cx="235" cy="98" r="1.2" fill="#2d1b00" />
          <circle cx="241" cy="98" r="1.2" fill="#2d1b00" />
          <path d="M235 102 Q238 105 241 102" stroke="#2d1b00" strokeWidth="1" strokeLinecap="round" fill="none" />
          {/* Side-part hair */}
          <path d="M228 96 Q229 88 238 87 Q247 88 248 96 Q245 89 238 88 Q231 89 228 96Z" fill="#5c3317" />
          <path d="M228 96 Q229 91 235 90" stroke="#5c3317" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* ── Dashed connection lines ── */}
          <line x1="53" y1="128" x2="80" y2="128" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="100" y1="128" x2="131" y2="128" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="149" y1="128" x2="180" y2="128" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="200" y1="128" x2="229" y2="128" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />

          {/* ── Speech bubble 0 — above Person A ── */}
          <g style={{ opacity: bubble === 0 ? 1 : 0, transition: 'opacity 0.35s ease' }}>
            <rect x="8" y="72" width={bw[0]} height="16" rx="7" fill="rgba(255,255,255,0.95)" />
            <polygon points={`${26},${88} ${32},${88} ${28},${93}`} fill="rgba(255,255,255,0.95)" />
            <text x="16" y="83.5" fontSize="6.5" fontFamily="system-ui" fontWeight="600" fill="#111">{msgs[0]}</text>
          </g>

          {/* ── Speech bubble 1 — above Person B ── */}
          <g style={{ opacity: bubble === 1 ? 1 : 0, transition: 'opacity 0.35s ease' }}>
            <rect x="58" y="68" width={bw[1]} height="16" rx="7" fill="rgba(255,255,255,0.95)" />
            <polygon points={`${76},${84} ${82},${84} ${78},${89}`} fill="rgba(255,255,255,0.95)" />
            <text x="66" y="79.5" fontSize="6.5" fontFamily="system-ui" fontWeight="600" fill="#111">{msgs[1]}</text>
          </g>

          {/* ── Speech bubble 2 — above Person D ── */}
          <g style={{ opacity: bubble === 2 ? 1 : 0, transition: 'opacity 0.35s ease' }}>
            <rect x="158" y="68" width={bw[2]} height="16" rx="7" fill="rgba(255,255,255,0.95)" />
            <polygon points={`${176},${84} ${182},${84} ${178},${89}`} fill="rgba(255,255,255,0.95)" />
            <text x="166" y="79.5" fontSize="6.5" fontFamily="system-ui" fontWeight="600" fill="#111">{msgs[2]}</text>
          </g>

          {/* ── Speech bubble 3 — above Person E ── */}
          <g style={{ opacity: bubble === 3 ? 1 : 0, transition: 'opacity 0.35s ease' }}>
            <rect x="206" y="72" width={bw[3]} height="16" rx="7" fill="rgba(255,255,255,0.95)" />
            <polygon points={`${224},${88} ${230},${88} ${226},${93}`} fill="rgba(255,255,255,0.95)" />
            <text x="214" y="83.5" fontSize="6.5" fontFamily="system-ui" fontWeight="600" fill="#111">{msgs[3]}</text>
          </g>

          {/* Ambient dots */}
          {[[30,58],[110,48],[200,52],[255,60]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="1.8" fill="rgba(255,255,255,0.12)"
              style={{ animation: `pulse ${1.5 + i * 0.35}s ease-in-out infinite alternate` }} />
          ))}
        </svg>

        {/* Caption bar */}
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'system-ui' }}>Live networking room</span>
          <div className="flex items-center gap-1.5">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', fontFamily: 'system-ui' }}>247 online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketplaceVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const projects = [
    { client: 'Tech Startup',   project: 'Brand Identity Design', budget: '$4,500', flag: 'US', delay: 0 },
    { client: 'E-commerce Co.', project: 'Product Photography',   budget: '$2,800', flag: 'UK', delay: 0.08 },
    { client: 'SaaS Platform',  project: 'UI/UX Redesign',        budget: '$7,200', flag: 'DE', delay: 0.16 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Active Requests</div>
          <div style={{ fontSize: '9px', color: '#bbb', marginTop: '1px' }}>Matched to your skills</div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#f5f5f5', opacity: entered ? 1 : 0, transition: 'opacity 0.4s ease 0.05s' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#111', animation: inView ? 'pulse 2s infinite' : 'none' }} />
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#111' }}>47 new this week</span>
        </div>
      </div>
      {/* Project rows */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.project} className="flex items-center gap-3"
              style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: `opacity 0.45s ease ${p.delay}s, transform 0.45s ease ${p.delay}s` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: '#f5f5f5', color: '#555', border: '1px solid #ebebeb' }}>{p.flag}</div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#111' }}>{p.project}</div>
                <div style={{ fontSize: '9px', color: '#bbb' }}>{p.client}</div>
              </div>
              <div className="flex-shrink-0 px-2 py-1 rounded-lg" style={{ background: '#f5f5f5' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{p.budget}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Networking room */}
      <div className="p-4">
        <NetworkingRoom entered={entered} />
      </div>
    </div>
  );
}

const CALENDAR_PAGES = [
  { month: 'January',  day: '01', year: '2025', earnings: '$6,200',  daysInMonth: 31, startDay: 3 },
  { month: 'February', day: '15', year: '2025', earnings: '$8,400',  daysInMonth: 28, startDay: 6 },
  { month: 'March',    day: '22', year: '2025', earnings: '$5,900',  daysInMonth: 31, startDay: 6 },
  { month: 'April',    day: '08', year: '2025', earnings: '$11,200', daysInMonth: 30, startDay: 2 },
  { month: 'May',      day: '30', year: '2025', earnings: '$9,750',  daysInMonth: 31, startDay: 4 },
  { month: 'June',     day: '14', year: '2025', earnings: '$13,100', daysInMonth: 30, startDay: 0 },
];

function FlipCalendar({ entered }: { entered: boolean }) {
  const [pageIndex, setPageIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (!entered) return;
    const interval = setInterval(() => {
      setFlipping(true);
      setTimeout(() => {
        setPageIndex(i => (i + 1) % CALENDAR_PAGES.length);
        setFlipping(false);
      }, 380);
    }, 2200);
    return () => clearInterval(interval);
  }, [entered]);

  const cur  = CALENDAR_PAGES[pageIndex];
  const next = CALENDAR_PAGES[(pageIndex + 1) % CALENDAR_PAGES.length];

  return (
    <div style={{ perspective: '800px', width: '100%' }}>
      <style>{`
        @keyframes flipTopLeave {
          0%   { transform: rotateX(0deg);    opacity: 1; }
          100% { transform: rotateX(-90deg);  opacity: 0; }
        }
        @keyframes flipBottomEnter {
          0%   { transform: rotateX(90deg);   opacity: 0; }
          100% { transform: rotateX(0deg);    opacity: 1; }
        }
      `}</style>

      {/* Calendar body */}
      <div className="relative rounded-2xl overflow-hidden select-none"
        style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', transformStyle: 'preserve-3d' }}>

        {/* Binding rings */}
        <div className="absolute top-0 left-0 right-0 flex justify-around px-6 z-20" style={{ height: '0px' }}>
          {[0,1,2,3].map(i => (
            <div key={i} className="relative" style={{ top: '-6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2.5px solid #bbb', background: '#f5f5f5', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)' }} />
            </div>
          ))}
        </div>

        {/* Month header strip */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3"
          style={{ background: '#111', borderRadius: '16px 16px 0 0' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontFamily: 'system-ui' }}>
              {flipping ? next.year : cur.year}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', fontFamily: 'system-ui', letterSpacing: '-0.01em' }}>
              {flipping ? next.month : cur.month}
            </div>
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', fontFamily: 'system-ui' }}>Payout month</div>
        </div>

        {/* Flip area — top half (leaves) */}
        <div style={{ position: 'relative', overflow: 'hidden', transformStyle: 'preserve-3d' }}>
          {/* Static bottom half (next page showing through) */}
          <div className="flex flex-col items-center justify-center"
            style={{ padding: '12px 20px 8px', background: '#f7f7f7', borderBottom: '1px solid #e8e8e8' }}>
            <div style={{ fontSize: '52px', fontWeight: 800, color: '#111', lineHeight: 1, fontFamily: 'system-ui', letterSpacing: '-0.03em' }}>
              {next.day}
            </div>
          </div>

          {/* Flipping top half */}
          <div className="flex flex-col items-center justify-center absolute inset-0"
            style={{
              padding: '12px 20px 8px',
              background: '#fff',
              transformOrigin: 'bottom center',
              animation: flipping ? `flipTopLeave 0.38s cubic-bezier(0.4,0,0.6,1) forwards` : 'none',
              zIndex: 10,
            }}>
            <div style={{ fontSize: '52px', fontWeight: 800, color: '#111', lineHeight: 1, fontFamily: 'system-ui', letterSpacing: '-0.03em' }}>
              {cur.day}
            </div>
          </div>
        </div>

        {/* Bottom section — earnings */}
        <div className="flex items-center justify-between px-5 py-3"
          style={{ background: '#fff' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#aaa', fontFamily: 'system-ui' }}>Monthly payout</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#111', fontFamily: 'system-ui', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {flipping ? next.earnings : cur.earnings}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f0f0f0', borderRadius: '20px', padding: '4px 10px' }}>
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M5 8V2M2 5l3-3 3 3" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#111', fontFamily: 'system-ui' }}>On time</span>
          </div>
        </div>

        {/* Mini calendar grid */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center" style={{ fontSize: '8px', color: '#bbb', fontFamily: 'system-ui', fontWeight: 600 }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: 42 }, (_, i) => {
              const dayNum = i - cur.startDay + 1;
              const isValid = dayNum >= 1 && dayNum <= cur.daysInMonth;
              const isToday = dayNum === parseInt(cur.day);
              return (
                <div key={i} className="flex items-center justify-center"
                  style={{ height: '16px', borderRadius: '4px', background: isToday ? '#111' : 'transparent' }}>
                  {isValid && (
                    <span style={{ fontSize: '7px', fontWeight: isToday ? 700 : 400, color: isToday ? '#fff' : '#888', fontFamily: 'system-ui' }}>
                      {dayNum}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const balance  = useCountUp(3240,  1400, entered);
  const lifetime = useCountUp(28450, 1800, entered);
  const txns = [
    { date: 'Feb 15', desc: 'Brand Identity Project', amount: '+$4,500', delay: 0 },
    { date: 'Feb 8',  desc: 'UI/UX Consultation',     amount: '+$1,200', delay: 0.08 },
    { date: 'Feb 1',  desc: 'Logo Design Package',    amount: '+$2,800', delay: 0.16 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      {/* Header bar */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex items-center justify-between mb-4"
          style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#aaa', letterSpacing: '0.1em' }}>Earnings</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#f5f5f5' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#111', animation: inView ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#111' }}>Live</span>
          </div>
        </div>
        {/* Big balance */}
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: 'opacity 0.45s ease 0.05s, transform 0.45s ease 0.05s' }}>
          <div style={{ fontSize: '9px', color: '#aaa', fontFamily: 'system-ui', marginBottom: '2px' }}>Available balance</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'system-ui' }}>${balance.toLocaleString()}</div>
        </div>
      </div>
      {/* Lifetime stat */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.45s ease 0.12s, transform 0.45s ease 0.12s' }}>
        <span style={{ fontSize: '10px', color: '#aaa' }}>Lifetime earnings</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>${lifetime.toLocaleString()}</span>
      </div>
      {/* Transactions */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: '9px', fontWeight: 600, color: '#bbb', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', opacity: entered ? 1 : 0, transition: 'opacity 0.4s ease 0.18s' }}>Recent</div>
        <div className="space-y-2.5">
          {txns.map((t) => (
            <div key={t.date} className="flex items-center justify-between"
              style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(5px)', transition: `opacity 0.4s ease ${t.delay + 0.22}s, transform 0.4s ease ${t.delay + 0.22}s` }}>
              <div className="flex items-center gap-2.5">
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="#111" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#111' }}>{t.desc}</div>
                  <div style={{ fontSize: '9px', color: '#bbb' }}>{t.date}</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{t.amount}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Flipping calendar */}
      <div className="p-4" style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(10px)', transition: 'opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s' }}>
        <FlipCalendar entered={entered} />
      </div>
    </div>
  );
}

function CareerVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const projects = useCountUp(47, 1200, entered);
  const reviews  = useCountUp(43, 1200, entered);
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="flex items-center gap-3 mb-4"
        style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: 'opacity 0.45s ease, transform 0.45s ease' }}>
        <div className="w-12 h-12 rounded-full" style={{ background: '#e5e7eb' }} />
        <div>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Your Profile</div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} width="11" height="11" viewBox="0 0 20 20" fill="#111">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
            <span className="text-xs font-medium ml-1" style={{ color: '#111' }}>5.0</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Projects', value: projects, delay: 0.05 },
          { label: 'Reviews',  value: reviews,  delay: 0.12 },
          { label: 'Repeat',   value: '89%',    delay: 0.19 },
        ].map((s) => (
          <div key={s.label} className="text-center p-2.5 rounded-xl"
            style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: `opacity 0.45s ease ${s.delay}s, transform 0.45s ease ${s.delay}s` }}>
            <div className="text-sm font-bold" style={{ color: '#111' }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl"
        style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.45s ease 0.3s, transform 0.45s ease 0.3s' }}>
        <div className="text-xs font-medium mb-1" style={{ color: '#111' }}>"Exceptional work and communication"</div>
        <div className="text-[10px]" style={{ color: '#888' }}>— Recent client review</div>
      </div>
    </div>
  );
}

function MatchingVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const skills = [
    { skill: 'UI/UX Design',    pct: 98, projects: '12 available', delay: 0 },
    { skill: 'Brand Identity',  pct: 95, projects: '8 available',  delay: 0.08 },
    { skill: 'Motion Graphics', pct: 87, projects: '5 available',  delay: 0.16 },
    { skill: 'Web Development', pct: 82, projects: '15 available', delay: 0.24 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>Skill Match</div>
      <div className="space-y-3">
        {skills.map((s) => (
          <div key={s.skill}
            style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: `opacity 0.45s ease ${s.delay}s, transform 0.45s ease ${s.delay}s` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: '#111' }}>{s.skill}</span>
              <span className="text-xs font-bold" style={{ color: '#111' }}>{s.pct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ width: entered ? `${s.pct}%` : '0%', background: '#111', transition: `width 0.7s cubic-bezier(0.34,1,0.64,1) ${s.delay + 0.1}s` }} />
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>{s.projects}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlexibleVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const days   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const widths = [75, 100, 50, 100, 25];
  const hours  = [6, 8, 4, 8, 2];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>Your Schedule</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Hourly Rate', value: '$85/hr', delay: 0.05 },
          { label: 'This Week',   value: '24 hrs', delay: 0.12 },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-xl"
            style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: `opacity 0.45s ease ${s.delay}s, transform 0.45s ease ${s.delay}s` }}>
            <div className="text-[10px]" style={{ color: '#888' }}>{s.label}</div>
            <div className="text-lg font-bold" style={{ color: '#111' }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        {days.map((day, i) => (
          <div key={day} className="flex items-center gap-3"
            style={{ opacity: entered ? 1 : 0, transition: `opacity 0.4s ease ${0.2 + i * 0.06}s` }}>
            <span className="text-[10px] w-8" style={{ color: '#888' }}>{day}</span>
            <div className="flex-1 h-2.5 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ width: entered ? `${widths[i]}%` : '0%', background: '#111', transition: `width 0.65s cubic-bezier(0.34,1,0.64,1) ${0.25 + i * 0.06}s` }} />
            </div>
            <span className="text-[10px] w-8 text-right" style={{ color: '#555' }}>{hours[i]}h</span>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 rounded-xl text-center text-[10px]"
        style={{ background: '#f0f0f0', color: '#111', opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.55s' }}>
        You set the hours — we find the work
      </div>
    </div>
  );
}

function FreelancerSupportVisual() {
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
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>Priority Support</div>
      <div className="space-y-3">
        {/* User message */}
        <div className="flex gap-2"
          style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s' }}>
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#111', color: '#fff' }}>Y</div>
          <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs" style={{ background: '#f0f0f0', color: '#333' }}>
            A client hasn't responded in 3 days. Can you help?
          </div>
        </div>
        {/* Support reply */}
        <div className="flex gap-2 justify-end"
          style={{ opacity: showReply ? 1 : 0, transform: showReply ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs max-w-[80%]" style={{ background: '#111', color: '#fff' }}>
            I've reached out to the client directly. They'll respond within 24 hours or we'll release your payment from escrow.
          </div>
          <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden" style={{ background: '#111' }}>
            <img src="/elevate solid white logo ver.jpeg" alt="Elevate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
  );
}

function FreelancerFeatureVisual({ type }: { type: FreelancerFeature['visual'] }) {
  switch (type) {
    case 'marketplace': return <MarketplaceVisual />;
    case 'payments': return <PaymentsVisual />;
    case 'career': return <CareerVisual />;
    case 'matching': return <MatchingVisual />;
    case 'flexible': return <FlexibleVisual />;
    case 'support': return <FreelancerSupportVisual />;
    default: return null;
  }
}

function FeatureSection({ feature, index }: { feature: FreelancerFeature; index: number }) {
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
          <FreelancerFeatureVisual type={feature.visual} />
        </div>
      </div>
    </div>
  );
}

// --- Main Component ---

export default function LearnFreelancer() {
  const navigate = useNavigate();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation(0.1);
  const { ref: faqHeaderRef, isVisible: faqHeaderVisible } = useScrollAnimation(0.1);
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation(0.1);

  const handleFreelancerSignup = () => {
    navigate('/signup?source=freelancer');
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
              <span style={{ fontWeight: 600 }}>Freelancer</span> Services
            </h1>
            <p 
              className="text-base md:text-lg mt-6 max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(204, 204, 204)', lineHeight: '1.7', fontWeight: 400 }}
            >
              Take your freelance career to the next level with tools, clients, and support designed for you.
              Set your own rates, work on your terms, and grow with Elevate.
            </p>
          </div>

          {/* Feature Sections - Alternating Split Layout */}
          <div className="space-y-24 md:space-y-32">
            {freelancerFeatures.map((feature, index) => (
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
              style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(204, 204, 204)', fontWeight: 400 }}
            >
              Everything you need to know about joining Elevate as a freelancer
            </p>
          </div>

          <div className="space-y-0">
            {freelancerFAQ.map((item, index) => (
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
            onClick={handleFreelancerSignup}
            className="group relative w-full sm:w-auto px-12 md:px-16 py-4 md:py-5 rounded-xl text-base md:text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
              color: '#000000',
              boxShadow: '0 4px 24px rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            Sign up as a Freelancer
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
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
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
                style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', color: 'rgb(204, 204, 204)', fontWeight: 400 }}
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
