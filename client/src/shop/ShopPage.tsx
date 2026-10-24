import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AVATAR_RARITIES,
  AVATARS,
  CARDS_PER_PACK,
  DIRECT_BUY_COST,
  DUPLICATE_NUCLEOTIDES,
  formatOdds,
  PACK_UPGRADE_TAPS,
  isPackEligible,
  PACKS,
  type AvatarRarity,
  type PackOpenResponse,
  type PackTier,
} from '@bioplay/shared';
import { AtpIcon, NucleotideIcon } from '../components/Atp';
import { AvatarCard, RARITY_STYLE } from '../components/AvatarCard';
import { usePlayer } from '../store/player';
import { PackArt } from './PackArt';
import { PackOpening } from './PackOpening';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

export function ShopPage() {
  const player = usePlayer((s) => s.player);
  const openPack = usePlayer((s) => s.openPack);
  const buyAvatar = usePlayer((s) => s.buyAvatar);
  const [opening, setOpening] = useState<PackOpenResponse | null>(null);
  const [busy, setBusy] = useState<PackTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rarity, setRarity] = useState<AvatarRarity | 'all'>('all');
  const atp = player?.atp ?? 0;
  const nucleotides = player?.nucleotides ?? 0;

  const open = async (tier: PackTier) => {
    setBusy(tier);
    setError(null);
    try {
      setOpening(await openPack(tier));
    } catch (e) {
      setError((e as Error).message);
      sfx.nope();
    } finally {
      setBusy(null);
    }
  };

  const buyable = useMemo(
    () =>
      AVATARS.filter(
        (a) =>
          isPackEligible(a) &&
          !player?.inventory[a.id] &&
          (rarity === 'all' || a.rarity === rarity),
      ).sort((a, b) => AVATAR_RARITIES.indexOf(a.rarity) - AVATAR_RARITIES.indexOf(b.rarity)),
    [player?.inventory, rarity],
  );

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold">Shop</h1>
          <p className="text-ink-soft">
            Spend the ATP you earn from lessons on card packs. No real money — ever.
          </p>
        </div>
        <div className="flex gap-5 text-lg font-semibold tabular-nums">
          <span className="inline-flex items-center gap-1.5">
            <AtpIcon size={22} /> {atp} ATP
          </span>
          <span className="inline-flex items-center gap-1.5">
            <NucleotideIcon size={20} /> {nucleotides}
          </span>
        </div>
      </header>

      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-amber-50 p-3 font-semibold text-amber-900 ring-1 ring-amber-200"
        >
          <Icon name="bulb" size={22} className="mr-1 -mt-0.5" />
          {error}.{' '}
          <Link to="/library" className="underline">
            Find a lesson to earn more →
          </Link>
        </p>
      )}

      <section aria-labelledby="packs-h">
        <h2 id="packs-h" className="mb-3 text-2xl font-extrabold">
          Card packs{' '}
          <span className="text-base font-bold text-ink-soft">· {CARDS_PER_PACK} avatars each</span>
        </h2>
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {(Object.keys(PACKS) as PackTier[]).map((tier) => {
            const p = PACKS[tier];
            const short = p.cost - atp;
            return (
              <article key={tier} className="flex flex-col items-center gap-3 border-t border-line pt-5 text-center">
                <div className="animate-float">
                  <PackArt tier={tier} size={110} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold">{p.name}</h3>
                  <p className="text-sm text-ink-soft">{p.blurb}</p>
                </div>
                <table className="w-full text-sm" aria-label={`${p.name} odds per card`}>
                  <caption className="mb-1 text-left text-xs font-extrabold text-ink-soft">
                    Odds per card
                  </caption>
                  <tbody>
                    {AVATAR_RARITIES.map((r) => (
                      <tr key={r} className={p.odds[r] === 0 ? 'opacity-40' : ''}>
                        <td className={`py-0.5 text-left font-bold ${RARITY_STYLE[r].text}`}>
                          {RARITY_STYLE[r].label}
                        </td>
                        <td className="py-0.5 text-right font-semibold tabular-nums">
                          {formatOdds(p.odds[r])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="w-full text-left text-sm text-ink-soft">
                  Tap it {PACK_UPGRADE_TAPS}× before opening: each tap has a{' '}
                  {formatOdds(p.upgradeChance)} chance to raise its rarity. Each step up guarantees
                  a better card.
                </p>
                <button
                  className="btn-primary mt-auto w-full"
                  onClick={() => open(tier)}
                  disabled={short > 0 || busy !== null}
                  data-testid={`open-${tier}`}
                >
                  {busy === tier ? (
                    'Opening…'
                  ) : (
                    <>
                      Open for <AtpIcon size={18} /> {p.cost}
                    </>
                  )}
                </button>
                {short > 0 && (
                  <p className="text-xs font-bold text-ink-soft">
                    Earn {short} more ATP to open this one.
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="nuc-h" className="border-t border-line pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="nuc-h" className="flex items-center gap-2 text-2xl font-extrabold">
              Nucleotide exchange
            </h2>
            <p className="max-w-2xl text-sm text-ink-soft">
              Pulled a duplicate? It turns into nucleotides (
              {AVATAR_RARITIES.map(
                (r) => `${RARITY_STYLE[r].label} ${DUPLICATE_NUCLEOTIDES[r]}`,
              ).join(', ')}
              ). Use them to pick exactly the avatar you want.
            </p>
          </div>
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
        {buyable.length === 0 ? (
          <p className="mt-4 font-bold text-emerald-700">You own every avatar here. Wow!</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {buyable.map((a) => {
              const cost = DIRECT_BUY_COST[a.rarity];
              return (
                <li key={a.id} className="flex flex-col items-center gap-2">
                  <AvatarCard avatar={a} size="sm" />
                  <button
                    className="btn-ghost w-full py-1 text-sm"
                    disabled={nucleotides < cost}
                    onClick={() =>
                      buyAvatar(a.id)
                        .then(() => sfx.sparkle())
                        .catch((e: Error) => setError(e.message))
                    }
                    aria-label={`Buy ${a.name} for ${cost} nucleotides`}
                  >
                    <NucleotideIcon size={14} /> {cost}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {opening && (
        <PackOpening
          result={opening}
          onClose={() => setOpening(null)}
          onAgain={
            atp >= PACKS[opening.tier as PackTier].cost
              ? () => void open(opening.tier as PackTier)
              : undefined
          }
        />
      )}
    </div>
  );
}
