import { describe, expect, it } from 'vitest';
import {
  feed,
  initialEtc,
  MAX_GRADIENT,
  stepEtc,
  type EtcState,
  type Poisons,
} from '../flagships/etc/model';

const none: Poisons = { cyanide: false, oligomycin: false, dnp: false };
const run = (s: EtcState, p: Poisons, seconds: number) => {
  for (let i = 0; i < seconds * 50; i++) s = stepEtc(s, p, 0.02);
  return s;
};
const atpTotal = (s: EtcState) => s.atp + s.atpProgress;

describe('electron transport chain model', () => {
  it('one NADH pumps 10 H+ and yields about 2.5 ATP', () => {
    const s = run(feed(initialEtc(), 'NADH'), none, 25);
    expect(s.water).toBe(1);
    expect(atpTotal(s)).toBeCloseTo(2.5, 1);
  });

  it('one FADH2 skips Complex I and yields about 1.5 ATP', () => {
    const s = run(feed(initialEtc(), 'FADH2'), none, 25);
    expect(atpTotal(s)).toBeCloseTo(1.5, 1);
  });

  it('cyanide blocks Complex IV: no water, electrons pile up, pumping stops early', () => {
    let s = initialEtc();
    for (let i = 0; i < 5; i++) s = feed(s, 'NADH');
    s = run(s, { ...none, cyanide: true }, 10);
    expect(s.water).toBe(0);
    expect(s.electrons).toHaveLength(5);
  });

  it('oligomycin blocks ATP synthase: gradient maxes out and no ATP is made', () => {
    let s = initialEtc();
    for (let i = 0; i < 10; i++) s = feed(s, 'NADH');
    s = run(s, { ...none, oligomycin: true }, 15);
    expect(s.atp).toBe(0);
    expect(s.gradient).toBeGreaterThanOrEqual(MAX_GRADIENT - 4);
  });

  it('DNP uncouples: protons leak as heat, so far less ATP is made', () => {
    let a = initialEtc();
    let b = initialEtc();
    for (let i = 0; i < 6; i++) {
      a = feed(a, 'NADH');
      b = feed(b, 'NADH');
    }
    a = run(a, none, 30);
    b = run(b, { ...none, dnp: true }, 30);
    expect(atpTotal(b)).toBeLessThan(atpTotal(a) / 2);
    expect(b.heat).toBeGreaterThan(20);
  });
});
