import React from 'react';

export function CallToAction() {
  return (
    <section className="bg-black py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
            Now, it's your turn.
          </h2>
          
          <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Don't miss this opportunity to unlocking your channel's fullest potentials. You may have not known about this before, but now you do.
          </p>
          
          <button className="bg-white hover:bg-gray-100 text-[#6366f1] px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
            Start Here
          </button>
        </div>
        
        <p className="text-white/70 text-sm mt-8 text-center">
          © 2025 MediaTiger Music Records. All Rights Reserved.
        </p>
      </div>
    </section>
  );
}