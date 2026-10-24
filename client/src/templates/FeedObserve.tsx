import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { FeedObserveConfig } from '@bioplay/shared';
import { DndArena, Draggable, DropZone } from './framework/dnd';
import type { TemplateProps } from './framework/types';
import { Feedback, GoalChip, PanelTitle, Progress, Prompt } from './framework/ui';
import { useStage } from './framework/stage';
import { sfx } from '../lib/sound';

interface ActiveEffect {
  meter: string;
  perSecond: number;
  remaining: number;
}

const TICK = 0.1;

type Meter = FeedObserveConfig['meters'][number];
const isHealthy = (m: Meter, v: number) => v >= m.healthy[0] && v <= m.healthy[1];

/** Generic "feed something to a system and watch its meters respond" template. */
export function FeedObserve({ config, onComplete, alreadyDone }: TemplateProps<FeedObserveConfig>) {
  const startValues = () => Object.fromEntries(config.meters.map((m) => [m.id, m.start]));
  const [values, setValues] = useState<Record<string, number>>(startValues);
  const [mode, setMode] = useState(config.modes?.[0]?.id ?? 'normal');
  const [activeResponses, setActiveResponses] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [feeds, setFeeds] = useState(0);
  const [modesTried, setModesTried] = useState<Set<string>>(() => new Set([mode]));
  const [bursts, setBursts] = useState<{ id: number; emoji: string }[]>([]);
  const [lastFed, setLastFed] = useState<string | null>(null);
  const effects = useRef<ActiveEffect[]>([]);
  const completed = useRef(alreadyDone);
  const lastResponses = useRef<string>('');
  const { immersive } = useStage();

  const modeDef = config.modes?.find((m) => m.id === mode);

  const valuesRef = useRef(values);

  // Simulation loop: integrate food effects and automatic responses 10× per second.
  useEffect(() => {
    const t = setInterval(() => {
      const next = { ...valuesRef.current };
      for (const e of effects.current) {
        const step = Math.min(e.remaining, Math.abs(e.perSecond) * TICK) * Math.sign(e.perSecond);
        next[e.meter] += step;
        e.remaining -= Math.abs(step);
      }
      effects.current = effects.current.filter((e) => e.remaining > 1e-6);
      const active: string[] = [];
      for (const r of config.responses) {
        const v = next[r.when.meter];
        const on =
          (r.when.above !== undefined && v > r.when.above) ||
          (r.when.below !== undefined && v < r.when.below);
        const scale = modeDef?.responseScale?.[r.id] ?? 1;
        if (on && scale > 0) {
          active.push(r.id);
          next[r.effect.meter] += r.effect.perSecond * scale * TICK;
        }
      }
      for (const m of config.meters) next[m.id] = Math.min(m.max, Math.max(m.min, next[m.id]));
      valuesRef.current = next;
      setValues(next);
      const key = active.join(',');
      if (key !== lastResponses.current) {
        const fresh = config.responses.find(
          (r) => active.includes(r.id) && !lastResponses.current.split(',').includes(r.id),
        );
        lastResponses.current = key;
        setActiveResponses(active);
        if (fresh) setMessage(fresh.message);
      }
    }, TICK * 1000);
    return () => clearInterval(t);
  }, [config, modeDef]);

  const goalMet =
    feeds >= config.goal.feeds &&
    (!config.goal.tryAllModes || modesTried.size >= (config.modes?.length ?? 1));
  useEffect(() => {
    if (goalMet && !completed.current) {
      completed.current = true;
      onComplete();
    }
  }, [goalMet, onComplete]);

  const feed = useCallback(
    (itemId: string, zone: string) => {
      if (zone !== 'subject') return;
      const item = config.items.find((i) => i.id === itemId);
      if (!item) return;
      sfx.drop();
      for (const e of item.effects) {
        effects.current.push({
          meter: e.meter,
          perSecond: e.amount / e.seconds,
          remaining: Math.abs(e.amount),
        });
      }
      setFeeds((f) => f + 1);
      setMessage(item.note);
      setLastFed(item.id);
      const id = Date.now();
      setBursts((b) => [...b, { id, emoji: item.emoji }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
    },
    [config.items],
  );

  const switchMode = (id: string) => {
    sfx.pop();
    setMode(id);
    setModesTried((s) => new Set(s).add(id));
    effects.current = [];
    valuesRef.current = startValues();
    setValues(valuesRef.current);
    setMessage(config.modes?.find((m) => m.id === id)?.description ?? null);
  };

  const allHealthy = config.meters.every((m) => isHealthy(m, values[m.id]));
  const aura = allHealthy ? '52,211,153' : '251,113,133';

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      {config.modes && (
        <div
          className="flex flex-wrap gap-1.5 rounded-2xl bg-slate-100 p-1.5 ring-1 ring-black/5"
          role="radiogroup"
          aria-label="Mode"
        >
          {config.modes.map((m, i) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => switchMode(m.id)}
              className={`relative flex-1 rounded-xl px-3 py-2 text-sm font-extrabold whitespace-nowrap transition ${
                mode === m.id
                  ? i === 0
                    ? 'bg-emerald-500 text-white'
                    : 'bg-rose-500 text-white'
                  : 'text-ink-soft hover:bg-surface'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
      <DndArena onDrop={feed}>
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <DropZone id="subject" label={config.subject.label} className="rounded-3xl">
            {({ isOver, armed }) => (
              <div
                className={`relative grid place-items-center overflow-hidden rounded-3xl ring-4 transition ${
                  immersive ? 'min-h-[26rem]' : 'min-h-72'
                } ${isOver ? 'ring-indigo-400' : armed ? 'ring-indigo-300 ring-dashed' : 'ring-black/5'}`}
                style={{
                  background: `radial-gradient(circle at 50% 55%, rgba(${aura},0.28), transparent 55%), linear-gradient(180deg, #e0f2fe, #ecfdf5)`,
                }}
              >
                <div className="scene-bg absolute inset-0" />
                <Ecg healthy={allHealthy} />
                <SubjectFx
                  emojis={config.responses
                    .filter((r) => activeResponses.includes(r.id))
                    .map((r) => r.emoji)}
                />
                <div className="relative flex flex-col items-center">
                  <motion.span
                    className="relative grid place-items-center rounded-full"
                    animate={bursts.length ? { scale: [1, 1.18, 1] } : { scale: [1, 1.03, 1] }}
                    transition={
                      bursts.length ? { duration: 0.4 } : { repeat: Infinity, duration: 2.4 }
                    }
                    style={{
                      width: immersive ? 220 : 170,
                      height: immersive ? 220 : 170,
                      background: `radial-gradient(circle, rgba(255,255,255,0.95) 40%, rgba(${aura},0.25) 70%, transparent 71%)`,
                      boxShadow: `0 0 0 6px rgba(${aura},0.35), 0 0 40px rgba(${aura},0.45)`,
                    }}
                  >
                    <span
                      className={immersive ? 'text-9xl' : 'text-8xl'}
                      style={{ lineHeight: 1 }}
                      aria-hidden
                    >
                      {config.subject.emoji}
                    </span>
                  </motion.span>
                  <span className="mt-3 rounded-full bg-surface/90 px-3 py-0.5 font-extrabold shadow ring-1 ring-black/5">
                    {config.subject.label}
                  </span>
                  <span
                    className={`mt-1 text-xs font-bold ${armed ? 'text-indigo-700' : 'text-ink-soft'}`}
                  >
                    {armed ? 'Tap here to feed' : 'Drop things here'}
                  </span>
                </div>
                <AnimatePresence>
                  {bursts.map((b) => (
                    <motion.span
                      key={b.id}
                      className="pointer-events-none absolute text-5xl"
                      initial={{ y: 120, opacity: 1, scale: 1.2 }}
                      animate={{ y: -10, opacity: 0, scale: 0.3, rotate: 25 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      aria-hidden
                    >
                      {b.emoji}
                    </motion.span>
                  ))}
                </AnimatePresence>
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {config.responses.map((r) => {
                    const on = activeResponses.includes(r.id);
                    const disabled = (modeDef?.responseScale?.[r.id] ?? 1) === 0;
                    return (
                      <motion.span
                        key={r.id}
                        animate={on ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                        transition={on ? { repeat: Infinity, duration: 1.2 } : {}}
                        className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold transition ${
                          on
                            ? 'bg-amber-300 text-amber-950 shadow-[0_0_14px_rgba(251,191,36,0.8)]'
                            : 'bg-white/75 text-ink-soft ring-1 ring-black/5'
                        } ${disabled ? 'line-through opacity-50' : ''}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${on ? 'bg-amber-700' : disabled ? 'bg-slate-300' : 'bg-slate-400'}`}
                          aria-hidden
                        />
                        <span aria-hidden>{r.emoji}</span> {r.label}
                        {on && <span className="sr-only"> (active)</span>}
                      </motion.span>
                    );
                  })}
                </div>
              </div>
            )}
          </DropZone>
          <div className="flex justify-center gap-4 rounded-3xl bg-night p-4 shadow-inner md:flex-col md:justify-start">
            {config.meters.map((m) => (
              <MeterTube key={m.id} meter={m} value={values[m.id]} tall={immersive} />
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100 p-3 ring-1 ring-black/5">
          <PanelTitle icon="bag">
            Tray — drag onto the {config.subject.label.toLowerCase()} (or tap, then tap it)
          </PanelTitle>
          <div className="flex flex-wrap gap-2.5">
            {config.items.map((item) => (
              <Draggable key={item.id} id={item.id} label={item.label}>
                <span
                  className={`flex min-w-24 flex-col items-center rounded-2xl bg-surface px-3 py-2 ring-2 transition hover:-translate-y-1 ${lastFed === item.id ? 'ring-indigo-300' : 'ring-black/5'}`}
                >
                  <span className="text-4xl" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="text-xs font-extrabold">{item.label}</span>
                </span>
              </Draggable>
            ))}
          </div>
        </div>
      </DndArena>
      <Feedback text={message} />
      <div className="flex flex-wrap items-center gap-3">
        <Progress value={feeds} max={config.goal.feeds} label="tried" />
        {config.goal.tryAllModes && config.modes && (
          <GoalChip done={modesTried.size >= config.modes.length}>
            Modes tried: {modesTried.size} / {config.modes.length}
          </GoalChip>
        )}
      </div>
    </div>
  );
}

/** A scrolling heartbeat trace behind the subject: calm when healthy, frantic when not. */
function Ecg({ healthy }: { healthy: boolean }) {
  const reduce = useReducedMotion();
  const beat = 'l 30 0 l 6 -18 l 6 34 l 6 -26 l 6 10 l 30 0';
  const d = `M 0 60 ${Array.from({ length: 8 }, () => beat).join(' ')}`;
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-6 h-24 w-full opacity-30"
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d={d}
        fill="none"
        stroke={healthy ? '#059669' : '#e11d48'}
        strokeWidth="3"
        strokeLinejoin="round"
        animate={reduce ? {} : { x: [0, -84] }}
        transition={{ repeat: Infinity, duration: healthy ? 1.6 : 0.7, ease: 'linear' }}
      />
    </svg>
  );
}

/** Active responses float around the subject (sweat drops, shivers…). */
function SubjectFx({ emojis }: { emojis: string[] }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {emojis.flatMap((e, ei) =>
        Array.from({ length: 4 }, (_, i) => {
          const a = ((i + ei * 0.5) / 4) * Math.PI * 2;
          return (
            <motion.span
              key={`${e}-${i}`}
              className="absolute top-1/2 left-1/2 text-2xl"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: [Math.cos(a) * 70, Math.cos(a) * 120],
                y: [Math.sin(a) * 60, Math.sin(a) * 100 - 20],
              }}
              transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.45 }}
            >
              {e}
            </motion.span>
          );
        }),
      )}
    </div>
  );
}

function MeterTube({ meter, value, tall }: { meter: Meter; value: number; tall: boolean }) {
  const span = meter.max - meter.min;
  const pct = ((value - meter.min) / span) * 100;
  const lo = ((meter.healthy[0] - meter.min) / span) * 100;
  const hi = ((meter.healthy[1] - meter.min) / span) * 100;
  const healthy = isHealthy(meter, value);
  const shown = value.toFixed(span <= 2 ? 2 : span <= 20 ? 1 : 0);
  const status = healthy ? 'Healthy' : value > meter.healthy[1] ? 'Too high' : 'Too low';
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`relative w-14 overflow-hidden rounded-full bg-night ring-4 ring-slate-700 ${tall ? 'h-80' : 'h-52'}`}
        role="meter"
        aria-label={meter.label}
        aria-valuemin={meter.min}
        aria-valuemax={meter.max}
        aria-valuenow={Number(shown)}
        aria-valuetext={`${shown} ${meter.unit ?? ''}, ${healthy ? 'healthy range' : 'out of range'}`}
      >
        <div
          className="absolute inset-x-0 border-y-2 border-dashed border-emerald-300/80 bg-emerald-400/20"
          style={{ bottom: `${lo}%`, height: `${hi - lo}%` }}
          aria-hidden
        />
        <div
          className="absolute inset-x-1.5 bottom-1.5 overflow-hidden rounded-full transition-[height] duration-100"
          style={{
            height: `calc(${pct}% - 6px)`,
            minHeight: 10,
            background: `linear-gradient(90deg, ${meter.color}, ${meter.color}cc 60%, #ffffff66)`,
            boxShadow: `0 0 16px ${meter.color}`,
          }}
          aria-hidden
        >
          {/* Bubbles rising through the liquid. */}
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="rise absolute bottom-0 h-2 w-2 rounded-full bg-white/60"
              style={
                {
                  left: `${20 + i * 25}%`,
                  '--dur': `${2.2 + i * 0.7}s`,
                  '--rise': '-320px',
                  animationDelay: `${-i * 0.8}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <span className="absolute inset-x-0 top-2 h-1/2 rounded-full bg-gradient-to-b from-white/25 to-transparent" />
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-sm font-extrabold ${healthy ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}
      >
        {shown}
        {meter.unit && <span className="text-xs font-bold"> {meter.unit}</span>}
      </span>
      <span className="max-w-24 text-center text-xs leading-tight font-bold text-slate-300">
        {meter.label}
      </span>
      <span
        className={`text-xs font-extrabold ${healthy ? 'text-emerald-400' : 'text-rose-400'}`}
      >
        {status}
      </span>
    </div>
  );
}
