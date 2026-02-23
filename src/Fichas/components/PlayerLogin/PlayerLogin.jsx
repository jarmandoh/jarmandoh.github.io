
import React, { useState } from 'react';
import './PlayerLogin.css';

const PlayerLogin = React.memo(function PlayerLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Por favor ingresa un nombre de usuario');
      return;
    }
    if (username.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    onLogin(username.trim());
  };

  return (
    <div className="player-login-container">
      <div className="player-login-card">
        <h2>Iniciar Sesión como Jugador</h2>
        <p className="subtitle">Ingresa tu nombre para comenzar a jugar</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingresa tu nombre"
              autoFocus
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn-primary">
            Entrar al Juego
          </button>
        </form>
      </div>
    </div>
  );
});

export default PlayerLogin;
