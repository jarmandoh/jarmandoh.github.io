import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight, faHome, faPrint } from '@fortawesome/free-solid-svg-icons';
import { generateBingoCards } from '../data/cardsGenerator';

const BingoCardViewer = React.memo(() => {
  const { cardId } = useParams();
  const [loading, setLoading] = useState(true);

  // Memoizar generación de todos los cartones
  const allCards = useMemo(() => generateBingoCards(), []);

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (cardId) {
      document.title = `Cartón #${cardId} | Bingo`;
    }
  }, [cardId]);

  // Memoizar cálculo del cartón actual
  const cardNumber = useMemo(() => parseInt(cardId), [cardId]);
  const currentCard = useMemo(() => {
    if (!loading && allCards.length > 0 && cardNumber >= 1 && cardNumber <= 1200) {
      return allCards.find(c => c.id === cardNumber);
    }
    return null;
  }, [loading, allCards, cardNumber]);

  const columns = ['B', 'I', 'N', 'G', 'O'];
  const cardNumber = parseInt(cardId);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Cargando cartón...</div>
      </div>
    );
  }

  if (!currentCard || cardNumber < 1 || cardNumber > 1200) {
    return (
      <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Cartón No Encontrado</h2>
          <p className="text-gray-600 mb-6">
            El cartón #{cardId} no existe. Los cartones disponibles van del 1 al 1200.
          </p>
          <Link 
            to="/bingo" 
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 inline-flex items-center"
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            Volver al Juego
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header con navegación */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 print:hidden">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <Link 
                to="/bingo" 
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition duration-300 inline-flex items-center"
              >
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Juego Principal
              </Link>
              
              {cardNumber > 1 && (
                <Link 
                  to={`/bingo/carton/${cardNumber - 1}`}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition duration-300 inline-flex items-center"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Anterior
                </Link>
              )}
              
              {cardNumber < 1200 && (
                <Link 
                  to={`/bingo/carton/${cardNumber + 1}`}
                  className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition duration-300 inline-flex items-center"
                >
                  Siguiente
                  <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                </Link>
              )}
            </div>

            <button
              onClick={handlePrint}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300 inline-flex items-center"
            >
              <FontAwesomeIcon icon={faPrint} className="mr-2" />
              Imprimir
            </button>
          </div>
        </div>

        {/* Cartón de Bingo */}
        <div className="bg-white rounded-xl shadow-2xl p-8 print:shadow-none">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-purple-600 mb-2">CARTÓN DE BINGO</h1>
            <p className="text-xl text-gray-600">Cartón #{currentCard.id}</p>
          </div>
          
          {/* Headers de columnas */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {columns.map((letter) => (
              <div
                key={letter}
                className="bg-purple-600 text-white text-3xl font-bold py-4 text-center rounded-lg print:border print:border-black"
              >
                {letter}
              </div>
            ))}
          </div>

          {/* Números del cartón */}
          <div className="grid grid-cols-5 gap-2">
            {currentCard.card.map((row, rowIndex) =>
              row.map((num, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="aspect-square flex items-center justify-center text-2xl font-bold rounded-lg border-2 border-gray-300 bg-gray-50 print:border-black print:bg-white"
                >
                  {num === 'FREE' ? '★' : num}
                </div>
              ))
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-6 text-center text-gray-500 text-sm print:mt-4">
            <p>Cartón generado automáticamente - ID: {currentCard.id}</p>
            <p className="print:hidden">¡Buena suerte en tu juego de Bingo!</p>
          </div>
        </div>

        {/* Navegación inferior */}
        <div className="mt-6 text-center print:hidden">
          <p className="text-white mb-4">
            Navegando cartón {cardNumber} de 1200
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 inline-block">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(cardNumber / 1200) * 100}%`, minWidth: '4px' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Estilos para impresión */}
      <style jsx="true">{`
        @media print {
          body { margin: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border { border: 2px solid black !important; }
          .print\\:border-black { border-color: black !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:mt-4 { margin-top: 1rem !important; }
        }
      `}</style>
    </div>
  );
};

export default BingoCardViewer;