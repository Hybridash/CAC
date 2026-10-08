import { describe, expect, it } from 'vitest';
import {
  AVATARS,
  CATEGORIES,
  categoryAvatar,
  PACKS,
  AVATAR_RARITIES,
  isPackEligible,
} from '../src';

describe('avatar catalog', () => {
  it('has at least 60 avatars with unique ids and facts', () => {
    expect(AVATARS.length).toBeGreaterThanOrEqual(60);
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(AVATARS.length);
    for (const a of AVATARS) expect(a.fact.length).toBeGreaterThan(20);
  });

  it('every rarity with non-zero pack odds has pack avatars', () => {
    for (const tier of Object.values(PACKS))
      for (const r of AVATAR_RARITIES)
        if (tier.odds[r] > 0)
          expect(AVATARS.filter((a) => isPackEligible(a) && a.rarity === r).length).toBeGreaterThan(
            0,
          );
  });

  it('every category has an exclusive avatar', () => {
    for (const c of CATEGORIES) expect(categoryAvatar(c.id)).toBeDefined();
  });

  it('includes mystery exclusives', () => {
    expect(AVATARS.filter((a) => a.source.kind === 'mystery').length).toBeGreaterThanOrEqual(5);
  });

  it('legendaries are animated', () => {
    for (const a of AVATARS.filter((x) => x.rarity === 'legendary')) expect(a.animated).toBe(true);
  });
});
