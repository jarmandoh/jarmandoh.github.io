import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketRefContext = createContext(null);
const ConnectionStatusContext = createContext(false);

export const useFichasSocket = () => useContext(SocketRefContext);
export const useFichasConnectionStatus = () => useContext(ConnectionStatusContext);

const getStoredToken = () => {
  try {
    for (const key of ['fichasGestorData', 'fichasAdminData', 'fichasPlayerData']) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token) return parsed.token;
      }
    }
  } catch { /* ignore */ }
  return null;
};

export const FichasSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState(() => getStoredToken());
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    const handleAuthChange = () => setToken(getStoredToken());
    window.addEventListener('fichas-auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('fichas-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    socketRef.current?.close();
    setConnected(false);
    setSocketInstance(null);

    if (!token) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      path: '/fichas-socket',
      transports: ['websocket', 'polling'],
      auth: { token },
    });

    socketRef.current = socket;
    setSocketInstance(socket);

    socket.on('connect', () => {
      console.log('Conectado al servidor de Fichas');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Desconectado del servidor de Fichas');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Error de conexión Fichas:', err.message);
      setConnected(false);
    });

    return () => {
      socket.close();
    };
  }, [token]);

  return (
    <SocketRefContext.Provider value={socketInstance}>
      <ConnectionStatusContext.Provider value={connected}>
        {children}
      </ConnectionStatusContext.Provider>
    </SocketRefContext.Provider>
  );
};
