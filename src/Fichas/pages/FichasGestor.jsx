import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGestorAuth } from '../hooks/useGestorAuth';
import { useSocket } from '../hooks/useSocket';
import CreateRoomModal from '../components/CreateRoomModal';
import './FichasGestor.css';

const FichasGestor = () => {
  const navigate = useNavigate();
  const { logout } = useGestorAuth();
  const { connected, rooms, createRoom, getRooms, error, clearError } = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/fichas');
  };

  const handleCreateRoom = (roomConfig) => {
    createRoom(roomConfig);
    getRooms();
  };

  return (
    <div className="fichas-gestor">
      <header className="gestor-header">
        <div className="header-content">
          <h1>👨‍💼 Panel de Gestión</h1>
          <div className="gestor-controls">
            <span className="status">
              {connected ? '🟢 Conectado' : '🔴 Desconectado'}
            </span>
            <button onClick={handleLogout} className="btn-logout">
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Error global de socket */}
      {error && (
        <div className="global-error-message">
          <span>{error}</span>
          <button className="btn-close-error" onClick={clearError} title="Cerrar">✖</button>
        </div>
      )}

      <main className="gestor-content">
        <div className="gestor-section">
          <div className="section-header">
            <h2>Mis Salas</h2>
            <div className="header-actions">
              <button onClick={getRooms} className="btn-refresh">
                🔄 Actualizar
              </button>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="btn-create"
              >
                ➕ Crear Nueva Sala
              </button>
            </div>
          </div>

          <div className="rooms-list">
            {rooms.length === 0 ? (
              <div className="no-rooms">
                <p>No has creado ninguna sala todavía.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="btn-create-first"
                >
                  Crear Mi Primera Sala
                </button>
              </div>
            ) : (
              <div className="rooms-grid">
                {rooms.map(room => (
                  <div key={room.id} className="room-item">
                    <div className="room-header">
                      <h3>{room.name}</h3>
                      <span className={`room-status ${room.status}`}>
                        {room.status}
                      </span>
                    </div>
                    
                    <div className="room-details">
                      <div className="detail">
                        <span className="label">Jugadores:</span>
                        <span className="value">
                          {room.players.length}/{room.maxPlayers}
                        </span>
                      </div>
                      <div className="detail">
                        <span className="label">Apuesta Mín:</span>
                        <span className="value">${room.minBet}</span>
                      </div>
                      <div className="detail">
                        <span className="label">Pozo Actual:</span>
                        <span className="value">${room.pot || 0}</span>
                      </div>
                    </div>

                    {room.players.length > 0 && (
                      <div className="room-players">
                        <strong>Jugadores:</strong>
                        <ul>
                          {room.players.map((player, idx) => (
                            <li key={idx}>{player.username}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="room-actions">
                      <button className="btn-manage">Administrar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateRoom}
      />
    </div>
  );
};

export default FichasGestor;
