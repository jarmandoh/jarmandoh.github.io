import React, { useReducer } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLock, 
  faEye, 
  faEyeSlash, 
  faHome, 
  faShieldAlt,
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './AdminLogin.css';

const loginInitialState = { password: '', showPassword: false, error: '', isLoading: false, attempts: 0 };
function loginReducer(state, patch) {
  return { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
}

const AdminLogin = ({ onLogin }) => {
  const [loginState, dispatch] = useReducer(loginReducer, loginInitialState);
  const { password, showPassword, error, isLoading, attempts } = loginState;
  const setPassword = (val) => dispatch({ password: val });
  const setShowPassword = (val) => dispatch({ showPassword: typeof val === 'function' ? val(loginState.showPassword) : val });
  const setError = (val) => dispatch({ error: val });
  const setIsLoading = (val) => dispatch({ isLoading: val });
  const setAttempts = (val) => dispatch({ attempts: typeof val === 'function' ? val(loginState.attempts) : val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Por favor, ingresa la contraseña');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = await onLogin(password);
    
    if (success) {
      setPassword('');
      setAttempts(0);
    } else {
      setAttempts(prev => prev + 1);
      setError('Contraseña incorrecta. Inténtalo de nuevo.');
      setPassword('');
      
      // Bloquear temporalmente después de 3 intentos fallidos
      if (attempts >= 2) {
        setError('Demasiados intentos fallidos. Espera 30 segundos.');
        setTimeout(() => {
          setAttempts(0);
          setError('');
        }, 30000);
      }
    }
    
    setIsLoading(false);
  };

  const isBlocked = attempts >= 3;

  return (
    <div className="admin-login-container">
      <div className="admin-login-content">
        {/* Header con navegación */}
        <div className="admin-login-header">
          <Link to="/bingo" className="admin-back-link">
            <FontAwesomeIcon icon={faHome} className="mr-2" />
            ← Volver al Juego
          </Link>
        </div>

        {/* Tarjeta de login */}
        <div className="admin-login-card">
          {/* Header */}
          <div className="admin-card-header">
            <div className="admin-icon-wrapper">
              <FontAwesomeIcon icon={faShieldAlt} className="admin-shield-icon" />
            </div>
            <h1 className="admin-title">Administrador de Bingo</h1>
            <p className="admin-subtitle">Acceso Restringido</p>
          </div>

          {/* Formulario */}
          <div className="admin-form-container">
            <form onSubmit={handleSubmit} className="admin-form">
              {/* Campo de contraseña */}
              <div>
                <label htmlFor="admin-password" className="admin-label">
                  <FontAwesomeIcon icon={faLock} className="admin-label-icon" />
                  Contraseña de Administrador
                </label>
                <div className="admin-input-wrapper">
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isBlocked || isLoading}
                    className={`admin-input ${error ? 'admin-input-error' : ''} ${isBlocked ? 'admin-input-blocked' : ''}`}
                    placeholder="Ingresa la contraseña..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isBlocked}
                    className="admin-toggle-password"
                  >
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="admin-error-message">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="admin-error-icon" />
                  <div>
                    <p className="admin-error-text">{error}</p>
                    {attempts > 0 && attempts < 3 && (
                      <p className="admin-attempts-text">
                        Intentos fallidos: {attempts}/3
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Botón de login */}
              <button
                type="submit"
                disabled={isBlocked || isLoading || !password.trim()}
                className="admin-submit-button"
              >
                {isLoading ? (
                  <>
                    <div className="admin-spinner"></div>
                    Verificando...
                  </>
                ) : isBlocked ? (
                  'Bloqueado temporalmente'
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLock} className="mr-2" />
                    Acceder
                  </>
                )}
              </button>
            </form>

            {/* Información adicional */}
            <div className="admin-info-box">
              <h3 className="admin-info-title">
                ℹ️ Información de Seguridad
              </h3>
              <ul className="admin-info-list">
                <li>• La sesión es válida por 24 horas</li>
                <li>• Se bloquea temporalmente tras 3 intentos fallidos</li>
                <li>• El acceso se registra por seguridad</li>
              </ul>
            </div>

            {/* Contacto */}
            <div className="admin-contact-text">
              ¿Problemas de acceso? Contacta al administrador del sistema
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
