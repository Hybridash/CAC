/**
 * Every lesson a player can open. Library concepts get their upgrades applied here (fuller steps,
 * extra Go Deeper, diagrams); High School lessons are added alongside them.
 */
import type { Concept } from '../types';
import { CONCEPTS } from './concepts';
import { HS_LESSONS, hsId } from './highschool';
import { LIBRARY_UPGRADES } from './library';

const HS_BY_ID: Record<string, Concept> = Object.fromEntries(HS_LESSONS.map((l) => [l.id, l]));

/** A library concept with its upgrade applied. Without its own diagrams, it borrows the High School one. */
function upgraded(c: Concept): Concept {
  const up = LIBRARY_UPGRADES[c.id];
  const hsDiagram = HS_BY_ID[hsId(c.id)]?.highSchool?.diagrams[0];
  const diagrams = up?.diagrams ?? (hsDiagram ? [hsDiagram] : undefined);
  if (!up) return diagrams ? { ...c, diagrams } : c;
  return {
    ...c,
    steps: up.steps.map(([title, text]) => ({ title, text })),
    goDeeper: `${c.goDeeper}\n\n${up.goDeeperMore}`,
    diagrams,
  };
}

/** Library concepts as players see them (same ids and order as CONCEPTS). */
export const LIBRARY_LESSONS: Concept[] = CONCEPTS.map(upgraded);

/** Any lesson a player can open: library concepts and High School lessons. */
export const LESSON_BY_ID: Record<string, Concept> = {
  ...Object.fromEntries(LIBRARY_LESSONS.map((l) => [l.id, l])),
  ...HS_BY_ID,
};
