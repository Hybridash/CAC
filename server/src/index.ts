import { createApp } from './app.js';
import { openDatabase } from './db.js';
import { ensureDemoAccount, shouldCreateDemo } from './accounts.js';
import { purgeExpiredSessions } from './repo.js';

try {
  process.loadEnvFile('.env');
} catch {
  // .env is optional; defaults below are fine for local development.
}

const port = Number(process.env.PORT ?? 3001);
const db = openDatabase(process.env.DATABASE_PATH ?? './data/bioplay.db');
// The demo login (demo@gmail.com / demo123) has a publicly known password, so it exists only in
// development, or when DEMO_ACCOUNT=on is set on purpose. It is never created in production by default.
const production = process.env.NODE_ENV === 'production';
const demo = shouldCreateDemo();
if (demo) ensureDemoAccount(db, new Date());
if (production && demo) console.warn('WARNING: the public demo account is enabled in production.');

// Housekeeping: drop sessions that have expired, now and hourly.
purgeExpiredSessions(db, new Date());
setInterval(() => purgeExpiredSessions(db, new Date()), 3600_000).unref();

const server = createApp(db)
  .listen(port, () => {
    console.log(`BioPlay server listening on http://localhost:${port}`);
  })
  .on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `\nPort ${port} is already in use — is BioPlay (or another app) already running?`,
      );
      console.error('Stop the other program, or pick another port, e.g.  PORT=3005 npm run app\n');
      process.exit(1);
    }
    throw err;
  });

// Slow or stalled clients can't hold connections open indefinitely.
server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.keepAliveTimeout = 5_000;
server.maxHeadersCount = 64;

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason instanceof Error ? reason.message : reason);
});
