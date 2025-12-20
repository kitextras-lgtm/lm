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
    answer: "There's no cost to get started. We fully cover all expenses related to promotion, and Elevate provides exclusive opportunities at no cost of the clients."
  },
  {
    question: "How exactly do payments work?",
    answer: "We handle payments through our trusted partner, Tipalti. When it's time for your payout, our finance team will guide you through the onboarding process, allowing you to select your preferred payment method, whether PayPal, wire transfer, or direct bank deposit."
  },
  {
    question: "How can I join Elevate?",
    answer: "Elevate is strictly invite only to assure quality control and to focus on each client's individual situation. With future installments, this will change."
  },
  {
    question: "Can I work with other distributors or agencies while with Elevate?",
    answer: "Yes, you can work with other distributors or agencies while partnered with Elevate. We believe in providing flexibility to our clients and do not impose exclusive restrictions that limit your opportunities for growth and collaboration."
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
              className="bg-gray-900/30 rounded-xl md:rounded-2xl border border-gray-800 overflow-hidden transition-all duration-300 hover:border-gray-700"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-5 md:px-8 py-5 md:py-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-all duration-300"
              >
                <h3 className="text-base md:text-xl font-semibold text-white pr-3 md:pr-4 leading-tight">
                  {item.question}
                </h3>
                {openItems.includes(index) ? (
                  <Minus className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform duration-300" style={{ color: '#FFFFFF' }} />
                ) : (
                  <Plus className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-transform duration-300" style={{ color: '#FFFFFF' }} />
                )}
              </button>

              <div
                className={`transition-all duration-500 ease-in-out ${
                  openItems.includes(index)
                    ? 'max-h-96 opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 md:px-8 pb-5 md:pb-6">
                  <div className="border-t border-gray-800 pt-5 md:pt-6">
                    <p className="text-sm md:text-base text-gray-300 leading-relaxed">
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