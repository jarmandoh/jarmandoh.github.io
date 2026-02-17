import React from 'react';
import fondoFut from '../../assets/fondo_fut.jpeg';
import { Link } from 'react-router-dom';
import { useReservas } from '../context/ReservasContext';
import CourtCard from '../components/CourtCard';
import { COURT_TYPES } from '../data/courtsConfig';
import ScrollToTopButton from '../components/ScrollToTopButton';

const ReservasCanchas = () => {
  const { courts, settings } = useReservas();
  const activeCourts = courts.filter(c => c.isActive !== false);

  return (
    <div className="min-h-screen relative">
      {/* Fondo Parallax */}
      <div className="reservas-parallax-bg" aria-hidden="true"></div>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/reservas" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-linear-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center transform group-hover:rotate-3 transition-transform">
                <span className="text-xl">⚽</span>
              </div>
              <span className="font-black text-xl text-gray-900 dark:text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                {settings?.businessName || 'Canchas El Golazo'}
              </span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <Link to="/reservas" className="relative text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-semibold text-sm group">
                Inicio
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/reservas/canchas" className="relative text-sky-600 dark:text-sky-400 font-bold text-sm">
                Canchas
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-sky-500"></span>
              </Link>
              <Link to="/reservas#reservar" className="relative text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-semibold text-sm group">
                Reservar
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/reservas#contacto" className="relative text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors font-semibold text-sm group">
                Contacto
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <Link 
                to="/reservas/admin"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
              >
                Admin
              </Link>
              <Link
                to="/reservas#reservar"
                className="px-5 py-2.5 bg-linear-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-sky-500/30"
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                Reservar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-28 pb-12 md:pt-32 md:pb-16 bg-linear-to-br from-sky-600 via-sky-700 to-sky-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-4 text-center relative z-10">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
              <span className="text-5xl">🏟️</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            Nuestras Canchas
          </h1>
          <p className="text-lg md:text-xl text-sky-100 max-w-2xl mx-auto">
            Diferentes tipos de canchas para adaptarnos a tus necesidades
          </p>
        </div>
      </div>

      {/* Court Types Info */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(14, 165, 233, 0.1) 35px, rgba(14, 165, 233, 0.1) 70px)" }}></div>
        
        <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8 text-center" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            Tipos de Canchas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-12">
            {Object.values(COURT_TYPES).map((type, index) => (
              <div 
                key={type.id}
                className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-7 border-2 border-gray-200 dark:border-gray-700 hover:border-sky-400 dark:hover:border-sky-600 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Gradient Accent */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-sky-500 via-amber-400 to-sky-500 rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-linear-to-br from-sky-500 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <span className="text-3xl">{type.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-lg md:text-xl text-gray-900 dark:text-white mb-1" style={{ fontFamily: "'Exo 2', sans-serif" }}>{type.name}</h3>
                    <p className="text-sm text-sky-600 dark:text-sky-400 font-semibold">{type.dimensions}</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">{type.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                    <span className="text-lg">👥</span>
                    <span className="font-semibold">{type.playersPerTeam} vs {type.playersPerTeam}</span>
                  </span>
                  <span className="font-black text-base text-sky-600 dark:text-sky-400" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                    Desde ${(type.defaultPrice * 0.8).toLocaleString('es-CO')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Available Courts */}
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-8 text-center" style={{ fontFamily: "'Exo 2', sans-serif" }}>
            Canchas Disponibles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {activeCourts.map(court => (
              <CourtCard 
                key={court.id}
                court={court}
                onSelect={() => {}}
              />
            ))}
          </div>

          {activeCourts.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <span className="text-6xl mb-4 block animate-pulse">🏟️</span>
              <p className="text-base text-gray-500 dark:text-gray-400 font-medium">
                Pronto tendremos canchas disponibles
              </p>
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <Link
              to="/reservas#reservar"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-gray-900 font-black rounded-2xl transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl text-base md:text-lg relative overflow-hidden"
              style={{ fontFamily: "'Exo 2', sans-serif" }}
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <span className="text-2xl group-hover:scale-125 transition-transform">🎯</span>
              <span className="relative z-10">¡Reserva tu cancha ahora!</span>
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-10">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-linear-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🏟️</span>
              </div>
              <div>
                <span className="font-black text-lg block" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                  {settings?.businessName || 'Canchas El Golazo'}
                </span>
                <span className="text-xs text-gray-400">Tu mejor opción deportiva</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@700;800;900&display=swap');
      `}</style>
      <ScrollToTopButton />
    </div>
  );
};

export default ReservasCanchas;
