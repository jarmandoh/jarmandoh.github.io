import { renderHook, act } from '@testing-library/react';
import { useGameManager } from '../hooks/useGameManager';

const STORAGE_KEY = 'bingoGames';

beforeEach(() => {
  localStorage.clear();
});

describe('useGameManager', () => {
  it('inicia con lista de juegos vacía y sin juego activo', () => {
    const { result } = renderHook(() => useGameManager());
    expect(result.current.games).toEqual([]);
    expect(result.current.activeGame).toBeNull();
  });

  it('carga los juegos almacenados en localStorage al montar', () => {
    const stored = [
      { id: 'g1', name: 'Guardado', status: 'waiting', calledNumbers: [] },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useGameManager());
    expect(result.current.games).toEqual(stored);
  });

  it('maneja JSON corrupto en localStorage sin lanzar error', () => {
    localStorage.setItem(STORAGE_KEY, '{{{invalid json');

    const { result } = renderHook(() => useGameManager());

    expect(result.current.games).toEqual([]);
    // La clave corrupta debe haber sido eliminada
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('createGame añade un juego con los campos esperados', () => {
    const { result } = renderHook(() => useGameManager());

    let game;
    act(() => {
      game = result.current.createGame({ name: 'Bingo Navidad' });
    });

    expect(result.current.games).toHaveLength(1);
    expect(game.name).toBe('Bingo Navidad');
    expect(game.status).toBe('waiting');
    expect(game.calledNumbers).toEqual([]);
    expect(game.id).toMatch(/^game_/);
  });

  it('createGame persiste el nuevo juego en localStorage', () => {
    const { result } = renderHook(() => useGameManager());

    act(() => {
      result.current.createGame({ name: 'Persistencia' });
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Persistencia');
  });

  it('deleteGame elimina el juego correspondiente por id', () => {
    const { result } = renderHook(() => useGameManager());

    let gameId;
    act(() => {
      const g = result.current.createGame({ name: 'Para Borrar' });
      gameId = g.id;
    });

    expect(result.current.games).toHaveLength(1);

    act(() => {
      result.current.deleteGame(gameId);
    });

    expect(result.current.games).toHaveLength(0);
  });

  it('getGameById retorna undefined para un id inexistente', () => {
    const { result } = renderHook(() => useGameManager());
    expect(result.current.getGameById('no-existe')).toBeUndefined();
  });
});
