import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SocketRefContext = createContext(null);
const ConnectionStatusContext = createContext(false);

export const useFichasSocket = () => useContext(SocketRefContext);
export const useFichasConnectionStatus = () => useContext(ConnectionStatusContext);

export const FichasSocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
      path: '/fichas-socket',
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Conectado al servidor de Fichas');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Desconectado del servidor de Fichas');
      setConnected(false);
    });

    return () => {
      socketRef.current?.close();
    };
  }, []);

  return (
    <SocketRefContext.Provider value={socketRef.current}>
      <ConnectionStatusContext.Provider value={connected}>
        {children}
      </ConnectionStatusContext.Provider>
    </SocketRefContext.Provider>
  );
};
