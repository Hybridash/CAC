import request from 'supertest';
import { describe, expect, it } from 'vitest';
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  ensureDemoAccount,
  hashPassword,
  verifyPassword,
} from '../src/accounts.js';
import { testApp } from './helpers.js';

const creds = { email: 'Student@Gmail.com', password: 'cells4life' };

describe('Bio Bites email accounts', () => {
  it('stores only a salted hash and verifies it', () => {
    const a = hashPassword('demo123');
    const b = hashPassword('demo123');
    expect(a).not.toContain('demo123');
    expect(a).not.toBe(b);
    expect(verifyPassword('demo123', a)).toBe(true);
    expect(verifyPassword('demo124', a)).toBe(false);
  });

  it('creating an account keeps the guest’s progress and shows on the profile', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    await request(t.app).post('/api/concepts/atp/interaction').set(p.auth).expect(200);
    const res = await request(t.app)
      .post('/api/auth/email/register')
      .set(p.auth)
      .send(creds)
      .expect(201);
    expect(res.body.switched).toBe(false);
    expect(res.body.state.account).toEqual({ provider: 'email', email: 'student@gmail.com' });
    expect(res.body.state.progress.atp.interactionDoneAt).toBeTruthy();
  });

  it('logging in on another device switches to the saved player', async () => {
    const t = testApp();
    const a = await t.newPlayer();
    await request(t.app).post('/api/concepts/atp/interaction').set(a.auth).expect(200);
    await request(t.app).post('/api/auth/email/register').set(a.auth).send(creds).expect(201);
    const b = await t.newPlayer();
    const res = await request(t.app)
      .post('/api/auth/email/login')
      .set(b.auth)
      .send({ email: '  student@GMAIL.com ', password: creds.password })
      .expect(200);
    expect(res.body.switched).toBe(true);
    expect(res.body.token).toBeTruthy();
    const state = await request(t.app)
      .get('/api/state')
      .set({ Authorization: `Bearer ${res.body.token}` })
      .expect(200);
    expect(state.body.progress.atp.interactionDoneAt).toBeTruthy();
  });

  it('rejects wrong passwords, duplicates and weak input', async () => {
    const t = testApp();
    const a = await t.newPlayer();
    await request(t.app).post('/api/auth/email/register').set(a.auth).send(creds).expect(201);
    const b = await t.newPlayer();
    const wrong = await request(t.app)
      .post('/api/auth/email/login')
      .set(b.auth)
      .send({ email: creds.email, password: 'nope-nope' })
      .expect(401);
    expect(wrong.body.error).toBe('Wrong email or password.');
    await request(t.app)
      .post('/api/auth/email/login')
      .set(b.auth)
      .send({ email: 'nobody@gmail.com', password: 'whatever' })
      .expect(401);
    const dup = await request(t.app)
      .post('/api/auth/email/register')
      .set(b.auth)
      .send(creds)
      .expect(409);
    expect(dup.body.error).toMatch(/already exists/);
    const short = await request(t.app)
      .post('/api/auth/email/register')
      .set(b.auth)
      .send({ email: 'new@gmail.com', password: '123' })
      .expect(400);
    expect(short.body.error).toMatch(/at least 6/);
    await request(t.app)
      .post('/api/auth/email/register')
      .set(b.auth)
      .send({ email: 'not-an-email', password: 'longenough' })
      .expect(400);
    // A player already saved to an account can't create a second one.
    await request(t.app)
      .post('/api/auth/email/register')
      .set(a.auth)
      .send({ email: 'second@gmail.com', password: 'longenough' })
      .expect(409);
  });

  it('blocks rapid password guessing', async () => {
    const t = testApp();
    const a = await t.newPlayer();
    await request(t.app).post('/api/auth/email/register').set(a.auth).send(creds).expect(201);
    const b = await t.newPlayer();
    for (let i = 0; i < 10; i++)
      await request(t.app)
        .post('/api/auth/email/login')
        .set(b.auth)
        .send({ email: creds.email, password: `guess-${i}` })
        .expect(401);
    await request(t.app).post('/api/auth/email/login').set(b.auth).send(creds).expect(429);
    t.advanceHours(1);
    await request(t.app).post('/api/auth/email/login').set(b.auth).send(creds).expect(200);
  });

  it('the demo account exists once seeded, and seeding twice is harmless', async () => {
    const t = testApp();
    ensureDemoAccount(t.db, new Date());
    ensureDemoAccount(t.db, new Date());
    const p = await t.newPlayer();
    const res = await request(t.app)
      .post('/api/auth/email/login')
      .set(p.auth)
      .send({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
      .expect(200);
    expect(res.body.switched).toBe(true);
    expect(res.body.state.displayName).toBe('Demo');
    expect(res.body.state.account).toEqual({ provider: 'email', email: 'demo@gmail.com' });
  });
});
