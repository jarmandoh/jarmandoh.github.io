import React, { useState } from 'react';
import './GameBoard.css';
import { GAME_STATES } from '../../data/gameConfig';

const GameBoard = React.memo(({ 
  gameState, 
  players, 
  currentPlayer, 
  pot,
  playerData,
  onBet,
  onDraw,
  onStand 
}) => {
  const myPlayer = players.find(p => p.id === playerData?.id);
  const isMyTurn = currentPlayer?.id === playerData?.id;

  const renderPlayerCard = (player) => {
    const isCurrentPlayer = currentPlayer?.id === player.id;
    const isMe = player.id === playerData?.id;

    return (
      <div 
        key={player.id} 
        className={`player-card ${isCurrentPlayer ? 'active' : ''} ${isMe ? 'me' : ''}`}
      >
        <div className="player-header">
          <span className="player-name">
            {player.username} {isMe && '(Tú)'}
          </span>
          {isCurrentPlayer && <span className="turn-indicator">🎯 Turno</span>}
        </div>
        
        <div className="player-stats">
          <div className="stat">
            <span className="label">Fichas:</span>
            <span className="value">{player.chips}</span>
          </div>
          <div className="stat">
            <span className="label">Apuesta:</span>
            <span className="value">${player.currentBet || 0}</span>
          </div>
          <div className="stat">
            <span className="label">Puntaje:</span>
            <span className="value score">
              {gameState === GAME_STATES.REVEALING || gameState === GAME_STATES.FINISHED
                ? player.score
                : '???'}
            </span>
          </div>
        </div>

        {player.fichas && player.fichas.length > 0 && (
          <div className="player-fichas">
            {player.fichas.map((ficha, index) => (
              <span key={index} className="ficha-badge">
                {gameState === GAME_STATES.REVEALING || gameState === GAME_STATES.FINISHED || isMe
                  ? ficha
                  : '?'}
              </span>
            ))}
          </div>
        )}

        {player.status === 'bust' && (
          <div className="player-status bust">¡Eliminado! (+ de 100)</div>
        )}
        {player.status === 'stand' && (
          <div className="player-status stand">Plantado</div>
        )}
      </div>
    );
  };

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>Juego de Fichas a 100</h2>
        <div className="game-info">
          <div className="info-box">
            <span className="info-label">Estado:</span>
            <span className="info-value">{getStateLabel(gameState)}</span>
          </div>
          <div className="info-box pot">
            <span className="info-label">Pozo:</span>
            <span className="info-value">${pot}</span>
          </div>
        </div>
      </div>

      <div className="players-grid">
        {players.map(player => renderPlayerCard(player))}
      </div>

      {myPlayer && (
        <div className="my-controls">
          <h3>Tus Controles</h3>
          
          {(gameState === GAME_STATES.BETTING || gameState === GAME_STATES.REBETTING) && (
            <BettingControls 
              playerChips={myPlayer.chips}
              onBet={onBet}
              hasPlacedBet={!!myPlayer.currentBet}
            />
          )}

          {gameState === GAME_STATES.DRAWING && isMyTurn && (
            <DrawingControls 
              onDraw={onDraw}
              onStand={onStand}
              currentScore={myPlayer.score}
            />
          )}

          {gameState === GAME_STATES.DRAWING && !isMyTurn && (
            <div className="waiting-message">
              Esperando turno de {currentPlayer?.username}...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BettingControls = ({ playerChips, onBet, hasPlacedBet }) => {
  const [betAmount, setBetAmount] = useState(10);

  const handleBet = () => {
    if (betAmount <= playerChips && betAmount >= 10) {
      onBet(betAmount);
    }
  };

  if (hasPlacedBet) {
    return <div className="bet-placed">✅ Apuesta realizada. Esperando a otros jugadores...</div>;
  }

  return (
    <div className="betting-controls">
      <label>Cantidad a apostar:</label>
      <input 
        type="number"
        value={betAmount}
        onChange={(e) => setBetAmount(Number(e.target.value))}
        min="10"
        max={playerChips}
        step="10"
      />
      <button onClick={handleBet} className="btn-bet">
        Apostar ${betAmount}
      </button>
    </div>
  );
};

const DrawingControls = ({ onDraw, onStand, currentScore }) => {
  return (
    <div className="drawing-controls">
      <div className="score-display">
        Tu puntaje actual: <strong>{currentScore}</strong> / 100
      </div>
      <div className="controls-buttons">
        <button onClick={onDraw} className="btn-draw">
          🎲 Pedir Ficha
        </button>
        <button onClick={onStand} className="btn-stand">
          ✋ Plantarse
        </button>
      </div>
    </div>
  );
};

const getStateLabel = (state) => {
  const labels = {
    [GAME_STATES.WAITING]: 'Esperando jugadores',
    [GAME_STATES.BETTING]: 'Realizando apuestas',
    [GAME_STATES.DRAWING]: 'Pidiendo fichas',
    [GAME_STATES.REBETTING]: 'Segunda ronda de apuestas',
    [GAME_STATES.REVEALING]: 'Revelando puntajes',
    [GAME_STATES.FINISHED]: 'Juego terminado',
  };
  return labels[state] || state;
};

export default GameBoard;
