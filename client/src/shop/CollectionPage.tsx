import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AVATAR_RARITIES,
  AVATARS,
  CATEGORY_BY_ID,
  DIRECT_BUY_COST,
  PACKS,
  formatOdds,
  type Avatar,
  type AvatarRarity,
} from '@bioplay/shared';
import { AvatarCard, RARITY_STYLE } from '../components/AvatarCard';
import { AvatarArt } from '../components/AvatarArt';
import { NucleotideIcon } from '../components/Atp';
import { usePlayer } from '../store/player';
import { sfx } from '../lib/sound';

type Show = 'all' | 'owned' | 'locked';
type Source = 'all' | 'pack' | 'category' | 'mystery';

export function CollectionPage() {
  const player = usePlayer((s) => s.player);
  const inventory = useMemo(() => player?.inventory ?? {}, [player?.inventory]);
  const [show, setShow] = useState<Show>('all');
  const [source, setSource] = useState<Source>('all');
  const [rarity, setRarity] = useState<AvatarRarity | 'all'>('all');
  const [selected, setSelected] = useState<Avatar | null>(null);

  const owned = AVATARS.filter((a) => inventory[a.id]).length;
  const list = useMemo(
    () =>
      AVATARS.filter((a) => {
        const has = !!inventory[a.id];
        if (show === 'owned' && !has) return false;
        if (show === 'locked' && has) return false;
        if (source !== 'all' && a.source.kind !== source) return false;
        if (rarity !== 'all' && a.rarity !== rarity) return false;
        return true;
      }),
    [inventory, show, source, rarity],
  );

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl font-extrabold">Collection</h1>
          <p className="text-ink-soft">
            {owned} of {AVATARS.length} avatars collected. Tap one to learn the real biology behind
            it.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {AVATAR_RARITIES.map((r) => {
            const all = AVATARS.filter((a) => a.rarity === r);
            const have = all.filter((a) => inventory[a.id]).length;
            return (
              <span
                key={r}
                className={`chip bg-white py-1 ring-1 ring-black/10 ${RARITY_STYLE[r].text}`}
              >
                {RARITY_STYLE[r].label} {have}/{all.length}
              </span>
            );
          })}
        </div>
      </header>

      <div className="card flex flex-wrap items-center gap-4 p-3">
        <Segment
          label="Show"
          value={show}
          onChange={setShow}
          options={[
            ['all', 'All'],
            ['owned', 'Collected'],
            ['locked', 'Locked'],
          ]}
        />
        <Segment
          label="From"
          value={source}
          onChange={setSource}
          options={[
            ['all', 'All'],
            ['pack', 'Packs'],
            ['category', 'Category rewards'],
            ['mystery', 'Mysteries'],
          ]}
        />
        <label className="flex items-center gap-2 text-sm font-bold">
          Rarity
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value as AvatarRarity | 'all')}
            className="rounded-xl bg-slate-50 px-2 py-1 ring-1 ring-black/10"
          >
            <option value="all">All</option>
            {AVATAR_RARITIES.map((r) => (
              <option key={r} value={r}>
                {RARITY_STYLE[r].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {list.map((a) => (
          <li key={a.id}>
            <button
              className="w-full transition hover:-translate-y-1"
              onClick={() => setSelected(a)}
              aria-label={
                inventory[a.id]
                  ? `${a.name}, ${RARITY_STYLE[a.rarity].label}`
                  : `Locked ${RARITY_STYLE[a.rarity].label} avatar`
              }
            >
              <AvatarCard
                avatar={a}
                locked={!inventory[a.id]}
                count={inventory[a.id]}
                size="sm"
                equipped={player?.equippedAvatar === a.id}
              />
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {selected && <AvatarDetail avatar={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}

function Segment<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: [T, string][];
}) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label={label}>
      <span className="text-sm font-bold">{label}</span>
      <div className="flex rounded-xl bg-slate-100 p-0.5">
        {options.map(([v, l]) => (
          <button
            key={v}
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={`rounded-lg px-2.5 py-1 text-sm font-bold ${value === v ? 'bg-white shadow' : 'text-ink-soft'}`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

function AvatarDetail({ avatar, onClose }: { avatar: Avatar; onClose: () => void }) {
  const player = usePlayer((s) => s.player);
  const equip = usePlayer((s) => s.equip);
  const buyAvatar = usePlayer((s) => s.buyAvatar);
  const [err, setErr] = useState<string | null>(null);
  const owned = !!player?.inventory[avatar.id];
  const equipped = player?.equippedAvatar === avatar.id;
  const r = RARITY_STYLE[avatar.rarity];
  const how =
    avatar.source.kind === 'pack'
      ? `Found in packs: ${Object.values(PACKS)
          .filter((p) => p.odds[avatar.rarity] > 0)
          .map(
            (p) =>
              `${p.name} (${formatOdds(p.odds[avatar.rarity])} ${r.label.toLowerCase()} per card)`,
          )
          .join(', ')}. Or buy it with nucleotides.`
      : avatar.source.kind === 'category'
        ? `Exclusive: complete every concept in ${CATEGORY_BY_ID[avatar.source.category].name}.`
        : 'Exclusive: a chance to win it each time you solve a Bio Mystery for the first time.';
  return (
    <motion.div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={owned ? avatar.name : 'Locked avatar'}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <motion.div
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
        className="card w-full max-w-sm p-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`mx-auto grid w-fit place-items-center rounded-3xl p-3 ring-4 ${owned ? `${r.bg} ${r.ring} ${r.glow}` : 'bg-slate-100 ring-slate-200'}`}
        >
          <AvatarArt avatar={avatar} size={160} silhouette={!owned} />
        </div>
        <h2 className="mt-3 text-2xl font-extrabold">{owned ? avatar.name : '???'}</h2>
        <p className={`text-sm font-extrabold uppercase ${r.text}`}>{r.label}</p>
        {owned ? (
          <p className="mt-2 text-ink-soft">🔬 {avatar.fact}</p>
        ) : (
          <p className="mt-2 text-ink-soft">Collect it to unlock its real-biology fact.</p>
        )}
        <p className="mt-2 text-xs text-ink-soft">{how}</p>
        {err && <p className="mt-2 text-sm font-bold text-amber-800">{err}</p>}
        <div className="mt-4 flex justify-center gap-2">
          {owned ? (
            <button
              className="btn-primary"
              disabled={equipped}
              onClick={() => void equip(avatar.id).then(() => (sfx.correct(), onClose()))}
            >
              {equipped ? 'Equipped ✓' : 'Equip'}
            </button>
          ) : avatar.source.kind === 'pack' ? (
            <button
              className="btn-primary"
              disabled={(player?.nucleotides ?? 0) < DIRECT_BUY_COST[avatar.rarity]}
              onClick={() =>
                buyAvatar(avatar.id)
                  .then(() => sfx.sparkle())
                  .catch((e: Error) => setErr(e.message))
              }
            >
              Buy for <NucleotideIcon size={16} /> {DIRECT_BUY_COST[avatar.rarity]}
            </button>
          ) : null}
          <button className="btn-ghost" onClick={onClose} autoFocus>
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
