/** Tiny synthesized sound effects (no audio files). Respects the global mute setting. */
import { useSettings } from '../store/settings';

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (useSettings.getState().muted) return null;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = 'sine',
  gain = 0.12,
) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export const sfx = {
  pop: () => tone(660, 0, 0.09, 'triangle'),
  drop: () => (tone(440, 0, 0.08, 'triangle'), tone(660, 0.05, 0.1, 'triangle')),
  /** Gentle "not quite" — never harsh. */
  nope: () => (tone(330, 0, 0.12, 'sine', 0.08), tone(294, 0.09, 0.14, 'sine', 0.08)),
  correct: () => (tone(523, 0, 0.1), tone(659, 0.08, 0.1), tone(784, 0.16, 0.18)),
  coin: () => (tone(988, 0, 0.07, 'square', 0.05), tone(1319, 0.06, 0.2, 'square', 0.05)),
  whoosh: () => {
    for (let i = 0; i < 6; i++) tone(200 + i * 90, i * 0.03, 0.08, 'sawtooth', 0.025);
  },
  fanfare: () =>
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, i === 3 ? 0.45 : 0.14, 'triangle')),
  sparkle: () => [1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.06, 0.15, 'sine', 0.06)),
};
