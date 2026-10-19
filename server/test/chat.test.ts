import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CHAT_DAILY_LIMIT } from '../src/routes/chat.js';
import { DECLINED_REPLY, geminiTutor, type Tutor, type TutorMessage } from '../src/tutor.js';
import { testApp } from './helpers.js';

const ask = (text: string, lessonId = 'hs-enzymes') => ({
  lessonId,
  messages: [{ role: 'user', text }],
});

function fakeTutor(reply = 'Enzymes lower activation energy.') {
  const calls: { system: string; messages: TutorMessage[] }[] = [];
  const tutor: Tutor = async (system, messages) => {
    calls.push({ system, messages });
    return reply;
  };
  return { tutor, calls };
}

afterEach(() => {
  delete process.env.CHAT_DAILY_LIMIT;
});

describe('Bio Bot chat', () => {
  it('is off, and says so, when no AI key is configured', async () => {
    const t = testApp();
    const p = await t.newPlayer();
    const s = await request(t.app).get('/api/chat/status').set(p.auth).expect(200);
    expect(s.body).toEqual({
      enabled: false,
      limit: DEFAULT_CHAT_DAILY_LIMIT,
      remaining: DEFAULT_CHAT_DAILY_LIMIT,
    });
    const res = await request(t.app).post('/api/chat').set(p.auth).send(ask('hi')).expect(503);
    expect(res.body.error).toMatch(/isn’t switched on/);
  });

  it('requires a player session', async () => {
    const { tutor } = fakeTutor();
    const t = testApp(undefined, undefined, tutor);
    await request(t.app).post('/api/chat').send(ask('hi')).expect(401);
  });

  it('answers with the lesson as context and counts down the daily allowance', async () => {
    const { tutor, calls } = fakeTutor();
    const t = testApp(undefined, undefined, tutor);
    const p = await t.newPlayer();
    const res = await request(t.app)
      .post('/api/chat')
      .set(p.auth)
      .send({
        lessonId: 'hs-enzymes',
        messages: [
          { role: 'bot', text: 'Hi! Ask me anything about enzymes.' },
          { role: 'user', text: 'What is activation energy?' },
          { role: 'bot', text: 'The energy needed to start a reaction.' },
          { role: 'user', text: 'How do enzymes lower it?' },
        ],
      })
      .expect(200);
    expect(res.body).toEqual({
      reply: 'Enzymes lower activation energy.',
      remaining: DEFAULT_CHAT_DAILY_LIMIT - 1,
    });
    const { system, messages } = calls[0];
    expect(system).toContain('Title: Enzymes & Activation Energy');
    expect(system).toContain('High School Biology');
    expect(system).toContain('Key terms:');
    // The leading greeting is dropped and roles are mapped for the AI.
    expect(messages.map((m) => m.role)).toEqual(['user', 'model', 'user']);
    expect(messages[2].text).toBe('How do enzymes lower it?');
  });

  it('works on library lessons too, pitched at a simpler level', async () => {
    const { tutor, calls } = fakeTutor();
    const t = testApp(undefined, undefined, tutor);
    const p = await t.newPlayer();
    await request(t.app).post('/api/chat').set(p.auth).send(ask('why?', 'insulin')).expect(200);
    expect(calls[0].system).toContain('How Insulin Works');
    expect(calls[0].system).toContain('the general library');
  });

  it('enforces the daily limit and resets the next day', async () => {
    process.env.CHAT_DAILY_LIMIT = '2';
    const { tutor, calls } = fakeTutor();
    const t = testApp(undefined, undefined, tutor);
    const p = await t.newPlayer();
    await request(t.app).post('/api/chat').set(p.auth).send(ask('1')).expect(200);
    const second = await request(t.app).post('/api/chat').set(p.auth).send(ask('2')).expect(200);
    expect(second.body.remaining).toBe(0);
    const third = await request(t.app).post('/api/chat').set(p.auth).send(ask('3')).expect(429);
    expect(third.body.error).toMatch(/daily limit/);
    expect(calls).toHaveLength(2);
    t.advanceHours(24);
    await request(t.app).post('/api/chat').set(p.auth).send(ask('4')).expect(200);
  });

  it('limits each player separately', async () => {
    process.env.CHAT_DAILY_LIMIT = '1';
    const { tutor } = fakeTutor();
    const t = testApp(undefined, undefined, tutor);
    const a = await t.newPlayer();
    const b = await t.newPlayer();
    await request(t.app).post('/api/chat').set(a.auth).send(ask('1')).expect(200);
    await request(t.app).post('/api/chat').set(a.auth).send(ask('2')).expect(429);
    await request(t.app).post('/api/chat').set(b.auth).send(ask('1')).expect(200);
  });

  it('doesn’t charge a question when the AI fails', async () => {
    let fail = true;
    const tutor: Tutor = async () => {
      if (fail) throw new Error('down');
      return 'ok';
    };
    const t = testApp(undefined, undefined, tutor);
    const p = await t.newPlayer();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await request(t.app).post('/api/chat').set(p.auth).send(ask('1')).expect(500);
    fail = false;
    const res = await request(t.app).post('/api/chat').set(p.auth).send(ask('2')).expect(200);
    expect(res.body.remaining).toBe(DEFAULT_CHAT_DAILY_LIMIT - 1);
  });

  it('rejects bad requests', async () => {
    const { tutor } = fakeTutor();
    const t = testApp(undefined, undefined, tutor);
    const p = await t.newPlayer();
    await request(t.app).post('/api/chat').set(p.auth).send(ask('hi', 'no-such')).expect(404);
    await request(t.app)
      .post('/api/chat')
      .set(p.auth)
      .send({ lessonId: 'insulin', messages: [{ role: 'bot', text: 'hello' }] })
      .expect(400);
    await request(t.app)
      .post('/api/chat')
      .set(p.auth)
      .send(ask('x'.repeat(2001)))
      .expect(400);
    await request(t.app)
      .post('/api/chat')
      .set(p.auth)
      .send({ lessonId: 'insulin', messages: [] })
      .expect(400);
  });
});

describe('geminiTutor', () => {
  const ok = (body: unknown, status = 200) =>
    vi.fn(async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it('sends the system prompt and conversation, and returns the answer text', async () => {
    const f = ok({
      candidates: [
        {
          content: {
            parts: [{ text: 'thinking…', thought: true }, { text: 'Hello ' }, { text: 'there' }],
          },
        },
      ],
    });
    const reply = await geminiTutor(
      'KEY',
      'gemini-test',
      f,
    )('Be nice', [{ role: 'user', text: 'hi' }]);
    expect(reply).toBe('Hello there');
    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent',
    );
    expect(init.headers['x-goog-api-key']).toBe('KEY');
    const body = JSON.parse(init.body);
    expect(body.systemInstruction.parts[0].text).toBe('Be nice');
    expect(body.contents).toEqual([{ role: 'user', parts: [{ text: 'hi' }] }]);
  });

  it('replies politely when Gemini returns no text (e.g. a safety block)', async () => {
    const reply = await geminiTutor(
      'KEY',
      'm',
      ok({ candidates: [{ finishReason: 'SAFETY' }] }),
    )('s', [{ role: 'user', text: 'x' }]);
    expect(reply).toBe(DECLINED_REPLY);
  });

  it('turns API errors into friendly HTTP errors', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(
      geminiTutor(
        'KEY',
        'm',
        ok({ error: { message: 'quota' } }, 429),
      )('s', [{ role: 'user', text: 'x' }]),
    ).rejects.toMatchObject({ status: 503 });
    await expect(
      geminiTutor(
        'KEY',
        'm',
        ok({ error: { message: 'bad key' } }, 403),
      )('s', [{ role: 'user', text: 'x' }]),
    ).rejects.toMatchObject({ status: 502 });
  });
});
