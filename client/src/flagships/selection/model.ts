/** Peppered-moth natural selection model. Darkness is a heritable trait from 0 (pale) to 1 (black). */
import type { Rng } from '@bioplay/shared';

export interface Moth {
  id: number;
  dark: number;
  x: number;
  y: number;
  rot: number;
}

export type Bark = 'lichen' | 'soot';
export const BARK_DARKNESS: Record<Bark, number> = { lichen: 0.18, soot: 0.85 };
export const POP = 24;

/** How visible a moth is against the bark (0 = invisible, 1 = obvious). */
export const contrast = (m: Moth, bark: Bark) =>
  Math.min(1, Math.abs(m.dark - BARK_DARKNESS[bark]) * 1.6);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

let nextId = 1;
const place = (dark: number, rng: Rng): Moth => ({
  id: nextId++,
  dark: clamp01(dark),
  x: 6 + rng() * 88,
  y: 8 + rng() * 80,
  rot: rng() * 360,
});

/** Starting population: mostly pale moths, with a rare dark form already present. */
export function startingPopulation(rng: Rng = Math.random): Moth[] {
  return Array.from({ length: POP }, (_, i) =>
    place(i < 2 ? 0.85 + rng() * 0.1 : 0.12 + rng() * 0.2, rng),
  );
}

/** Birds eat up to `meals` moths, preferring the most visible ones. */
export function birdsHunt(
  moths: Moth[],
  bark: Bark,
  meals: number,
  rng: Rng = Math.random,
): Moth[] {
  let left = [...moths];
  for (let i = 0; i < meals && left.length > 2; i++) {
    const weights = left.map((m) => 0.05 + contrast(m, bark) ** 2);
    let r = rng() * weights.reduce((a, b) => a + b, 0);
    const idx = weights.findIndex((w) => (r -= w) < 0);
    left = left.filter((_, j) => j !== (idx < 0 ? left.length - 1 : idx));
  }
  return left;
}

/** Survivors breed back up to full size. Offspring resemble a parent, with small random mutations. */
export function reproduce(survivors: Moth[], rng: Rng = Math.random): Moth[] {
  if (!survivors.length) return startingPopulation(rng);
  const kids: Moth[] = survivors.map((m) => place(m.dark, rng));
  while (kids.length < POP) {
    const parent = survivors[Math.floor(rng() * survivors.length)];
    kids.push(place(parent.dark + (rng() - 0.5) * 0.16, rng));
  }
  return kids;
}

export const meanDarkness = (moths: Moth[]) =>
  moths.reduce((s, m) => s + m.dark, 0) / Math.max(1, moths.length);

export const mothColor = (dark: number) => {
  const c = Math.round(232 - dark * 196);
  return `rgb(${c}, ${c - 4}, ${c - 10})`;
};
