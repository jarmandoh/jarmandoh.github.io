import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import bingoCardsData from '../data/bingoCards.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faSignOutAlt, 
  faUser, 
  faGamepad,
  faTrophy,
  faPlay,
  faPause,
  faClock,
  faCheckCircle,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faSearch,
  faChartBar,
  faRedo
} from '@fortawesome/free-solid-svg-icons';
import WinnerModal from '../components/WinnerModal';
import { useGestorAuth } from '../hooks/useGestorAuth';
import { useGameManager } from '../hooks/useGameManager';
import { useBingoAdmin } from '../hooks/useBingoAdmin';
import { SocketProvider } from '../context/SocketContext';
import { useSocket } from '../hooks/useSocket';
import NumberDisplay from '../components/NumberDisplay';
import BingoControls from '../components/BingoControls';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentStats from '../components/AssignmentStats';
import GameStats from '../components/GameStats';


const BingoGestorContent = () => {
  const { gestor, logoutGestor, getTimeUntilExpiry } = useGestorAuth();
  const { getGameById, updateGame, addCalledNumber, checkWinPattern } = useGameManager();
  const {
    assignCard,
    updateAssignment,
    removeAssignment,
    getAssignmentsByRaffle
  } = useBingoAdmin();
  const { socket, error, clearError } = useSocket();

  const [currentGame, setCurrentGame] = useState(null);
  const [gameStats, setGameStats] = useState({
    totalCards: 0,
    activeCards: 0,
    winners: 0
  });
  const [showWinnerNotification, setShowWinnerNotification] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [autoDetectedWinners, setAutoDetectedWinners] = useState([]);
  const [showAutoWinnersAlert, setShowAutoWinnersAlert] = useState(false);
  const [showRaffleConfigModal, setShowRaffleConfigModal] = useState(false);
  const [raffleConfig, setRaffleConfig] = useState({
    winPattern: '',
    prize: ''
  });

  // Estados para manejo de asignaciones
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewMode, setViewMode] = useState('game');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = 'Gestor | Bingo Game';
  }, []);

  // El sorteo actual se obtiene del juego actual del gestor
  const currentRaffle = currentGame?.currentRaffle || 1;

  // Función para verificar cartones ganadores según el patrón del sorteo
  const checkForWinners = useCallback((updatedCalledNumbers) => {
    if (updatedCalledNumbers.length < 5 || !currentGame) return [];

    const winners = [];
    const winPatterns = currentGame.settings?.winPatterns || ['line', 'diagonal', 'fullCard'];
    
    // Obtener todos los cartones asignados al sorteo actual
    const assignments = getAssignmentsByRaffle(currentRaffle);
    
    assignments.forEach(assignment => {
      // Verificar cada cartón en el rango de la asignación
      for (let cardNum = assignment.startCard; cardNum <= assignment.endCard; cardNum++) {
        const cardData = bingoCardsData.find(card => card.id === cardNum);
        
        if (cardData) {
          // Verificar cada patrón permitido
          for (const pattern of winPatterns) {
            const markedNumbers = [];
            
            // Recopilar números marcados del cartón
            cardData.card.forEach((row, rowIndex) => {
              row.forEach((cell, colIndex) => {
                if (cell !== 'FREE' && updatedCalledNumbers.includes(cell)) {
                  markedNumbers.push({ number: cell, row: rowIndex, col: colIndex });
                }
              });
            });
            
            // Verificar si el cartón es ganador con el patrón
            const isWinner = checkWinPattern(markedNumbers.map(m => m.number), pattern);
            
            if (isWinner) {
              winners.push({
                cardNumber: cardNum,
                participantName: assignment.participantName,
                pattern: pattern,
                card: cardData.card,
                assignmentId: assignment.id
              });
              break; // Un cartón puede ganar solo una vez
            }
          }
        }
      }
    });
    
    return winners;
  }, [currentGame, currentRaffle, getAssignmentsByRaffle, checkWinPattern]);

  // Función para actualizar estadísticas (declarada antes de usarse)
  const updateGameStats = useCallback(() => {
    const assignments = getAssignmentsByRaffle(currentRaffle);
    const totalCardsGenerated = assignments.reduce((total, assignment) => {
      // Validar que las propiedades existan y sean números válidos
      const startCard = parseInt(assignment.startCard) || 0;
      const endCard = parseInt(assignment.endCard) || 0;
      const quantity = assignment.quantity || 0;
      
      // Si tiene quantity definido, usarlo; sino calcular del rango
      if (quantity > 0) {
        return total + quantity;
      } else if (startCard > 0 && endCard > 0 && endCard >= startCard) {
        return total + (endCard - startCard + 1);
      } else {
        return total + 1; // Al menos contar 1 cartón por asignación
      }
    }, 0) || 0;
    
    setGameStats({
      totalCards: totalCardsGenerated,
      activeCards: assignments.filter(a => a.paid).length,
      winners: assignments.filter(a => a.winner).length
    });
  }, [currentRaffle, getAssignmentsByRaffle]);

  // Handler memoizado para eventos de victoria
  const handleBingoWin = useCallback((data) => {
    console.log('¡BINGO! Ganador detectado:', data);
    
    try {
      if (currentGame && data.gameId === currentGame.id) {
        const newWinner = {
          name: data.playerName,
          cardNumber: data.cardNumber,
          pattern: data.pattern,
          timestamp: new Date().toISOString()
        };
        
        const updatedWinners = [...(currentGame.winners || []), newWinner];
        updateGame(currentGame.id, { winners: updatedWinners });
        
        setCurrentGame(prev => ({
          ...prev,
          winners: updatedWinners
        }));

        // Mostrar notificación al gestor
        setWinnerInfo(data);
        setShowWinnerNotification(true);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
          setShowWinnerNotification(false);
        }, 10000);

        // Actualizar estadísticas
        updateGameStats();
      }
    } catch (error) {
      console.error('Error al procesar victoria:', error);
    }
  }, [currentGame, updateGame, updateGameStats]);

  // Efecto único consolidado para todos los listeners de socket
  useEffect(() => {
    if (!socket) return;

    // Handlers de conexión
    const handleConnect = () => {
      console.log('Socket conectado');
      // Unirse a la sala del juego
      if (currentGame?.id) {
        socket.emit('joinGame', { gameId: currentGame.id });
      }
    };

    const handleDisconnect = () => {
      console.log('Socket desconectado');
    };

    const handleReconnect = () => {
      console.log('Socket reconectado');
      if (currentGame?.id) {
        socket.emit('joinGame', { gameId: currentGame.id });
      }
    };

    // Registrar todos los listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('reconnect', handleReconnect);
    socket.on('bingoWin', handleBingoWin);

    // Si ya está conectado, unirse al juego
    if (socket.connected && currentGame?.id) {
      socket.emit('joinGame', { gameId: currentGame.id });
    }

    // Cleanup completo
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('reconnect', handleReconnect);
      socket.off('bingoWin', handleBingoWin);
    };
  }, [socket, currentGame?.id, handleBingoWin]);

  // Variables derivadas
  const assignments = getAssignmentsByRaffle(currentRaffle);
  console.log('Asignaciones para sorteo', currentRaffle, ':', assignments);
  const filteredAssignments = assignments; // ya están filtrados por sorteo
  const searchResults = searchQuery 
    ? assignments.filter(a => 
        a.participantName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
  const assignedCards = assignments.reduce((acc, assignment) => {
    for (let i = assignment.startCard; i <= assignment.endCard; i++) {
      acc.add(i);
    }
    return acc;
  }, new Set());
  
  // Calcular cartones totales asignados para el sorteo actual
  const totalCardsAssigned = assignments.reduce((total, assignment) => {
    const startCard = parseInt(assignment.startCard) || 0;
    const endCard = parseInt(assignment.endCard) || 0;
    const quantity = assignment.quantity || 0;
    
    if (quantity > 0) {
      return total + quantity;
    } else if (startCard > 0 && endCard > 0 && endCard >= startCard) {
      return total + (endCard - startCard + 1);
    } else {
      return total + 1;
    }
  }, 0) || 0;
  
  // Verificar si se ha alcanzado el límite de cartones
  const maxCards = currentGame?.maxPlayers || 1200;
  const isCardLimitReached = totalCardsAssigned >= maxCards;

  useEffect(() => {
    if (gestor?.gameId) {
      const game = getGameById(gestor.gameId);
      setCurrentGame(game);
      
      // Actualizar estadísticas cuando cambie el juego o el sorteo
      if (game) {
        const currentRaffleNumber = game.currentRaffle || 1;
        const assignments = getAssignmentsByRaffle(currentRaffleNumber);
        const totalCardsGenerated = assignments.reduce((total, assignment) => {
          // Validar que las propiedades existan y sean números válidos
          const startCard = parseInt(assignment.startCard) || 0;
          const endCard = parseInt(assignment.endCard) || 0;
          const quantity = assignment.quantity || 0;
          
          // Si tiene quantity definido, usarlo; sino calcular del rango
          if (quantity > 0) {
            return total + quantity;
          } else if (startCard > 0 && endCard > 0 && endCard >= startCard) {
            return total + (endCard - startCard + 1);
          } else {
            return total + 1; // Al menos contar 1 cartón por asignación
          }
        }, 0) || 0;
        
        setGameStats({
          totalCards: totalCardsGenerated,
          activeCards: assignments.filter(a => a.paid).length,
          winners: assignments.filter(a => a.winner).length
        });
      }
    }
  }, [gestor, getGameById, getAssignmentsByRaffle]);

  // Efecto separado para actualizar estadísticas cuando cambie el sorteo actual
  useEffect(() => {
    if (currentGame) {
      const assignments = getAssignmentsByRaffle(currentRaffle);
      const totalCardsGenerated = assignments.reduce((total, assignment) => {
        // Validar que las propiedades existan y sean números válidos
        const startCard = parseInt(assignment.startCard) || 0;
        const endCard = parseInt(assignment.endCard) || 0;
        const quantity = assignment.quantity || 0;
        
        // Si tiene quantity definido, usarlo; sino calcular del rango
        if (quantity > 0) {
          return total + quantity;
        } else if (startCard > 0 && endCard > 0 && endCard >= startCard) {
          return total + (endCard - startCard + 1);
        } else {
          return total + 1; // Al menos contar 1 cartón por asignación
        }
      }, 0) || 0;
      
      setGameStats({
        totalCards: totalCardsGenerated,
        activeCards: assignments.filter(a => a.paid).length,
        winners: assignments.filter(a => a.winner).length
      });
    }
  }, [currentRaffle, getAssignmentsByRaffle, currentGame]);

  // Funciones de manejo de asignaciones
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
    if (currentGame) {
      // Verificar si el sorteo está configurado
      const raffleSettings = currentGame.raffleSettings?.[currentRaffle];
      if (!raffleSettings?.winPattern || !raffleSettings?.prize) {
        alert('Debes configurar el patrón de victoria y el premio antes de iniciar el sorteo');
        setShowRaffleConfigModal(true);
        return;
      }
      
      addCalledNumber(currentGame.id, number);
      // Actualizar el juego local
      const updatedGame = getGameById(currentGame.id);
      setCurrentGame(updatedGame);
      
      // Después de 5.5 segundos (animación de 5s + 0.5s margen), verificar ganadores
      setTimeout(() => {
        const updatedCalledNumbers = updatedGame.calledNumbers || [];
        const winners = checkForWinners(updatedCalledNumbers);
        
        if (winners.length > 0) {
          console.log('¡Ganadores detectados automáticamente!', winners);
          setAutoDetectedWinners(winners);
          setShowAutoWinnersAlert(true);
          
          // Auto-ocultar después de 15 segundos
          setTimeout(() => {
            setShowAutoWinnersAlert(false);
          }, 15000);
        }
      }, 5500);
    }
  };

  const handleMarkWinner = (participantId, assignmentId) => {
    const assignments = JSON.parse(localStorage.getItem('bingoAssignments') || '[]');
    const updatedAssignments = assignments.map(a => 
      a.id === assignmentId ? { ...a, winner: true } : a
    );
    localStorage.setItem('bingoAssignments', JSON.stringify(updatedAssignments));
    
    updateGameStats();
  };

  const handleTogglePaid = (assignmentId) => {
    const assignments = JSON.parse(localStorage.getItem('bingoAssignments') || '[]');
    const updatedAssignments = assignments.map(a => 
      a.id === assignmentId ? { ...a, paid: !a.paid } : a
    );
    localStorage.setItem('bingoAssignments', JSON.stringify(updatedAssignments));
    
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

  const handleSaveRaffleConfig = () => {
    if (!raffleConfig.winPattern) {
      alert('Debes seleccionar un patrón de victoria');
      return;
    }
    if (!raffleConfig.prize || raffleConfig.prize.trim() === '') {
      alert('Debes ingresar un premio');
      return;
    }

    // Guardar configuración del sorteo
    const raffleSettings = currentGame.raffleSettings || {};
    raffleSettings[currentRaffle] = {
      winPattern: raffleConfig.winPattern,
      prize: raffleConfig.prize,
      configuredAt: new Date().toISOString()
    };

    // Actualizar winPatterns en settings para compatibilidad
    const updatedSettings = {
      ...currentGame.settings,
      winPatterns: [raffleConfig.winPattern]
    };

    // Reiniciar el sorteo: borrar números cantados y ganadores
    updateGame(currentGame.id, { 
      raffleSettings,
      settings: updatedSettings,
      calledNumbers: [], 
      currentNumber: null, 
      winners: [],
      status: 'active' // Activar el juego
    });

    // Actualizar estado local
    setCurrentGame({ 
      ...currentGame, 
      raffleSettings,
      settings: updatedSettings,
      calledNumbers: [],
      currentNumber: null,
      winners: [],
      status: 'active'
    });

    // Limpiar ganadores de las asignaciones del sorteo actual
    const assignments = JSON.parse(localStorage.getItem('bingoAssignments') || '[]');
    const updatedAssignments = assignments.map(a => 
      a.raffleNumber === currentRaffle ? { ...a, winner: false } : a
    );
    localStorage.setItem('bingoAssignments', JSON.stringify(updatedAssignments));

    // Emitir evento por socket para sincronizar con otros clientes
    if (socket && socket.connected) {
      socket.emit('raffleReset', {
        gameId: currentGame.id,
        raffleNumber: currentRaffle
      });
    }

    // Actualizar estadísticas
    updateGameStats();

    // Cerrar modal
    setShowRaffleConfigModal(false);
  };

  const handleResetRaffle = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar el sorteo? Se borrarán todos los números cantados y se limpiarán los cartones de los jugadores.')) {
      if (!currentGame) return;

      try {
        // Actualizar el juego en localStorage con calledNumbers vacío
        updateGame(currentGame.id, { 
          calledNumbers: [], 
          currentNumber: null, 
          winners: [] 
        });
        
        // Actualizar el estado local
        setCurrentGame(prev => ({
          ...prev,
          calledNumbers: [],
          currentNumber: null,
          winners: []
        }));
        
        // Emitir evento por socket con acknowledgment
        if (socket && socket.connected) {
          socket.emit('raffleReset', {
            gameId: currentGame.id,
            raffleNumber: currentRaffle
          }, (ack) => {
            if (ack && ack.success) {
              console.log('Sorteo reiniciado exitosamente en servidor');
            } else {
              console.warn('Advertencia al reiniciar en servidor:', ack?.error);
            }
          });
        } else {
          console.warn('Socket no conectado, el reinicio solo es local');
        }

        // Limpiar ganadores de las asignaciones del sorteo actual
        const assignments = JSON.parse(localStorage.getItem('bingoAssignments') || '[]');
        const updatedAssignments = assignments.map(a => 
          a.raffleNumber === currentRaffle ? { ...a, winner: false } : a
        );
        localStorage.setItem('bingoAssignments', JSON.stringify(updatedAssignments));
        
        updateGameStats();
        
        console.log('Sorteo reiniciado - calledNumbers eliminados del localStorage');
      } catch (error) {
        console.error('Error al reiniciar sorteo:', error);
        alert('Hubo un error al reiniciar el sorteo. Por favor, intenta nuevamente.');
      }
    }
  }, [currentGame, currentRaffle, socket, updateGame, updateGameStats]);

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logoutGestor();
      // Forzar recarga para que el componente padre detecte el cambio
      window.location.reload();
    }
  };

  const timeLeft = getTimeUntilExpiry();

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <FontAwesomeIcon icon={faGamepad} className="text-6xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Juego No Disponible</h2>
          <p className="text-gray-600 mb-6">
            El juego asignado no está disponible o ha sido eliminado.
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-colors"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-200 via-purple-100 to-pink-200 p-4">
      {/* Error global de socket */}
      {error && (
        <div className="global-error-message">
          <span>{error}</span>
          <button className="btn-close-error" onClick={clearError} title="Cerrar">✖</button>
        </div>
      )}
      {/* Indicador de estado de conexión */}
      {socket && !socket.connected && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
            Conexión perdida - Reconectando...
          </div>
        </div>
      )}

      {/* Number Display sticky */}
      <div className="fixed top-4 left-4 z-50">
        <NumberDisplay 
          currentNumber={currentGame?.currentNumber}
          calledNumbers={currentGame?.calledNumbers || []}
        />
      </div>

      {/* Alerta de Ganadores Detectados Automáticamente */}
      {showAutoWinnersAlert && autoDetectedWinners.length > 0 && (
        <div className="fixed top-20 right-4 z-50 bg-green-400 border-4 border-green-600 rounded-xl p-6 shadow-2xl max-w-md animate-pulse">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faTrophy} className="text-5xl text-green-800" />
                <div>
                  <h3 className="text-2xl font-bold text-green-900">¡Posibles Ganadores!</h3>
                  <p className="text-green-800 text-sm">Se detectaron {autoDetectedWinners.length} cartón(es) ganador(es)</p>
                </div>
              </div>
              <button
                onClick={() => setShowAutoWinnersAlert(false)}
                className="text-green-800 hover:text-green-900 text-xl"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="max-h-64 overflow-y-auto bg-white/50 rounded-lg p-3 space-y-2">
              {autoDetectedWinners.map((winner, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border-2 border-green-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-green-900">{winner.participantName}</p>
                      <p className="text-sm text-green-700">Cartón #{winner.cardNumber}</p>
                      <p className="text-xs text-green-600">Patrón: {winner.pattern}</p>
                    </div>
                    <button
                      onClick={() => handleMarkWinner(`${winner.assignmentId}-${winner.cardNumber}`, winner.assignmentId)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notificación de Ganador */}
      {showWinnerNotification && winnerInfo && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-400 border-4 border-yellow-600 rounded-xl p-6 shadow-2xl animate-bounce max-w-md">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <FontAwesomeIcon icon={faTrophy} className="text-6xl text-yellow-800" />
              <div>
                <h3 className="text-2xl font-bold text-yellow-900 mb-2">¡BINGO!</h3>
                <p className="text-yellow-800 font-semibold">{winnerInfo.playerName}</p>
                <p className="text-yellow-700 text-sm">Cartón #{winnerInfo.cardNumber}</p>
                <p className="text-yellow-700 text-sm">Patrón: {winnerInfo.pattern}</p>
              </div>
            </div>
            <button
              onClick={() => setShowWinnerNotification(false)}
              className="text-yellow-800 hover:text-yellow-900 text-xl"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto ml-72">
          {/* Header */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="mb-2">
                  <h1 className="text-3xl font-bold text-gray-700">
                    Gestor de Sorteos - {currentGame.name}
                  </h1>
                </div>
                {currentGame.raffleSettings?.[currentRaffle] && (
                  <div className="mb-2 flex items-center gap-4 text-sm">
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                      Patrón: {raffleConfig.winPattern || currentGame.raffleSettings[currentRaffle].winPattern}
                    </span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                      Premio: {currentGame.raffleSettings[currentRaffle].prize}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    {gestor.name}
                  </span>
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faGamepad} className="mr-2" />
                    Juego ID: {gestor.gameId}
                  </span>
                  <span className={`flex items-center px-3 py-1 rounded-full text-sm ${
                    currentGame.status === 'active' 
                      ? 'bg-green-200 text-green-800' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {currentGame.status === 'active' ? 'Activo' : 'En Pausa'}
                  </span>
                  {timeLeft.valid && (
                    <span className="flex items-center text-sm">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      {timeLeft.hours}h {timeLeft.minutes}m
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const raffleSettings = currentGame.raffleSettings?.[currentRaffle];
                    setRaffleConfig({
                      winPattern: raffleSettings?.winPattern || '',
                      prize: raffleSettings?.prize || ''
                    });
                    setShowRaffleConfigModal(true);
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors inline-flex items-center ${
                    currentGame.raffleSettings?.[currentRaffle]?.winPattern
                      ? 'bg-green-200 hover:bg-green-300 text-green-800'
                      : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800 animate-pulse'
                  }`}
                >
                  <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                  {currentGame.raffleSettings?.[currentRaffle]?.winPattern
                    ? 'Configuración del Sorteo'
                    : '⚠️ Configurar Sorteo'}
                </button>
                <Link 
                  to="/bingo" 
                  className="bg-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-300 transition duration-300 inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faHome} className="mr-2" />
                  Inicio
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-lg transition duration-300 inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  Salir
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas del Juego */}
          <GameStats 
            assignments={assignments}
            gameStats={gameStats}
            currentRaffle={currentRaffle}
            calledNumbers={currentGame.calledNumbers || []}
            maxNumbers={75}
          />

          {/* Controles de vista */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex gap-4 items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('game')}
                  className={`px-4 py-2 rounded-lg transition duration-300 ${
                    viewMode === 'game' 
                      ? 'bg-purple-200 text-purple-800 font-semibold' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FontAwesomeIcon icon={faGamepad} className="mr-2" />
                  Control del Juego
                </button>
                <button
                  onClick={() => {
                    setViewMode('assignments');
                  }}
                  className={`px-4 py-2 rounded-lg transition duration-300 ${
                    viewMode === 'assignments' 
                      ? 'bg-purple-200 text-purple-800 font-semibold' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FontAwesomeIcon icon={faChartBar} className="mr-2" />
                  Gestión de Cartones
                </button>
                <button
                  onClick={() => setViewMode('search')}
                  className={`px-4 py-2 rounded-lg transition duration-300 ${
                    viewMode === 'search' 
                      ? 'bg-purple-200 text-purple-800 font-semibold' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FontAwesomeIcon icon={faSearch} className="mr-2" />
                  Búsqueda
                </button>
              </div>

              {viewMode === 'assignments' && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-gray-700 font-medium">Sorteo Actual:</label>
                    <span className="px-3 py-2 bg-purple-200 text-purple-800 rounded-lg font-semibold">
                      Sorteo {currentRaffle}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowForm(true)}
                    className={`px-4 py-2 rounded-lg transition duration-300 inline-flex items-center ${
                      isCardLimitReached
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-blue-300 hover:bg-blue-400 text-blue-800'
                    }`}
                    disabled={isCardLimitReached}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Nueva Asignación
                  </button>
                  <button
                    onClick={() => {
                      // Crear asignación de prueba
                      const testAssignment = {
                        id: Date.now().toString(),
                        participantName: `Participante Prueba ${Math.floor(Math.random() * 100)}`,
                        startCard: Math.floor(Math.random() * 50) + 1,
                        endCard: Math.floor(Math.random() * 50) + 51,
                        quantity: 10,
                        paid: Math.random() > 0.5,
                        raffleNumber: currentRaffle,
                        createdAt: new Date().toISOString()
                      };
                      testAssignment.quantity = testAssignment.endCard - testAssignment.startCard + 1;
                      assignCard(testAssignment);
                      updateGameStats();
                    }}
                    disabled={isCardLimitReached}
                    className={`px-4 py-2 rounded-lg transition duration-300 inline-flex items-center ${
                      isCardLimitReached
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                        : 'bg-blue-300 hover:bg-blue-400 text-blue-800'
                    }`}
                    title={isCardLimitReached ? `Límite de cartones alcanzado (${maxCards})` : 'Crear asignación de prueba'}
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Prueba
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controles del Juego */}
          {viewMode === 'game' && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Controles de Números */}
            <div className="bg-white rounded-xl shadow-2xl p-6">
              {currentGame.raffleSettings?.[currentRaffle]?.winPattern && currentGame.raffleSettings?.[currentRaffle]?.prize ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Control del Sorteo</h2>
                    <div className="flex gap-2">
                      {currentGame.status === 'active' ? (
                        <button
                          onClick={handlePauseGame}
                          className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-4 py-2 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faPause} className="mr-2" />
                          Pausar
                        </button>
                      ) : (
                        <button
                          onClick={handleResumeGame}
                          className="bg-green-200 hover:bg-green-300 text-green-800 px-4 py-2 rounded-lg transition-colors"
                        >
                          <FontAwesomeIcon icon={faPlay} className="mr-2" />
                          Reanudar
                        </button>
                      )}
                      <button
                        onClick={handleResetRaffle}
                        className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-lg transition-colors"
                        title="Reiniciar sorteo (borrar números cantados)"
                      >
                        <FontAwesomeIcon icon={faRedo} className="mr-2" />
                        Reiniciar
                      </button>
                    </div>
                  </div>
                  {currentGame.status === 'active' && (
                    <BingoControls 
                      onCallNumber={handleCallNumber}
                      calledNumbers={currentGame.calledNumbers || []}
                      currentRaffle={currentRaffle}
                      gameId={currentGame.id}
                    />
                  )}
                  {currentGame.status === 'waiting' && (
                    <div className="text-center py-8">
                      <FontAwesomeIcon icon={faPause} className="text-6xl text-gray-300 mb-4" />
                      <p className="text-gray-500">El sorteo está pausado</p>
                      <p className="text-sm text-gray-400">Haz clic en "Reanudar" para continuar</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faTrophy} className="text-6xl text-yellow-400 mb-4 animate-pulse" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">Configuración Requerida</h3>
                  <p className="text-gray-600 mb-2">Debes configurar el patrón de victoria y el premio</p>
                  <p className="text-sm text-gray-500 mb-6">antes de poder iniciar el sorteo</p>
                  <button
                    onClick={() => {
                      const raffleSettings = currentGame.raffleSettings?.[currentRaffle];
                      setRaffleConfig({
                        winPattern: raffleSettings?.winPattern || '',
                        prize: raffleSettings?.prize || ''
                      });
                      setShowRaffleConfigModal(true);
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-6 py-3 rounded-lg transition-colors font-semibold inline-flex items-center"
                  >
                    <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                    Configurar Ahora
                  </button>
                </div>
              )}
            </div>

            {/* Grilla de Balotas */}
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Tablero de Balotas
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  {(currentGame.calledNumbers || []).length} de 75 balotas cantadas
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-5 gap-4 mb-4">
                  {['B', 'I', 'N', 'G', 'O'].map((letter) => (
                    <div key={letter} className="text-center font-bold text-2xl text-purple-700">
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {/* Columna B (1-15) */}
                  <div className="space-y-2">
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                      <div
                        key={num}
                        className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                          (currentGame.calledNumbers || []).includes(num)
                            ? 'bg-green-200 text-green-800 shadow-md scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  {/* Columna I (16-30) */}
                  <div className="space-y-2">
                    {Array.from({ length: 15 }, (_, i) => i + 16).map((num) => (
                      <div
                        key={num}
                        className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                          (currentGame.calledNumbers || []).includes(num)
                            ? 'bg-blue-200 text-blue-800 shadow-md scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  {/* Columna N (31-45) */}
                  <div className="space-y-2">
                    {Array.from({ length: 15 }, (_, i) => i + 31).map((num) => (
                      <div
                        key={num}
                        className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                          (currentGame.calledNumbers || []).includes(num)
                            ? 'bg-red-200 text-red-800 shadow-md scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  {/* Columna G (46-60) */}
                  <div className="space-y-2">
                    {Array.from({ length: 15 }, (_, i) => i + 46).map((num) => (
                      <div
                        key={num}
                        className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                          (currentGame.calledNumbers || []).includes(num)
                            ? 'bg-yellow-200 text-yellow-800 shadow-md scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  {/* Columna O (61-75) */}
                  <div className="space-y-2">
                    {Array.from({ length: 15 }, (_, i) => i + 61).map((num) => (
                      <div
                        key={num}
                        className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                          (currentGame.calledNumbers || []).includes(num)
                            ? 'bg-purple-200 text-purple-800 shadow-md scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Vista de Gestión de Asignaciones */}
          {viewMode === 'assignments' && (
            <div className="space-y-6">
              {/* Estadísticas de Asignaciones */}
              <AssignmentStats 
                assignments={filteredAssignments}
                currentRaffle={currentRaffle}
                maxCards={currentGame?.maxPlayers || 1200}
              />

              {/* Lista de Asignaciones */}
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Asignaciones del Sorteo {currentRaffle} ({filteredAssignments.length} total)
                  </h2>
                  {filteredAssignments.length === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      No hay asignaciones para este sorteo. Haz clic en "Nueva Asignación" para crear una.
                    </p>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cartones
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assignment) => (
                          <tr key={assignment.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {assignment.participantName || 'Sin nombre'}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {assignment.id}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                <div className="font-semibold mb-1">
                                  Cartones #{assignment.startCard} - #{assignment.endCard}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {assignment.quantity > 1 ? (
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                      {Array.from({ length: Math.min(assignment.quantity, 10) }, (_, i) => (
                                        <span key={i} className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                          #{assignment.startCard + i}
                                        </span>
                                      ))}
                                      {assignment.quantity > 10 && (
                                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                          +{assignment.quantity - 10} más
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                      #{assignment.startCard}
                                    </span>
                                  )}
                                  <div className="mt-1 text-gray-500">
                                    Total: {assignment.quantity} {assignment.quantity === 1 ? 'cartón' : 'cartones'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  assignment.paid 
                                    ? 'bg-green-200 text-green-800' 
                                    : 'bg-red-200 text-red-800'
                                }`}>
                                  <FontAwesomeIcon 
                                    icon={assignment.paid ? faCheckCircle : faTimes} 
                                    className="mr-1" 
                                  />
                                  {assignment.paid ? 'Pagado' : 'Pendiente'}
                                </span>
                                <button
                                  onClick={() => handleTogglePaid(assignment.id)}
                                  className={`px-2 py-1 rounded text-xs transition-colors ${
                                    assignment.paid
                                      ? 'bg-red-200 hover:bg-red-300 text-red-800'
                                      : 'bg-green-200 hover:bg-green-300 text-green-800'
                                  }`}
                                  title={assignment.paid ? 'Marcar como pendiente' : 'Marcar como pagado'}
                                >
                                  {assignment.paid ? 'Desmarcar' : 'Marcar Pagado'}
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(assignment.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleEdit(assignment)}
                                className="text-blue-600 hover:text-blue-800 mr-3 transition-colors cursor-pointer"
                                title="Editar asignación"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDelete(assignment.id)}
                                className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                title="Eliminar asignación"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            No hay asignaciones para este sorteo
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Vista de Búsqueda */}
          {viewMode === 'search' && (
            <div className="bg-white rounded-xl shadow-2xl p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Búsqueda de Cartones
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar por nombre de participante:
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Nombre del participante..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-3 bg-gray-50 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900">
                        Resultados de búsqueda ({searchResults.length})
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {searchResults.map((assignment) => (
                        <div key={assignment.id} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-900">
                                {assignment.participantName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Sorteo {assignment.raffleNumber} - Cartones {assignment.startCard} al {assignment.endCard}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(assignment)}
                                className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                title="Editar asignación"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button
                                onClick={() => handleDelete(assignment.id)}
                                className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                title="Eliminar asignación"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modal de Configuración del Sorteo */}
          {showRaffleConfigModal && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      <FontAwesomeIcon icon={faTrophy} className="mr-2 text-yellow-500" />
                      Configurar Sorteo {currentRaffle}
                    </h2>
                    <button
                      onClick={() => setShowRaffleConfigModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Selecciona el patrón de victoria y define el premio antes de iniciar el sorteo
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Selección de Patrón */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-4">
                      Patrón de Victoria *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'horizontalLine1', name: 'Línea 1', icon: '▬', desc: 'Primera fila' },
                        { value: 'horizontalLine2', name: 'Línea 2', icon: '▬', desc: 'Segunda fila' },
                        { value: 'horizontalLine3', name: 'Línea 3', icon: '▬', desc: 'Tercera fila' },
                        { value: 'horizontalLine4', name: 'Línea 4', icon: '▬', desc: 'Cuarta fila' },
                        { value: 'horizontalLine5', name: 'Línea 5', icon: '▬', desc: 'Quinta fila' },
                        { value: 'letterI1', name: 'B (Col 1)', icon: '|', desc: 'Columna B' },
                        { value: 'letterI2', name: 'I (Col 2)', icon: '|', desc: 'Columna I' },
                        { value: 'letterI3', name: 'N (Col 3)', icon: '|', desc: 'Columna N' },
                        { value: 'letterI4', name: 'G (Col 4)', icon: '|', desc: 'Columna G' },
                        { value: 'letterI5', name: 'O (Col 5)', icon: '|', desc: 'Columna O' },
                        { value: 'diagonal', name: 'Diagonal', icon: '⧹', desc: 'Cualquier diagonal' },
                        { value: 'fourCorners', name: '4 Esquinas', icon: '◸', desc: 'Las 4 esquinas' },
                        { value: 'letterX', name: 'Letra X', icon: '✗', desc: 'Ambas diagonales' },
                        { value: 'letterT', name: 'Letra T', icon: '⊤', desc: 'Fila 1 + Col 3' },
                        { value: 'letterL', name: 'Letra L', icon: '⅃', desc: 'Col 1 + Fila 5' },
                        { value: 'cross', name: 'Cruz', icon: '✛', desc: 'Fila 3 + Col 3' },
                        { value: 'fullCard', name: 'Cartón Lleno', icon: '⬛', desc: 'Todo el cartón' }
                      ].map((pattern) => (
                        <button
                          key={pattern.value}
                          type="button"
                          onClick={() => setRaffleConfig({ ...raffleConfig, winPattern: pattern.value })}
                          className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                            raffleConfig.winPattern === pattern.value
                              ? 'border-purple-500 bg-purple-50 shadow-lg ring-2 ring-purple-300'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-3xl text-center mb-2">{pattern.icon}</div>
                          <div className="text-sm font-bold text-gray-800 text-center">{pattern.name}</div>
                          <div className="text-xs text-gray-500 text-center mt-1">{pattern.desc}</div>
                          {raffleConfig.winPattern === pattern.value && (
                            <div className="mt-2 text-center">
                              <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600 text-lg" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Premio */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      Premio del Sorteo *
                    </label>
                    <input
                      type="text"
                      value={raffleConfig.prize}
                      onChange={(e) => setRaffleConfig({ ...raffleConfig, prize: e.target.value })}
                      placeholder="Ej: $100,000 | TV 50 pulgadas | Viaje a Cartagena"
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                    />
                    <p className="text-xs text-gray-500 mt-1">Describe el premio que ganará el participante</p>
                  </div>

                  {/* Vista previa */}
                  {raffleConfig.winPattern && raffleConfig.prize && (
                    <div className="bg-linear-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-5">
                      <h4 className="font-bold text-purple-900 mb-3 flex items-center text-lg">
                        <FontAwesomeIcon icon={faTrophy} className="mr-2 text-yellow-500" />
                        Vista Previa de la Configuración
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-3 border border-purple-200">
                          <p className="text-sm text-gray-600 mb-1">Patrón de Victoria:</p>
                          <p className="font-bold text-purple-900">
                            {[
                              { value: 'horizontalLine1', label: 'Línea Horizontal 1' },
                              { value: 'horizontalLine2', label: 'Línea Horizontal 2' },
                              { value: 'horizontalLine3', label: 'Línea Horizontal 3' },
                              { value: 'horizontalLine4', label: 'Línea Horizontal 4' },
                              { value: 'horizontalLine5', label: 'Línea Horizontal 5' },
                              { value: 'letterI1', label: 'Columna 1 (B)' },
                              { value: 'letterI2', label: 'Columna 2 (I)' },
                              { value: 'letterI3', label: 'Columna 3 (N)' },
                              { value: 'letterI4', label: 'Columna 4 (G)' },
                              { value: 'letterI5', label: 'Columna 5 (O)' },
                              { value: 'diagonal', label: 'Diagonal' },
                              { value: 'fourCorners', label: '4 Esquinas' },
                              { value: 'letterX', label: 'Letra X' },
                              { value: 'letterT', label: 'Letra T' },
                              { value: 'letterL', label: 'Letra L' },
                              { value: 'cross', label: 'Cruz' },
                              { value: 'fullCard', label: 'Cartón Lleno' }
                            ].find(p => p.value === raffleConfig.winPattern)?.label}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-sm text-gray-600 mb-1">Premio:</p>
                          <p className="font-bold text-green-900">{raffleConfig.prize}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowRaffleConfigModal(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveRaffleConfig}
                      disabled={!raffleConfig.winPattern || !raffleConfig.prize}
                      className={`flex-1 px-6 py-3 rounded-lg transition-colors font-semibold ${
                        raffleConfig.winPattern && raffleConfig.prize
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                      Guardar Configuración
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de Asignación */}
          {showForm && (
            <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {editingAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
                    </h2>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingAssignment(null);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <AssignmentForm
                    assignment={editingAssignment}
                    isCardAssigned={(cardNumber) => assignedCards.has(cardNumber)}
                    onSubmit={handleFormSubmit}
                    onClose={() => {
                      setShowForm(false);
                      setEditingAssignment(null);
                    }}
                    currentRaffle={currentRaffle}
                    maxCards={currentGame?.maxPlayers || 1200}
                  />
                </div>
              </div>
            </div>
          )}

        {/* Instrucciones para el Gestor */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-700 mb-4">Instrucciones para el Gestor</h3>
          <div className="grid md:grid-cols-3 gap-6 text-gray-600">
            <div>
              <h4 className="font-semibold mb-2">Control de Números</h4>
              <ul className="text-sm space-y-1">
                <li>• Usa los controles para cantar números</li>
                <li>• Los números se muestran automáticamente</li>
                <li>• Puedes pausar y reanudar el sorteo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Gestión de Participantes</h4>
              <ul className="text-sm space-y-1">
                <li>• Ve la lista de todos los participantes</li>
                <li>• Marca ganadores cuando hagan BINGO</li>
                <li>• Revisa el estado de cada cartón</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Estadísticas</h4>
              <ul className="text-sm space-y-1">
                <li>• Monitorea el progreso del sorteo</li>
                <li>• Ve estadísticas en tiempo real</li>
                <li>• Controla el flujo del juego</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BingoGestor = () => {
  return (
    <SocketProvider>
      <BingoGestorContent />
    </SocketProvider>
  );
};

export default BingoGestor;