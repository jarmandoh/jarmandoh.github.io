import { useState, useEffect } from 'react';

const FICHAS_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useGestorAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gestorData, setGestorData] = useState(null);

  useEffect(() => {
    const savedGestor = localStorage.getItem('fichasGestorData');
    if (savedGestor) {
      try {
        const data = JSON.parse(savedGestor);
        if (data.token) {
          setGestorData(data);
          setIsAuthenticated(true);
        }
      } catch {
        localStorage.removeItem('fichasGestorData');
      }
    }
  }, []);

  const login = async (password) => {
    try {
      const res = await fetch(`${FICHAS_SERVER_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'gestor', password, role: 'gestor' }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.message || 'Error al iniciar sesión' };
      }
      const gestorInfo = { ...data.user, token: data.token, loginAt: new Date().toISOString() };
      localStorage.setItem('fichasGestorData', JSON.stringify(gestorInfo));
      setGestorData(gestorInfo);
      setIsAuthenticated(true);
      window.dispatchEvent(new Event('fichas-auth-change'));
      return { success: true };
    } catch {
      return { success: false, error: 'No se pudo conectar al servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem('fichasGestorData');
    setGestorData(null);
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('fichas-auth-change'));
  };

  return {
    isAuthenticated,
    gestorData,
    login,
    logout,
  };
};

export default useGestorAuth;
