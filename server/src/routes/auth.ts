import { Router } from 'express';
import { z } from 'zod';
import type { SignInResponse } from '@bioplay/shared';
import { HttpError, requireUser, type AppContext } from '../http.js';
import { createSession, deleteSession, findIdentity, linkedAccount, playerState } from '../repo.js';
import {
  addEmailAccount,
  findEmailAccount,
  LoginLimiter,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  verifyPassword,
} from '../accounts.js';

const SignIn = z.object({
  idToken: z.string().min(20).max(8192),
  name: z.string().trim().max(60).optional(),
});

const NewAccount = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(128),
});
const Login = z.object({ email: z.string().trim().max(254), password: z.string().max(128) });

export function authRoutes(ctx: AppContext) {
  const r = Router();
  const auth = requireUser(ctx);

  /** Forget this device's token. The account and its progress stay saved on the server. */
  r.post('/auth/sign-out', auth, (req, res) => {
    deleteSession(ctx.db, req.header('authorization')!.slice(7));
    res.status(204).end();
  });

  /**
   * Create a Bio Bites account (email + password) for the player on this device, so everything
   * earned as a guest is kept.
   */
  r.post('/auth/email/register', auth, (req, res) => {
    const body = NewAccount.safeParse(req.body);
    if (!body.success) {
      const badPassword = body.error.issues.some((i) => i.path[0] === 'password');
      throw new HttpError(
        400,
        badPassword
          ? `Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`
          : 'Enter a valid email address.',
      );
    }
    const me = req.user!;
    if (findEmailAccount(ctx.db, body.data.email))
      throw new HttpError(409, 'An account with this email already exists. Log in instead.');
    if (linkedAccount(ctx.db, me.id))
      throw new HttpError(409, 'This player is already saved to an account. Sign out first.');
    addEmailAccount(ctx.db, me.id, body.data.email, body.data.password, ctx.clock());
    const out: SignInResponse = { state: playerState(ctx.db, me.id), switched: false };
    res.status(201).json(out);
  });

  /** Log in to a Bio Bites account; this device switches to that account's saved player. */
  const limiter = new LoginLimiter();
  r.post('/auth/email/login', auth, (req, res) => {
    const body = Login.safeParse(req.body);
    if (!body.success) throw new HttpError(400, 'Enter your email and password.');
    const email = normalizeEmail(body.data.email);
    const now = ctx.clock();
    if (limiter.blocked(email, now.getTime()))
      throw new HttpError(429, 'Too many wrong passwords. Wait 15 minutes, then try again.');
    const account = findEmailAccount(ctx.db, email);
    if (!account || !verifyPassword(body.data.password, account.password_hash)) {
      limiter.fail(email, now.getTime());
      throw new HttpError(401, 'Wrong email or password.');
    }
    limiter.succeed(email);
    const me = req.user!;
    if (account.user_id === me.id) {
      const out: SignInResponse = { state: playerState(ctx.db, me.id), switched: false };
      res.json(out);
      return;
    }
    const out: SignInResponse = {
      token: createSession(ctx.db, account.user_id, now),
      state: playerState(ctx.db, account.user_id),
      switched: true,
    };
    res.json(out);
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
