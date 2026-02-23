import React from 'react';
import './RoomCard.css';

const RoomCard = React.memo(({ room, onJoin }) => {
  const isFull = room.players.length >= room.maxPlayers;

  return (
    <div className={`room-card ${room.status}`}>
      <div className="room-header">
        <h3>{room.name}</h3>
        <span className={`room-status ${room.status}`}>
          {room.status === 'waiting' ? '⏳ Esperando' : 
           room.status === 'playing' ? '🎮 Jugando' : '✅ Terminado'}
        </span>
      </div>
      
      <div className="room-info">
        <div className="info-item">
          <span className="label">Jugadores:</span>
          <span className="value">{room.players.length}/{room.maxPlayers}</span>
        </div>
        
        <div className="info-item">
          <span className="label">Apuesta mínima:</span>
          <span className="value">${room.minBet}</span>
        </div>
        
        <div className="info-item">
          <span className="label">Fichas iniciales:</span>
          <span className="value">{room.startingChips}</span>
        </div>
      </div>

      <div className="room-players">
        {room.players.map((player, index) => (
          <span key={index} className="player-badge">
            👤 {player.username}
          </span>
        ))}
      </div>

      <button 
        className="btn-join"
        onClick={() => onJoin(room.id)}
        disabled={isFull || room.status !== 'waiting'}
      >
        {isFull ? 'Sala Llena' : room.status !== 'waiting' ? 'En Juego' : 'Unirse'}
      </button>
    </div>
  );
});

export default RoomCard;
