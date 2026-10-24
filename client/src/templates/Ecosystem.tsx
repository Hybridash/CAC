import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  stepEcosystem,
  type EcoSpecies,
  type EcosystemConfig,
  type Populations,
} from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Feedback, GoalChip, Progress, Prompt } from './framework/ui';
import { useStage } from './framework/stage';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

const HISTORY = 240;

/** Producers grow, herbivores eat producers, predators eat animals. Drives where each one lives in the scene. */
function trophic(s: EcoSpecies, all: EcoSpecies[]): 0 | 1 | 2 {
  if (s.growth) return 0;
  const eatsProducer = s.eats?.some((e) => all.find((x) => x.id === e.id)?.growth);
  return eatsProducer ? 1 : 2;
}

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
  const { immersive } = useStage();

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
    sfx.whoosh();
    popRef.current = start;
    setPop(start);
    setHistory([start]);
    setMessage('Reset to the starting ecosystem.');
  };

  const max = Math.max(10, ...history.flatMap((h) => Object.values(h)));
  const prev = history[Math.max(0, history.length - 11)] ?? start;
  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <div className="relative">
        <Habitat config={config} pop={pop} tall={immersive} running={running} />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            className="grid h-11 w-11 place-items-center rounded-full bg-surface/90 shadow-lg ring-1 ring-black/10 hover:bg-surface"
            onClick={() => {
              sfx.pop();
              setRunning(!running);
            }}
            aria-label={running ? 'Pause' : 'Play'}
          >
            <Icon name={running ? 'pause' : 'play'} size={24} />
          </button>
          <button
            className="grid h-11 w-11 place-items-center rounded-full bg-surface/90 text-xl font-extrabold shadow-lg ring-1 ring-black/10 hover:bg-surface"
            onClick={reset}
            aria-label="Reset"
          >
            ↺
          </button>
        </div>
        <span className="absolute top-3 left-3 chip bg-surface/90 py-1 font-mono shadow">
          <Icon name="clock" size={18} /> Day {Math.round(steps * (speed / 10))}
        </span>
      </div>

      {/* Species cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {config.species.map((s) => {
          const n = pop[s.id] ?? 0;
          const before = prev[s.id] ?? 0;
          const trend =
            n > before * 1.02 + 0.05 ? 'up' : n < before * 0.98 - 0.05 ? 'down' : 'flat';
          const canToggle = config.toggleable.includes(s.id);
          const present = n > 0;
          return (
            <div
              key={s.id}
              className={`flex flex-col gap-1.5 rounded-2xl bg-surface p-2.5 ring-2 transition ${present ? '' : 'opacity-70'}`}
              style={{ ['--tw-ring-color' as string]: `${s.color}66` }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-2xl"
                  style={{ background: `${s.color}22` }}
                  aria-hidden
                >
                  {s.emoji}
                </span>
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-extrabold">{s.label}</p>
                  <p className="font-mono text-lg font-extrabold" style={{ color: s.color }}>
                    {Math.round(n)}
                    <span
                      className={`ml-1 text-sm ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'}`}
                      aria-label={
                        trend === 'up' ? 'rising' : trend === 'down' ? 'falling' : 'steady'
                      }
                    >
                      {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '•'}
                    </span>
                  </p>
                </div>
              </div>
              {canToggle && (
                <button
                  onClick={() => toggle(s.id)}
                  className={`rounded-xl py-1.5 text-sm font-extrabold transition active:scale-95 ${present ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' : 'bg-emerald-500 text-white hover:brightness-105'}`}
                >
                  {present ? '− Remove' : '+ Add'} {s.emoji} {s.label}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <figure className="rounded-3xl bg-night p-3 ring-1 ring-black/10">
        <figcaption className="mb-1 flex flex-wrap gap-3 text-xs font-bold text-slate-200">
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
          className={`w-full ${immersive ? 'h-56' : 'h-40'}`}
          role="img"
          aria-label={`Population graph. ${config.species.map((s) => `${s.label} ${Math.round(pop[s.id] ?? 0)}`).join(', ')}`}
        >
          {[37, 74, 111].map((y) => (
            <line
              key={y}
              x1="0"
              x2="400"
              y1={y}
              y2={y}
              stroke="#334155"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {config.species.map((s) => {
            const pts = history.map(
              (h, i) => `${(i / (HISTORY - 1)) * 400},${148 - ((h[s.id] ?? 0) / max) * 140}`,
            );
            const lastX = ((history.length - 1) / (HISTORY - 1)) * 400;
            return (
              <g key={s.id}>
                <polygon
                  points={`0,149 ${pts.join(' ')} ${lastX},149`}
                  fill={s.color}
                  opacity="0.12"
                />
                <polyline
                  fill="none"
                  stroke={s.color}
                  strokeWidth="3"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  points={pts.join(' ')}
                />
              </g>
            );
          })}
        </svg>
      </figure>
      <Feedback text={message} tone={goalMet ? 'good' : 'info'} />
      <div className="flex flex-wrap items-center gap-3">
        <Progress value={steps} max={config.goal.steps} label="time watched" />
        {config.goal.mustToggle && (
          <GoalChip done={toggled.has(config.goal.mustToggle)}>
            Try adding/removing {config.species.find((s) => s.id === config.goal.mustToggle)?.label}
          </GoalChip>
        )}
      </div>
    </div>
  );
}

function Habitat({
  config,
  pop,
  tall,
  running,
}: {
  config: EcosystemConfig;
  pop: Populations;
  tall: boolean;
  running: boolean;
}) {
  const reduce = useReducedMotion();
  // One shared scale, so the scene shows relative abundance (lots of prey, few predators).
  const unit = useMemo(() => Math.max(...config.species.map((s) => s.start)) / 8, [config.species]);
  const bands: [number, number][] = [
    [70, 20], // producers: on the ground
    [50, 30], // herbivores: low and middle
    [22, 36], // predators: anywhere above
  ];
  return (
    <div
      className={`relative overflow-hidden rounded-3xl ring-2 ring-black/10 ${tall ? 'h-[24rem]' : 'h-64'}`}
      style={{ background: 'linear-gradient(180deg, #7dd3fc 0%, #bae6fd 45%, #d9f99d 62%)' }}
      aria-hidden
    >
      {/* Sun, clouds, hills and ground. */}
      <span className="absolute top-4 left-[12%] h-14 w-14 rounded-full bg-yellow-300 shadow-[0_0_40px_14px_rgba(253,224,71,0.7)]" />
      {!reduce && running && (
        <>
          <motion.span
            className="absolute top-6 text-4xl opacity-90"
            animate={{ left: ['-10%', '110%'] }}
            transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
          >
            ☁️
          </motion.span>
          <motion.span
            className="absolute top-14 text-3xl opacity-70"
            animate={{ left: ['-10%', '110%'] }}
            transition={{ repeat: Infinity, duration: 55, ease: 'linear', delay: -20 }}
          >
            ☁️
          </motion.span>
        </>
      )}
      <svg
        className="absolute inset-x-0 bottom-0 h-3/5 w-full"
        viewBox="0 0 400 150"
        preserveAspectRatio="none"
      >
        <path d="M0 60 Q60 20 120 50 T240 40 T400 50 V150 H0 Z" fill="#86efac" />
        <path d="M0 85 Q80 55 160 80 T320 75 T400 80 V150 H0 Z" fill="#4ade80" />
        <path d="M0 110 Q100 95 200 108 T400 105 V150 H0 Z" fill="#22c55e" />
      </svg>
      {config.species.flatMap((s, si) => {
        const level = trophic(s, config.species);
        const [top, range] = bands[level];
        const n = Math.min(18, Math.ceil((pop[s.id] ?? 0) / unit));
        return Array.from({ length: n }, (_, i) => {
          // Golden-ratio spacing spreads living things evenly without randomness (stable across renders).
          const x = (((i + 1) * 0.618 + si * 0.37) % 1) * 88 + 4;
          const y = (((i + 1) * 0.382 + si * 0.53) % 1) * range + top;
          const wander = level === 2 ? 40 : 18;
          return (
            <motion.span
              key={`${s.id}-${i}`}
              className={`absolute ${level === 0 ? 'text-2xl' : level === 1 ? 'text-3xl' : 'text-4xl'}`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                filter: 'drop-shadow(0 3px 2px rgba(0,0,0,0.2))',
              }}
              initial={{ scale: 0 }}
              animate={
                reduce || !running
                  ? { scale: 1 }
                  : level === 0
                    ? { scale: 1, rotate: [-6, 6, -6] }
                    : {
                        scale: 1,
                        x: [0, wander, -wander * 0.7, 0],
                        y: level === 1 ? [0, -6, 0, -4, 0] : [0, -10, 4, 0],
                      }
              }
              transition={{
                scale: { type: 'spring', stiffness: 300, damping: 15 },
                default: { repeat: Infinity, duration: 3 + (i % 4) * 0.8, ease: 'easeInOut' },
              }}
            >
              {s.emoji}
            </motion.span>
          );
        });
      })}
    </div>
  );
}
