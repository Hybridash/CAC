import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { stepEcosystem, type EcosystemConfig, type Populations } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Feedback, Progress, Prompt } from './framework/ui';
import { sfx } from '../lib/sound';

const HISTORY = 240;

/** Add or remove species and watch populations change over time. */
export function Ecosystem({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<EcosystemConfig>) {
  const start = useMemo(
    () => Object.fromEntries(config.species.map((s) => [s.id, s.start])),
    [config.species],
  );
  const [pop, setPop] = useState<Populations>(start);
  const [history, setHistory] = useState<Populations[]>([start]);
  const [running, setRunning] = useState(true);
  const [steps, setSteps] = useState(0);
  const [toggled, setToggled] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const completed = useRef(alreadyDone);
  const popRef = useRef(pop);
  const speed = config.speed ?? 20;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      let p = popRef.current;
      for (let i = 0; i < speed / 10; i++) p = stepEcosystem(config.species, p, 0.1);
      popRef.current = p;
      setPop(p);
      setHistory((h) => [...h.slice(-(HISTORY - 1)), p]);
      setSteps((s) => s + 1);
    }, 100);
    return () => clearInterval(t);
  }, [running, config.species, speed]);

  const goalMet =
    steps >= config.goal.steps && (!config.goal.mustToggle || toggled.has(config.goal.mustToggle));
  useEffect(() => {
    if (goalMet && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      setMessage(config.insight);
      onComplete();
    }
  }, [goalMet, onComplete, config.insight]);

  const toggle = (id: string) => {
    const s = config.species.find((x) => x.id === id)!;
    const present = (popRef.current[id] ?? 0) > 0;
    const next = { ...popRef.current, [id]: present ? 0 : s.start };
    popRef.current = next;
    setPop(next);
    setToggled((t) => new Set(t).add(id));
    sfx.pop();
    setMessage(
      present
        ? `${s.emoji} ${s.label} removed. Watch what happens next…`
        : `${s.emoji} ${s.label} added back.`,
    );
    onStage?.(2);
  };

  const reset = () => {
    popRef.current = start;
    setPop(start);
    setHistory([start]);
    setMessage('Reset to the starting ecosystem.');
  };

  const max = Math.max(10, ...history.flatMap((h) => Object.values(h)));
  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <Habitat config={config} pop={pop} />
      <figure className="rounded-3xl bg-white p-3 ring-1 ring-black/10">
        <figcaption className="mb-1 flex flex-wrap gap-3 text-xs font-bold">
          {config.species.map((s) => (
            <span key={s.id} className="flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-5 rounded-full"
                style={{ background: s.color }}
              />{' '}
              {s.emoji} {s.label}: {Math.round(pop[s.id] ?? 0)}
            </span>
          ))}
        </figcaption>
        <svg
          viewBox="0 0 400 150"
          preserveAspectRatio="none"
          className="h-40 w-full"
          role="img"
          aria-label={`Population graph. ${config.species.map((s) => `${s.label} ${Math.round(pop[s.id] ?? 0)}`).join(', ')}`}
        >
          <line x1="0" y1="149" x2="400" y2="149" stroke="#cbd5e1" />
          {config.species.map((s) => (
            <polyline
              key={s.id}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              points={history
                .map((h, i) => `${(i / (HISTORY - 1)) * 400},${148 - ((h[s.id] ?? 0) / max) * 140}`)
                .join(' ')}
            />
          ))}
        </svg>
      </figure>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-ghost" onClick={() => setRunning(!running)}>
          {running ? '⏸ Pause' : '▶️ Play'}
        </button>
        <button className="btn-ghost" onClick={reset}>
          ↺ Reset
        </button>
        {config.toggleable.map((id) => {
          const s = config.species.find((x) => x.id === id)!;
          const present = (pop[id] ?? 0) > 0;
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className={`btn text-sm ${present ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}
            >
              {present ? '➖ Remove' : '➕ Add'} {s.emoji} {s.label}
            </button>
          );
        })}
      </div>
      <Feedback text={message} tone={goalMet ? 'good' : 'info'} />
      <div className="flex flex-wrap gap-4">
        <Progress value={steps} max={config.goal.steps} label="time watched" />
        {config.goal.mustToggle && (
          <span
            className={`chip ${toggled.has(config.goal.mustToggle) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-ink-soft'}`}
          >
            {toggled.has(config.goal.mustToggle) ? '✅' : '⬜'} Try adding/removing{' '}
            {config.species.find((s) => s.id === config.goal.mustToggle)?.label}
          </span>
        )}
      </div>
    </div>
  );
}

function Habitat({ config, pop }: { config: EcosystemConfig; pop: Populations }) {
  const reduce = useReducedMotion();
  // One shared scale, so the scene shows relative abundance (lots of prey, few predators).
  const unit = useMemo(() => Math.max(...config.species.map((s) => s.start)) / 8, [config.species]);
  return (
    <div
      className="scene-bg relative h-56 overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 via-emerald-50 to-lime-100 ring-1 ring-black/10"
      aria-hidden
    >
      {config.species.flatMap((s, si) => {
        const n = Math.min(16, Math.ceil((pop[s.id] ?? 0) / unit));
        return Array.from({ length: n }, (_, i) => {
          // Golden-ratio spacing spreads animals evenly without randomness (stable across renders).
          const x = (((i + 1) * 0.618 + si * 0.37) % 1) * 90 + 3;
          const y = (((i + 1) * 0.382 + si * 0.53) % 1) * 75 + 8;
          return (
            <motion.span
              key={`${s.id}-${i}`}
              className="absolute text-2xl"
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={{ scale: 0 }}
              animate={reduce || s.growth ? { scale: 1 } : { scale: 1, x: [0, 14, -10, 0] }}
              transition={{ x: { repeat: Infinity, duration: 3 + (i % 3), ease: 'easeInOut' } }}
            >
              {s.emoji}
            </motion.span>
          );
        });
      })}
    </div>
  );
}
