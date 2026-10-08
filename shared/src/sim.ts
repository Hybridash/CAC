/** Pure simulation helpers used by the ecosystem sandbox and the genetics lab. */
import type { EcoSpecies, PunnettConfig } from './types';

// ---------------------------------------------------------------- ecosystem

export type Populations = Record<string, number>;

/**
 * One step of a generalized Lotka–Volterra model.
 * Producers grow logistically toward their capacity; consumers lose `death` per step and
 * gain from what they eat. Predation removes prey.
 */
export function stepEcosystem(species: EcoSpecies[], pop: Populations, dt = 0.1): Populations {
  const next: Populations = {};
  const byId = new Map(species.map((s) => [s.id, s]));
  for (const s of species) {
    const n = pop[s.id] ?? 0;
    if (n <= 0) {
      next[s.id] = 0;
      continue;
    }
    let rate = 0;
    if (s.growth) rate += s.growth * (1 - n / (s.capacity ?? Infinity));
    if (s.death) rate -= s.death;
    for (const e of s.eats ?? []) {
      if (byId.has(e.id)) rate += e.efficiency * e.rate * (pop[e.id] ?? 0);
    }
    for (const predator of species) {
      for (const e of predator.eats ?? []) {
        if (e.id === s.id) rate -= e.rate * (pop[predator.id] ?? 0);
      }
    }
    const v = n + n * rate * dt;
    // Below a fraction of one individual the population is extinct.
    next[s.id] = v < 0.5 ? 0 : v;
  }
  return next;
}

export function simulateEcosystem(
  species: EcoSpecies[],
  start: Populations,
  steps: number,
  dt = 0.1,
): Populations[] {
  const out = [start];
  let p = start;
  for (let i = 0; i < steps; i++) out.push((p = stepEcosystem(species, p, dt)));
  return out;
}

// ---------------------------------------------------------------- genetics

/** Split a genotype key into its two allele tokens. Handles "Rr", "XRXr", "XRY", "IAi". */
export function splitGenotype(key: string, alleles: string[], xLinked: boolean): string[] {
  if (xLinked) {
    const parts = key.match(/X[^XY]*|Y/g);
    if (!parts || parts.length !== 2) throw new Error(`Bad x-linked genotype ${key}`);
    return parts;
  }
  const sorted = [...alleles].sort((a, b) => b.length - a.length);
  const out: string[] = [];
  let rest = key;
  while (rest) {
    const a = sorted.find((x) => rest.startsWith(x));
    if (!a) throw new Error(`Genotype ${key} uses unknown allele`);
    out.push(a);
    rest = rest.slice(a.length);
  }
  if (out.length !== 2) throw new Error(`Genotype ${key} must have two alleles`);
  return out;
}

/** Canonical key: alleles in the order given in the gene definition; X before Y. */
export function genotypeKey(a: string, b: string, alleles: string[], xLinked: boolean): string {
  if (xLinked) {
    if (a === 'Y') return b + a;
    if (b === 'Y') return a + b;
    const ia = alleles.indexOf(a.slice(1));
    const ib = alleles.indexOf(b.slice(1));
    return ia <= ib ? a + b : b + a;
  }
  return alleles.indexOf(a) <= alleles.indexOf(b) ? a + b : b + a;
}

export interface PunnettResult {
  /** 2×2 grid: grid[row = mother allele][col = father allele] = genotype key. */
  grid: string[][];
  motherGametes: string[];
  fatherGametes: string[];
  genotypes: Record<string, number>;
  phenotypes: Record<string, number>;
}

export function punnett(gene: PunnettConfig['gene'], mother: string, father: string): PunnettResult {
  const x = gene.inheritance === 'x-linked';
  const mg = splitGenotype(mother, gene.alleles, x);
  const fg = splitGenotype(father, gene.alleles, x);
  const grid = mg.map((m) => fg.map((f) => genotypeKey(m, f, gene.alleles, x)));
  const genotypes: Record<string, number> = {};
  const phenotypes: Record<string, number> = {};
  for (const g of grid.flat()) {
    genotypes[g] = (genotypes[g] ?? 0) + 0.25;
    const label = gene.phenotypes[g]?.label ?? g;
    phenotypes[label] = (phenotypes[label] ?? 0) + 0.25;
  }
  return { grid, motherGametes: mg, fatherGametes: fg, genotypes, phenotypes };
}
