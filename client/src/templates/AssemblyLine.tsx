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


/** Ion and molecule badges: sodium is amber, potassium steel blue, energy gold, the rest teal. */
function symbolTone(symbol: string) {
  if (symbol.startsWith('Na')) return { bg: '#fdf0cf', fg: '#6b4300', ring: '#d99a06' };
  if (symbol.startsWith('K')) return { bg: '#dae7f1', fg: '#1f3f5c', ring: '#345a80' };
  if (symbol === 'ATP' || symbol === 'Pᵢ') return { bg: '#fff3c4', fg: '#6b4300', ring: '#b97d00' };
  return { bg: '#ddf0ea', fg: '#095a4e', ring: '#0e7c6b' };
}

function SymbolBadge({ symbol, size = 40 }: { symbol: string; size?: number }) {
  const t = symbolTone(symbol);
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-display leading-none font-bold"
      style={{
        width: size,
        height: size,
        background: t.bg,
        color: t.fg,
        boxShadow: `inset 0 0 0 1.5px ${t.ring}`,
        fontSize: symbol.length > 2 ? size * 0.3 : size * 0.4,
      }}
    >
      {symbol}
    </span>
  );
}

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
          <div className="py-3 sm:py-4">
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

        <div>
          <div>
            <PanelTitle icon="bag">
              {inTray.length
                ? 'Parts — drag into the right step (or tap, then tap a step)'
                : 'All parts placed!'}
            </PanelTitle>
          </div>
          <div className="mt-2 flex min-h-24 flex-wrap items-center gap-2.5 border-y border-line py-3">
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
  const color = '#0e7c6b';
  const size = compact ? 'w-24 min-h-24' : immersive ? 'w-36 min-h-32' : 'w-28 min-h-28';
  return (
    <DropZone id={`slot-${index}`} label={`step ${index + 1}`} className="rounded-xl">
      {({ isOver, armed }) => (
        <motion.div
          animate={lit ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className={`relative flex ${size} flex-col items-center justify-center rounded-xl border-2 p-2 text-center transition-colors ${
            filled
              ? 'border-solid bg-surface'
              : `border-dashed ${isOver ? 'bg-brand-tint' : 'bg-transparent'}`
          }`}
          style={{
            borderColor: filled || isOver || armed || isNext ? color : '#b9c6c2',
          }}
        >
          <Burst trigger={hit} />
          <span
            className="absolute -top-3 left-1/2 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-full text-xs font-bold text-white ring-2 ring-paper"
            style={{ background: filled ? color : '#8c9c98' }}
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
                {filled.symbol ? (
                  <SymbolBadge symbol={filled.symbol} size={immersive ? 48 : 40} />
                ) : (
                  filled.emoji && (
                    <span className={immersive ? 'text-4xl' : 'text-3xl'} aria-hidden>
                      {filled.emoji}
                    </span>
                  )
                )}
                <span className="text-sm leading-tight font-extrabold">{filled.label}</span>
              </motion.span>
            ) : (
              <motion.span key="e" className="text-2xl font-bold text-slate-300" aria-hidden>
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
      <rect x="0" y="6" width="34" height="8" rx="4" fill={on ? '#a9dbcf' : '#d6dfdc'} />
      {on && (
        <line
          x1="2"
          y1="10"
          x2="32"
          y2="10"
          stroke={active ? '#b97d00' : '#0e7c6b'}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="4 6"
          className="dash-flow"
          style={{ animationDirection: 'reverse' }}
        />
      )}
      <path d="M26 3l7 7-7 7" fill="none" stroke={on ? '#0e7c6b' : '#cbd5e1'} strokeWidth="2.5" />
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
    <div className="relative overflow-hidden p-2">
      <div className="relative mx-auto aspect-square w-full max-w-[min(32rem,62vh)]">
        <svg className="absolute inset-0" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="36" fill="none" stroke="#d3dcd9" strokeWidth="4" />
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke="#0e7c6b"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(placed / count) * 226} 226`}
            transform="rotate(-90 50 50)"
            style={{ transition: 'stroke-dasharray 0.5s' }}
          />
          {done && !reduce && (
            <g>
              <circle cx="50" cy="14" r="3" fill="#b97d00">
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
            <span className="text-sm font-bold text-brand-dark">
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
    <span className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 font-bold ring-1 ring-ink/20 transition-colors hover:ring-ink/40">
      {part.symbol && <SymbolBadge symbol={part.symbol} size={32} />}
      {!part.symbol && part.emoji && (
        <span aria-hidden className="text-2xl">
          {part.emoji}
        </span>
      )}
      {part.label}
    </span>
  );
}
