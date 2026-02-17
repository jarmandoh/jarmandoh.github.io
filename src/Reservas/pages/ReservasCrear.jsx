import React, { useState } from 'react';
import fondoFut from '../../assets/fondo_fut.jpeg';
import { Link, useNavigate } from 'react-router-dom';
import { useReservas } from '../context/ReservasContext';
import ReservationForm from '../components/ReservationForm';
import ReservationSuccessModal from '../components/ReservationSuccessModal';
import ScrollToTopButton from '../components/ScrollToTopButton';

const ReservasCrear = () => {
  const { settings } = useReservas();
  const navigate = useNavigate();
  const [successReservation, setSuccessReservation] = useState(null);

  const handleReservationSuccess = (reservation) => {
    setSuccessReservation(reservation);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 dark:bg-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center justify-between h-14 md:h-16">
            <Link to="/reservas" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-linear-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center transform group-hover:rotate-3 transition-transform">
                <span className="text-lg md:text-xl">⚽</span>
              </div>
              <span className="font-black text-lg md:text-xl text-gray-900 dark:text-white" style={{ fontFamily: "'Exo 2', sans-serif" }}>
                {settings?.businessName || 'Canchas El Golazo'}
              </span>
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
              <Link
                to="/reservas"
                className="px-3 py-2 md:px-4 text-sm text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold transition-colors"
              >
                ← Volver
              </Link>
              <Link
                to="/reservas/canchas"
                className="hidden sm:inline-flex px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold transition-colors"
              >
                Ver Canchas
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Form — Full viewport */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 w-full max-w-[1200px] mx-auto px-3 sm:px-4 py-4 md:py-6">
          <ReservationForm
            onSuccess={handleReservationSuccess}
            onCancel={() => navigate('/reservas')}
            fullPage
          />
        </div>
      </div>

      {/* Success Modal */}
      {successReservation && (
        <ReservationSuccessModal
          reservation={successReservation}
          settings={settings}
          onClose={() => {
            setSuccessReservation(null);
            navigate('/reservas');
          }}
        />
      )}

      {/* Botón flotante Ir Arriba */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Ir arriba"
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-sky-600 hover:bg-sky-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-2xl border-4 border-white/30 transition-colors"
        style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <ScrollToTopButton />
    </div>
  );
};

export default ReservasCrear;
