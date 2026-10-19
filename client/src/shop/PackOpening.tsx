import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AVATAR_BY_ID,
  AVATAR_RARITIES,
  type AvatarRarity,
  type PackOpenResponse,
  type PackTier,
} from '@bioplay/shared';
import { AvatarCard, RARITY_STYLE } from '../components/AvatarCard';
import { NucleotideIcon } from '../components/Atp';
import { PackArt } from './PackArt';
import { sfx } from '../lib/sound';
import { usePlayer } from '../store/player';
import { Icon } from '../components/Icon';

type Stage = 'charge' | 'split' | 'cards';

/** Aura color around the floating pack for each pack rarity. */
const AURA: Record<AvatarRarity, string> = {
  common: '#cbd5e1',
  uncommon: '#34d399',
  rare: '#38bdf8',
  epic: '#e879f9',
  legendary: '#fbbf24',
};

/** Minimum time between taps, so each upgrade (or miss) gets its moment. */
const TAP_COOLDOWN_MS = 450;

/**
 * Full-screen pack opening: the pack floats and shakes while the player taps it; each tap may raise
 * its rarity (rolled by the server) → it divides like a cell → flip the three cards.
 */
export function PackOpening({
  result,
  onClose,
  onAgain,
}: {
  result: PackOpenResponse;
  onClose: () => void;
  onAgain?: () => void;
}) {
  const tier = result.tier as PackTier;
  const [stage, setStage] = useState<Stage>('charge');
  /** How many of the pack's taps have been used, and the result of the latest one. */
  const [taps, setTaps] = useState(0);
  const [lastTap, setLastTap] = useState<'up' | 'miss' | null>(null);
  const lastTapAt = useRef(0);
  const level = result.upgrades.slice(0, taps).filter(Boolean).length;
  const packRarity = AVATAR_RARITIES[level];
  const tapsLeft = result.upgrades.length - taps;
  const [flipped, setFlipped] = useState<boolean[]>(() => result.cards.map(() => false));
  const equip = usePlayer((s) => s.equip);
  const equipped = usePlayer((s) => s.player?.equippedAvatar ?? null);
  const allFlipped = flipped.every(Boolean);
  /** The revealed card the player picked to wear, if any. Nothing is equipped unless they choose. */
  const [chosen, setChosen] = useState<number | null>(null);
  const [equipping, setEquipping] = useState(false);
  const [equipError, setEquipError] = useState<string | null>(null);

  useEffect(() => {
    sfx.whoosh();
  }, []);

  // After the last tap, let the final rarity sink in, then divide and deal the cards.
  useEffect(() => {
    if (tapsLeft > 0) return;
    const t1 = setTimeout(() => {
      setStage('split');
      sfx.pop();
    }, 1100);
    const t2 = setTimeout(() => setStage('cards'), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [tapsLeft]);

  const tapPack = () => {
    const now = Date.now();
    if (tapsLeft === 0 || now - lastTapAt.current < TAP_COOLDOWN_MS) return;
    lastTapAt.current = now;
    const up = result.upgrades[taps];
    if (up) {
      if (level + 1 === AVATAR_RARITIES.length - 1) sfx.fanfare();
      else sfx.sparkle();
    } else sfx.drop();
    setLastTap(up ? 'up' : 'miss');
    setTaps((n) => n + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && allFlipped) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [allFlipped, onClose]);

  const revealed = useRef<boolean[]>(result.cards.map(() => false));
  const flip = (i: number) => {
    if (revealed.current[i]) return;
    revealed.current[i] = true;
    const av = AVATAR_BY_ID[result.cards[i].avatarId];
    if (av.rarity === 'legendary') sfx.fanfare();
    else if (av.rarity === 'epic' || av.rarity === 'rare') sfx.sparkle();
    else sfx.pop();
    setFlipped((f) => f.map((x, j) => (j === i ? true : x)));
  };

  /** Tap a hidden card to reveal it; tap a revealed one to pick (or un-pick) it to equip. */
  const tapCard = (i: number) => {
    if (!flipped[i]) return flip(i);
    setEquipError(null);
    setChosen((c) => (c === i ? null : i));
  };

  const equipChosen = async () => {
    if (chosen === null) return;
    setEquipping(true);
    setEquipError(null);
    try {
      await equip(result.cards[chosen].avatarId);
      onClose();
    } catch (e) {
      setEquipError((e as Error).message || 'Couldn’t equip that avatar. Please try again.');
      setEquipping(false);
    }
  };
  const chosenAvatar = chosen === null ? null : AVATAR_BY_ID[result.cards[chosen].avatarId];

  const nucleotides = result.cards.reduce((s, c) => s + c.nucleotides, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Opening pack"
      className="fixed inset-0 z-[80] flex flex-col items-center [justify-content:safe_center] gap-6 overflow-y-auto bg-indigo-950/90 p-4 backdrop-blur-sm"
      data-testid="pack-opening"
    >
      {stage === 'charge' && (
        <div className="flex w-full flex-col items-center gap-5">
          <motion.p
            key={packRarity}
            initial={{ scale: level > 0 ? 1.6 : 1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            className="font-display text-3xl font-extrabold uppercase"
            style={{ color: AURA[packRarity] }}
            data-testid="pack-rarity"
          >
            {RARITY_STYLE[packRarity].label} pack
          </motion.p>

          <div className="relative grid h-80 w-full place-items-center">
            {/* Aura: grows and pulses faster as the pack's rarity climbs. */}
            <motion.div
              aria-hidden
              className="absolute h-56 w-56 rounded-full blur-2xl"
              style={{ background: AURA[packRarity] }}
              animate={{ scale: [1, 1.15 + level * 0.08, 1], opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 1.6 - level * 0.25, repeat: Infinity, ease: 'easeInOut' }}
            />
            {lastTap === 'up' && (
              <motion.div
                key={`ring-${taps}`}
                aria-hidden
                className="absolute h-40 w-40 rounded-full border-8"
                style={{ borderColor: AURA[packRarity] }}
                initial={{ scale: 0.6, opacity: 1 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            )}
            {/* Levitate: a slow bob up and down. */}
            <motion.div
              animate={{ y: [0, -18, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Hover-shake: a constant jitter that gets more restless with every upgrade. */}
              <motion.div
                animate={
                  tapsLeft > 0
                    ? { rotate: [-(2 + level), 2 + level, -(2 + level)], x: [-1, 1, -1] }
                    : { rotate: 0, x: 0 }
                }
                transition={{ duration: 0.3 - level * 0.04, repeat: Infinity, ease: 'linear' }}
              >
                <motion.button
                  key={`tap-${taps}`}
                  type="button"
                  onClick={tapPack}
                  disabled={tapsLeft === 0}
                  animate={
                    taps === 0
                      ? {}
                      : lastTap === 'up'
                        ? { scale: [1, 1.25, 0.95, 1.05, 1], rotate: [0, -16, 16, -8, 0] }
                        : { scale: [1, 0.92, 1], rotate: [0, -6, 6, 0] }
                  }
                  transition={{ duration: lastTap === 'up' ? 0.6 : 0.35 }}
                  className="block rounded-3xl focus-visible:ring-4 focus-visible:ring-white"
                  aria-label={
                    tapsLeft > 0
                      ? `Tap the pack. ${RARITY_STYLE[packRarity].label} so far, ${tapsLeft} ${tapsLeft === 1 ? 'tap' : 'taps'} left`
                      : `${RARITY_STYLE[packRarity].label} pack, opening`
                  }
                  data-testid="pack-tap"
                >
                  <PackArt tier={tier} size={190} />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

          <div className="flex gap-2" aria-hidden>
            {result.upgrades.map((up, i) => (
              <span
                key={i}
                className={`h-3.5 w-3.5 rounded-full ring-2 ring-white/60 transition ${i >= taps ? 'bg-white/10' : up ? '' : 'bg-white/40'}`}
                style={
                  i < taps && up
                    ? {
                        background:
                          AURA[
                            AVATAR_RARITIES[result.upgrades.slice(0, i + 1).filter(Boolean).length]
                          ],
                      }
                    : undefined
                }
              />
            ))}
          </div>
          <p className="text-center font-display text-xl font-bold text-white" aria-live="polite">
            {tapsLeft === 0
              ? `${RARITY_STYLE[packRarity].label} pack — at least one ${RARITY_STYLE[packRarity].label} or better!`
              : lastTap === 'up'
                ? `Upgraded to ${RARITY_STYLE[packRarity].label}! Tap again`
                : lastTap === 'miss'
                  ? 'No change… tap again'
                  : 'Tap the pack to try to raise its rarity!'}
          </p>
        </div>
      )}

      {stage === 'split' && (
        <div className="relative flex h-72 w-full items-center justify-center">
          <>
            <motion.div
              className="absolute"
              initial={{ x: 0 }}
              animate={{ x: -110, rotate: -12, opacity: 0.25 }}
              transition={{ duration: 0.8 }}
            >
              <PackArt tier={tier} size={190} half="left" />
            </motion.div>
            <motion.div
              className="absolute"
              initial={{ x: 0 }}
              animate={{ x: 110, rotate: 12, opacity: 0.25 }}
              transition={{ duration: 0.8 }}
            >
              <PackArt tier={tier} size={190} half="right" />
            </motion.div>
            <motion.div
              className="absolute h-40 w-40 rounded-full bg-white"
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </>
          <p
            className="absolute -bottom-6 w-full text-center font-display text-xl font-bold text-white"
            aria-live="polite"
          >
            It’s dividing!
          </p>
        </div>
      )}

      {stage === 'cards' && (
        <>
          <span className="chip font-extrabold text-ink" style={{ background: AURA[packRarity] }}>
            {RARITY_STYLE[packRarity].label} pack
          </span>
          <h2 className="-mt-3 text-center text-3xl font-extrabold text-white">
            {allFlipped ? 'Your new avatars!' : 'Tap each card to reveal it'}
          </h2>
          {allFlipped && (
            <p className="-mt-3 text-center font-bold text-indigo-100">
              Tap an avatar to choose it, then equip it — or keep your current one.
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {result.cards.map((card, i) => {
              const av = AVATAR_BY_ID[card.avatarId];
              const r = RARITY_STYLE[av.rarity];
              const isChosen = chosen === i;
              const isWorn = equipped === card.avatarId;
              return (
                <motion.button
                  key={i}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  onClick={() => tapCard(i)}
                  className={`relative h-64 w-44 rounded-3xl transition [perspective:900px] ${isChosen ? 'ring-4 ring-emerald-400 ring-offset-4 ring-offset-indigo-950' : ''}`}
                  aria-label={
                    flipped[i]
                      ? `${av.name}, ${r.label}${card.duplicate ? ', duplicate' : ', new'}${isWorn ? ', equipped' : ''}. Choose to equip`
                      : `Reveal card ${i + 1}`
                  }
                  aria-pressed={flipped[i] ? isChosen : undefined}
                  data-testid={flipped[i] ? 'revealed-card' : 'hidden-card'}
                >
                  <motion.div
                    className="relative h-full w-full [transform-style:preserve-3d]"
                    animate={{ rotateY: flipped[i] ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute inset-0 grid place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-700 ring-4 ring-white/40 [backface-visibility:hidden]">
                      <Icon name="dna" size={72} />
                      <span className="absolute bottom-4 text-sm font-extrabold text-white/80">
                        tap!
                      </span>
                    </div>
                    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      {flipped[i] && (av.rarity === 'legendary' || av.rarity === 'epic') && (
                        <Burst legendary={av.rarity === 'legendary'} />
                      )}
                      <motion.div
                        animate={
                          flipped[i] && av.rarity !== 'common'
                            ? { scale: [1, av.rarity === 'legendary' ? 1.15 : 1.07, 1] }
                            : {}
                        }
                        transition={{ delay: 0.5, duration: 0.6 }}
                      >
                        <AvatarCard avatar={av} size="md" />
                      </motion.div>
                      {flipped[i] && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 }}
                          className="mt-2 flex justify-center"
                        >
                          {card.duplicate ? (
                            <span className="chip bg-violet-100 text-violet-900">
                              Duplicate → +{card.nucleotides} <NucleotideIcon size={14} />
                            </span>
                          ) : (
                            <span className="chip bg-emerald-400 text-emerald-950">NEW!</span>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                  {flipped[i] && (isChosen || isWorn) && (
                    <span
                      className={`absolute -top-3 left-1/2 z-10 -translate-x-1/2 chip py-0.5 text-xs shadow ${isChosen ? 'bg-emerald-400 text-emerald-950' : 'bg-white text-ink'}`}
                    >
                      <Icon name="check" size={14} /> {isChosen ? 'Chosen' : 'Wearing'}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
          {!allFlipped ? (
            <button
              className="btn-ghost"
              onClick={() => result.cards.forEach((_, i) => setTimeout(() => flip(i), i * 350))}
            >
              Reveal all
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              {nucleotides > 0 && (
                <p className="flex items-center gap-1 text-center font-bold text-violet-200">
                  Duplicates gave you {nucleotides} <NucleotideIcon size={16} /> nucleotides — spend
                  them on any avatar you want.
                </p>
              )}
              {equipError && (
                <p role="alert" className="font-bold text-rose-300">
                  {equipError}
                </p>
              )}
              <div className="flex flex-wrap justify-center gap-2">
                {chosenAvatar && (
                  <button className="btn-primary" onClick={equipChosen} disabled={equipping}>
                    {equipping ? 'Equipping…' : `Equip ${chosenAvatar.name}`}
                  </button>
                )}
                {onAgain && (
                  <button className="btn-ghost" onClick={onAgain}>
                    Open another
                  </button>
                )}
                <button className="btn-ghost" onClick={onClose}>
                  {chosenAvatar ? 'Don’t equip' : 'Done'}
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

function Burst({ legendary }: { legendary: boolean }) {
  return (
    <motion.div
      className="pointer-events-none absolute -inset-10"
      initial={{ opacity: 0, rotate: 0 }}
      animate={{ opacity: [0, 1, 0.7], rotate: 90 }}
      transition={{ duration: 2.5 }}
      aria-hidden
    >
      <svg viewBox="-50 -50 100 100" className="h-full w-full">
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d="M0 0L-4 -48L4 -48Z"
            fill={legendary ? '#fde047' : '#e879f9'}
            opacity=".55"
            transform={`rotate(${i * 30})`}
          />
        ))}
      </svg>
    </motion.div>
  );
}
