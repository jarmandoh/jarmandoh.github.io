import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faEye, 
  faEyeSlash,
  faListOl
} from '@fortawesome/free-solid-svg-icons';
import './GestorLogin.css';

const GestorLogin = ({ onLogin }) => {
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

      await onLogin(formData.password.trim(), formData.gestorName.trim());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

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
              disabled={loading}
              className="gestor-submit-button"
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
