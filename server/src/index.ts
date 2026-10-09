import { createApp } from './app.js';
import { openDatabase } from './db.js';

try {
  process.loadEnvFile('.env');
} catch {
  // .env is optional; defaults below are fine for local development.
}

const port = Number(process.env.PORT ?? 3001);
const db = openDatabase(process.env.DATABASE_PATH ?? './data/bioplay.db');
createApp(db)
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
