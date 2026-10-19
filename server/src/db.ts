import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export type DB = Database.Database;

const MIGRATIONS: string[] = [
  `
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    atp INTEGER NOT NULL DEFAULT 0,
    nucleotides INTEGER NOT NULL DEFAULT 0,
    equipped_avatar TEXT,
    display_name TEXT NOT NULL DEFAULT 'Explorer',
    streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_day TEXT
  );

  CREATE TABLE concept_progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_id TEXT NOT NULL,
    interaction_done_at TEXT,
    quiz_passed_at TEXT,
    quiz_perfect INTEGER NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    last_quiz_at TEXT,
    last_quiz_reward_at TEXT,
    completed_at TEXT,
    PRIMARY KEY (user_id, concept_id)
  );

  CREATE TABLE inventory (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_id TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 1,
    acquired_at TEXT NOT NULL,
    PRIMARY KEY (user_id, avatar_id)
  );

  CREATE TABLE achievements (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    awarded_at TEXT NOT NULL,
    PRIMARY KEY (user_id, key)
  );

  CREATE TABLE mystery_progress (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mystery_id TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    solved_at TEXT,
    PRIMARY KEY (user_id, mystery_id)
  );

  CREATE TABLE ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency TEXT NOT NULL CHECK (currency IN ('atp', 'nucleotides')),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    ref TEXT,
    created_at TEXT NOT NULL
  );
  CREATE INDEX ledger_user ON ledger(user_id, created_at);

  CREATE TABLE pack_openings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier TEXT NOT NULL,
    results TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  `,
  `
  -- Several devices can be signed in to one account, so tokens move to their own table.
  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
  );
  INSERT INTO sessions (token_hash, user_id, created_at) SELECT token_hash, id, created_at FROM users;

  -- A Google or Apple account linked to a player; subject is the provider's stable user id.
  CREATE TABLE identities (
    provider TEXT NOT NULL CHECK (provider IN ('google', 'apple')),
    subject TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email TEXT,
    created_at TEXT NOT NULL,
    PRIMARY KEY (provider, subject)
  );
  CREATE INDEX identities_user ON identities(user_id);
  `,
  `
  -- Bio Bot questions asked per player per UTC day, for the daily limit.
  CREATE TABLE chat_usage (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, day)
  );
  `,
  `
  -- Bio Bites accounts: an email and password linked to one player.
  CREATE TABLE email_accounts (
    email TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  `,
];

export function openDatabase(file: string): DB {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

function migrate(db: DB) {
  const current = db.pragma('user_version', { simple: true }) as number;
  for (let v = current; v < MIGRATIONS.length; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v]);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}
