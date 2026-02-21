import { useState } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface FeatureItem {
  tag: string;
  title: string;
  description: string;
  visual: 'distribution' | 'growth' | 'royalty' | 'sync' | 'strategy' | 'support' |
          'copyright' | 'monetization' | 'licensing' | 'brand-partnerships' | 'content-strategy' | 'creator-support' |
          'viral' | 'sponsorships' | 'consulting';
}

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
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#111', color: '#fff' }}>E</div>
          <div className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs" style={{ background: '#f0f0f0', color: '#333' }}>
            Hey! I need help with my upcoming release strategy.
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <div className="px-3 py-2 rounded-2xl rounded-tr-sm text-xs" style={{ background: '#111', color: '#fff' }}>
            Of course! I've reviewed your analytics. Let me put together a custom rollout plan. Give me 10 minutes.
          </div>
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: '#e5e7eb', color: '#555' }}>A</div>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} />
          <span className="text-[10px]" style={{ color: '#888' }}>Avg. response time: &lt;5 min</span>
        </div>
      </div>
    </div>
  );
}

function CopyrightVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Content Detection</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>This month</div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Detected', value: '1,247' },
          { label: 'Monetized', value: '1,180' },
          { label: 'Revenue', value: '$48.2K' },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="text-sm font-bold" style={{ color: '#111' }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: '#f0f0f0' }}>
        <div className="w-8 h-8 rounded-lg" style={{ background: '#e5e7eb' }} />
        <div className="flex-1">
          <div className="text-xs font-medium" style={{ color: '#111' }}>Unauthorized reupload detected</div>
          <div className="text-[10px]" style={{ color: '#888' }}>Claimed &amp; monetized automatically</div>
        </div>
        <span className="text-xs font-bold" style={{ color: '#166534' }}>+$420</span>
      </div>
    </div>
  );
}

function MonetizationVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Exclusive Campaigns</div>
      <div className="space-y-3">
        {[
          { brand: 'Premium Brand', type: 'Sponsored', payout: '$12,000', status: 'Active' },
          { brand: 'Tech Startup', type: 'Investment', payout: '$25,000', status: 'Pending' },
        ].map((c) => (
          <div key={c.brand} className="p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg" style={{ background: '#e5e7eb' }} />
                <div>
                  <div className="text-xs font-medium" style={{ color: '#111' }}>{c.brand}</div>
                  <div className="text-[10px]" style={{ color: '#888' }}>{c.type}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: c.status === 'Active' ? '#dcfce7' : '#fef9c3', color: c.status === 'Active' ? '#166534' : '#854d0e' }}>
                {c.status}
              </span>
            </div>
            <div className="text-right text-sm font-bold" style={{ color: '#111' }}>{c.payout}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LicensingVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Licensing Deals</div>
      <div className="space-y-3">
        {[
          { platform: 'Viral Page', reach: '2.4M views', fee: '$3,500', icon: 'V' },
          { platform: 'TV Network', reach: 'Prime time slot', fee: '$8,000', icon: 'T' },
          { platform: 'News Outlet', reach: 'National broadcast', fee: '$2,200', icon: 'N' },
        ].map((d) => (
          <div key={d.platform} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: '#e5e7eb', color: '#555' }}>
              {d.icon}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium" style={{ color: '#111' }}>{d.platform}</div>
              <div className="text-[10px]" style={{ color: '#888' }}>{d.reach}</div>
            </div>
            <span className="text-xs font-bold" style={{ color: '#111' }}>{d.fee}</span>
          </div>
        ))}
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
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Brand Network</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {brands.map((brand, i) => (
          <div key={i} className="aspect-square rounded-xl flex items-center justify-center transition-transform hover:scale-105" style={{ background: '#f0f0f0' }}>
            <div className="w-10 h-10 flex items-center justify-center" style={{ color: brand.color }} dangerouslySetInnerHTML={{ __html: brand.svg }} />
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl text-center" style={{ background: '#f0f0f0' }}>
        <div className="text-sm font-bold" style={{ color: '#111' }}>200+ Brand Partners</div>
        <div className="text-[10px]" style={{ color: '#888' }}>Matched to your audience &amp; niche</div>
      </div>
    </div>
  );
}

function ContentStrategyVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Content Performance</div>
      <div className="space-y-3">
        {[
          { title: 'Viral Hook Strategy', views: '2.1M views', growth: '+340%' },
          { title: 'Posting Schedule', views: 'Optimized', growth: '+85%' },
          { title: 'Audience Targeting', views: '18-34 demo', growth: '+120%' },
        ].map((item) => (
          <div key={item.title} className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div>
              <div className="text-xs font-medium" style={{ color: '#111' }}>{item.title}</div>
              <div className="text-[10px]" style={{ color: '#888' }}>{item.views}</div>
            </div>
            <span className="text-xs font-bold" style={{ color: '#166534' }}>{item.growth}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViralDistributionVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-1" style={{ color: '#111' }}>Campaign Performance</div>
      <div className="text-xs mb-4" style={{ color: '#888' }}>Organic clip distribution</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { label: 'Total Views', value: '14.2M' },
          { label: 'Creators', value: '48' },
          { label: 'Engagement', value: '8.4%' },
          { label: 'Cost/View', value: '$0.002' },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: '#f0f0f0' }}>
            <div className="text-sm font-bold" style={{ color: '#111' }}>{s.value}</div>
            <div className="text-[10px]" style={{ color: '#888' }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="px-3 py-2.5 rounded-xl text-center text-xs font-medium" style={{ background: '#dcfce7', color: '#166534' }}>
        12x better ROI than paid ads
      </div>
    </div>
  );
}

function SponsorshipsVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Creator Matching</div>
      <div className="space-y-3">
        {[
          { name: 'Creator A', audience: '1.2M followers', match: '98%' },
          { name: 'Creator B', audience: '850K followers', match: '94%' },
          { name: 'Creator C', audience: '2.1M followers', match: '91%' },
        ].map((c) => (
          <div key={c.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="w-8 h-8 rounded-full" style={{ background: '#e5e7eb' }} />
            <div className="flex-1">
              <div className="text-xs font-medium" style={{ color: '#111' }}>{c.name}</div>
              <div className="text-[10px]" style={{ color: '#888' }}>{c.audience}</div>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>{c.match}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsultingVisual() {
  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#fafafa', padding: '24px' }}>
      <div className="text-sm font-semibold mb-4" style={{ color: '#111' }}>Cultural Insights</div>
      <div className="space-y-3">
        {[
          { trend: 'Short-form content', status: 'Rising', action: 'Invest now' },
          { trend: 'Gen Z engagement', status: 'Critical', action: 'Adapt strategy' },
          { trend: 'Community building', status: 'Emerging', action: 'Start early' },
        ].map((t) => (
          <div key={t.trend} className="p-3 rounded-xl" style={{ background: '#f0f0f0' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium" style={{ color: '#111' }}>{t.trend}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#fef9c3', color: '#854d0e' }}>{t.status}</span>
            </div>
            <div className="text-[10px]" style={{ color: '#888' }}>{t.action}</div>
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
    { tag: 'Strategy', title: 'Scale with\nexperts', description: 'Find and match up with experienced experts to assist you with your growth.', visual: 'content-strategy' },
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
          className={`mb-12 md:mb-20 transition-all duration-1000 ease-out ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
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
          className={`space-y-24 md:space-y-32 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
          style={{ transition: isTransitioning ? 'opacity 150ms ease-in-out' : 'opacity 500ms ease-out' }}
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
      className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-10 md:gap-16 transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      {/* Text Side */}
      <div className="flex-1 w-full">
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
      <div className="flex-1 w-full max-w-md md:max-w-none">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '16px',
          }}
        >
          <FeatureVisual type={feature.visual} />
        </div>
      </div>
    </div>
  );
}