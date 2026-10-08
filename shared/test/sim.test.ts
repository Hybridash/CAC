import { describe, expect, it } from 'vitest';
import { punnett, simulateEcosystem, splitGenotype } from '../src/sim';
import type { EcoSpecies, PunnettConfig } from '../src/types';

describe('ecosystem', () => {
  const grass: EcoSpecies = { id: 'g', label: 'Grass', emoji: '🌱', color: '#0f0', start: 50, growth: 0.8, capacity: 100 };
  const rabbit: EcoSpecies = { id: 'r', label: 'Rabbit', emoji: '🐇', color: '#888', start: 10, death: 0.2, eats: [{ id: 'g', rate: 0.02, efficiency: 0.5 }] };

  it('producers grow logistically toward capacity', () => {
    const run = simulateEcosystem([grass], { g: 5 }, 400);
    expect(run.at(-1)!.g).toBeCloseTo(100, 0);
  });

  it('consumers starve without food', () => {
    const run = simulateEcosystem([grass, rabbit], { g: 0, r: 10 }, 400);
    expect(run.at(-1)!.r).toBe(0);
  });

  it('removing a predator lets prey rise', () => {
    const fox: EcoSpecies = { id: 'f', label: 'Fox', emoji: '🦊', color: '#f80', start: 3, death: 0.3, eats: [{ id: 'r', rate: 0.05, efficiency: 0.4 }] };
    const withFox = simulateEcosystem([grass, rabbit, fox], { g: 50, r: 10, f: 3 }, 300).at(-1)!;
    const noFox = simulateEcosystem([grass, rabbit, fox], { g: 50, r: 10, f: 0 }, 300).at(-1)!;
    expect(noFox.r).toBeGreaterThan(withFox.r);
  });
});

describe('punnett', () => {
  const pea: PunnettConfig['gene'] = {
    name: 'Flower color',
    alleles: ['P', 'p'],
    inheritance: 'complete',
    phenotypes: { PP: { label: 'Purple', color: '#a0f' }, Pp: { label: 'Purple', color: '#a0f' }, pp: { label: 'White', color: '#fff' } },
  };

  it('Aa × Aa gives 3:1', () => {
    const r = punnett(pea, 'Pp', 'Pp');
    expect(r.genotypes).toEqual({ PP: 0.25, Pp: 0.5, pp: 0.25 });
    expect(r.phenotypes).toEqual({ Purple: 0.75, White: 0.25 });
  });

  it('x-linked: carrier mother × normal father → half of sons affected', () => {
    const gene: PunnettConfig['gene'] = {
      name: 'Color vision',
      alleles: ['N', 'n'],
      inheritance: 'x-linked',
      phenotypes: {
        XNXN: { label: 'Normal', color: '' },
        XNXn: { label: 'Carrier', color: '' },
        XnXn: { label: 'Colorblind', color: '' },
        XNY: { label: 'Normal', color: '' },
        XnY: { label: 'Colorblind', color: '' },
      },
    };
    const r = punnett(gene, 'XNXn', 'XNY');
    expect(r.genotypes).toEqual({ XNXN: 0.25, XNY: 0.25, XNXn: 0.25, XnY: 0.25 });
    expect(r.phenotypes.Colorblind).toBe(0.25);
  });

  it('handles multi-character alleles (blood type)', () => {
    expect(splitGenotype('IAi', ['IA', 'IB', 'i'], false)).toEqual(['IA', 'i']);
  });
});
