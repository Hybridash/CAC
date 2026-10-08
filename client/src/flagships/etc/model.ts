/**
 * Electron transport chain teaching model.
 * Stations along the electron path: 0 Complex I, 1 Q, 2 Complex III, 3 cytochrome c, 4 Complex IV, 5 → O₂.
 * Protons pumped: 4 at I, 4 at III, 2 at IV (10 per NADH; 6 per FADH₂, which enters at Q).
 * ATP synthase makes 1 ATP per 4 protons that flow back (≈2.5 ATP/NADH, ≈1.5 ATP/FADH₂).
 */
export const PUMP: Record<number, number> = { 0: 4, 2: 4, 4: 2 };
export const MAX_GRADIENT = 60;
export const H_PER_ATP = 4;

export interface Electron {
  id: number;
  pos: number;
  from: 'NADH' | 'FADH2';
  pumped: number[];
}

export interface Poisons {
  cyanide: boolean;
  oligomycin: boolean;
  dnp: boolean;
}

export interface EtcState {
  electrons: Electron[];
  gradient: number;
  atp: number;
  atpProgress: number;
  heat: number;
  water: number;
  nextId: number;
  /** Rotor angle of ATP synthase in degrees, for the animation. */
  rotor: number;
}

export const initialEtc = (): EtcState => ({
  electrons: [],
  gradient: 0,
  atp: 0,
  atpProgress: 0,
  heat: 0,
  water: 0,
  nextId: 1,
  rotor: 0,
});

export function feed(s: EtcState, carrier: 'NADH' | 'FADH2'): EtcState {
  const e: Electron = { id: s.nextId, pos: carrier === 'NADH' ? 0 : 1, from: carrier, pumped: [] };
  return { ...s, electrons: [...s.electrons, e], nextId: s.nextId + 1 };
}

export function stepEtc(s: EtcState, p: Poisons, dt: number): EtcState {
  let gradient = s.gradient;
  let water = s.water;
  const electrons: Electron[] = [];
  const stalled = gradient >= MAX_GRADIENT; // proton back-pressure stops the pumps
  for (const e of s.electrons) {
    let pos = e.pos;
    const pumped = [...e.pumped];
    if (!stalled) pos += 1.4 * dt;
    if (p.cyanide && pos > 4.3) pos = 4.3; // Complex IV blocked: electrons pile up
    for (const station of [0, 2, 4]) {
      if (e.from === 'FADH2' && station === 0) continue; // FADH₂ enters at Q, skipping Complex I
      if (pos < station + 0.3 || pumped.includes(station)) continue;
      pumped.push(station);
      gradient += PUMP[station];
    }
    if (pos >= 5) {
      water += 1;
      continue;
    }
    electrons.push({ ...e, pos, pumped });
  }

  let { atp, atpProgress, heat, rotor } = s;
  if (!p.oligomycin && gradient > 0) {
    // Flow through the turbine grows with the gradient (a steeper hill pushes harder).
    const flow = Math.min(gradient, (1 + 0.15 * gradient) * dt);
    gradient -= flow;
    atpProgress += flow / H_PER_ATP;
    rotor = (rotor + flow * 30) % 360;
    while (atpProgress >= 1) {
      atpProgress -= 1;
      atp += 1;
    }
  }
  if (p.dnp && gradient > 0) {
    const leak = Math.min(gradient, 14 * dt);
    gradient -= leak;
    heat += leak;
  }
  return { electrons, gradient, atp, atpProgress, heat, water, nextId: s.nextId, rotor };
}
