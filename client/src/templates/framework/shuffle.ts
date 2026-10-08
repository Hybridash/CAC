/** Fisher–Yates shuffle that never returns the input order (when there are 2+ items). */
export function shuffled<T>(items: T[], rng = Math.random): T[] {
  if (items.length < 2) return [...items];
  for (let attempt = 0; attempt < 10; attempt++) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.some((x, i) => x !== items[i])) return a;
  }
  return [...items.slice(1), items[0]];
}
