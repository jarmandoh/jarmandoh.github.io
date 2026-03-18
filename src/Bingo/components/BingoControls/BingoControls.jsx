import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import './BingoControls.css';

const BingoControls = ({ onDrawNumber, calledNumbers = [] }) => {
  const canDraw = calledNumbers.length < 75;

  return (
    <div className="bingo-controls">
      <h3 className="bingo-controls__title">Controles del Sorteo</h3>
      
      <div className="bingo-controls__buttons">
        <button
          onClick={onDrawNumber}
          disabled={!canDraw}
          className={`bingo-controls__button bingo-controls__button--draw ${
            !canDraw ? 'bingo-controls__button--disabled' : ''
          }`}
        >
          <FontAwesomeIcon icon={faPlay} className="bingo-controls__icon" />
          {canDraw ? 'Sacar Balota' : 'Todas las balotas'}
        </button>
      </div>

      <div className="bingo-controls__status">
        <p className="bingo-controls__status-text">
          Balotas restantes: {75 - calledNumbers.length}
        </p>
        <p className="bingo-controls__status-text text-sm text-gray-500">
          Balotas cantadas: {calledNumbers.length}
        </p>
      </div>
    </div>
  );
};

export default BingoControls;
