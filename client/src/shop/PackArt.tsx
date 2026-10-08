import type { PackTier } from '@bioplay/shared';

export const PACK_COLORS: Record<PackTier, { a: string; b: string; ink: string; emoji: string }> = {
  basic: { a: '#86efac', b: '#22c55e', ink: '#14532d', emoji: '🧫' },
  rare: { a: '#93c5fd', b: '#3b82f6', ink: '#1e3a8a', emoji: '🔬' },
  legendary: { a: '#fde68a', b: '#f59e0b', ink: '#78350f', emoji: '👑' },
};

/** A pack drawn as a plump cell, so opening it can look like cell division. */
export function PackArt({
  tier,
  size = 140,
  half,
}: {
  tier: PackTier;
  size?: number;
  half?: 'left' | 'right';
}) {
  const c = PACK_COLORS[tier];
  const clip =
    half === 'left' ? 'inset(0 50% 0 0)' : half === 'right' ? 'inset(0 0 0 50%)' : undefined;
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      aria-hidden
      style={{ clipPath: clip }}
    >
      <defs>
        <radialGradient id={`pk-${tier}`} cx="35%" cy="30%">
          <stop offset="0" stopColor="#fff" stopOpacity=".9" />
          <stop offset=".35" stopColor={c.a} />
          <stop offset="1" stopColor={c.b} />
        </radialGradient>
      </defs>
      <path
        d="M50 6C80 6 94 28 94 60S80 114 50 114 6 92 6 60 20 6 50 6z"
        fill={`url(#pk-${tier})`}
        stroke={c.ink}
        strokeWidth="3.5"
      />
      <ellipse
        cx="50"
        cy="62"
        rx="22"
        ry="20"
        fill="white"
        fillOpacity=".35"
        stroke={c.ink}
        strokeWidth="2"
        strokeDasharray="4 3"
      />
      <text x="50" y="72" textAnchor="middle" fontSize="26">
        {c.emoji}
      </text>
      <text x="50" y="100" textAnchor="middle" fontSize="11" fontWeight="900" fill={c.ink}>
        BIOPLAY
      </text>
      {tier === 'legendary' && (
        <path
          d="M22 26l6 4M78 26l-6 4M50 14v7"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
