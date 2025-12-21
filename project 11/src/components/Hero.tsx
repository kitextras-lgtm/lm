import React from 'react';

export function Hero() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
          Elevate Your <span className="italic text-[#6366f1] animate-pulse">Youtube Shorts</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
          Custom created premium music crafted for enhanced reach, virality, overall quality of your shorts, and generate a completely new revenue stream.
        </p>
        
        <button className="bg-[#6366f1] hover:bg-[#5855eb] text-white px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#6366f1]/25">
          Start Here
        </button>
        
        {/* Animated mouse scroll indicator */}
        <div className="mt-16 flex flex-col items-center">
          <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-bounce"></div>
          </div>
          <p className="text-gray-400 text-sm mt-2 animate-pulse">Scroll down</p>
        </div>
      </div>

    </main>
  );
}