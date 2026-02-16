import React, { useState } from 'react';
import fondoFut from '../../assets/fondo_fut.jpeg';
import { Link, useNavigate } from 'react-router-dom';
import { useReservas } from '../context/ReservasContext';
import ReservationForm from '../components/ReservationForm';
import ReservationSuccessModal from '../components/ReservationSuccessModal';

const ReservasCrear = () => {
  const { settings } = useReservas();
  const navigate = useNavigate();
  const [successReservation, setSuccessReservation] = useState(null);

  const handleReservationSuccess = (reservation) => {
    setSuccessReservation(reservation);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Fondo Parallax */}
      <div className="reservas-parallax-bg" aria-hidden="true"></div>
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
    </div>
  );
};

export default ReservasCrear;
