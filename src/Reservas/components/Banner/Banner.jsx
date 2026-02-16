import React from 'react';
import defaultBannerImage from '../../../assets/image_field.jpg';
import fondoFut from '../../../assets/fondo_fut.jpeg';
const Banner = ({ 
  title = "Canchas El Golazo",
  subtitle = "Las mejores canchas sintéticas de la ciudad",
  backgroundImage = fondoFut || defaultBannerImage,
  showCTA = true,
  ctaText = "Reserva Ahora",
  onCtaClick = () => {}
}) => {
  return (
    <div className="relative h-[520px] md:h-[580px] lg:h-[620px] overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(14, 165, 233, 0.1) 35px,
            rgba(14, 165, 233, 0.1) 70px
          )`
        }}></div>
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center animate-[subtle-zoom_20s_ease-in-out_infinite]"
        style={{
          backgroundImage: `url(${backgroundImage || defaultBannerImage})`
        }}
      >
        {/* Dynamic Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-sky-900/80 via-slate-900/70 to-amber-900/60"></div>
        
        {/* Animated Accent Gradient */}
        <div className="absolute inset-0 bg-linear-to-tr from-transparent via-sky-500/10 to-amber-500/10 animate-pulse"></div>
      </div>

      {/* Floating Geometric Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-linear-to-br from-sky-400/20 to-transparent rounded-full blur-3xl animate-[float_6s_ease-in-out_infinite]"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-linear-to-tr from-amber-400/15 to-transparent rounded-full blur-3xl animate-[float_8s_ease-in-out_infinite_1s]"></div>
        <div className="absolute bottom-20 right-1/4 w-32 h-32 bg-linear-to-bl from-blue-400/20 to-transparent rounded-full blur-2xl animate-[float_7s_ease-in-out_infinite_0.5s]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center pt-16 md:pt-12">
        {/* Animated Logo Container */}
        <div className="mb-4 md:mb-6 animate-[bounce-in_0.8s_ease-out]">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-sky-400/30 rounded-full blur-xl animate-pulse"></div>
            
            {/* Main Icon */}
            <div className="relative w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-sky-400 to-sky-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto border-4 border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <span className="text-4xl md:text-5xl animate-[wiggle_1s_ease-in-out_infinite]">⚽</span>
            </div>
          </div>
        </div>

        {/* Title with Stagger Animation */}
        <div className="mb-3 md:mb-4 space-y-2">
          <h1 
            className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-0 drop-shadow-2xl animate-[slide-up_0.6s_ease-out_0.2s_both]"
            style={{ fontFamily: "'Exo 2', 'Outfit', sans-serif", letterSpacing: '-0.02em' }}
          >
            {title}
          </h1>
          <div className="h-1.5 w-24 md:w-32 bg-linear-to-r from-sky-400 via-amber-400 to-sky-400 mx-auto rounded-full animate-[slide-up_0.6s_ease-out_0.4s_both]"></div>
        </div>

        {/* Subtitle */}
        <p 
          className="text-lg md:text-xl lg:text-2xl text-white/95 mb-6 md:mb-8 max-w-2xl drop-shadow-lg px-4 animate-[slide-up_0.6s_ease-out_0.5s_both]"
          style={{ fontFamily: "'DM Sans', 'Inter', sans-serif" }}
        >
          {subtitle}
        </p>

        {/* CTA Button with Enhanced Animation */}
        {showCTA && (
          <button
            onClick={onCtaClick}
            className="group relative px-8 py-4 md:px-10 md:py-5 bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-base md:text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-sky-500/50 flex items-center gap-3 animate-[slide-up_0.6s_ease-out_0.6s_both] overflow-hidden"
          >
            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <span className="text-2xl animate-[spin-slow_3s_linear_infinite]">🎯</span>
            <span className="relative z-10" style={{ fontFamily: "'Exo 2', sans-serif" }}>{ctaText}</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        )}

        {/* Enhanced Features Pills */}
        <div className="mt-8 md:mt-10 flex flex-wrap justify-center gap-3 md:gap-4 animate-[slide-up_0.6s_ease-out_0.7s_both]">
          {[
            { icon: '⚡', text: 'Fútbol 5', color: 'from-amber-500/30 to-amber-600/30', delay: '0.8s' },
            { icon: '🔥', text: 'Fútbol 8', color: 'from-sky-500/30 to-sky-600/30', delay: '0.9s' },
            { icon: '🏆', text: 'Fútbol 11', color: 'from-blue-500/30 to-blue-600/30', delay: '1s' }
          ].map((item, index) => (
            <div 
              key={index}
              className={`group px-4 py-2.5 md:px-5 md:py-3 bg-linear-to-br ${item.color} backdrop-blur-md rounded-xl md:rounded-2xl text-white text-sm md:text-base font-semibold flex items-center gap-2 border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-default animate-[slide-up_0.6s_ease-out_${item.delay}_both]`}
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <span className="text-xl group-hover:scale-125 transition-transform duration-300">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Bottom Wave with Animation */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-[wave_3s_ease-in-out_infinite]">
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            className="fill-white dark:fill-gray-900"
          />
        </svg>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          50% { transform: scale(1.1) rotate(10deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
        }
        
        @keyframes subtle-zoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default Banner;
