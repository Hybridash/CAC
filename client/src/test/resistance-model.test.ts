import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@bioplay/shared';
import {
  counts,
  dose,
  grow,
  immune,
  newInfection,
  type Bacterium,
} from '../flagships/resistance/model';

const day = (pop: Bacterium[], level: number, rng: () => number, share = false) => {
  if (level > 0) pop = dose(pop, level, rng);
  pop = immune(pop, rng);
  return grow(pop, share, rng);
};

describe('antibiotic resistance model', () => {
  it('a full 7-day course usually clears the infection', () => {
    let cleared = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const rng = mulberry32(seed);
      let pop = newInfection(rng);
      for (let d = 0; d < 7; d++) pop = day(pop, d + 1, rng);
      for (let d = 0; d < 3; d++) pop = day(pop, 0, rng);
      if (pop.length === 0) cleared++;
    }
    expect(cleared).toBeGreaterThanOrEqual(17);
  });

  it('stopping after 2 days lets a more resistant infection come back, and the drug then fails', () => {
    let comebacks = 0;
    let failures = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const rng = mulberry32(seed);
      let pop = newInfection(rng);
      for (let d = 0; d < 2; d++) pop = day(pop, d + 1, rng);
      for (let d = 0; d < 4; d++) pop = day(pop, 0, rng);
      const c = counts(pop);
      if (pop.length > 40 && (c[1] + c[2]) / pop.length > 0.5) comebacks++;
      if (pop.length && dose(pop, 1, rng).length > pop.length * 0.4) failures++;
    }
    expect(comebacks).toBeGreaterThanOrEqual(14);
    expect(failures).toBeGreaterThanOrEqual(16);
  });

  it('gene sharing spreads full resistance', () => {
    const rng = mulberry32(11);
    let pop = newInfection(rng);
    pop = pop.map((b, i) => (i < 3 ? { ...b, r: 2 as const } : b));
    for (let d = 0; d < 4; d++) pop = day(pop, 0, rng, true);
    expect(counts(pop)[2]).toBeGreaterThan(10);
  });
});
