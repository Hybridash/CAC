import type { CategoryId } from '@bioplay/shared';
import type { DB } from '../db.js';

/** Add one copy of an avatar; returns true if it was new. */
export function addAvatar(db: DB, userId: string, avatarId: string, now: Date): boolean {
  const existing = db
    .prepare('SELECT count FROM inventory WHERE user_id = ? AND avatar_id = ?')
    .get(userId, avatarId);
  if (existing) {
    db.prepare('UPDATE inventory SET count = count + 1 WHERE user_id = ? AND avatar_id = ?').run(
      userId,
      avatarId,
    );
    return false;
  }
  db.prepare(
    'INSERT INTO inventory (user_id, avatar_id, count, acquired_at) VALUES (?, ?, 1, ?)',
  ).run(userId, avatarId, now.toISOString());
  return true;
}

/** Category-locked exclusive avatars arrive with the avatar catalog. */
export function grantCategoryAvatar(_db: DB, _userId: string, _category: CategoryId, _now: Date) {}
