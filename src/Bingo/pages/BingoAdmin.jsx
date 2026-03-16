import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '../hooks/useAdminAuth';
import GestorPasswordManager from '../components/GestorPasswordManager';

const BingoAdmin = () => {
  const { logout, getTimeUntilExpiry } = useAdminAuth();
  const timeLeft = getTimeUntilExpiry();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-200 via-pink-100 to-blue-200 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-700 mb-2">Administrador</h1>
              <p className="text-gray-600">Gestiona los accesos de gestores de sorteos</p>
              {timeLeft.valid && (
                <p className="text-gray-600 text-sm mt-1">
                  Sesión expira en: {timeLeft.hours}h {timeLeft.minutes}m
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <Link
                to="/bingo"
                className="bg-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-300 transition duration-300 inline-flex items-center"
              >
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Juego Principal
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-lg transition duration-300 inline-flex items-center"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                Salir
              </button>
            </div>
          </div>
        </div>

        {/* Gestión de gestores - embebido */}
        <GestorPasswordManager
          onClose={() => {}}
          embedded
        />
      </div>
    </div>
  );
};

export default BingoAdmin;
