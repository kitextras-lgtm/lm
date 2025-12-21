import React from 'react';
import { Play } from 'lucide-react';

export const CaseStudies = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Case Studies</h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Why is using high quality background music in your shorts important? Let's take a look at some of our
            creators who use our music on their shorts.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { name: 'H1T1', subscribers: '7.3M+ Subscribers' },
            { name: 'Danny Reyes', subscribers: '1.7M+ Subscribers' },
            { name: 'Ange_Cope', subscribers: '6.3M+ Subscribers' }
          ].map((creator, index) => (
            <div key={index} className="bg-gray-800 rounded-2xl overflow-hidden">
              <div className="aspect-[9/16] bg-gray-700 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Video Thumbnail</span>
                </div>
                <button className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors z-10">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </button>
              </div>
              <div className="p-4 flex items-center">
                <div className="w-10 h-10 bg-gray-600 rounded-full mr-3"></div>
                <div>
                  <h3 className="font-semibold text-white">{creator.name}</h3>
                  <p className="text-gray-400 text-sm">{creator.subscribers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-16">
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
            These creators were posting videos without music or using other people's music.
          </p>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
            Come to find out they quickly realized that using custom made music not only <span className="text-white font-semibold">boosted their reach, overall shorts quality, mitigated risks relating copyrights from using other's music, and also earned them a good amount of new revenue on the side.</span>
          </p>
          <p className="text-2xl font-bold text-white">
            The benefits are too good to ignore.
          </p>
        </div>

        {/* Now Let's Dive Deeper Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Now Let's Dive Deeper..</h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto">
            Shawn (another creator in our catalog) was your typical Youtube shorts.
          </p>
        </div>

        {/* Second Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'H1T1', subscribers: '7.3M+ Subscribers' },
            { name: 'Danny Reyes', subscribers: '1.7M+ Subscribers' },
            { name: 'Ange_Cope', subscribers: '6.3M+ Subscribers' }
          ].map((creator, index) => (
            <div key={index} className="bg-gray-800 rounded-2xl overflow-hidden">
              <div className="aspect-[9/16] bg-gray-700 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gray-500 text-lg">Video Thumbnail</span>
                </div>
                <button className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors z-10">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </button>
              </div>
              <div className="p-4 flex items-center">
                <div className="w-10 h-10 bg-gray-600 rounded-full mr-3"></div>
                <div>
                  <h3 className="font-semibold text-white">{creator.name}</h3>
                  <p className="text-gray-400 text-sm">{creator.subscribers}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};