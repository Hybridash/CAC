import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { SortingConfig } from '@bioplay/shared';
import { DndArena, Draggable, DropZone } from './framework/dnd';
import type { TemplateProps } from './framework/types';
import { Feedback, Progress, Prompt, type FeedbackTone } from './framework/ui';
import { shuffled } from './framework/shuffle';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

/** Drag each item into the right category. */
export function Sorting({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<SortingConfig>) {
  const items = useMemo(() => shuffled(config.items), [config.items]);
  const [sorted, setSorted] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const completed = useRef(alreadyDone);
  const count = Object.keys(sorted).length;
  const done = count === items.length;

  useEffect(() => {
    if (done && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [done, onComplete]);

  const onDrop = useCallback(
    (itemId: string, binId: string) => {
      const item = config.items.find((i) => i.id === itemId);
      const bin = config.bins.find((b) => b.id === binId);
      if (!item || !bin) return;
      if (item.bin === binId) {
        sfx.correct();
        setSorted((s) => ({ ...s, [itemId]: binId }));
        setFeedback({ text: `${item.emoji} ${item.explain}`, tone: 'good' });
        onStage?.(Math.min(2, Math.floor(((count + 1) / config.items.length) * 3)));
      } else {
        sfx.nope();
        setShake(itemId);
        setTimeout(() => setShake(null), 450);
        setFeedback({
          text: `Hmm, ${item.label} isn’t quite ${bin.label.toLowerCase()}. Think about: ${bin.description}`,
          tone: 'hint',
        });
      }
    },
    [config.items, config.bins, count, onStage],
  );

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <DndArena onDrop={onDrop}>
        <div
          className="flex min-h-16 flex-wrap gap-2 rounded-2xl bg-slate-50 p-3"
          aria-label="Items to sort"
        >
          {items
            .filter((i) => !sorted[i.id])
            .map((i) => (
              <motion.div
                key={i.id}
                animate={shake === i.id ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Draggable id={i.id} label={i.label}>
                  <span className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 font-bold shadow ring-1 ring-black/10">
                    <span className="text-xl" aria-hidden>
                      {i.emoji}
                    </span>
                    {i.label}
                  </span>
                </Draggable>
              </motion.div>
            ))}
          {done && (
            <span className="p-2 font-bold text-emerald-700">
              <Icon name="party" size={20} className="mr-1" /> Everything sorted!
            </span>
          )}
        </div>
        <div
          className={`grid gap-3 ${config.bins.length === 2 ? 'sm:grid-cols-2' : config.bins.length === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3'}`}
        >
          {config.bins.map((b) => (
            <DropZone key={b.id} id={b.id} label={b.label} className="rounded-3xl">
              {({ isOver, armed }) => (
                <div
                  className={`flex min-h-40 flex-col rounded-3xl p-3 transition ${
                    isOver
                      ? 'bg-indigo-50 ring-4 ring-indigo-400'
                      : armed
                        ? 'bg-white ring-2 ring-indigo-300 ring-dashed'
                        : 'bg-white ring-2 ring-black/10'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-3xl" aria-hidden>
                      {b.emoji}
                    </span>
                    <div>
                      <h3 className="leading-tight font-extrabold">{b.label}</h3>
                      <p className="text-xs text-ink-soft">{b.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {config.items
                      .filter((i) => sorted[i.id] === b.id)
                      .map((i) => (
                        <motion.span
                          key={i.id}
                          initial={{ scale: 0.5 }}
                          animate={{ scale: 1 }}
                          className="chip bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200"
                        >
                          <span aria-hidden>{i.emoji}</span> {i.label}
                        </motion.span>
                      ))}
                  </div>
                </div>
              )}
            </DropZone>
          ))}
        </div>
      </DndArena>
      <Feedback text={feedback?.text ?? null} tone={feedback?.tone} />
      <Progress value={count} max={items.length} label="sorted" />
    </div>
  );
}
