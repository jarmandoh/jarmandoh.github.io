import React, { useState } from 'react';
import './AdminLogin.css';

const AdminLogin = React.memo(({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const result = onLogin(password);
    if (!result.success) {
      setError(result.error);
      setPassword('');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-icon">🔐</div>
        <h2>Acceso Administrador</h2>
        <p className="subtitle">Panel de control del juego de fichas</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña"
              autoFocus
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="btn-admin">
            Acceder
          </button>
        </form>
      </div>
    </div>
  )
});

export default AdminLogin;
