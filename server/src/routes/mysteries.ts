import { Router } from 'express';
import { z } from 'zod';
import { MYSTERY_BY_ID, type MysterySolveResponse } from '@bioplay/shared';
import { HttpError, requireUser, type AppContext } from '../http.js';
import { playerState } from '../repo.js';
import { secureRng } from '../services/inventory.js';
import { solveMystery } from '../services/mysteries.js';

const body = z.object({
  explanation: z.number().int().min(0).max(20),
  evidence: z.array(z.number().int().min(0).max(20)).max(20),
});

export function mysteryRoutes(ctx: AppContext) {
  const r = Router();
  r.use(requireUser(ctx));

  r.post('/:id/solve', (req, res) => {
    const m = MYSTERY_BY_ID[String(req.params.id)];
    if (!m) throw new HttpError(404, 'Unknown mystery');
    const parsed = body.safeParse(req.body);
    if (!parsed.success) throw new HttpError(400, 'Invalid answer');
    const out = solveMystery(
      ctx.db,
      req.user!.id,
      m,
      parsed.data.explanation,
      parsed.data.evidence,
      ctx.clock(),
      ctx.rng ?? secureRng,
    );
    const response: MysterySolveResponse = {
      correct: out.correct,
      explanationCorrect: out.explanationCorrect,
      evidenceCorrect: out.evidenceCorrect,
      exclusiveAvatar: out.exclusiveAvatar,
      alreadySolved: out.alreadySolved,
      lines: out.lines,
      total: out.lines.reduce((s, l) => s + l.amount, 0),
      state: playerState(ctx.db, req.user!.id),
    };
    res.json(response);
  });

  return r;
}
