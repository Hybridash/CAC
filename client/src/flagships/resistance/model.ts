/**
 * Antibiotic resistance in a dish. Each bacterium has a resistance level:
 * 0 = susceptible, 1 = partly resistant, 2 = fully resistant.
 */
import type { Rng } from '@bioplay/shared';

export interface Bacterium {
  id: number;
  r: 0 | 1 | 2;
  /** Position inside the dish, as fractions of its radius from the center (-1…1). */
  x: number;
  y: number;
}

export const CAPACITY = 90;
/** The patient's immune system can mop up a few bacteria per day on its own. */
export const IMMUNE_CLEARANCE = 2;

/**
 * Chance one dose kills a bacterium. `level` is how many days in a row the drug has been taken:
 * drug levels in the body build up, so partly resistant bacteria only die once the course is well underway.
 */
export function killChance(r: 0 | 1 | 2, level: number): number {
  if (r === 0) return 0.8;
  if (r === 1) return Math.min(0.9, 0.15 + 0.15 * level);
  return 0.03;
}
export const SICK_THRESHOLD = 25;

let nextId = 1;
const spot = (rng: Rng) => {
  const a = rng() * Math.PI * 2;
  const d = Math.sqrt(rng()) * 0.88;
  return { x: Math.cos(a) * d, y: Math.sin(a) * d };
};
const make = (r: 0 | 1 | 2, rng: Rng): Bacterium => ({ id: nextId++, r, ...spot(rng) });

export function newInfection(rng: Rng = Math.random): Bacterium[] {
  return Array.from({ length: 70 }, (_, i) => make(i < 12 ? 1 : 0, rng));
}

export const dose = (pop: Bacterium[], level: number, rng: Rng = Math.random) =>
  pop.filter((b) => rng() >= killChance(b.r, level));

export function immune(pop: Bacterium[], rng: Rng = Math.random): Bacterium[] {
  const out = [...pop];
  for (let i = 0; i < IMMUNE_CLEARANCE && out.length; i++)
    out.splice(Math.floor(rng() * out.length), 1);
  return out;
}

/** One day of growth: bacteria divide toward the dish's capacity; rare mutations; optional plasmid sharing. */
export function grow(pop: Bacterium[], geneSharing: boolean, rng: Rng = Math.random): Bacterium[] {
  const out = [...pop];
  const room = CAPACITY - out.length;
  const births = Math.min(room, Math.round(out.length * 1.2));
  for (let i = 0; i < births; i++) {
    const parent = pop[Math.floor(rng() * pop.length)];
    let r = parent.r;
    if (r === 1 && rng() < 0.003) r = 2; // rare mutation to full resistance
    out.push(make(r, rng));
  }
  if (geneSharing && out.some((b) => b.r === 2)) {
    // Resistant bacteria pass a resistance plasmid to some neighbors (horizontal gene transfer).
    const donors = out.filter((b) => b.r === 2).length;
    for (const b of out) if (b.r < 2 && rng() < Math.min(0.35, donors * 0.02)) b.r = 2;
  }
  return out;
}

export const counts = (pop: Bacterium[]) =>
  [0, 1, 2].map((r) => pop.filter((b) => b.r === r).length);
