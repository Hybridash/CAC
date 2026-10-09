/**
 * Server-side reward logic. All ATP is computed here from the shared reward module;
 * the client never tells the server how much to award.
 */
import {
  CATEGORY_COMPLETE_BONUS,
  CATEGORY_BY_ID,
  CONCEPTS,
  computeCompletionReward,
  computeInteractionReward,
  computeQuizReward,
  conceptOfTheDay,
  gradeQuiz,
  nextStreak,
  streakBonus,
  type Concept,
  type ConceptRewardInput,
  type PriorProgress,
  type QuizAnswer,
  type RewardLine,
} from '@bioplay/shared';
import type { DB } from '../db.js';
import { credit, ensureProgress, getUser, grantAchievement, type ProgressRow } from '../repo.js';
import { dayKey } from '../time.js';
import { grantCategoryAvatar } from './inventory.js';

const ALL_IDS = CONCEPTS.map((c) => c.id);

export const isConceptOfTheDay = (conceptId: string, now: Date) =>
  conceptOfTheDay(dayKey(now), ALL_IDS) === conceptId;

const rewardInput = (c: Concept, now: Date): ConceptRewardInput => ({
  difficulty: c.difficulty,
  rarity: c.rarity,
  isConceptOfTheDay: isConceptOfTheDay(c.id, now),
});

const prior = (p: ProgressRow): PriorProgress => ({
  interactionDone: !!p.interaction_done_at,
  quizPassed: !!p.quiz_passed_at,
  quizPerfect: !!p.quiz_perfect,
  lastQuizRewardAt: p.last_quiz_reward_at,
  completed: !!p.completed_at,
});

class Rewarder {
  lines: RewardLine[] = [];
  constructor(
    private db: DB,
    private userId: string,
    private now: Date,
  ) {}
  atp(reason: string, amount: number, ref: string | null) {
    if (amount <= 0) return;
    credit(this.db, this.userId, 'atp', amount, reason, ref, this.now);
    this.lines.push({ reason, amount, currency: 'atp' });
  }
  get total() {
    return this.lines.reduce((s, l) => s + (l.currency === 'atp' ? l.amount : 0), 0);
  }
}

/** Advance the daily streak on the first learning activity of a UTC day; pays the streak bonus. */
function touchStreak(db: DB, userId: string, r: Rewarder, now: Date) {
  const u = getUser(db, userId)!;
  const today = dayKey(now);
  const { streak, isNewDay } = nextStreak(u.last_active_day, u.streak, today);
  if (!isNewDay) return;
  db.prepare(
    'UPDATE users SET streak = ?, longest_streak = MAX(longest_streak, ?), last_active_day = ? WHERE id = ?',
  ).run(streak, streak, today, userId);
  r.atp(
    streak > 1 ? `${streak}-day streak bonus` : 'Daily learning bonus',
    streakBonus(streak),
    `streak:${today}`,
  );
}

/** Mark the concept complete if both parts are done; pays obscure + category bonuses. */
function maybeComplete(db: DB, userId: string, c: Concept, r: Rewarder, now: Date) {
  const p = ensureProgress(db, userId, c.id);
  if (p.completed_at || !p.interaction_done_at || !p.quiz_passed_at) return;
  db.prepare(
    'UPDATE concept_progress SET completed_at = ? WHERE user_id = ? AND concept_id = ?',
  ).run(now.toISOString(), userId, c.id);
  for (const item of computeCompletionReward(rewardInput(c, now)))
    r.atp(item.reason, item.amount, c.id);

  const inCategory = CONCEPTS.filter((x) => x.category === c.category).map((x) => x.id);
  const done = db
    .prepare(
      `SELECT COUNT(*) AS n FROM concept_progress WHERE user_id = ? AND completed_at IS NOT NULL
       AND concept_id IN (${inCategory.map(() => '?').join(',')})`,
    )
    .get(userId, ...inCategory) as { n: number };
  if (done.n === inCategory.length && grantAchievement(db, userId, `category:${c.category}`, now)) {
    r.atp(
      `Completed all of ${CATEGORY_BY_ID[c.category].name}`,
      CATEGORY_COMPLETE_BONUS,
      `category:${c.category}`,
    );
    grantCategoryAvatar(db, userId, c.category, now);
  }
}

export function recordInteraction(db: DB, userId: string, c: Concept, now: Date) {
  const r = new Rewarder(db, userId, now);
  db.transaction(() => {
    const p = ensureProgress(db, userId, c.id);
    touchStreak(db, userId, r, now);
    for (const item of computeInteractionReward(rewardInput(c, now), prior(p)))
      r.atp(item.reason, item.amount, c.id);
    if (!p.interaction_done_at) {
      db.prepare(
        'UPDATE concept_progress SET interaction_done_at = ? WHERE user_id = ? AND concept_id = ?',
      ).run(now.toISOString(), userId, c.id);
    }
    maybeComplete(db, userId, c, r, now);
  })();
  return r;
}

export function recordQuiz(db: DB, userId: string, c: Concept, answers: QuizAnswer[], now: Date) {
  const r = new Rewarder(db, userId, now);
  const graded = gradeQuiz(c.quiz, answers);
  const passed = graded.score >= 2;
  const perfect = graded.score === graded.outOf;
  db.transaction(() => {
    const p = ensureProgress(db, userId, c.id);
    touchStreak(db, userId, r, now);
    const reward = computeQuizReward(
      rewardInput(c, now),
      prior(p),
      graded.score,
      graded.outOf,
      now,
    );
    for (const item of reward.items) r.atp(item.reason, item.amount, c.id);
    db.prepare(
      `UPDATE concept_progress SET
         last_quiz_at = @now,
         best_score = MAX(best_score, @score),
         quiz_passed_at = CASE WHEN @passed AND quiz_passed_at IS NULL THEN @now ELSE quiz_passed_at END,
         quiz_perfect = CASE WHEN @perfect THEN 1 ELSE quiz_perfect END,
         last_quiz_reward_at = CASE WHEN @rewarded THEN @now ELSE last_quiz_reward_at END
       WHERE user_id = @userId AND concept_id = @conceptId`,
    ).run({
      now: now.toISOString(),
      score: graded.score,
      passed: passed ? 1 : 0,
      perfect: perfect ? 1 : 0,
      rewarded: reward.items.length ? 1 : 0,
      userId,
      conceptId: c.id,
    });
    maybeComplete(db, userId, c, r, now);
  })();
  return { r, ...graded, passed, perfect };
}
