import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { LockKeyConfig } from '@bioplay/shared';
import { DndArena, Draggable, DropZone } from './framework/dnd';
import type { TemplateProps } from './framework/types';
import { Feedback, Progress, Prompt, type FeedbackTone } from './framework/ui';
import { LockGlyph } from '../components/LockGlyph';
import { sfx } from '../lib/sound';

/** Match molecules to their receptors. Wrong shapes bounce off. */
export function LockKey({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<LockKeyConfig>) {
  const [bound, setBound] = useState<Record<string, string>>({}); // receptorId -> moleculeId
  const [bounce, setBounce] = useState<{ receptor: string; n: number } | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const completed = useRef(alreadyDone);
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
        <div className="scene-bg grid grid-cols-2 gap-3 rounded-3xl bg-sky-50 p-3 sm:grid-cols-3 lg:grid-cols-4">
          {config.receptors.map((r) => {
            const m = config.molecules.find((x) => x.id === bound[r.id]);
            return (
              <DropZone key={r.id} id={r.id} label={r.label} className="rounded-2xl">
                {({ isOver, armed }) => (
                  <motion.div
                    animate={bounce?.receptor === r.id ? { x: [0, -10, 10, -6, 6, 0] } : {}}
                    key={bounce?.receptor === r.id ? bounce.n : 'still'}
                    className={`flex flex-col items-center rounded-2xl bg-white p-2 text-center transition ${
                      isOver
                        ? 'ring-4 ring-indigo-400'
                        : armed
                          ? 'ring-2 ring-indigo-300 ring-dashed'
                          : 'ring-1 ring-black/10'
                    }`}
                  >
                    <div className="relative">
                      <LockGlyph shape={r.shape} color={r.color} variant="lock" filled={!!m} />
                      {m && (
                        <motion.span
                          initial={{ y: -30, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="absolute -top-2 -right-2 text-xl"
                          aria-hidden
                        >
                          {m.effect === 'block' ? '⛔' : '✨'}
                        </motion.span>
                      )}
                    </div>
                    <span className="text-sm leading-tight font-extrabold">{r.label}</span>
                    <span className="text-xs text-ink-soft">
                      {m ? `+ ${m.label}` : r.description}
                    </span>
                  </motion.div>
                )}
              </DropZone>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 rounded-2xl bg-slate-50 p-3">
          {free.map((m) => (
            <Draggable key={m.id} id={m.id} label={m.label}>
              <span className="flex flex-col items-center rounded-2xl bg-white p-1.5 shadow ring-1 ring-black/10">
                <LockGlyph shape={m.shape} color={m.color} variant="key" size={56} />
                <span className="text-xs font-bold">{m.label}</span>
              </span>
            </Draggable>
          ))}
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
