/**
 * Returns the BINGO column letter for a given bingo number (1–75).
 * B: 1-15 | I: 16-30 | N: 31-45 | G: 46-60 | O: 61-75
 *
 * @param {number} num
 * @returns {string}
 */
export function getColumnLetter(num) {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  return '';
}

/**
 * Returns the Tailwind CSS background-color class for a given bingo number (1–75).
 *
 * @param {number} num
 * @returns {string}
 */
export function getColumnColor(num) {
  if (num >= 1 && num <= 15) return 'bg-green-500';
  if (num >= 16 && num <= 30) return 'bg-blue-500';
  if (num >= 31 && num <= 45) return 'bg-red-500';
  if (num >= 46 && num <= 60) return 'bg-yellow-500';
  return 'bg-purple-500';
}
