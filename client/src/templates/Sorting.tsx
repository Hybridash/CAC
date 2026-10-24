import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { SortingConfig } from '@bioplay/shared';
import { DndArena, Draggable, DropZone } from './framework/dnd';
import type { TemplateProps } from './framework/types';
import { Burst, Feedback, Progress, Prompt, type FeedbackTone } from './framework/ui';
import { useStage } from './framework/stage';
import { shuffled } from './framework/shuffle';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

const BIN_COLORS = ['#0e7c6b', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#43729d'];

/** A card-deck sorting game: send each card into the right bin, build a combo. */
export function Sorting({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<SortingConfig>) {
  const [deck, setDeck] = useState(() => shuffled(config.items).map((i) => i.id));
  const [sorted, setSorted] = useState<Record<string, string>>({});
  const [missed, setMissed] = useState<Set<string>>(() => new Set());
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const [shake, setShake] = useState(0);
  const [wrongBin, setWrongBin] = useState<string | null>(null);
  const [hit, setHit] = useState<{ bin: string; n: number; emoji: string } | null>(null);
  const completed = useRef(alreadyDone);
  const { immersive } = useStage();
  const byId = useMemo(() => new Map(config.items.map((i) => [i.id, i])), [config.items]);
  const count = Object.keys(sorted).length;
  const total = config.items.length;
  const done = count === total;
  const current = deck[0] ? byId.get(deck[0]) : undefined;

  useEffect(() => {
    if (done && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [done, onComplete]);

  const onDrop = useCallback(
    (itemId: string, binId: string) => {
      const item = byId.get(itemId);
      const bin = config.bins.find((b) => b.id === binId);
      if (!item || !bin || sorted[itemId]) return;
      if (item.bin === binId) {
        sfx.correct();
        setSorted((s) => ({ ...s, [itemId]: binId }));
        setDeck((d) => d.filter((x) => x !== itemId));
        setHit({ bin: binId, n: Date.now(), emoji: item.emoji });
        const next = missed.has(itemId) ? 1 : combo + 1;
        setCombo(next);
        setBest((b) => Math.max(b, next));
        if (next >= 3) sfx.sparkle();
        setFeedback({ text: `${item.emoji} ${item.explain}`, tone: 'good' });
        onStage?.(Math.min(2, Math.floor(((count + 1) / total) * 3)));
      } else {
        sfx.nope();
        setMissed((m) => new Set(m).add(itemId));
        setCombo(0);
        setShake(Date.now());
        setWrongBin(binId);
        setTimeout(() => setWrongBin(null), 600);
        setFeedback({
          text: `Hmm, ${item.label} isn’t quite ${bin.label.toLowerCase()}. Think about: ${bin.description}`,
          tone: 'hint',
        });
      }
    },
    [byId, config.bins, count, total, missed, sorted, combo, onStage],
  );

  const skip = () => {
    sfx.whoosh();
    setDeck((d) => [...d.slice(1), d[0]]);
  };

  const firstTry = total - missed.size;
  const stars = firstTry === total ? 3 : firstTry >= total * 0.7 ? 2 : 1;
  const cols =
    config.bins.length === 2
      ? 'grid-cols-2'
      : config.bins.length === 4
        ? 'grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-3';

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <DndArena onDrop={onDrop}>
        {/* The deck */}
        <div
          className={`relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl bg-night px-4 py-6 ${immersive ? 'min-h-80' : 'min-h-64'}`}
          aria-label="Card to sort"
        >
          <div className="scene-bg absolute inset-0 opacity-40" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="chip bg-white/15 text-white ring-1 ring-white/20">
              <Icon name="cards" size={18} /> {deck.length} left
            </span>
          </div>
          <AnimatePresence>
            {combo >= 2 && (
              <motion.span
                key={combo}
                initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-3 right-3 chip bg-amber-300 py-1 text-amber-950 shadow-lg"
              >
                <Icon name="flame" size={18} /> Combo ×{combo}
              </motion.span>
            )}
          </AnimatePresence>
          {current ? (
            <>
              <div className="relative">
                {/* Cards waiting underneath. */}
                {deck.length > 2 && (
                  <span className="absolute inset-0 translate-x-3 translate-y-3 rotate-6 rounded-3xl bg-white/25" />
                )}
                {deck.length > 1 && (
                  <span className="absolute inset-0 translate-x-1.5 translate-y-1.5 rotate-3 rounded-3xl bg-white/50" />
                )}
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={current.id}
                    initial={{ y: -40, opacity: 0, rotate: -8, scale: 0.8 }}
                    animate={
                      shake
                        ? { x: [0, -14, 14, -10, 10, 0], y: 0, opacity: 1, rotate: 0, scale: 1 }
                        : { y: 0, opacity: 1, rotate: 0, scale: 1 }
                    }
                    exit={{ y: 60, opacity: 0, scale: 0.6 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    className="relative z-10"
                  >
                    <Draggable id={current.id} label={current.label} className="rounded-3xl">
                      <span
                        className={`flex flex-col items-center justify-center gap-1 rounded-3xl bg-surface px-6 shadow-2xl ring-4 ring-white/60 ${immersive ? 'h-56 w-52' : 'h-44 w-44'}`}
                      >
                        <span
                          className={`bob ${immersive ? 'text-8xl' : 'text-7xl'}`}
                          style={{ lineHeight: 1 }}
                          aria-hidden
                        >
                          {current.emoji}
                        </span>
                        <span className="text-center text-lg leading-tight font-extrabold text-ink">
                          {current.label}
                        </span>
                      </span>
                    </Draggable>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="relative flex items-center gap-2 text-sm font-bold text-white/80">
                <span>Drag it to a bin — or tap a bin below</span>
                {deck.length > 1 && (
                  <button
                    type="button"
                    onClick={skip}
                    className="chip bg-white/15 py-1 text-white ring-1 ring-white/25 hover:bg-white/25"
                  >
                    Skip ↻
                  </button>
                )}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative flex flex-col items-center gap-2 text-center text-white"
            >
              <span className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <motion.span
                    key={s}
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2 * s, type: 'spring' }}
                    className={s <= stars ? '' : 'opacity-25 grayscale'}
                  >
                    <Icon name="star" size={52} />
                  </motion.span>
                ))}
              </span>
              <p className="font-display text-3xl font-extrabold">Everything sorted!</p>
              <p className="font-bold text-white/80">
                {firstTry} / {total} right on the first try · best combo ×{Math.max(best, 1)}
              </p>
            </motion.div>
          )}
        </div>

        {/* The bins */}
        <div className={`grid gap-3 ${cols}`}>
          {config.bins.map((b, bi) => {
            const color = BIN_COLORS[bi % BIN_COLORS.length];
            const inBin = config.items.filter((i) => sorted[i.id] === b.id);
            return (
              <DropZone key={b.id} id={b.id} label={b.label} className="rounded-3xl">
                {({ isOver, armed }) => (
                  <motion.div
                    animate={wrongBin === b.id ? { x: [0, -8, 8, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className={`relative flex h-full min-h-44 flex-col overflow-hidden rounded-3xl bg-surface p-3 transition ${isOver ? 'scale-[1.02]' : ''}`}
                    style={{
                      boxShadow: `0 5px 0 ${color}55, 0 0 0 ${isOver ? 4 : armed ? 3 : 2}px ${wrongBin === b.id ? '#f43f5e' : isOver || armed ? color : `${color}55`}${isOver ? `, 0 0 24px ${color}88` : ''}`,
                    }}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-16 opacity-15"
                      style={{ background: `linear-gradient(180deg, ${color}, transparent)` }}
                    />
                    <Burst trigger={hit?.bin === b.id ? hit.n : null} emoji={hit?.emoji} />
                    <div className="relative mb-2 flex items-center gap-2">
                      <span
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-3xl"
                        style={{ background: `${color}22` }}
                        aria-hidden
                      >
                        {b.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="leading-tight font-extrabold">{b.label}</h3>
                        <p className="text-xs text-ink-soft">{b.description}</p>
                      </div>
                      <span
                        className="grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-sm font-extrabold text-white"
                        style={{ background: color }}
                      >
                        {inBin.length}
                      </span>
                    </div>
                    <div className="relative flex flex-1 flex-wrap content-start gap-1.5">
                      {inBin.map((i) => (
                        <motion.span
                          key={i.id}
                          initial={{ scale: 0.3, y: -20 }}
                          animate={{ scale: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                          className="chip py-1 text-ink ring-1"
                          style={{
                            background: `${color}14`,
                            borderColor: color,
                            ['--tw-ring-color' as string]: `${color}66`,
                          }}
                        >
                          <span aria-hidden>{i.emoji}</span> {i.label}
                        </motion.span>
                      ))}
                    </div>
                    {current && !armed && (
                      <button
                        type="button"
                        onClick={() => onDrop(current.id, b.id)}
                        aria-label={`Sort ${current.label} into ${b.label}`}
                        className="relative mt-2 rounded-xl py-1.5 text-sm font-extrabold text-white transition hover:brightness-110 active:scale-95"
                        style={{ background: color }}
                      >
                        <Icon name="pointer" size={18} className="-mt-0.5 mr-1" />
                        Sort here
                      </button>
                    )}
                  </motion.div>
                )}
              </DropZone>
            );
          })}
        </div>
      </DndArena>
      <Feedback text={feedback?.text ?? null} tone={feedback?.tone} />
      <Progress value={count} max={total} label="sorted" />
    </div>
  );
}
