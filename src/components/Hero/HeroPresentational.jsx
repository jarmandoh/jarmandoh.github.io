import React from 'react';

export default function HeroPresentational({ name, description }) {
  return (
    <header className="pt-24 pb-32 bg-gray-900 text-white" role="banner" aria-label="Sección principal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-3/5 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4" tabIndex={0}>
            ¡Hola! Soy <span className="text-indigo-500">{name}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            {description}
          </p>
          <div className="space-x-4" role="group" aria-label="Acciones principales">
            <a
              href="#proyectos"
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-8 rounded-full transition duration-300 shadow-lg shadow-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              tabIndex={0}
              aria-label="Ver proyectos"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.target.click(); }}
            >
              Ver Proyectos
            </a>
            <a
              href="#contacto"
              className="inline-block border border-indigo-500 text-indigo-500 hover:bg-indigo-500 hover:text-white font-semibold py-3 px-8 rounded-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              tabIndex={0}
              aria-label="Ir a contacto"
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.target.click(); }}
            >
              Hablemos
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
