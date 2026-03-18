/**
 * Builds a flat 25-element boolean array from a 5x5 bingo card and the called numbers.
 * Each position in the array corresponds to a cell in row-major order (row * 5 + col).
 * The FREE center cell (row 2, col 2 → index 12) is always true.
 *
 * @param {Array<Array<number|string>>} card - 5x5 card array
 * @param {number[]} calledNumbers - numbers that have been called
 * @returns {boolean[]} 25-element boolean grid
 */
function buildCardGrid(card, calledNumbers) {
  const grid = new Array(25);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = card[row][col];
      grid[row * 5 + col] = cell === 'FREE' || calledNumbers.includes(cell);
    }
  }
  return grid;
}

/**
 * Returns true if the card satisfies the given named pattern with the called numbers.
 *
 * @param {Array<Array<number|string>>} card - 5x5 card array
 * @param {number[]} calledNumbers - numbers that have been called
 * @param {string} pattern - pattern type (e.g. 'line', 'diagonal', 'fullCard', …)
 * @param {boolean[]|null} [customPattern] - required for 'custom' pattern
 * @returns {boolean}
 */
export function checkCardPattern(card, calledNumbers, pattern, customPattern = null) {
  const g = buildCardGrid(card, calledNumbers);

  switch (pattern) {
    case 'horizontalLine1': return g.slice(0, 5).every(Boolean);
    case 'horizontalLine2': return g.slice(5, 10).every(Boolean);
    case 'horizontalLine3': return g.slice(10, 15).every(Boolean);
    case 'horizontalLine4': return g.slice(15, 20).every(Boolean);
    case 'horizontalLine5': return g.slice(20, 25).every(Boolean);

    case 'letterI1': return [0, 5, 10, 15, 20].every(i => g[i]);
    case 'letterI2': return [1, 6, 11, 16, 21].every(i => g[i]);
    case 'letterI3': return [2, 7, 12, 17, 22].every(i => g[i]);
    case 'letterI4': return [3, 8, 13, 18, 23].every(i => g[i]);
    case 'letterI5': return [4, 9, 14, 19, 24].every(i => g[i]);

    case 'line': {
      for (let i = 0; i < 5; i++) {
        if (g.slice(i * 5, i * 5 + 5).every(Boolean)) return true;
        if ([0, 1, 2, 3, 4].every(r => g[r * 5 + i])) return true;
      }
      return false;
    }

    case 'diagonal':
      return [0, 6, 12, 18, 24].every(i => g[i]) || [4, 8, 12, 16, 20].every(i => g[i]);

    case 'fourCorners':
      return g[0] && g[4] && g[20] && g[24];

    case 'letterX':
      return [0, 6, 12, 18, 24].every(i => g[i]) && [4, 8, 12, 16, 20].every(i => g[i]);

    case 'letterT':
      return g.slice(0, 5).every(Boolean) && [2, 7, 12, 17, 22].every(i => g[i]);

    case 'letterL':
      return [0, 5, 10, 15, 20].every(i => g[i]) && g.slice(20, 25).every(Boolean);

    case 'cross':
      return g.slice(10, 15).every(Boolean) && [2, 7, 12, 17, 22].every(i => g[i]);

    case 'fullCard':
      return g.every(Boolean);

    case 'custom':
      if (!customPattern) return false;
      return customPattern.every((required, index) => !required || g[index]);

    default:
      return false;
  }
}

/**
 * Checks if a card has any standard winning pattern (row, column, or diagonal).
 * Returns an object describing the first matched pattern, or null if no win.
 *
 * @param {Array<Array<number|string>>} card - 5x5 card array
 * @param {number[]} calledNumbers - numbers that have been called
 * @returns {{ type: string, position: number|string }|null}
 */
export function checkBingo(card, calledNumbers) {
  const g = buildCardGrid(card, calledNumbers);

  for (let row = 0; row < 5; row++) {
    if (g.slice(row * 5, row * 5 + 5).every(Boolean)) {
      return { type: 'row', position: row };
    }
  }

  for (let col = 0; col < 5; col++) {
    if ([0, 1, 2, 3, 4].every(r => g[r * 5 + col])) {
      return { type: 'column', position: col };
    }
  }

  if ([0, 6, 12, 18, 24].every(i => g[i])) return { type: 'diagonal', position: 'main' };
  if ([4, 8, 12, 16, 20].every(i => g[i])) return { type: 'diagonal', position: 'anti' };

  return null;
}
