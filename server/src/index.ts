import { createApp } from './app.js';
import { openDatabase } from './db.js';

try {
  process.loadEnvFile('.env');
} catch {
  // .env is optional; defaults below are fine for local development.
}

const port = Number(process.env.PORT ?? 3001);
const db = openDatabase(process.env.DATABASE_PATH ?? './data/bioplay.db');
createApp(db).listen(port, () => {
  console.log(`🧬 BioPlay API listening on http://localhost:${port}`);
});
