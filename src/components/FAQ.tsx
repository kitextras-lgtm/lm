import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Is there any cost to start?",
    answer: "No, one of the best parts of our platform is that there's absolutely no upfront cost to get started."
  },
  {
    question: "How exactly do payments work?",
    answer: "We handle payments through our trusted partner, Tipalti. When it's time for your payout, our finance team will guide you through the onboarding process, allowing you to select your preferred payment method, whether PayPal, wire transfer, or direct bank deposit."
  },
  {
    question: "How can I join Elevate?",
    answer: "At the moment, Elevate is strictly invite only to maintain quality control and ensure we can focus on each client's individual situation. This will change in future releases."
  }
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation();
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation();

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="about" className="bg-black py-12 md:py-20 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div
          ref={titleRef}
          className={`text-center mb-10 md:mb-16 transition-all duration-1000 ease-out ${
            titleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-normal mb-6 leading-snug"
            style={{
              fontFamily: 'Fraunces, serif',
              color: '#ffffff',
              letterSpacing: '-0.02em'
            }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div
          ref={faqRef}
          className={`space-y-3 md:space-y-4 transition-all duration-1000 ease-out ${
            faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {faqData.map((item, index) => (
            <div
              key={index}
              className="overflow-hidden transition-all duration-300"
              style={{
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-5 md:px-6 py-5 md:py-6 text-left flex items-center justify-between transition-all duration-300"
                style={{
                  background: openItems.includes(index) ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                }}
              >
                <h3 
                  className="text-base md:text-xl pr-3 md:pr-4 leading-tight"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                    color: '#ffffff',
                    fontWeight: 500
                  }}
                >
                  {item.question}
                </h3>
                {openItems.includes(index) ? (
                  <Minus className="w-5 h-5 md:w-5 md:h-5 flex-shrink-0 transition-transform duration-300" style={{ color: '#999999' }} />
                ) : (
                  <Plus className="w-5 h-5 md:w-5 md:h-5 flex-shrink-0 transition-transform duration-300" style={{ color: '#999999' }} />
                )}
              </button>

              <div
                className={`transition-all duration-500 ease-in-out ${
                  openItems.includes(index)
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 md:px-6 pb-5 md:pb-6">
                  <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '20px' }}>
                    <p 
                      className="text-base leading-relaxed"
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                        color: 'rgb(204, 204, 204)',
                        fontWeight: 400
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}