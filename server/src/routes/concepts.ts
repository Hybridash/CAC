import { Router } from 'express';
import { z } from 'zod';
import { LESSON_BY_ID, type QuizSubmitResponse, type RewardResponse } from '@bioplay/shared';
import { HttpError, requireUser, type AppContext } from '../http.js';
import { playerState } from '../repo.js';
import { recordInteraction, recordQuiz } from '../services/progress.js';

const quizBody = z.object({
  answers: z.array(z.union([z.number().int(), z.array(z.number().int()).max(10)])).max(10),
});

export function conceptRoutes(ctx: AppContext) {
  const r = Router();
  r.use(requireUser(ctx));

  const concept = (id: string) => {
    const c = LESSON_BY_ID[id];
    if (!c) throw new HttpError(404, 'Unknown concept');
    return c;
  };

  r.post('/:id/interaction', (req, res) => {
    const c = concept(String(req.params.id));
    const rw = recordInteraction(ctx.db, req.user!.id, c, ctx.clock());
    const body: RewardResponse = {
      lines: rw.lines,
      total: rw.total,
      state: playerState(ctx.db, req.user!.id),
    };
    res.json(body);
  });

  r.post('/:id/quiz', (req, res) => {
    const c = concept(String(req.params.id));
    const parsed = quizBody.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid answers');
    const out = recordQuiz(ctx.db, req.user!.id, c, parsed.data.answers, ctx.clock());
    const body: QuizSubmitResponse = {
      lines: out.r.lines,
      total: out.r.total,
      score: out.score,
      outOf: out.outOf,
      passed: out.passed,
      perfect: out.perfect,
      results: out.results,
      state: playerState(ctx.db, req.user!.id),
    };
    res.json(body);
  });

  return r;
}
