/** Pack tiers, rarity odds and duplicate conversion. Rolls happen on the server. */
import type { Avatar, AvatarRarity } from './types';

export const AVATAR_RARITIES: AvatarRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export type PackTier = 'basic' | 'rare' | 'legendary';

export interface PackDefinition {
  tier: PackTier;
  name: string;
  cost: number;
  /** Probability of each rarity for every card in the pack. Sums to 1. */
  odds: Record<AvatarRarity, number>;
  /** Chance, on each of the {@link PACK_UPGRADE_TAPS} taps, that the pack's rarity goes up one step. */
  upgradeChance: number;
  blurb: string;
}

export const CARDS_PER_PACK = 3;

/**
 * Before opening, the player taps the pack this many times. Every pack starts Common and each tap may
 * raise it one rarity, so four lucky taps make it Legendary. The final rarity guarantees at least one
 * card of that rarity or better.
 */
export const PACK_UPGRADE_TAPS = 4;

export const PACKS: Record<PackTier, PackDefinition> = {
  basic: {
    tier: 'basic',
    name: 'Basic Pack',
    cost: 75,
    odds: { common: 0.6, uncommon: 0.28, rare: 0.09, epic: 0.025, legendary: 0.005 },
    upgradeChance: 0.2,
    blurb: 'A starter culture of everyday organelles and organisms.',
  },
  rare: {
    tier: 'rare',
    name: 'Rare Pack',
    cost: 200,
    odds: { common: 0.25, uncommon: 0.35, rare: 0.28, epic: 0.1, legendary: 0.02 },
    upgradeChance: 0.3,
    blurb: 'Better odds of rare and epic finds.',
  },
  legendary: {
    tier: 'legendary',
    name: 'Legendary Pack',
    cost: 500,
    odds: { common: 0, uncommon: 0.15, rare: 0.45, epic: 0.3, legendary: 0.1 },
    upgradeChance: 0.45,
    blurb: 'No commons. A 10% chance of a legend in every card.',
  },
};

/** Nucleotides granted when you pull an avatar you already own. */
export const DUPLICATE_NUCLEOTIDES: Record<AvatarRarity, number> = {
  common: 5,
  uncommon: 12,
  rare: 30,
  epic: 75,
  legendary: 200,
};

/** Nucleotide price to buy a specific pack avatar directly. */
export const DIRECT_BUY_COST: Record<AvatarRarity, number> = {
  common: 40,
  uncommon: 100,
  rare: 250,
  epic: 600,
  legendary: 1500,
};

export type Rng = () => number;

/** Deterministic PRNG for tests and seeded previews. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rollRarity(odds: Record<AvatarRarity, number>, rng: Rng): AvatarRarity {
  const r = rng();
  let acc = 0;
  for (const rarity of AVATAR_RARITIES) {
    acc += odds[rarity];
    if (r < acc) return rarity;
  }
  // Floating point slack: fall back to the rarest rarity with non-zero odds.
  return [...AVATAR_RARITIES].reverse().find((x) => odds[x] > 0)!;
}

export const isPackEligible = (a: Avatar) => a.source.kind === 'pack';

export interface PackRoll {
  cards: Avatar[];
  /** Whether each tap raised the pack's rarity, in tap order. */
  upgrades: boolean[];
  /** The pack's final rarity: at least one card is this rarity or better. */
  rarity: AvatarRarity;
}

const rank = (r: AvatarRarity) => AVATAR_RARITIES.indexOf(r);

/** The pack's odds limited to `floor` and rarer, rescaled to sum to 1. */
export function oddsAtLeast(
  odds: Record<AvatarRarity, number>,
  floor: AvatarRarity,
): Record<AvatarRarity, number> {
  const kept = AVATAR_RARITIES.filter((r) => rank(r) >= rank(floor));
  const total = kept.reduce((s, r) => s + odds[r], 0);
  return Object.fromEntries(
    AVATAR_RARITIES.map((r) => [r, kept.includes(r) ? odds[r] / total : 0]),
  ) as Record<AvatarRarity, number>;
}

/** Roll the pack's rarity upgrades, then its cards from the pool of pack-eligible avatars. */
export function rollPack(tier: PackTier, pool: Avatar[], rng: Rng): PackRoll {
  const def = PACKS[tier];
  const upgrades = Array.from({ length: PACK_UPGRADE_TAPS }, () => rng() < def.upgradeChance);
  const rarity = AVATAR_RARITIES[upgrades.filter(Boolean).length];
  const eligible = pool.filter(isPackEligible);
  const pick = (r: AvatarRarity) => {
    const choices = eligible.filter((a) => a.rarity === r);
    return choices[Math.floor(rng() * choices.length)];
  };
  const cards = Array.from({ length: CARDS_PER_PACK }, () => pick(rollRarity(def.odds, rng)));
  // Keep the pack's promise: if no card reached its rarity, the last card is rerolled at that rarity or better.
  if (cards.every((c) => rank(c.rarity) < rank(rarity)))
    cards[CARDS_PER_PACK - 1] = pick(rollRarity(oddsAtLeast(def.odds, rarity), rng));
  return { cards, upgrades, rarity };
}

export const formatOdds = (p: number) =>
  p === 0 ? '—' : p < 0.01 ? `${(p * 100).toFixed(1)}%` : `${Math.round(p * 1000) / 10}%`;
