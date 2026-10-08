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
import { shopRoutes } from './routes/shop.js';
import { mysteryRoutes } from './routes/mysteries.js';
import { systemClock, type Clock } from './time.js';

export function createApp(db: DB, clock: Clock = systemClock, rng?: Rng) {
  const ctx: AppContext = { db, clock, rng };
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api', playerRoutes(ctx));
  app.use('/api/concepts', conceptRoutes(ctx));
  app.use('/api/shop', shopRoutes(ctx));
  app.use('/api/mysteries', mysteryRoutes(ctx));

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // In production, serve the built client and let the SPA handle its own routes.
  const clientDist = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../client/dist',
  );
  if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: '1h', index: false }));
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  }
  app.use(errorHandler);
  return app;
}
