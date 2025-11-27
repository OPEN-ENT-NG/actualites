/**
 * Génère une date future (postérieure à aujourd'hui)
 * @param daysAhead Nombre de jours dans le futur (par défaut: 2)
 * @returns Date au format ISO string
 */
export const getFutureDate = (daysAhead: number = 2): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().slice(0, -1); // Retire le 'Z' final pour correspondre au format existant
};
