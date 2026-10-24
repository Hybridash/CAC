import cors from 'cors';
import type { Rng } from '@bioplay/shared';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DB } from './db.js';
import { errorHandler, type AppContext } from './http.js';
import { conceptRoutes } from './routes/concepts.js';
import { playerRoutes } from './routes/player.js';
import { authRoutes } from './routes/auth.js';
import { providerVerifier, type IdentityVerifier } from './identity.js';
import { shopRoutes } from './routes/shop.js';
import { mysteryRoutes } from './routes/mysteries.js';
import { chatRoutes } from './routes/chat.js';
import { tutorFromEnv, type Tutor } from './tutor.js';
import { systemClock, type Clock } from './time.js';
import { LIMITS } from './limits.js';
import {
  ConcurrencyGate,
  isLoopback,
  noStoreApi,
  RateLimiter,
  rateLimit,
  securityHeaders,
  trustProxyHops,
} from './security.js';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function createApp(
  db: DB,
  clock: Clock = systemClock,
  rng?: Rng,
  verifyIdentity: IdentityVerifier = providerVerifier(),
  /** null turns Bio Bot off (tests use this so they never call the real AI). */
  tutor: Tutor | null = tutorFromEnv() ?? null,
) {
  const production = process.env.NODE_ENV === 'production';
  const ctx: AppContext = {
    db,
    clock,
    rng,
    verifyIdentity,
    tutor: tutor ?? undefined,
    limiter: new RateLimiter(clock),
    chatGate: new ConcurrencyGate(
      LIMITS.chat.concurrency.total,
      LIMITS.chat.concurrency.perUser,
    ),
  };
  const app = express();
  app.disable('x-powered-by');
  // Use the real client IP only when told how many proxies are in front; otherwise ignore
  // X-Forwarded-For entirely so it can't be forged to dodge per-IP limits.
  app.set('trust proxy', trustProxyHops());
  app.use(securityHeaders(production));
  // Browsers on other origins may call the API only from these (the web app and the iOS app).
  const origins = [
    process.env.CLIENT_ORIGIN ?? (production ? '' : 'http://localhost:5173'),
    'capacitor://localhost',
  ].filter(Boolean);
  app.use(
    cors({
      origin: origins,
      methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );
  app.use('/api', rateLimit(ctx.limiter, 'global', LIMITS.global));
  app.use('/api', noStoreApi);
  app.use('/api', (req, res, next) =>
    ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
      ? next()
      : rateLimit(ctx.limiter, 'writes', LIMITS.writes)(req, res, next),
  );
  app.use(express.json({ limit: '64kb', type: 'application/json' }));

  // The launch scripts use startedAt and pid to spot (and restart) a server older than the code.
  const startedAt = new Date().toISOString();
  app.get('/api/health', (req, res) => {
    // Process details are for the launch scripts on this machine only; strangers just get "ok".
    res.json(isLoopback(req.ip) ? { ok: true, startedAt, pid: process.pid } : { ok: true });
  });
  app.use('/api', playerRoutes(ctx));
  app.use('/api', authRoutes(ctx));
  app.use('/api/concepts', conceptRoutes(ctx));
  app.use('/api/shop', shopRoutes(ctx));
  app.use('/api/mysteries', mysteryRoutes(ctx));
  app.use('/api/chat', chatRoutes(ctx));

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // In production, serve the built client and let the SPA handle its own routes.
  const clientDist = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../client/dist',
  );
  if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
    app.use(
      express.static(clientDist, {
        maxAge: '1h',
        index: false,
        // The service worker and manifest must always be fresh so app updates roll out.
        setHeaders: (res, file) => {
          if (/(sw\.js|workbox-.*\.js|registerSW\.js|manifest\.webmanifest)$/.test(file))
            res.setHeader('Cache-Control', 'no-cache');
        },
      }),
    );
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  } else {
    // Development: pages are served by Vite. Point lost visitors there instead of a bare 404.
    app.get(/^\/(?!api\/).*/, (req, res) => {
      const client = escapeHtml(process.env.CLIENT_ORIGIN ?? 'http://localhost:5173');
      const safePath = escapeHtml(req.path.replace(/[^\w\-./]/g, ''));
      res
        .status(200)
        .type('html')
        .send(
          `<!doctype html><meta charset="utf-8"><title>BioPlay</title><body style="font-family:system-ui;padding:3rem;max-width:36rem;margin:auto;line-height:1.5">` +
            `<h1>This is BioPlay’s data server</h1><p>In development mode the app itself runs at <a href="${client}${safePath}">${client}</a>.</p>` +
            `<p>To run BioPlay as an installable app instead, stop this and run <code>npm run app</code>, then open <a href="http://localhost:3000">http://localhost:3000</a>.</p>`,
        );
    });
  }
  app.use(errorHandler);
  return app;
}
