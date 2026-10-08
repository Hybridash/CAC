import cors from 'cors';
import express from 'express';
import type { DB } from './db.js';
import { errorHandler, type AppContext } from './http.js';
import { playerRoutes } from './routes/player.js';
import { systemClock, type Clock } from './time.js';

export function createApp(db: DB, clock: Clock = systemClock) {
  const ctx: AppContext = { db, clock };
  const app = express();
  app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }));
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api', playerRoutes(ctx));

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
  app.use(errorHandler);
  return app;
}
