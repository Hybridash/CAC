import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { AssemblyConfig, AssemblyPart } from '@bioplay/shared';
import { DndArena, Draggable, DropZone } from './framework/dnd';
import type { TemplateProps } from './framework/types';
import { Burst, Feedback, PanelTitle, Progress, Prompt, type FeedbackTone } from './framework/ui';
import { useStage } from './framework/stage';
import { shuffled } from './framework/shuffle';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

const STATION_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

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
  const [hit, setHit] = useState<{ slot: number; n: number } | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const completed = useRef(alreadyDone);
  const done = placed.every(Boolean);
  const pulse = usePulse(done, parts.length);

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
        setHit({ slot, n: Date.now() });
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
  const nextEmpty = placed.findIndex((x) => !x);

  const station = (i: number) => {
    const filled = placed[i] ? parts.find((x) => x.id === placed[i]) : null;
    return (
      <Station
        key={parts[i].id}
        index={i}
        filled={filled ?? null}
        isNext={i === nextEmpty}
        lit={pulse === i}
        hit={hit?.slot === i ? hit.n : null}
        compact={cycle && parts.length > 6}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <DndArena onDrop={onDrop}>
        {cycle ? (
          <CycleLayout count={parts.length} done={done} placed={placed.filter(Boolean).length}>
            {parts.map((_, i) => station(i))}
          </CycleLayout>
        ) : (
          <div className="scene-bg rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-3 ring-1 ring-black/5 sm:p-4">
            <ol className="flex flex-wrap items-center justify-center gap-y-3">
              {parts.map((_, i) => (
                <li key={parts[i].id} className="flex items-center">
                  {station(i)}
                  {i < parts.length - 1 && (
                    <Pipe on={!!placed[i] && !!placed[i + 1]} active={done && pulse === i} />
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-black/5">
          <div className="px-3 pt-3">
            <PanelTitle icon="bag">
              {inTray.length
                ? 'Parts — drag into the right step (or tap, then tap a step)'
                : 'All parts placed!'}
            </PanelTitle>
          </div>
          <div className="belt flex min-h-24 flex-wrap items-center gap-2.5 border-y-4 border-slate-300 px-3 py-3">
            {inTray.map((p) => (
              <motion.div
                key={p.id}
                layout
                animate={shake === p.id ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Draggable id={p.id} label={p.label}>
                  <PartChip part={p} />
                </Draggable>
              </motion.div>
            ))}
            {!inTray.length && (
              <span className="mx-auto font-extrabold text-emerald-700">
                <Icon name="party" size={22} className="-mt-0.5 mr-1" />
                {cycle ? 'The cycle is running!' : 'The line is running!'}
              </span>
            )}
          </div>
          <div className="h-3" />
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

/** Once the line is built, a signal runs through it step by step, forever. */
function usePulse(on: boolean, n: number) {
  const [i, setI] = useState(-1);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!on || reduce) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 650);
    return () => clearInterval(t);
  }, [on, n, reduce]);
  return on ? i : -1;
}

function Station({
  index,
  filled,
  isNext,
  lit,
  hit,
  compact,
}: {
  index: number;
  filled: AssemblyPart | null;
  isNext: boolean;
  lit: boolean;
  hit: number | null;
  compact: boolean;
}) {
  const { immersive } = useStage();
  const color = STATION_COLORS[index % STATION_COLORS.length];
  const size = compact ? 'w-24 min-h-24' : immersive ? 'w-36 min-h-32' : 'w-28 min-h-28';
  return (
    <DropZone id={`slot-${index}`} label={`step ${index + 1}`} className="rounded-3xl">
      {({ isOver, armed }) => (
        <motion.div
          animate={lit ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className={`relative flex ${size} flex-col items-center justify-center rounded-3xl border-[3px] p-2 text-center transition ${
            filled
              ? 'border-solid bg-white'
              : `border-dashed ${isOver ? 'bg-indigo-50' : 'bg-white'}`
          } ${!filled && isNext ? 'glow-pulse' : ''}`}
          style={{
            borderColor: filled || isOver || armed ? color : '#cbd5e1',
            boxShadow: filled
              ? `0 5px 0 ${color}66${lit ? `, 0 0 26px ${color}` : ''}`
              : isOver
                ? `0 0 18px ${color}88`
                : undefined,
          }}
        >
          <Burst trigger={hit} />
          <span
            className="absolute -top-3 left-1/2 grid h-7 w-7 -translate-x-1/2 place-items-center rounded-full text-xs font-extrabold text-white shadow ring-2 ring-white"
            style={{ background: filled ? color : '#94a3b8' }}
          >
            {index + 1}
          </span>
          <AnimatePresence mode="wait">
            {filled ? (
              <motion.span
                key="f"
                initial={{ scale: 0.3, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="flex flex-col items-center gap-0.5"
              >
                {filled.emoji && (
                  <span className={immersive ? 'text-4xl' : 'text-3xl'} aria-hidden>
                    {filled.emoji}
                  </span>
                )}
                <span className="text-sm leading-tight font-extrabold">{filled.label}</span>
              </motion.span>
            ) : (
              <motion.span key="e" className="text-2xl font-extrabold text-slate-300" aria-hidden>
                ?
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </DropZone>
  );
}

function Pipe({ on, active }: { on: boolean; active: boolean }) {
  return (
    <svg width="34" height="20" viewBox="0 0 34 20" className="mx-0.5 shrink-0" aria-hidden>
      <rect x="0" y="6" width="34" height="8" rx="4" fill={on ? '#c7d2fe' : '#e2e8f0'} />
      {on && (
        <line
          x1="2"
          y1="10"
          x2="32"
          y2="10"
          stroke={active ? '#f59e0b' : '#6366f1'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="4 6"
          className="dash-flow"
          style={{ animationDirection: 'reverse' }}
        />
      )}
      <path d="M26 3l7 7-7 7" fill="none" stroke={on ? '#6366f1' : '#cbd5e1'} strokeWidth="2.5" />
    </svg>
  );
}

function CycleLayout({
  count,
  done,
  placed,
  children,
}: {
  count: number;
  done: boolean;
  placed: number;
  children: React.ReactNode[];
}) {
  const reduce = useReducedMotion();
  return (
    <div className="scene-bg relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-2 ring-1 ring-black/5">
      <div className="relative mx-auto aspect-square w-full max-w-[min(32rem,62vh)]">
        <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient id="cycle-ring" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#818cf8" />
              <stop offset="1" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="36" fill="none" stroke="#e0e7ff" strokeWidth="5" />
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="url(#cycle-ring)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${(placed / count) * 226} 226`}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 0.5s' }}
          />
          {done && !reduce && (
            <g>
              <circle cx="50" cy="14" r="3" fill="#f59e0b">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 50 50"
                  to="360 50 50"
                  dur={`${count * 0.65}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          )}
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center text-center">
            <motion.span
              animate={done && !reduce ? { rotate: 360 } : {}}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            >
              <Icon name="refresh" size={44} />
            </motion.span>
            <span className="text-sm font-extrabold text-indigo-900">
              {done ? 'Cycle running!' : `${placed} / ${count}`}
            </span>
          </div>
        </div>
        {children.map((child, i) => (
          <div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${50 + 36 * Math.sin((i / count) * 2 * Math.PI)}%`,
              top: `${50 - 36 * Math.cos((i / count) * 2 * Math.PI)}%`,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}

function PartChip({ part }: { part: AssemblyPart }) {
  return (
    <span className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 font-extrabold shadow-[0_4px_0_rgba(30,27,46,0.15)] ring-2 ring-black/5 transition hover:-translate-y-0.5">
      {part.emoji && (
        <span aria-hidden className="text-2xl">
          {part.emoji}
        </span>
      )}
      {part.label}
    </span>
  );
}
