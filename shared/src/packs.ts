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
  blurb: string;
}

export const CARDS_PER_PACK = 3;

export const PACKS: Record<PackTier, PackDefinition> = {
  basic: {
    tier: 'basic',
    name: 'Basic Pack',
    cost: 75,
    odds: { common: 0.6, uncommon: 0.28, rare: 0.09, epic: 0.025, legendary: 0.005 },
    blurb: 'A starter culture of everyday organelles and organisms.',
  },
  rare: {
    tier: 'rare',
    name: 'Rare Pack',
    cost: 200,
    odds: { common: 0.25, uncommon: 0.35, rare: 0.28, epic: 0.1, legendary: 0.02 },
    blurb: 'Better odds of rare and epic finds.',
  },
  legendary: {
    tier: 'legendary',
    name: 'Legendary Pack',
    cost: 500,
    odds: { common: 0, uncommon: 0.15, rare: 0.45, epic: 0.3, legendary: 0.1 },
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

/** Roll the cards for one pack from the pool of pack-eligible avatars. */
export function rollPack(tier: PackTier, pool: Avatar[], rng: Rng): Avatar[] {
  const eligible = pool.filter(isPackEligible);
  const cards: Avatar[] = [];
  for (let i = 0; i < CARDS_PER_PACK; i++) {
    const rarity = rollRarity(PACKS[tier].odds, rng);
    const choices = eligible.filter((a) => a.rarity === rarity);
    cards.push(choices[Math.floor(rng() * choices.length)]);
  }
  return cards;
}

export const formatOdds = (p: number) =>
  p === 0 ? '—' : p < 0.01 ? `${(p * 100).toFixed(1)}%` : `${Math.round(p * 1000) / 10}%`;
