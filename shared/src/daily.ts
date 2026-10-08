/** Concept of the Day: deterministic per UTC day so client and server always agree. */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function conceptOfTheDay(day: string, conceptIds: string[]): string {
  const sorted = [...conceptIds].sort();
  return sorted[hash(`bioplay:${day}`) % sorted.length];
}

export const utcDay = (d: Date) => d.toISOString().slice(0, 10);
