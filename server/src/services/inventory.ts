import crypto from 'node:crypto';
import {
  AVATAR_BY_ID,
  AVATARS,
  CATEGORY_BY_ID,
  categoryAvatar,
  DIRECT_BUY_COST,
  DUPLICATE_NUCLEOTIDES,
  isPackEligible,
  PACKS,
  rollPack,
  type CategoryId,
  type PackCard,
  type PackTier,
  type Rng,
} from '@bioplay/shared';
import type { DB } from '../db.js';
import { credit, getUser } from '../repo.js';
import { HttpError } from '../http.js';

/** Cryptographically strong RNG for pack rolls (players can't predict or replay outcomes). */
export const secureRng: Rng = () => crypto.randomInt(0, 2 ** 32) / 2 ** 32;

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

/** Category-locked exclusive, granted once the whole category is complete. */
export function grantCategoryAvatar(db: DB, userId: string, category: CategoryId, now: Date) {
  const av = categoryAvatar(category);
  if (av) addAvatar(db, userId, av.id, now);
}

export function openPack(
  db: DB,
  userId: string,
  tier: PackTier,
  now: Date,
  rng: Rng = secureRng,
): PackCard[] {
  const def = PACKS[tier];
  return db.transaction(() => {
    const user = getUser(db, userId)!;
    if (user.atp < def.cost) throw new HttpError(402, `You need ${def.cost - user.atp} more ATP`);
    credit(db, userId, 'atp', -def.cost, `Bought ${def.name}`, tier, now);
    const cards = rollPack(tier, AVATARS, rng).map((av): PackCard => {
      const isNew = addAvatar(db, userId, av.id, now);
      const nucleotides = isNew ? 0 : DUPLICATE_NUCLEOTIDES[av.rarity];
      if (nucleotides)
        credit(db, userId, 'nucleotides', nucleotides, `Duplicate ${av.name}`, av.id, now);
      return { avatarId: av.id, duplicate: !isNew, nucleotides };
    });
    db.prepare(
      'INSERT INTO pack_openings (user_id, tier, results, created_at) VALUES (?, ?, ?, ?)',
    ).run(userId, tier, JSON.stringify(cards), now.toISOString());
    return cards;
  })();
}

export function buyAvatar(db: DB, userId: string, avatarId: string, now: Date) {
  const av = AVATAR_BY_ID[avatarId];
  if (!av) throw new HttpError(404, 'Unknown avatar');
  if (!isPackEligible(av)) {
    const where =
      av.source.kind === 'category'
        ? `completing ${CATEGORY_BY_ID[av.source.category].name}`
        : 'solving Bio Mysteries';
    throw new HttpError(403, `${av.name} can only be earned by ${where}`);
  }
  db.transaction(() => {
    const owned = db
      .prepare('SELECT 1 FROM inventory WHERE user_id = ? AND avatar_id = ?')
      .get(userId, avatarId);
    if (owned) throw new HttpError(409, 'You already have this avatar');
    const cost = DIRECT_BUY_COST[av.rarity];
    if (getUser(db, userId)!.nucleotides < cost)
      throw new HttpError(402, `You need ${cost} nucleotides`);
    credit(db, userId, 'nucleotides', -cost, `Bought ${av.name}`, av.id, now);
    addAvatar(db, userId, av.id, now);
  })();
}
