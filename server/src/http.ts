import type { NextFunction, Request, Response } from 'express';
import type { DB } from './db.js';
import { getUserByToken, type UserRow } from './repo.js';
import type { Clock } from './time.js';

export interface AppContext {
  db: DB;
  clock: Clock;
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
    const user = token ? getUserByToken(ctx.db, token) : undefined;
    if (!user) return next(new HttpError(401, 'Not signed in'));
    req.user = user;
    next();
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}
