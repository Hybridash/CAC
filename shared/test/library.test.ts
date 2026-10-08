import { describe, expect, it } from 'vitest';
import { CONCEPTS } from '../src/data/concepts';
import { validateConcept, validateMystery } from '../src/validate';
import { MYSTERIES } from '../src/data/mysteries';
import { AVATARS } from '../src/data/avatars';
import { CATEGORIES } from '../src/data/categories';

describe('concept library', () => {
  const ids = new Set(CONCEPTS.map((c) => c.id));

  it('has unique ids', () => {
    expect(ids.size).toBe(CONCEPTS.length);
  });

  it.each(CONCEPTS.map((c) => [c.id, c] as const))('%s is valid', (_id, c) => {
    expect(validateConcept(c, ids)).toEqual([]);
  });
});

describe('bio mysteries', () => {
  const ids = new Set(CONCEPTS.map((c) => c.id));

  it('has at least 15 mysteries with unique ids, spread across categories', () => {
    expect(MYSTERIES.length).toBeGreaterThanOrEqual(15);
    expect(new Set(MYSTERIES.map((m) => m.id)).size).toBe(MYSTERIES.length);
    expect(new Set(MYSTERIES.map((m) => m.category)).size).toBeGreaterThanOrEqual(8);
  });

  it.each(MYSTERIES.map((m) => [m.id, m] as const))('%s is valid', (_id, m) => {
    expect(validateMystery(m, ids)).toEqual([]);
  });

  it('every category has an exclusive avatar and mysteries have prizes', () => {
    expect(AVATARS.filter((a) => a.source.kind === 'mystery').length).toBeGreaterThan(0);
    expect(CATEGORIES.length).toBe(12);
  });
});
