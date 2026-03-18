import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { hashPassword } from '../../utils/hashPassword';
import { 
  faHome, 
  faEye, 
  faEyeSlash,
  faListOl,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useGameManager } from '../../hooks/useGameManager';
import './GestorLogin.css';

const GestorLogin = ({ onLogin }) => {
  const { games } = useGameManager();
  const [formData, setFormData] = useState({
    password: '',
    gestorName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Limpiar error al escribir
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.password.trim()) {
        throw new Error('Ingresa la contraseña');
      }
      if (!formData.gestorName.trim()) {
        throw new Error('Ingresa tu nombre');
      }

      const inputHash = await hashPassword(formData.password.trim());
      const matchingGame = availableGames.find(g => g.gestorPassword === inputHash);
      if (!matchingGame) {
        throw new Error('Contraseña incorrecta o sin juego activo disponible');
      }

      await onLogin(matchingGame.id, formData.password.trim(), formData.gestorName.trim());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Filtrar solo juegos activos que tengan contraseña de gestor
  const availableGames = games.filter(game => 
    game.status === 'active' && game.gestorPassword
  );

  return (
    <div className="gestor-login-container">
      <div className="gestor-login-card">
        {/* Header */}
        <div className="gestor-card-header">
          <div className="gestor-icon-wrapper">
            <FontAwesomeIcon icon={faListOl} className="gestor-icon" />
          </div>
          <h1 className="gestor-title">Gestor de Sorteos</h1>
          <p className="gestor-subtitle">
            Accede para gestionar tu sorteo asignado
          </p>
        </div>

        {/* Mensaje de juegos disponibles */}
        {availableGames.length === 0 && (
          <div className="gestor-warning-message">
            <div className="gestor-warning-content">
              <FontAwesomeIcon icon={faExclamationTriangle} className="gestor-warning-icon" />
              <span className="gestor-warning-text">
                No hay juegos activos con gestor habilitado
              </span>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="gestor-form">
          {/* Nombre del Gestor */}
          <div>
            <label htmlFor="gestor-name" className="gestor-label">
              Tu Nombre
            </label>
            <input
              id="gestor-name"
              type="text"
              name="gestorName"
              value={formData.gestorName}
              onChange={handleInputChange}
              placeholder="Nombre del gestor"
              className="gestor-input"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="gestor-password" className="gestor-label">
              Contraseña del Sorteo
            </label>
            <div className="gestor-password-wrapper">
              <input
                id="gestor-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Contraseña proporcionada por el admin"
                className="gestor-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="gestor-toggle-password"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="gestor-error-message">
              <p className="gestor-error-text">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="gestor-buttons">
            <button
              type="submit"
              disabled={loading || availableGames.length === 0}
              className="gestor-submit-button"
              title={availableGames.length === 0 ? 'No hay juegos activos con gestor habilitado' : ''}
            >
              {loading ? 'Verificando...' : 'Acceder al Sorteo'}
            </button>

            <Link to="/bingo" className="gestor-back-button">
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Volver al Inicio
            </Link>
          </div>
        </form>

        {/* Info adicional */}
        <div className="gestor-info-box">
          <h4 className="gestor-info-title">Como Gestor puedes:</h4>
          <ul className="gestor-info-list">
            <li>• Cantar números del sorteo</li>
            <li>• Controlar el flujo del juego</li>
            <li>• Ver cartones participantes</li>
            <li>• Marcar ganadores</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GestorLogin;
