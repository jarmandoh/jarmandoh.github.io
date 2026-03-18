import { useState, useEffect } from 'react';

// Hook para gestionar la autenticación de jugadores
export const usePlayerAuth = () => {
  const [player, setPlayer] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState(null);

  const PLAYER_STORAGE_KEY = 'bingoPlayerAuth';
  const PLAYER_SESSION_HOURS = 8; // Sesión de jugador válida por 8 horas

  useEffect(() => {
    checkStoredPlayer();
  }, []);

  const checkStoredPlayer = () => {
    try {
      const storedPlayer = localStorage.getItem(PLAYER_STORAGE_KEY);
      if (storedPlayer) {
        const playerData = JSON.parse(storedPlayer);
        const now = new Date().getTime();
        if (playerData.expiresAt && now > playerData.expiresAt) {
          localStorage.removeItem(PLAYER_STORAGE_KEY);
        } else {
          setPlayer(playerData);
          setCurrentGame(playerData.gameId);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error al verificar jugador:', error);
      localStorage.removeItem(PLAYER_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const loginPlayer = (playerData) => {
    const playerInfo = {
      id: Date.now() + Math.random(),
      name: playerData.name,
      gameId: playerData.gameId,
      cardNumber: playerData.cardNumber || null,
      winPattern: playerData.winPattern || null,
      winningNumbers: playerData.winningNumbers || [],
      joinedAt: new Date().toISOString(),
      expiresAt: new Date().getTime() + (PLAYER_SESSION_HOURS * 60 * 60 * 1000)
    };
    
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(playerInfo));
    setPlayer(playerInfo);
    setCurrentGame(playerData.gameId);
    setIsAuthenticated(true);
    return playerInfo;
  };

  const updatePlayerCard = (cardNumber) => {
    if (player) {
      const updatedPlayer = { ...player, cardNumber };
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(updatedPlayer));
      setPlayer(updatedPlayer);
    }
  };

  const updatePlayerPattern = (winPattern, winningNumbers) => {
    if (player) {
      const updatedPlayer = { ...player, winPattern, winningNumbers };
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(updatedPlayer));
      setPlayer(updatedPlayer);
    }
  };

  const logoutPlayer = () => {
    localStorage.removeItem(PLAYER_STORAGE_KEY);
    setPlayer(null);
    setCurrentGame(null);
    setIsAuthenticated(false);
  };

  const switchGame = (gameId) => {
    if (player) {
      const updatedPlayer = { ...player, gameId, cardNumber: null };
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(updatedPlayer));
      setPlayer(updatedPlayer);
      setCurrentGame(gameId);
    }
  };

  return {
    player,
    isAuthenticated,
    isLoading,
    currentGame,
    loginPlayer,
    updatePlayerCard,
    updatePlayerPattern,
    logoutPlayer,
    switchGame
  };
};