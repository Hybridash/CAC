import type { Concept } from '../../types';
import { physiology } from './physiology';

/** Every concept in the library, assembled from the per-category data files. */
export const CONCEPTS: Concept[] = [...physiology];

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);
