import React from 'react';
import { X, Check } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export function Comparison() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: comparisonRef, isVisible: comparisonVisible } = useScrollAnimation();

  return (
    <section className="bg-black py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div
          ref={titleRef}
          className={`text-center mb-10 md:mb-16 transition-all duration-1000 ease-out ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-normal mb-6 md:mb-8 leading-snug"
            style={{
              fontFamily: 'Fraunces, serif',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            A Thriving Ecosystem
          </h2>
          <p className="text-white font-light text-sm md:text-lg lg:text-xl mt-4 md:mt-6 leading-relaxed px-2">
            Elevate is a full-service, 360° Multi-Media Network, Agency, and Distributor, designed to empower creators, artists, and brands with unparalleled opportunities.
          </p>
          <p className="text-white text-sm md:text-lg lg:text-xl mt-3 md:mt-4 leading-relaxed px-2">
            We don't just promise results, we guarantee higher revenue through expert negotiations. No matter where you are today, we ensure our clients enjoy superior payout splits, premium sponsorship opportunities, optimized content strategies, and elevated brand promotion.
          </p>
          <p className="text-white text-sm md:text-lg lg:text-xl mt-3 md:mt-4 leading-relaxed px-2">
            By keeping our client roster exclusive and invite only, we dedicate our full attention to a select group of high-impact partners, delivering the focused support they deserve.
          </p>
          <p className="text-white text-sm md:text-lg lg:text-xl mt-3 md:mt-4 leading-relaxed px-2">
            At Elevate, our team works to provide every client with a seamless, high-quality experience, because your growth is our mission.
          </p>
        </div>

        <div
          ref={comparisonRef}
          className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto transition-all duration-1000 ease-out ${
            comparisonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-800/60 backdrop-blur-sm hover:border-gray-700/60 transition-all duration-300">
            <h3 className="text-xl md:text-2xl font-bold text-gray-300 mb-6 md:mb-8 text-center tracking-tight">
              Alternative Companies
            </h3>

            <div className="space-y-5 md:space-y-7">
              <div className="flex items-start space-x-3 md:space-x-4 group">
                <div className="mt-0.5">
                  <X className="w-4 h-4 md:w-5 md:h-5 text-red-500/90 flex-shrink-0 group-hover:text-red-500 transition-colors" />
                </div>
                <span className="text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed">Basic or Lower Revenue</span>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4 group">
                <div className="mt-0.5">
                  <X className="w-4 h-4 md:w-5 md:h-5 text-red-500/90 flex-shrink-0 group-hover:text-red-500 transition-colors" />
                </div>
                <span className="text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed">No New Opportunities</span>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4 group">
                <div className="mt-0.5">
                  <X className="w-4 h-4 md:w-5 md:h-5 text-red-500/90 flex-shrink-0 group-hover:text-red-500 transition-colors" />
                </div>
                <span className="text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed">Subpar Monetization Strategies</span>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4 group">
                <div className="mt-0.5">
                  <X className="w-4 h-4 md:w-5 md:h-5 text-red-500/90 flex-shrink-0 group-hover:text-red-500 transition-colors" />
                </div>
                <span className="text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed">Only Focuses On One Region</span>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4 group">
                <div className="mt-0.5">
                  <X className="w-4 h-4 md:w-5 md:h-5 text-red-500/90 flex-shrink-0 group-hover:text-red-500 transition-colors" />
                </div>
                <span className="text-gray-400 text-sm md:text-base lg:text-lg leading-relaxed">No Dedicated Support</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/30 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-gray-700">
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <img
                src="/elevate_logo_2_3.png"
                alt="Elevate Logo"
                className="h-12 md:h-14 w-auto"
              />
            </div>

            <div className="space-y-5 md:space-y-7">
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="mt-0.5">
                  <div className="relative">
                    <Check className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ stroke: '#FFFFFF' }} />
                  </div>
                </div>
                <span className="text-white text-sm md:text-base lg:text-lg leading-relaxed">Guaranteed Higher Revenue</span>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="mt-0.5">
                  <div className="relative">
                    <Check className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ stroke: '#FFFFFF' }} />
                  </div>
                </div>
                <span className="text-white text-sm md:text-base lg:text-lg leading-relaxed">Fresh Opportunities</span>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="mt-0.5">
                  <div className="relative">
                    <Check className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ stroke: '#FFFFFF' }} />
                  </div>
                </div>
                <span className="text-white text-sm md:text-base lg:text-lg leading-relaxed">Boutique Monetization Strategies</span>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="mt-0.5">
                  <div className="relative">
                    <Check className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ stroke: '#FFFFFF' }} />
                  </div>
                </div>
                <span className="text-white text-sm md:text-base lg:text-lg leading-relaxed">Supports Creators, Artists, and Brands</span>
              </div>

              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="mt-0.5">
                  <div className="relative">
                    <Check className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" style={{ stroke: '#FFFFFF' }} />
                  </div>
                </div>
                <span className="text-white text-sm md:text-base lg:text-lg leading-relaxed">Dedicated Customer Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}