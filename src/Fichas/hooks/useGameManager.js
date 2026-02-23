import { useState, useEffect, useMemo } from 'react';
import { useSocket } from './useSocket';
import { GAME_STATES, GAME_CONFIG } from '../data/gameConfig';

export const useGameManager = () => {
  const {
    socket,
    connected,
    currentRoom,
    gameState,
    placeBet,
    drawFicha,
    stand,
  } = useSocket();

  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [pot, setPot] = useState(0);
  const [availableFichas, setAvailableFichas] = useState([]);

  useEffect(() => {
    if (!socket) return;

    socket.on('players-updated', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('current-player-updated', (player) => {
      setCurrentPlayer(player);
    });

    socket.on('pot-updated', (amount) => {
      setPot(amount);
    });

    socket.on('fichas-updated', (fichas) => {
      setAvailableFichas(fichas);
    });

    return () => {
      socket.off('players-updated');
      socket.off('current-player-updated');
      socket.off('pot-updated');
      socket.off('fichas-updated');
    };
  }, [socket]);

  const handleBet = (amount) => {
    if (amount >= GAME_CONFIG.MIN_BET && amount <= GAME_CONFIG.MAX_BET) {
      placeBet(amount);
    }
  };

  const handleDraw = () => {
    drawFicha();
  };

  const handleStand = () => {
    stand();
  };

  const isMyTurn = (playerId) => {
    return currentPlayer?.id === playerId;
  };

  const canBet = (gameState) => {
    return gameState === GAME_STATES.BETTING || gameState === GAME_STATES.REBETTING;
  };

  const canDraw = (gameState, playerId) => {
    return gameState === GAME_STATES.DRAWING && isMyTurn(playerId);
  };

  // Memoizar valores derivados
  const memoizedPlayers = useMemo(() => players, [players]);
  const memoizedCurrentPlayer = useMemo(() => currentPlayer, [currentPlayer]);
  const memoizedAvailableFichas = useMemo(() => availableFichas, [availableFichas]);

  return {
    connected,
    currentRoom,
    gameState,
    players: memoizedPlayers,
    currentPlayer: memoizedCurrentPlayer,
    pot,
    availableFichas: memoizedAvailableFichas,
    handleBet,
    handleDraw,
    handleStand,
    isMyTurn,
    canBet,
    canDraw,
  };
};

export default useGameManager;
