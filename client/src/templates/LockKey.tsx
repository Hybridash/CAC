import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { LockKeyConfig } from '@bioplay/shared';
import { DndArena, Draggable, DropZone } from './framework/dnd';
import type { TemplateProps } from './framework/types';
import { Burst, Feedback, Progress, Prompt, type FeedbackTone } from './framework/ui';
import { useStage } from './framework/stage';
import { LockGlyph } from '../components/LockGlyph';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

/** Match free-floating molecules to their binding sites. Wrong shapes bounce off. */
export function LockKey({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<LockKeyConfig>) {
  const [bound, setBound] = useState<Record<string, string>>({}); // receptorId -> moleculeId
  const [bounce, setBounce] = useState<{ receptor: string; n: number } | null>(null);
  const [snap, setSnap] = useState<{ receptor: string; n: number } | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const completed = useRef(alreadyDone);
  const { immersive } = useStage();
  const keys = config.molecules.filter((m) => m.fits);
  const placedCount = Object.keys(bound).length;
  const done = keys.every((k) => Object.values(bound).includes(k.id));

  useEffect(() => {
    if (done && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [done, onComplete]);

  const onDrop = useCallback(
    (moleculeId: string, receptorId: string) => {
      const m = config.molecules.find((x) => x.id === moleculeId);
      const r = config.receptors.find((x) => x.id === receptorId);
      if (!m || !r) return;
      if (bound[receptorId]) {
        setFeedback({ text: `${r.label} is already occupied.`, tone: 'hint' });
        return;
      }
      if (m.fits === receptorId) {
        sfx.correct();
        setBound((b) => ({ ...b, [receptorId]: moleculeId }));
        setSnap({ receptor: receptorId, n: Date.now() });
        setFeedback({ text: m.message, tone: 'good' });
        onStage?.(Math.min(2, placedCount + 1));
      } else {
        sfx.nope();
        setBounce({ receptor: receptorId, n: Date.now() });
        const text = !m.fits
          ? m.message
          : `Boing! ${m.label} has the wrong shape for ${r.label} — it bounces right off.`;
        setFeedback({ text, tone: 'hint' });
      }
    },
    [config.molecules, config.receptors, bound, placedCount, onStage],
  );

  const free = config.molecules.filter((m) => !Object.values(bound).includes(m.id));
  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <DndArena onDrop={onDrop}>
        <div className="overflow-hidden rounded-3xl ring-2 ring-black/10">
          {/* Free molecules drift in solution above the binding sites. */}
          <div
            className={`relative flex flex-wrap items-center justify-center gap-4 px-4 pt-8 pb-6 ${immersive ? 'min-h-56' : 'min-h-40'}`}
            style={{
              background:
                'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.7), transparent 40%), linear-gradient(180deg, #cffafe, #e0f2fe)',
            }}
          >
            <span className="absolute top-2 left-3 text-xs font-extrabold text-sky-800/70">
              Free molecules
            </span>
            <AnimatePresence>
              {free.map((m, i) => (
                <motion.div
                  key={m.id}
                  layout
                  exit={{ scale: 0, opacity: 0 }}
                  className="bob"
                  style={
                    {
                      '--dur': `${2.4 + (i % 4) * 0.5}s`,
                      animationDelay: `${-i * 0.6}s`,
                    } as React.CSSProperties
                  }
                >
                  <Draggable id={m.id} label={m.label} className="rounded-full">
                    <span className="flex flex-col items-center rounded-3xl bg-surface/80 p-1.5 shadow-lg ring-2 ring-white">
                      <LockGlyph
                        shape={m.shape}
                        color={m.color}
                        variant="key"
                        size={immersive ? 76 : 62}
                      />
                      <span className="max-w-24 text-center text-xs leading-tight font-extrabold">
                        {m.label}
                      </span>
                    </span>
                  </Draggable>
                </motion.div>
              ))}
            </AnimatePresence>
            {!free.length && (
              <span className="font-extrabold text-sky-900">
                <Icon name="party" size={22} className="-mt-0.5 mr-1" /> Every molecule is bound!
              </span>
            )}
          </div>

          <DockingSurface />

          {/* The binding sites. */}
          <div className="bg-surface px-3 pt-1 pb-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {config.receptors.map((r) => {
                const m = config.molecules.find((x) => x.id === bound[r.id]);
                return (
                  <DropZone key={r.id} id={r.id} label={r.label} className="rounded-3xl">
                    {({ isOver, armed }) => (
                      <motion.div
                        animate={bounce?.receptor === r.id ? { x: [0, -10, 10, -6, 6, 0] } : {}}
                        key={bounce?.receptor === r.id ? bounce.n : 'still'}
                        className={`relative flex h-full flex-col items-center rounded-3xl bg-surface p-2 text-center transition ${
                          isOver ? 'scale-105' : ''
                        }`}
                        style={{
                          boxShadow: m
                            ? `0 0 0 3px ${m.effect === 'block' ? '#f43f5e' : '#10b981'}, 0 0 22px ${m.effect === 'block' ? '#f43f5e88' : '#10b98188'}`
                            : `0 0 0 ${isOver ? 4 : 2}px ${isOver || armed ? r.color : `${r.color}55`}, 0 4px 0 ${r.color}33`,
                        }}
                      >
                        <Burst trigger={snap?.receptor === r.id ? snap.n : null} />
                        <span
                          className="absolute -top-2 left-1/2 h-3 w-10 -translate-x-1/2 rounded-full"
                          style={{ background: r.color }}
                          aria-hidden
                        />
                        <div className="relative">
                          <LockGlyph
                            shape={r.shape}
                            color={r.color}
                            variant="lock"
                            filled={!!m}
                            size={immersive ? 88 : 72}
                          />
                          {m && (
                            <motion.span
                              initial={{ y: -30, opacity: 0, scale: 0.4 }}
                              animate={{ y: 0, opacity: 1, scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                              className="absolute -top-2 -right-2"
                              aria-hidden
                            >
                              <Icon name={m.effect === 'block' ? 'noEntry' : 'sparkle'} size={26} />
                            </motion.span>
                          )}
                        </div>
                        <span className="text-sm leading-tight font-extrabold">{r.label}</span>
                        <span
                          className={`text-xs ${m ? (m.effect === 'block' ? 'font-bold text-rose-700' : 'font-bold text-emerald-700') : 'text-ink-soft'}`}
                        >
                          {m
                            ? `${m.effect === 'block' ? 'Blocked by' : 'Activated by'} ${m.label}`
                            : r.description}
                        </span>
                      </motion.div>
                    )}
                  </DropZone>
                );
              })}
            </div>
            <p className="mt-3 text-center text-xs font-extrabold text-indigo-900/50">
              Binding sites
            </p>
          </div>
        </div>
      </DndArena>
      <Feedback text={feedback?.text ?? null} tone={feedback?.tone} />
      <Progress
        value={Object.values(bound).filter((id) => keys.some((k) => k.id === id)).length}
        max={keys.length}
        label="matched"
      />
    </div>
  );
}

/** A wavy, bumpy surface the binding sites sit on (deliberately generic: proteins, DNA, cells…). */
function DockingSurface() {
  return (
    <svg className="block h-8 w-full" aria-hidden>
      <defs>
        <pattern id="dock" width="40" height="32" patternUnits="userSpaceOnUse">
          <rect width="40" height="32" fill="#eef2ff" />
          <path d="M0 14 q10 -10 20 0 t20 0 V32 H0 Z" fill="#c7d2fe" />
          <path d="M0 14 q10 -10 20 0 t20 0" fill="none" stroke="#3fa692" strokeWidth="2.5" />
          <circle cx="10" cy="22" r="2.2" fill="#a5b4fc" />
          <circle cx="30" cy="25" r="1.6" fill="#a5b4fc" />
        </pattern>
      </defs>
      <rect width="100%" height="32" fill="url(#dock)" />
    </svg>
  );
}
