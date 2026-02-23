import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerAuth } from '../hooks/usePlayerAuth';
import { useSocket } from '../hooks/useSocket';
import { useGameManager } from '../hooks/useGameManager';
import RoomCard from '../components/RoomCard';
import GameBoard from '../components/GameBoard';
import './FichasPlayer.css';

const FichasPlayer = React.memo(() => {
  const navigate = useNavigate();
  const { playerData, logout } = usePlayerAuth();
  const { 
    connected, 
    rooms, 
    currentRoom, 
    joinRoom, 
    leaveRoom,
    getRooms,
    error,
    clearError
  } = useSocket();
  
  const {
    gameState,
    players,
    currentPlayer,
    pot,
    handleBet,
    handleDraw,
    handleStand
  } = useGameManager();

  useEffect(() => {
    if (connected && !currentRoom) {
      getRooms();
    }
  }, [connected, currentRoom, getRooms]);

  const handleLogout = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.id);
    }
    logout();
    navigate('/fichas');
  };

  const handleJoinRoom = (roomId) => {
    if (playerData) {
      joinRoom(roomId, playerData);
    }
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.id);
    }
  };

  if (!connected) {
    return (
      <div className="fichas-player">
        <div className="connecting-message">
          <div className="spinner"></div>
          <p>Conectando al servidor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fichas-player">
      <header className="player-header">
        <div className="header-content">
          <h1>🎲 Juego de Fichas a 100</h1>
          <div className="user-info">
            <span className="username">👤 {playerData?.username}</span>
            <button onClick={handleLogout} className="btn-logout">
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Mostrar error global de socket */}
      {error && (
        <div className="global-error-message">
          <span>{error}</span>
          <button className="btn-close-error" onClick={clearError} title="Cerrar">✖</button>
        </div>
      )}

      <main className="player-content">
        {!currentRoom ? (
          <div className="rooms-section">
            <div className="section-header">
              <h2>Salas Disponibles</h2>
              <button onClick={getRooms} className="btn-refresh">
                🔄 Actualizar
              </button>
            </div>

            {rooms.length === 0 ? (
              <div className="no-rooms">
                <p>No hay salas disponibles en este momento.</p>
                <p>Espera a que un administrador cree una sala.</p>
              </div>
            ) : (
              <div className="rooms-grid">
                {rooms.map(room => (
                  <RoomCard 
                    key={room.id}
                    room={room}
                    onJoin={handleJoinRoom}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="game-section">
            <div className="room-info-bar">
              <h2>📍 {currentRoom.name}</h2>
              <button onClick={handleLeaveRoom} className="btn-leave">
                Salir de la Sala
              </button>
            </div>

            <GameBoard
              gameState={gameState}
              players={players}
              currentPlayer={currentPlayer}
              pot={pot}
              playerData={playerData}
              onBet={handleBet}
              onDraw={handleDraw}
              onStand={handleStand}
            />
          </div>
        )}
      </main>
    </div>
  );
});

export default FichasPlayer;
