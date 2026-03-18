import { useReducer } from 'react';

const gameStateInitial = {
  currentGame: null,
  gameStats: { totalCards: 0, activeCards: 0, winners: 0 },
  showRaffleConfigModal: false,
  raffleConfig: { winPattern: '', prize: '', prizeImageUrl: '' },
};

const winnerStateInitial = {
  showWinnerNotification: false,
  winnerInfo: null,
  autoDetectedWinners: [],
  showAutoWinnersAlert: false,
};

const gestorUiInitial = {
  showForm: false,
  editingAssignment: null,
  viewMode: 'game',
  searchQuery: '',
  showGameForm: false,
};

function mergeReducer(state, patch) {
  return { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
}

/**
 * Encapsulates the three useReducer blocks for useGestorGame state.
 * Keeps state initialization and setters separate from business logic.
 */
export function useGestorGameState() {
  const [gameState, dispatchGame] = useReducer(mergeReducer, gameStateInitial);
  const { currentGame, gameStats, showRaffleConfigModal, raffleConfig } = gameState;
  const setCurrentGame = (val) => dispatchGame({ currentGame: typeof val === 'function' ? val(gameState.currentGame) : val });
  const setGameStats = (val) => dispatchGame({ gameStats: typeof val === 'function' ? val(gameState.gameStats) : val });
  const setShowRaffleConfigModal = (val) => dispatchGame({ showRaffleConfigModal: val });
  const setRaffleConfig = (val) => dispatchGame({ raffleConfig: typeof val === 'function' ? val(gameState.raffleConfig) : val });

  const [winnerState, dispatchWinner] = useReducer(mergeReducer, winnerStateInitial);
  const { showWinnerNotification, winnerInfo, autoDetectedWinners, showAutoWinnersAlert } = winnerState;
  const setShowWinnerNotification = (val) => dispatchWinner({ showWinnerNotification: val });
  const setWinnerInfo = (val) => dispatchWinner({ winnerInfo: typeof val === 'function' ? val(winnerState.winnerInfo) : val });
  const setAutoDetectedWinners = (val) => dispatchWinner({ autoDetectedWinners: typeof val === 'function' ? val(winnerState.autoDetectedWinners) : val });
  const setShowAutoWinnersAlert = (val) => dispatchWinner({ showAutoWinnersAlert: val });

  const [gestorUiState, dispatchGestorUI] = useReducer(mergeReducer, gestorUiInitial);
  const { showForm, editingAssignment, viewMode, searchQuery, showGameForm } = gestorUiState;
  const setShowForm = (val) => dispatchGestorUI({ showForm: val });
  const setEditingAssignment = (val) => dispatchGestorUI({ editingAssignment: typeof val === 'function' ? val(gestorUiState.editingAssignment) : val });
  const setViewMode = (val) => dispatchGestorUI({ viewMode: val });
  const setSearchQuery = (val) => dispatchGestorUI({ searchQuery: val });
  const setShowGameForm = (val) => dispatchGestorUI({ showGameForm: val });

  return {
    // Game state
    currentGame, gameStats, showRaffleConfigModal, raffleConfig,
    setCurrentGame, setGameStats, setShowRaffleConfigModal, setRaffleConfig,
    // Winner state
    showWinnerNotification, winnerInfo, autoDetectedWinners, showAutoWinnersAlert,
    setShowWinnerNotification, setWinnerInfo, setAutoDetectedWinners, setShowAutoWinnersAlert,
    // UI state
    showForm, editingAssignment, viewMode, searchQuery, showGameForm,
    setShowForm, setEditingAssignment, setViewMode, setSearchQuery, setShowGameForm,
  };
}
