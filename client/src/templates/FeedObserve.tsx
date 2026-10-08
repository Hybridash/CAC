import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { FeedObserveConfig } from '@bioplay/shared';
import { DndArena, Draggable, DropZone } from './framework/dnd';
import type { TemplateProps } from './framework/types';
import { Feedback, Progress, Prompt } from './framework/ui';
import { sfx } from '../lib/sound';

interface ActiveEffect {
  meter: string;
  perSecond: number;
  remaining: number;
}

const TICK = 0.1;

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
  const effects = useRef<ActiveEffect[]>([]);
  const completed = useRef(alreadyDone);
  const lastResponses = useRef<string>('');

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
      const id = Date.now();
      setBursts((b) => [...b, { id, emoji: item.emoji }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
    },
    [config.items],
  );

  const switchMode = (id: string) => {
    setMode(id);
    setModesTried((s) => new Set(s).add(id));
    effects.current = [];
    valuesRef.current = startValues();
    setValues(valuesRef.current);
    setMessage(config.modes?.find((m) => m.id === id)?.description ?? null);
  };

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      {config.modes && (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Mode">
          {config.modes.map((m) => (
            <button
              key={m.id}
              role="radio"
              aria-checked={mode === m.id}
              onClick={() => switchMode(m.id)}
              className={`chip py-1.5 text-sm ${mode === m.id ? 'bg-indigo-600 text-white' : 'bg-white text-ink ring-1 ring-black/10'}`}
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
                className={`scene-bg relative grid min-h-64 place-items-center rounded-3xl bg-gradient-to-b from-sky-50 to-emerald-50 ring-2 transition ${
                  isOver
                    ? 'ring-indigo-400 scale-[1.01]'
                    : armed
                      ? 'ring-indigo-300 ring-dashed'
                      : 'ring-black/10'
                }`}
              >
                <div className="flex flex-col items-center">
                  <motion.span
                    className="text-8xl"
                    aria-hidden
                    animate={bursts.length ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  >
                    {config.subject.emoji}
                  </motion.span>
                  <span className="mt-1 font-bold text-ink-soft">{config.subject.label}</span>
                  <span className="text-xs text-ink-soft">
                    {armed ? 'Tap here to feed' : 'Drop things here'}
                  </span>
                </div>
                <AnimatePresence>
                  {bursts.map((b) => (
                    <motion.span
                      key={b.id}
                      className="pointer-events-none absolute text-4xl"
                      initial={{ y: 80, opacity: 1, scale: 1 }}
                      animate={{ y: -10, opacity: 0, scale: 0.4 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      aria-hidden
                    >
                      {b.emoji}
                    </motion.span>
                  ))}
                </AnimatePresence>
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {config.responses.map((r) => {
                    const on = activeResponses.includes(r.id);
                    const disabled = (modeDef?.responseScale?.[r.id] ?? 1) === 0;
                    return (
                      <span
                        key={r.id}
                        className={`chip text-xs transition ${on ? 'bg-amber-300 text-amber-950 shadow' : 'bg-white/70 text-ink-soft'} ${disabled ? 'line-through opacity-60' : ''}`}
                      >
                        <span aria-hidden>{r.emoji}</span> {r.label}
                        {on && <span className="sr-only"> (active)</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </DropZone>
          <div className="flex justify-center gap-4 md:flex-col">
            {config.meters.map((m) => (
              <Meter key={m.id} meter={m} value={values[m.id]} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-bold text-ink-soft">
            Tray — drag (or tap, then tap the target)
          </h3>
          <div className="flex flex-wrap gap-2">
            {config.items.map((item) => (
              <Draggable key={item.id} id={item.id} label={item.label}>
                <span className="flex flex-col items-center rounded-2xl bg-white px-3 py-2 shadow ring-1 ring-black/10">
                  <span className="text-3xl" aria-hidden>
                    {item.emoji}
                  </span>
                  <span className="text-xs font-bold">{item.label}</span>
                </span>
              </Draggable>
            ))}
          </div>
        </div>
      </DndArena>
      <Feedback text={message} />
      <Progress value={feeds} max={config.goal.feeds} label="tried" />
      {config.goal.tryAllModes && config.modes && (
        <p className="text-sm text-ink-soft">
          Modes tried: {modesTried.size} / {config.modes.length}
        </p>
      )}
    </div>
  );
}

function Meter({ meter, value }: { meter: FeedObserveConfig['meters'][number]; value: number }) {
  const pct = ((value - meter.min) / (meter.max - meter.min)) * 100;
  const lo = ((meter.healthy[0] - meter.min) / (meter.max - meter.min)) * 100;
  const hi = ((meter.healthy[1] - meter.min) / (meter.max - meter.min)) * 100;
  const healthy = value >= meter.healthy[0] && value <= meter.healthy[1];
  const range = meter.max - meter.min;
  const shown = value.toFixed(range <= 2 ? 2 : range <= 20 ? 1 : 0);
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative h-48 w-10 overflow-hidden rounded-full bg-slate-100 ring-2 ring-black/10"
        role="meter"
        aria-label={meter.label}
        aria-valuemin={meter.min}
        aria-valuemax={meter.max}
        aria-valuenow={Number(shown)}
        aria-valuetext={`${shown} ${meter.unit ?? ''}, ${healthy ? 'healthy range' : 'out of range'}`}
      >
        <div
          className="absolute inset-x-0 bg-emerald-200/70"
          style={{ bottom: `${lo}%`, height: `${hi - lo}%` }}
          aria-hidden
        />
        <div
          className="absolute inset-x-1.5 bottom-1.5 rounded-full transition-[height] duration-100"
          style={{ height: `calc(${pct}% - 6px)`, background: meter.color, minHeight: 6 }}
          aria-hidden
        />
      </div>
      <span className={`text-sm font-extrabold ${healthy ? 'text-emerald-700' : 'text-rose-600'}`}>
        {shown}
        {meter.unit && <span className="text-xs font-bold"> {meter.unit}</span>}
      </span>
      <span className="max-w-20 text-center text-xs font-bold text-ink-soft">{meter.label}</span>
    </div>
  );
}
