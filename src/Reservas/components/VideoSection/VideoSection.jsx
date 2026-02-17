import React, { useState } from 'react';

const VideoSection = ({
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
  title = "Conoce Nuestras Instalaciones",
  description = "Descubre por qué somos la mejor opción para jugar fútbol en la ciudad"
}) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const getEmbedUrl = (url) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const facilities = [
    { icon: '🌿', title: 'Césped Profesional', desc: 'Superficie sintética de última generación con fibras que simulan césped natural. Máximo confort y rendimiento.', accent: 'from-emerald-400 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { icon: '💡', title: 'Iluminación LED Pro', desc: 'Sistema de iluminación LED de alta potencia que garantiza visibilidad perfecta para partidos nocturnos.', accent: 'from-amber-400 to-yellow-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { icon: '🚿', title: 'Vestuarios Equipados', desc: 'Duchas con agua caliente, casilleros seguros y áreas amplias para que te prepares cómodamente.', accent: 'from-sky-400 to-blue-600', bg: 'bg-sky-50 dark:bg-sky-950/40' },
    { icon: '🅿️', title: 'Parqueadero Privado', desc: 'Amplio parqueadero con vigilancia las 24 horas y fácil acceso para tu comodidad y seguridad.', accent: 'from-violet-400 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/40' },
    { icon: '☕', title: 'Zona de Cafetería', desc: 'Disfruta de bebidas y snacks antes o después de tu partido en un espacio pensado para la socialización.', accent: 'from-orange-400 to-red-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
    { icon: '🏥', title: 'Primeros Auxilios', desc: 'Kit completo de primeros auxilios y personal capacitado para atender cualquier eventualidad en cancha.', accent: 'from-rose-400 to-pink-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Layered Background */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-sky-500/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-amber-500/50 to-transparent"></div>
      {/* Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 mb-5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-sky-400 tracking-widest uppercase" style={{ fontFamily: "'Exo 2', sans-serif" }}>Tour Virtual</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            {title.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-linear-to-r from-sky-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">{title.split(' ').slice(-1)}</span>
              <span className="absolute -bottom-1 left-0 right-0 h-1 bg-linear-to-r from-sky-500 to-amber-500 rounded-full opacity-60"></span>
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {description}
          </p>
        </div>

        {/* Video + Side Info — Cinematic Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-14 md:mb-20">
          {/* Video — Takes 3/5 */}
          <div className="lg:col-span-3 group">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
              {/* Glowing border on hover */}
              <div className="absolute -inset-px bg-linear-to-br from-sky-500/30 via-transparent to-amber-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-sm"></div>

              {/* Video */}
              <div className="relative pb-[56.25%] bg-slate-950">
                {!isVideoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                    <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center animate-pulse">
                      <svg className="w-8 h-8 text-sky-400 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                )}
                <iframe
                  src={getEmbedUrl(videoUrl) + (getEmbedUrl(videoUrl).includes('?') ? '&' : '?') + 'controls=0&mute=1&autoplay=1&loop=1&playlist=' + getEmbedUrl(videoUrl).split('/').slice(-1)[0]}
                  title="Video de presentación"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onLoad={() => setIsVideoLoaded(true)}
                  tabIndex="-1"
                  style={{ pointerEvents: 'none' }}
                ></iframe>
                {/* <iframe width="560" height="315" src="https://www.youtube.com/embed/gg7AglK4aIY?si=mbFw3EzRoM6APzb-&amp;controls=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe> */}
              </div>

              {/* Bottom gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-black/40 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Side Stats — Takes 2/5 */}
          <div className="lg:col-span-2 flex flex-col gap-4 justify-center">
            {[
              { value: '5', unit: 'Canchas', desc: 'Disponibles para reservar', icon: '🏟️', gradient: 'from-sky-500 to-sky-600' },
              { value: '17h', unit: 'Diarias', desc: 'De 6:00 AM a 11:00 PM', icon: '⏰', gradient: 'from-amber-500 to-amber-600' },
              { value: '+500', unit: 'Partidos', desc: 'Se juegan cada mes aquí', icon: '⚽', gradient: 'from-emerald-500 to-green-600' },
              { value: '98%', unit: 'Satisfacción', desc: 'Valoración de nuestros clientes', icon: '⭐', gradient: 'from-violet-500 to-purple-600' },
            ].map((stat, i) => (
              <div
                key={i}
                className="group/stat relative flex items-center gap-4 p-4 rounded-xl bg-white/4 hover:bg-white/8 border border-white/6 hover:border-white/12 transition-all duration-400 cursor-default"
              >
                {/* Accent line on left */}
                <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-linear-to-b ${stat.gradient} opacity-40 group-hover/stat:opacity-100 transition-opacity`}></div>

                <div className={`w-12 h-12 shrink-0 rounded-xl bg-linear-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <span className="text-xl">{stat.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>{stat.value}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.unit}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities Grid */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap" style={{ fontFamily: "'Exo 2', sans-serif" }}>
              Lo que encontrarás
            </h3>
            <div className="h-px flex-1 bg-linear-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {facilities.map((item, i) => (
              <div
                key={i}
                className="group/card relative rounded-2xl p-5 bg-white/3 hover:bg-white/7 border border-white/6 hover:border-white/12 transition-all duration-500 cursor-default"
              >
                {/* Top accent gradient */}
                <div className={`absolute top-0 left-4 right-4 h-px bg-linear-to-r ${item.accent} opacity-0 group-hover/card:opacity-60 transition-opacity duration-500`}></div>

                <div className="flex items-start gap-4">
                  <div className={`relative w-12 h-12 shrink-0 rounded-xl bg-linear-to-br ${item.accent} flex items-center justify-center shadow-lg group-hover/card:scale-110 group-hover/card:rotate-3 transition-transform duration-500`}>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-white mb-1 group-hover/card:text-sky-300 transition-colors" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed group-hover/card:text-slate-400 transition-colors">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
