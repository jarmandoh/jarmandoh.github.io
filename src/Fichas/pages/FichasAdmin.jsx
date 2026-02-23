import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useSocket } from '../hooks/useSocket';
import CreateRoomModal from '../components/CreateRoomModal';
import './FichasAdmin.css';

const FichasAdmin = React.memo(() => {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();
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
    <div className="fichas-admin">
      <header className="admin-header">
        <div className="header-content">
          <h1>🔐 Panel de Administración</h1>
          <div className="admin-controls">
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

      <main className="admin-content">
        <div className="admin-section">
          <div className="section-header">
            <h2>Gestión de Salas</h2>
            <div className="header-actions">
              <button onClick={getRooms} className="btn-refresh">
                🔄 Actualizar
              </button>
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="btn-create"
              >
                ➕ Crear Sala
              </button>
            </div>
          </div>

          <div className="rooms-table">
            <table>
              <thead>
                <tr>
                  <th>Sala</th>
                  <th>Jugadores</th>
                  <th>Estado</th>
                  <th>Apuesta Mín.</th>
                  <th>Pozo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No hay salas creadas
                    </td>
                  </tr>
                ) : (
                  rooms.map(room => (
                    <tr key={room.id}>
                      <td className="room-name">{room.name}</td>
                      <td>
                        {room.players.length}/{room.maxPlayers}
                      </td>
                      <td>
                        <span className={`status-badge ${room.status}`}>
                          {room.status}
                        </span>
                      </td>
                      <td>${room.minBet}</td>
                      <td>${room.pot || 0}</td>
                      <td>
                        <button className="btn-view">Ver</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏠</div>
              <div className="stat-info">
                <span className="stat-label">Total Salas</span>
                <span className="stat-value">{rooms.length}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎮</div>
              <div className="stat-info">
                <span className="stat-label">Salas Activas</span>
                <span className="stat-value">
                  {rooms.filter(r => r.status === 'playing').length}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <span className="stat-label">Jugadores Totales</span>
                <span className="stat-value">
                  {rooms.reduce((sum, r) => sum + r.players.length, 0)}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <span className="stat-label">Pozo Total</span>
                <span className="stat-value">
                  ${rooms.reduce((sum, r) => sum + (r.pot || 0), 0)}
                </span>
              </div>
            </div>
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

export default FichasAdmin;
