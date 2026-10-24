/** Bio Bites email + password accounts. Passwords are stored only as salted scrypt hashes. */
import crypto from 'node:crypto';
import type { DB } from './db.js';
import { createUser } from './repo.js';

export const DEMO_EMAIL = 'demo@gmail.com';
export const DEMO_PASSWORD = 'demo123';
export const MIN_PASSWORD_LENGTH = 8;

const KEY_LENGTH = 32;
/** scrypt cost: N=2^15, r=8 uses about 32 MB and ~100 ms, a sound interactive-login setting. */
const SCRYPT = { N: 32768, r: 8, p: 1, maxmem: 96 * 1024 * 1024 } as const;
/** Hashes written before the cost was raised have three parts and used Node's defaults. */
const LEGACY_SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 96 * 1024 * 1024 } as const;

type Params = { N: number; r: number; p: number; maxmem: number };

function parse(stored: string): { params: Params; salt: Buffer; hash: Buffer } | null {
  const parts = stored.split('$');
  if (parts[0] !== 'scrypt') return null;
  if (parts.length === 3) {
    return {
      params: LEGACY_SCRYPT,
      salt: Buffer.from(parts[1], 'base64'),
      hash: Buffer.from(parts[2], 'base64'),
    };
  }
  if (parts.length === 6) {
    const [N, r, p] = [Number(parts[1]), Number(parts[2]), Number(parts[3])];
    // Refuse absurd stored parameters so a corrupted row can't be turned into a CPU/memory bomb.
    if (![N, r, p].every(Number.isInteger) || N > 2 ** 16 || r > 8 || p > 4) return null;
    return {
      params: { N, r, p, maxmem: 128 * 1024 * 1024 },
      salt: Buffer.from(parts[4], 'base64'),
      hash: Buffer.from(parts[5], 'base64'),
    };
  }
  return null;
}

const format = (salt: Buffer, hash: Buffer) =>
  `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${hash.toString('base64')}`;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  return format(salt, crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT));
}

export function verifyPassword(password: string, stored: string): boolean {
  const p = parse(stored);
  if (!p?.salt.length || !p.hash.length) return false;
  const actual = crypto.scryptSync(password, p.salt, p.hash.length, p.params);
  return crypto.timingSafeEqual(actual, p.hash);
}

const scryptAsync = (password: string, salt: Buffer, len: number, params: Params) =>
  new Promise<Buffer>((resolve, reject) =>
    crypto.scrypt(password, salt, len, params, (e, key) => (e ? reject(e) : resolve(key))),
  );

/** Same as hashPassword, but off the event loop so a login burst can't freeze the server. */
export async function hashPasswordAsync(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  return format(salt, await scryptAsync(password, salt, KEY_LENGTH, SCRYPT));
}

export async function verifyPasswordAsync(password: string, stored: string): Promise<boolean> {
  const p = parse(stored);
  if (!p?.salt.length || !p.hash.length) return false;
  const actual = await scryptAsync(password, p.salt, p.hash.length, p.params);
  return crypto.timingSafeEqual(actual, p.hash);
}

/** A hash nobody can match, checked when an email doesn't exist so timing doesn't reveal accounts. */
const DUMMY_HASH = hashPassword(crypto.randomBytes(12).toString('hex'));
export const verifyAgainstDummy = (password: string) => verifyPasswordAsync(password, DUMMY_HASH);

const COMMON = new Set(
  (
    'password,password1,password12,password123,passw0rd,12345678,123456789,1234567890,qwerty123,' +
    'qwertyuiop,iloveyou,letmein1,welcome1,welcome123,admin123,abc12345,11111111,00000000,' +
    'football1,baseball1,monkey123,dragon123,sunshine1,princess1,superman1,biology1,biology123,' +
    'student123,school123,changeme,trustno1,whatever1,demo1234,bioplay123,biobites1,biobites123'
  ).split(','),
);

/** Why a password is not acceptable for a new account, or null if it is fine. */
export function passwordProblem(password: string, email: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`;
  const lower = password.toLowerCase();
  const local = normalizeEmail(email).split('@')[0] ?? '';
  if (COMMON.has(lower) || /^(.)\1+$/.test(password) || lower === DEMO_PASSWORD)
    return 'That password is too easy to guess. Try a longer or less common one.';
  if (local.length >= 4 && lower.includes(local))
    return 'Your password shouldn’t contain your email name.';
  return null;
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

/**
 * The demo login has a publicly known password, so it is created only in development, or when
 * DEMO_ACCOUNT=on is set deliberately. It is never created by default in production.
 */
export function shouldCreateDemo(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.DEMO_ACCOUNT === 'on') return true;
  return env.NODE_ENV !== 'production' && env.DEMO_ACCOUNT !== 'off';
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
 * further attempts are refused until the window passes. Memory is bounded so a flood of random
 * emails can't grow it without limit. (Per-IP limits in security.ts cover the attacker's side.)
 */
export class LoginLimiter {
  private failures = new Map<string, number[]>();
  constructor(
    private max = 10,
    private windowMs = 15 * 60_000,
    private maxKeys = 10_000,
  ) {}
  private recent(email: string, now: number) {
    const list = (this.failures.get(email) ?? []).filter((t) => now - t < this.windowMs);
    if (list.length) this.failures.set(email, list);
    else this.failures.delete(email);
    return list;
  }
  blocked(email: string, now: number) {
    return this.recent(email, now).length >= this.max;
  }
  fail(email: string, now: number) {
    const list = this.recent(email, now);
    list.push(now);
    this.failures.set(email, list);
    if (this.failures.size > this.maxKeys) {
      for (const k of [...this.failures.keys()]) {
        if (this.failures.size <= this.maxKeys * 0.9) break;
        if (!this.recent(k, now).length) this.failures.delete(k);
      }
      // Still full of live entries: forget the oldest ones.
      for (const k of this.failures.keys()) {
        if (this.failures.size <= this.maxKeys * 0.9) break;
        this.failures.delete(k);
      }
    }
  }
  succeed(email: string) {
    this.failures.delete(email);
  }
}
