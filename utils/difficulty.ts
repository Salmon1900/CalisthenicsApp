export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Novice',
  2: 'Beginner',
  3: 'Easy',
  4: 'Moderate',
  5: 'Intermediate',
  6: 'Challenging',
  7: 'Hard',
  8: 'Advanced',
  9: 'Expert',
  10: 'Master',
};

export function getDifficultyLabel(n: number): string {
  return DIFFICULTY_LABELS[n] ?? 'Unknown';
}

export function getDifficultyColor(n: number): string {
  const hue = Math.round(120 - ((n - 1) / 9) * 120);
  return `hsl(${hue}, 80%, 50%)`;
}

export function getDifficultyColorAlpha(n: number, alpha: number): string {
  const hue = Math.round(120 - ((n - 1) / 9) * 120);
  return `hsla(${hue}, 80%, 50%, ${alpha})`;
}
