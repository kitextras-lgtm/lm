import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How many songs will you create for me?",
    answer: "We tailor each track to match your content style and posting rhythm. Some creators don't even need custom music because our existing catalog of music is so good. Typically, songs are created on request."
  },
  {
    question: "Will this affect my existing AdSense revenue?",
    answer: "Not at all. Your current AdSense revenue remains untouched. In fact, this adds a fresh layer of income through music royalties, potentially boosting your total earnings without changing anything about your existing setup."
  },
  {
    question: "Is there any cost to start?",
    answer: "There's no cost to get started. We fully cover all expenses related to music production, registration, and licensing. As a creator, you'll receive this partnership entirely free of charge."
  },
  {
    question: "What is the revenue share percentage?",
    answer: "The revenue split is 50/50, with MediaTiger using its portion to cover expenses, YouTube fees, and operational costs. These costs are significant, reducing profit margins. However, MediaTiger is committed to prioritizing quality, even at the expense of profits. For creators surpassing 500 million views per month, a 60/40 split is available."
  },
  {
    question: "Can I Use Another Background Music Along With Yours?",
    answer: "We strongly recommend using only one background track per Short, exclusively from the MediaTiger Music Library. Adding extra audio, layering multiple tracks, or increasing the volume of other music over ours will prevent monetization for that video. To keep your content eligible for earnings, ensure that our music plays at a minimum volume of 12% for at least 20 seconds. This guarantees compliance and allows our system to accurately track and monetize your Shorts."
  },
  {
    question: "How Can I Increase Or Maximize My Youtube Shorts Revenue?",
    answer: "To maximize your revenue from YouTube Shorts, focus on three key things: consistency, audience demographics, and watch time. Posting regularly with Shorts that are at least 35 seconds long tends to perform better in terms of RPM. Creators who attract audiences from countries like the US, UK, Canada, and Australia usually see higher earnings. Using music from our approved library at a minimum of 12% volume also ensures proper tracking and monetization. The more engaging your content is, the better your retention and the higher your earnings."
  },
  {
    question: "How Do I See And Track My Earnings?",
    answer: "As soon as you begin using our music, you'll gain access to our analytics dashboard, where you can track your earnings in real time. This intuitive platform consolidates your total views, RPM, and net profit, making it easy to monitor performance. Keep in mind that YouTube's data processing introduces a 48-hour reporting delay. If you ever need support, our team is always available to assist you."
  },
  {
    question: "How Exactly Do Payments Work?",
    answer: "We handle payments through our trusted partner, Tipalti. When it's time for your payout, our finance team will guide you through the onboarding process, allowing you to select your preferred payment method, whether PayPal, wire transfer, or direct bank deposit. Payments follow a net-90 schedule, meaning your earnings are distributed 90 days after the conclusion of your first full calendar month with us. For instance, if you begin using our music in January, your initial payout will be processed in early May."
  },
  {
    question: "Is There Any Minimum View Requirement To Join This Program?",
    answer: "MediaTiger, unlike other companies, has strict quality control and is very selective about who can join. We are strictly invite-only to filter out channels that post low-quality content, as we do not work with those types of creators."
  }
];

export function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="bg-black py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div 
              key={index}
              className="bg-gray-900/30 rounded-2xl border border-gray-800 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors"
              >
                <h3 className="text-xl font-semibold text-white pr-4">
                  {item.question}
                </h3>
                {openItems.includes(index) ? (
                  <Minus className="w-6 h-6 text-[#6366f1] flex-shrink-0" />
                ) : (
                  <Plus className="w-6 h-6 text-[#6366f1] flex-shrink-0" />
                )}
              </button>
              
              {openItems.includes(index) && (
                <div className="px-8 pb-6">
                  <div className="border-t border-gray-800 pt-6">
                    <p className="text-gray-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}