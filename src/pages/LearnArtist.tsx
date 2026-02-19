import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface ArtistFeature {
  tag: string;
  title: string;
  description: string;
  visual: 'distribution' | 'growth' | 'royalty' | 'sync' | 'strategy' | 'support';
}

const artistFeatures: ArtistFeature[] = [
  {
    tag: 'Distribution',
    title: 'Go global with\none click',
    description: 'Distribution is just the starting point. We provide flexibility along with strategic guidance and industry-leading revenue splits.',
    visual: 'distribution'
  },
  {
    tag: 'Marketing',
    title: 'Growth that\ncompounds',
    description: "Marketing comes naturally at Elevate. We don't just support you. We invest in you.",
    visual: 'growth'
  },
  {
    tag: 'Royalties',
    title: 'Every dollar\naccounted for',
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
    title: 'Real people,\nreal fast',
    description: 'From production to promotion, we provide the resources and expertise you need to create your best work and reach your audience.',
    visual: 'support'
  }
];

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
          <div className="text-xs" style={{ color: '#888' }}>Distributed globally</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {['Spotify', 'Apple', 'TikTok', 'YouTube'].map((p) => (
          <div key={p} className="text-center">
            <div className="w-full aspect-square rounded-xl mb-1.5 flex items-center justify-center" style={{ background: '#f0f0f0' }}>
              <span className="text-xs font-medium" style={{ color: '#555' }}>{p[0]}</span>
            </div>
            <span className="text-[10px]" style={{ color: '#888' }}>{p}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: '#f0f0f0' }}>
        <span className="text-xs font-medium" style={{ color: '#555' }}>Revenue Split</span>
        <span className="text-sm font-bold" style={{ color: '#111' }}>Industry Leading</span>
      </div>
    </div>
  );
}

function GrowthVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Growth Analytics</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>Last 30 days</div>
      <div className="flex items-end gap-1.5 mb-4" style={{ height: '80px' }}>
        {[35, 42, 38, 55, 48, 62, 58, 72, 68, 85, 78, 95].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: i >= 10 ? '#111' : '#d1d5db' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs" style={{ color: '#888' }}>Monthly Listeners</div>
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
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Royalty Dashboard</div>
      <div className="space-y-3">
        {[
          { label: 'Streaming', amount: '$4,280', pct: '85%' },
          { label: 'Publishing', amount: '$1,950', pct: '65%' },
          { label: 'Sync', amount: '$3,100', pct: '75%' },
        ].map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs mb-1">
              <span style={{ color: '#555' }}>{item.label}</span>
              <span className="font-semibold" style={{ color: '#111' }}>{item.amount}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ width: item.pct, background: '#111' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 flex justify-between items-center" style={{ borderTop: '1px solid #e5e7eb' }}>
        <span className="text-xs" style={{ color: '#888' }}>Total Collected</span>
        <span className="text-lg font-bold" style={{ color: '#111' }}>$9,330</span>
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
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: item.done ? '#dcfce7' : '#f3f4f6', color: item.done ? '#166534' : '#888' }}>
                  {item.date}
                </span>
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
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Priority Support</div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#111', color: '#fff' }}>Y</div>
          <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs" style={{ background: '#f0f0f0', color: '#333' }}>
            Hey! I need help with my upcoming release strategy.
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs" style={{ background: '#111', color: '#fff' }}>
            Of course! I've reviewed your analytics. Let me put together a custom rollout plan. Give me 10 minutes.
          </div>
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#e5e7eb', color: '#555' }}>E</div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
          <span className="text-[10px]" style={{ color: '#888' }}>Avg. response time: &lt;5 min</span>
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
      className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="flex-1 w-full">
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

      <div className="flex-1 w-full max-w-md md:max-w-none">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', padding: '16px' }}
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
            className={`text-center mb-20 md:mb-28 transition-all duration-1000 ease-out ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
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
            className={`text-center mb-12 md:mb-20 transition-all duration-1000 ease-out ${
              faqHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
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
        className={`max-w-7xl mx-auto px-4 md:px-6 pb-24 transition-all duration-1000 ease-out ${
          ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
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
      className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 50}ms` }}
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
          className="overflow-hidden transition-all duration-300 ease-out"
          style={{ maxHeight: isOpen ? '500px' : '0px', opacity: isOpen ? 1 : 0 }}
        >
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
  );
}
