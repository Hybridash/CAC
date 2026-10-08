import crypto from 'node:crypto';
import type { ConceptProgress, PlayerState } from '@bioplay/shared';
import type { DB } from './db.js';

export interface UserRow {
  id: string;
  token_hash: string;
  created_at: string;
  atp: number;
  nucleotides: number;
  equipped_avatar: string | null;
  display_name: string;
  streak: number;
  longest_streak: number;
  last_active_day: string | null;
}

export interface ProgressRow {
  user_id: string;
  concept_id: string;
  interaction_done_at: string | null;
  quiz_passed_at: string | null;
  quiz_perfect: number;
  best_score: number;
  last_quiz_at: string | null;
  last_review_reward_at: string | null;
  completed_at: string | null;
}

export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export function createUser(db: DB, now: Date): { user: UserRow; token: string } {
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO users (id, token_hash, created_at) VALUES (?, ?, ?)').run(
    id,
    hashToken(token),
    now.toISOString(),
  );
  return { user: getUser(db, id)!, token };
}

export function getUser(db: DB, id: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

export function getUserByToken(db: DB, token: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE token_hash = ?').get(hashToken(token)) as
    UserRow | undefined;
}

export function getProgress(db: DB, userId: string, conceptId: string): ProgressRow | undefined {
  return db
    .prepare('SELECT * FROM concept_progress WHERE user_id = ? AND concept_id = ?')
    .get(userId, conceptId) as ProgressRow | undefined;
}

export function ensureProgress(db: DB, userId: string, conceptId: string): ProgressRow {
  db.prepare('INSERT OR IGNORE INTO concept_progress (user_id, concept_id) VALUES (?, ?)').run(
    userId,
    conceptId,
  );
  return getProgress(db, userId, conceptId)!;
}

export function hasAchievement(db: DB, userId: string, key: string): boolean {
  return !!db.prepare('SELECT 1 FROM achievements WHERE user_id = ? AND key = ?').get(userId, key);
}

/** Returns true if the achievement was newly granted. */
export function grantAchievement(db: DB, userId: string, key: string, now: Date): boolean {
  const r = db
    .prepare('INSERT OR IGNORE INTO achievements (user_id, key, awarded_at) VALUES (?, ?, ?)')
    .run(userId, key, now.toISOString());
  return r.changes > 0;
}

export function credit(
  db: DB,
  userId: string,
  currency: 'atp' | 'nucleotides',
  amount: number,
  reason: string,
  ref: string | null,
  now: Date,
) {
  if (amount === 0) return;
  const col = currency === 'atp' ? 'atp' : 'nucleotides';
  db.prepare(`UPDATE users SET ${col} = ${col} + ? WHERE id = ?`).run(amount, userId);
  db.prepare(
    'INSERT INTO ledger (user_id, currency, amount, reason, ref, created_at) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(userId, currency, amount, reason, ref, now.toISOString());
}

function toProgress(r: ProgressRow): ConceptProgress {
  return {
    interactionDoneAt: r.interaction_done_at,
    quizPassedAt: r.quiz_passed_at,
    quizPerfect: !!r.quiz_perfect,
    bestScore: r.best_score,
    lastQuizAt: r.last_quiz_at,
    completedAt: r.completed_at,
  };
}

export function playerState(db: DB, userId: string): PlayerState {
  const u = getUser(db, userId);
  if (!u) throw new Error('unknown user');
  const progress: Record<string, ConceptProgress> = {};
  for (const r of db
    .prepare('SELECT * FROM concept_progress WHERE user_id = ?')
    .all(userId) as ProgressRow[]) {
    progress[r.concept_id] = toProgress(r);
  }
  const inventory: Record<string, number> = {};
  for (const r of db
    .prepare('SELECT avatar_id, count FROM inventory WHERE user_id = ?')
    .all(userId) as { avatar_id: string; count: number }[]) {
    inventory[r.avatar_id] = r.count;
  }
  const mysteriesSolved = (
    db
      .prepare(
        'SELECT mystery_id FROM mystery_progress WHERE user_id = ? AND solved_at IS NOT NULL',
      )
      .all(userId) as { mystery_id: string }[]
  ).map((r) => r.mystery_id);
  const achievements = (
    db.prepare('SELECT key FROM achievements WHERE user_id = ?').all(userId) as { key: string }[]
  ).map((r) => r.key);
  return {
    userId: u.id,
    displayName: u.display_name,
    atp: u.atp,
    nucleotides: u.nucleotides,
    equippedAvatar: u.equipped_avatar,
    streak: u.streak,
    longestStreak: u.longest_streak,
    lastActiveDay: u.last_active_day,
    progress,
    inventory,
    mysteriesSolved,
    achievements,
  };
}
