import { Router } from 'express';
import { z } from 'zod';
import type { SessionResponse } from '@bioplay/shared';
import { HttpError, requireUser, type AppContext } from '../http.js';
import { createUser, playerState } from '../repo.js';

export function playerRoutes(ctx: AppContext) {
  const r = Router();
  const auth = requireUser(ctx);

  /** Create an anonymous player. The returned token is the only credential, so the client keeps it. */
  r.post('/session', (_req, res) => {
    const { user, token } = createUser(ctx.db, ctx.clock());
    const body: SessionResponse = { token, state: playerState(ctx.db, user.id) };
    res.status(201).json(body);
  });

  r.get('/state', auth, (req, res) => {
    res.json(playerState(ctx.db, req.user!.id));
  });

  r.patch('/profile', auth, (req, res) => {
    const body = z.object({ displayName: z.string().trim().min(1).max(24) }).safeParse(req.body);
    if (!body.success) throw new HttpError(400, 'Name must be 1–24 characters');
    ctx.db
      .prepare('UPDATE users SET display_name = ? WHERE id = ?')
      .run(body.data.displayName, req.user!.id);
    res.json(playerState(ctx.db, req.user!.id));
  });

  r.post('/equip', auth, (req, res) => {
    const body = z.object({ avatarId: z.string().nullable() }).safeParse(req.body);
    if (!body.success) throw new HttpError(400, 'Invalid avatar');
    const { avatarId } = body.data;
    if (avatarId) {
      const owned = ctx.db
        .prepare('SELECT 1 FROM inventory WHERE user_id = ? AND avatar_id = ?')
        .get(req.user!.id, avatarId);
      if (!owned) throw new HttpError(403, "You haven't collected that avatar yet");
    }
    ctx.db.prepare('UPDATE users SET equipped_avatar = ? WHERE id = ?').run(avatarId, req.user!.id);
    res.json(playerState(ctx.db, req.user!.id));
  });

  return r;
}
