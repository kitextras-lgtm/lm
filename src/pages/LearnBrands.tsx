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
  visual: 'sponsorships' | 'content-strategy' | 'viral' | 'consulting' | 'brand-partnerships';
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
  const creators = [
    { creator: 'Sarah Chen',  platform: 'Instagram', reach: '2.4M', status: 'Live',      delay: 0 },
    { creator: 'Mike Torres', platform: 'TikTok',    reach: '1.8M', status: 'Live',      delay: 0.08 },
    { creator: 'Emma Wilson', platform: 'YouTube',   reach: '890K', status: 'Scheduled', delay: 0.16 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
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
      <div className="px-5 py-3">
        <div className="space-y-2.5">
          {creators.map((c) => (
            <div key={c.creator} className="flex items-center gap-3"
              style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: `opacity 0.45s ease ${c.delay}s, transform 0.45s ease ${c.delay}s` }}>
              <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ background: '#f0f0f0', border: '1px solid #ebebeb' }} />
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#111' }}>{c.creator}</div>
                <div style={{ fontSize: '9px', color: '#bbb' }}>{c.platform} · {c.reach}</div>
              </div>
              <div className="flex-shrink-0 px-2 py-1 rounded-lg" style={{ background: '#f5f5f5' }}>
                <span style={{ fontSize: '9px', fontWeight: 600, color: '#111' }}>{c.status}</span>
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
  const impressions = useCountUp(124, 1400, entered);
  const engagement  = useCountUp(890, 1400, entered);
  const conversions = useCountUp(452, 1400, entered);
  const roi         = useCountUp(42,  1200, entered);
  const stats = [
    { label: 'Impressions', value: `${impressions / 10}M`,  change: '+24%', delay: 0 },
    { label: 'Engagement',  value: `${engagement}K`,        change: '+18%', delay: 0.06 },
    { label: 'Conversions', value: `${conversions / 10}K`,  change: '+32%', delay: 0.12 },
    { label: 'ROI',         value: `${roi / 10}x`,          change: '+15%', delay: 0.18 },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Campaign Performance</div>
          <div style={{ fontSize: '9px', color: '#bbb', marginTop: '1px' }}>Last 30 days</div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: '#f5f5f5', opacity: entered ? 1 : 0, transition: 'opacity 0.4s ease 0.05s' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#111', animation: inView ? 'pulse 2s infinite' : 'none' }} />
          <span style={{ fontSize: '9px', fontWeight: 600, color: '#111' }}>Live</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-px px-5 py-3" style={{ gap: '8px' }}>
        {stats.map((m) => (
          <div key={m.label} className="p-3 rounded-xl"
            style={{ background: '#f8f8f8', border: '1px solid #f0f0f0', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: `opacity 0.45s ease ${m.delay}s, transform 0.45s ease ${m.delay}s` }}>
            <div style={{ fontSize: '9px', color: '#bbb', marginBottom: '2px' }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#111', letterSpacing: '-0.02em', lineHeight: 1 }}>{m.value}</div>
            <div style={{ fontSize: '9px', fontWeight: 600, color: '#111', marginTop: '3px', opacity: 0.5 }}>{m.change}</div>
          </div>
        ))}
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
  const count = useCountUp(500, 1400, entered);
  const brands = [
    { name: 'Pulse',   initials: 'PL' },
    { name: 'Vertex',  initials: 'VX' },
    { name: 'Nexus',   initials: 'NX' },
    { name: 'Quantum', initials: 'QM' },
    { name: 'Zenith',  initials: 'ZN' },
    { name: 'Prism',   initials: 'PR' },
  ];
  return (
    <div ref={ref} className="w-full rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #ebebeb' }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3" style={{ borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Trusted By</div>
          <div style={{ fontSize: '9px', color: '#bbb', marginTop: '1px' }}>From startups to Fortune 500</div>
        </div>
      </div>
      <div className="px-5 py-3">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {brands.map((brand, i) => (
            <div key={i} className="rounded-xl flex items-center justify-center"
              style={{ background: '#f8f8f8', border: '1px solid #f0f0f0', height: '52px', opacity: entered ? 1 : 0, transform: entered ? 'none' : 'translateY(8px)', transition: `opacity 0.45s ease ${i * 0.06}s, transform 0.45s ease ${i * 0.06}s` }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#555', letterSpacing: '0.05em' }}>{brand.initials}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
          style={{ background: '#f8f8f8', border: '1px solid #f0f0f0', opacity: entered ? 1 : 0, transition: 'opacity 0.5s ease 0.4s' }}>
          <span style={{ fontSize: '10px', color: '#aaa' }}>Brand partners</span>
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>{count}+</span>
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
          {/* Support reply */}
          <div className="flex gap-2 justify-end"
            style={{ opacity: showReply ? 1 : 0, transform: showReply ? 'none' : 'translateY(6px)', transition: 'opacity 0.4s ease, transform 0.4s ease' }}>
            <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs max-w-[80%]" style={{ background: '#111', color: '#fff' }}>
              I'll put together a tailored creator brief and shortlist by tomorrow.
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

function getVisualComponent(visual: BrandFeature['visual']) {
  switch (visual) {
    case 'sponsorships': return <SponsorshipsVisual />;
    case 'content-strategy': return <AnalyticsVisual />;
    case 'viral': return <ViralDistributionVisual />;
    case 'consulting': return <ConsultingVisual />;
    case 'brand-partnerships': return <BrandPartnershipsVisual />;
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
