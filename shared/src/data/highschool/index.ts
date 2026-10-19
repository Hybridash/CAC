import type { Concept, HsUnitId } from '../../types';
import { HS_UNITS, hsId } from './build';
import { body } from './body';
import { cells } from './cells';
import { chemistry } from './chemistry';
import { division } from './division';
import { dna } from './dna';
import { ecology } from './ecology';
import { energy } from './energy';
import { evolution } from './evolution';
import { heredity } from './heredity';

const lessons: Concept[] = [
  ...chemistry,
  ...cells,
  ...energy,
  ...division,
  ...dna,
  ...heredity,
  ...evolution,
  ...ecology,
  ...body,
];

// Related lessons: the simpler library version first, then up to three neighbors in the same unit.
for (const l of lessons) {
  const { unit, baseId } = l.highSchool!;
  const neighbors = lessons.filter((x) => x.highSchool!.unit === unit && x.id !== l.id);
  l.relatedConcepts = [baseId, ...neighbors.slice(0, 3).map((x) => x.id)];
}

/** Every High School lesson, in unit order. Kept separate from the library's CONCEPTS. */
export const HS_LESSONS: Concept[] = HS_UNITS.flatMap((u) =>
  lessons.filter((l) => l.highSchool!.unit === u.id),
);

export const HS_UNIT_BY_ID = Object.fromEntries(HS_UNITS.map((u) => [u.id, u])) as Record<
  HsUnitId,
  (typeof HS_UNITS)[number]
>;

export const hsLessonsIn = (unit: HsUnitId) =>
  HS_LESSONS.filter((l) => l.highSchool!.unit === unit);

export { HS_UNITS, hsId };
