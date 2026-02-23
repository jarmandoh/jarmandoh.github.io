import { useState, useCallback, useEffect, useMemo } from 'react';

// Hook para gestionar juegos y sorteos
export const useGameManager = () => {
  const [games, setGames] = useState([]);
  const [activeGame, setActiveGame] = useState(null);

  const GAMES_STORAGE_KEY = 'bingoGames';

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = () => {
    // Memoizar games y activeGame para evitar renders innecesarios
    const memoizedGames = useMemo(() => games, [games]);
    const memoizedActiveGame = useMemo(() => activeGame, [activeGame]);

    return {
      games: memoizedGames,
      activeGame: memoizedActiveGame,
      createGame,
      startGame,
      finishGame,
      updateGameState,
      addCalledNumber,
      setActiveGame,
      getGameById,
      updateGame,
      deleteGame,
      setGames
    };
    }
  };

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

  // Función para configurar contraseña de gestor
  const setGestorPassword = useCallback((gameId, password, gestorName = '') => {
    const updatedGames = games.map(game => 
      game.id === gameId 
        ? { ...game, gestorPassword: password, gestorName: gestorName }
        : game
    );
    saveGames(updatedGames);
    return updatedGames.find(game => game.id === gameId);
  }, [games]);

  // Función para validar patrones de victoria
  const checkWinPattern = useCallback((markedNumbers, patternType, customPattern = null) => {
    // Convierte los números marcados a una matriz 5x5
    const cardGrid = Array(25).fill(false);
    markedNumbers.forEach(num => {
      // Lógica para mapear números del bingo a posiciones de la carta
      // Esta es una implementación básica, se puede ajustar según la lógica del cartón
      const index = num - 1; // Ajustar según la lógica de mapeo real
      if (index >= 0 && index < 25) {
        cardGrid[index] = true;
      }
    });

    // El centro siempre está marcado (FREE)
    cardGrid[12] = true;

    switch (patternType) {
      // Líneas horizontales específicas
      case 'horizontalLine1':
        return cardGrid.slice(0, 5).every(cell => cell);
      case 'horizontalLine2':
        return cardGrid.slice(5, 10).every(cell => cell);
      case 'horizontalLine3':
        return cardGrid.slice(10, 15).every(cell => cell);
      case 'horizontalLine4':
        return cardGrid.slice(15, 20).every(cell => cell);
      case 'horizontalLine5':
        return cardGrid.slice(20, 25).every(cell => cell);

      // Columnas verticales (Letra I)
      case 'letterI1':
        return [0, 5, 10, 15, 20].every(i => cardGrid[i]);
      case 'letterI2':
        return [1, 6, 11, 16, 21].every(i => cardGrid[i]);
      case 'letterI3':
        return [2, 7, 12, 17, 22].every(i => cardGrid[i]);
      case 'letterI4':
        return [3, 8, 13, 18, 23].every(i => cardGrid[i]);
      case 'letterI5':
        return [4, 9, 14, 19, 24].every(i => cardGrid[i]);

      case 'line': {
        // Verificar líneas horizontales y verticales (mantener para compatibilidad)
        for (let i = 0; i < 5; i++) {
          // Líneas horizontales
          if (cardGrid.slice(i * 5, (i + 1) * 5).every(cell => cell)) return true;
          // Líneas verticales
          if ([0, 1, 2, 3, 4].every(row => cardGrid[row * 5 + i])) return true;
        }
        return false;
      }

      case 'diagonal': {
        // Diagonal principal
        const mainDiagonal = [0, 6, 12, 18, 24].every(i => cardGrid[i]);
        // Diagonal secundaria
        const antiDiagonal = [4, 8, 12, 16, 20].every(i => cardGrid[i]);
        return mainDiagonal || antiDiagonal;
      }

      case 'fourCorners':
        return cardGrid[0] && cardGrid[4] && cardGrid[20] && cardGrid[24];

      case 'letterX': {
        const mainDiag = [0, 6, 12, 18, 24].every(i => cardGrid[i]);
        const antiDiag = [4, 8, 12, 16, 20].every(i => cardGrid[i]);
        return mainDiag && antiDiag;
      }

      case 'letterT': {
        const topRow = cardGrid.slice(0, 5).every(cell => cell);
        const middleColumn = [2, 7, 12, 17, 22].every(i => cardGrid[i]);
        return topRow && middleColumn;
      }

      case 'letterL': {
        const leftColumn = [0, 5, 10, 15, 20].every(i => cardGrid[i]);
        const bottomRow = cardGrid.slice(20, 25).every(cell => cell);
        return leftColumn && bottomRow;
      }

      case 'cross': {
        const middleRow = cardGrid.slice(10, 15).every(cell => cell);
        const middleCol = [2, 7, 12, 17, 22].every(i => cardGrid[i]);
        return middleRow && middleCol;
      }

      case 'fullCard':
        return cardGrid.every(cell => cell);

      case 'custom': {
        if (!customPattern) return false;
        return customPattern.every((required, index) => 
          !required || cardGrid[index]
        );
      }

      default:
        return false;
    }
  }, []);

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
    checkWinPattern
  };
};