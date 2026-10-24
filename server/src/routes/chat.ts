import { Router } from 'express';
import { z } from 'zod';
import {
  HS_UNIT_BY_ID,
  LESSON_BY_ID,
  type ChatResponse,
  type ChatStatus,
  type Concept,
} from '@bioplay/shared';
import { HttpError, requireUser, type AppContext } from '../http.js';
import type { DB } from '../db.js';
import { dayKey } from '../time.js';
import { LIMITS } from '../limits.js';
import { rateLimit, securityLog, tag } from '../security.js';

/** Questions each player may ask per UTC day (CHAT_DAILY_LIMIT overrides). */
export const DEFAULT_CHAT_DAILY_LIMIT = 30;
/** Only the most recent turns are sent, to keep requests small. */
const HISTORY_SENT = 12;

const chatBody = z.object({
  lessonId: z.string().max(80),
  messages: z
    .array(z.object({ role: z.enum(['user', 'bot']), text: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(40),
});

function used(db: DB, userId: string, day: string) {
  const row = db
    .prepare('SELECT count FROM chat_usage WHERE user_id = ? AND day = ?')
    .get(userId, day) as { count: number } | undefined;
  return row?.count ?? 0;
}

/** System instructions: who Bio Bot is, its rules, and the lesson it is helping with. */
export function tutorInstructions(c: Concept): string {
  const hs = c.highSchool;
  const level = hs
    ? `High School Biology (unit: ${HS_UNIT_BY_ID[hs.unit].name}). Explain at a high school biology level, using correct scientific vocabulary.`
    : 'the general library. Students may be 11–18 years old: explain simply and define any technical words.';
  const lesson = [
    `Title: ${c.title}`,
    `Summary: ${c.summary}`,
    'Steps:',
    ...c.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`),
    `Go deeper: ${c.goDeeper}`,
    ...(hs
      ? [
          `Key terms: ${hs.keyTerms.map((t) => `${t.term} (${t.definition})`).join('; ')}`,
          `Diagrams: ${hs.diagrams.map((d) => `${d.title}: ${d.caption} Parts: ${d.parts.map((p) => p.label).join(', ')}`).join(' | ')}`,
        ]
      : []),
  ].join('\n');
  return `You are Bio Bot, the friendly biology tutor inside the Bio Bites learning app. The student is on a lesson from ${level}

Rules:
- Help with biology, especially this lesson. If asked about something unrelated to biology or science, kindly say you can only help with biology and suggest a related question.
- Be accurate. If the lesson simplifies something, you may explain the fuller picture. If you are unsure, say so.
- Keep answers short: usually under 120 words. Use short paragraphs or a few bullet points. Plain text with **bold** and "- " bullets only; no headings, tables or code.
- Teach, don't just answer: use analogies and examples, and end with a quick check question when it helps.
- If the student asks for the answers to the lesson's quiz, give hints and reasoning instead of the letter.
- For questions about the student's own health, give general information only and suggest talking to a parent, school nurse or doctor.
- Never ask for or repeat personal information (names, addresses, schools, contact details).
- Keep everything appropriate for school.

The lesson:
${lesson}`;
}

/** Questions the whole server will answer per UTC day, whoever asks (CHAT_GLOBAL_DAILY_LIMIT). */
const globalLimit = () => Number(process.env.CHAT_GLOBAL_DAILY_LIMIT) || LIMITS.chat.globalDaily;

/** Atomically reserve one question from the server-wide daily budget; false if it is spent. */
function reserveGlobal(db: DB, day: string): boolean {
  const row = db
    .prepare(
      `INSERT INTO chat_global (day, count) VALUES (?, 1)
       ON CONFLICT (day) DO UPDATE SET count = count + 1 RETURNING count`,
    )
    .get(day) as { count: number };
  if (row.count > globalLimit()) {
    db.prepare('UPDATE chat_global SET count = count - 1 WHERE day = ?').run(day);
    return false;
  }
  return true;
}
const refundGlobal = (db: DB, day: string) =>
  db.prepare('UPDATE chat_global SET count = MAX(0, count - 1) WHERE day = ?').run(day);

export function chatRoutes(ctx: AppContext) {
  const r = Router();
  r.use(requireUser(ctx));
  const limit = () => Number(process.env.CHAT_DAILY_LIMIT) || DEFAULT_CHAT_DAILY_LIMIT;
  // Cost protection, in layers: per-IP (many fake players behind one address), per-player burst,
  // simultaneous AI calls, the player's daily quota, and a server-wide daily ceiling.
  const perIp = rateLimit(ctx.limiter, 'chat-ip', ...LIMITS.chat.perIp);

  r.get('/status', (req, res) => {
    const remaining = Math.max(0, limit() - used(ctx.db, req.user!.id, dayKey(ctx.clock())));
    const body: ChatStatus = { enabled: !!ctx.tutor, limit: limit(), remaining };
    res.json(body);
  });

  r.post('/', perIp, async (req, res, next) => {
    let release: (() => void) | null = null;
    try {
      const parsed = chatBody.safeParse(req.body);
      if (!parsed.success) throw new HttpError(400, 'Invalid message');
      const { lessonId, messages } = parsed.data;
      const lesson = LESSON_BY_ID[lessonId];
      if (!lesson) throw new HttpError(404, 'Unknown lesson');
      if (messages.at(-1)!.role !== 'user') throw new HttpError(400, 'Ask a question first');
      if (!ctx.tutor) throw new HttpError(503, 'Bio Bot isn’t switched on for this server yet.');

      const userId = req.user!.id;
      const day = dayKey(ctx.clock());
      const burst = ctx.limiter.consume(`chat-user:${userId}`, LIMITS.chat.perUserBurst);
      if (!burst.ok) {
        res.setHeader('Retry-After', String(burst.retryAfter));
        throw new HttpError(429, 'You’re asking quickly. Wait a few seconds and try again.');
      }
      release = ctx.chatGate.enter(userId);
      if (!release) {
        res.setHeader('Retry-After', '5');
        throw new HttpError(429, 'Bio Bot is answering you already. Wait for the reply first.');
      }
      // Reserve this question before calling the AI, so parallel requests can't overshoot the limit.
      const count = (delta: number) =>
        ctx.db
          .prepare(
            `INSERT INTO chat_usage (user_id, day, count) VALUES (?, ?, ?)
             ON CONFLICT (user_id, day) DO UPDATE SET count = count + excluded.count`,
          )
          .run(userId, day, delta);
      count(1);
      if (used(ctx.db, userId, day) > limit()) {
        count(-1);
        securityLog('chat_quota_exhausted', { user: tag(userId), ip: req.ip });
        throw new HttpError(
          429,
          `You’ve asked Bio Bot ${limit()} questions today, the daily limit. Come back tomorrow!`,
        );
      }
      if (!reserveGlobal(ctx.db, day)) {
        count(-1);
        securityLog('chat_global_cap_hit', { day });
        throw new HttpError(503, 'Bio Bot has answered a lot of questions today and is resting. Try again tomorrow!');
      }

      // Gemini expects the conversation to start with the user, so drop any leading bot greeting.
      const recent = messages.slice(-HISTORY_SENT);
      const firstUser = recent.findIndex((m) => m.role === 'user');
      let reply: string;
      try {
        reply = await ctx.tutor(
          tutorInstructions(lesson),
          recent
            .slice(firstUser)
            .map((m) => ({ role: m.role === 'bot' ? 'model' : 'user', text: m.text })),
        );
      } catch (e) {
        count(-1); // A failed answer doesn't use up a question.
        refundGlobal(ctx.db, day);
        throw e;
      }
      const body: ChatResponse = {
        reply,
        remaining: Math.max(0, limit() - used(ctx.db, userId, day)),
      };
      res.json(body);
    } catch (e) {
      next(e);
    } finally {
      release?.();
    }
  });

  return r;
}
