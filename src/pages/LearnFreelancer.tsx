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
  const msgs = ['Love your portfolio!', "Let's collaborate", 'Open to projects?'];
  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setBubble(b => (b + 1) % msgs.length), 1900);
    return () => clearInterval(t);
  }, [entered]);

  const bw = [msgs[0].length * 5.2 + 12, msgs[1].length * 5.2 + 12, msgs[2].length * 5.2 + 12];

  return (
    <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(10px)', transition: 'opacity 0.55s ease 0.35s, transform 0.55s ease 0.35s' }}>
      <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(160deg,#1a1a1a 0%,#111 100%)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" width="100%" style={{ display: 'block' }}>
          {/* Floor */}
          <ellipse cx="140" cy="148" rx="125" ry="14" fill="rgba(255,255,255,0.04)" />
          {/* Ambient glow */}
          <ellipse cx="140" cy="80" rx="100" ry="60" fill="rgba(255,255,255,0.02)" />

          {/* ── Person A — left ── */}
          <ellipse cx="58" cy="148" rx="13" ry="4" fill="rgba(0,0,0,0.4)" />
          <rect x="49" y="108" width="18" height="30" rx="6" fill="#c8a882" />
          <circle cx="58" cy="100" r="9" fill="#f5d5a8" />
          <path d="M50 97 Q58 88 66 97" fill="#3d2b1f" />
          <path d="M49 118 Q40 124 42 132" stroke="#c8a882" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M67 118 Q75 122 73 130" stroke="#c8a882" strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="51" y="136" width="6" height="15" rx="3" fill="#2d3748" />
          <rect x="59" y="136" width="6" height="15" rx="3" fill="#2d3748" />

          {/* ── Person B — center-left ── */}
          <ellipse cx="105" cy="148" rx="13" ry="4" fill="rgba(0,0,0,0.38)" />
          <rect x="96" y="106" width="18" height="32" rx="6" fill="#4a6fa5" />
          <circle cx="105" cy="97" r="9.5" fill="#deb887" />
          <path d="M97 95 Q105 86 113 95" fill="#1a0a00" />
          <path d="M96 116 Q87 112 89 106" stroke="#4a6fa5" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M114 116 Q121 120 119 128" stroke="#4a6fa5" strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="113" y="120" width="16" height="11" rx="2" fill="#e8f0fe" />
          <rect x="115" y="122" width="12" height="7" rx="1" fill="#4285f4" opacity="0.8" />
          <rect x="98" y="136" width="6" height="15" rx="3" fill="#1a202c" />
          <rect x="106" y="136" width="6" height="15" rx="3" fill="#1a202c" />

          {/* ── Person C — center ── */}
          <ellipse cx="150" cy="148" rx="13" ry="4" fill="rgba(0,0,0,0.36)" />
          <rect x="141" y="104" width="18" height="34" rx="6" fill="#2d6a4f" />
          <circle cx="150" cy="95" r="9.5" fill="#c68642" />
          <path d="M142 93 Q150 84 158 93" fill="#0d0d0d" />
          <path d="M141 114 Q132 108 134 102" stroke="#2d6a4f" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="133" cy="101" r="4" fill="#c68642" />
          <path d="M159 114 Q166 120 164 128" stroke="#2d6a4f" strokeWidth="5" strokeLinecap="round" fill="none" />
          <rect x="143" y="136" width="6" height="15" rx="3" fill="#1a202c" />
          <rect x="151" y="136" width="6" height="15" rx="3" fill="#1a202c" />

          {/* ── Person D — right ── */}
          <ellipse cx="210" cy="148" rx="13" ry="4" fill="rgba(0,0,0,0.34)" />
          <rect x="201" y="106" width="18" height="32" rx="6" fill="#9b2335" />
          <circle cx="210" cy="97" r="9" fill="#f5cba7" />
          <path d="M202 95 Q210 86 218 95" fill="#5c3317" />
          <path d="M201 116 Q192 112 194 106" stroke="#9b2335" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M219 116 Q226 110 224 104" stroke="#9b2335" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="224" cy="103" r="4" fill="#f5cba7" />
          <rect x="203" y="136" width="6" height="15" rx="3" fill="#1a202c" />
          <rect x="211" y="136" width="6" height="15" rx="3" fill="#1a202c" />

          {/* ── Dashed connection lines ── */}
          <line x1="73" y1="116" x2="96" y2="116" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="114" y1="116" x2="141" y2="116" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="159" y1="116" x2="201" y2="116" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />

          {/* ── Speech bubble 0 — above person A ── */}
          <g style={{ opacity: bubble === 0 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <rect x="18" y="68" width={bw[0]} height="17" rx="8" fill="rgba(255,255,255,0.93)" />
            <polygon points={`${28},${85} ${34},${85} ${30},${91}`} fill="rgba(255,255,255,0.93)" />
            <text x="24" y="80" fontSize="7" fontFamily="system-ui" fontWeight="600" fill="#111">{msgs[0]}</text>
          </g>

          {/* ── Speech bubble 1 — above person B ── */}
          <g style={{ opacity: bubble === 1 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <rect x="68" y="62" width={bw[1]} height="17" rx="8" fill="rgba(255,255,255,0.93)" />
            <polygon points={`${100},${79} ${106},${79} ${102},${85}`} fill="rgba(255,255,255,0.93)" />
            <text x="74" y="74" fontSize="7" fontFamily="system-ui" fontWeight="600" fill="#111">{msgs[1]}</text>
          </g>

          {/* ── Speech bubble 2 — above person D ── */}
          <g style={{ opacity: bubble === 2 ? 1 : 0, transition: 'opacity 0.4s ease' }}>
            <rect x="168" y="62" width={bw[2]} height="17" rx="8" fill="rgba(255,255,255,0.93)" />
            <polygon points={`${200},${79} ${206},${79} ${202},${85}`} fill="rgba(255,255,255,0.93)" />
            <text x="174" y="74" fontSize="7" fontFamily="system-ui" fontWeight="600" fill="#111">{msgs[2]}</text>
          </g>

          {/* Floating dots — ambient activity */}
          {[[48,72],[130,55],[220,68],[170,48]].map(([cx,cy],i) => (
            <circle key={i} cx={cx} cy={cy} r="2" fill="rgba(255,255,255,0.15)"
              style={{ animation: `pulse ${1.4 + i * 0.3}s ease-in-out infinite alternate` }} />
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
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Active Projects</div>
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
