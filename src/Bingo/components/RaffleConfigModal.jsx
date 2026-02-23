import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faTrophy,
  faCheck
} from '@fortawesome/free-solid-svg-icons';

const RaffleConfigModal = React.memo(({ onSave, onClose, currentConfig, raffleNumber }) => {
  const [formData, setFormData] = useState({
    winPattern: currentConfig?.winPattern || '',
    prize: currentConfig?.prize || ''
  });

  const predefinedPatterns = [
    { id: 'horizontalLine1', name: 'Línea 1', icon: '━━━━━' },
    { id: 'horizontalLine2', name: 'Línea 2', icon: '━━━━━' },
    { id: 'horizontalLine3', name: 'Línea 3', icon: '━━━━━' },
    { id: 'horizontalLine4', name: 'Línea 4', icon: '━━━━━' },
    { id: 'horizontalLine5', name: 'Línea 5', icon: '━━━━━' },
    { id: 'letterI1', name: 'Columna B', icon: '┃' },
    { id: 'letterI2', name: 'Columna I', icon: '┃' },
    { id: 'letterI3', name: 'Columna N', icon: '┃' },
    { id: 'letterI4', name: 'Columna G', icon: '┃' },
    { id: 'letterI5', name: 'Columna O', icon: '┃' },
    { id: 'diagonal', name: 'Diagonal', icon: '╲ ╱' },
    { id: 'fourCorners', name: '4 Esquinas', icon: '◢◣◥◤' },
    { id: 'letterX', name: 'Letra X', icon: '✕' },
    { id: 'letterT', name: 'Letra T', icon: '⊤' },
    { id: 'letterL', name: 'Letra L', icon: '⌐' },
    { id: 'cross', name: 'Cruz', icon: '✚' },
    { id: 'fullCard', name: 'Cartón Lleno', icon: '▓' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.winPattern) {
      alert('Debes seleccionar un patrón de victoria');
      return;
    }
    if (!formData.prize || formData.prize.trim() === '') {
      alert('Debes ingresar un premio');
      return;
    }

    onSave(formData);
  };

  const getPatternLabel = (patternId) => {
    const labels = {
      'horizontalLine1': 'Línea Horizontal 1',
      'horizontalLine2': 'Línea Horizontal 2',
      'horizontalLine3': 'Línea Horizontal 3',
      'horizontalLine4': 'Línea Horizontal 4',
      'horizontalLine5': 'Línea Horizontal 5',
      'letterI1': 'Columna 1 (B)',
      'letterI2': 'Columna 2 (I)',
      'letterI3': 'Columna 3 (N)',
      'letterI4': 'Columna 4 (G)',
      'letterI5': 'Columna 5 (O)',
      'diagonal': 'Diagonal',
      'fourCorners': '4 Esquinas',
      'letterX': 'Letra X',
      'letterT': 'Letra T',
      'letterL': 'Letra L',
      'cross': 'Cruz',
      'fullCard': 'Cartón Lleno'
    };
    return labels[patternId] || patternId;
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Configurar Sorteo {raffleNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Configura el patrón de victoria y el premio antes de iniciar el sorteo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selección de Patrón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Patrón de Victoria *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {predefinedPatterns.map((pattern) => (
                <button
                  key={pattern.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, winPattern: pattern.id })}
                  className={`p-4 rounded-lg border-2 transition-all text-left relative ${
                    formData.winPattern === pattern.id
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                  }`}
                >
                  {formData.winPattern === pattern.id && (
                    <div className="absolute top-2 right-2">
                      <FontAwesomeIcon icon={faCheck} className="text-purple-600" />
                    </div>
                  )}
                  <div className="text-2xl text-center mb-2">{pattern.icon}</div>
                  <div className="text-sm font-medium text-gray-800 text-center">{pattern.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Premio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Premio *
            </label>
            <input
              type="text"
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              placeholder="Ej: $100,000 o TV 50 pulgadas"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
            />
          </div>

          {/* Vista previa */}
          {formData.winPattern && formData.prize && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                Vista Previa:
              </h4>
              <p className="text-purple-800">
                <span className="font-medium">Patrón:</span> {getPatternLabel(formData.winPattern)}
              </p>
              <p className="text-purple-800">
                <span className="font-medium">Premio:</span> {formData.prize}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Guardar Configuración
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaffleConfigModal;
