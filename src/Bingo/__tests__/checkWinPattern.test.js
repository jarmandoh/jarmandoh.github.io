import { checkBingo, checkCardPattern } from '../utils/checkWinPattern';

/*
  Tarjeta de prueba (5x5):
  Col:  B   I   N   G   O
  row0: 1   16  31  46  61
  row1: 2   17  32  47  62
  row2: 3   18  FREE 48  63
  row3: 4   19  33  49  64
  row4: 5   20  34  50  65
*/
const card = [
  [1,  16, 31,     46, 61],
  [2,  17, 32,     47, 62],
  [3,  18, 'FREE', 48, 63],
  [4,  19, 33,     49, 64],
  [5,  20, 34,     50, 65],
];

// ─── checkBingo ─────────────────────────────────────────────────────────────

describe('checkBingo', () => {
  it('detecta ganador en fila 0 (B-I-N-G-O completa)', () => {
    expect(checkBingo(card, [1, 16, 31, 46, 61])).toEqual({ type: 'row', position: 0 });
  });

  it('detecta ganador en fila 2 (incluye la celda FREE)', () => {
    // FREE siempre está marcado, así que no hace falta incluirlo
    expect(checkBingo(card, [3, 18, 48, 63])).toEqual({ type: 'row', position: 2 });
  });

  it('detecta ganador en columna 0 (toda la columna B)', () => {
    expect(checkBingo(card, [1, 2, 3, 4, 5])).toEqual({ type: 'column', position: 0 });
  });

  it('detecta ganador en diagonal principal', () => {
    // índices: [0][0]=1, [1][1]=17, [2][2]=FREE, [3][3]=49, [4][4]=65
    expect(checkBingo(card, [1, 17, 49, 65])).toEqual({ type: 'diagonal', position: 'main' });
  });

  it('detecta ganador en diagonal secundaria', () => {
    // índices: [0][4]=61, [1][3]=47, [2][2]=FREE, [3][1]=19, [4][0]=5
    expect(checkBingo(card, [61, 47, 19, 5])).toEqual({ type: 'diagonal', position: 'anti' });
  });

  it('retorna null cuando no hay combinación ganadora', () => {
    expect(checkBingo(card, [1, 2, 16])).toBeNull();
  });

  it('retorna null con lista de números vacía', () => {
    expect(checkBingo(card, [])).toBeNull();
  });
});

// ─── checkCardPattern ────────────────────────────────────────────────────────

describe('checkCardPattern', () => {
  // --- line ---
  it('detecta patrón "line" por fila completa', () => {
    expect(checkCardPattern(card, [1, 16, 31, 46, 61], 'line')).toBe(true);
  });

  it('detecta patrón "line" por columna completa', () => {
    expect(checkCardPattern(card, [1, 2, 3, 4, 5], 'line')).toBe(true);
  });

  it('no detecta "line" si ninguna fila o columna está completa', () => {
    expect(checkCardPattern(card, [1, 2, 16], 'line')).toBe(false);
  });

  // --- diagonal ---
  it('detecta patrón "diagonal" por diagonal principal', () => {
    expect(checkCardPattern(card, [1, 17, 49, 65], 'diagonal')).toBe(true);
  });

  it('detecta patrón "diagonal" por diagonal secundaria', () => {
    expect(checkCardPattern(card, [61, 47, 19, 5], 'diagonal')).toBe(true);
  });

  // --- fourCorners ---
  it('detecta patrón "fourCorners" con las cuatro esquinas marcadas', () => {
    // esquinas: [0][0]=1, [0][4]=61, [4][0]=5, [4][4]=65
    expect(checkCardPattern(card, [1, 61, 5, 65], 'fourCorners')).toBe(true);
  });

  it('no detecta "fourCorners" si falta alguna esquina', () => {
    expect(checkCardPattern(card, [1, 61, 5], 'fourCorners')).toBe(false);
  });

  // --- horizontalLine1 (fila 0) ---
  it('detecta patrón "horizontalLine1" con la fila 0 completa', () => {
    expect(checkCardPattern(card, [1, 16, 31, 46, 61], 'horizontalLine1')).toBe(true);
  });

  it('no detecta "horizontalLine1" si la fila 0 está incompleta', () => {
    expect(checkCardPattern(card, [1, 16, 46, 61], 'horizontalLine1')).toBe(false);
  });

  // --- letterI3 (columna del centro) ---
  it('detecta patrón "letterI3": el FREE central siempre está marcado', () => {
    // col 2 = [31, 32, FREE, 33, 34] — FREE gratis, solo necesitamos los otros 4
    expect(checkCardPattern(card, [31, 32, 33, 34], 'letterI3')).toBe(true);
  });

  // --- fullCard ---
  it('detecta patrón "fullCard" con todos los números marcados', () => {
    const allNums = card.flat().filter(n => n !== 'FREE');
    expect(checkCardPattern(card, allNums, 'fullCard')).toBe(true);
  });

  it('no detecta "fullCard" si falta un número', () => {
    const allNums = card.flat().filter(n => n !== 'FREE').slice(0, -1);
    expect(checkCardPattern(card, allNums, 'fullCard')).toBe(false);
  });

  // --- patrón desconocido ---
  it('retorna false para un patrón desconocido', () => {
    expect(checkCardPattern(card, [1, 2, 3], 'unknown')).toBe(false);
  });
});
