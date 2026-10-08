import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { CONCEPT_BY_ID, CONCEPTS, conceptOfTheDay, type QuizAnswer } from '@bioplay/shared';
import { testApp } from './helpers.js';

const ids = CONCEPTS.map((c) => c.id);
/** First UTC noon (from Oct 2026) on which `pred(conceptOfTheDay)` holds. */
function dayWhere(pred: (cotd: string) => boolean): Date {
  for (let i = 0; i < 400; i++) {
    const d = new Date(Date.UTC(2026, 9, 1 + i, 12));
    if (pred(conceptOfTheDay(d.toISOString().slice(0, 10), ids))) return d;
  }
  throw new Error('no such day');
}

const insulin = CONCEPT_BY_ID.insulin;
const perfectAnswers = insulin.quiz.map((q) =>
  q.kind === 'label' ? q.pairs.map((_, i) => i) : q.answer,
) as QuizAnswer[];
const passAnswers = [...perfectAnswers.slice(0, 2), -1] as QuizAnswer[];
const failAnswers = [-1, -1, perfectAnswers[2]] as QuizAnswer[];
const sum = (lines: { reason: string; amount: number }[], skipStreak = true) =>
  lines.filter((l) => !(skipStreak && l.reason.includes('🔥'))).reduce((s, l) => s + l.amount, 0);

describe('concept rewards (server-side)', () => {
  const normalDay = dayWhere((c) => c !== 'insulin');

  it('pays the interaction reward once', async () => {
    const t = testApp(normalDay);
    const p = await t.newPlayer();
    const a = await request(t.app)
      .post('/api/concepts/insulin/interaction')
      .set(p.auth)
      .expect(200);
    expect(sum(a.body.lines)).toBe(20);
    const b = await request(t.app)
      .post('/api/concepts/insulin/interaction')
      .set(p.auth)
      .expect(200);
    expect(b.body.lines).toEqual([]);
    expect(b.body.state.atp).toBe(a.body.state.atp);
  });

  it('pays a daily streak bonus on the first activity of the day only', async () => {
    const t = testApp(normalDay);
    const p = await t.newPlayer();
    const a = await request(t.app).post('/api/concepts/insulin/interaction').set(p.auth);
    expect(a.body.lines.find((l: { reason: string }) => l.reason.includes('🔥')).amount).toBe(5);
    const b = await request(t.app)
      .post('/api/concepts/insulin/quiz')
      .set(p.auth)
      .send({ answers: failAnswers });
    expect(b.body.lines).toEqual([]);
    t.advanceHours(24);
    const c = await request(t.app).post('/api/concepts/thermoregulation/interaction').set(p.auth);
    expect(c.body.state.streak).toBe(2);
    expect(c.body.lines.find((l: { reason: string }) => l.reason.includes('🔥')).amount).toBe(10);
  });

  it('grades the quiz on the server and never pays for a failed quiz', async () => {
    const t = testApp(normalDay);
    const p = await t.newPlayer();
    const r = await request(t.app)
      .post('/api/concepts/insulin/quiz')
      .set(p.auth)
      .send({ answers: failAnswers });
    expect(r.body.score).toBe(1);
    expect(r.body.passed).toBe(false);
    expect(sum(r.body.lines)).toBe(0);
  });

  it('pass, later perfect, no farming, and a 25% review after 24h', async () => {
    const t = testApp(normalDay);
    const p = await t.newPlayer();
    const pass = await request(t.app)
      .post('/api/concepts/insulin/quiz')
      .set(p.auth)
      .send({ answers: passAnswers });
    expect(sum(pass.body.lines)).toBe(30);
    const perfect = await request(t.app)
      .post('/api/concepts/insulin/quiz')
      .set(p.auth)
      .send({ answers: perfectAnswers });
    expect(sum(perfect.body.lines)).toBe(10);
    const again = await request(t.app)
      .post('/api/concepts/insulin/quiz')
      .set(p.auth)
      .send({ answers: perfectAnswers });
    expect(sum(again.body.lines)).toBe(0);
    const tomorrow = new Date(normalDay.getTime() + 25 * 3600_000);
    t.setNow(tomorrow);
    const cotdTomorrow = conceptOfTheDay(tomorrow.toISOString().slice(0, 10), ids) === 'insulin';
    const review = await request(t.app)
      .post('/api/concepts/insulin/quiz')
      .set(p.auth)
      .send({ answers: perfectAnswers });
    expect(sum(review.body.lines)).toBe(cotdTomorrow ? 15 : 10); // 25% of (30 + 10)
  });

  it('marks the concept complete only when interaction and quiz are both done', async () => {
    const t = testApp(normalDay);
    const p = await t.newPlayer();
    const q = await request(t.app)
      .post('/api/concepts/insulin/quiz')
      .set(p.auth)
      .send({ answers: perfectAnswers });
    expect(q.body.state.progress.insulin.completedAt).toBeNull();
    const i = await request(t.app).post('/api/concepts/insulin/interaction').set(p.auth);
    expect(i.body.state.progress.insulin.completedAt).not.toBeNull();
  });

  it('applies the Concept of the Day ×1.5 multiplier', async () => {
    const t = testApp(dayWhere((c) => c === 'insulin'));
    const p = await t.newPlayer();
    const r = await request(t.app).post('/api/concepts/insulin/interaction').set(p.auth);
    expect(sum(r.body.lines)).toBe(30);
  });

  it('rejects unknown concepts and malformed answers', async () => {
    const t = testApp(normalDay);
    const p = await t.newPlayer();
    await request(t.app).post('/api/concepts/nope/interaction').set(p.auth).expect(404);
    await request(t.app)
      .post('/api/concepts/insulin/quiz')
      .set(p.auth)
      .send({ answers: 'all correct' })
      .expect(400);
    await request(t.app)
      .post('/api/concepts/insulin/quiz')
      .set(p.auth)
      .send({ answers: [1, 2, 3], atp: 9999 })
      .expect(200);
    const s = await request(t.app).get('/api/state').set(p.auth);
    expect(s.body.atp).toBeLessThan(100);
  });

  it('records rewards in the ledger', async () => {
    const t = testApp(normalDay);
    const p = await t.newPlayer();
    const r = await request(t.app).post('/api/concepts/insulin/interaction').set(p.auth);
    const total = t.db
      .prepare('SELECT SUM(amount) AS s FROM ledger WHERE user_id = ?')
      .get(r.body.state.userId) as { s: number };
    expect(total.s).toBe(r.body.state.atp);
  });
});
