import type { Concept } from '../../types';

/** Every concept in the library, assembled from the per-category data files. */
export const CONCEPTS: Concept[] = [];

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);
