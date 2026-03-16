import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faGamepad, 
  faHome, 
  faPlay,
  faExclamationTriangle,
  faHashtag
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useGameManager } from '../../hooks/useGameManager';
import './PlayerLogin.css';

const PlayerLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    gameId: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { getGameById, getGamesByStatus } = useGameManager();
  const activeGames = getGamesByStatus('active');
  const waitingGames = getGamesByStatus('waiting');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Por favor, ingresa tu nombre');
      return;
    }

    if (!formData.gameId.trim()) {
      setError('Por favor, ingresa el ID del juego');
      return;
    }

    setIsLoading(true);
    setError('');

    // Verificar que el juego existe
    const game = getGameById(formData.gameId.trim());
    if (!game) {
      setError('El ID del juego no existe');
      setIsLoading(false);
      return;
    }

    if (game.status === 'finished') {
      setError('Este juego ya ha finalizado');
      setIsLoading(false);
      return;
    }

    // Simular delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const playerData = {
      name: formData.name.trim(),
      gameId: formData.gameId.trim()
    };

    onLogin(playerData);
    setIsLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const joinGame = (gameId) => {
    setFormData(prev => ({ ...prev, gameId }));
  };

  return (
    <div className="player-login-container">
      <div className="player-login-content">
        {/* Header con navegación */}
        <div className="player-login-header">
          <Link to="/bingo" className="player-back-link">
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            ← Volver al Inicio
          </Link>
        </div>

        {/* Tarjeta de login */}
        <div className="player-login-card">
          {/* Header */}
          <div className="player-card-header">
            <div className="player-icon-wrapper">
              <FontAwesomeIcon icon={faGamepad} className="player-icon" />
            </div>
            <h1 className="player-title">Unirse al Juego</h1>
            <p className="player-subtitle">Ingresa tus datos para comenzar a jugar</p>
          </div>

          {/* Formulario */}
          <div className="player-form-wrapper">
            <form onSubmit={handleSubmit} className="player-form">
              {/* Nombre del jugador */}
              <div>
                <label htmlFor="player-name" className="player-label">
                  <FontAwesomeIcon icon={faUser} className="player-label-icon" />
                  Tu Nombre
                </label>
                <input
                  id="player-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={isLoading}
                  className="player-input"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              {/* ID del juego */}
              <div>
                <label htmlFor="player-game-id" className="player-label">
                  <FontAwesomeIcon icon={faHashtag} className="player-label-icon" />
                  ID del Juego
                </label>
                <input
                  id="player-game-id"
                  type="text"
                  value={formData.gameId}
                  onChange={(e) => handleChange('gameId', e.target.value)}
                  disabled={isLoading}
                  className={`player-input ${error ? 'player-input-error' : ''}`}
                  placeholder="Ej: game_1234567890"
                />
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="player-error-message">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="player-error-icon" />
                  <p className="player-error-text">{error}</p>
                </div>
              )}

              {/* Botón de unirse */}
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim() || !formData.gameId.trim()}
                className="player-submit-button"
              >
                {isLoading ? (
                  <>
                    <div className="player-spinner"></div>
                    Uniéndote...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    Unirse al Juego
                  </>
                )}
              </button>
            </form>

            {/* TODO: Resultados de juegos */}
            
            

            {/* Información adicional */}
            <div className="player-info-box">
              <h3 className="player-info-title">
                ℹ️ Instrucciones
              </h3>
              <ul className="player-info-list">
                <li>• Solicita el ID del juego al administrador</li>
                <li>• Una vez unido, se te asignará un cartón automáticamente</li>
                <li>• Los números se marcarán en tiempo real</li>
                <li>• Recibirás notificación automática si haces BINGO</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerLogin;
