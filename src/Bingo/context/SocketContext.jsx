import React, { useState, useEffect } from 'react';
import { SocketContext } from './SocketInstance';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel('bingo_game_channel');
    const mockSocket = {
      _listeners: {},
      connected: true,
      id: `socket_${Date.now()}`,
      emit: (event, data, callback) => {
        channel.postMessage({ type: event, data });
        setTimeout(() => {
          mockSocket._trigger(event, data);
        }, 0);
        if (typeof callback === 'function') {
          setTimeout(() => {
            callback({ success: true });
          }, 10);
        }
      },
      on: (event, callback) => {
        if (!mockSocket._listeners[event]) {
          mockSocket._listeners[event] = [];
        }
        mockSocket._listeners[event].push(callback);
        // Disparar evento connect si ya está conectado
        if (event === 'connect' && mockSocket.connected) {
          setTimeout(() => callback(), 0);
        }
      },
      off: (event, callback) => {
        if (mockSocket._listeners[event]) {
          if (callback) {
            mockSocket._listeners[event] = mockSocket._listeners[event].filter(cb => cb !== callback);
          } else {
            delete mockSocket._listeners[event];
          }
        }
      },
      _trigger: (event, data) => {
        if (mockSocket._listeners[event]) {
          mockSocket._listeners[event].forEach(cb => {
            try {
              cb(data);
            } catch (error) {
              console.error(`Error en listener de ${event}:`, error);
            }
          });
        }
      },
      disconnect: () => {
        mockSocket.connected = false;
        mockSocket._trigger('disconnect');
        setIsConnected(false);
      },
      connect: () => {
        mockSocket.connected = true;
        setIsConnected(true);
        mockSocket._trigger('connect');
      }
    };

    // Escuchar mensajes de otras pestañas
    channel.onmessage = (msg) => {
      const { type, data } = msg.data;
      mockSocket._trigger(type, data);
    };

    // Manejar errores del canal → marcar como desconectado para que la UI lo refleje
    channel.onerror = (error) => {
      console.error('BroadcastChannel error:', error);
      mockSocket.connected = false;
      setIsConnected(false);
    };

    setSocket(mockSocket);
    setIsConnected(true);

    // Sincronizar con el estado de red del navegador
    const handleOffline = () => { mockSocket.connected = false; setIsConnected(false); };
    const handleOnline  = () => { mockSocket.connect(); };
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online',  handleOnline);

    // Disparar evento de conexión inicial
    setTimeout(() => {
      mockSocket._trigger('connect');
    }, 100);

    // Mantener conexión activa con heartbeat.
    // Se omite cuando la pestaña está en segundo plano para ahorrar recursos.
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'hidden') return;
      if (!mockSocket.connected) {
        mockSocket.connect();
      }
    }, 5000); // Verificar cada 5 segundos

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online',  handleOnline);
      channel.close();
      if (mockSocket.connected) {
        mockSocket.disconnect();
      }
    };
  }, []);

  const value = {
    socket,
    isConnected
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
      {/* Indicador de estado de conexión global */}
      {!isConnected && (
        <div className="fixed bottom-5 left-5 z-[9999] flex items-center gap-2 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-pulse">
          <span className="inline-block w-2 h-2 bg-white rounded-full shrink-0" />
          🔌 Desconectado — Verificando conexión...
        </div>
      )}
    </SocketContext.Provider>
  );
};