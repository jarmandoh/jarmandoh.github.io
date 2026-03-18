import React from 'react';
import './NumberDisplay.css';
import { getColumnLetter } from '../../utils/bingoUtils';

const NumberDisplay = React.memo(({ currentNumber, calledNumbers }) => {
  return (
    <div className="number-display">
      <h2 className="number-display__title">Número Actual</h2>
      <div className="number-display__content">
        {currentNumber ? (
          <div className="number-display__current">
            <div className="number-display__label">
              {getColumnLetter(currentNumber)}-{currentNumber}
            </div>
            <div className="number-display__ball">
              <span className="number-display__ball-number">
                {currentNumber}
              </span>
            </div>
          </div>
        ) : (
          <div className="number-display__waiting">
            <div className="number-display__emoji">🎱</div>
            <p className="number-display__hint">Presiona "Sacar Número"</p>
          </div>
        )}
      </div>
      <div className="number-display__footer">
        <p className="number-display__stats">
          Cantados: <span className="number-display__stats-value">{calledNumbers.length}</span>/75
        </p>
        <div className="number-display__progress">
          <div
            className="number-display__progress-bar"
            style={{ width: `${(calledNumbers.length / 75) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
});

export default NumberDisplay;
