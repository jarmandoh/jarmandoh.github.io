import { useReducer, useEffect, useCallback } from 'react';
import bingoCardsData from '../data/bingoCards.json';
import { useGestorAuth } from './useGestorAuth';
import { useGameManager } from './useGameManager';
import { useBingoAdmin } from './useBingoAdmin';
import { useSocket } from './useSocket';
import { checkCardPattern } from '../utils/checkWinPattern';
import { useGestorGameState } from './useGestorGameState';

/** Safely read and parse the bingoAssignments array from localStorage. */
function safeGetAssignments() {
  try {
    return JSON.parse(localStorage.getItem('bingoAssignments') || '[]');
  } catch {
    return [];
  }
}

export function useGestorGame() {
  const { gestor, logoutGestor, getTimeUntilExpiry } = useGestorAuth();
  const { games, getGameById, updateGame, addCalledNumber, createGame, startGame, finishGame, deleteGame } = useGameManager();
  const { assignCard, updateAssignment, removeAssignment, getAssignmentsByRaffle } = useBingoAdmin();
  const { socket, error, clearError, isConnected } = useSocket();

  const {
    currentGame, gameStats, showRaffleConfigModal, raffleConfig,
    setCurrentGame, setGameStats, setShowRaffleConfigModal, setRaffleConfig,
    showWinnerNotification, winnerInfo, autoDetectedWinners, showAutoWinnersAlert,
    setShowWinnerNotification, setWinnerInfo, setAutoDetectedWinners, setShowAutoWinnersAlert,
    showForm, editingAssignment, viewMode, searchQuery, showGameForm,
    setShowForm, setEditingAssignment, setViewMode, setSearchQuery, setShowGameForm,
  } = useGestorGameState();

  useEffect(() => {
    document.title = 'Gestor | Bingo Game';
  }, []);

  const currentRaffle = currentGame?.currentRaffle || 1;

  const checkForWinners = useCallback((updatedCalledNumbers) => {
    if (updatedCalledNumbers.length < 5 || !currentGame) return [];
    const winners = [];
    const winPatterns = currentGame.settings?.winPatterns || ['line', 'diagonal', 'fullCard'];
    const assignments = getAssignmentsByRaffle(currentRaffle);

    assignments.forEach(assignment => {
      for (let cardNum = assignment.startCard; cardNum <= assignment.endCard; cardNum++) {
        const cardData = bingoCardsData.find(card => card.id === cardNum);
        if (cardData) {
          for (const pattern of winPatterns) {
            if (checkCardPattern(cardData.card, updatedCalledNumbers, pattern)) {
              winners.push({
                cardNumber: cardNum,
                participantName: assignment.participantName,
                pattern,
                card: cardData.card,
                assignmentId: assignment.id,
              });
              break;
            }
          }
        }
      }
    });
    return winners;
  }, [currentGame, currentRaffle, getAssignmentsByRaffle]);

  const updateGameStats = useCallback(() => {
    const assignments = getAssignmentsByRaffle(currentRaffle);
    const totalCardsGenerated = assignments.reduce((total, assignment) => {
      const startCard = parseInt(assignment.startCard) || 0;
      const endCard = parseInt(assignment.endCard) || 0;
      const quantity = assignment.quantity || 0;
      if (quantity > 0) return total + quantity;
      if (startCard > 0 && endCard > 0 && endCard >= startCard) return total + (endCard - startCard + 1);
      return total + 1;
    }, 0) || 0;

    setGameStats({
      totalCards: totalCardsGenerated,
      activeCards: assignments.filter(a => a.paid).length,
      winners: assignments.filter(a => a.winner).length,
    });
  }, [currentRaffle, getAssignmentsByRaffle]);

  const handleBingoWin = useCallback((data) => {
    console.log('¡BINGO! Ganador detectado:', data);
    try {
      if (currentGame && data.gameId === currentGame.id) {
        const newWinner = {
          name: data.playerName,
          cardNumber: data.cardNumber,
          pattern: data.pattern,
          timestamp: new Date().toISOString(),
        };
        const updatedWinners = [...(currentGame.winners || []), newWinner];
        updateGame(currentGame.id, { winners: updatedWinners });
        setCurrentGame(prev => ({ ...prev, winners: updatedWinners }));
        setWinnerInfo(data);
        setShowWinnerNotification(true);
        setTimeout(() => setShowWinnerNotification(false), 10000);
        updateGameStats();
      }
    } catch (err) {
      console.error('Error al procesar victoria:', err);
    }
  }, [currentGame, updateGame, updateGameStats]);

  useEffect(() => {
    if (!socket) return;
    const handleConnect = () => {
      console.log('Socket conectado');
      if (currentGame?.id) socket.emit('joinGame', { gameId: currentGame.id });
    };
    const handleDisconnect = () => console.log('Socket desconectado');
    const handleReconnect = () => {
      console.log('Socket reconectado');
      if (currentGame?.id) socket.emit('joinGame', { gameId: currentGame.id });
    };
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('bingoWin', handleBingoWin);
    if (socket.connected && currentGame?.id) socket.emit('joinGame', { gameId: currentGame.id });
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('bingoWin', handleBingoWin);
    };
  }, [socket, currentGame?.id, handleBingoWin]);

  // Derived values
  const assignments = getAssignmentsByRaffle(currentRaffle);
  const filteredAssignments = assignments;
  const searchResults = searchQuery
    ? assignments.filter(a => a.participantName.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const assignedCards = assignments.reduce((acc, assignment) => {
    for (let i = assignment.startCard; i <= assignment.endCard; i++) acc.add(i);
    return acc;
  }, new Set());
  const totalCardsAssigned = assignments.reduce((total, assignment) => {
    const startCard = parseInt(assignment.startCard) || 0;
    const endCard = parseInt(assignment.endCard) || 0;
    const quantity = assignment.quantity || 0;
    if (quantity > 0) return total + quantity;
    if (startCard > 0 && endCard > 0 && endCard >= startCard) return total + (endCard - startCard + 1);
    return total + 1;
  }, 0) || 0;
  const maxCards = currentGame?.maxPlayers || 1200;
  const isCardLimitReached = totalCardsAssigned >= maxCards;

  useEffect(() => {
    if (gestor?.gameId) {
      const game = getGameById(gestor.gameId);
      setCurrentGame(game);
      if (game) {
        const raffleNumber = game.currentRaffle || 1;
        const raffleAssignments = getAssignmentsByRaffle(raffleNumber);
        const total = raffleAssignments.reduce((t, a) => {
          const s = parseInt(a.startCard) || 0;
          const e = parseInt(a.endCard) || 0;
          const q = a.quantity || 0;
          if (q > 0) return t + q;
          if (s > 0 && e > 0 && e >= s) return t + (e - s + 1);
          return t + 1;
        }, 0) || 0;
        setGameStats({
          totalCards: total,
          activeCards: raffleAssignments.filter(a => a.paid).length,
          winners: raffleAssignments.filter(a => a.winner).length,
        });
      }
    }
  }, [gestor, getGameById, getAssignmentsByRaffle]);

  // Handlers
  const handleFormSubmit = (formData) => {
    if (editingAssignment) {
      updateAssignment(editingAssignment.id, formData);
      setEditingAssignment(null);
    } else {
      assignCard(formData);
    }
    setShowForm(false);
    updateGameStats();
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      removeAssignment(id);
      updateGameStats();
    }
  };

  const handleCallNumber = (number) => {
    if (!currentGame) return;
    const raffleSettings = currentGame.raffleSettings?.[currentRaffle];
    if (!raffleSettings?.winPattern || !raffleSettings?.prize) {
      alert('Debes configurar el patrón de victoria y el premio antes de iniciar el sorteo');
      setShowRaffleConfigModal(true);
      return;
    }
    addCalledNumber(currentGame.id, number);
    const updatedGame = getGameById(currentGame.id);
    setCurrentGame(updatedGame);
    setTimeout(() => {
      const updatedCalledNumbers = updatedGame.calledNumbers || [];
      const winners = checkForWinners(updatedCalledNumbers);
      if (winners.length > 0) {
        setAutoDetectedWinners(winners);
        setShowAutoWinnersAlert(true);
        setTimeout(() => setShowAutoWinnersAlert(false), 15000);
      }
    }, 5500);
  };

  const handleDrawNumber = useCallback(() => {
    if (!currentGame) return;
    const called = currentGame.calledNumbers || [];
    const remaining = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !called.includes(n));
    if (remaining.length === 0) return;
    const number = remaining[Math.floor(Math.random() * remaining.length)];
    handleCallNumber(number);
  }, [currentGame, handleCallNumber]);

  const handleMarkWinner = (participantId, assignmentId) => {
    const stored = safeGetAssignments();
    localStorage.setItem('bingoAssignments', JSON.stringify(
      stored.map(a => a.id === assignmentId ? { ...a, winner: true } : a)
    ));
    // Eliminar el ganador confirmado de la lista de auto-detectados
    setAutoDetectedWinners(prev =>
      prev.filter(w => `${w.assignmentId}-${w.cardNumber}` !== participantId)
    );
    updateGameStats();
  };

  /**
   * Descarta un posible ganador auto-detectado sin confirmarlo.
   * @param {string} key - clave única `${assignmentId}-${cardNumber}`
   */
  const handleDismissWinner = (key) => {
    setAutoDetectedWinners(prev =>
      prev.filter(w => `${w.assignmentId}-${w.cardNumber}` !== key)
    );
  };

  const handleTogglePaid = (assignmentId) => {
    const stored = safeGetAssignments();
    localStorage.setItem('bingoAssignments', JSON.stringify(
      stored.map(a => a.id === assignmentId ? { ...a, paid: !a.paid } : a)
    ));
    updateGameStats();
  };

  const handlePauseGame = () => {
    if (currentGame) {
      updateGame(currentGame.id, { status: 'waiting' });
      setCurrentGame({ ...currentGame, status: 'waiting' });
    }
  };

  const handleResumeGame = () => {
    if (currentGame) {
      updateGame(currentGame.id, { status: 'active' });
      setCurrentGame({ ...currentGame, status: 'active' });
    }
  };

  const handleSaveRaffleConfig = (configData = null) => {
    const config = configData || raffleConfig;
    if (!config.winPattern) { alert('Debes seleccionar un patrón de victoria'); return; }
    if (!config.prize?.trim()) { alert('Debes ingresar un premio'); return; }

    const raffleSettings = { ...(currentGame.raffleSettings || {}) };
    raffleSettings[currentRaffle] = {
      winPattern: config.winPattern,
      prize: config.prize,
      prizeImageUrl: config.prizeImageUrl || '',
      configuredAt: new Date().toISOString(),
    };
    const updatedSettings = { ...currentGame.settings, winPatterns: [config.winPattern] };

    updateGame(currentGame.id, {
      raffleSettings,
      settings: updatedSettings,
      calledNumbers: [],
      currentNumber: null,
      winners: [],
      status: 'active',
    });
    setCurrentGame({ ...currentGame, raffleSettings, settings: updatedSettings, calledNumbers: [], currentNumber: null, winners: [], status: 'active' });

    const stored = safeGetAssignments();
    localStorage.setItem('bingoAssignments', JSON.stringify(
      stored.map(a => a.raffleNumber === currentRaffle ? { ...a, winner: false } : a)
    ));

    if (socket?.connected) socket.emit('raffleReset', { gameId: currentGame.id, raffleNumber: currentRaffle });
    updateGameStats();
    setShowRaffleConfigModal(false);
  };

  const handleResetRaffle = useCallback(() => {
    if (!window.confirm('¿Estás seguro de que quieres reiniciar el sorteo? Se borrarán todos los números cantados y se limpiarán los cartones de los jugadores.')) return;
    if (!currentGame) return;
    try {
      updateGame(currentGame.id, { calledNumbers: [], currentNumber: null, winners: [] });
      setCurrentGame(prev => ({ ...prev, calledNumbers: [], currentNumber: null, winners: [] }));
      if (socket?.connected) {
        socket.emit('raffleReset', { gameId: currentGame.id, raffleNumber: currentRaffle }, (ack) => {
          if (ack?.success) console.log('Sorteo reiniciado exitosamente en servidor');
          else console.warn('Advertencia al reiniciar en servidor:', ack?.error);
        });
      } else {
        console.warn('Socket no conectado, el reinicio solo es local');
      }
      const stored = safeGetAssignments();
      localStorage.setItem('bingoAssignments', JSON.stringify(
        stored.map(a => a.raffleNumber === currentRaffle ? { ...a, winner: false } : a)
      ));
      updateGameStats();
      console.log('Sorteo reiniciado - calledNumbers eliminados del localStorage');
    } catch (err) {
      console.error('Error al reiniciar sorteo:', err);
      alert('Hubo un error al reiniciar el sorteo. Por favor, intenta nuevamente.');
    }
  }, [currentGame, currentRaffle, socket, updateGame, updateGameStats]);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logoutGestor();
      window.location.reload();
    }
  };

  const handleCreateGame = (gameData) => {
    const newGame = createGame(gameData);
    setCurrentGame(newGame);
    setViewMode('game');
    setShowGameForm(false);
  };

  const handleStartGame = (gameId) => {
    startGame(gameId);
    const updatedGame = getGameById(gameId);
    if (currentGame?.id === gameId) setCurrentGame({ ...currentGame, status: 'active' });
    else if (!currentGame) setCurrentGame(updatedGame);
  };

  const handleFinishGame = (gameId) => {
    if (window.confirm('¿Estás seguro de que quieres finalizar este juego?')) {
      finishGame(gameId);
      if (currentGame?.id === gameId) setCurrentGame({ ...currentGame, status: 'finished' });
    }
  };

  const handleDeleteGame = (gameId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este juego permanentemente?')) {
      deleteGame(gameId);
      if (currentGame?.id === gameId) setCurrentGame(null);
    }
  };

  const handleSelectGame = (gameId) => {
    const game = getGameById(gameId);
    if (game) {
      setCurrentGame(game);
      setViewMode('game');
    }
  };

  const handleTestAssignment = () => {
    const testAssignment = {
      id: crypto.randomUUID(),
      participantName: `Participante Prueba ${Math.floor(Math.random() * 100)}`,
      startCard: Math.floor(Math.random() * 50) + 1,
      endCard: Math.floor(Math.random() * 50) + 51,
      quantity: 10,
      paid: Math.random() > 0.5,
      raffleNumber: currentRaffle,
      createdAt: new Date().toISOString(),
    };
    testAssignment.quantity = testAssignment.endCard - testAssignment.startCard + 1;
    assignCard(testAssignment);
    updateGameStats();
  };

  const timeLeft = getTimeUntilExpiry();

  return {
    // Auth / session
    gestor, timeLeft, socket, isConnected, error, clearError,
    // Game state
    currentGame, gameStats, currentRaffle, raffleConfig,
    showRaffleConfigModal, setShowRaffleConfigModal, setRaffleConfig,
    // Winner state
    showWinnerNotification, winnerInfo, autoDetectedWinners, showAutoWinnersAlert,
    setShowAutoWinnersAlert, setShowWinnerNotification,
    // UI state
    showForm, editingAssignment, viewMode, searchQuery,
    setShowForm, setEditingAssignment, setViewMode, setSearchQuery,
    // Derived
    assignments, filteredAssignments, searchResults, assignedCards,
    maxCards, isCardLimitReached,
    // Game management
    games,
    showGameForm, setShowGameForm,
    handleCreateGame,
    handleStartGame,
    handleFinishGame,
    handleDeleteGame,
    handleSelectGame,
    // Handlers
    handleFormSubmit,
    handleEdit,
    handleDelete,
    handleCallNumber,
    handleDrawNumber,
    handleMarkWinner,
    handleDismissWinner,
    handleTogglePaid,
    handlePauseGame,
    handleResumeGame,
    handleSaveRaffleConfig,
    handleResetRaffle,
    handleLogout,
    handleTestAssignment,
  };
}
