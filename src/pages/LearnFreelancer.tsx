import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
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

// --- Visual Mockup Components ---

function MarketplaceVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Active Projects</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>Matched to your skills</div>
      <div className="space-y-3">
        {[
          { client: 'Tech Startup', project: 'Brand Identity Design', budget: '$4,500', flag: 'US' },
          { client: 'E-commerce Co.', project: 'Product Photography', budget: '$2,800', flag: 'UK' },
          { client: 'SaaS Platform', project: 'UI/UX Redesign', budget: '$7,200', flag: 'DE' },
        ].map((p) => (
          <div key={p.project} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#e5e7eb', color: '#555' }}>
              {p.flag}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium" style={{ color: '#111' }}>{p.project}</div>
              <div className="text-[10px]" style={{ color: '#888' }}>{p.client}</div>
            </div>
            <span className="text-xs font-bold" style={{ color: '#111' }}>{p.budget}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 px-3 py-2.5 rounded-xl text-center text-xs font-medium" style={{ background: '#dcfce7', color: '#166534' }}>
        47 new projects this week
      </div>
    </div>
  );
}

function PaymentsVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Earnings Overview</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
          <div className="text-[10px]" style={{ color: '#888' }}>Available balance</div>
          <div className="text-lg font-bold" style={{ color: '#111' }}>$3,240</div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
          <div className="text-[10px]" style={{ color: '#888' }}>Lifetime earnings</div>
          <div className="text-lg font-bold" style={{ color: '#111' }}>$28,450</div>
        </div>
      </div>
      <div className="space-y-2">
        {[
          { date: 'Feb 15', desc: 'Brand Identity Project', amount: '+$4,500', status: 'Paid' },
          { date: 'Feb 8', desc: 'UI/UX Consultation', amount: '+$1,200', status: 'Paid' },
          { date: 'Feb 1', desc: 'Logo Design Package', amount: '+$2,800', status: 'Paid' },
        ].map((t) => (
          <div key={t.date} className="flex items-center justify-between p-2.5 rounded-lg" style={{ background: '#f0f0f0' }}>
            <div className="flex items-center gap-2">
              <div className="text-[10px]" style={{ color: '#888' }}>{t.date}</div>
              <div className="text-xs font-medium" style={{ color: '#111' }}>{t.desc}</div>
            </div>
            <span className="text-xs font-bold" style={{ color: '#166534' }}>{t.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CareerVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full" style={{ background: '#e5e7eb' }} />
        <div>
          <div className="text-sm font-semibold" style={{ color: '#111' }}>Your Profile</div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="w-3 h-3" style={{ color: '#111' }}>
                <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              </div>
            ))}
            <span className="text-xs font-medium ml-1" style={{ color: '#111' }}>5.0</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Projects', value: '47' },
          { label: 'Reviews', value: '43' },
          { label: 'Repeat', value: '89%' },
        ].map((s) => (
          <div key={s.label} className="text-center p-2.5 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="text-sm font-bold" style={{ color: '#111' }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
        <div className="text-xs font-medium mb-1" style={{ color: '#111' }}>"Exceptional work and communication"</div>
        <div className="text-[10px]" style={{ color: '#888' }}>— Recent client review</div>
      </div>
    </div>
  );
}

function MatchingVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Skill Match</div>
      <div className="space-y-3">
        {[
          { skill: 'UI/UX Design', match: '98%', projects: '12 available' },
          { skill: 'Brand Identity', match: '95%', projects: '8 available' },
          { skill: 'Motion Graphics', match: '87%', projects: '5 available' },
          { skill: 'Web Development', match: '82%', projects: '15 available' },
        ].map((s) => (
          <div key={s.skill} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: '#111' }}>{s.skill}</span>
                <span className="text-xs font-bold" style={{ color: '#166534' }}>{s.match}</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
                <div className="h-full rounded-full" style={{ width: s.match, background: '#111' }} />
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>{s.projects}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlexibleVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Your Schedule</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
          <div className="text-[10px]" style={{ color: '#888' }}>Hourly Rate</div>
          <div className="text-lg font-bold" style={{ color: '#111' }}>$85/hr</div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
          <div className="text-[10px]" style={{ color: '#888' }}>This Week</div>
          <div className="text-lg font-bold" style={{ color: '#111' }}>24 hrs</div>
        </div>
      </div>
      <div className="space-y-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
          <div key={day} className="flex items-center gap-3">
            <span className="text-[10px] w-8" style={{ color: '#888' }}>{day}</span>
            <div className="flex-1 h-3 rounded-full" style={{ background: '#e5e7eb' }}>
              <div className="h-full rounded-full" style={{ width: `${[75, 100, 50, 100, 25][i]}%`, background: '#111' }} />
            </div>
            <span className="text-[10px] w-8 text-right" style={{ color: '#555' }}>{[6, 8, 4, 8, 2][i]}h</span>
          </div>
        ))}
      </div>
      <div className="mt-3 px-3 py-2 rounded-xl text-center text-[10px]" style={{ background: '#dcfce7', color: '#166534' }}>
        You set the hours — we find the work
      </div>
    </div>
  );
}

function FreelancerSupportVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Priority Support</div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#111', color: '#fff' }}>Y</div>
          <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs" style={{ background: '#f0f0f0', color: '#333' }}>
            A client hasn't responded in 3 days. Can you help?
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs" style={{ background: '#111', color: '#fff' }}>
            I've reached out to the client directly. They'll respond within 24 hours or we'll release your payment from escrow.
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
