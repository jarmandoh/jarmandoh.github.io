import React, { useEffect } from 'react';
import { useGestorAuth } from '../hooks/useGestorAuth';
import GestorLogin from '../components/GestorLogin';
import BingoGestor from './BingoGestor';

const ProtectedBingoGestor = () => {
  const { isAuthenticated, loading, loginGestor } = useGestorAuth();

  useEffect(() => {
    document.title = isAuthenticated ? 'Gestor | Bingo Game' : 'Login Gestor | Bingo';
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-600 to-red-600 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <BingoGestor /> : <GestorLogin onLogin={loginGestor} />;
};

export default ProtectedBingoGestor;