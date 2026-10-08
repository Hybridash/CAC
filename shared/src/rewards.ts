/**
 * All ATP reward math lives here. The server is the only place these numbers are applied
 * to a balance; the client uses the same functions purely for display.
 */
import type { ConceptRarity, Difficulty } from './types';

export const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 3,
  5: 4,
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  1: 'Beginner',
  2: 'Easy',
  3: 'Medium',
  4: 'Hard',
  5: 'Expert',
};

export const BASE_REWARD = {
  interaction: 10,
  quizPass: 15,
  perfectQuiz: 5,
  obscureFirstCompletion: 10,
} as const;

export const CATEGORY_COMPLETE_BONUS = 150;
export const CONCEPT_OF_THE_DAY_MULTIPLIER = 1.5;
export const REVIEW_FRACTION = 0.25;
export const REVIEW_COOLDOWN_HOURS = 24;
export const QUIZ_PASS_SCORE = 2;
export const STREAK_BONUS_PER_DAY = 5;
export const STREAK_BONUS_CAP = 50;
export const MYSTERY_BASE_REWARD = 60;
export const MYSTERY_EXCLUSIVE_CHANCE = 0.35;

const scaled = (base: number, d: Difficulty) => Math.round(base * DIFFICULTY_MULTIPLIER[d]);

export const interactionReward = (d: Difficulty) => scaled(BASE_REWARD.interaction, d);
export const quizPassReward = (d: Difficulty) => scaled(BASE_REWARD.quizPass, d);
export const perfectQuizBonus = (d: Difficulty) => scaled(BASE_REWARD.perfectQuiz, d);
export const obscureBonus = (d: Difficulty) => scaled(BASE_REWARD.obscureFirstCompletion, d);
export const mysteryReward = (d: Difficulty) => scaled(MYSTERY_BASE_REWARD, d);

/** Max ATP for interaction + quiz + perfect (the headline number on concept cards). */
export const maxConceptReward = (d: Difficulty) =>
  interactionReward(d) + quizPassReward(d) + perfectQuizBonus(d);

/** Potential ATP including the one-time obscure bonus. */
export const potentialReward = (d: Difficulty, rarity: ConceptRarity) =>
  maxConceptReward(d) + (rarity === 'obscure' ? obscureBonus(d) : 0);

export const applyConceptOfTheDay = (amount: number, isConceptOfTheDay: boolean) =>
  isConceptOfTheDay ? Math.round(amount * CONCEPT_OF_THE_DAY_MULTIPLIER) : amount;

/** Streak day 1 → 5, day 2 → 10 … capped at 50 from day 10 onward. */
export const streakBonus = (streak: number) =>
  streak <= 0 ? 0 : Math.min(STREAK_BONUS_PER_DAY * streak, STREAK_BONUS_CAP);

export interface RewardItem {
  reason: string;
  amount: number;
}

export interface ConceptRewardInput {
  difficulty: Difficulty;
  rarity: ConceptRarity;
  isConceptOfTheDay: boolean;
}

export interface PriorProgress {
  interactionDone: boolean;
  quizPassed: boolean;
  quizPerfect: boolean;
  /** Last time any quiz reward (first pass, perfect, or review) was paid. ISO string. */
  lastQuizRewardAt: string | null;
  completed: boolean;
}

const withDaily = (items: RewardItem[], cotd: boolean): RewardItem[] =>
  items.map((i) => ({ ...i, amount: applyConceptOfTheDay(i.amount, cotd) }));

/** Reward for finishing the hands-on interaction. One time per concept. */
export function computeInteractionReward(
  c: ConceptRewardInput,
  prior: PriorProgress,
): RewardItem[] {
  if (prior.interactionDone) return [];
  return withDaily(
    [{ reason: 'Completed the interaction', amount: interactionReward(c.difficulty) }],
    c.isConceptOfTheDay,
  );
}

export type QuizRewardKind = 'first' | 'review' | 'none';

export interface QuizRewardResult {
  items: RewardItem[];
  kind: QuizRewardKind;
}

/**
 * Reward for a quiz attempt.
 * - First pass (≥2/3): pass reward, plus perfect bonus if 3/3.
 * - Already passed but never perfect, now perfect: the perfect bonus (one time).
 * - Already fully rewarded: a review reward (25% of the quiz reward) if 24h+ since the last
 *   quiz reward, otherwise nothing.
 */
export function computeQuizReward(
  c: ConceptRewardInput,
  prior: PriorProgress,
  score: number,
  outOf: number,
  now: Date,
): QuizRewardResult {
  const passed = score >= QUIZ_PASS_SCORE;
  const perfect = score === outOf;
  if (!passed) return { items: [], kind: 'none' };

  const items: RewardItem[] = [];
  if (!prior.quizPassed) {
    items.push({ reason: 'Passed the quiz', amount: quizPassReward(c.difficulty) });
    if (perfect) items.push({ reason: 'Perfect quiz!', amount: perfectQuizBonus(c.difficulty) });
    return { items: withDaily(items, c.isConceptOfTheDay), kind: 'first' };
  }

  if (perfect && !prior.quizPerfect) {
    items.push({ reason: 'Perfect quiz!', amount: perfectQuizBonus(c.difficulty) });
    return { items: withDaily(items, c.isConceptOfTheDay), kind: 'first' };
  }

  if (!isReviewAvailable(prior.lastQuizRewardAt, now)) return { items: [], kind: 'none' };
  const original = quizPassReward(c.difficulty) + (perfect ? perfectQuizBonus(c.difficulty) : 0);
  items.push({ reason: 'Review bonus', amount: Math.round(original * REVIEW_FRACTION) });
  return { items: withDaily(items, c.isConceptOfTheDay), kind: 'review' };
}

export function isReviewAvailable(lastQuizRewardAt: string | null, now: Date): boolean {
  if (!lastQuizRewardAt) return true;
  const elapsedH = (now.getTime() - new Date(lastQuizRewardAt).getTime()) / 3_600_000;
  return elapsedH >= REVIEW_COOLDOWN_HOURS;
}

/** One-time bonus when a concept becomes complete (interaction + quiz passed). */
export function computeCompletionReward(c: ConceptRewardInput): RewardItem[] {
  if (c.rarity !== 'obscure') return [];
  return withDaily(
    [{ reason: 'Explored an obscure concept', amount: obscureBonus(c.difficulty) }],
    c.isConceptOfTheDay,
  );
}

/** Advance a daily streak. Returns the new streak and whether today is a new active day. */
export function nextStreak(
  lastActiveDay: string | null,
  currentStreak: number,
  today: string,
): { streak: number; isNewDay: boolean } {
  if (lastActiveDay === today) return { streak: currentStreak, isNewDay: false };
  if (lastActiveDay && dayDiff(lastActiveDay, today) === 1) {
    return { streak: currentStreak + 1, isNewDay: true };
  }
  return { streak: 1, isNewDay: true };
}

function dayDiff(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}
