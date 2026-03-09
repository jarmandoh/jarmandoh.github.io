import React, { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';
import './BingoCard.css';

const BingoCard = React.memo(({ card, calledNumbers: initialCalledNumbers, playerName, cardNumber, gameId, winPattern, winningNumbers }) => {
  const columns = ['B', 'I', 'N', 'G', 'O'];
  const calledNumbers = initialCalledNumbers || [];
  const [markedNumbers, setMarkedNumbers] = useState(new Set());
  const [hasNotifiedWin, setHasNotifiedWin] = useState(false);
  const { socket } = useSocket();

  // Función para verificar si los números marcados forman el patrón de victoria
  const checkWinningPattern = (markedNums, pattern, cardData) => {
    const cardFlat = cardData.flat();
    const markedIndices = [];
    
    // Obtener los índices de los números marcados en el cartón
    markedNums.forEach(num => {
      const index = cardFlat.indexOf(num);
      if (index !== -1) {
        markedIndices.push(index);
      }
    });
    
    // Agregar el índice 12 (FREE) ya que siempre está marcado
    if (!markedIndices.includes(12)) {
      markedIndices.push(12);
    }
    
    // Definir los índices requeridos para cada patrón
    let requiredIndices = [];
    
    switch (pattern) {
      case 'horizontalLine1':
        requiredIndices = [0, 1, 2, 3, 4];
        break;
      case 'horizontalLine2':
        requiredIndices = [5, 6, 7, 8, 9];
        break;
      case 'horizontalLine3':
        requiredIndices = [10, 11, 12, 13, 14];
        break;
      case 'horizontalLine4':
        requiredIndices = [15, 16, 17, 18, 19];
        break;
      case 'horizontalLine5':
        requiredIndices = [20, 21, 22, 23, 24];
        break;
      case 'letterI1':
        requiredIndices = [0, 5, 10, 15, 20];
        break;
      case 'letterI2':
        requiredIndices = [1, 6, 11, 16, 21];
        break;
      case 'letterI3':
        requiredIndices = [2, 7, 12, 17, 22];
        break;
      case 'letterI4':
        requiredIndices = [3, 8, 13, 18, 23];
        break;
      case 'letterI5':
        requiredIndices = [4, 9, 14, 19, 24];
        break;
      case 'diagonal':
        requiredIndices = [0, 6, 12, 18, 24];
        break;
      case 'fourCorners':
        requiredIndices = [0, 4, 20, 24];
        break;
      case 'letterX':
        requiredIndices = [0, 6, 12, 18, 24, 4, 8, 16, 20];
        break;
      case 'letterT':
        requiredIndices = [0, 1, 2, 3, 4, 7, 12, 17, 22];
        break;
      case 'letterL':
        requiredIndices = [0, 5, 10, 15, 20, 21, 22, 23, 24];
        break;
      case 'cross':
        requiredIndices = [2, 7, 10, 11, 12, 13, 14, 17, 22];
        break;
      case 'fullCard':
        requiredIndices = Array.from({ length: 25 }, (_, i) => i);
        break;
      default:
        return false;
    }
    
    // Verificar si todos los índices requeridos están marcados
    const isWinner = requiredIndices.every(idx => markedIndices.includes(idx));
    
    if (isWinner) {
      const patternLabels = {
        'horizontalLine1': 'Línea Horizontal 1',
        'horizontalLine2': 'Línea Horizontal 2',
        'horizontalLine3': 'Línea Horizontal 3',
        'horizontalLine4': 'Línea Horizontal 4',
        'horizontalLine5': 'Línea Horizontal 5',
        'letterI1': 'Columna B',
        'letterI2': 'Columna I',
        'letterI3': 'Columna N',
        'letterI4': 'Columna G',
        'letterI5': 'Columna O',
        'diagonal': 'Diagonal',
        'fourCorners': '4 Esquinas',
        'letterX': 'Letra X',
        'letterT': 'Letra T',
        'letterL': 'Letra L',
        'cross': 'Cruz',
        'fullCard': 'Cartón Lleno'
      };
      
      console.log('🎉 ¡CARTÓN GANADOR! 🎉');
      console.log(`Cartón #${cardNumber}`);
      console.log(`Jugador: ${playerName || 'Desconocido'}`);
      console.log(`Patrón completado: ${patternLabels[pattern] || pattern}`);
      console.log(`Números marcados:`, Array.from(markedNums).sort((a, b) => a - b));
      console.log(`Índices marcados:`, markedIndices.sort((a, b) => a - b));
      console.log(`Índices requeridos:`, requiredIndices.sort((a, b) => a - b));
    }
    
    return isWinner;
  };

  // Verificar patrones de victoria cuando cambian los números marcados manualmente
  useEffect(() => {
    if (!winPattern || !winningNumbers || winningNumbers.length === 0 || hasNotifiedWin) return;

    // Verificar si todos los números ganadores han sido marcados manualmente
    const allWinningNumbersMarked = winningNumbers.every(num => markedNumbers.has(num));
    
    if (allWinningNumbersMarked) {
      // Verificar que el patrón realmente se forma con los números marcados
      const isValidWin = checkWinningPattern(markedNumbers, winPattern, card);
      
      if (isValidWin) {
        setHasNotifiedWin(true);
        
        // Mostrar alerta al jugador
        alert(`🎉 ¡BINGO! 🎉\n\n¡Felicidades ${playerName || 'Jugador'}!\nHas completado el patrón de victoria.\n\nCartón #${cardNumber}\nPatrón: ${winPattern}`);
        
        // Emitir evento de victoria por socket
        if (socket && gameId) {
          socket.emit('bingoWin', {
            gameId,
            playerName: playerName || `Jugador ${cardNumber}`,
            cardNumber,
            pattern: winPattern,
            card,
            calledNumbers: Array.from(markedNumbers)
          });
        }
        
        // Mostrar notificación al jugador
        if (window.Notification && Notification.permission === 'granted') {
          new Notification('¡BINGO!', {
            body: `¡Felicidades! Has ganado con el patrón: ${winPattern}`,
            icon: '/bingo-icon.png'
          });
        }
      }
    }
  }, [markedNumbers, winPattern, winningNumbers, hasNotifiedWin, socket, gameId, playerName, cardNumber, card]);

  const checkNumber = (num) => {
    return calledNumbers.includes(num) || markedNumbers.has(num);
  };

  const toggleNumber = (num) => {
    if (num === 'FREE') return;
    
    // Solo permitir hacer clic si el número ya ha sido cantado
    if (!calledNumbers.includes(num)) {
      return;
    }
    
    setMarkedNumbers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(num)) {
        newSet.delete(num);
      } else {
        newSet.add(num);
      }
      return newSet;
    });
  };

  // Función para disparar manualmente el evento de bingoWin (solo para pruebas)
  const handleManualBingoWin = () => {
    setHasNotifiedWin(true);
    
    const patternLabels = {
      'horizontalLine1': 'Línea Horizontal 1',
      'horizontalLine2': 'Línea Horizontal 2',
      'horizontalLine3': 'Línea Horizontal 3',
      'horizontalLine4': 'Línea Horizontal 4',
      'horizontalLine5': 'Línea Horizontal 5',
      'letterI1': 'Columna B',
      'letterI2': 'Columna I',
      'letterI3': 'Columna N',
      'letterI4': 'Columna G',
      'letterI5': 'Columna O',
      'diagonal': 'Diagonal',
      'fourCorners': '4 Esquinas',
      'letterX': 'Letra X',
      'letterT': 'Letra T',
      'letterL': 'Letra L',
      'cross': 'Cruz',
      'fullCard': 'Cartón Lleno'
    };
    
    // Mostrar alerta al jugador
    // alert(`🎉 ¡BINGO! 🎉\n\n¡Felicidades ${playerName || 'Jugador'}!\nHas completado el patrón de victoria.\n\nCartón #${cardNumber}\nPatrón: ${patternLabels[winPattern] || winPattern || 'Manual'}`);
    
    // Emitir evento de victoria por socket
    if (socket && gameId) {
      socket.emit('bingoWin', {
        gameId,
        playerName: playerName || `Jugador ${cardNumber}`,
        cardNumber,
        pattern: winPattern || 'manual',
        card,
        calledNumbers: Array.from(markedNumbers)
      });
    }
    
    // Mostrar notificación al jugador
    if (window.Notification && Notification.permission === 'granted') {
      new Notification('¡BINGO!', {
        body: `¡Felicidades! Has ganado con el patrón: ${patternLabels[winPattern] || winPattern || 'Manual'}`,
        icon: '/bingo-icon.png'
      });
    }
  };

  // Efecto visual cuando llega un nuevo número (sin escuchar socket, se maneja via props)
  useEffect(() => {
    if (calledNumbers.length > 0) {
      const newNumber = calledNumbers[calledNumbers.length - 1];
      const cardFlat = card.flat();
      
      if (cardFlat.includes(newNumber)) {
        // Efecto visual de resaltado
        setTimeout(() => {
          const element = document.querySelector(`[data-number="${newNumber}"]`);
          if (element) {
            element.classList.add('animate-pulse');
            setTimeout(() => {
              element.classList.remove('animate-pulse');
            }, 1000);
          }
        }, 100);
      }
    }
  }, [calledNumbers, card]);

  return (
    <div className="bingo-card">
      <h2 className="bingo-card__title">CARTÓN DE BINGO</h2>
      
      <div className="bingo-card__header">
        {columns.map((letter) => (
          <div key={letter} className="bingo-card__column-label">
            {letter}
          </div>
        ))}
      </div>

      <div className="bingo-card__grid">
        {card.map((row, rowIndex) =>
          row.map((num, colIndex) => {
            const isMarked = checkNumber(num);
            const isDisabled = num !== 'FREE' && !calledNumbers.includes(num);
            const isFree = num === 'FREE';
            const isWinningNumber = winningNumbers && winningNumbers.includes(num);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-number={num}
                onClick={() => toggleNumber(num)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleNumber(num)}
                role="button"
                tabIndex={0}
                className={`bingo-card__cell ${
                  isMarked && !isFree ? 'bingo-card__cell--flipped' : ''
                } ${isDisabled ? 'bingo-card__cell--disabled' : ''}`}
              >
                <div className="bingo-card__cell-inner">
                  {/* Frente de la carta */}
                  <div className={`bingo-card__cell-face bingo-card__cell-front ${
                    isFree ? 'bingo-card__cell--free' : ''
                  } ${isWinningNumber ? 'bingo-card__cell--winning' : ''}`}>
                    {isFree ? '★' : num}
                    {isWinningNumber && !isFree && (
                      <span className="bingo-card__cell-indicator">🎯</span>
                    )}
                  </div>
                  
                  {/* Dorso de la carta (con logo) */}
                  {!isFree && (
                    <div className="bingo-card__cell-face bingo-card__cell-back">
                      <span className="bingo-card__cell-back-number">{num}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <div className="bingo-card__footer">
        <p>Números marcados manualmente: {markedNumbers.size}</p>
        <p className="bingo-card__hint">Solo puedes hacer clic en números que ya han sido cantados</p>
        <button
          onClick={handleManualBingoWin}
          className="bingo-card__test-button"
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          🎉 Probar Bingo Win
        </button>
      </div>
    </div>
  );
});

export default BingoCard;
