import { Router } from 'express';
import { z } from 'zod';
import type { SignInResponse } from '@bioplay/shared';
import { HttpError, requireUser, type AppContext } from '../http.js';
import {
  createSession,
  deleteAllSessions,
  deleteSession,
  findIdentity,
  linkedAccount,
  playerState,
} from '../repo.js';
import {
  findEmailAccount,
  hashPasswordAsync,
  LoginLimiter,
  MIN_PASSWORD_LENGTH,
  normalizeEmail,
  passwordProblem,
  verifyAgainstDummy,
  verifyPasswordAsync,
} from '../accounts.js';
import { LIMITS } from '../limits.js';
import { rateLimit, securityLog, tag } from '../security.js';

const SignIn = z.object({
  idToken: z.string().min(20).max(8192),
  name: z.string().trim().max(60).optional(),
});

const NewAccount = z.object({
  email: z.string().trim().email().max(254),
  // Length is checked with a friendlier message in passwordProblem; this only bounds the input.
  password: z.string().min(1).max(128),
});
const Login = z.object({ email: z.string().trim().max(254), password: z.string().max(128) });

export function authRoutes(ctx: AppContext) {
  const r = Router();
  const auth = requireUser(ctx);
  const limit = (name: keyof typeof LIMITS.auth) =>
    rateLimit(ctx.limiter, `auth:${name}`, ...LIMITS.auth[name]);

  /** Forget this device's token. The account and its progress stay saved on the server. */
  r.post('/auth/sign-out', auth, (req, res) => {
    deleteSession(ctx.db, req.header('authorization')!.slice(7));
    res.status(204).end();
  });

  /** Sign out everywhere: every device's token for this player stops working (a lost phone). */
  r.post('/auth/sign-out-all', auth, (req, res) => {
    deleteAllSessions(ctx.db, req.user!.id);
    securityLog('sessions_revoked', { user: tag(req.user!.id), ip: req.ip });
    res.status(204).end();
  });

  /**
   * Create a Bio Bites account (email + password) for the player on this device, so everything
   * earned as a guest is kept.
   */
  r.post('/auth/email/register', limit('register'), auth, async (req, res) => {
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
    const problem = passwordProblem(body.data.password, body.data.email);
    if (problem) throw new HttpError(400, problem);
    const me = req.user!;
    if (findEmailAccount(ctx.db, body.data.email))
      throw new HttpError(409, 'An account with this email already exists. Log in instead.');
    if (linkedAccount(ctx.db, me.id))
      throw new HttpError(409, 'This player is already saved to an account. Sign out first.');
    // Hash off the event loop, then insert; the unique email key settles any race between two
    // simultaneous registrations (the loser gets the same 409).
    const hash = await hashPasswordAsync(body.data.password);
    try {
      ctx.db
        .prepare(
          'INSERT INTO email_accounts (email, user_id, password_hash, created_at) VALUES (?, ?, ?, ?)',
        )
        .run(normalizeEmail(body.data.email), me.id, hash, ctx.clock().toISOString());
    } catch (e) {
      // Only a duplicate email is the caller's problem; anything else is a real server error.
      if (String((e as { code?: string }).code).startsWith('SQLITE_CONSTRAINT'))
        throw new HttpError(409, 'An account with this email already exists. Log in instead.');
      throw e;
    }
    securityLog('account_created', { user: tag(me.id), email: tag(normalizeEmail(body.data.email)), ip: req.ip });
    const out: SignInResponse = { state: playerState(ctx.db, me.id), switched: false };
    res.status(201).json(out);
  });

  /** Log in to a Bio Bites account; this device switches to that account's saved player. */
  const limiter = new LoginLimiter();
  r.post('/auth/email/login', limit('login'), auth, async (req, res) => {
    const body = Login.safeParse(req.body);
    if (!body.success) throw new HttpError(400, 'Enter your email and password.');
    const email = normalizeEmail(body.data.email);
    const now = ctx.clock();
    const who = { email: tag(email), ip: req.ip };
    // Two brakes on guessing: per email (protects that account) and per IP (stops one attacker
    // from trying many accounts). Both only count wrong passwords.
    const ipFails = ctx.limiter.peek(`auth:login-fail:${req.ip}`, LIMITS.loginFailuresPerIp);
    if (limiter.blocked(email, now.getTime()) || ipFails >= LIMITS.loginFailuresPerIp.max) {
      securityLog('login_blocked', who);
      res.setHeader('Retry-After', String(15 * 60));
      throw new HttpError(429, 'Too many wrong passwords. Wait 15 minutes, then try again.');
    }
    const account = findEmailAccount(ctx.db, email);
    // Always do the same amount of hashing work, so response time doesn't reveal which emails exist.
    const ok = account
      ? await verifyPasswordAsync(body.data.password, account.password_hash)
      : (await verifyAgainstDummy(body.data.password), false);
    if (!account || !ok) {
      limiter.fail(email, now.getTime());
      ctx.limiter.consume(`auth:login-fail:${req.ip}`, LIMITS.loginFailuresPerIp);
      securityLog('login_failed', who);
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
  r.post('/auth/:provider', limit('oauth'), auth, async (req, res) => {
    const provider = z.enum(['google', 'apple']).safeParse(req.params.provider);
    if (!provider.success) throw new HttpError(404, 'Unknown sign-in provider');
    const body = SignIn.safeParse(req.body);
    if (!body.success) throw new HttpError(400, 'Missing sign-in token');
    if (!ctx.verifyIdentity) throw new HttpError(503, 'Sign-in isn’t available on this server');

    let id;
    try {
      id = await ctx.verifyIdentity(provider.data, body.data.idToken);
    } catch (e) {
      securityLog('oauth_rejected', { provider: provider.data, ip: req.ip });
      throw e;
    }
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
