import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  hashPassword,
  LoginLimiter,
  passwordProblem,
  shouldCreateDemo,
  verifyPassword,
} from '../src/accounts.js';
import { openDatabase } from '../src/db.js';
import { HttpError } from '../src/http.js';
import { LIMITS } from '../src/limits.js';
import { createSession, getUserByToken, MAX_SESSIONS_PER_USER } from '../src/repo.js';
import { ConcurrencyGate, RateLimiter } from '../src/security.js';
import type { Tutor } from '../src/tutor.js';
import { testApp } from './helpers.js';

const fakeTutor: Tutor = async () => 'Cells use ATP.';
const ask = (text = 'What is ATP?') => ({
  lessonId: 'atp',
  messages: [{ role: 'user', text }],
});
const GOOD_PASSWORD = 'Biology-rocks-9';

/** Run a block with temporary environment variables. */
async function withEnv<T>(vars: Record<string, string | undefined>, fn: () => Promise<T> | T) {
  const before: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    before[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    return await fn();
  } finally {
    for (const [k, v] of Object.entries(before)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

afterEach(() => vi.restoreAllMocks());

describe('unauthenticated access is refused', () => {
  const protectedRoutes: [string, string, object?][] = [
    ['get', '/api/state'],
    ['patch', '/api/profile', { displayName: 'x' }],
    ['post', '/api/equip', { avatarId: null }],
    ['post', '/api/auth/sign-out'],
    ['post', '/api/auth/sign-out-all'],
    ['post', '/api/auth/email/register', { email: 'a@b.co', password: 'longenough1' }],
    ['post', '/api/auth/email/login', { email: 'a@b.co', password: 'x' }],
    ['post', '/api/auth/google', { idToken: 'x'.repeat(30) }],
    ['get', '/api/chat/status'],
    ['post', '/api/chat', ask()],
    ['post', '/api/shop/packs', { tier: 'basic' }],
    ['post', '/api/shop/avatars/cell-buddy'],
    ['post', '/api/concepts/atp/interaction'],
    ['post', '/api/concepts/atp/quiz', { answers: [] }],
    ['post', '/api/mysteries/zombie-ants/solve', { explanation: 0, evidence: [] }],
  ];

  it.each(protectedRoutes)('%s %s without a token → 401', async (method, url, body) => {
    const t = testApp();
    const req = (request(t.app) as unknown as Record<string, (u: string) => request.Test>)[method](
      url,
    );
    const res = await (body ? req.send(body) : req);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Not signed in' });
  });

  it.each([
    'Bearer ',
    'Bearer not-a-real-token',
    'Basic dXNlcjpwYXNz',
    'bearer lowercase-scheme',
    `Bearer ${'a'.repeat(5000)}`,
    "Bearer ' OR '1'='1",
  ])('a bad Authorization header (%s) → 401', async (header) => {
    const t = testApp();
    await request(t.app).get('/api/state').set('Authorization', header).expect(401);
  });
});

describe('players cannot reach each other’s data', () => {
  it('a profile request cannot name another player', async () => {
    const t = testApp();
    const a = await t.newPlayer();
    const b = await t.newPlayer();
    // A body that tries to point at B is ignored: only the token decides whose record changes.
    await request(t.app)
      .patch('/api/profile')
      .set(a.auth)
      .send({ displayName: 'Alice', userId: b.state.userId, id: b.state.userId })
      .expect(200);
    const bState = await request(t.app).get('/api/state').set(b.auth).expect(200);
    expect(bState.body.displayName).toBe('Explorer');
    expect(bState.body.userId).toBe(b.state.userId);
  });

  it('player B cannot equip an avatar only player A owns', async () => {
    const t = testApp();
    const a = await t.newPlayer();
    const b = await t.newPlayer();
    t.db
      .prepare('INSERT INTO inventory (user_id, avatar_id, count, acquired_at) VALUES (?, ?, 1, ?)')
      .run(a.state.userId, 'rare-owned-by-a', '2026-10-07T00:00:00Z');
    await request(t.app)
      .post('/api/equip')
      .set(a.auth)
      .send({ avatarId: 'rare-owned-by-a' })
      .expect(200);
    await request(t.app)
      .post('/api/equip')
      .set(b.auth)
      .send({ avatarId: 'rare-owned-by-a' })
      .expect(403);
  });

  it('progress, ATP and inventory belong to the token’s player only', async () => {
    const t = testApp();
    const a = await t.newPlayer();
    const b = await t.newPlayer();
    await request(t.app).post('/api/concepts/atp/interaction').set(a.auth).expect(200);
    const aState = (await request(t.app).get('/api/state').set(a.auth)).body;
    const bState = (await request(t.app).get('/api/state').set(b.auth)).body;
    expect(aState.atp).toBeGreaterThan(0);
    expect(bState.atp).toBe(0);
    expect(Object.keys(bState.progress)).toHaveLength(0);
    // The response never contains another player's id, session tokens or password hashes.
    const text = JSON.stringify(aState);
    expect(text).not.toContain(b.state.userId);
    expect(text).not.toMatch(/token|password|hash/i);
  });

  it('paying for a pack needs the caller’s own balance', async () => {
    const t = testApp();
    const a = await t.newPlayer();
    const b = await t.newPlayer();
    t.db.prepare('UPDATE users SET atp = 5000 WHERE id = ?').run(a.state.userId);
    await request(t.app).post('/api/shop/packs').set(b.auth).send({ tier: 'legendary' }).expect(402);
    await request(t.app).post('/api/shop/packs').set(a.auth).send({ tier: 'legendary' }).expect(200);
  });

  it('clients cannot supply roles, balances or any reward amount', async () => {
    const t = testApp();
    const a = await t.newPlayer();
    await request(t.app)
      .patch('/api/profile')
      .set(a.auth)
      .send({ displayName: 'Hax', atp: 99999, role: 'admin', nucleotides: 99999 })
      .expect(200);
    const state = (await request(t.app).get('/api/state').set(a.auth)).body;
    expect(state.atp).toBe(0);
    expect(state.nucleotides).toBe(0);
  });
});

describe('sessions', () => {
  it('a token stops working after 90 idle days', async () => {
    const t = testApp(new Date('2026-01-01T00:00:00Z'));
    const p = await t.newPlayer();
    await request(t.app).get('/api/state').set(p.auth).expect(200);
    t.advanceHours(24 * 91);
    await request(t.app).get('/api/state').set(p.auth).expect(401);
    // And the dead session row is removed.
    expect(t.db.prepare('SELECT COUNT(*) AS n FROM sessions').get()).toEqual({ n: 0 });
  });

  it('active use keeps a session alive, but not past 365 days', async () => {
    const t = testApp(new Date('2026-01-01T00:00:00Z'));
    const p = await t.newPlayer();
    for (let i = 0; i < 6; i++) {
      t.advanceHours(24 * 60);
      await request(t.app).get('/api/state').set(p.auth).expect(200);
    }
    t.advanceHours(24 * 60); // 420 days after sign-in
    await request(t.app).get('/api/state').set(p.auth).expect(401);
  });

  it('sign-out revokes only that device; sign-out-all revokes every device', async () => {
    const t = testApp();
    const a = await t.newPlayer();
    const second = createSession(t.db, a.state.userId, new Date('2026-10-07T12:00:00Z'));
    const secondAuth = { Authorization: `Bearer ${second}` };
    await request(t.app).post('/api/auth/sign-out').set(a.auth).expect(204);
    await request(t.app).get('/api/state').set(a.auth).expect(401);
    await request(t.app).get('/api/state').set(secondAuth).expect(200);
    await request(t.app).post('/api/auth/sign-out-all').set(secondAuth).expect(204);
    await request(t.app).get('/api/state').set(secondAuth).expect(401);
  });

  it('one player can hold at most 20 sessions; the oldest are dropped', () => {
    const db = openDatabase(':memory:');
    const now = new Date('2026-10-07T12:00:00Z');
    const userId = crypto.randomUUID();
    db.prepare('INSERT INTO users (id, token_hash, created_at) VALUES (?, ?, ?)').run(
      userId,
      'x',
      now.toISOString(),
    );
    const tokens = Array.from({ length: MAX_SESSIONS_PER_USER + 5 }, (_, i) =>
      createSession(db, userId, new Date(now.getTime() + i * 1000)),
    );
    expect(db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE user_id = ?').get(userId)).toEqual({
      n: MAX_SESSIONS_PER_USER,
    });
    expect(getUserByToken(db, tokens[0], now)).toBeUndefined();
    expect(getUserByToken(db, tokens.at(-1)!, now)?.id).toBe(userId);
  });

  it('tokens are stored only as hashes', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const rows = t.db.prepare('SELECT token_hash FROM sessions').all() as { token_hash: string }[];
    expect(rows.map((r) => r.token_hash)).not.toContain(p.token);
    expect(rows[0].token_hash).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('rate limits', () => {
  it('creating anonymous players is limited per IP, with Retry-After, and resets', async () => {
    const t = testApp();
    const first = LIMITS.session[0];
    for (let i = 0; i < first.max; i++) await request(t.app).post('/api/session').expect(201);
    const blocked = await request(t.app).post('/api/session');
    expect(blocked.status).toBe(429);
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    t.advanceHours(0.2); // 12 minutes: the 10-minute window has passed
    await request(t.app).post('/api/session').expect(201);
  });

  it('a spoofed X-Forwarded-For cannot dodge the limit unless a proxy is trusted', async () => {
    const t = testApp();
    const max = LIMITS.session[0].max;
    for (let i = 0; i < max; i++)
      await request(t.app).post('/api/session').set('X-Forwarded-For', `10.0.${i}.1`).expect(201);
    await request(t.app).post('/api/session').set('X-Forwarded-For', '203.0.113.99').expect(429);
  });

  it('behind one trusted proxy, each real client IP gets its own allowance', async () => {
    await withEnv({ TRUST_PROXY: '1' }, async () => {
      const t = testApp();
      const max = LIMITS.session[0].max;
      for (let i = 0; i < max; i++)
        await request(t.app)
          .post('/api/session')
          .set('X-Forwarded-For', '198.51.100.7')
          .expect(201);
      await request(t.app).post('/api/session').set('X-Forwarded-For', '198.51.100.7').expect(429);
      await request(t.app).post('/api/session').set('X-Forwarded-For', '198.51.100.8').expect(201);
    });
  });

  it('wrong passwords lock one email after 10 tries, even for the right password', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    await request(t.app)
      .post('/api/auth/email/register')
      .set(p.auth)
      .send({ email: 'lock@gmail.com', password: GOOD_PASSWORD })
      .expect(201);
    const other = await t.newPlayer();
    const login = (password: string) =>
      request(t.app)
        .post('/api/auth/email/login')
        .set(other.auth)
        .send({ email: 'lock@gmail.com', password });
    for (let i = 0; i < 10; i++) await login(`wrong-${i}`).expect(401);
    const locked = await login(GOOD_PASSWORD);
    expect(locked.status).toBe(429);
    expect(Number(locked.headers['retry-after'])).toBeGreaterThan(0);
    t.advanceHours(0.3); // 18 minutes
    await login(GOOD_PASSWORD).expect(200);
  });

  it('one IP guessing across many emails is stopped too', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    for (let i = 0; i < LIMITS.loginFailuresPerIp.max; i++)
      await request(t.app)
        .post('/api/auth/email/login')
        .set(p.auth)
        .send({ email: `nobody${i}@gmail.com`, password: 'guess-guess' })
        .expect(401);
    await request(t.app)
      .post('/api/auth/email/login')
      .set(p.auth)
      .send({ email: 'fresh@gmail.com', password: 'guess-guess' })
      .expect(429);
  });

  it('registration is limited per IP', async () => {
    const t = testApp();
    const max = LIMITS.auth.register[0].max;
    const p = await t.newPlayer();
    for (let i = 0; i < max; i++)
      await request(t.app)
        .post('/api/auth/email/register')
        .set(p.auth)
        .send({ email: `kid${i}@gmail.com`, password: GOOD_PASSWORD });
    const extra = await request(t.app)
      .post('/api/auth/email/register')
      .set(p.auth)
      .send({ email: 'x@gmail.com', password: GOOD_PASSWORD });
    expect(extra.status).toBe(429);
  });

  it('state-changing requests are capped per IP', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    let last = 200;
    for (let i = 0; i < LIMITS.writes.max + 5 && last !== 429; i++)
      last = (await request(t.app).patch('/api/profile').set(p.auth).send({ displayName: 'n' }))
        .status;
    expect(last).toBe(429);
  });

  describe('Bio Bot cost protection', () => {
    it('one player cannot fire questions faster than the burst limit', async () => {
      const t = testApp(undefined, undefined, fakeTutor);
      const p = await t.newPlayer();
      for (let i = 0; i < LIMITS.chat.perUserBurst.max; i++)
        await request(t.app).post('/api/chat').set(p.auth).send(ask()).expect(200);
      const res = await request(t.app).post('/api/chat').set(p.auth).send(ask());
      expect(res.status).toBe(429);
      expect(res.headers['retry-after']).toBeDefined();
    });

    it('many fake players behind one IP share one IP allowance', async () => {
      const t = testApp(undefined, undefined, fakeTutor);
      const perMinute = LIMITS.chat.perIp[0].max;
      for (let i = 0; i < perMinute; i++) {
        const p = await t.newPlayer();
        await request(t.app).post('/api/chat').set(p.auth).send(ask()).expect(200);
      }
      const p = await t.newPlayer();
      await request(t.app).post('/api/chat').set(p.auth).send(ask()).expect(429);
    });

    it('the server-wide daily ceiling stops spend, and failed answers are refunded', async () => {
      await withEnv({ CHAT_GLOBAL_DAILY_LIMIT: '2' }, async () => {
        const t = testApp(undefined, undefined, fakeTutor);
        const [a, b, c] = [await t.newPlayer(), await t.newPlayer(), await t.newPlayer()];
        await request(t.app).post('/api/chat').set(a.auth).send(ask()).expect(200);
        await request(t.app).post('/api/chat').set(b.auth).send(ask()).expect(200);
        await request(t.app).post('/api/chat').set(c.auth).send(ask()).expect(503);
        expect(t.db.prepare('SELECT count FROM chat_global').get()).toEqual({ count: 2 });
        // Next day the budget resets.
        t.advanceHours(25);
        await request(t.app).post('/api/chat').set(c.auth).send(ask()).expect(200);
      });
      await withEnv({ CHAT_GLOBAL_DAILY_LIMIT: '1' }, async () => {
        const broken: Tutor = async () => {
          throw new Error('upstream down');
        };
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const t = testApp(undefined, undefined, broken);
        const a = await t.newPlayer();
        await request(t.app).post('/api/chat').set(a.auth).send(ask()).expect(500);
        expect(t.db.prepare('SELECT count FROM chat_global').get()).toEqual({ count: 0 });
      });
    });

    it('a player cannot run two AI calls at once', async () => {
      let release: (() => void) | undefined;
      const slow: Tutor = () => new Promise((resolve) => (release = () => resolve('done')));
      const t = testApp(undefined, undefined, slow);
      const p = await t.newPlayer();
      const first = request(t.app)
        .post('/api/chat')
        .set(p.auth)
        .send(ask())
        .then((r) => r);
      await vi.waitFor(() => expect(release).toBeTypeOf('function'));
      const second = await request(t.app).post('/api/chat').set(p.auth).send(ask('another one'));
      expect(second.status).toBe(429);
      release!();
      expect((await first).status).toBe(200);
    });

    it('a player’s own daily quota still applies and is not shared', async () => {
      await withEnv({ CHAT_DAILY_LIMIT: '2' }, async () => {
        const t = testApp(undefined, undefined, fakeTutor);
        const a = await t.newPlayer();
        const b = await t.newPlayer();
        await request(t.app).post('/api/chat').set(a.auth).send(ask()).expect(200);
        await request(t.app).post('/api/chat').set(a.auth).send(ask()).expect(200);
        await request(t.app).post('/api/chat').set(a.auth).send(ask()).expect(429);
        await request(t.app).post('/api/chat').set(b.auth).send(ask()).expect(200);
      });
    });
  });
});

describe('RateLimiter, ConcurrencyGate and LoginLimiter', () => {
  it('slides the window and reports when to retry', () => {
    let now = new Date('2026-01-01T00:00:00Z');
    const rl = new RateLimiter(() => now);
    const limit = { max: 3, windowMs: 60_000 };
    expect([1, 2, 3].map(() => rl.consume('k', limit).ok)).toEqual([true, true, true]);
    const blocked = rl.consume('k', limit);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBe(60);
    now = new Date(now.getTime() + 61_000);
    expect(rl.consume('k', limit).ok).toBe(true);
    expect(rl.peek('k', limit)).toBe(1);
    rl.clear('k');
    expect(rl.peek('k', limit)).toBe(0);
  });

  it('keeps memory bounded when flooded with unique keys', () => {
    const now = new Date('2026-01-01T00:00:00Z');
    const rl = new RateLimiter(() => now, 100);
    for (let i = 0; i < 5000; i++) rl.consume(`ip-${i}`, { max: 5, windowMs: 3600_000 });
    expect((rl as unknown as { hits: Map<string, number[]> }).hits.size).toBeLessThanOrEqual(100);
  });

  it('caps concurrent work globally and per key, and releases once', () => {
    const gate = new ConcurrencyGate(2, 1);
    const a = gate.enter('a');
    expect(a).toBeTypeOf('function');
    expect(gate.enter('a')).toBeNull();
    const b = gate.enter('b');
    expect(b).toBeTypeOf('function');
    expect(gate.enter('c')).toBeNull();
    a!();
    a!(); // double release must not free extra capacity
    expect(gate.enter('c')).toBeTypeOf('function');
    expect(gate.enter('d')).toBeNull();
  });

  it('the login limiter forgets old failures and stays bounded', () => {
    const l = new LoginLimiter(3, 1000, 50);
    for (let i = 0; i < 3; i++) l.fail('a@b.co', 0);
    expect(l.blocked('a@b.co', 500)).toBe(true);
    expect(l.blocked('a@b.co', 2000)).toBe(false);
    for (let i = 0; i < 500; i++) l.fail(`u${i}@b.co`, 3000);
    expect((l as unknown as { failures: Map<string, number[]> }).failures.size).toBeLessThanOrEqual(
      50,
    );
  });
});

describe('request size and malformed input', () => {
  it('rejects oversized bodies with 413 and malformed JSON with 400 (no stack traces)', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const big = await request(t.app)
      .patch('/api/profile')
      .set(p.auth)
      .send({ displayName: 'a'.repeat(100_000) });
    expect(big.status).toBe(413);
    const bad = await request(t.app)
      .patch('/api/profile')
      .set(p.auth)
      .set('Content-Type', 'application/json')
      .send('{"displayName": ');
    expect(bad.status).toBe(400);
    for (const r of [big, bad]) {
      expect(JSON.stringify(r.body)).not.toMatch(/node_modules|at \w+ \(|SyntaxError|\/Users\//);
    }
  });

  it('does not parse non-JSON content types as JSON', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const res = await request(t.app)
      .patch('/api/profile')
      .set(p.auth)
      .set('Content-Type', 'text/plain')
      .send('displayName=hax');
    expect(res.status).toBe(400);
  });

  it('validates types, ranges and lengths on the server', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const patch = (body: object) => request(t.app).patch('/api/profile').set(p.auth).send(body);
    await patch({ displayName: '' }).expect(400);
    await patch({ displayName: 'x'.repeat(25) }).expect(400);
    await patch({ displayName: { $ne: 1 } }).expect(400);
    const post = (url: string, body: object) =>
      request(t.app).post(url).set(p.auth).send(body);
    await post('/api/shop/packs', { tier: 'free' }).expect(400);
    await post('/api/concepts/atp/quiz', { answers: ['0'] }).expect(400);
    await post('/api/concepts/atp/quiz', { answers: Array(50).fill(0) }).expect(400);
    await post('/api/mysteries/zombie-ants/solve', { explanation: -1, evidence: [] }).expect(400);
    await post('/api/chat', { lessonId: 'atp', messages: [] }).expect(400);
  });
});

describe('injection and unsafe input', () => {
  it('SQL injection strings are treated as plain data', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const evil = ["' OR '1'='1", "x'; DROP TABLE users;--", '" OR ""="', '1; SELECT * FROM sessions'];
    for (const e of evil) {
      const login = await request(t.app)
        .post('/api/auth/email/login')
        .set(p.auth)
        .send({ email: e, password: e });
      expect([400, 401]).toContain(login.status);
      await request(t.app).post(`/api/shop/avatars/${encodeURIComponent(e)}`).set(p.auth).expect(404);
      await request(t.app)
        .post(`/api/concepts/${encodeURIComponent(e)}/interaction`)
        .set(p.auth)
        .expect(404);
      const name = await request(t.app)
        .patch('/api/profile')
        .set(p.auth)
        .send({ displayName: e.slice(0, 24) });
      expect(name.status).toBe(200);
      expect(name.body.displayName).toBe(e.slice(0, 24).trim());
    }
    // The tables are all still there and the data is intact.
    expect(t.db.prepare('SELECT COUNT(*) AS n FROM users').get()).toEqual({ n: 1 });
    expect(t.db.prepare('SELECT COUNT(*) AS n FROM sessions').get()).toEqual({ n: 1 });
  });

  it('path traversal in ids finds nothing', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    for (const id of ['../../etc/passwd', '..%2f..%2fetc%2fpasswd', '%2e%2e/%2e%2e/secret'])
      await request(t.app).post(`/api/concepts/${id}/interaction`).set(p.auth).expect(404);
  });

  it('script text in a name is stored literally and returned as JSON, never as HTML', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const res = await request(t.app)
      .patch('/api/profile')
      .set(p.auth)
      .send({ displayName: '<img src=x onerror=1>' })
      .expect(200);
    expect(res.type).toBe('application/json');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.body.displayName).toBe('<img src=x onerror=1>');
  });

  it('the development landing page escapes the requested path', async () => {
    await withEnv({ NODE_ENV: 'development' }, async () => {
      const t = testApp();
      const res = await request(t.app).get('/%22%3E%3Cscript%3Ealert(1)%3C/script%3E');
      expect(res.text).not.toMatch(/<script/i);
      const href = res.text.match(/runs at <a href="([^"]*)"/)?.[1] ?? '';
      expect(href).toMatch(/^[\w\-./:]+$/); // only safe characters can reach the link
    });
  });
});

describe('passwords and accounts', () => {
  it('rejects short, common, repeated and email-derived passwords', () => {
    expect(passwordProblem('short1', 'a@b.co')).toMatch(/at least 8/);
    expect(passwordProblem('password123', 'a@b.co')).toMatch(/easy to guess/);
    expect(passwordProblem('aaaaaaaaaa', 'a@b.co')).toMatch(/easy to guess/);
    expect(passwordProblem('demo123', 'a@b.co')).toMatch(/at least 8/);
    expect(passwordProblem('mitochondria-kid', 'mitochondria@gmail.com')).toMatch(/email name/);
    expect(passwordProblem(GOOD_PASSWORD, 'student@gmail.com')).toBeNull();
  });

  it('registration enforces the policy on the server', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const weak = await request(t.app)
      .post('/api/auth/email/register')
      .set(p.auth)
      .send({ email: 'w@gmail.com', password: 'password123' });
    expect(weak.status).toBe(400);
    expect(weak.body.error).toMatch(/easy to guess/);
    await request(t.app)
      .post('/api/auth/email/register')
      .set(p.auth)
      .send({ email: 'w@gmail.com', password: GOOD_PASSWORD })
      .expect(201);
  });

  it('two simultaneous registrations of one email: exactly one wins', async () => {
    const t = testApp();
    const [a, b] = [await t.newPlayer(), await t.newPlayer()];
    const send = (p: typeof a) =>
      request(t.app)
        .post('/api/auth/email/register')
        .set(p.auth)
        .send({ email: 'race@gmail.com', password: GOOD_PASSWORD });
    const results = await Promise.all([send(a), send(b)]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
  });

  it('passwords are never returned, and hashes use salted scrypt', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const res = await request(t.app)
      .post('/api/auth/email/register')
      .set(p.auth)
      .send({ email: 'safe@gmail.com', password: GOOD_PASSWORD })
      .expect(201);
    expect(JSON.stringify(res.body)).not.toContain(GOOD_PASSWORD);
    const row = t.db.prepare('SELECT password_hash FROM email_accounts').get() as {
      password_hash: string;
    };
    expect(row.password_hash).toMatch(/^scrypt\$32768\$8\$1\$/);
    expect(row.password_hash).not.toContain('Biology');
  });

  it('old (pre-upgrade) hashes still verify, and absurd stored parameters are refused', () => {
    const salt = crypto.randomBytes(16);
    const legacy = `scrypt$${salt.toString('base64')}$${crypto.scryptSync('oldpass99', salt, 32).toString('base64')}`;
    expect(verifyPassword('oldpass99', legacy)).toBe(true);
    expect(verifyPassword('nope', legacy)).toBe(false);
    expect(verifyPassword('x', `scrypt$4294967296$8$1$${salt.toString('base64')}$AAAA`)).toBe(false);
    expect(verifyPassword('x', 'plaintext-stored-by-mistake')).toBe(false);
    expect(verifyPassword(GOOD_PASSWORD, hashPassword(GOOD_PASSWORD))).toBe(true);
  });

  it('login answers the same for unknown and known emails (no account probing)', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    await request(t.app)
      .post('/api/auth/email/register')
      .set(p.auth)
      .send({ email: 'known@gmail.com', password: GOOD_PASSWORD })
      .expect(201);
    const q = await t.newPlayer();
    const attempt = async (email: string) => {
      const s = performance.now();
      const r = await request(t.app)
        .post('/api/auth/email/login')
        .set(q.auth)
        .send({ email, password: 'wrong-password-1' });
      expect(r.status).toBe(401);
      expect(r.body.error).toBe('Wrong email or password.');
      return performance.now() - s;
    };
    const known = await attempt('known@gmail.com');
    const unknown = await attempt('unknown@gmail.com');
    expect(unknown).toBeGreaterThan(known * 0.4); // both pay for a hash; unknown isn't instant
  });

  it('the public demo password works in development and is off by default in production', () => {
    expect(shouldCreateDemo({ NODE_ENV: 'development' })).toBe(true);
    expect(shouldCreateDemo({ NODE_ENV: 'development', DEMO_ACCOUNT: 'off' })).toBe(false);
    expect(shouldCreateDemo({ NODE_ENV: 'production' })).toBe(false);
    expect(shouldCreateDemo({ NODE_ENV: 'production', DEMO_ACCOUNT: 'on' })).toBe(true);
  });
});

describe('OAuth sign-in', () => {
  it('rejects unknown providers, malformed tokens and tokens the verifier refuses', async () => {
    const reject = vi.fn(async () => {
      throw new HttpError(401, 'Google sign-in could not be verified');
    });
    const t = testApp(undefined, reject);
    const p = await t.newPlayer();
    await request(t.app)
      .post('/api/auth/facebook')
      .set(p.auth)
      .send({ idToken: 'x'.repeat(30) })
      .expect(404);
    await request(t.app).post('/api/auth/google').set(p.auth).send({ idToken: 'short' }).expect(400);
    await request(t.app)
      .post('/api/auth/google')
      .set(p.auth)
      .send({ idToken: 'x'.repeat(30) })
      .expect(401);
    expect(t.db.prepare('SELECT COUNT(*) AS n FROM identities').get()).toEqual({ n: 0 });
  });

  it('there are no redirect parameters anywhere in the API to abuse', () => {
    const dir = path.resolve(__dirname, '../src');
    const files = [path.join(dir, 'app.ts'), ...fs.readdirSync(path.join(dir, 'routes')).map((f) => path.join(dir, 'routes', f))];
    const source = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
    expect(source).not.toMatch(/res\.redirect|redirect_uri|returnTo|\bnext=/);
  });
});

describe('headers, CORS and information disclosure', () => {
  it('sets security headers and hides the framework', async () => {
    const t = testApp();
    const res = await request(t.app).get('/api/health').expect(200);
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['cache-control']).toBe('no-store');
    const csp = res.headers['content-security-policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(csp).not.toMatch(/script-src[^;]*unsafe-eval/);
  });

  it('turns on HSTS in production only', async () => {
    const dev = testApp();
    expect(
      (await request(dev.app).get('/api/health')).headers['strict-transport-security'],
    ).toBeUndefined();
    await withEnv({ NODE_ENV: 'production' }, async () => {
      const prod = testApp();
      expect(
        (await request(prod.app).get('/api/health')).headers['strict-transport-security'],
      ).toMatch(/max-age=31536000/);
    });
  });

  it('health shows process details only to the local machine', async () => {
    await withEnv({ TRUST_PROXY: '1' }, async () => {
      const t = testApp();
      const stranger = await request(t.app).get('/api/health').set('X-Forwarded-For', '8.8.8.8');
      expect(stranger.body).toEqual({ ok: true });
    });
    const t = testApp();
    const local = await request(t.app).get('/api/health');
    expect(local.body.pid).toBe(process.pid);
  });

  it('allows only the configured origins to read API responses', async () => {
    await withEnv({ CLIENT_ORIGIN: 'https://biobites.example' }, async () => {
      const t = testApp();
      const ok = await request(t.app).get('/api/health').set('Origin', 'https://biobites.example');
      expect(ok.headers['access-control-allow-origin']).toBe('https://biobites.example');
      const ios = await request(t.app).get('/api/health').set('Origin', 'capacitor://localhost');
      expect(ios.headers['access-control-allow-origin']).toBe('capacitor://localhost');
      for (const evil of ['https://evil.example', 'https://biobites.example.evil.example', 'null']) {
        const res = await request(t.app).get('/api/health').set('Origin', evil);
        expect(res.headers['access-control-allow-origin']).toBeUndefined();
        const pre = await request(t.app)
          .options('/api/state')
          .set('Origin', evil)
          .set('Access-Control-Request-Method', 'GET');
        expect(pre.headers['access-control-allow-origin']).toBeUndefined();
      }
      expect(ok.headers['access-control-allow-credentials']).toBeUndefined();
    });
  });

  it('server errors return a generic message with no internals', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    t.db.prepare('DROP TABLE concept_progress').run(); // force an unexpected failure
    const res = await request(t.app).get('/api/state').set(p.auth);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Something went wrong' });
  });

  it('unknown API routes return a plain 404', async () => {
    const t = testApp();
    const res = await request(t.app).get('/api/admin/users').expect(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });

  it('there are no admin or debug endpoints in the router', () => {
    const dir = path.resolve(__dirname, '../src/routes');
    const text = fs
      .readdirSync(dir)
      .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
      .join('\n');
    expect(text).not.toMatch(/['"`]\/(admin|debug|internal|metrics|__)/);
  });
});

describe('storage', () => {
  it('creates the database file and folder readable by the server user only', () => {
    if (process.platform === 'win32') return;
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'biobites-db-'));
    const file = path.join(dir, 'data', 'test.db');
    const db = openDatabase(file);
    db.close();
    expect(fs.statSync(file).mode & 0o077).toBe(0);
    expect(fs.statSync(path.dirname(file)).mode & 0o077).toBe(0);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('migrations are idempotent and keep the expiry columns', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'biobites-mig-'));
    const file = path.join(dir, 'm.db');
    openDatabase(file).close();
    const again = openDatabase(file);
    const cols = (again.prepare("PRAGMA table_info('sessions')").all() as { name: string }[]).map(
      (c) => c.name,
    );
    expect(cols).toContain('last_used_at');
    again.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('secrets never reach the browser', () => {
  const dist = path.resolve(__dirname, '../../client/dist');
  const sources = path.resolve(__dirname, '../../client/src');

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? walk(p) : [p];
    });

  const SECRET_PATTERNS: [string, RegExp][] = [
    ['Google API key', /AIza[0-9A-Za-z_-]{35}/],
    ['secret-style key', /\bsk-[A-Za-z0-9]{20,}/],
    ['private key block', /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ['server env var name', /GEMINI_API_KEY|x-goog-api-key/],
    ['AWS access key', /AKIA[0-9A-Z]{16}/],
  ];

  it.skipIf(!fs.existsSync(dist))(
    'the production bundle contains no secrets and no source maps',
    () => {
      const files = walk(dist);
      expect(files.filter((f) => f.endsWith('.map'))).toEqual([]);
      for (const f of files.filter((f) => /\.(js|css|html|webmanifest|json)$/.test(f))) {
        const text = fs.readFileSync(f, 'utf8');
        for (const [name, re] of SECRET_PATTERNS)
          expect(re.test(text), `${name} in ${path.basename(f)}`).toBe(false);
      }
    },
  );

  it('client code only reads public VITE_ settings (client IDs and the API address)', () => {
    const allowed = new Set([
      'VITE_API_URL',
      'VITE_GOOGLE_IOS_CLIENT_ID',
      'VITE_GOOGLE_WEB_CLIENT_ID',
      'VITE_APPLE_SERVICE_ID',
      'VITE_SHOW_DEMO_LOGIN',
    ]);
    const used = new Set(
      walk(sources)
        .filter((f) => /\.(ts|tsx)$/.test(f))
        .flatMap((f) => fs.readFileSync(f, 'utf8').match(/VITE_[A-Z0-9_]+/g) ?? []),
    );
    for (const name of used) {
      expect(allowed.has(name), `${name} is not on the public-settings allowlist`).toBe(true);
      expect(name).not.toMatch(/KEY|SECRET|TOKEN|PASSWORD/);
    }
  });

  it('the repo ignores .env files but ships a safe .env.example', () => {
    const root = path.resolve(__dirname, '../..');
    const ignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
    expect(ignore).toMatch(/^\.env$/m);
    expect(ignore).toMatch(/^\.env\.\*$/m);
    const example = fs.readFileSync(path.join(root, '.env.example'), 'utf8');
    expect(example).toMatch(/GEMINI_API_KEY=\s*$/m);
    expect(example).not.toMatch(/AIza|sk-[A-Za-z0-9]{10,}/);
  });
});
