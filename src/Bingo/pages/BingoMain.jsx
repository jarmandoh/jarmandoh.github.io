import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faList, faRandom, faCog } from '@fortawesome/free-solid-svg-icons';
import BingoCard from '../components/BingoCard';
import BingoControls from '../components/BingoControls';
import NumberDisplay from '../components/NumberDisplay';
import WinnerModal from '../components/WinnerModal';
import { useBingo } from '../hooks/useBingo';
import { SocketProvider } from '../context/SocketContext';


const BingoMainContent = () => {
  const {
    calledNumbers,
    currentNumber,
    isGameActive,
    winnerCards,
    drawNumber,
    resetGame,
    getNextNumber
  } = useBingo();

  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [randomCardId] = useState(() => Math.floor(Math.random() * 1200) + 1);

  // Mostrar modal cuando hay ganadores
  useEffect(() => {
    if (winnerCards.length > 0) {
      setShowWinnerModal(true);
    }
  }, [winnerCards]);

  const handleCloseModal = () => {
    setShowWinnerModal(false);
  };

  const handleResetGame = () => {
    setShowWinnerModal(false);
    resetGame();
  };

  

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-600 p-4">
      {/* NumberDisplay sticky en la esquina superior izquierda */}
      <div className="fixed top-4 left-4 z-50 min-w-200 min-h-200">
        <NumberDisplay 
          currentNumber={currentNumber}
          calledNumbers={calledNumbers}
        />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Navegación superior elegante */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-6 shrink-0 shadow-lg ml-72">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex gap-3">
              <Link 
                to="/" 
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center font-medium shadow-md"
              >
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Portfolio
              </Link>
              <Link 
                to="/bingo/cartones" 
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center font-medium shadow-md"
              >
                <FontAwesomeIcon icon={faList} className="mr-2" />
                Ver Cartones
              </Link>
              <Link 
                to="/bingo/admin" 
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-300 inline-flex items-center font-medium shadow-md"
              >
                <FontAwesomeIcon icon={faCog} className="mr-2" />
                Administrador
              </Link>
            </div>
            <Link 
              to={`/bingo/carton/${randomCardId}`}
              className="bg-linear-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black px-6 py-2 rounded-lg transition-all duration-300 inline-flex items-center font-bold shadow-lg transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faRandom} className="mr-2" />
              Cartón Aleatorio
            </Link>
          </div>
        </div>

        {/* Header principal */}
        <header className="text-center mb-6 shrink-0 ml-72">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2 drop-shadow-lg">
            🎱 BINGO 🎱
          </h1>
          <p className="text-lg sm:text-xl text-purple-100 font-medium">¡Disfruta del Bingo clásico!</p>
        </header>

        {/* Layout principal mejorado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 ml-72">
          
          {/* Columna izquierda: Controles */}
          <div className="flex flex-col gap-4">
            <div className="shrink-0">
              <BingoControls 
                onDrawNumber={drawNumber}
                calledNumbers={calledNumbers}
              />
            </div>

            {/* Notificación de ganadores */}
            {!showWinnerModal && winnerCards.length > 0 && (
              <div className="bg-yellow-400 text-black p-4 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">¡BINGO!</h3>
                    <p className="text-sm">
                      {winnerCards.length === 1 
                        ? `Cartón #${winnerCards[0].id} ganó` 
                        : `${winnerCards.length} cartones ganadores`
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWinnerModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Ver Ganadores
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha: Números cantados */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 flex flex-col shadow-lg">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="text-xl font-bold text-white">Números Cantados</h3>
              <div className="bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm">
                {calledNumbers.length}/75
              </div>
            </div>
            
            {/* Grid simplificado de números */}
            <div className="mb-4">
              <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-2">
                {Array.from({ length: 75 }, (_, i) => i + 1).map((num) => {
                  const isB = num <= 15;
                  const isI = num > 15 && num <= 30;
                  const isN = num > 30 && num <= 45;
                  const isG = num > 45 && num <= 60;
                  const isO = num > 60;
                  const isLastCalled = calledNumbers.length > 0 && num === calledNumbers[calledNumbers.length - 1];
                  
                  let bgColor = 'bg-white/20 text-white';
                  if (calledNumbers.includes(num)) {
                    if (isB) bgColor = 'bg-blue-500 text-white';
                    else if (isI) bgColor = 'bg-red-500 text-white';
                    else if (isN) bgColor = 'bg-yellow-500 text-black';
                    else if (isG) bgColor = 'bg-green-500 text-white';
                    else if (isO) bgColor = 'bg-purple-500 text-white';
                  }
                  
                  return (
                    <div
                      key={num}
                      className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-sm lg:text-base font-bold transition-all duration-300 transform ${bgColor} ${
                        calledNumbers.includes(num) ? 'shadow-lg scale-110' : 'hover:bg-white/30'
                      } ${
                        isLastCalled ? 'ring-2 ring-yellow-300 ring-opacity-75 animate-pulse' : ''
                      }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Estadísticas */}
            <div className="shrink-0 mt-4 pt-4 border-t border-white/20">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-white">{75 - calledNumbers.length}</div>
                  <div className="text-xs text-purple-200">Números restantes</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl font-bold text-yellow-400">
                    {calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : '-'}
                  </div>
                  <div className="text-xs text-purple-200">Último número</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de ganadores */}
      {showWinnerModal && winnerCards.length > 0 && (
        <WinnerModal 
          winnerCards={winnerCards}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

const BingoMain = () => {
  return (
    <SocketProvider>
      <BingoMainContent />
    </SocketProvider>
  );
};

export default BingoMain;