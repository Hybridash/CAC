/** Bio Bites email + password accounts. Passwords are stored only as salted scrypt hashes. */
import crypto from 'node:crypto';
import type { DB } from './db.js';
import { createUser } from './repo.js';

export const DEMO_EMAIL = 'demo@gmail.com';
export const DEMO_PASSWORD = 'demo123';
export const MIN_PASSWORD_LENGTH = 6;

const KEY_LENGTH = 32;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = crypto.scryptSync(password, Buffer.from(salt, 'base64'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

/** Emails are compared case-insensitively and without surrounding spaces. */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function findEmailAccount(db: DB, email: string) {
  return db
    .prepare('SELECT email, user_id, password_hash FROM email_accounts WHERE email = ?')
    .get(normalizeEmail(email)) as
    { email: string; user_id: string; password_hash: string } | undefined;
}

export function addEmailAccount(
  db: DB,
  userId: string,
  email: string,
  password: string,
  now: Date,
) {
  db.prepare(
    'INSERT INTO email_accounts (email, user_id, password_hash, created_at) VALUES (?, ?, ?, ?)',
  ).run(normalizeEmail(email), userId, hashPassword(password), now.toISOString());
}

/** Creates the demo account (demo@gmail.com / demo123) if it doesn't exist yet. */
export function ensureDemoAccount(db: DB, now: Date) {
  if (findEmailAccount(db, DEMO_EMAIL)) return;
  const { user } = createUser(db, now);
  db.prepare('UPDATE users SET display_name = ? WHERE id = ?').run('Demo', user.id);
  addEmailAccount(db, user.id, DEMO_EMAIL, DEMO_PASSWORD, now);
}

/**
 * Slows down password guessing: after too many wrong passwords for one email within a window,
 * further attempts are refused until the window passes.
 */
export class LoginLimiter {
  private failures = new Map<string, number[]>();
  constructor(
    private max = 10,
    private windowMs = 15 * 60_000,
  ) {}
  private recent(email: string, now: number) {
    const list = (this.failures.get(email) ?? []).filter((t) => now - t < this.windowMs);
    this.failures.set(email, list);
    return list;
  }
  blocked(email: string, now: number) {
    return this.recent(email, now).length >= this.max;
  }
  fail(email: string, now: number) {
    this.recent(email, now).push(now);
  }
  succeed(email: string) {
    this.failures.delete(email);
  }
}
