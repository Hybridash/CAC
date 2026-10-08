import request from 'supertest';
import { describe, expect, it } from 'vitest';
import {
  AVATAR_BY_ID,
  CONCEPT_BY_ID,
  MYSTERY_BY_ID,
  mulberry32,
  mysteryReward,
} from '@bioplay/shared';
import { createApp } from '../src/app.js';
import { openDatabase } from '../src/db.js';

const m = MYSTERY_BY_ID['zombie-ants'];
const correct = {
  explanation: m.answer,
  evidence: m.evidence.flatMap((e, i) => (e.supports ? [i] : [])),
};

async function setup(unlock = true) {
  const db = openDatabase(':memory:');
  const app = createApp(db, () => new Date('2026-10-07T12:00:00Z'), mulberry32(9));
  const s = await request(app).post('/api/session');
  const auth = { Authorization: `Bearer ${s.body.token}` };
  if (unlock) {
    for (const id of m.requires) {
      const c = CONCEPT_BY_ID[id];
      const answers = c.quiz.map((q) => (q.kind === 'label' ? q.pairs.map((_, i) => i) : q.answer));
      await request(app).post(`/api/concepts/${id}/interaction`).set(auth);
      await request(app).post(`/api/concepts/${id}/quiz`).set(auth).send({ answers });
    }
  }
  return { app, auth };
}

describe('bio mysteries', () => {
  it('stays locked until the required concepts are completed', async () => {
    const t = await setup(false);
    const res = await request(t.app)
      .post(`/api/mysteries/${m.id}/solve`)
      .set(t.auth)
      .send(correct)
      .expect(403);
    expect(res.body.error).toMatch(/Locked/);
  });

  it('gives gentle feedback on a wrong answer without paying out', async () => {
    const t = await setup();
    const before = (await request(t.app).get('/api/state').set(t.auth)).body.atp;
    const res = await request(t.app)
      .post(`/api/mysteries/${m.id}/solve`)
      .set(t.auth)
      .send({ explanation: m.answer, evidence: [] })
      .expect(200);
    expect(res.body).toMatchObject({
      correct: false,
      explanationCorrect: true,
      evidenceCorrect: false,
      total: 0,
    });
    expect(res.body.state.atp).toBe(before);
  });

  it('pays the mystery reward once and grants an exclusive avatar on the first solve', async () => {
    const t = await setup();
    const res = await request(t.app)
      .post(`/api/mysteries/${m.id}/solve`)
      .set(t.auth)
      .send(correct)
      .expect(200);
    expect(res.body.correct).toBe(true);
    expect(res.body.total).toBe(mysteryReward(m.difficulty));
    expect(res.body.state.mysteriesSolved).toContain(m.id);
    expect(AVATAR_BY_ID[res.body.exclusiveAvatar].source.kind).toBe('mystery');
    const again = await request(t.app)
      .post(`/api/mysteries/${m.id}/solve`)
      .set(t.auth)
      .send(correct)
      .expect(200);
    expect(again.body).toMatchObject({
      correct: true,
      alreadySolved: true,
      total: 0,
      exclusiveAvatar: null,
    });
  });

  it('rejects unknown mysteries and malformed answers', async () => {
    const t = await setup(false);
    await request(t.app).post('/api/mysteries/nope/solve').set(t.auth).send(correct).expect(404);
    await request(t.app)
      .post(`/api/mysteries/${m.id}/solve`)
      .set(t.auth)
      .send({ explanation: 'a' })
      .expect(400);
  });
});
