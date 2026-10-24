// Safe online backup of the SQLite database, with an integrity check and simple retention.
//   npm run backup                       (uses DATABASE_PATH, default server/data/bioplay.db)
//   npm run backup -- /path/to/folder    (choose where backups go; default ./backups)
// Restoring is a copy: stop the server, then copy a backup file over the live database file
// (and delete any bioplay.db-wal / bioplay.db-shm next to it). Schedule this daily (cron/launchd).
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const source = path.resolve(process.env.DATABASE_PATH ?? 'server/data/bioplay.db');
const outDir = path.resolve(process.argv[2] ?? 'backups');
const keep = Number(process.env.BACKUP_KEEP ?? 14);

if (!fs.existsSync(source)) {
  console.error(`No database at ${source}. Set DATABASE_PATH to the live database file.`);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true, mode: 0o700 });

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
const dest = path.join(outDir, `bioplay-${stamp}.db`);

const db = new Database(source, { readonly: true });
try {
  await db.backup(dest); // consistent snapshot even while the server is running
} finally {
  db.close();
}
fs.chmodSync(dest, 0o600);

// A backup you haven't checked is a hope, not a backup.
const check = new Database(dest, { readonly: true });
const integrity = check.pragma('integrity_check', { simple: true });
const users = check.prepare('SELECT COUNT(*) AS n FROM users').get().n;
check.close();
if (integrity !== 'ok') {
  fs.rmSync(dest);
  console.error(`Backup failed its integrity check (${integrity}); it was deleted.`);
  process.exit(1);
}
console.log(`Backup OK: ${dest} (${users} players, ${(fs.statSync(dest).size / 1024).toFixed(0)} KB)`);

// Keep only the newest `keep` backups.
const old = fs
  .readdirSync(outDir)
  .filter((f) => /^bioplay-.*\.db$/.test(f))
  .sort()
  .reverse()
  .slice(keep);
for (const f of old) fs.rmSync(path.join(outDir, f));
if (old.length) console.log(`Removed ${old.length} older backup(s); keeping ${keep}.`);
