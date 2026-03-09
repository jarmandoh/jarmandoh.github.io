import React, { useReducer, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faSearch, 
  faPlus, 
  faEdit, 
  faTrash, 
  faTrophy,
  faCheck,
  faTimes,
  faEye,
  faChartBar,
  faSignOutAlt,
  faGamepad,
  faPlay,
  faStop,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { useBingoAdmin } from '../hooks/useBingoAdmin';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useGameManager } from '../hooks/useGameManager';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentStats from '../components/AssignmentStats';
import GestorPasswordManager from '../components/GestorPasswordManager';
import GameCreationModal from '../components/GameCreationModal';
import { SocketProvider } from '../context/SocketContext';
import { useSocket } from '../hooks/useSocket';

const searchInitialState = { searchTerm: '', searchType: 'all', currentPage: 1 };
const adminUiInitialState = { showForm: false, editingAssignment: null, viewMode: 'games', showGameForm: false, showPasswordManager: false };
const ITEMS_PER_PAGE = 20;
function mergeReducer(state, patch) {
  return { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
}

const BingoAdminGamesSection = ({ games, currentGame, onStartGame, onFinishGame, onDeleteGame, onSelectGame, onShowGameForm }) => (
  <>
    {currentGame && (
      <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Juego Activo: {currentGame.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>ID: {currentGame.id}</span>
              <span className={`px-3 py-1 rounded-full ${
                currentGame.status === 'active' ? 'bg-green-200 text-green-800' :
                currentGame.status === 'waiting' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
              }`}>
                {currentGame.status === 'active' ? 'Activo' :
                 currentGame.status === 'waiting' ? 'En Espera' : 'Finalizado'}
              </span>
              <span>Números cantados: {currentGame.calledNumbers?.length || 0}/75</span>
            </div>
          </div>
          <div className="flex gap-2">
            {currentGame.status === 'waiting' && (
              <button onClick={() => onStartGame(currentGame.id)} className="bg-green-200 hover:bg-green-300 text-green-800 px-4 py-2 rounded-lg transition-colors">
                <FontAwesomeIcon icon={faPlay} className="mr-2" />Iniciar
              </button>
            )}
            {currentGame.status === 'active' && (
              <button onClick={() => onFinishGame(currentGame.id)} className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-lg transition-colors">
                <FontAwesomeIcon icon={faStop} className="mr-2" />Finalizar
              </button>
            )}
          </div>
        </div>
        {currentGame.status === 'active' && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <FontAwesomeIcon icon={faGamepad} className="mr-2" />
              El sorteo de números está disponible en la sección del <strong>Gestor de Sorteos</strong>
            </p>
          </div>
        )}
      </div>
    )}
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800">Todos los Juegos ({games.length})</h2>
      </div>
      {games.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['ID','Nombre','Estado','Creado','Números','Patrones','Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {games.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{game.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{game.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      game.status === 'active' ? 'bg-green-200 text-green-800' :
                      game.status === 'waiting' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'
                    }`}>
                      {game.status === 'active' ? 'Activo' : game.status === 'waiting' ? 'En Espera' : 'Finalizado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(game.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.calledNumbers?.length || 0}/75</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {game.settings?.winPatterns?.slice(0, 3).map(pattern => (
                        <span key={pattern} className="inline-flex px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">
                          {pattern === 'line' ? 'Línea' : pattern === 'diagonal' ? 'Diagonal' : pattern === 'fourCorners' ? 'Esquinas' : pattern === 'letterX' ? 'X' : pattern === 'letterT' ? 'T' : pattern === 'letterL' ? 'L' : pattern === 'cross' ? 'Cruz' : pattern === 'fullCard' ? 'Completo' : pattern}
                        </span>
                      ))}
                      {game.settings?.customPattern && <span className="inline-flex px-2 py-1 text-xs bg-purple-200 text-purple-800 rounded">Personalizado</span>}
                      {game.settings?.winPatterns?.length > 3 && <span className="text-xs text-gray-400">+{game.settings.winPatterns.length - 3} más</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      {game.status === 'waiting' && <button onClick={() => onStartGame(game.id)} className="text-green-600 hover:text-green-900" title="Iniciar juego"><FontAwesomeIcon icon={faPlay} /></button>}
                      {game.status === 'active' && <button onClick={() => onFinishGame(game.id)} className="text-red-600 hover:text-red-900" title="Finalizar juego"><FontAwesomeIcon icon={faStop} /></button>}
                      {game.status !== 'active' && <button onClick={() => onDeleteGame(game.id)} className="text-red-600 hover:text-red-900" title="Eliminar juego"><FontAwesomeIcon icon={faTrash} /></button>}
                      <button onClick={() => onSelectGame(game.id)} className="text-blue-600 hover:text-blue-900" title="Seleccionar como juego activo"><FontAwesomeIcon icon={faCog} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">🎮</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay juegos creados</h3>
          <p className="text-gray-500 mb-4">Crea tu primer juego para comenzar</p>
          <button onClick={onShowGameForm} className="bg-green-200 hover:bg-green-300 text-green-800 px-6 py-3 rounded-lg transition-colors">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />Crear Primer Juego
          </button>
        </div>
      )}
    </div>
  </>
);

const BingoAdminAssignmentsSection = ({ currentAssignments, filteredAssignments, viewMode, currentRaffle, updateAssignment, markAsWinner, onEdit, onDelete, startIndex, currentPage, setCurrentPage, itemsPerPage, totalPages }) => (
  <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800">
        {viewMode === 'assignments' ? `Asignaciones - Sorteo ${currentRaffle}` : `Resultados de búsqueda (${filteredAssignments.length})`}
      </h2>
    </div>
    {currentAssignments.length > 0 ? (
      <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['Cartón','Participante','Contacto','Estado','Sorteo','Acciones'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">#{assignment.cardNumber}</div>
                      <Link to={`/bingo/carton/${assignment.cardNumber}`} className="ml-2 text-purple-600 hover:text-purple-800 transition-colors cursor-pointer" title="Ver cartón">
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{assignment.firstName} {assignment.lastName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{assignment.phone}</div>
                    <div className="text-sm text-gray-500">{assignment.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${assignment.paid ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {assignment.paid ? 'Pagado' : 'Pendiente'}
                      </span>
                      {assignment.winner && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-200 text-yellow-800">
                          <FontAwesomeIcon icon={faTrophy} className="mr-1" />Ganador
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{assignment.raffleId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(assignment)} className="text-indigo-600 hover:text-indigo-900 transition-colors cursor-pointer" title="Editar asignación"><FontAwesomeIcon icon={faEdit} /></button>
                      <button onClick={() => updateAssignment(assignment.id, { paid: !assignment.paid })} className={assignment.paid ? "text-yellow-600 hover:text-yellow-900 transition-colors cursor-pointer" : "text-green-600 hover:text-green-900 transition-colors cursor-pointer"} title={assignment.paid ? "Marcar como no pagado" : "Marcar como pagado"}><FontAwesomeIcon icon={assignment.paid ? faTimes : faCheck} /></button>
                      {!assignment.winner && <button onClick={() => markAsWinner(assignment.id)} className="text-yellow-600 hover:text-yellow-900 transition-colors cursor-pointer" title="Marcar como ganador"><FontAwesomeIcon icon={faTrophy} /></button>}
                      <button onClick={() => onDelete(assignment.id)} className="text-red-600 hover:text-red-900 transition-colors cursor-pointer" title="Eliminar asignación"><FontAwesomeIcon icon={faTrash} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredAssignments.length)} de {filteredAssignments.length} asignaciones
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Anterior</button>
              <span className="px-3 py-1">{currentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        )}
      </>
    ) : (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          {viewMode === 'search' ? 'No se encontraron resultados' : 'No hay asignaciones'}
        </h3>
        <p className="text-gray-500">
          {viewMode === 'search' ? 'Intenta con otros términos de búsqueda' : 'Comienza asignando cartones a los participantes'}
        </p>
      </div>
    )}
  </div>
);

const BingoAdminHeader = ({
  timeLeft, viewMode, setViewMode, currentRaffle, setCurrentRaffle,
  searchTerm, handleSearch, searchType, setSearchType,
  onNewAssignment, onShowGameForm, onShowPasswordManager, onLogout
}) => (
  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-6 shadow-lg">
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-4xl font-bold text-gray-700 mb-2">Administrador de Bingo</h1>
        <p className="text-gray-600">Gestiona las asignaciones de cartones y participantes</p>
        {timeLeft.valid && (
          <p className="text-gray-600 text-sm mt-1">
            🕒 Sesión expira en: {timeLeft.hours}h {timeLeft.minutes}m
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onShowPasswordManager}
          className="bg-orange-200 hover:bg-orange-300 text-orange-800 px-4 py-2 rounded-lg transition duration-300 inline-flex items-center"
          title="Gestionar contraseñas de gestores"
        >
          <FontAwesomeIcon icon={faCog} className="mr-2" />
          Gestores
        </button>
        <Link
          to="/bingo"
          className="bg-blue-200 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-300 transition duration-300 inline-flex items-center"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          Juego Principal
        </Link>
        <button
          onClick={onNewAssignment}
          className="bg-green-200 hover:bg-green-300 text-green-800 px-4 py-2 rounded-lg transition duration-300 inline-flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Nueva Asignación
        </button>
        <button
          onClick={onLogout}
          className="bg-red-200 hover:bg-red-300 text-red-800 px-4 py-2 rounded-lg transition duration-300 inline-flex items-center"
          title="Cerrar sesión"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
          Salir
        </button>
      </div>
    </div>

    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('games')}
          className={`px-4 py-2 rounded-lg transition duration-300 ${
            viewMode === 'games' ? 'bg-purple-200 text-purple-800 font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={faGamepad} className="mr-2" />
          Gestión de Juegos
        </button>
        <button
          onClick={() => setViewMode('assignments')}
          className={`px-4 py-2 rounded-lg transition duration-300 ${
            viewMode === 'assignments' ? 'bg-purple-200 text-purple-800 font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={faChartBar} className="mr-2" />
          Asignaciones
        </button>
        <button
          onClick={() => setViewMode('search')}
          className={`px-4 py-2 rounded-lg transition duration-300 ${
            viewMode === 'search' ? 'bg-purple-200 text-purple-800 font-semibold' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FontAwesomeIcon icon={faSearch} className="mr-2" />
          Búsqueda
        </button>
      </div>

      {viewMode === 'assignments' && (
        <div className="flex items-center gap-2">
          <label htmlFor="admin-raffle-select" className="text-white font-medium">Sorteo:</label>
          <select
            id="admin-raffle-select"
            value={currentRaffle}
            onChange={(e) => setCurrentRaffle(Number(e.target.value))}
            className="px-3 py-2 bg-white rounded-lg text-gray-700 border-0 focus:ring-2 focus:ring-purple-200"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Sorteo {i + 1}</option>
            ))}
          </select>
        </div>
      )}

      {viewMode === 'games' && (
        <button
          onClick={onShowGameForm}
          className="bg-green-200 hover:bg-green-300 text-green-800 px-4 py-2 rounded-lg transition duration-300 inline-flex items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Crear Juego
        </button>
      )}
    </div>

    {viewMode === 'search' && (
      <div className="mt-4 flex gap-4">
        <div className="flex-1 relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número de cartón, teléfono, email o nombre..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border-0 focus:ring-2 focus:ring-purple-300 focus:outline-none text-gray-700"
          />
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="px-4 py-3 bg-white rounded-lg text-gray-700 border-0 focus:ring-2 focus:ring-purple-200"
        >
          <option value="all">Todos los campos</option>
          <option value="cardNumber">Número de cartón</option>
          <option value="phone">Teléfono</option>
          <option value="email">Email</option>
          <option value="name">Nombre</option>
        </select>
      </div>
    )}
  </div>
);

const BingoAdmin = () => {
  const { error, clearError } = useSocket();
  const { logout, getTimeUntilExpiry } = useAdminAuth();
  const {
    currentRaffle,
    setCurrentRaffle,
    assignCard,
    updateAssignment,
    removeAssignment,
    markAsWinner,
    searchAssignments,
    isCardAssigned,
    getAssignmentsByRaffle,
    getStats
  } = useBingoAdmin();

  const {
    games,
    currentGame,
    createGame,
    startGame,
    finishGame,
    deleteGame,
    setCurrentGame,
    addCalledNumber,
    setGestorPassword
  } = useGameManager();

  const [searchState, dispatchSearch] = useReducer(mergeReducer, searchInitialState);
  const { searchTerm, searchType, currentPage } = searchState;
  const setSearchTerm = (val) => dispatchSearch({ searchTerm: val });
  const setSearchType = (val) => dispatchSearch({ searchType: val });
  const setCurrentPage = (val) => dispatchSearch({ currentPage: typeof val === 'function' ? val(searchState.currentPage) : val });
  const itemsPerPage = ITEMS_PER_PAGE;

  const [adminUiState, dispatchAdminUI] = useReducer(mergeReducer, adminUiInitialState);
  const { showForm, editingAssignment, viewMode, showGameForm, showPasswordManager } = adminUiState;
  const setShowForm = (val) => dispatchAdminUI({ showForm: val });
  const setEditingAssignment = (val) => dispatchAdminUI({ editingAssignment: typeof val === 'function' ? val(adminUiState.editingAssignment) : val });
  const setViewMode = (val) => dispatchAdminUI({ viewMode: val });
  const setShowGameForm = (val) => dispatchAdminUI({ showGameForm: val });
  const setShowPasswordManager = (val) => dispatchAdminUI({ showPasswordManager: val });

  // Filtrar asignaciones según el modo de vista
  const filteredAssignments = viewMode === 'search' 
    ? searchAssignments(searchTerm, searchType)
    : getAssignmentsByRaffle(currentRaffle);

  // Paginación
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFormSubmit = (formData) => {
    if (editingAssignment) {
      updateAssignment(editingAssignment.id, formData);
      setEditingAssignment(null);
    } else {
      assignCard(formData);
    }
    setShowForm(false);
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta asignación?')) {
      removeAssignment(id);
    }
  };

  const handleCreateGame = (gameData) => {
    createGame(gameData);
    setShowGameForm(false);
  };

  const handleStartGame = (gameId) => {
    startGame(gameId);
    setCurrentGame(gameId);
  };

  const handleFinishGame = (gameId) => {
    if (window.confirm('¿Estás seguro de que quieres finalizar este juego?')) {
      finishGame(gameId);
    }
  };

  const handleDeleteGame = (gameId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este juego permanentemente?')) {
      deleteGame(gameId);
    }
  };

  const stats = getStats();
  const timeLeft = getTimeUntilExpiry();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-linear-to-br from-purple-200 via-pink-100 to-blue-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Error global de socket */}
        {error && (
          <div className="global-error-message">
            <span>{error}</span>
            <button className="btn-close-error" onClick={clearError} title="Cerrar">✖</button>
          </div>
        )}
        {/* Header */}
        <BingoAdminHeader
          timeLeft={timeLeft}
          viewMode={viewMode}
          setViewMode={setViewMode}
          currentRaffle={currentRaffle}
          setCurrentRaffle={setCurrentRaffle}
          searchTerm={searchTerm}
          handleSearch={handleSearch}
          searchType={searchType}
          setSearchType={setSearchType}
          onNewAssignment={() => setShowForm(true)}
          onShowGameForm={() => setShowGameForm(true)}
          onShowPasswordManager={() => setShowPasswordManager(true)}
          onLogout={handleLogout}
        />

        {/* Estadísticas - solo mostrar en modo asignaciones */}
        {viewMode === 'assignments' && (
          <AssignmentStats stats={stats} currentRaffle={currentRaffle} />
        )}

        {/* Gestión de Juegos */}
        {viewMode === 'games' && (
          <BingoAdminGamesSection
            games={games}
            currentGame={currentGame}
            onStartGame={handleStartGame}
            onFinishGame={handleFinishGame}
            onDeleteGame={handleDeleteGame}
            onSelectGame={setCurrentGame}
            onShowGameForm={() => setShowGameForm(true)}
          />
        )}

        {/* Tabla de asignaciones */}
        {(viewMode === 'assignments' || viewMode === 'search') && (
          <BingoAdminAssignmentsSection
            currentAssignments={currentAssignments}
            filteredAssignments={filteredAssignments}
            viewMode={viewMode}
            currentRaffle={currentRaffle}
            updateAssignment={updateAssignment}
            markAsWinner={markAsWinner}
            onEdit={handleEdit}
            onDelete={handleDelete}
            startIndex={startIndex}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalPages={totalPages}
          />
        )}
      </div>

      {/* Modal de formulario para asignaciones */}
      {showForm && (
        <AssignmentForm
          assignment={editingAssignment}
          isCardAssigned={isCardAssigned}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingAssignment(null);
          }}
        />
      )}

      {/* Modal para crear juego */}
      {showGameForm && (
        <GameCreationModal
          onCreateGame={handleCreateGame}
          onClose={() => setShowGameForm(false)}
        />
      )}

      {/* Modal de gestión de contraseñas de gestores */}
      {showPasswordManager && (
        <GestorPasswordManager
          games={games}
          onUpdateGestorPassword={setGestorPassword}
          onClose={() => setShowPasswordManager(false)}
        />
      )}
      </div>
    </SocketProvider>
  );
};

export default BingoAdmin;