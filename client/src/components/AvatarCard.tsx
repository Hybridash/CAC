import type { Avatar, AvatarRarity } from '@bioplay/shared';
import { AvatarArt } from './AvatarArt';

export const RARITY_STYLE: Record<
  AvatarRarity,
  { label: string; ring: string; bg: string; glow: string; text: string }
> = {
  common: {
    label: 'Common',
    ring: 'ring-slate-300',
    bg: 'bg-slate-50',
    glow: '',
    text: 'text-slate-600',
  },
  uncommon: {
    label: 'Uncommon',
    ring: 'ring-green-400',
    bg: 'bg-green-50',
    glow: 'shadow-[0_0_14px_rgba(34,197,94,0.35)]',
    text: 'text-green-700',
  },
  rare: {
    label: 'Rare',
    ring: 'ring-blue-500',
    bg: 'bg-blue-50',
    glow: 'shadow-[0_0_18px_rgba(59,130,246,0.45)]',
    text: 'text-blue-700',
  },
  epic: {
    label: 'Epic',
    ring: 'ring-purple-500',
    bg: 'bg-gradient-to-br from-purple-50 to-fuchsia-100',
    glow: 'shadow-[0_0_22px_rgba(168,85,247,0.55)]',
    text: 'text-purple-700',
  },
  legendary: {
    label: 'Legendary',
    ring: 'ring-amber-400',
    bg: 'legendary-shimmer',
    glow: 'shadow-[0_0_28px_rgba(245,158,11,0.7)]',
    text: 'text-amber-800',
  },
};

/** A collectible card: rarity border and glow, art, name. */
export function AvatarCard({
  avatar,
  locked = false,
  count,
  size = 'md',
  equipped = false,
}: {
  avatar: Avatar;
  locked?: boolean;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  equipped?: boolean;
}) {
  const r = RARITY_STYLE[avatar.rarity];
  const art = size === 'lg' ? 150 : size === 'sm' ? 64 : 92;
  return (
    <div
      className={`relative flex flex-col items-center rounded-3xl p-2.5 ring-4 ${locked ? 'bg-slate-100 ring-slate-200' : `${r.bg} ${r.ring} ${r.glow}`}`}
    >
      {equipped && (
        <span className="chip absolute -top-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-[10px] text-white">
          Equipped
        </span>
      )}
      {count && count > 1 ? (
        <span className="chip absolute top-1.5 right-1.5 bg-white/90 text-[10px]">×{count}</span>
      ) : null}
      <AvatarArt avatar={avatar} size={art} silhouette={locked} />
      <span
        className={`mt-1 text-center leading-tight font-extrabold ${size === 'sm' ? 'text-[11px]' : 'text-sm'}`}
      >
        {locked ? '???' : avatar.name}
      </span>
      <span
        className={`text-[10px] font-extrabold uppercase ${locked ? 'text-slate-400' : r.text}`}
      >
        {r.label}
      </span>
    </div>
  );
}
