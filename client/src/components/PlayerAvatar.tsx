import { usePlayer } from '../store/player';

/** The player's equipped avatar (placeholder until the collection ships). */
export function PlayerAvatar({ size = 40 }: { size?: number }) {
  const name = usePlayer((s) => s.player?.displayName ?? 'Explorer');
  return (
    <span
      className="grid place-items-center rounded-full bg-emerald-100 ring-2 ring-white"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      title={name}
      aria-hidden
    >
      🧑‍🔬
    </span>
  );
}
