import { describe, expect, it } from 'vitest';
import { photosynthesis, type PhotoInputs } from '../flagships/photosynthesis/model';

const base: PhotoInputs = { distance: 20, co2: 4, temp: 30, color: 'white', lampOn: true };

describe('photosynthesis model', () => {
  it('peaks near 60 bubbles/min with everything ideal', () => {
    expect(photosynthesis({ ...base, distance: 10 }).bubbles).toBeGreaterThan(50);
  });
  it('light falls off with distance (inverse square)', () => {
    expect(photosynthesis({ ...base, distance: 20 }).intensity).toBeCloseTo(
      4 * photosynthesis({ ...base, distance: 40 }).intensity,
      5,
    );
    expect(photosynthesis({ ...base, distance: 80 }).limiting).toBe('light');
  });
  it('without baking soda, CO₂ limits a brightly lit plant', () => {
    expect(photosynthesis({ ...base, distance: 10, co2: 0 }).limiting).toBe('co2');
  });
  it('green light is used poorly', () => {
    expect(photosynthesis({ ...base, color: 'green' }).bubbles).toBeLessThan(
      photosynthesis(base).bubbles / 2,
    );
  });
  it('no light, no bubbles; too hot slows it down', () => {
    expect(photosynthesis({ ...base, lampOn: false }).bubbles).toBe(0);
    expect(photosynthesis({ ...base, temp: 50 }).limiting).toBe('temperature');
  });
});
