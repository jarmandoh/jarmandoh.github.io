import { useState, useEffect } from 'react';
import { hashPassword } from '../utils/hashPassword';

// Hash SHA-256 de la contraseña de admin (configurado en .env.local).
// Nunca almacenes la contraseña en texto plano.
const ADMIN_PASSWORD_HASH = import.meta.env.VITE_BINGO_ADMIN_PASSWORD_HASH ?? '';

// Hook para gestionar la autenticación del administrador
export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const AUTH_STORAGE_KEY = 'bingoAdminAuth';
  const AUTH_EXPIRY_HOURS = 24; // Sesión válida por 24 horas

  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = () => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        const now = new Date().getTime();
        
        // Verificar si la sesión no ha expirado
        if (authData.expiry && now < authData.expiry) {
          setIsAuthenticated(true);
        } else {
          // Limpiar sesión expirada
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (password) => {
    const inputHash = await hashPassword(password);
    if (inputHash === ADMIN_PASSWORD_HASH) {
      const expiry = new Date().getTime() + (AUTH_EXPIRY_HOURS * 60 * 60 * 1000);
      const authData = {
        authenticated: true,
        expiry,
        timestamp: new Date().getTime()
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  };

  const getTimeUntilExpiry = () => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        const now = new Date().getTime();
        const timeLeft = authData.expiry - now;
        
        if (timeLeft > 0) {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          return { hours, minutes, valid: true };
        }
      }
    } catch (error) {
      console.error('Error al calcular tiempo de expiración:', error);
    }
    return { hours: 0, minutes: 0, valid: false };
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getTimeUntilExpiry
  };
};