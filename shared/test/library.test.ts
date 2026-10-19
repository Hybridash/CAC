import { describe, expect, it } from 'vitest';
import { CONCEPT_BY_ID, CONCEPTS } from '../src/data/concepts';
import { HS_LESSONS, HS_UNITS } from '../src/data/highschool';
import { LESSON_BY_ID } from '../src/data/lessons';
import { LIBRARY_UPGRADES } from '../src/data/library';
import {
  validateConcept,
  validateHighSchool,
  validateLibraryUpgrade,
  validateMystery,
} from '../src/validate';
import type { CategoryId } from '../src/types';
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

describe('high school lessons', () => {
  const allIds = new Set(Object.keys(LESSON_BY_ID));

  it('have unique ids that never clash with library concepts', () => {
    expect(new Set(HS_LESSONS.map((l) => l.id)).size).toBe(HS_LESSONS.length);
    for (const l of HS_LESSONS) expect(CONCEPT_BY_ID[l.id]).toBeUndefined();
  });

  it('cover every unit, with a good number of topics', () => {
    for (const u of HS_UNITS)
      expect(HS_LESSONS.some((l) => l.highSchool!.unit === u.id)).toBe(true);
    expect(HS_LESSONS.length).toBeGreaterThanOrEqual(30);
  });

  it.each(HS_LESSONS.map((l) => [l.id, l] as const))('%s is valid', (_id, l) => {
    expect(validateConcept(l, allIds)).toEqual([]);
    expect(validateHighSchool(l, CONCEPT_BY_ID[l.highSchool!.baseId])).toEqual([]);
  });

  it('do not change the library', () => {
    expect(CONCEPTS.some((c) => c.highSchool)).toBe(false);
  });
});

/** Categories whose every lesson has been upgraded. Add each one as it is finished. */
const UPGRADED_CATEGORIES: CategoryId[] = ['cell'];

describe('library upgrades', () => {
  const allIds = new Set(Object.keys(LESSON_BY_ID));

  it.each(Object.entries(LIBRARY_UPGRADES))('%s upgrade is valid', (id, up) => {
    expect(validateLibraryUpgrade(id, up, CONCEPT_BY_ID[id])).toEqual([]);
    expect(validateConcept(LESSON_BY_ID[id], allIds)).toEqual([]);
  });

  it.each(UPGRADED_CATEGORIES)('every %s lesson has fuller steps and a diagram', (cat) => {
    for (const c of CONCEPTS.filter((x) => x.category === cat)) {
      expect(LIBRARY_UPGRADES[c.id], c.id).toBeDefined();
      expect(LESSON_BY_ID[c.id].diagrams?.length, c.id).toBeGreaterThan(0);
    }
  });

  it('keeps quizzes and interactions unchanged', () => {
    for (const c of CONCEPTS) {
      expect(LESSON_BY_ID[c.id].quiz).toBe(c.quiz);
      expect(LESSON_BY_ID[c.id].interaction).toBe(c.interaction);
    }
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
