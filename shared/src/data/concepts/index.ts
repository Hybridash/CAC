import type { Concept } from '../../types';
import { biochem } from './biochem';
import { biochemLibrary } from './biochem-library';
import { cell_ } from './cell';
import { cellLibrary } from './cell-library';
import { ecology } from './ecology';
import { evolution } from './evolution';
import { genetics } from './genetics';
import { geneticsLibrary } from './genetics-library';
import { immunology } from './immunology';
import { immunologyLibrary } from './immunology-library';
import { microbes } from './microbes';
import { neuro } from './neuro';
import { neuroLibrary } from './neuro-library';
import { physiology } from './physiology';
import { physiologyLibrary } from './physiology-library';

/** Every concept in the library, assembled from the per-category data files. */
export const CONCEPTS: Concept[] = [
  ...cell_,
  ...cellLibrary,
  ...genetics,
  ...geneticsLibrary,
  ...biochem,
  ...biochemLibrary,
  ...physiology,
  ...physiologyLibrary,
  ...neuro,
  ...neuroLibrary,
  ...immunology,
  ...immunologyLibrary,
  ...microbes,
  ...evolution,
  ...ecology,
];

export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(
  CONCEPTS.map((c) => [c.id, c]),
);
