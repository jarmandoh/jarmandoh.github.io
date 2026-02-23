import React, { useState } from 'react';
import './CreateRoomModal.css';
import { GAME_CONFIG } from '../../data/gameConfig';

const CreateRoomModal = React.memo(({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    maxPlayers: 4,
    minBet: GAME_CONFIG.MIN_BET,
    startingChips: GAME_CONFIG.DEFAULT_CHIPS,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
    setFormData({
      name: '',
      maxPlayers: 4,
      minBet: GAME_CONFIG.MIN_BET,
      startingChips: GAME_CONFIG.DEFAULT_CHIPS,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : Number(value)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nueva Sala</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la Sala</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Sala VIP"
              required
            />
          </div>

          <div className="form-group">
            <label>Jugadores Máximos</label>
            <input
              type="number"
              name="maxPlayers"
              value={formData.maxPlayers}
              onChange={handleChange}
              min={GAME_CONFIG.MIN_PLAYERS}
              max={GAME_CONFIG.MAX_PLAYERS}
              required
            />
            <small>{GAME_CONFIG.MIN_PLAYERS}-{GAME_CONFIG.MAX_PLAYERS} jugadores</small>
          </div>

          <div className="form-group">
            <label>Apuesta Mínima</label>
            <input
              type="number"
              name="minBet"
              value={formData.minBet}
              onChange={handleChange}
              min={GAME_CONFIG.MIN_BET}
              max={GAME_CONFIG.MAX_BET}
              step="10"
              required
            />
            <small>${GAME_CONFIG.MIN_BET} - ${GAME_CONFIG.MAX_BET}</small>
          </div>

          <div className="form-group">
            <label>Fichas Iniciales</label>
            <input
              type="number"
              name="startingChips"
              value={formData.startingChips}
              onChange={handleChange}
              min="100"
              max="10000"
              step="100"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Crear Sala
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
