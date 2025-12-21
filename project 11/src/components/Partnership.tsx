import React from 'react';
import { Music, Clapperboard, DollarSign } from 'lucide-react';

export function Partnership() {
  return (
    <section id="partnership" className="bg-black py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            How Our Partnership Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get Started in 3 Simple Steps.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images/music%20-%20Edited.png" 
                alt="Music Icon" 
                className="w-12 h-12"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              1. We Create Your Sound
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Custom music will be made by our in house music team, creating copyright-safe tracks for you.
            </p>
            <p className="text-gray-400 leading-relaxed">
              We cover 100% of the costs of music production and registration costs, along with licensing. There is zero cost on your end. This is completely free of charge.
            </p>
          </div>
          
          {/* Step 2 */}
          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images/416c9dfd-03ad-4e5b-b87c-c56228305b89.png" 
                alt="Video Icon" 
                className="w-12 h-12"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              2. Add Music as Background
            </h3>
            <p className="text-gray-400 leading-relaxed">
              You can use our already produced tracks, or your custom produced tracks on Youtube and add it to your videos through the Youtube App when uploading.
            </p>
          </div>
          
          {/* Step 3 */}
          <div className="bg-gray-900/50 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <img 
                src="https://vaeuvecjtnvismnobvyy.supabase.co/storage/v1/object/public/images/payout%20-%20Edited.png" 
                alt="Payout Icon" 
                className="w-12 h-12"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">
              3. Generate New Revenue
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Start to reap the rewards immediately as your overall shorts quality will be optimized, and you will start to generate music revenue from your shorts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}