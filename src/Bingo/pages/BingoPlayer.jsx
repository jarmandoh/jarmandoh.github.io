import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faSignOutAlt, 
  faTrophy,
  faExclamationCircle,
  faBullseye,
  faCheckCircle,
  faExpand,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { usePlayerAuth } from '../hooks/usePlayerAuth';
import { useGameManager } from '../hooks/useGameManager';
import { useBingoAdmin } from '../hooks/useBingoAdmin';
import { useSocket } from '../hooks/useSocket';
import BingoCard from '../components/BingoCard';
import WinnerModal from '../components/WinnerModal';
import { SocketProvider } from '../context/SocketContext';
import bingoCardsData from '../data/bingoCards.json';

// ============= COMPONENTES OPTIMIZADOS =============

// Componente de número actual con animación mejorada
const CurrentNumberDisplay = React.memo(({ number }) => {
  const getColumnLetter = (num) => {
    if (!num) return '';
    if (num >= 1 && num <= 15) return 'B';
    if (num >= 16 && num <= 30) return 'I';
    if (num >= 31 && num <= 45) return 'N';
    if (num >= 46 && num <= 60) return 'G';
    if (num >= 61 && num <= 75) return 'O';
    return '';
  };

  const letter = getColumnLetter(number);
  const colorClass = {
    'B': 'from-green-400 to-green-600 shadow-green-500/50',
    'I': 'from-blue-400 to-blue-600 shadow-blue-500/50',
    'N': 'from-red-400 to-red-600 shadow-red-500/50',
    'G': 'from-yellow-400 to-yellow-600 shadow-yellow-500/50',
    'O': 'from-purple-400 to-purple-600 shadow-purple-500/50'
  }[letter] || 'from-gray-400 to-gray-600 shadow-gray-500/50';

  if (!number) {
    return (
      <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-3xl p-8 shadow-xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🎱</div>
          <p className="text-gray-500 text-lg font-medium">Esperando número...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-linear-to-br ${colorClass} rounded-3xl p-8 shadow-2xl transform transition-all duration-300 hover:scale-105`}>
      <div className="text-center text-white">
        <div className="text-2xl font-bold mb-2 opacity-90">{letter}</div>
        <div className="text-7xl font-black mb-2 animate-pulse">{number}</div>
        <div className="text-lg opacity-90">Número actual</div>
      </div>
    </div>
  );
});

CurrentNumberDisplay.displayName = 'CurrentNumberDisplay';

// Componente de números llamados con animaciones
const CalledNumbersStrip = React.memo(({ calledNumbers }) => {
  const [animatingNumber, setAnimatingNumber] = useState(null);
  const prevCalledNumbersRef = React.useRef([]);

  // Debug: log cuando cambian los números
  useEffect(() => {
    console.log('CalledNumbersStrip actualizado:', calledNumbers.length, 'números');
  }, [calledNumbers]);

  const mostRecent = useMemo(() => 
    calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : null,
    [calledNumbers]
  );

  const previousNumbers = useMemo(() => 
    [...calledNumbers].reverse().slice(1, 15),
    [calledNumbers]
  );

  // Detectar nuevo número y animar
  useEffect(() => {
    if (calledNumbers.length > prevCalledNumbersRef.current.length) {
      const newNumber = calledNumbers[calledNumbers.length - 1];
      setAnimatingNumber(newNumber);
      
      // Resetear animación después de completarse
      const timer = setTimeout(() => {
        setAnimatingNumber(null);
      }, 800);
      
      prevCalledNumbersRef.current = calledNumbers;
      return () => clearTimeout(timer);
    }
    prevCalledNumbersRef.current = calledNumbers;
  }, [calledNumbers]);

  const getColumnColor = (num) => {
    if (num >= 1 && num <= 15) return 'bg-green-500';
    if (num >= 16 && num <= 30) return 'bg-blue-500';
    if (num >= 31 && num <= 45) return 'bg-red-500';
    if (num >= 46 && num <= 60) return 'bg-yellow-500';
    return 'bg-purple-500';
  };

  const getColumnLetter = (num) => {
    if (num >= 1 && num <= 15) return 'B';
    if (num >= 16 && num <= 30) return 'I';
    if (num >= 31 && num <= 45) return 'N';
    if (num >= 46 && num <= 60) return 'G';
    return 'O';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <FontAwesomeIcon icon={faClock} className="text-gray-500" />
          Últimos números ({calledNumbers.length}/75)
        </h3>
      </div>
      
      {calledNumbers.length > 0 ? (
        <div className="space-y-3">
          {/* Primera fila: Número más reciente (grande) */}
          <div className="flex justify-center">
            {mostRecent && (
              <div
                className={`${getColumnColor(mostRecent)} text-white rounded-2xl px-8 py-6 font-black text-4xl min-w-[120px] text-center shadow-2xl transform transition-all ${
                  animatingNumber === mostRecent 
                    ? 'animate-slideDown' 
                    : ''
                }`}
              >
                <div className="text-sm font-bold opacity-80 mb-1">{getColumnLetter(mostRecent)}</div>
                <div>{mostRecent}</div>
              </div>
            )}
          </div>
          
          {/* Segunda fila: Números anteriores (scroll horizontal) */}
          {previousNumbers.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
              {previousNumbers.map((num, idx) => (
                <div
                  key={`${num}-${idx}`}
                  className={`${getColumnColor(num)} text-white rounded-xl px-4 py-3 font-bold text-lg min-w-[60px] text-center shadow-md transform transition-all hover:scale-110 ${
                    idx === 0 ? 'animate-slideToSecondRow' : ''
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-sm text-center py-4">Aún no se han llamado números</p>
      )}
    </div>
  );
});

CalledNumbersStrip.displayName = 'CalledNumbersStrip';

// Componente de progreso del patrón
const PatternProgress = React.memo(({ pattern, prize, currentRaffle }) => {
  if (!pattern || !prize) {
    return (
      <div className="bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-lg border-2 border-amber-200">
        <div className="text-center">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-4xl text-amber-500 mb-3" />
          <p className="text-amber-800 font-semibold">Esperando configuración</p>
          <p className="text-amber-600 text-sm mt-1">El gestor está configurando el sorteo</p>
        </div>
      </div>
    );
  }

  const patternLabels = {
    'horizontalLine1': 'Línea 1', 'horizontalLine2': 'Línea 2', 'horizontalLine3': 'Línea 3',
    'horizontalLine4': 'Línea 4', 'horizontalLine5': 'Línea 5',
    'letterI1': 'Columna B', 'letterI2': 'Columna I', 'letterI3': 'Columna N',
    'letterI4': 'Columna G', 'letterI5': 'Columna O',
    'diagonal': 'Diagonal', 'fourCorners': '4 Esquinas', 'letterX': 'Letra X',
    'letterT': 'Letra T', 'letterL': 'Letra L', 'cross': 'Cruz', 'fullCard': 'Cartón Lleno'
  };

  return (
    <div className="bg-linear-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 shadow-lg border-2 border-purple-200">
      <div className="flex items-start gap-4">
        <div className="bg-linear-to-br from-purple-500 to-indigo-600 rounded-xl p-3 shadow-lg">
          <FontAwesomeIcon icon={faBullseye} className="text-3xl text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Sorteo {currentRaffle}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Patrón:</span>
              <span className="px-3 py-1 bg-purple-200 text-purple-900 rounded-full text-sm font-bold">
                {patternLabels[pattern] || pattern}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTrophy} className="text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">Premio:</span>
              <span className="text-sm font-bold text-gray-800">{prize}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PatternProgress.displayName = 'PatternProgress';

// ============= COMPONENTE PRINCIPAL =============

const BingoPlayerContent = () => {
  const navigate = useNavigate();
  const { player, logoutPlayer, updatePlayerCard, updatePlayerPattern } = usePlayerAuth();
  const { getGameById } = useGameManager();
  const { getAssignmentsByRaffle } = useBingoAdmin();
  const { socket, error, clearError } = useSocket();
  
  const [currentGame, setCurrentGame] = useState(null);
  const [playerCard, setPlayerCard] = useState(null);
  const [gameNotFound, setGameNotFound] = useState(false);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerData, setWinnerData] = useState(null);

  const handleLogout = () => {
    logoutPlayer();
    window.location.reload();
  };
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentRaffle = currentGame?.currentRaffle || 1;
  const raffleSettings = currentGame?.raffleSettings?.[currentRaffle];

  useEffect(() => {
    document.title = '🎮 Jugador | Bingo Game';
  }, []);

  // Función para calcular números ganadores según el patrón y el cartón
  const calculateWinningNumbers = useCallback((card, pattern) => {
    if (!card || !pattern) return [];
    
    const cardFlat = card.flat();
    const winningIndices = [];

    switch (pattern) {
      case 'horizontalLine1':
        winningIndices.push(...[0, 1, 2, 3, 4]);
        break;
      case 'horizontalLine2':
        winningIndices.push(...[5, 6, 7, 8, 9]);
        break;
      case 'horizontalLine3':
        winningIndices.push(...[10, 11, 12, 13, 14]);
        break;
      case 'horizontalLine4':
        winningIndices.push(...[15, 16, 17, 18, 19]);
        break;
      case 'horizontalLine5':
        winningIndices.push(...[20, 21, 22, 23, 24]);
        break;
      case 'letterI1':
        winningIndices.push(...[0, 5, 10, 15, 20]);
        break;
      case 'letterI2':
        winningIndices.push(...[1, 6, 11, 16, 21]);
        break;
      case 'letterI3':
        winningIndices.push(...[2, 7, 12, 17, 22]);
        break;
      case 'letterI4':
        winningIndices.push(...[3, 8, 13, 18, 23]);
        break;
      case 'letterI5':
        winningIndices.push(...[4, 9, 14, 19, 24]);
        break;
      case 'diagonal':
        winningIndices.push(...[0, 6, 12, 18, 24]);
        break;
      case 'fourCorners':
        winningIndices.push(...[0, 4, 20, 24]);
        break;
      case 'letterX':
        winningIndices.push(...[0, 6, 12, 18, 24, 4, 8, 16, 20]);
        break;
      case 'letterT':
        winningIndices.push(...[0, 1, 2, 3, 4, 7, 12, 17, 22]);
        break;
      case 'letterL':
        winningIndices.push(...[0, 5, 10, 15, 20, 21, 22, 23, 24]);
        break;
      case 'cross':
        winningIndices.push(...[2, 7, 10, 11, 12, 13, 14, 17, 22]);
        break;
      case 'fullCard':
        winningIndices.push(...Array.from({ length: 25 }, (_, i) => i));
        break;
      default:
        break;
    }

    // Convertir índices a números del cartón (excluyendo FREE)
    return winningIndices.map(idx => cardFlat[idx]).filter(num => num !== 'FREE');
  }, []);

  // Actualizar patrón y números ganadores cuando cambia la configuración
  useEffect(() => {
    if (raffleSettings?.winPattern && playerCard && player?.winPattern !== raffleSettings.winPattern) {
      const winningNums = calculateWinningNumbers(playerCard, raffleSettings.winPattern);
      updatePlayerPattern(raffleSettings.winPattern, winningNums);
    }
  }, [raffleSettings?.winPattern, playerCard, player?.winPattern, calculateWinningNumbers, updatePlayerPattern]);

  const assignRandomCard = useCallback(() => {
    const assignments = getAssignmentsByRaffle(1);
    const assignedCards = assignments.map(a => a.cardNumber);
    
    let availableCard = null;
    for (let i = 1; i <= 1200; i++) {
      if (!assignedCards.includes(i)) {
        availableCard = i;
        break;
      }
    }
    
    if (availableCard) {
      updatePlayerCard(availableCard);
    }
  }, [getAssignmentsByRaffle, updatePlayerCard]);

  const generatePlayerCardFromNumber = useCallback((cardNumber) => {
    const cardData = bingoCardsData.find(card => card.id === cardNumber);
    
    if (cardData) {
      setPlayerCard(cardData.card);
    } else {
      console.error(`Cartón #${cardNumber} no encontrado`);
      setPlayerCard(null);
    }
  }, []);

  // Cargar juego inicial solo una vez
  useEffect(() => {
    if (player?.gameId) {
      const game = getGameById(player.gameId);
      if (game) {
        setCurrentGame(game);
        setGameNotFound(false);
        setCalledNumbers(game.calledNumbers || []);
        
      } else {
        setGameNotFound(true);
      }
    }
  }, [player?.gameId, getGameById]);

  useEffect(() => {
    if (player?.gameId && !player?.cardNumber && !playerCard) {
      assignRandomCard();
    }
  }, [player?.gameId, player?.cardNumber, playerCard, assignRandomCard]);

  useEffect(() => {
    if (player?.cardNumber && !playerCard) {
      generatePlayerCardFromNumber(player.cardNumber);
    }
  }, [player?.cardNumber, playerCard, generatePlayerCardFromNumber]);

  const handleNumberDrawn = useCallback((data) => {
    const playerRaffle = currentGame?.currentRaffle || 1;
    if (data.raffleNumber === playerRaffle) {
      console.log('Número recibido:', data.number, 'Total números:', data.calledNumbers?.length);
      
      // Actualizar inmediatamente con el número recién sacado
      const newNumber = data.number;
      const updatedCalledNumbers = [...(data.calledNumbers || [])];
      
      // Forzar actualización del estado
      setCalledNumbers(updatedCalledNumbers);
      
      setCurrentGame(prev => ({
        ...prev,
        currentNumber: newNumber,
        calledNumbers: updatedCalledNumbers
      }));
    }
  }, [currentGame]);

  const handleRaffleReset = useCallback((data) => {
    const playerRaffle = currentGame?.currentRaffle || 1;
    if (data.raffleNumber === playerRaffle) {
      console.log('Sorteo reiniciado');
      
      // Limpiar estado inmediatamente
      setCalledNumbers([]);
      
      setCurrentGame(prev => ({
        ...prev,
        currentNumber: null,
        calledNumbers: []
      }));
    }
  }, [currentGame]);

  const handleBingoWinPlayer = useCallback((data) => {
    if (data.cardNumber === player?.cardNumber) {
      setWinnerData(data);
      setShowWinnerModal(true);
    }
  }, [player?.cardNumber]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      if (player?.gameId) {
        socket.emit('joinGame', { gameId: player.gameId });
      }
    };

    socket.on('connect', handleConnect);
    socket.on('numberDrawn', handleNumberDrawn);
    socket.on('raffleReset', handleRaffleReset);
    socket.on('bingoWin', handleBingoWinPlayer);

    if (socket.connected && player?.gameId) {
      socket.emit('joinGame', { gameId: player.gameId });
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('numberDrawn', handleNumberDrawn);
      socket.off('raffleReset', handleRaffleReset);
      socket.off('bingoWin', handleBingoWinPlayer);
    };
  }, [socket, player?.gameId, handleNumberDrawn, handleRaffleReset, handleBingoWinPlayer]);

  if (gameNotFound) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-500 to-pink-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <FontAwesomeIcon icon={faExclamationCircle} className="text-8xl text-red-500 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Juego No Encontrado</h2>
          <p className="text-gray-600 mb-8">
            El juego con ID "{player?.gameId}" no existe o ha sido eliminado.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 px-6 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Volver al Login
            </button>
            <Link
              to="/bingo"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 px-6 rounded-xl font-bold transition-all"
            >
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Error global de socket */}
      {error && (
        <div className="global-error-message">
          <span>{error}</span>
          <button className="btn-close-error" onClick={clearError} title="Cerrar">✖</button>
        </div>
      )}
      {/* Winner Modal */}
      {showWinnerModal && winnerData && (
        <WinnerModal
          winnerCards={[{ ...winnerData, id: winnerData.cardNumber }]}
          onClose={() => setShowWinnerModal(false)}
        />
      )}

      {/* Header Compacto */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-40 border-b-2 border-teal-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-linear-to-br from-teal-500 to-cyan-600 rounded-xl p-2 shadow-lg">
                <FontAwesomeIcon icon={faTrophy} className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900">{currentGame?.name || 'Bingo'}</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold">{player?.name}</span> · Cartón #{player?.cardNumber || '...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-2 rounded-xl font-bold text-xs sm:text-sm ${
                currentGame?.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : currentGame?.status === 'waiting'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentGame?.status === 'active' && '🟢 En Juego'}
                {currentGame?.status === 'waiting' && '⏳ Esperando'}
                {currentGame?.status === 'finished' && '🏁 Finalizado'}
              </div>
              <Link 
                to="/bingo" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl transition-all font-semibold shadow-md"
              >
                <FontAwesomeIcon icon={faHome} />
                <span className="hidden sm:inline ml-2">Inicio</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl transition-all font-semibold shadow-md"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span className="hidden sm:inline ml-2">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Info y Número Actual */}
          <div className="lg:col-span-1 space-y-6">
            {/* Patrón y Premio */}
            <PatternProgress 
              pattern={raffleSettings?.winPattern}
              prize={raffleSettings?.prize}
              currentRaffle={currentRaffle}
            />

            

            {/* Ganadores */}
            {currentGame?.winners && currentGame.winners.length > 0 && (
              <div className="bg-linear-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTrophy} className="text-yellow-600" />
                  🎉 Ganadores
                </h3>
                <div className="space-y-2">
                  {currentGame.winners.map((winner, index) => (
                    <div key={index} className="bg-white/60 rounded-lg p-3 flex items-center gap-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-green-500" />
                      <span className="font-semibold text-gray-800">
                        {winner.name || `Cartón #${winner.cardNumber}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Columna Central: Cartón */}
          <div className="lg:col-span-2 space-y-6">
            {/* Números Recientes */}
            <CalledNumbersStrip key={calledNumbers.length} calledNumbers={calledNumbers} />

            {/* Cartón de Bingo */}
            <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900/95 p-8 flex items-center justify-center' : ''}`}>
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl transition-all"
                >
                  ✕ Cerrar
                </button>
              )}
              <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden ${isFullscreen ? 'max-w-4xl w-full' : 'w-full'}`}>
                <div className="bg-linear-to-r from-teal-500 to-cyan-600 p-4 flex justify-between items-center">
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    🎯 Tu Cartón
                  </h2>
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <FontAwesomeIcon icon={faExpand} />
                    <span className="hidden sm:inline">Pantalla Completa</span>
                  </button>
                </div>
                <div className="p-4 sm:p-6">
                  {playerCard ? (
                    <BingoCard 
                      key={`card-${calledNumbers.length}`}
                      card={playerCard}
                      calledNumbers={calledNumbers}
                      playerName={player?.name}
                      cardNumber={player?.cardNumber}
                      gameId={currentGame?.id}
                      winPattern={player?.winPattern}
                      winningNumbers={player?.winningNumbers}
                    />
                  ) : (
                    <div className="bg-linear-to-br from-gray-100 to-gray-200 rounded-xl p-16 text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-600 font-semibold text-lg">Generando tu cartón...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-indigo-200">
              <h3 className="font-bold text-indigo-900 mb-3">💡 Consejos</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">✓</span>
                  <span>Los números se marcan automáticamente en tu cartón</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">✓</span>
                  <span>Recibirás una notificación si completas el patrón ganador</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">✓</span>
                  <span>Mantén esta ventana abierta durante todo el juego</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500">✓</span>
                  <span>Usa el modo pantalla completa para enfocarte en tu cartón</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const BingoPlayer = () => {
  return (
    <SocketProvider>
      <BingoPlayerContent />
    </SocketProvider>
  );
};

export default BingoPlayer;
