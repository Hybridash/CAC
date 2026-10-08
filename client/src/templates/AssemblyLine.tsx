import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { AssemblyConfig, AssemblyPart } from '@bioplay/shared';
import { DndArena, Draggable, DropZone } from './framework/dnd';
import type { TemplateProps } from './framework/types';
import { Feedback, Progress, Prompt, type FeedbackTone } from './framework/ui';
import { shuffled } from './framework/shuffle';
import { sfx } from '../lib/sound';

/** Drag parts into the correct order to build a process or structure. */
export function AssemblyLine({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<AssemblyConfig>) {
  const { parts } = config;
  const tray = useMemo(
    () => shuffled([...parts, ...(config.distractors ?? [])]),
    [parts, config.distractors],
  );
  const [placed, setPlaced] = useState<(string | null)[]>(() => parts.map(() => null));
  const [shake, setShake] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const completed = useRef(alreadyDone);
  const done = placed.every(Boolean);

  useEffect(() => {
    if (done && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [done, onComplete]);

  const onDrop = useCallback(
    (partId: string, zone: string) => {
      const slot = Number(zone.replace('slot-', ''));
      if (Number.isNaN(slot) || placed[slot]) return;
      const correctIndex = parts.findIndex((p) => p.id === partId);
      const part = [...parts, ...(config.distractors ?? [])].find((p) => p.id === partId)!;
      if (correctIndex === slot) {
        sfx.correct();
        setPlaced((prev) => prev.map((x, i) => (i === slot ? partId : x)));
        setFeedback({ text: `${part.label}: ${part.description}`, tone: 'good' });
        onStage?.(Math.floor(((slot + 1) / parts.length) * 3));
        return;
      }
      sfx.nope();
      setShake(partId);
      setTimeout(() => setShake(null), 500);
      if (correctIndex === -1) {
        setFeedback({
          text: `${part.label} doesn’t belong in this process. ${part.description}`,
          tone: 'hint',
        });
      } else {
        const where = correctIndex < slot ? 'earlier' : 'later';
        setFeedback({
          text: `Close! ${part.label} belongs a bit ${where} in the order.`,
          tone: 'hint',
        });
      }
    },
    [parts, placed, config.distractors, onStage],
  );

  const inTray = tray.filter((p) => !placed.includes(p.id));
  const cycle = config.layout === 'cycle';

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <DndArena onDrop={onDrop}>
        <div
          className={
            cycle
              ? 'relative mx-auto aspect-square w-full max-w-md'
              : 'flex flex-wrap items-stretch gap-2'
          }
        >
          {cycle && (
            <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden>
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke="#c7d2fe"
                strokeWidth="2"
                strokeDasharray="4 3"
              >
                {done && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 50 50"
                    to="360 50 50"
                    dur="12s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              {done && (
                <text
                  x="50"
                  y="53"
                  textAnchor="middle"
                  fontSize="7"
                  fontWeight="800"
                  fill="#4338ca"
                >
                  ↻ cycle
                </text>
              )}
            </svg>
          )}
          {parts.map((p, i) => {
            const style = cycle
              ? {
                  position: 'absolute' as const,
                  left: `${50 + 36 * Math.sin((i / parts.length) * 2 * Math.PI)}%`,
                  top: `${50 - 36 * Math.cos((i / parts.length) * 2 * Math.PI)}%`,
                  transform: 'translate(-50%, -50%)',
                  width: parts.length > 6 ? '6.2rem' : '7.5rem',
                }
              : undefined;
            const filled = placed[i] ? parts.find((x) => x.id === placed[i]) : null;
            return (
              <div key={p.id} className={cycle ? '' : 'flex items-center gap-2'} style={style}>
                <DropZone id={`slot-${i}`} label={`step ${i + 1}`} className="rounded-2xl">
                  {({ isOver, armed }) => (
                    <div
                      className={`flex min-h-20 min-w-24 flex-col items-center justify-center rounded-2xl p-2 text-center transition ${
                        filled
                          ? 'bg-emerald-50 ring-2 ring-emerald-400'
                          : isOver
                            ? 'bg-indigo-50 ring-2 ring-indigo-400'
                            : armed
                              ? 'border-2 border-dashed border-indigo-300 bg-white'
                              : 'border-2 border-dashed border-slate-300 bg-white/70'
                      }`}
                    >
                      <span className="text-[10px] font-extrabold text-ink-soft">STEP {i + 1}</span>
                      {filled ? (
                        <motion.span
                          initial={{ scale: 0.6 }}
                          animate={{ scale: 1 }}
                          className="flex flex-col items-center"
                        >
                          {filled.emoji && (
                            <span className="text-2xl" aria-hidden>
                              {filled.emoji}
                            </span>
                          )}
                          <span className="text-sm leading-tight font-bold">{filled.label}</span>
                        </motion.span>
                      ) : (
                        <span className="text-xs text-slate-400">?</span>
                      )}
                    </div>
                  )}
                </DropZone>
                {!cycle && i < parts.length - 1 && (
                  <motion.span
                    aria-hidden
                    className="text-xl text-indigo-300"
                    animate={done ? { x: [0, 4, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.15 }}
                  >
                    ➜
                  </motion.span>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl bg-slate-50 p-3">
          <h3 className="mb-2 text-sm font-bold text-ink-soft">
            {inTray.length
              ? 'Parts — drag into the right step (or tap, then tap a step)'
              : 'All parts placed!'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {inTray.map((p) => (
              <motion.div
                key={p.id}
                animate={shake === p.id ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Draggable id={p.id} label={p.label}>
                  <PartChip part={p} />
                </Draggable>
              </motion.div>
            ))}
          </div>
        </div>
      </DndArena>
      <Feedback
        text={done ? config.successMessage : (feedback?.text ?? null)}
        tone={done ? 'good' : feedback?.tone}
      />
      <Progress value={placed.filter(Boolean).length} max={parts.length} label="placed" />
    </div>
  );
}

function PartChip({ part }: { part: AssemblyPart }) {
  return (
    <span className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 font-bold shadow ring-1 ring-black/10">
      {part.emoji && (
        <span aria-hidden className="text-xl">
          {part.emoji}
        </span>
      )}
      {part.label}
    </span>
  );
}
