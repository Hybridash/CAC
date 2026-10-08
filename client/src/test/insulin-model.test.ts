import { describe, expect, it } from 'vitest';
import {
  act,
  eat,
  FOODS,
  initialState,
  step,
  type InsulinMode,
  type ModelState,
} from '../flagships/insulin/model';

const settle = (mode: InsulinMode) => {
  let s = initialState();
  for (let i = 0; i < 300; i++) s = step(s, mode, 0.1);
  return s;
};
const run = (s: ModelState, mode: InsulinMode, seconds: number) => {
  let peak = s.glucose;
  let low = s.glucose;
  let maxGlucagon = 0;
  for (let i = 0; i < seconds * 10; i++) {
    s = step(s, mode, 0.1);
    peak = Math.max(peak, s.glucose);
    low = Math.min(low, s.glucose);
    maxGlucagon = Math.max(maxGlucagon, s.glucagon);
  }
  return { s, peak, low, maxGlucagon };
};
const food = (id: string) => FOODS.find((f) => f.id === id)!;

describe('insulin model', () => {
  it('rests in the healthy range', () => {
    const g = settle('normal').glucose;
    expect(g).toBeGreaterThan(70);
    expect(g).toBeLessThan(100);
  });

  it('candy spikes faster and higher than oatmeal; salad barely moves', () => {
    const candy = run(eat(settle('normal'), food('candy')), 'normal', 60);
    const oats = run(eat(settle('normal'), food('oatmeal')), 'normal', 60);
    const salad = run(eat(settle('normal'), food('salad')), 'normal', 60);
    expect(candy.peak).toBeGreaterThan(oats.peak + 30);
    expect(salad.peak).toBeLessThan(95);
  });

  it('a healthy body brings glucose back down after candy', () => {
    expect(run(eat(settle('normal'), food('candy')), 'normal', 40).s.glucose).toBeLessThan(100);
  });

  it('Type 1: no insulin, glucose stays high', () => {
    const r = run(eat(settle('type1'), food('candy')), 'type1', 40);
    expect(r.s.insulin).toBeLessThan(0.01);
    expect(r.s.glucose).toBeGreaterThan(160);
  });

  it('Type 2: plenty of insulin, but glucose comes down much more slowly', () => {
    const t2 = run(eat(settle('type2'), food('candy')), 'type2', 25);
    const ok = run(eat(settle('normal'), food('candy')), 'normal', 25);
    expect(t2.s.glucose).toBeGreaterThan(ok.s.glucose + 30);
    expect(t2.s.insulin).toBeGreaterThan(ok.s.insulin);
  });

  it('an insulin shot in a healthy body drops glucose low and glucagon rescues it', () => {
    const r = run(act(settle('normal'), 'shot'), 'normal', 90);
    expect(r.low).toBeLessThan(70);
    expect(r.maxGlucagon).toBeGreaterThan(0.5);
    expect(r.s.glucose).toBeGreaterThan(75);
  });

  it('an insulin shot treats Type 1 after a meal', () => {
    const r = run(act(eat(settle('type1'), food('bread')), 'shot'), 'type1', 60);
    expect(r.s.glucose).toBeLessThan(120);
  });
});
