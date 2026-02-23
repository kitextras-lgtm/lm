import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface FreelancerFeature {
  tag: string;
  title: string;
  description: string;
  visual: 'marketplace' | 'payments' | 'career' | 'matching' | 'flexible' | 'support' | 'middleman';
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
    tag: 'Protection',
    title: 'Middleman\nProtection',
    description: 'Elevate serves as a neutral third-party facilitator for hiring, sponsorships, partnerships, and strategic deals. We ensure every agreement is executed securely and transparently. Funds, deliverables, and contractual terms are protected through structured deal management, minimizing risk, preventing disputes, and safeguarding all parties involved.',
    visual: 'middleman'
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

function MarketplaceVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setPulse(p => (p + 1) % 3), 1800);
    return () => clearInterval(t);
  }, [entered]);

  const clients = [
    { name: 'Marcus J.',   type: 'YouTuber · 4.2M subs · Video editing', budget: '$3,800',  delay: 0 },
    { name: 'Aura Studio', type: 'Brand · Campaign creative direction',   budget: '$11,500', delay: 0.1 },
    { name: 'Derek Osei',  type: 'Business owner · Brand identity',       budget: '$6,200',  delay: 0.2 },
  ];

  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold" style={{ color: '#111' }}>Active Opportunities</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#111', opacity: inView ? 1 : 0, animation: inView ? 'pulse 2s infinite' : 'none' }} />
          <span className="text-[10px] font-medium" style={{ color: '#555' }}>Live</span>
        </div>
      </div>
      <div className="text-xs mb-4" style={{ color: '#555' }}>Matched to your profile</div>
      <div className="space-y-2.5 mb-4">
        {clients.map((c, i) => (
          <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl"
            style={{
              background: pulse === i ? '#111' : '#f0f0f0',
              opacity: entered ? 1 : 0,
              transform: entered ? 'none' : 'translateY(10px)',
              transition: `background 0.4s ease, opacity 0.5s ease ${c.delay}s, transform 0.5s ease ${c.delay}s`,
            }}>
            <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: pulse === i ? 'rgba(255,255,255,0.15)' : '#e5e7eb', transition: 'background 0.4s ease' }} />
            <div className="flex-1">
              <div className="text-xs font-semibold" style={{ color: pulse === i ? '#fff' : '#111', transition: 'color 0.4s ease' }}>{c.name}</div>
              <div className="text-[10px]" style={{ color: pulse === i ? 'rgba(255,255,255,0.6)' : '#888', transition: 'color 0.4s ease' }}>{c.type}</div>
            </div>
            <span className="text-xs font-bold" style={{ color: pulse === i ? '#fff' : '#111', transition: 'color 0.4s ease' }}>{c.budget}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.3s' }}>
        <span className="text-xs" style={{ color: '#555' }}>Avg. project value</span>
        <span className="text-sm font-bold" style={{ color: '#111' }}>$8,567</span>
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
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex items-center justify-between mb-4"
          style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#666', letterSpacing: '0.1em' }}>Earnings</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#f5f5f5' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#111', animation: inView ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: '9px', fontWeight: 600, color: '#111' }}>Live</span>
          </div>
        </div>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: 'opacity 0.45s ease 0.05s, transform 0.45s ease 0.05s' }}>
          <div style={{ fontSize: '9px', color: '#666', fontFamily: 'system-ui', marginBottom: '2px' }}>Available balance</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'system-ui' }}>${balance.toLocaleString()}</div>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.45s ease 0.12s, transform 0.45s ease 0.12s' }}>
        <span style={{ fontSize: '10px', color: '#666' }}>Lifetime earnings</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>${lifetime.toLocaleString()}</span>
      </div>
      <div className="px-5 py-3">
        <div style={{ fontSize: '9px', fontWeight: 600, color: '#777', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px', opacity: entered ? 1 : 0, transition: 'opacity 0.4s ease 0.18s' }}>Recent</div>
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
                  <div style={{ fontSize: '9px', color: '#777' }}>{t.date}</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{t.amount}</span>
            </div>
          ))}
        </div>
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
            <div className="text-[10px]" style={{ color: '#555' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl"
        style={{ background: '#f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.45s ease 0.3s, transform 0.45s ease 0.3s' }}>
        <div className="text-xs font-medium mb-1" style={{ color: '#111' }}>"Exceptional work and communication"</div>
        <div className="text-[10px]" style={{ color: '#555' }}>— Recent client review</div>
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
            <div className="text-[10px] mt-0.5" style={{ color: '#555' }}>{s.projects}</div>
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
            <div className="text-[10px]" style={{ color: '#555' }}>{s.label}</div>
            <div className="text-lg font-bold" style={{ color: '#111' }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        {days.map((day, i) => (
          <div key={day} className="flex items-center gap-3"
            style={{ opacity: entered ? 1 : 0, transition: `opacity 0.4s ease ${0.2 + i * 0.06}s` }}>
            <span className="text-[10px] w-8" style={{ color: '#555' }}>{day}</span>
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
        <div className="flex gap-2 justify-end"
          style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease 0.05s, transform 0.4s ease 0.05s' }}>
          <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs max-w-[80%]" style={{ background: '#111', color: '#fff' }}>
            A client hasn't responded in 5 days. My payment is stuck in escrow.
          </div>
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#e5e7eb', color: '#555' }}>F</div>
        </div>
        <div className="flex gap-2"
          style={{ opacity: showReply ? 1 : 0, transform: showReply ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="w-7 h-7 rounded-full flex-shrink-0 overflow-hidden" style={{ background: '#111' }}><img src="/elevate solid white logo ver.jpeg" alt="Elevate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs" style={{ background: '#f0f0f0', color: '#333' }}>
            Got it. I've flagged the contract and escalated to our disputes team. We'll have this resolved and your funds released within 24 hours.
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

function FreelancerMiddlemanVisual() {
  const { ref, inView } = useInView();
  const entered = useEnteredDelay(inView);
  const [step, setStep] = useState(0);
  const steps = [
    { label: 'Funds deposited',  icon: '↓' },
    { label: 'Terms locked',     icon: '⚿' },
    { label: 'Work delivered',   icon: '✓' },
    { label: 'Payment released', icon: '→' },
  ];
  useEffect(() => {
    if (!entered) return;
    const t = setInterval(() => setStep(s => (s + 1) % steps.length), 1800);
    return () => clearInterval(t);
  }, [entered]);
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px', border: '1px solid #ebebeb' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Deal Protection</div>
      <div className="text-xs mb-4" style={{ color: '#555' }}>Secure & transparent</div>
      <div className="flex items-center justify-between gap-2 mb-4" style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: 'opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s' }}>
        <div className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f0f0f0', border: '1px solid #e5e7eb' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="6" width="12" height="8" rx="1.5" stroke="#111" strokeWidth="1.2"/><path d="M5 6V4.5a3 3 0 016 0V6" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: '8px', fontWeight: 600, color: '#555' }}>Client</span>
        </div>
        <div style={{ flex: 0.6, display: 'flex', alignItems: 'center' }}>
          <div style={{ height: '1px', flex: 1, background: step === 0 || step === 3 ? '#111' : '#d1d5db', transition: 'background 0.4s ease' }}/>
          <div style={{ width: '5px', height: '5px', borderTop: '1.5px solid', borderRight: '1.5px solid', borderColor: step === 0 || step === 3 ? '#111' : '#d1d5db', transform: 'rotate(45deg)', marginLeft: '-3px', transition: 'border-color 0.4s ease' }}/>
        </div>
        <div className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
          <div className="w-10 h-10 rounded-xl overflow-hidden" style={{ background: '#111' }}>
            <img src="/elevate solid white logo ver.jpeg" alt="Elevate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{ fontSize: '8px', fontWeight: 600, color: '#555' }}>Elevate</span>
        </div>
        <div style={{ flex: 0.6, display: 'flex', alignItems: 'center' }}>
          <div style={{ height: '1px', flex: 1, background: step === 1 || step === 2 ? '#111' : '#d1d5db', transition: 'background 0.4s ease' }}/>
          <div style={{ width: '5px', height: '5px', borderTop: '1.5px solid', borderRight: '1.5px solid', borderColor: step === 1 || step === 2 ? '#111' : '#d1d5db', transform: 'rotate(45deg)', marginLeft: '-3px', transition: 'border-color 0.4s ease' }}/>
        </div>
        <div className="flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f0f0f0', border: '1px solid #e5e7eb' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.5" r="2.5" stroke="#111" strokeWidth="1.2"/><path d="M3 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/></svg>
          </div>
          <span style={{ fontSize: '8px', fontWeight: 600, color: '#555' }}>You</span>
        </div>
      </div>
      <div className="space-y-1.5" style={{ opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.25s' }}>
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2.5" style={{ opacity: step === i ? 1 : 0.3, transition: 'opacity 0.35s ease' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: step === i ? '#111' : '#e5e7eb', transition: 'background 0.35s ease' }}>
              <span style={{ fontSize: '8px', color: step === i ? '#fff' : '#888' }}>{s.icon}</span>
            </div>
            <span style={{ fontSize: '10px', fontWeight: step === i ? 600 : 400, color: '#111' }}>{s.label}</span>
            {step === i && <div className="ml-auto px-1.5 py-0.5 rounded" style={{ background: '#f0f0f0' }}><span style={{ fontSize: '8px', fontWeight: 600, color: '#111' }}>Active</span></div>}
          </div>
        ))}
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
    case 'middleman': return <FreelancerMiddlemanVisual />;
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
