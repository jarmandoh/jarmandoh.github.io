import React, { useReducer } from 'react';
import { useReservas } from '../../context/ReservasContext';

const loginInitialState = { username: '', password: '', error: '', loading: false, showPassword: false };
function loginReducer(state, patch) {
  return { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
}

const AdminLogin = ({ onSuccess }) => {
  const { loginAdmin } = useReservas();
  const [loginState, dispatch] = useReducer(loginReducer, loginInitialState);
  const { username, password, error, loading, showPassword } = loginState;
  const setUsername = (val) => dispatch({ username: val });
  const setPassword = (val) => dispatch({ password: val });
  const setError = (val) => dispatch({ error: val });
  const setLoading = (val) => dispatch({ loading: val });
  const setShowPassword = (val) => dispatch({ showPassword: typeof val === 'function' ? val(loginState.showPassword) : val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = loginAdmin(username, password);
      
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Credenciales incorrectas');
      }
    } catch (_err) {
      setError('Error al iniciar sesión. Intenta de nuevo.' + (_err.message ? ` (${_err.message})` : ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 text-9xl">⚽</div>
        <div className="absolute bottom-20 right-20 text-9xl">🏟️</div>
        <div className="absolute top-1/2 left-1/4 text-7xl">⚽</div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-700 to-blue-800 px-8 py-6 text-center">
            <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Panel Administrativo</h1>
            <p className="text-blue-200 mt-1">Sistema de Reservas de Canchas</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="reservas-username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    👤
                  </span>
                  <input
                    id="reservas-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Ingresa tu usuario"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reservas-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    🔑
                  </span>
                  <input
                    id="reservas-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white transition-colors"
                    placeholder="Ingresa tu contraseña"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-gray-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Iniciar Sesión
                </>
              )}
            </button>

            {/* Demo credentials hint */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                <span className="font-medium">Demo:</span> usuario: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">admin</code> / contraseña: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">admin123</code>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-blue-200 text-sm mt-6">
          © 2024 Sistema de Reservas de Canchas
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
