import React from 'react';
import './NumberDisplay.css';

const NumberDisplay = React.memo(({ currentNumber, calledNumbers }) => {
  const getColumnLetter = (num) => {
    if (num >= 1 && num <= 15) return 'B';
    if (num >= 16 && num <= 30) return 'I';
    if (num >= 31 && num <= 45) return 'N';
    if (num >= 46 && num <= 60) return 'G';
    if (num >= 61 && num <= 75) return 'O';
    return '';
  };

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
