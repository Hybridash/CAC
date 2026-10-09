import type { IconName } from '../../components/Icon';
/**
 * A toy glucose–insulin–glucagon model for the Insulin flagship.
 * Units: glucose in mg/dL; insulin and glucagon in arbitrary "signal" units.
 * One simulated second ≈ 3 real minutes, so a meal plays out in under a minute on screen.
 * It is tuned to be qualitatively right (shapes and directions), not a medical simulator.
 */

export type InsulinMode = 'normal' | 'type1' | 'type2';

export interface Food {
  id: string;
  label: string;
  icon: IconName;
  /** Total rise in blood glucose (mg/dL) before the body responds. */
  load: number;
  /** Seconds over which it is absorbed — shorter = faster spike. */
  seconds: number;
  speed: 'fast' | 'medium' | 'slow' | 'minimal';
  note: string;
}

export const FOODS: Food[] = [
  {
    id: 'candy',
    label: 'Candy bar',
    icon: 'candy',
    load: 110,
    seconds: 9,
    speed: 'fast',
    note: 'Pure sugar absorbs fast — a quick, tall spike.',
  },
  {
    id: 'soda',
    label: 'Soda',
    icon: 'soda',
    load: 100,
    seconds: 7,
    speed: 'fast',
    note: 'Liquid sugar is the fastest of all. Whoosh!',
  },
  {
    id: 'bread',
    label: 'White bread',
    icon: 'bread',
    load: 80,
    seconds: 13,
    speed: 'medium',
    note: 'White bread’s starch breaks down into glucose quickly.',
  },
  {
    id: 'oatmeal',
    label: 'Oatmeal',
    icon: 'oatmeal',
    load: 55,
    seconds: 26,
    speed: 'slow',
    note: 'Fiber in oats slows digestion, so glucose trickles in.',
  },
  {
    id: 'apple',
    label: 'Apple',
    icon: 'apple',
    load: 38,
    seconds: 22,
    speed: 'slow',
    note: 'Fruit sugar plus fiber gives a gentle, slow rise.',
  },
  {
    id: 'salad',
    label: 'Salad',
    icon: 'salad',
    load: 8,
    seconds: 10,
    speed: 'minimal',
    note: 'Leafy greens barely change blood sugar.',
  },
  {
    id: 'steak',
    label: 'Steak',
    icon: 'steak',
    load: 5,
    seconds: 12,
    speed: 'minimal',
    note: 'Protein and fat hardly raise blood sugar at all.',
  },
];

export interface Action {
  id: 'run' | 'shot';
  label: string;
  icon: IconName;
  note: string;
}

export const ACTIONS: Action[] = [
  {
    id: 'run',
    label: 'Go for a long run',
    icon: 'sneaker',
    note: 'Working muscles pull in glucose — they can even open their doors without insulin!',
  },
  {
    id: 'shot',
    label: 'Insulin injection',
    icon: 'syringe',
    note: 'Injected insulin acts like the body’s own keys. People with Type 1 diabetes need it to survive.',
  },
];

export interface ModelState {
  t: number;
  glucose: number;
  insulin: number;
  glucagon: number;
  /** Liver glycogen store, 0–100. */
  glycogen: number;
  /** Glucose taken into muscle/fat cells recently (for visuals), 0–100. */
  cellFill: number;
  gut: { remaining: number; rate: number }[];
  exercise: number;
  /** Injected insulin still being absorbed from under the skin. */
  depot: number;
  /** Instantaneous rates (mg/dL per s) for visuals and narration. */
  rates: {
    absorb: number;
    uptake: number;
    liverOut: number;
    liverIn: number;
    renal: number;
    secretion: number;
  };
}

export const MODE_PARAMS: Record<InsulinMode, { production: number; sensitivity: number }> = {
  normal: { production: 1, sensitivity: 1 },
  type1: { production: 0, sensitivity: 1 },
  type2: { production: 1.4, sensitivity: 0.11 },
};

export function initialState(): ModelState {
  return {
    t: 0,
    glucose: 90,
    insulin: 3,
    glucagon: 0,
    glycogen: 50,
    cellFill: 20,
    gut: [],
    exercise: 0,
    depot: 0,
    rates: { absorb: 0, uptake: 0, liverOut: 0, liverIn: 0, renal: 0, secretion: 0 },
  };
}

export function eat(s: ModelState, f: Food): ModelState {
  return { ...s, gut: [...s.gut, { remaining: f.load, rate: f.load / f.seconds }] };
}

export function act(s: ModelState, a: Action['id']): ModelState {
  if (a === 'run') return { ...s, exercise: s.exercise + 90 };
  return { ...s, depot: s.depot + 120 };
}

export function step(s: ModelState, mode: InsulinMode, dt: number): ModelState {
  const { production, sensitivity } = MODE_PARAMS[mode];
  const G = s.glucose;

  let absorb = 0;
  const gut = s.gut
    .map((g) => {
      const a = Math.min(g.remaining, g.rate * dt);
      absorb += a;
      return { ...g, remaining: g.remaining - a };
    })
    .filter((g) => g.remaining > 0.01);

  // Beta cells release insulin in proportion to how far glucose is above ~80.
  const secretion = production * 0.22 * Math.max(0, G - 80);
  const fromDepot = Math.min(s.depot, 6 * dt);
  const insulin = Math.max(0, s.insulin + fromDepot + (secretion - 0.3 * s.insulin) * dt);

  // Alpha cells release glucagon when glucose falls below ~70.
  const glucagon = Math.max(0, s.glucagon + (1.0 * Math.max(0, 70 - G) - 0.4 * s.glucagon) * dt);

  // Brain and other tissues use glucose all the time (saturates at high levels).
  const basal = (Math.min(G, 120) / 90) * 1.0;
  // Insulin opens GLUT4 "doors" on muscle and fat; insulin resistance makes them stiff.
  const effective = sensitivity * insulin;
  const insulinUptake = 0.045 * effective * (G / 90);
  // Exercise lets muscles take glucose without insulin.
  const exerciseUse = s.exercise > 0 ? Math.min(s.exercise, 3.5 * dt) / dt : 0;
  // Liver: releases glucose when insulin is low; insulin tells it to stop and store glycogen.
  const liverSuppression = Math.min(1, effective / 10);
  const liverOut =
    s.glycogen > 0
      ? 1.15 * (1 - liverSuppression) + 0.22 * glucagon * Math.min(1, s.glycogen / 10)
      : 0;
  const liverIn = 0.35 * insulinUptake;
  // Kidneys spill sugar into urine above ~180 mg/dL.
  const renal = G > 180 ? 0.04 * (G - 180) : 0;

  const uptake = insulinUptake - liverIn + exerciseUse;
  const glucose = Math.max(
    20,
    G + absorb + (liverOut - basal - insulinUptake - exerciseUse - renal) * dt,
  );
  const glycogen = Math.min(100, Math.max(0, s.glycogen + (liverIn * 1.5 - liverOut * 0.06) * dt));
  const cellFill = Math.min(100, Math.max(0, s.cellFill + (uptake * 0.8 - 0.4) * dt));

  return {
    t: s.t + dt,
    glucose,
    insulin,
    glucagon,
    glycogen,
    cellFill,
    gut,
    exercise: Math.max(0, s.exercise - exerciseUse * dt),
    depot: s.depot - fromDepot,
    rates: { absorb: absorb / dt, uptake, liverOut, liverIn, renal, secretion },
  };
}

export type Zone = 'low' | 'normal' | 'high' | 'very-high';
export const zoneOf = (g: number): Zone =>
  g < 70 ? 'low' : g <= 140 ? 'normal' : g <= 200 ? 'high' : 'very-high';

/** "1 h 20 min" from simulated seconds (1 s ≈ 3 min). */
export function simClock(t: number): string {
  const mins = Math.round(t * 3);
  const h = Math.floor(mins / 60);
  return h ? `${h} h ${mins % 60} min` : `${mins} min`;
}
