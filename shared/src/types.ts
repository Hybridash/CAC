/**
 * Concept data schema. Every lesson is a plain data object that configures one of the
 * reusable interaction templates — no per-lesson code required.
 */

export type Difficulty = 1 | 2 | 3 | 4 | 5;
export type ConceptRarity = 'common' | 'obscure';

export type CategoryId =
  | 'cell'
  | 'genetics'
  | 'biochem'
  | 'physiology'
  | 'neuro'
  | 'immunology'
  | 'microbes'
  | 'plants'
  | 'evolution'
  | 'ecology'
  | 'development'
  | 'weird';

export interface Category {
  id: CategoryId;
  name: string;
  emoji: string;
  /** Main brand color for the category (hex). */
  color: string;
  /** Pale tint used for backgrounds (hex). */
  tint: string;
  blurb: string;
}

/** A short explanation card shown beside the interaction. */
export interface LessonStep {
  title: string;
  text: string;
}

// ---------------------------------------------------------------- quiz

export interface McQuestion {
  kind: 'mc';
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}

/** Same as multiple choice, but framed as a scenario: "what happens next?" */
export interface PredictQuestion {
  kind: 'predict';
  scenario: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}

/** Drag each term onto its matching description. Pair i matches term i to definition i. */
export interface LabelQuestion {
  kind: 'label';
  prompt: string;
  pairs: { term: string; definition: string }[];
  explain: string;
}

export type QuizQuestion = McQuestion | PredictQuestion | LabelQuestion;

/**
 * A quiz answer: a chosen option index for mc/predict, or for label questions an array where
 * entry d is the term index the player placed on definition d.
 */
export type QuizAnswer = number | number[];

// ---------------------------------------------------------------- visual primitives

/** Simple drawable used by data-driven scenes: either an emoji or a colored SVG shape. */
export type ShapeKind =
  | 'circle'
  | 'blob'
  | 'rod'
  | 'chromosome'
  | 'rect'
  | 'star'
  | 'triangle'
  | 'ring'
  | 'helix'
  | 'wave'
  | 'spiky'
  | 'bean'
  | 'leaf'
  | 'drop'
  | 'heart';

export interface SceneElement {
  /** Stable id so the element can be animated between frames. */
  id: string;
  emoji?: string;
  shape?: ShapeKind;
  color?: string;
  label?: string;
  /** Position in percent of the scene box (0–100). */
  x: number;
  y: number;
  /** Size multiplier; 1 ≈ 10% of the scene width. */
  size?: number;
  rotate?: number;
  opacity?: number;
}

// ---------------------------------------------------------------- interaction templates

export interface FeedObserveConfig {
  prompt: string;
  /** Emoji/scene for the thing being fed (person, plant, cell, lake…). */
  subject: { emoji: string; label: string };
  meters: {
    id: string;
    label: string;
    unit?: string;
    min: number;
    max: number;
    start: number;
    healthy: [number, number];
    color: string;
  }[];
  items: {
    id: string;
    label: string;
    emoji: string;
    note: string;
    effects: { meter: string; amount: number; seconds: number }[];
  }[];
  /** Automatic body/system responses that kick in when a meter crosses a threshold. */
  responses: {
    id: string;
    label: string;
    emoji: string;
    when: { meter: string; above?: number; below?: number };
    /** Change per second applied to `meter` while active. */
    effect: { meter: string; perSecond: number };
    message: string;
  }[];
  /** Optional alternate modes (e.g. disease states) that weaken or disable responses. */
  modes?: {
    id: string;
    label: string;
    description: string;
    /** Multiplier per response id; 0 disables a response entirely. */
    responseScale?: Record<string, number>;
  }[];
  goal: { feeds: number; tryAllModes?: boolean };
}

export interface AssemblyPart {
  id: string;
  label: string;
  emoji?: string;
  description: string;
}

export interface AssemblyConfig {
  prompt: string;
  /** Parts in the correct order. */
  parts: AssemblyPart[];
  /** Extra parts that don't belong anywhere. */
  distractors?: AssemblyPart[];
  layout: 'line' | 'cycle';
  successMessage: string;
}

export interface SliderConfig {
  prompt: string;
  inputs: {
    id: string;
    label: string;
    unit?: string;
    min: number;
    max: number;
    step: number;
    start: number;
  }[];
  output: {
    label: string;
    unit?: string;
    /** Highest value the output can reach (used to scale the graph and visuals). */
    max: number;
    /** Expression over input ids, evaluated by the safe expression engine (see expr.ts). */
    expr: string;
  };
  /** Extra live numbers shown under the graph. */
  readouts?: { label: string; unit?: string; expr: string }[];
  /** Input plotted on the x-axis of the live graph. */
  graphInput: string;
  visual: { kind: 'particles' | 'bubbles' | 'growth' | 'glow'; emoji: string };
  challenges: {
    prompt: string;
    /** Output must land in this range (absolute units). */
    target: { min?: number; max?: number };
    explain: string;
  }[];
}

export type LockShape =
  'triangle' | 'square' | 'circle' | 'star' | 'hexagon' | 'cross' | 'wave' | 'notch';

export interface LockKeyConfig {
  prompt: string;
  receptors: { id: string; label: string; shape: LockShape; color: string; description: string }[];
  molecules: {
    id: string;
    label: string;
    shape: LockShape;
    color: string;
    /** Receptor this molecule fits, or null for decoys that always bounce. */
    fits: string | null;
    /** Shown when it locks in (or bounces off, for decoys). */
    message: string;
    /** "block" = binds but jams the site (e.g. competitive inhibitor). Default "activate". */
    effect?: 'activate' | 'block';
  }[];
}

export interface ZoomConfig {
  prompt: string;
  levels: {
    id: string;
    label: string;
    scale: string;
    background: string;
    description: string;
    elements: SceneElement[];
    hotspots: { id: string; x: number; y: number; label: string; text: string; zoomTo?: string }[];
  }[];
}

export interface CauseEffectConfig {
  prompt: string;
  trigger: { label: string; emoji: string };
  /** Links in cascade order. */
  nodes: { id: string; label: string; emoji: string; text: string; brokenText?: string }[];
  /** Node ids the player may "break" to see what goes wrong. */
  breakable: string[];
  normalOutcome: string;
}

export interface SortingConfig {
  prompt: string;
  bins: { id: string; label: string; emoji: string; description: string }[];
  items: { id: string; label: string; emoji: string; bin: string; explain: string }[];
}

export interface EcoSpecies {
  id: string;
  label: string;
  emoji: string;
  color: string;
  start: number;
  /** Intrinsic growth (producers) — per step. */
  growth?: number;
  /** Carrying capacity for producers. */
  capacity?: number;
  /** Death rate per step (consumers). */
  death?: number;
  /** What it eats: prey id, attack rate, conversion efficiency. */
  eats?: { id: string; rate: number; efficiency: number }[];
}

export interface EcosystemConfig {
  prompt: string;
  species: EcoSpecies[];
  /** Species the player can add/remove. */
  toggleable: string[];
  /** Steps simulated per second of play. */
  speed?: number;
  goal: { steps: number; mustToggle?: string };
  insight: string;
}

export interface PunnettConfig {
  prompt: string;
  gene: {
    name: string;
    /** Allele symbols; first is the "dominant"/reference one. e.g. ["R","r"]. */
    alleles: string[];
    inheritance: 'complete' | 'incomplete' | 'codominant' | 'x-linked';
    /** Phenotype by genotype key (alleles sorted, e.g. "Rr"; x-linked uses "XRXr", "XrY"). */
    phenotypes: Record<string, { label: string; color: string; emoji?: string }>;
  };
  /** Genotype keys selectable for each parent. */
  mothers: string[];
  fathers: string[];
  challenges: { prompt: string; phenotype: string; probability: number; explain: string }[];
}

export interface TimelineConfig {
  prompt: string;
  frames: { id: string; label: string; time?: string; text: string; elements: SceneElement[] }[];
  /** "Scrub to the moment when…" challenges; answer is a frame id. */
  checkpoints: { prompt: string; frame: string }[];
  background?: string;
}

export type Interaction =
  | { template: 'feed-and-observe'; config: FeedObserveConfig }
  | { template: 'assembly-line'; config: AssemblyConfig }
  | { template: 'slider-sim'; config: SliderConfig }
  | { template: 'lock-and-key'; config: LockKeyConfig }
  | { template: 'zoom-explorer'; config: ZoomConfig }
  | { template: 'cause-effect'; config: CauseEffectConfig }
  | { template: 'sorting'; config: SortingConfig }
  | { template: 'ecosystem'; config: EcosystemConfig }
  | { template: 'punnett'; config: PunnettConfig }
  | { template: 'timeline'; config: TimelineConfig }
  /** A hand-built flagship lesson component, looked up by id on the client. */
  | { template: 'flagship'; config: { component: string } };

export type TemplateId = Interaction['template'];

export interface Concept {
  id: string;
  title: string;
  category: CategoryId;
  tags: string[];
  aliases: string[];
  difficulty: Difficulty;
  rarity: ConceptRarity;
  /** Recommended (not required) concepts to learn first. */
  prerequisites?: string[];
  summary: string;
  steps: LessonStep[];
  interaction: Interaction;
  /** Technical detail + flagged simplifications ("In reality, it's a bit more complicated…"). */
  goDeeper: string;
  quiz: [QuizQuestion, QuizQuestion, QuizQuestion];
  relatedConcepts: string[];
  funFact: string;
  /** Flagship lessons get extra polish and a badge. */
  flagship?: boolean;
}

// ---------------------------------------------------------------- mysteries

export type Clue =
  | {
      id: string;
      kind: 'test';
      title: string;
      intro: string;
      tests: { label: string; emoji: string; result: string }[];
    }
  | {
      id: string;
      kind: 'zoom';
      title: string;
      intro: string;
      levels: { label: string; emoji: string; text: string }[];
    }
  | {
      id: string;
      kind: 'slider';
      title: string;
      intro: string;
      input: {
        label: string;
        unit?: string;
        min: number;
        max: number;
        step: number;
        start: number;
      };
      /** Expression in terms of `x`. */
      expr: string;
      outputLabel: string;
      outputUnit?: string;
      note: string;
    }
  | { id: string; kind: 'observe'; title: string; emoji: string; text: string };

export interface Mystery {
  id: string;
  title: string;
  category: CategoryId;
  difficulty: Difficulty;
  emoji: string;
  /** Concepts that must be completed before the case file unlocks. */
  requires: string[];
  scenario: string;
  clues: Clue[];
  question: string;
  explanations: string[];
  answer: number;
  /** Evidence statements; the player must pick every supporting one and no others. */
  evidence: { text: string; supports: boolean }[];
  resolution: string;
}

// ---------------------------------------------------------------- avatars

export type AvatarRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AvatarBody =
  | 'cell'
  | 'mitochondrion'
  | 'helix'
  | 'neuron'
  | 'phage'
  | 'virus'
  | 'bacterium'
  | 'rbc'
  | 'antibody'
  | 'jellyfish'
  | 'fish'
  | 'axolotl'
  | 'tardigrade'
  | 'mushroom'
  | 'plant'
  | 'flytrap'
  | 'key'
  | 'ribosome'
  | 'molerat'
  | 'octopus'
  | 'leaf'
  | 'heart'
  | 'brain'
  | 'bone'
  | 'egg'
  | 'worm'
  | 'beetle'
  | 'bird'
  | 'eel'
  | 'bat'
  | 'flower'
  | 'tooth';

export type AvatarAccessory =
  | 'none'
  | 'sunglasses'
  | 'helmet'
  | 'crown'
  | 'chef-hat'
  | 'wizard-hat'
  | 'cap'
  | 'shield'
  | 'bowtie'
  | 'headphones'
  | 'scarf'
  | 'monocle'
  | 'halo'
  | 'goggles'
  | 'flower'
  | 'lightning'
  | 'stethoscope'
  | 'cape';

export interface Avatar {
  id: string;
  name: string;
  rarity: AvatarRarity;
  /** One-line real biology fact about what the avatar is based on. */
  fact: string;
  art: { body: AvatarBody; color: string; accent: string; accessory: AvatarAccessory };
  /** Legendaries (and a few others) get a looping animation. */
  animated?: boolean;
  /** Where it can be obtained. Exclusives never appear in packs or the direct-buy shop. */
  source: { kind: 'pack' } | { kind: 'category'; category: CategoryId } | { kind: 'mystery' };
}
