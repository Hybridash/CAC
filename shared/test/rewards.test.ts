import { describe, expect, it } from 'vitest';
import {
  applyConceptOfTheDay,
  computeCompletionReward,
  computeInteractionReward,
  computeQuizReward,
  interactionReward,
  maxConceptReward,
  mysteryReward,
  nextStreak,
  obscureBonus,
  perfectQuizBonus,
  quizPassReward,
  streakBonus,
  type PriorProgress,
} from '../src/rewards';
import type { Difficulty } from '../src/types';

const fresh: PriorProgress = {
  interactionDone: false,
  quizPassed: false,
  quizPerfect: false,
  lastQuizRewardAt: null,
  completed: false,
};
const now = new Date('2026-10-07T12:00:00Z');
const base = { rarity: 'common' as const, isConceptOfTheDay: false };

describe('reward table', () => {
  // Rows straight from the design doc.
  const table: [Difficulty, number, number, number, number][] = [
    [1, 10, 15, 5, 30],
    [2, 15, 23, 8, 46],
    [3, 20, 30, 10, 60],
    [4, 30, 45, 15, 90],
    [5, 40, 60, 20, 120],
  ];
  it.each(table)('difficulty %i → %i / %i / %i (max %i)', (d, inter, pass, perfect, max) => {
    expect(interactionReward(d)).toBe(inter);
    expect(quizPassReward(d)).toBe(pass);
    expect(perfectQuizBonus(d)).toBe(perfect);
    expect(maxConceptReward(d)).toBe(max);
  });

  it('obscure bonus is 10 × multiplier', () => {
    expect([1, 2, 3, 4, 5].map((d) => obscureBonus(d as Difficulty))).toEqual([10, 15, 20, 30, 40]);
  });

  it('mystery reward scales with difficulty', () => {
    expect(mysteryReward(1)).toBe(60);
    expect(mysteryReward(5)).toBe(240);
  });
});

describe('interaction reward', () => {
  it('pays once', () => {
    expect(computeInteractionReward({ ...base, difficulty: 3 }, fresh)).toEqual([
      { reason: 'Completed the interaction', amount: 20 },
    ]);
    expect(
      computeInteractionReward({ ...base, difficulty: 3 }, { ...fresh, interactionDone: true }),
    ).toEqual([]);
  });

  it('concept of the day multiplies by 1.5', () => {
    const r = computeInteractionReward({ ...base, difficulty: 3, isConceptOfTheDay: true }, fresh);
    expect(r[0].amount).toBe(30);
    expect(applyConceptOfTheDay(15, true)).toBe(23);
  });
});

describe('quiz reward', () => {
  const c = { ...base, difficulty: 2 as Difficulty };
  const total = (r: { items: { amount: number }[] }) => r.items.reduce((s, i) => s + i.amount, 0);

  it('fails below 2/3', () => {
    expect(computeQuizReward(c, fresh, 1, 3, now)).toEqual({ items: [], kind: 'none' });
  });

  it('first pass pays the pass reward', () => {
    expect(total(computeQuizReward(c, fresh, 2, 3, now))).toBe(23);
  });

  it('first perfect pays pass + perfect', () => {
    const r = computeQuizReward(c, fresh, 3, 3, now);
    expect(total(r)).toBe(31);
    expect(r.kind).toBe('first');
  });

  it('a later perfect pays only the perfect bonus', () => {
    const prior = { ...fresh, quizPassed: true, lastQuizRewardAt: now.toISOString() };
    expect(total(computeQuizReward(c, prior, 3, 3, now))).toBe(8);
  });

  it('no farming: retake within 24h pays nothing', () => {
    const prior = {
      ...fresh,
      quizPassed: true,
      quizPerfect: true,
      lastQuizRewardAt: new Date(now.getTime() - 23 * 3600_000).toISOString(),
    };
    expect(computeQuizReward(c, prior, 3, 3, now)).toEqual({ items: [], kind: 'none' });
  });

  it('review after 24h pays 25% of the quiz reward', () => {
    const prior = {
      ...fresh,
      quizPassed: true,
      quizPerfect: true,
      lastQuizRewardAt: new Date(now.getTime() - 24 * 3600_000).toISOString(),
    };
    const perfect = computeQuizReward({ ...base, difficulty: 5 }, prior, 3, 3, now);
    expect(perfect.kind).toBe('review');
    expect(total(perfect)).toBe(20); // 25% of (60 + 20)
    expect(total(computeQuizReward({ ...base, difficulty: 5 }, prior, 2, 3, now))).toBe(15);
  });
});

describe('completion & streaks', () => {
  it('obscure concepts pay a one-time bonus', () => {
    expect(computeCompletionReward({ ...base, difficulty: 4 })).toEqual([]);
    expect(
      computeCompletionReward({ rarity: 'obscure', difficulty: 4, isConceptOfTheDay: false }),
    ).toEqual([{ reason: 'Explored an obscure concept', amount: 30 }]);
  });

  it('streak bonus increases and caps', () => {
    expect([0, 1, 2, 5, 10, 30].map(streakBonus)).toEqual([0, 5, 10, 25, 50, 50]);
  });

  it('streak continues on consecutive days and resets after a gap', () => {
    expect(nextStreak(null, 0, '2026-10-07')).toEqual({ streak: 1, isNewDay: true });
    expect(nextStreak('2026-10-06', 4, '2026-10-07')).toEqual({ streak: 5, isNewDay: true });
    expect(nextStreak('2026-10-07', 5, '2026-10-07')).toEqual({ streak: 5, isNewDay: false });
    expect(nextStreak('2026-10-04', 5, '2026-10-07')).toEqual({ streak: 1, isNewDay: true });
    expect(nextStreak('2026-12-31', 2, '2027-01-01')).toEqual({ streak: 3, isNewDay: true });
  });
});
