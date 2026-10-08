/** Limiting-factor model for the pondweed photosynthesis experiment. */

export type LightColor = 'white' | 'red' | 'blue' | 'green';

/** Fraction of light that chlorophyll can use. Green is mostly reflected (but not all). */
export const COLOR_EFFICIENCY: Record<LightColor, number> = {
  white: 1,
  red: 0.9,
  blue: 0.85,
  green: 0.15,
};

export interface PhotoInputs {
  /** Lamp distance in cm (10–80). */
  distance: number;
  /** Spoons of baking soda (0–4), which add dissolved CO₂. */
  co2: number;
  /** Water temperature in °C. */
  temp: number;
  color: LightColor;
  lampOn: boolean;
}

export type Factor = 'light' | 'co2' | 'temperature';

export function photosynthesis(i: PhotoInputs) {
  // Inverse-square law: half the distance → four times the light.
  const intensity = i.lampOn
    ? Math.min(100, 100 * (20 / i.distance) ** 2) * COLOR_EFFICIENCY[i.color]
    : 0;
  const light = intensity / (intensity + 35) / (100 / 135);
  const co2 = (i.co2 + 0.25) / (i.co2 + 0.25 + 0.9) / (4.25 / 5.15);
  const temperature = Math.exp(-((i.temp - 30) ** 2) / (2 * 9 * 9));
  const rate = Math.min(light, co2) * temperature;
  const factors: Record<Factor, number> = { light, co2, temperature };
  const limiting = (Object.keys(factors) as Factor[]).reduce((a, b) =>
    factors[b] < factors[a] ? b : a,
  );
  return {
    intensity,
    factors,
    limiting,
    /** O₂ bubbles per minute. */
    bubbles: Math.round(rate * 60),
  };
}
