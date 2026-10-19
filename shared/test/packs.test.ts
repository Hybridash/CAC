import { describe, expect, it } from 'vitest';
import {
  AVATAR_RARITIES,
  CARDS_PER_PACK,
  PACKS,
  mulberry32,
  oddsAtLeast,
  PACK_UPGRADE_TAPS,
  rollPack,
  rollRarity,
  type PackTier,
} from '../src/packs';
import type { Avatar, AvatarRarity } from '../src/types';

const mk = (id: string, rarity: AvatarRarity, exclusive = false): Avatar => ({
  id,
  name: id,
  rarity,
  fact: '',
  art: { body: 'cell', color: '#000', accent: '#fff', accessory: 'none' },
  source: exclusive ? { kind: 'mystery' } : { kind: 'pack' },
});

const pool = AVATAR_RARITIES.flatMap((r) => [
  mk(`${r}-1`, r),
  mk(`${r}-2`, r),
  mk(`${r}-x`, r, true),
]);

describe('pack odds', () => {
  it.each(Object.keys(PACKS) as PackTier[])('%s odds sum to 1', (tier) => {
    const sum = Object.values(PACKS[tier].odds).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 10);
  });

  it('pricier packs have strictly better legendary and epic odds', () => {
    expect(PACKS.rare.odds.legendary).toBeGreaterThan(PACKS.basic.odds.legendary);
    expect(PACKS.legendary.odds.legendary).toBeGreaterThan(PACKS.rare.odds.legendary);
    expect(PACKS.legendary.odds.epic).toBeGreaterThan(PACKS.rare.odds.epic);
    expect(PACKS.basic.cost).toBeLessThan(PACKS.rare.cost);
    expect(PACKS.rare.cost).toBeLessThan(PACKS.legendary.cost);
  });

  it.each(Object.keys(PACKS) as PackTier[])(
    '%s rolls match the advertised odds (200k samples)',
    (tier) => {
      const rng = mulberry32(42);
      const n = 200_000;
      const counts = Object.fromEntries(AVATAR_RARITIES.map((r) => [r, 0])) as Record<
        AvatarRarity,
        number
      >;
      for (let i = 0; i < n; i++) counts[rollRarity(PACKS[tier].odds, rng)]++;
      for (const r of AVATAR_RARITIES) {
        const p = PACKS[tier].odds[r];
        const sd = Math.sqrt((p * (1 - p)) / n);
        expect(Math.abs(counts[r] / n - p)).toBeLessThanOrEqual(5 * sd + 1e-9);
      }
    },
  );

  it('never rolls a zero-odds rarity', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 50_000; i++) {
      expect(rollRarity(PACKS.legendary.odds, rng)).not.toBe('common');
    }
  });

  it('rollRarity handles the floating point edge at r ≈ 1', () => {
    expect(rollRarity(PACKS.basic.odds, () => 0.9999999999999)).toBe('legendary');
  });
});

describe('pack upgrades', () => {
  const rank = (r: AvatarRarity) => AVATAR_RARITIES.indexOf(r);

  it('pricier packs upgrade more often per tap', () => {
    expect(PACKS.basic.upgradeChance).toBeLessThan(PACKS.rare.upgradeChance);
    expect(PACKS.rare.upgradeChance).toBeLessThan(PACKS.legendary.upgradeChance);
  });

  it(`gives ${PACK_UPGRADE_TAPS} taps and four lucky ones make a Legendary pack`, () => {
    expect(PACK_UPGRADE_TAPS).toBe(AVATAR_RARITIES.length - 1);
    const roll = rollPack('basic', pool, () => 0);
    expect(roll.upgrades).toEqual([true, true, true, true]);
    expect(roll.rarity).toBe('legendary');
    expect(roll.cards.some((c) => c.rarity === 'legendary')).toBe(true);
  });

  it.each(Object.keys(PACKS) as PackTier[])(
    '%s: rarity matches its upgrades, its promise holds, and taps upgrade at the advertised rate',
    (tier) => {
      const rng = mulberry32(99);
      const n = 20_000;
      let ups = 0;
      for (let i = 0; i < n; i++) {
        const roll = rollPack(tier, pool, rng);
        expect(roll.upgrades).toHaveLength(PACK_UPGRADE_TAPS);
        const k = roll.upgrades.filter(Boolean).length;
        ups += k;
        expect(roll.rarity).toBe(AVATAR_RARITIES[k]);
        expect(Math.max(...roll.cards.map((c) => rank(c.rarity)))).toBeGreaterThanOrEqual(k);
        for (const c of roll.cards) expect(PACKS[tier].odds[c.rarity]).toBeGreaterThan(0);
      }
      const p = PACKS[tier].upgradeChance;
      const taps = n * PACK_UPGRADE_TAPS;
      expect(Math.abs(ups / taps - p)).toBeLessThanOrEqual(5 * Math.sqrt((p * (1 - p)) / taps));
    },
  );

  it('oddsAtLeast keeps only the floor and rarer, summing to 1', () => {
    const o = oddsAtLeast(PACKS.basic.odds, 'epic');
    expect(o.common + o.uncommon + o.rare).toBe(0);
    expect(o.epic + o.legendary).toBeCloseTo(1, 10);
    expect(o.legendary / o.epic).toBeCloseTo(PACKS.basic.odds.legendary / PACKS.basic.odds.epic);
  });
});

describe('rollPack', () => {
  it(`returns ${CARDS_PER_PACK} pack-eligible avatars and never exclusives`, () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 2000; i++) {
      const { cards } = rollPack('legendary', pool, rng);
      expect(cards).toHaveLength(CARDS_PER_PACK);
      for (const c of cards) {
        expect(c).toBeDefined();
        expect(c.source.kind).toBe('pack');
      }
    }
  });
});
