import type { NextFunction, Request, Response } from 'express';
import type { DB } from './db.js';
import { getUserByToken, type UserRow } from './repo.js';
import type { Rng } from '@bioplay/shared';
import type { Clock } from './time.js';
import type { IdentityVerifier } from './identity.js';
import type { Tutor } from './tutor.js';
import { securityLog, type ConcurrencyGate, type RateLimiter } from './security.js';

export interface AppContext {
  db: DB;
  clock: Clock;
  /** Randomness for pack rolls; injectable so tests can be deterministic. */
  rng?: Rng;
  /** Checks Google/Apple ID tokens; injectable so tests don't call the real providers. */
  verifyIdentity?: IdentityVerifier;
  /** The AI behind Bio Bot; undefined when no API key is configured (the chat is then off). */
  tutor?: Tutor;
  /** Per-IP limits and counters for abuse protection (created by createApp). */
  limiter: RateLimiter;
  /** Caps simultaneous Bio Bot (AI) calls. */
  chatGate: ConcurrencyGate;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserRow;
  }
}

export function requireUser(ctx: AppContext) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.header('authorization') ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    const user = token ? getUserByToken(ctx.db, token, ctx.clock()) : undefined;
    if (!user) {
      securityLog('auth_denied', { ip: req.ip, path: req.path, hadToken: !!token });
      return next(new HttpError(401, 'Not signed in'));
    }
    req.user = user;
    next();
  };
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  // Errors raised by body parsing (malformed JSON, oversized body) are the client's fault.
  const e = err as { type?: string; status?: number };
  if (e?.type === 'entity.too.large') {
    res.status(413).json({ error: 'That request is too large.' });
    return;
  }
  if (e?.type === 'entity.parse.failed' || e?.type === 'charset.unsupported') {
    res.status(400).json({ error: 'That request could not be read.' });
    return;
  }
  // Anything else is a server bug: log the details privately, return nothing revealing.
  securityLog('server_error', { path: req.path, method: req.method });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}
