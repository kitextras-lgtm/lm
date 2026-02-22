import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

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
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Active Campaigns</div>
      <div className="space-y-3">
        {[
          { creator: 'Sarah Chen', platform: 'Instagram', reach: '2.4M', status: 'Live' },
          { creator: 'Mike Torres', platform: 'TikTok', reach: '1.8M', status: 'Live' },
          { creator: 'Emma Wilson', platform: 'YouTube', reach: '890K', status: 'Scheduled' }
        ].map((c, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full" style={{ background: '#e5e7eb' }} />
              <div>
                <div className="text-sm font-semibold" style={{ color: '#111' }}>{c.creator}</div>
                <div className="text-xs" style={{ color: '#888' }}>{c.platform} • {c.reach}</div>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded" style={{ 
              background: c.status === 'Live' ? '#10b981' : '#f59e0b',
              color: '#fff'
            }}>{c.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Campaign Performance</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Impressions', value: '12.4M', change: '+24%' },
          { label: 'Engagement', value: '890K', change: '+18%' },
          { label: 'Conversions', value: '45.2K', change: '+32%' },
          { label: 'ROI', value: '4.2x', change: '+15%' }
        ].map((m, i) => (
          <div key={i} className="p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="text-xs mb-1" style={{ color: '#888' }}>{m.label}</div>
            <div className="text-lg font-bold" style={{ color: '#111' }}>{m.value}</div>
            <div className="text-xs" style={{ color: '#10b981' }}>{m.change}</div>
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
  const brands = [
    { name: 'Pulse', color: '#6366F1', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 12h3l2-6 4 12 4-9 2 3h3"/><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>' },
    { name: 'Vertex', color: '#8B5CF6', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>' },
    { name: 'Nexus', color: '#EC4899', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z"/></svg>' },
    { name: 'Quantum', color: '#10B981', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4M6.34 6.34l2.83 2.83m5.66 5.66l2.83 2.83M6.34 17.66l2.83-2.83m5.66-5.66l2.83-2.83"/></svg>' },
    { name: 'Zenith', color: '#F59E0B', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 8v8l8 6 8-6V8l-8-6zm0 4l4 3v6l-4 3-4-3V9l4-3z"/></svg>' },
    { name: 'Prism', color: '#06B6D4', svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 8l10 6 10-6-10-6zM2 16l10 6 10-6"/><path d="M12 8v14" stroke="currentColor" stroke-width="2"/></svg>' }
  ];

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Trusted By</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {brands.map((brand, i) => (
          <div key={i} className="aspect-square rounded-xl flex items-center justify-center transition-transform hover:scale-105" style={{ background: '#f0f0f0' }}>
            <div className="w-10 h-10 flex items-center justify-center" style={{ color: brand.color }} dangerouslySetInnerHTML={{ __html: brand.svg }} />
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl text-center" style={{ background: '#f0f0f0' }}>
        <div className="text-sm font-bold" style={{ color: '#111' }}>500+ Brand Partners</div>
        <div className="text-[10px]" style={{ color: '#888' }}>From startups to Fortune 500</div>
      </div>
    </div>
  );
}

function ConsultingVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Expert Support</div>
      <div className="space-y-3">
        {[
          { service: 'Strategy Consultation', status: 'Available' },
          { service: 'Campaign Planning', status: 'Available' },
          { service: 'Performance Review', status: 'Scheduled' }
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#e5e7eb' }}>
                <span className="text-xs">✓</span>
              </div>
              <span className="text-sm font-medium" style={{ color: '#111' }}>{s.service}</span>
            </div>
            <span className="text-xs" style={{ color: '#10b981' }}>{s.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViralDistributionVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Reach Potential</div>
      <div className="space-y-3">
        {[
          { platform: 'TikTok', reach: '50M+', growth: '+45%' },
          { platform: 'Instagram', reach: '35M+', growth: '+32%' },
          { platform: 'YouTube', reach: '28M+', growth: '+28%' }
        ].map((p, i) => (
          <div key={i} className="p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold" style={{ color: '#111' }}>{p.platform}</span>
              <span className="text-xs" style={{ color: '#10b981' }}>{p.growth}</span>
            </div>
            <div className="text-lg font-bold" style={{ color: '#111' }}>{p.reach}</div>
            <div className="w-full h-2 rounded-full mt-2" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ 
                background: '#10b981',
                width: `${70 + i * 10}%`
              }} />
            </div>
          </div>
        ))}
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
