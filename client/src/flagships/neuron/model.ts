/**
 * A teaching model of a neuron's action potential (not Hodgkin–Huxley).
 * Time is in milliseconds of neuron time; the lesson plays it slowed down ~250×.
 */
export type Phase = 'rest' | 'rising' | 'falling' | 'undershoot';

export interface NeuronState {
  t: number;
  v: number;
  phase: Phase;
  phaseT: number;
  /** Na+ channel open fraction (0–1) and K+ channel open fraction. */
  na: number;
  k: number;
  /** Spike position along the axon, 0–1, or null when no spike is travelling. */
  wave: number | null;
  /** Spikes that reached the axon terminal. */
  arrivals: number;
}

export const REST = -70;
export const THRESHOLD = -55;
export const PEAK = 40;

export const initialNeuron = (): NeuronState => ({
  t: 0,
  v: REST,
  phase: 'rest',
  phaseT: 0,
  na: 0,
  k: 0,
  wave: null,
  arrivals: 0,
});

export type StimulusResult = 'subthreshold' | 'fired' | 'refractory' | 'blocked';

/** Inject current at the cell body: an instant bump in voltage. */
export function stimulate(
  s: NeuronState,
  mV: number,
  naBlocked: boolean,
): { s: NeuronState; result: StimulusResult } {
  if (s.phase === 'rising' || s.phase === 'falling') return { s, result: 'refractory' };
  const v = s.v + mV;
  // During the undershoot the cell is harder to excite (relative refractory period).
  const threshold = s.phase === 'undershoot' ? THRESHOLD + 15 : THRESHOLD;
  if (v >= threshold) {
    if (naBlocked) return { s: { ...s, v: Math.min(v, -20) }, result: 'blocked' };
    return { s: { ...s, v, phase: 'rising', phaseT: 0, wave: 0 }, result: 'fired' };
  }
  return { s: { ...s, v }, result: s.phase === 'undershoot' ? 'refractory' : 'subthreshold' };
}

/** Advance by dt milliseconds. `speed` is axon length per ms (myelinated axons are much faster). */
export function stepNeuron(s: NeuronState, dt: number, speed: number): NeuronState {
  let { v, phase, phaseT, na, k, wave, arrivals } = s;
  phaseT += dt;
  switch (phase) {
    case 'rest':
      v += (REST - v) * Math.min(1, dt / 2.5);
      na = Math.max(0, na - dt * 4);
      k = Math.max(0, k - dt * 2);
      break;
    case 'rising':
      na = 1;
      v += (PEAK + 5 - v) * Math.min(1, dt / 0.25);
      if (v >= PEAK - 2) {
        phase = 'falling';
        phaseT = 0;
      }
      break;
    case 'falling':
      na = Math.max(0, na - dt * 5); // Na+ channels inactivate
      k = 1;
      v += (-88 - v) * Math.min(1, dt / 0.55);
      if (v <= -80) {
        phase = 'undershoot';
        phaseT = 0;
      }
      break;
    case 'undershoot':
      k = Math.max(0, k - dt * 0.6);
      v += (REST - v) * Math.min(1, dt / 1.4);
      if (phaseT > 3) {
        phase = 'rest';
        phaseT = 0;
      }
      break;
  }
  if (wave !== null) {
    wave += speed * dt;
    if (wave >= 1) {
      wave = null;
      arrivals += 1;
    }
  }
  return { t: s.t + dt, v, phase, phaseT, na, k, wave, arrivals };
}
