import { Router } from 'express';
import { z } from 'zod';
import type { SignInResponse } from '@bioplay/shared';
import { HttpError, requireUser, type AppContext } from '../http.js';
import { createSession, deleteSession, findIdentity, linkedAccount, playerState } from '../repo.js';

const SignIn = z.object({
  idToken: z.string().min(20).max(8192),
  name: z.string().trim().max(60).optional(),
});

export function authRoutes(ctx: AppContext) {
  const r = Router();
  const auth = requireUser(ctx);

  /** Forget this device's token. The account and its progress stay saved on the server. */
  r.post('/auth/sign-out', auth, (req, res) => {
    deleteSession(ctx.db, req.header('authorization')!.slice(7));
    res.status(204).end();
  });

  /**
   * Sign in with Google or Apple. The device is always already playing as some player:
   * - a new account is linked to that player, so everything earned as a guest is kept;
   * - an account linked before switches this device to that saved player.
   */
  r.post('/auth/:provider', auth, async (req, res) => {
    const provider = z.enum(['google', 'apple']).safeParse(req.params.provider);
    if (!provider.success) throw new HttpError(404, 'Unknown sign-in provider');
    const body = SignIn.safeParse(req.body);
    if (!body.success) throw new HttpError(400, 'Missing sign-in token');
    if (!ctx.verifyIdentity) throw new HttpError(503, 'Sign-in isn’t available on this server');

    const id = await ctx.verifyIdentity(provider.data, body.data.idToken);
    const me = req.user!;
    const now = ctx.clock();
    const existing = findIdentity(ctx.db, provider.data, id.subject);

    if (existing && existing.user_id !== me.id) {
      const token = createSession(ctx.db, existing.user_id, now);
      const out: SignInResponse = {
        token,
        state: playerState(ctx.db, existing.user_id),
        switched: true,
      };
      res.json(out);
      return;
    }
    if (!existing) {
      if (linkedAccount(ctx.db, me.id)) {
        throw new HttpError(
          409,
          'This player is already saved to another account. Sign out first.',
        );
      }
      ctx.db
        .prepare(
          'INSERT INTO identities (provider, subject, user_id, email, created_at) VALUES (?, ?, ?, ?, ?)',
        )
        .run(provider.data, id.subject, me.id, id.email, now.toISOString());
      const first = body.data.name?.split(/\s+/)[0];
      if (first && me.display_name === 'Explorer') {
        ctx.db
          .prepare('UPDATE users SET display_name = ? WHERE id = ?')
          .run(first.slice(0, 24), me.id);
      }
    }
    const out: SignInResponse = { state: playerState(ctx.db, me.id), switched: false };
    res.json(out);
  });

  return r;
}
