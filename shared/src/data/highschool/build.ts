/**
 * Builders for High School lessons. Each one deepens a library concept: it keeps that concept's
 * interaction (so the lesson plays the same way) and swaps in high-school-level steps, labeled
 * diagrams, key terms, Go Deeper text and a harder quiz.
 */
import type {
  Concept,
  Diagram,
  DiagramPart,
  DiagramShape,
  DiagramStyle,
  HsUnit,
  HsUnitId,
  QuizQuestion,
} from '../../types';
import { CONCEPT_BY_ID } from '../concepts';

export const HS_UNITS: HsUnit[] = [
  {
    id: 'chemistry',
    name: 'Chemistry of Life',
    blurb: 'Enzymes, pH, proteins and ATP: the molecules every cell runs on.',
    category: 'biochem',
  },
  {
    id: 'cells',
    name: 'Cell Structure & Transport',
    blurb: 'Membranes, gradients and organelles: how cells control what gets in and out.',
    category: 'cell',
  },
  {
    id: 'energy',
    name: 'Energy in Cells',
    blurb: 'Photosynthesis and cellular respiration: capturing and spending energy.',
    category: 'biochem',
  },
  {
    id: 'division',
    name: 'Cell Division',
    blurb: 'The cell cycle, mitosis, meiosis and stem cells.',
    category: 'cell',
  },
  {
    id: 'dna',
    name: 'DNA & Protein Synthesis',
    blurb: 'Structure, replication, transcription, translation and mutation.',
    category: 'genetics',
  },
  {
    id: 'heredity',
    name: 'Heredity & Biotechnology',
    blurb: 'Mendel’s laws, non-Mendelian patterns, sex linkage and gene editing.',
    category: 'genetics',
  },
  {
    id: 'evolution',
    name: 'Evolution',
    blurb: 'Natural selection, drift, speciation and reading phylogenetic trees.',
    category: 'evolution',
  },
  {
    id: 'ecology',
    name: 'Ecology',
    blurb: 'Energy flow, nutrient cycles and population dynamics.',
    category: 'ecology',
  },
  {
    id: 'body',
    name: 'Human Body Systems',
    blurb: 'Circulation, respiration, excretion, hormones, nerves and immunity.',
    category: 'physiology',
  },
];

export interface HsLessonInput {
  /** Id of the library concept this lesson deepens. */
  base: string;
  unit: HsUnitId;
  summary: string;
  /** One step per step of the base concept, in the same order (they track the interaction). */
  steps: [title: string, text: string][];
  diagrams: Diagram[];
  keyTerms: [term: string, definition: string][];
  goDeeper: string;
  quiz: [QuizQuestion, QuizQuestion, QuizQuestion];
  funFact?: string;
}

export const hsId = (base: string) => `hs-${base}`;

export function hs(t: HsLessonInput): Concept {
  const base = CONCEPT_BY_ID[t.base];
  if (!base) throw new Error(`High School lesson for unknown concept ${t.base}`);
  return {
    ...base,
    id: hsId(t.base),
    tags: [...base.tags, 'high school'],
    difficulty: Math.min(5, base.difficulty + 1) as Concept['difficulty'],
    rarity: 'common',
    prerequisites: undefined,
    summary: t.summary,
    steps: t.steps.map(([title, text]) => ({ title, text })),
    goDeeper: t.goDeeper,
    quiz: t.quiz,
    // Filled in by the index: the library version plus neighbors in the same unit.
    relatedConcepts: [],
    funFact: t.funFact ?? base.funFact,
    highSchool: {
      unit: t.unit,
      baseId: t.base,
      diagrams: t.diagrams,
      keyTerms: t.keyTerms.map(([term, definition]) => ({ term, definition })),
    },
  };
}

// ------------------------------------------------------------ diagram drawing helpers
// Every diagram uses the same 400 × 260 box so they render at a consistent size.

export const W = 400;
export const H = 260;

export const diagram = (
  title: string,
  caption: string,
  shapes: DiagramShape[],
  parts: [id: string, label: string, at: [number, number], description: string][],
): Diagram => ({
  title,
  caption,
  width: W,
  height: H,
  shapes,
  parts: parts.map(([id, label, at, description]): DiagramPart => ({ id, label, at, description })),
});

export const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  s: DiagramStyle & { r?: number } = {},
): DiagramShape => ({ kind: 'rect', x, y, w, h, fill, ...s });

export const circle = (
  cx: number,
  cy: number,
  r: number,
  fill: string,
  s: DiagramStyle = {},
): DiagramShape => ({ kind: 'circle', cx, cy, r, fill, ...s });

export const ellipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fill: string,
  s: DiagramStyle = {},
): DiagramShape => ({ kind: 'ellipse', cx, cy, rx, ry, fill, ...s });

export const path = (d: string, s: DiagramStyle = {}): DiagramShape => ({
  kind: 'path',
  d,
  fill: 'none',
  stroke: '#334155',
  strokeWidth: 2,
  ...s,
});

export const arrow = (
  from: [number, number],
  to: [number, number],
  s: DiagramStyle & { bend?: number } = {},
): DiagramShape => ({ kind: 'arrow', from, to, stroke: '#334155', strokeWidth: 2, ...s });

export const text = (
  x: number,
  y: number,
  t: string,
  s: DiagramStyle & { size?: number; anchor?: 'start' | 'middle' | 'end'; bold?: boolean } = {},
): DiagramShape => ({ kind: 'text', x, y, text: t, anchor: 'middle', size: 11, ...s });
