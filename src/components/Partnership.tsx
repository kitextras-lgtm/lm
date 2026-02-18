import { useState, useRef } from 'react';
import { Network } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface ServiceCard {
  title: string;
  description: string;
  visual?: string;
}

export function Partnership({ showArtists = true }: { showArtists?: boolean }) {
  const [activeTab, setActiveTab] = useState(showArtists ? 'artists' : 'creators');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.1);
  const { ref: gridRef, isVisible: gridVisible } = useScrollAnimation(0.1);

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

  const artistServices: ServiceCard[] = [
    {
      title: 'Global Distribution',
      description: 'Distribution is just the starting point. We provide flexibility along with strategic guidance and industry-leading revenue splits.'
    },
    {
      title: 'Superior Growth',
      description: 'Marketing comes naturally at Elevate. We don\'t just support you. We invest in you.'
    },
    {
      title: 'Royalty Protection',
      description: 'There\'s more to your royalties than what traditional distributors collect. Elevate uncovers, manages, and safeguards your publishing income, making sure no label or third party profits from your work without you.'
    },
    {
      title: 'Sync Placement',
      description: 'Strategic music placement across film, TV, gaming, and advertising, designed to generate both exposure and revenue.'
    },
    {
      title: 'Career Strategy',
      description: 'Personalized, long term planning for releases, branding, and positioning, built around where you should be, not just your next drop.'
    },
    {
      title: 'Dedicated Support',
      description: 'Priority, human first support built specifically for artists. Fast responses, real solutions.'
    }
  ];

  const creatorServices: ServiceCard[] = [
    {
      title: 'Copyright Protection',
      description: 'Convert unauthorized re uploads into measurable revenue. Our content detection and monetization tools have helped clients unlock up to $50,000+ per month in additional earnings.'
    },
    {
      title: 'Boutique Monetization',
      description: 'Get access to exclusive campaigns and investment opportunities.'
    },
    {
      title: 'Content Licensing',
      description: 'When your content reaches viral pages or television, it should pay you. We handle licensing, negotiations, and compliance while you focus on creating.'
    },
    {
      title: 'Brand Partnerships',
      description: 'Our established brand network dramatically increases your chances of securing high quality, relevant partnerships.'
    },
    {
      title: 'Content Strategy',
      description: 'Our team of experts with decades of experience with virality and scaling will be able to assist your growth.'
    },
    {
      title: 'Dedicated Support',
      description: 'Priority, human first support built specifically for creators. Fast responses, real solutions.'
    }
  ];

  const brandServices: ServiceCard[] = [
    {
      title: 'Viral Distribution',
      description: 'Turn your brand content into high performing organic clips. We activate vetted creators to produce and distribute short form videos at scale, providing better results than forced paid advertisements.'
    },
    {
      title: 'Strategic Sponsorships',
      description: 'Looking for the right creator to sponsor? We connect brands with carefully vetted talent, matched by audience, values, and performance, ensuring every partnership delivers real impact.'
    },
    {
      title: 'Cultural Consulting',
      description: 'The biggest mistake brands make is not adapting to current times. This isn\'t 2010 anymore. The landscape and culture is always shifting. We advise brands on how to move correctly in music, creator, and youth culture, what to do, what to avoid, and how to stay relevant.'
    }
  ];

  const services = activeTab === 'artists' && showArtists ? artistServices : activeTab === 'creators' ? creatorServices : activeTab === 'brands' ? brandServices : creatorServices;

  return (
    <section
      id="partnership"
      className="relative pt-2 md:pt-8 pb-20 px-4 md:px-6 overflow-hidden"
      style={{
        background: '#000000'
      }}
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
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-normal mb-10 leading-snug"
                style={{
                  fontFamily: 'Fraunces, serif',
                  color: '#ffffff',
                  letterSpacing: '-0.02em'
                }}
              >
                <span style={{ fontWeight: 600 }}>Elevate's</span> users on average saw an increase of <span style={{ fontWeight: 300 }}>2x to 5x</span> their current revenue.
              </h2>

              <div className="space-y-4 mb-10 flex flex-col items-center">
                {showArtists && (
                  <div className="artist-button flex items-center gap-3">
                  <div className="music-icon group w-10 h-10 flex-shrink-0">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M12 28C12 20.268 18.268 14 26 14H22C29.732 14 36 20.268 36 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                      <rect x="8" y="26" width="8" height="12" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                      <rect x="32" y="26" width="8" height="12" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                      <rect x="10" y="28" width="4" height="8" rx="1" fill="white" opacity="0.3"/>
                      <rect x="34" y="28" width="4" height="8" rx="1" fill="white" opacity="0.3"/>
                    </svg>
                    <div className="note note-1">
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                        <path d="M2 12V3L9 1V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="2" cy="12" r="2" fill="white"/>
                      </svg>
                    </div>
                    <div className="note note-2">
                      <svg width="8" height="12" viewBox="0 0 10 14" fill="none">
                        <path d="M2 12V3L9 1V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="2" cy="12" r="2" fill="white"/>
                      </svg>
                    </div>
                    <div className="note note-3">
                      <svg width="6" height="10" viewBox="0 0 10 14" fill="none">
                        <path d="M2 12V3L9 1V10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="2" cy="12" r="2" fill="white"/>
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
                <div className="creator-button flex items-center gap-3">
                  <div className="creators-icon group w-10 h-10 flex-shrink-0">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <rect x="14" y="6" width="20" height="36" rx="3" stroke="white" strokeWidth="2" fill="none"/>
                      <rect x="20" y="9" width="8" height="2" rx="1" fill="white" opacity="0.4"/>
                      <rect x="21" y="38" width="6" height="2" rx="1" fill="white" opacity="0.4"/>
                      <g className="app app-1">
                        <rect x="16" y="14" width="10" height="8" rx="2" fill="white" opacity="0.2"/>
                        <path d="M20 16L23 18L20 20V16Z" fill="white" opacity="0.8"/>
                      </g>
                      <g className="app app-2">
                        <rect x="26" y="14" width="8" height="8" rx="2" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                        <circle cx="30" cy="18" r="2" stroke="white" strokeWidth="1" fill="none" opacity="0.8"/>
                        <circle cx="32.5" cy="15.5" r="0.8" fill="white" opacity="0.6"/>
                      </g>
                      <g className="app app-3">
                        <rect x="16" y="26" width="10" height="8" rx="2" fill="white" opacity="0.2"/>
                        <path d="M19 32V28L23 27V31" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8"/>
                        <circle cx="19" cy="32" r="1.2" fill="white" opacity="0.8"/>
                      </g>
                      <g className="app app-4">
                        <rect x="26" y="26" width="8" height="8" rx="2" fill="white" opacity="0.2"/>
                        <rect x="27.5" y="27.5" width="2" height="2" rx="0.5" fill="white" opacity="0.8"/>
                        <rect x="30.5" y="27.5" width="2" height="2" rx="0.5" fill="white" opacity="0.8"/>
                        <rect x="27.5" y="30.5" width="2" height="2" rx="0.5" fill="white" opacity="0.8"/>
                        <rect x="30.5" y="30.5" width="2" height="2" rx="0.5" fill="white" opacity="0.8"/>
                      </g>
                    </svg>
                  </div>
                  <p
                    className="text-xl md:text-2xl"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      color: '#ffffff',
                      lineHeight: '1.4'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Creators</span> saw <span style={{ fontWeight: 300 }}>2x more revenue and 3x faster growth</span>
                  </p>
                </div>

                <div className="business-button flex items-center gap-3">
                  <div className="businesses-icon group w-10 h-10 flex-shrink-0">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <rect x="6" y="18" width="36" height="22" rx="3" stroke="white" strokeWidth="2" fill="none"/>
                      <path d="M18 18V14C18 12.8954 18.8954 12 20 12H28C29.1046 12 30 12.8954 30 14V18" stroke="white" strokeWidth="2" fill="none"/>
                      <rect className="lid" x="6" y="18" width="36" height="8" rx="3" stroke="white" strokeWidth="2" fill="black"/>
                      <rect className="clasp" x="21" y="24" width="6" height="4" rx="1" fill="white"/>
                      <g className="documents">
                        <rect x="12" y="22" width="10" height="14" rx="1" fill="white" opacity="0.2"/>
                        <line x1="14" y1="25" x2="20" y2="25" stroke="white" strokeWidth="1" opacity="0.6"/>
                        <line x1="14" y1="28" x2="18" y2="28" stroke="white" strokeWidth="1" opacity="0.6"/>
                        <line x1="14" y1="31" x2="20" y2="31" stroke="white" strokeWidth="1" opacity="0.6"/>
                        <rect x="26" y="22" width="10" height="14" rx="1" fill="white" opacity="0.2"/>
                        <path d="M28 33L31 28L33 30L36 25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
                      </g>
                    </svg>
                  </div>
                  <p
                    className="text-xl md:text-2xl"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      color: '#ffffff',
                      lineHeight: '1.4'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>Brands</span> saw <span style={{ fontWeight: 300 }}>a 50% increase in growth</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className="px-6 py-3 rounded-full text-sm transition-all duration-200 hover:scale-105"
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      background: activeTab === tab.id ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                      color: activeTab === tab.id ? '#ffffff' : '#888888',
                      border: '1px solid',
                      borderColor: activeTab === tab.id ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      fontWeight: activeTab === tab.id ? 500 : 400
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          ref={gridRef}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
            isTransitioning ? 'opacity-0' : gridVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{
            transition: isTransitioning ? 'opacity 150ms ease-in-out' : 'opacity 600ms ease-out, transform 600ms ease-out'
          }}
        >
          {services.map((service, index) => (
            <ServiceCard
              key={`${activeTab}-${index}`}
              service={service}
              isVisible={!isTransitioning}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, isVisible: parentVisible }: { service: ServiceCard; isVisible: boolean }) {
  return (
    <div
      className="group relative overflow-hidden"
      style={{
        borderRadius: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        padding: '24px',
        opacity: parentVisible ? 1 : 0,
        transition: parentVisible ? 'opacity 200ms ease-out' : 'none'
      }}
    >
      <div className="mb-auto">
        <h3
          className="text-xl font-normal mb-4"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: '#ffffff',
            fontWeight: 500
          }}
        >
          {service.title}
        </h3>
        <p
          className="text-base leading-relaxed mb-6"
          style={{
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            color: 'rgb(204, 204, 204)',
            fontWeight: 400
          }}
        >
          {service.description}
        </p>
      </div>

      {service.visual && (
        <div
          className="mt-auto pt-4"
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div className="h-32 rounded-lg overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
          </div>
        </div>
      )}
    </div>
  );
}