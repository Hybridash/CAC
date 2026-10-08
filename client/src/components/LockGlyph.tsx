import type { LockShape } from '@bioplay/shared';

const PATHS: Record<LockShape, string> = {
  triangle: 'M50 22 L72 60 H28 Z',
  square: 'M31 24 H69 V62 H31 Z',
  circle: 'M50 22 a20 20 0 1 1 -0.01 0 Z',
  star: 'M50 18 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2 Z',
  hexagon: 'M50 20 l20 11 v22 l-20 11 -20 -11 v-22 Z',
  cross: 'M42 20 h16 v14 h14 v16 h-14 v14 h-16 v-14 h-14 v-16 h14 Z',
  wave: 'M26 50 q8 -24 16 0 t16 0 t16 0 v14 h-48 Z',
  notch: 'M28 26 h44 v36 h-14 v-14 h-16 v14 h-14 Z',
};

/** A molecule (key) with a shaped "binding part", or a receptor (lock) with a matching socket. */
export function LockGlyph({
  shape,
  color,
  size = 72,
  variant,
  filled = false,
}: {
  shape: LockShape;
  color: string;
  size?: number;
  variant: 'key' | 'lock';
  /** For locks: show a key sitting in the socket. */
  filled?: boolean;
}) {
  if (variant === 'key') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
        <circle cx="50" cy="50" r="40" fill="white" stroke={color} strokeWidth="5" opacity="0.9" />
        <path
          d={PATHS[shape]}
          fill={color}
          stroke="rgba(30,27,46,.6)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="44" r="3" fill="white" opacity=".7" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <rect x="6" y="10" width="88" height="80" rx="22" fill={color} opacity="0.25" />
      <rect
        x="6"
        y="10"
        width="88"
        height="80"
        rx="22"
        fill="none"
        stroke={color}
        strokeWidth="5"
      />
      <path
        d={PATHS[shape]}
        fill={filled ? color : 'white'}
        stroke={color}
        strokeWidth="3"
        strokeDasharray={filled ? undefined : '5 4'}
        strokeLinejoin="round"
      />
    </svg>
  );
}
