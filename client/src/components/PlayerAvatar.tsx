import { AVATAR_BY_ID, STARTER_AVATAR } from '@bioplay/shared';
import { usePlayer } from '../store/player';
import { AvatarArt } from './AvatarArt';

/** The player's equipped avatar, shown in the header and cheering during lessons. */
export function PlayerAvatar({ size = 40 }: { size?: number }) {
  const equipped = usePlayer((s) => s.player?.equippedAvatar ?? STARTER_AVATAR);
  const avatar = AVATAR_BY_ID[equipped] ?? AVATAR_BY_ID[STARTER_AVATAR];
  return (
    <span
      className="grid place-items-center rounded-full bg-white ring-2 ring-emerald-200"
      style={{ width: size, height: size }}
      title={avatar.name}
    >
      <AvatarArt avatar={avatar} size={size * 0.92} animate={size > 48} />
    </span>
  );
}
