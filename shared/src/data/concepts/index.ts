import type { Concept } from '../../types';
import { biochem } from './biochem';
import { cell_ } from './cell';
import { ecology } from './ecology';
import { genetics } from './genetics';
import { immunology } from './immunology';
import { microbes } from './microbes';
import { neuro } from './neuro';
import { physiology } from './physiology';

/** Every concept in the library, assembled from the per-category data files. */
export const CONCEPTS: Concept[] = [
  ...cell_,
  ...genetics,
  ...biochem,
  ...physiology,
  ...neuro,
  ...immunology,
  ...microbes,
  ...ecology,
];

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);
