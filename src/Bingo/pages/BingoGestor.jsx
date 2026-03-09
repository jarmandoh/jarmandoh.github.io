import React from 'react';
import { Link } from 'react-router-dom';
import { useGestorGame } from '../hooks/useGestorGame';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faSignOutAlt, 
  faUser, 
  faGamepad,
  faTrophy,
  faPlay,
  faPause,
  faClock,
  faCheckCircle,
  faPlus,
  faEdit,
  faTrash,
  faTimes,
  faSearch,
  faChartBar,
  faRedo
} from '@fortawesome/free-solid-svg-icons';
import WinnerModal from '../components/WinnerModal';
import NumberDisplay from '../components/NumberDisplay';
import BingoControls from '../components/BingoControls';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentStats from '../components/AssignmentStats';
import GameStats from '../components/GameStats';
import { SocketProvider } from '../context/SocketContext';

const BINGO_COLUMNS = [
  { letter: 'B', start: 1, color: 'green' },
  { letter: 'I', start: 16, color: 'blue' },
  { letter: 'N', start: 31, color: 'red' },
  { letter: 'G', start: 46, color: 'yellow' },
  { letter: 'O', start: 61, color: 'purple' },
];

const GestorBallBoard = ({ calledNumbers }) => (
  <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800">Tablero de Balotas</h2>
      <p className="text-sm text-gray-500 mt-2">{calledNumbers.length} de 75 balotas cantadas</p>
    </div>
    <div className="p-6">
      <div className="grid grid-cols-5 gap-4 mb-4">
        {BINGO_COLUMNS.map(({ letter, color }) => (
          <div key={letter} className={`text-center font-bold text-2xl text-${color}-700`}>{letter}</div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {BINGO_COLUMNS.map(({ letter, start, color }) => (
          <div key={letter} className="space-y-2">
            {Array.from({ length: 15 }, (_, i) => start + i).map((num) => (
              <div
                key={num}
                className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                  calledNumbers.includes(num)
                    ? `bg-${color}-200 text-${color}-800 shadow-md scale-105`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const GestorAssignmentsTable = ({ filteredAssignments, currentRaffle, onEdit, onDelete, onTogglePaid }) => (
  <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800">
        Asignaciones del Sorteo {currentRaffle} ({filteredAssignments.length} total)
      </h2>
      {filteredAssignments.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">No hay asignaciones para este sorteo. Haz clic en "Nueva Asignación" para crear una.</p>
      )}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {['Participante','Cartones','Estado','Fecha','Acciones'].map(h => (
              <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAssignments.length > 0 ? filteredAssignments.map((assignment) => (
            <tr key={assignment.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{assignment.participantName || 'Sin nombre'}</div>
                <div className="text-xs text-gray-500">ID: {assignment.id}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  <div className="font-semibold mb-1">Cartones #{assignment.startCard} - #{assignment.endCard}</div>
                  <div className="text-xs text-gray-600">
                    {assignment.quantity > 1 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.from({ length: Math.min(assignment.quantity, 10) }, (_, i) => (
                          <span key={assignment.startCard + i} className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded">#{assignment.startCard + i}</span>
                        ))}
                        {assignment.quantity > 10 && <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded">+{assignment.quantity - 10} más</span>}
                      </div>
                    ) : (
                      <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-700 rounded">#{assignment.startCard}</span>
                    )}
                    <div className="mt-1 text-gray-500">Total: {assignment.quantity} {assignment.quantity === 1 ? 'cartón' : 'cartones'}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${assignment.paid ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    <FontAwesomeIcon icon={assignment.paid ? faCheckCircle : faTimes} className="mr-1" />
                    {assignment.paid ? 'Pagado' : 'Pendiente'}
                  </span>
                  <button
                    onClick={() => onTogglePaid(assignment.id)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${assignment.paid ? 'bg-red-200 hover:bg-red-300 text-red-800' : 'bg-green-200 hover:bg-green-300 text-green-800'}`}
                    title={assignment.paid ? 'Marcar como pendiente' : 'Marcar como pagado'}
                  >
                    {assignment.paid ? 'Desmarcar' : 'Marcar Pagado'}
                  </button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(assignment.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onClick={() => onEdit(assignment)} className="text-blue-600 hover:text-blue-800 mr-3 transition-colors cursor-pointer" title="Editar asignación"><FontAwesomeIcon icon={faEdit} /></button>
                <button onClick={() => onDelete(assignment.id)} className="text-red-600 hover:text-red-800 transition-colors cursor-pointer" title="Eliminar asignación"><FontAwesomeIcon icon={faTrash} /></button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No hay asignaciones para este sorteo</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const GestorSearchView = ({ searchQuery, setSearchQuery, searchResults, onEdit, onDelete }) => (
  <div className="bg-white rounded-xl shadow-2xl p-6">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Búsqueda de Cartones</h2>
    <div className="space-y-4">
      <div>
        <label htmlFor="gestor-search-query" className="block text-sm font-medium text-gray-700 mb-2">Buscar por nombre de participante:</label>
        <input
          id="gestor-search-query"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Nombre del participante..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-300 focus:border-transparent"
        />
      </div>
      {searchResults.length > 0 && (
        <div className="border border-gray-200 rounded-lg">
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Resultados de búsqueda ({searchResults.length})</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.map((assignment) => (
              <div key={assignment.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{assignment.participantName}</p>
                    <p className="text-sm text-gray-500">Sorteo {assignment.raffleNumber} - Cartones {assignment.startCard} al {assignment.endCard}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(assignment)} className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer" title="Editar asignación"><FontAwesomeIcon icon={faEdit} /></button>
                    <button onClick={() => onDelete(assignment.id)} className="text-red-600 hover:text-red-800 transition-colors cursor-pointer" title="Eliminar asignación"><FontAwesomeIcon icon={faTrash} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

const GestorWinnersAlert = ({ autoDetectedWinners, onDismiss, onConfirmWinner }) => (
  <div className="fixed top-20 right-4 z-50 bg-green-400 border-4 border-green-600 rounded-xl p-6 shadow-2xl max-w-md animate-pulse">
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FontAwesomeIcon icon={faTrophy} className="text-5xl text-green-800" />
          <div>
            <h3 className="text-2xl font-bold text-green-900">¡Posibles Ganadores!</h3>
            <p className="text-green-800 text-sm">Se detectaron {autoDetectedWinners.length} cartón(es) ganador(es)</p>
          </div>
        </div>
        <button onClick={onDismiss} className="text-green-800 hover:text-green-900 text-xl">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div className="max-h-64 overflow-y-auto bg-white/50 rounded-lg p-3 space-y-2">
        {autoDetectedWinners.map((winner) => (
          <div key={`${winner.assignmentId}-${winner.cardNumber}`} className="bg-white rounded-lg p-3 border-2 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-green-900">{winner.participantName}</p>
                <p className="text-sm text-green-700">Cartón #{winner.cardNumber}</p>
                <p className="text-xs text-green-600">Patrón: {winner.pattern}</p>
              </div>
              <button
                onClick={() => onConfirmWinner(`${winner.assignmentId}-${winner.cardNumber}`, winner.assignmentId)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const GestorWinnerNotification = ({ winnerInfo, onDismiss }) => (
  <div className="fixed top-4 right-4 z-50 bg-yellow-400 border-4 border-yellow-600 rounded-xl p-6 shadow-2xl animate-bounce max-w-md">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-4">
        <FontAwesomeIcon icon={faTrophy} className="text-6xl text-yellow-800" />
        <div>
          <h3 className="text-2xl font-bold text-yellow-900 mb-2">¡BINGO!</h3>
          <p className="text-yellow-800 font-semibold">{winnerInfo.playerName}</p>
          <p className="text-yellow-700 text-sm">Cartón #{winnerInfo.cardNumber}</p>
          <p className="text-yellow-700 text-sm">Patrón: {winnerInfo.pattern}</p>
        </div>
      </div>
      <button onClick={onDismiss} className="text-yellow-800 hover:text-yellow-900 text-xl">
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  </div>
);

const GestorHeader = ({ currentGame, currentRaffle, gestor, timeLeft, raffleConfig, onConfigureRaffle, onLogout }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
    <div className="flex justify-between items-center">
      <div className="flex-1">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-700">
            Gestor de Sorteos - {currentGame.name}
          </h1>
        </div>
        {currentGame.raffleSettings?.[currentRaffle] && (
          <div className="mb-2 flex items-center gap-4 text-sm">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
              Patrón: {raffleConfig.winPattern || currentGame.raffleSettings[currentRaffle].winPattern}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
              Premio: {currentGame.raffleSettings[currentRaffle].prize}
            </span>
          </div>
        )}
        <div className="flex items-center space-x-4 text-gray-600">
          <span className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            {gestor.name}
          </span>
          <span className="flex items-center">
            <FontAwesomeIcon icon={faGamepad} className="mr-2" />
            Juego ID: {gestor.gameId}
          </span>
          <span className={`flex items-center px-3 py-1 rounded-full text-sm ${
            currentGame.status === 'active'
              ? 'bg-green-200 text-green-800'
              : 'bg-yellow-200 text-yellow-800'
          }`}>
            {currentGame.status === 'active' ? 'Activo' : 'En Pausa'}
          </span>
          {timeLeft.valid && (
            <span className="flex items-center text-sm">
              <FontAwesomeIcon icon={faClock} className="mr-1" />
              {timeLeft.hours}h {timeLeft.minutes}m
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onConfigureRaffle}
          className={`px-4 py-2 rounded-lg transition-colors inline-flex items-center ${
            currentGame.raffleSettings?.[currentRaffle]?.winPattern
              ? 'bg-green-200 hover:bg-green-300 text-green-800'
              : 'bg-yellow-200 hover:bg-yellow-300 text-yellow-800 animate-pulse'
          }`}
        >
          <FontAwesomeIcon icon={faTrophy} className="mr-2" />
          {currentGame.raffleSettings?.[currentRaffle]?.winPattern
            ? 'Configuración del Sorteo'
            : '⚠️ Configurar Sorteo'}
        </button>
        <Link
          to="/bingo"
          className="bg-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-300 transition duration-300 inline-flex items-center"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          Inicio
        </Link>
        <button
          onClick={onLogout}
          className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-lg transition duration-300 inline-flex items-center"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Salir
        </button>
      </div>
    </div>
  </div>
);

const GestorViewControls = ({ viewMode, setViewMode, currentRaffle, isCardLimitReached, maxCards, onNewAssignment, onTestAssignment }) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
    <div className="flex gap-4 items-center justify-between">
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('game')}
          className={`px-4 py-2 rounded-lg transition duration-300 ${
            viewMode === 'game'
              ? 'bg-purple-200 text-purple-800 font-semibold'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={faGamepad} className="mr-2" />
          Control del Juego
        </button>
        <button
          onClick={() => setViewMode('assignments')}
          className={`px-4 py-2 rounded-lg transition duration-300 ${
            viewMode === 'assignments'
              ? 'bg-purple-200 text-purple-800 font-semibold'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={faChartBar} className="mr-2" />
          Gestión de Cartones
        </button>
        <button
          onClick={() => setViewMode('search')}
          className={`px-4 py-2 rounded-lg transition duration-300 ${
            viewMode === 'search'
              ? 'bg-purple-200 text-purple-800 font-semibold'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={faSearch} className="mr-2" />
          Búsqueda
        </button>
      </div>
      {viewMode === 'assignments' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Sorteo Actual:</span>
            <span className="px-3 py-2 bg-purple-200 text-purple-800 rounded-lg font-semibold">
              Sorteo {currentRaffle}
            </span>
          </div>
          <button
            onClick={onNewAssignment}
            className={`px-4 py-2 rounded-lg transition duration-300 inline-flex items-center ${
              isCardLimitReached
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-300 hover:bg-blue-400 text-blue-800'
            }`}
            disabled={isCardLimitReached}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nueva Asignación
          </button>
          <button
            onClick={onTestAssignment}
            disabled={isCardLimitReached}
            className={`px-4 py-2 rounded-lg transition duration-300 inline-flex items-center ${
              isCardLimitReached
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-300 hover:bg-blue-400 text-blue-800'
            }`}
            title={isCardLimitReached ? `Límite de cartones alcanzado (${maxCards})` : 'Crear asignación de prueba'}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Prueba
          </button>
        </div>
      )}
    </div>
  </div>
);

const GestorInstructions = () => (
  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
    <h3 className="text-xl font-bold text-gray-700 mb-4">Instrucciones para el Gestor</h3>
    <div className="grid md:grid-cols-3 gap-6 text-gray-600">
      <div>
        <h4 className="font-semibold mb-2">Control de Números</h4>
        <ul className="text-sm space-y-1">
          <li>• Usa los controles para cantar números</li>
          <li>• Los números se muestran automáticamente</li>
          <li>• Puedes pausar y reanudar el sorteo</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Gestión de Participantes</h4>
        <ul className="text-sm space-y-1">
          <li>• Ve la lista de todos los participantes</li>
          <li>• Marca ganadores cuando hagan BINGO</li>
          <li>• Revisa el estado de cada cartón</li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Estadísticas</h4>
        <ul className="text-sm space-y-1">
          <li>• Monitorea el progreso del sorteo</li>
          <li>• Ve estadísticas en tiempo real</li>
          <li>• Controla el flujo del juego</li>
        </ul>
      </div>
    </div>
  </div>
);

const GestorGameControls = ({
  currentGame,
  currentRaffle,
  onPause,
  onResume,
  onReset,
  onCallNumber,
  onConfigureRaffle,
}) => (
  <div className="grid md:grid-cols-2 gap-6 mb-6">
    {/* Controles de Números */}
    <div className="bg-white rounded-xl shadow-2xl p-6">
      {currentGame.raffleSettings?.[currentRaffle]?.winPattern && currentGame.raffleSettings?.[currentRaffle]?.prize ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Control del Sorteo</h2>
            <div className="flex gap-2">
              {currentGame.status === 'active' ? (
                <button
                  onClick={onPause}
                  className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faPause} className="mr-2" />
                  Pausar
                </button>
              ) : (
                <button
                  onClick={onResume}
                  className="bg-green-200 hover:bg-green-300 text-green-800 px-4 py-2 rounded-lg transition-colors"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2" />
                  Reanudar
                </button>
              )}
              <button
                onClick={onReset}
                className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-lg transition-colors"
                title="Reiniciar sorteo (borrar números cantados)"
              >
                <FontAwesomeIcon icon={faRedo} className="mr-2" />
                Reiniciar
              </button>
            </div>
          </div>
          {currentGame.status === 'active' && (
            <BingoControls
              onCallNumber={onCallNumber}
              calledNumbers={currentGame.calledNumbers || []}
              currentRaffle={currentRaffle}
              gameId={currentGame.id}
            />
          )}
          {currentGame.status === 'waiting' && (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faPause} className="text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">El sorteo está pausado</p>
              <p className="text-sm text-gray-400">Haz clic en &quot;Reanudar&quot; para continuar</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faTrophy} className="text-6xl text-yellow-400 mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold text-gray-700 mb-3">Configuración Requerida</h3>
          <p className="text-gray-600 mb-2">Debes configurar el patrón de victoria y el premio</p>
          <p className="text-sm text-gray-500 mb-6">antes de poder iniciar el sorteo</p>
          <button
            onClick={onConfigureRaffle}
            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-6 py-3 rounded-lg transition-colors font-semibold inline-flex items-center"
          >
            <FontAwesomeIcon icon={faTrophy} className="mr-2" />
            Configurar Ahora
          </button>
        </div>
      )}
    </div>

    {/* Grilla de Balotas */}
    <GestorBallBoard calledNumbers={currentGame.calledNumbers || []} />
  </div>
);

const GestorAssignmentModal = ({ editingAssignment, assignedCards, onSubmit, onClose, currentRaffle, maxCards }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            {editingAssignment ? 'Editar Asignación' : 'Nueva Asignación'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
      </div>
      <div className="p-6">
        <AssignmentForm
          assignment={editingAssignment}
          isCardAssigned={(cardNumber) => assignedCards.has(cardNumber)}
          onSubmit={onSubmit}
          onClose={onClose}
          currentRaffle={currentRaffle}
          maxCards={maxCards}
        />
      </div>
    </div>
  </div>
);

const BingoGestorContent = () => {
  const {
    gestor, timeLeft, socket, error, clearError,
    currentGame, gameStats, currentRaffle, raffleConfig,
    showRaffleConfigModal, setShowRaffleConfigModal, setRaffleConfig,
    showWinnerNotification, winnerInfo, autoDetectedWinners, showAutoWinnersAlert,
    setShowAutoWinnersAlert, setShowWinnerNotification,
    showForm, editingAssignment, viewMode, searchQuery,
    setShowForm, setEditingAssignment, setViewMode, setSearchQuery,
    assignments, filteredAssignments, searchResults, assignedCards,
    maxCards, isCardLimitReached,
    handleFormSubmit, handleEdit, handleDelete, handleCallNumber,
    handleMarkWinner, handleTogglePaid, handlePauseGame, handleResumeGame,
    handleSaveRaffleConfig, handleResetRaffle, handleLogout, handleTestAssignment,
  } = useGestorGame();

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <FontAwesomeIcon icon={faGamepad} className="text-6xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Juego No Disponible</h2>
          <p className="text-gray-600 mb-6">
            El juego asignado no está disponible o ha sido eliminado.
          </p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg transition-colors"
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-200 via-purple-100 to-pink-200 p-4">
      {/* Error global de socket */}
      {error && (
        <div className="global-error-message">
          <span>{error}</span>
          <button className="btn-close-error" onClick={clearError} title="Cerrar">✖</button>
        </div>
      )}
      {/* Indicador de estado de conexión */}
      {socket && !socket.connected && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-white rounded-full"></span>
            Conexión perdida - Reconectando...
          </div>
        </div>
      )}

      {/* Number Display sticky */}
      <div className="fixed top-4 left-4 z-50">
        <NumberDisplay 
          currentNumber={currentGame?.currentNumber}
          calledNumbers={currentGame?.calledNumbers || []}
        />
      </div>

      {/* Alerta de Ganadores Detectados Automáticamente */}
      {showAutoWinnersAlert && autoDetectedWinners.length > 0 && (
        <GestorWinnersAlert
          autoDetectedWinners={autoDetectedWinners}
          onDismiss={() => setShowAutoWinnersAlert(false)}
          onConfirmWinner={handleMarkWinner}
        />
      )}

      {/* Notificación de Ganador */}
      {showWinnerNotification && winnerInfo && (
        <GestorWinnerNotification
          winnerInfo={winnerInfo}
          onDismiss={() => setShowWinnerNotification(false)}
        />
      )}

      <div className="max-w-7xl mx-auto ml-72">
          {/* Header */}
          <GestorHeader
            currentGame={currentGame}
            currentRaffle={currentRaffle}
            gestor={gestor}
            timeLeft={timeLeft}
            raffleConfig={raffleConfig}
            onConfigureRaffle={() => {
              const raffleSettings = currentGame.raffleSettings?.[currentRaffle];
              setRaffleConfig({
                winPattern: raffleSettings?.winPattern || '',
                prize: raffleSettings?.prize || ''
              });
              setShowRaffleConfigModal(true);
            }}
            onLogout={handleLogout}
          />

          {/* Estadísticas del Juego */}
          <GameStats 
            assignments={assignments}
            gameStats={gameStats}
            currentRaffle={currentRaffle}
            calledNumbers={currentGame.calledNumbers || []}
            maxNumbers={75}
          />

          {/* Controles de vista */}
          <GestorViewControls
            viewMode={viewMode}
            setViewMode={setViewMode}
            currentRaffle={currentRaffle}
            isCardLimitReached={isCardLimitReached}
            maxCards={maxCards}
            onNewAssignment={() => setShowForm(true)}
            onTestAssignment={handleTestAssignment}
          />

          {/* Controles del Juego */}
          {viewMode === 'game' && (
            <GestorGameControls
              currentGame={currentGame}
              currentRaffle={currentRaffle}
              onPause={handlePauseGame}
              onResume={handleResumeGame}
              onReset={handleResetRaffle}
              onCallNumber={handleCallNumber}
              onConfigureRaffle={() => {
                const raffleSettings = currentGame.raffleSettings?.[currentRaffle];
                setRaffleConfig({
                  winPattern: raffleSettings?.winPattern || '',
                  prize: raffleSettings?.prize || ''
                });
                setShowRaffleConfigModal(true);
              }}
            />
          )}

          {/* Vista de Gestión de Asignaciones */}
          {viewMode === 'assignments' && (
            <div className="space-y-6">
              {/* Estadísticas de Asignaciones */}
              <AssignmentStats 
                assignments={filteredAssignments}
                currentRaffle={currentRaffle}
                maxCards={currentGame?.maxPlayers || 1200}
              />

              {/* Lista de Asignaciones */}
              <GestorAssignmentsTable
                filteredAssignments={filteredAssignments}
                currentRaffle={currentRaffle}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePaid={handleTogglePaid}
              />
            </div>
          )}

          {/* Vista de Búsqueda */}
          {viewMode === 'search' && (
            <GestorSearchView
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {/* Modal de Configuración del Sorteo */}
          {showRaffleConfigModal && (
            <GameCreationModal
              raffleConfigMode
              raffleNumber={currentRaffle}
              initialRaffleConfig={raffleConfig}
              onCreateGame={(data) => {
                const config = {
                  winPattern: data.winPatterns?.[0] || '',
                  prize: data.prize || '',
                  prizeImageUrl: data.prizeImageUrl || '',
                };
                setRaffleConfig(config);
                handleSaveRaffleConfig(config);
              }}
              onClose={() => setShowRaffleConfigModal(false)}
            />
          )}

          {/* Formulario de Asignación */}
          {showForm && (
            <GestorAssignmentModal
              editingAssignment={editingAssignment}
              assignedCards={assignedCards}
              onSubmit={handleFormSubmit}
              onClose={() => {
                setShowForm(false);
                setEditingAssignment(null);
              }}
              currentRaffle={currentRaffle}
              maxCards={currentGame?.maxPlayers || 1200}
            />
          )}

        {/* Instrucciones para el Gestor */}
        <GestorInstructions />
      </div>
    </div>
  );
};

const BingoGestor = () => {
  return (
    <SocketProvider>
      <BingoGestorContent />
    </SocketProvider>
  );
};

export default BingoGestor;