import { describe, expect, it } from 'vitest';
import { initialNeuron, stepNeuron, stimulate, type NeuronState } from '../flagships/neuron/model';

const run = (s: NeuronState, ms: number, speed = 0.1) => {
  let peak = -999;
  let low = 999;
  for (let t = 0; t < ms; t += 0.02) {
    s = stepNeuron(s, 0.02, speed);
    peak = Math.max(peak, s.v);
    low = Math.min(low, s.v);
  }
  return { s, peak, low };
};

describe('neuron model', () => {
  it('a small stimulus fades without a spike', () => {
    const { s, result } = stimulate(initialNeuron(), 8, false);
    expect(result).toBe('subthreshold');
    const r = run(s, 10);
    expect(r.peak).toBeLessThan(-55);
    expect(r.s.v).toBeCloseTo(-70, 0);
  });

  it('crossing threshold fires an all-or-none spike with an undershoot', () => {
    const small = run(stimulate(initialNeuron(), 16, false).s, 6).peak;
    const big = run(stimulate(initialNeuron(), 30, false).s, 6).peak;
    expect(small).toBeGreaterThan(30);
    expect(Math.abs(small - big)).toBeLessThan(2);
    expect(run(stimulate(initialNeuron(), 20, false).s, 6).low).toBeLessThan(-75);
  });

  it('ignores stimuli during the absolute refractory period', () => {
    let s = stimulate(initialNeuron(), 20, false).s;
    s = run(s, 0.3).s;
    expect(stimulate(s, 30, false).result).toBe('refractory');
  });

  it('blocking sodium channels prevents a spike', () => {
    const { s, result } = stimulate(initialNeuron(), 30, true);
    expect(result).toBe('blocked');
    expect(run(s, 6).peak).toBeLessThan(0);
  });

  it('the spike travels to the terminal faster when myelinated', () => {
    const slow = stimulate(initialNeuron(), 20, false).s;
    const fast = stimulate(initialNeuron(), 20, false).s;
    expect(run(fast, 3, 0.5).s.arrivals).toBe(1);
    expect(run(slow, 3, 0.1).s.arrivals).toBe(0);
  });
});
