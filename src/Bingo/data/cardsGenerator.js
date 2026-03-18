// Script para generar cartones de Bingo
export function generateBingoCard() {
  const card = [];
  const ranges = [
    [1, 15],   // B
    [16, 30],  // I
    [31, 45],  // N
    [46, 60],  // G
    [61, 75]   // O
  ];

  // Array para guardar números usados por columna para evitar duplicados
  const usedNumbers = [[], [], [], [], []];

  for (let row = 0; row < 5; row++) {
    const cardRow = [];
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        // Centro libre
        cardRow.push('FREE');
      } else {
        const [min, max] = ranges[col];
        let num;
        do {
          num = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (usedNumbers[col].includes(num));
        usedNumbers[col].push(num);
        cardRow.push(num);
      }
    }
    card.push(cardRow);
  }
  return card;
}

// Generar función que retorna los cartones
export const generateBingoCards = () => {
  const cards = [];
  for (let i = 1; i <= 1200; i++) {
    cards.push({
      id: i,
      card: generateBingoCard()
    });
  }
  return cards;
};