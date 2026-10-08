import {
  AVATARS,
  CONCEPTS,
  gradeMystery,
  isMysteryUnlocked,
  MYSTERY_EXCLUSIVE_CHANCE,
  mysteryReward,
  type Mystery,
  type Rng,
} from '@bioplay/shared';
import type { DB } from '../db.js';
import { HttpError } from '../http.js';
import { credit, grantAchievement, type ProgressRow } from '../repo.js';
import { addAvatar } from './inventory.js';

const MYSTERY_AVATARS = AVATARS.filter((a) => a.source.kind === 'mystery');

export function solveMystery(
  db: DB,
  userId: string,
  m: Mystery,
  explanation: number,
  evidence: number[],
  now: Date,
  rng: Rng,
) {
  const completed = new Set(
    (
      db
        .prepare(
          'SELECT concept_id FROM concept_progress WHERE user_id = ? AND completed_at IS NOT NULL',
        )
        .all(userId) as Pick<ProgressRow, 'concept_id'>[]
    ).map((r) => r.concept_id),
  );
  if (!isMysteryUnlocked(m, (id) => completed.has(id))) {
    const missing = m.requires
      .filter((id) => !completed.has(id))
      .map((id) => CONCEPTS.find((c) => c.id === id)?.title ?? id);
    throw new HttpError(403, `Locked — complete first: ${missing.join(', ')}`);
  }

  const grade = gradeMystery(m, explanation, evidence);
  const lines: { reason: string; amount: number; currency: 'atp' | 'nucleotides' }[] = [];
  let exclusiveAvatar: string | null = null;
  let alreadySolved = false;

  db.transaction(() => {
    db.prepare('INSERT OR IGNORE INTO mystery_progress (user_id, mystery_id) VALUES (?, ?)').run(
      userId,
      m.id,
    );
    db.prepare(
      'UPDATE mystery_progress SET attempts = attempts + 1 WHERE user_id = ? AND mystery_id = ?',
    ).run(userId, m.id);
    const row = db
      .prepare('SELECT solved_at FROM mystery_progress WHERE user_id = ? AND mystery_id = ?')
      .get(userId, m.id) as { solved_at: string | null };
    alreadySolved = !!row.solved_at;
    if (!grade.correct || alreadySolved) return;

    db.prepare(
      'UPDATE mystery_progress SET solved_at = ? WHERE user_id = ? AND mystery_id = ?',
    ).run(now.toISOString(), userId, m.id);
    grantAchievement(db, userId, `mystery:${m.id}`, now);
    const atp = mysteryReward(m.difficulty);
    credit(db, userId, 'atp', atp, `🕵️ Solved: ${m.title}`, m.id, now);
    lines.push({ reason: `🕵️ Case solved: ${m.title}`, amount: atp, currency: 'atp' });

    // A chance at a mystery-exclusive avatar (guaranteed on your very first solve).
    const owned = new Set(
      (
        db.prepare('SELECT avatar_id FROM inventory WHERE user_id = ?').all(userId) as {
          avatar_id: string;
        }[]
      ).map((r) => r.avatar_id),
    );
    const firstSolve =
      (
        db
          .prepare(
            'SELECT COUNT(*) AS n FROM mystery_progress WHERE user_id = ? AND solved_at IS NOT NULL',
          )
          .get(userId) as { n: number }
      ).n === 1;
    const unowned = MYSTERY_AVATARS.filter((a) => !owned.has(a.id));
    if (unowned.length && (firstSolve || rng() < MYSTERY_EXCLUSIVE_CHANCE)) {
      const prize = unowned[Math.floor(rng() * unowned.length)];
      addAvatar(db, userId, prize.id, now);
      exclusiveAvatar = prize.id;
    }
  })();

  return { ...grade, lines, exclusiveAvatar, alreadySolved };
}
