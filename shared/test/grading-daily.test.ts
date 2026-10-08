import { describe, expect, it } from 'vitest';
import { conceptOfTheDay } from '../src/daily';
import { gradeQuiz } from '../src/grading';
import type { QuizQuestion } from '../src/types';

describe('grading', () => {
  const quiz: QuizQuestion[] = [
    { kind: 'mc', prompt: '', options: ['a', 'b'], answer: 1, explain: '' },
    { kind: 'predict', scenario: '', prompt: '', options: ['a', 'b'], answer: 0, explain: '' },
    { kind: 'label', prompt: '', pairs: [{ term: 'x', definition: 'X' }, { term: 'y', definition: 'Y' }], explain: '' },
  ];
  it('scores mc, predict and label questions', () => {
    expect(gradeQuiz(quiz, [1, 0, [0, 1]])).toEqual({ results: [true, true, true], score: 3, outOf: 3 });
    expect(gradeQuiz(quiz, [0, 0, [1, 0]]).score).toBe(1);
    expect(gradeQuiz(quiz, []).score).toBe(0);
  });
});

describe('concept of the day', () => {
  it('is stable for a day and independent of input order', () => {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    expect(conceptOfTheDay('2026-10-07', ids)).toBe(conceptOfTheDay('2026-10-07', [...ids].reverse()));
  });
  it('varies across days', () => {
    const ids = Array.from({ length: 50 }, (_, i) => `c${i}`);
    const days = new Set(Array.from({ length: 30 }, (_, i) => conceptOfTheDay(`2026-11-${String(i + 1).padStart(2, '0')}`, ids)));
    expect(days.size).toBeGreaterThan(10);
  });
});
