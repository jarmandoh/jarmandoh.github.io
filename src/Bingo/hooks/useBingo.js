import { useState, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';
import bingoCardsData from '../data/bingoCards.json';
import { generateBingoCard } from '../data/cardsGenerator';
import { checkBingo } from '../utils/checkWinPattern';

export const useBingo = (gameId = null, initialCalledNumbers = []) => {
  const [calledNumbers, setCalledNumbers] = useState(initialCalledNumbers);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [bingoCard, setBingoCard] = useState(() => generateBingoCard());
  const [winnerCards, setWinnerCards] = useState([]);
  const { socket } = useSocket();

  // Sincronizar calledNumbers con el prop inicial
  useEffect(() => {
    if (initialCalledNumbers && initialCalledNumbers.length > 0) {
      setCalledNumbers(initialCalledNumbers);
    }
  }, [initialCalledNumbers]);

  // Buscar todos los cartones ganadores
  const findWinnerCards = useCallback(() => {
    if (calledNumbers.length < 4) return []; // Mínimo 4 números para ganar

    const winners = [];
    bingoCardsData.forEach(cardData => {
      const winPattern = checkBingo(cardData.card, calledNumbers);
      if (winPattern) {
        winners.push({
          ...cardData,
          winPattern
        });
      }
    });

    return winners;
  }, [calledNumbers]);

  // Obtener siguiente número disponible
  const getNextNumber = useCallback(() => {
    const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const remainingNumbers = allNumbers.filter(num => !calledNumbers.includes(num));
    
    if (remainingNumbers.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
    return remainingNumbers[randomIndex];
  }, [calledNumbers]);

  // Sacar número sin animación
  const drawNumber = useCallback((raffleNumber = 1) => {
    const nextNum = getNextNumber();
    if (nextNum) {
      setCurrentNumber(nextNum);
      setCalledNumbers(prev => {
        const newCalledNumbers = [...prev, nextNum];
        
        // Emitir evento por socket con los números actualizados
        // El evento se emite inmediatamente para iniciar la animación
        if (socket) {
          socket.emit('numberDrawn', {
            number: nextNum,
            calledNumbers: newCalledNumbers,
            raffleNumber: raffleNumber,
            timestamp: Date.now()
          });
        }
        
        return newCalledNumbers;
      });
      setIsGameActive(true);
      
      // Devolver el número sacado para que el componente pueda usarlo
      return nextNum;
    }
    return null;
  }, [getNextNumber, socket]);

  // Actualizar ganadores cuando cambien los números cantados
  useEffect(() => {
    const winners = findWinnerCards();
    setWinnerCards(winners);
  }, [calledNumbers, findWinnerCards]);

  // Reiniciar juego
  const resetGame = useCallback(() => {
    setCalledNumbers([]);
    setCurrentNumber(null);
    setIsGameActive(false);
    setBingoCard(generateBingoCard());
    setWinnerCards([]);
  }, []);

  // Escuchar eventos de socket
  useEffect(() => {
    if (socket) {
      socket.on('numberDrawn', (data) => {
        setCurrentNumber(data.number);
        setCalledNumbers(data.calledNumbers || []);
        setIsGameActive(true);
      });

      socket.on('raffleReset', (data) => {
        console.log('Sorteo reiniciado en useBingo:', data);
        setCurrentNumber(null);
        setCalledNumbers([]);
        setIsGameActive(false);
        setWinnerCards([]);
      });

      return () => {
        socket.off('numberDrawn');
        socket.off('raffleReset');
      };
    }
  }, [socket]);

  return {
    calledNumbers,
    currentNumber,
    isGameActive,
    bingoCard,
    winnerCards,
    drawNumber,
    resetGame,
    getNextNumber
  };
};