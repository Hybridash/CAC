import { Router } from 'express';
import { z } from 'zod';
import { PACKS, type PackOpenResponse, type PackTier } from '@bioplay/shared';
import { HttpError, requireUser, type AppContext } from '../http.js';
import { playerState } from '../repo.js';
import { buyAvatar, openPack } from '../services/inventory.js';

export function shopRoutes(ctx: AppContext) {
  const r = Router();
  r.use(requireUser(ctx));

  r.post('/packs', (req, res) => {
    const body = z
      .object({ tier: z.enum(Object.keys(PACKS) as [PackTier, ...PackTier[]]) })
      .safeParse(req.body);
    if (!body.success) throw new HttpError(400, 'Unknown pack');
    const cards = openPack(ctx.db, req.user!.id, body.data.tier, ctx.clock(), ctx.rng);
    const out: PackOpenResponse = {
      tier: body.data.tier,
      cards,
      state: playerState(ctx.db, req.user!.id),
    };
    res.json(out);
  });

  r.post('/avatars/:id', (req, res) => {
    buyAvatar(ctx.db, req.user!.id, String(req.params.id), ctx.clock());
    res.json(playerState(ctx.db, req.user!.id));
  });

  return r;
}
