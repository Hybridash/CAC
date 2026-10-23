import { describe, expect, it } from 'vitest';
import {
  buildOlyTest,
  filterOly,
  gradeOly,
  OLY_TOPICS,
  scoreOly,
  seededRng,
  validateOly,
  type OlyQuestion,
} from '../src/olympiad';
import { OLY_BY_ID, OLY_QUESTIONS, OLY_TESTS } from '../src/data/olympiad';

describe('olympiad question bank', () => {
  it('has unique ids', () => {
    expect(Object.keys(OLY_BY_ID)).toHaveLength(OLY_QUESTIONS.length);
  });

  it.each(OLY_QUESTIONS.map((q) => [q.id, q] as const))('%s is valid', (_id, q) => {
    expect(validateOly(q)).toEqual([]);
  });

  it('covers every topic, level, format and skill', () => {
    expect(OLY_QUESTIONS.length).toBeGreaterThanOrEqual(100);
    for (const t of OLY_TOPICS)
      expect(OLY_QUESTIONS.filter((q) => q.topic === t.id).length, t.id).toBeGreaterThanOrEqual(7);
    for (const l of [1, 2, 3]) expect(OLY_QUESTIONS.some((q) => q.level === l)).toBe(true);
    expect(OLY_QUESTIONS.filter((q) => q.format === 'truefalse').length).toBeGreaterThanOrEqual(12);
    expect(OLY_QUESTIONS.filter((q) => q.skill === 'data').length).toBeGreaterThanOrEqual(15);
  });

  it('does not favor one answer letter', () => {
    const singles = OLY_QUESTIONS.filter((q) => q.format === 'single');
    for (let letter = 0; letter < 5; letter++) {
      const share = singles.filter((q) => q.answer === letter).length / singles.length;
      expect(share, 'ABCDE'[letter]).toBeLessThan(0.35);
      expect(share, 'ABCDE'[letter]).toBeGreaterThan(0.08);
    }
  });

  it('has enough questions for every ready-made test', () => {
    for (const t of OLY_TESTS)
      expect(filterOly(OLY_QUESTIONS, t.filter).length, t.id).toBeGreaterThanOrEqual(
        Math.min(t.count, 7),
      );
  });
});

const single: OlyQuestion = {
  id: 'x-1',
  topic: 'cell',
  level: 1,
  skill: 'recall',
  format: 'single',
  stem: 'Which is the right answer here?',
  options: ['a', 'b', 'c', 'd'],
  answer: 2,
  explain: 'Because c is right and the others are not.',
};
const tf: OlyQuestion = {
  id: 'x-2',
  topic: 'genetics',
  level: 3,
  skill: 'recall',
  format: 'truefalse',
  stem: 'Judge each of these statements.',
  statements: [
    { text: 'one', answer: true },
    { text: 'two', answer: false },
    { text: 'three', answer: true },
    { text: 'four', answer: false },
  ],
  explain: 'One and three are true; two and four are false.',
};

describe('grading', () => {
  it('scores multiple choice all or nothing', () => {
    expect(gradeOly(single, 2)).toBe(1);
    expect(gradeOly(single, 1)).toBe(0);
    expect(gradeOly(single, null)).toBe(0);
  });

  it('gives a quarter point per correct true/false judgement, none for blanks', () => {
    expect(gradeOly(tf, [true, false, true, false])).toBe(1);
    expect(gradeOly(tf, [true, true, true, false])).toBe(0.75);
    expect(gradeOly(tf, [true, null, null, null])).toBe(0.25);
    expect(gradeOly(tf, null)).toBe(0);
  });

  it('totals a test by topic and level', () => {
    const s = scoreOly([single, tf], { 'x-1': 2, 'x-2': [false, false, true, true] });
    expect(s.points).toBe(1.5);
    expect(s.max).toBe(2);
    expect(s.byTopic.cell).toEqual({ points: 1, max: 1 });
    expect(s.byTopic.genetics).toEqual({ points: 0.5, max: 1 });
    expect(s.byLevel[3]).toEqual({ points: 0.5, max: 1 });
  });
});

describe('filtering', () => {
  it('combines filters', () => {
    const r = filterOly(OLY_QUESTIONS, { topics: ['genetics'], skills: ['data'] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((q) => q.topic === 'genetics' && q.skill === 'data')).toBe(true);
  });

  it('searches words in any order, case-insensitively', () => {
    const r = filterOly(OLY_QUESTIONS, { text: 'HARDY weinberg' });
    expect(r.map((q) => q.id)).toContain('genetics-6');
  });

  it('can be limited to given ids', () => {
    expect(filterOly(OLY_QUESTIONS, { ids: ['cell-1', 'ecology-3'] })).toHaveLength(2);
  });
});

describe('building tests', () => {
  it('is reproducible from a seed and never repeats a question', () => {
    const spec = OLY_TESTS.find((t) => t.id === 'quick-10')!;
    const a = buildOlyTest(spec, OLY_QUESTIONS, seededRng(7)).map((q) => q.id);
    const b = buildOlyTest(spec, OLY_QUESTIONS, seededRng(7)).map((q) => q.id);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(10);
  });

  it('mixes a weighted exam roughly like a real paper', () => {
    const spec = OLY_TESTS.find((t) => t.id === 'open-mock')!;
    const qs = buildOlyTest(spec, OLY_QUESTIONS, seededRng(3));
    expect(qs).toHaveLength(50);
    expect(qs.every((q) => q.format === 'single' && q.level <= 2)).toBe(true);
    const animals = qs.filter((q) => q.topic === 'animals').length;
    const ethology = qs.filter((q) => q.topic === 'ethology').length;
    expect(animals).toBeGreaterThanOrEqual(10); // 25% weight
    expect(ethology).toBeGreaterThanOrEqual(2); // 5% weight
  });

  it('returns fewer questions when the pool is small', () => {
    const spec = OLY_TESTS.find((t) => t.id === 'topic-ethology')!;
    expect(buildOlyTest(spec, OLY_QUESTIONS).length).toBe(7);
  });
});
