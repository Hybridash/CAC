export type Clock = () => Date;

export const systemClock: Clock = () => new Date();

/** UTC calendar day, e.g. "2026-10-07". Streaks and daily features use UTC days. */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}
