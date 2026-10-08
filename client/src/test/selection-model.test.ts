import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@bioplay/shared';
import {
  birdsHunt,
  meanDarkness,
  POP,
  reproduce,
  startingPopulation,
} from '../flagships/selection/model';

describe('natural selection model', () => {
  it('reproduction refills the population', () => {
    const rng = mulberry32(1);
    expect(reproduce(startingPopulation(rng).slice(0, 10), rng)).toHaveLength(POP);
  });

  it('on sooty bark, dark moths take over within a few generations', () => {
    const rng = mulberry32(3);
    let pop = startingPopulation(rng);
    const before = meanDarkness(pop);
    for (let g = 0; g < 8; g++) pop = reproduce(birdsHunt(pop, 'soot', 12, rng), rng);
    expect(meanDarkness(pop)).toBeGreaterThan(before + 0.3);
  });

  it('on lichen bark, the pale form stays common', () => {
    const rng = mulberry32(5);
    let pop = startingPopulation(rng);
    for (let g = 0; g < 8; g++) pop = reproduce(birdsHunt(pop, 'lichen', 12, rng), rng);
    expect(meanDarkness(pop)).toBeLessThan(0.35);
  });
});
