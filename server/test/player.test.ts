import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { testApp } from './helpers.js';

describe('player API', () => {
  it('creates an anonymous session with an empty profile', async () => {
    const t = testApp();
    const { state } = await t.newPlayer();
    expect(state.atp).toBe(0);
    expect(state.progress).toEqual({});
  });

  it('rejects requests without a valid token', async () => {
    const t = testApp();
    await request(t.app).get('/api/state').expect(401);
    await request(t.app).get('/api/state').set('Authorization', 'Bearer nope').expect(401);
  });

  it('returns state for the token owner', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const res = await request(t.app).get('/api/state').set(p.auth).expect(200);
    expect(res.body.userId).toBe(p.state.userId);
  });

  it('cannot equip an avatar that is not owned', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    await request(t.app).post('/api/equip').set(p.auth).send({ avatarId: 'mito-cool' }).expect(403);
  });

  it('updates the display name with validation', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    await request(t.app).patch('/api/profile').set(p.auth).send({ displayName: '' }).expect(400);
    const res = await request(t.app)
      .patch('/api/profile')
      .set(p.auth)
      .send({ displayName: 'Ada' })
      .expect(200);
    expect(res.body.displayName).toBe('Ada');
  });
});
