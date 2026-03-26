import { useEffect, useState } from 'react';
import { useFichasSocket, useFichasConnectionStatus } from '../context/SocketContext';

export const useSocket = () => {
  const socket = useFichasSocket();
  const connected = useFichasConnectionStatus();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!socket) return;

    // Listeners para eventos del juego
    socket.on('rooms-updated', (updatedRooms) => {
      setRooms(updatedRooms);
    });

    socket.on('room-joined', (roomData) => {
      setCurrentRoom(roomData);
    });

    socket.on('room-left', () => {
      setCurrentRoom(null);
    });

    socket.on('game-state-updated', (state) => {
      setGameState(state);
    });

    socket.on('error', (error) => {
      let msg = typeof error === 'string' ? error : error?.message || 'Error desconocido';
      setError(msg);
      console.error('Socket error:', msg);
    });

    return () => {
      socket.off('rooms-updated');
      socket.off('room-joined');
      socket.off('room-left');
      socket.off('game-state-updated');
      socket.off('error');
    };
  }, [socket]);

  // Funciones para interactuar con el servidor
  const createRoom = (roomConfig) => {
    socket?.emit('create-room', roomConfig);
  };

  const joinRoom = (roomId, playerData) => {
    socket?.emit('join-room', { roomId, playerData });
  };

  const leaveRoom = (roomId) => {
    socket?.emit('leave-room', roomId);
  };

  const placeBet = (amount) => {
    socket?.emit('place-bet', amount);
  };

  const drawFicha = () => {
    socket?.emit('draw-ficha');
  };

  const stand = () => {
    socket?.emit('stand');
  };

  const getRooms = () => {
    socket?.emit('get-rooms');
  };

  const clearError = () => setError('');

  return {
    socket,
    connected,
    rooms,
    currentRoom,
    gameState,
    error,
    clearError,
    createRoom,
    joinRoom,
    leaveRoom,
    placeBet,
    drawFicha,
    stand,
    getRooms,
  };
};

export default useSocket;
