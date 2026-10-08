import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AVATAR_BY_ID,
  AVATAR_RARITIES,
  type PackOpenResponse,
  type PackTier,
} from '@bioplay/shared';
import { AvatarCard, RARITY_STYLE } from '../components/AvatarCard';
import { NucleotideIcon } from '../components/Atp';
import { PackArt } from './PackArt';
import { sfx } from '../lib/sound';
import { usePlayer } from '../store/player';

type Stage = 'shake' | 'split' | 'cards';

/** Full-screen pack opening: shake → divide like a cell → flip the three cards. */
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
  const [stage, setStage] = useState<Stage>('shake');
  const [flipped, setFlipped] = useState<boolean[]>(() => result.cards.map(() => false));
  const equip = usePlayer((s) => s.equip);
  const allFlipped = flipped.every(Boolean);

  useEffect(() => {
    sfx.whoosh();
    const t1 = setTimeout(() => {
      setStage('split');
      sfx.pop();
    }, 1300);
    const t2 = setTimeout(() => setStage('cards'), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

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

  const best = useMemo(
    () =>
      [...result.cards].sort(
        (a, b) =>
          AVATAR_RARITIES.indexOf(AVATAR_BY_ID[b.avatarId].rarity) -
          AVATAR_RARITIES.indexOf(AVATAR_BY_ID[a.avatarId].rarity),
      )[0],
    [result.cards],
  );
  const nucleotides = result.cards.reduce((s, c) => s + c.nucleotides, 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Opening pack"
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 overflow-y-auto bg-indigo-950/90 p-4 backdrop-blur-sm"
      data-testid="pack-opening"
    >
      {stage !== 'cards' && (
        <div className="relative flex h-72 w-full items-center justify-center">
          {stage === 'shake' ? (
            <motion.div
              animate={{ rotate: [0, -8, 8, -10, 10, -6, 6, 0], scale: [1, 1.05, 1, 1.08, 1] }}
              transition={{ duration: 1.2 }}
            >
              <PackArt tier={tier} size={190} />
            </motion.div>
          ) : (
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
          )}
          <p
            className="absolute -bottom-6 w-full text-center font-display text-xl font-bold text-white"
            aria-live="polite"
          >
            {stage === 'shake' ? 'Something’s growing…' : 'It’s dividing!'}
          </p>
        </div>
      )}

      {stage === 'cards' && (
        <>
          <h2 className="text-center text-3xl font-extrabold text-white">
            {allFlipped ? 'Your new avatars!' : 'Tap each card to reveal it'}
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {result.cards.map((card, i) => {
              const av = AVATAR_BY_ID[card.avatarId];
              const r = RARITY_STYLE[av.rarity];
              return (
                <motion.button
                  key={i}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.15 }}
                  onClick={() => flip(i)}
                  className="relative h-64 w-44 [perspective:900px]"
                  aria-label={
                    flipped[i]
                      ? `${av.name}, ${r.label}${card.duplicate ? ', duplicate' : ', new'}`
                      : `Reveal card ${i + 1}`
                  }
                  data-testid={flipped[i] ? 'revealed-card' : 'hidden-card'}
                >
                  <motion.div
                    className="relative h-full w-full [transform-style:preserve-3d]"
                    animate={{ rotateY: flipped[i] ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="absolute inset-0 grid place-items-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-700 ring-4 ring-white/40 [backface-visibility:hidden]">
                      <span className="text-6xl" aria-hidden>
                        🧬
                      </span>
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
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  className="btn-primary"
                  onClick={() => void equip(best.avatarId).then(onClose)}
                >
                  Equip {AVATAR_BY_ID[best.avatarId].name}
                </button>
                {onAgain && (
                  <button className="btn-ghost" onClick={onAgain}>
                    Open another
                  </button>
                )}
                <button className="btn-ghost" onClick={onClose}>
                  Done
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
