import crypto from 'node:crypto';
import {
  STARTER_AVATAR,
  type AuthProvider,
  type ConceptProgress,
  type LinkedAccount,
  type PlayerState,
} from '@bioplay/shared';
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
  last_quiz_reward_at: string | null;
  completed_at: string | null;
}

export const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

export function createUser(db: DB, now: Date): { user: UserRow; token: string } {
  const id = crypto.randomUUID();
  const token = crypto.randomBytes(32).toString('base64url');
  db.transaction(() => {
    db.prepare(
      'INSERT INTO users (id, token_hash, created_at, equipped_avatar) VALUES (?, ?, ?, ?)',
    ).run(id, hashToken(token), now.toISOString(), STARTER_AVATAR);
    db.prepare(
      'INSERT INTO sessions (token_hash, user_id, created_at, last_used_at) VALUES (?, ?, ?, ?)',
    ).run(hashToken(token), id, now.toISOString(), now.toISOString());
    // Everyone starts with one friendly avatar so the header isn't empty.
    db.prepare(
      'INSERT INTO inventory (user_id, avatar_id, count, acquired_at) VALUES (?, ?, 1, ?)',
    ).run(id, STARTER_AVATAR, now.toISOString());
  })();
  return { user: getUser(db, id)!, token };
}

export function getUser(db: DB, id: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

/** A sign-in token stops working after 90 idle days, or 365 days after it was issued. */
export const SESSION_IDLE_MS = 90 * 24 * 3600_000;
export const SESSION_MAX_AGE_MS = 365 * 24 * 3600_000;
/** A player can be signed in on at most this many devices; the oldest sessions are dropped. */
export const MAX_SESSIONS_PER_USER = 20;

export function getUserByToken(db: DB, token: string, now: Date = new Date()): UserRow | undefined {
  const tokenHash = hashToken(token);
  const s = db
    .prepare('SELECT user_id, created_at, last_used_at FROM sessions WHERE token_hash = ?')
    .get(tokenHash) as
    { user_id: string; created_at: string; last_used_at: string | null } | undefined;
  if (!s) return undefined;
  const t = now.getTime();
  const lastUsed = Date.parse(s.last_used_at ?? s.created_at);
  if (t - lastUsed > SESSION_IDLE_MS || t - Date.parse(s.created_at) > SESSION_MAX_AGE_MS) {
    db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    return undefined;
  }
  // Refresh "last used" at most once an hour so reads don't turn into constant writes.
  if (t - lastUsed > 3600_000) {
    db.prepare('UPDATE sessions SET last_used_at = ? WHERE token_hash = ?').run(
      now.toISOString(),
      tokenHash,
    );
  }
  return getUser(db, s.user_id);
}

/** A new sign-in token for an existing player (another device, or after switching accounts). */
export function createSession(db: DB, userId: string, now: Date): string {
  const token = crypto.randomBytes(32).toString('base64url');
  db.transaction(() => {
    db.prepare(
      'INSERT INTO sessions (token_hash, user_id, created_at, last_used_at) VALUES (?, ?, ?, ?)',
    ).run(hashToken(token), userId, now.toISOString(), now.toISOString());
    db.prepare(
      `DELETE FROM sessions WHERE user_id = ? AND token_hash NOT IN (
         SELECT token_hash FROM sessions WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?
       )`,
    ).run(userId, userId, MAX_SESSIONS_PER_USER);
  })();
  return token;
}

export function deleteSession(db: DB, token: string) {
  db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
}

/** Sign this player out on every device. */
export function deleteAllSessions(db: DB, userId: string) {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

/** Housekeeping: remove sessions that can no longer be used. */
export function purgeExpiredSessions(db: DB, now: Date): number {
  const idle = new Date(now.getTime() - SESSION_IDLE_MS).toISOString();
  const old = new Date(now.getTime() - SESSION_MAX_AGE_MS).toISOString();
  return db
    .prepare('DELETE FROM sessions WHERE COALESCE(last_used_at, created_at) < ? OR created_at < ?')
    .run(idle, old).changes;
}

export function findIdentity(db: DB, provider: AuthProvider, subject: string) {
  return db
    .prepare('SELECT user_id, email FROM identities WHERE provider = ? AND subject = ?')
    .get(provider, subject) as { user_id: string; email: string | null } | undefined;
}

export function linkedAccount(db: DB, userId: string): LinkedAccount | null {
  const identity = db
    .prepare('SELECT provider, email FROM identities WHERE user_id = ? ORDER BY created_at LIMIT 1')
    .get(userId) as LinkedAccount | undefined;
  if (identity) return identity;
  const email = db.prepare('SELECT email FROM email_accounts WHERE user_id = ?').get(userId) as
    { email: string } | undefined;
  return email ? { provider: 'email', email: email.email } : null;
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
  const unlockedMysteries = (
    db.prepare('SELECT mystery_id FROM mystery_unlocks WHERE user_id = ?').all(userId) as {
      mystery_id: string;
    }[]
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
    unlockedMysteries,
    achievements,
    account: linkedAccount(db, userId),
  };
}
