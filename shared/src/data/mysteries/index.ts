import type { Mystery } from '../../types';
import { CASES } from './cases';

/** Bio Mysteries: case files that combine several concepts into one puzzle. */
export const MYSTERIES: Mystery[] = CASES;

export const MYSTERY_BY_ID: Record<string, Mystery> = Object.fromEntries(
  MYSTERIES.map((m) => [m.id, m]),
);

/** A mystery unlocks once every required concept is completed. */
export const isMysteryUnlocked = (m: Mystery, completed: (conceptId: string) => boolean) =>
  m.requires.every(completed);
