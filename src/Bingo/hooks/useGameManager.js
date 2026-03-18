import { useState, useCallback, useEffect } from 'react';
import { checkCardPattern } from '../utils/checkWinPattern';

// Hook para gestionar juegos y sorteos
export const useGameManager = () => {
  const [games, setGames] = useState([]);
  const [activeGame, setActiveGame] = useState(null);

  const GAMES_STORAGE_KEY = 'bingoGames';


  // Cargar juegos desde localStorage al montar
  useEffect(() => {
    const storedGames = localStorage.getItem(GAMES_STORAGE_KEY);
    if (storedGames) {
      try {
        setGames(JSON.parse(storedGames));
      } catch {
        console.error('Estado de juegos corrupto en localStorage, reiniciando…');
        localStorage.removeItem(GAMES_STORAGE_KEY);
      }
    }
  }, []);

  const saveGames = (updatedGames) => {
    localStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(updatedGames));
    setGames(updatedGames);
  };

  const createGame = useCallback((gameData) => {
    const newGame = {
      id: `game_${Date.now()}`,
      name: gameData.name || gameData,
      description: gameData.description || '',
      status: 'waiting', // waiting, active, finished
      createdAt: new Date().toISOString(),
      startedAt: null,
      finishedAt: null,
      calledNumbers: [],
      currentNumber: null,
      winners: [],
      maxPlayers: gameData.maxCards || 100,
      currentPlayers: 0,
      prizeAmount: gameData.prizeAmount || 0,
      gestorPassword: null, // Se puede configurar después por el admin
      gestorName: null,
      settings: {
        autoMarkNumbers: gameData.autoMarkNumbers || false,
        showNumberHistory: gameData.showNumberHistory !== false,
        allowMultipleWinners: gameData.allowMultipleWinners !== false,
        winPatterns: gameData.winPatterns || ['line', 'diagonal', 'fullCard'],
        customPattern: gameData.customPattern || null
      }
    };

    const updatedGames = [...games, newGame];
    saveGames(updatedGames);
    return newGame;
  }, [games]);

  const startGame = useCallback((gameId) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        // Finalizar cualquier juego activo anterior
        if (activeGame && activeGame.id !== gameId) {
          return game;
        }
        
        const updatedGame = {
          ...game,
          status: 'active',
          startedAt: new Date().toISOString(),
          calledNumbers: [],
          currentNumber: null,
          winners: []
        };
        
        setActiveGame(updatedGame);
        return updatedGame;
      } else if (game.status === 'active') {
        // Pasar juegos activos a finalizado
        return { ...game, status: 'finished', finishedAt: new Date().toISOString() };
      }
      return game;
    });
    
    saveGames(updatedGames);
  }, [games, activeGame]);

  const finishGame = useCallback((gameId, winners = []) => {
    const updatedGames = games.map(game => 
      game.id === gameId 
        ? { 
            ...game, 
            status: 'finished', 
            finishedAt: new Date().toISOString(),
            winners 
          }
        : game
    );
    
    saveGames(updatedGames);
    
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(null);
    }
  }, [games, activeGame]);

  const updateGameState = useCallback((gameId, updates) => {
    const updatedGames = games.map(game => 
      game.id === gameId ? { ...game, ...updates } : game
    );
    
    saveGames(updatedGames);
    
    if (activeGame && activeGame.id === gameId) {
      setActiveGame({ ...activeGame, ...updates });
    }
  }, [games, activeGame]);

  // Función para actualizar juego directamente (alias para compatibilidad)
  const updateGame = useCallback((gameId, updates) => {
    updateGameState(gameId, updates);
  }, [updateGameState]);

  const deleteGame = useCallback((gameId) => {
    const updatedGames = games.filter(game => game.id !== gameId);
    saveGames(updatedGames);
    
    if (activeGame && activeGame.id === gameId) {
      setActiveGame(null);
    }
  }, [games, activeGame]);

  const getGameById = useCallback((gameId) => {
    return games.find(game => game.id === gameId);
  }, [games]);

  const getGamesByStatus = useCallback((status) => {
    return games.filter(game => game.status === status);
  }, [games]);

  const addCalledNumber = useCallback((gameId, number) => {
    const game = getGameById(gameId);
    if (!game || game.status !== 'active') return false;

    if (game.calledNumbers.includes(number)) return false;

    const updatedCalledNumbers = [...game.calledNumbers, number];
    
    updateGameState(gameId, {
      calledNumbers: updatedCalledNumbers,
      currentNumber: number
    });
    
    return true;
  }, [getGameById, updateGameState]);

  const resetGame = useCallback((gameId) => {
    updateGameState(gameId, {
      calledNumbers: [],
      currentNumber: null,
      winners: []
    });
  }, [updateGameState]);

  const getAvailableNumbers = useCallback((gameId) => {
    const game = getGameById(gameId);
    if (!game) return [];
    
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    return allNumbers.filter(num => !game.calledNumbers.includes(num));
  }, [getGameById]);

  const getGameStats = useCallback((gameId) => {
    const game = getGameById(gameId);
    if (!game) return null;

    return {
      totalNumbers: 75,
      calledNumbers: game.calledNumbers.length,
      remainingNumbers: 75 - game.calledNumbers.length,
      progress: (game.calledNumbers.length / 75) * 100,
      winners: game.winners.length,
      duration: game.startedAt ? 
        Math.floor((new Date() - new Date(game.startedAt)) / 1000 / 60) : 0
    };
  }, [getGameById]);

  // Función para configurar contraseña de gestor (almacena hash SHA-256)
  const setGestorPassword = useCallback(async (gameId, password, gestorName = '') => {
    const { hashPassword } = await import('../utils/hashPassword');
    const hashedPassword = await hashPassword(password);
    const updatedGames = games.map(game => 
      game.id === gameId 
        ? { ...game, gestorPassword: hashedPassword, gestorName: gestorName }
        : game
    );
    saveGames(updatedGames);
    return updatedGames.find(game => game.id === gameId);
  }, [games]);

  return {
    games,
    activeGame,
    currentGame: activeGame, // Alias para mantener compatibilidad
    createGame,
    startGame,
    finishGame,
    updateGameState,
    updateGame,
    deleteGame,
    getGameById,
    getGamesByStatus,
    addCalledNumber,
    resetGame,
    getAvailableNumbers,
    getGameStats,
    setActiveGame,
    setCurrentGame: setActiveGame, // Alias para mantener compatibilidad
    setGestorPassword,
    checkWinPattern: checkCardPattern
  };
};