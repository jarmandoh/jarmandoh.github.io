import React, { useEffect, useRef } from 'react';
import bgHero from '../assets/bg_hero.jpg';

const Hero = () => {
  const bgRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!bgRef.current) return;
      const offset = window.scrollY * 0.4;
      bgRef.current.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="relative pt-24 pb-32 text-white overflow-hidden" role="banner" aria-label="Sección principal">

      {/* Capa parallax */}
      <div
        ref={bgRef}
        aria-hidden="true"
        className="absolute inset-0 -top-16 -bottom-16 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url('${bgHero}')` }}
      />

      {/* Overlay oscuro */}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-black/75 via-gray-900/80 to-black/70" />

      {/* Contenido */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        {/* Contenido de Texto */}
        <div className="md:w-3/5 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4">
            ¡Hola! Soy <span className="text-indigo-400">Janier Hernandez</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Desarrollador <span className="font-bold">Fullstack</span> con pasión por construir experiencias digitales escalables y elegantes.
          </p>
          <div className="space-x-4" role="group" aria-label="Acciones principales">
            <a
              href="#proyectos"
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full transition duration-300 shadow-lg shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Ver proyectos"
            >
              Ver Proyectos
            </a>
            <a
              href="#contacto"
              className="inline-block border border-indigo-400 text-indigo-400 hover:bg-indigo-500 hover:text-white font-semibold py-3 px-8 rounded-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Ir a contacto"
            >
              Hablemos
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
