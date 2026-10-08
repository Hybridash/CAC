import { describe, expect, it } from 'vitest';
import { CONCEPTS } from '../src/data/concepts';
import { validateConcept } from '../src/validate';

describe('concept library', () => {
  const ids = new Set(CONCEPTS.map((c) => c.id));

  it('has unique ids', () => {
    expect(ids.size).toBe(CONCEPTS.length);
  });

  it.each(CONCEPTS.map((c) => [c.id, c] as const))('%s is valid', (_id, c) => {
    expect(validateConcept(c, ids)).toEqual([]);
  });
});
