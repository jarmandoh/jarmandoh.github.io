import { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../context/SocketInstance';

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  const { socket, isConnected } = context;
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;
    const errorHandler = (err) => {
      let msg = typeof err === 'string' ? err : err?.message || 'Error desconocido';
      setError(msg);
      console.error('Socket error:', msg);
    };
    socket.on('error', errorHandler);
    return () => {
      socket.off('error', errorHandler);
    };
  }, [socket]);

  const clearError = () => setError('');

  return {
    socket,
    isConnected,
    error,
    clearError
  };
};