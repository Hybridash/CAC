import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { evalExpr, type SliderConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Feedback, Progress, Prompt } from './framework/ui';
import { sfx } from '../lib/sound';

const fmt = (v: number) =>
  Math.abs(v) >= 100 ? Math.round(v).toString() : (Math.round(v * 10) / 10).toString();

/** Adjust variables and watch a live graph and animation respond. */
export function SliderSim({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<SliderConfig>) {
  const [vals, setVals] = useState<Record<string, number>>(() =>
    Object.fromEntries(config.inputs.map((i) => [i.id, i.start])),
  );
  const [challenge, setChallenge] = useState(0);
  const [solvedMsg, setSolvedMsg] = useState<string | null>(null);
  const completed = useRef(alreadyDone);
  const out = Math.max(0, Math.min(config.output.max, evalExpr(config.output.expr, vals)));
  const ch = config.challenges[challenge];
  const inTarget =
    !!ch &&
    (ch.target.min === undefined || out >= ch.target.min) &&
    (ch.target.max === undefined || out <= ch.target.max);

  // Hold inside the target briefly so a challenge isn't solved by accident while sliding past.
  useEffect(() => {
    if (!inTarget) return;
    const t = setTimeout(() => {
      sfx.correct();
      setSolvedMsg(ch.explain);
      onStage?.(Math.min(challenge + 1, 3));
      setChallenge((c) => c + 1);
    }, 700);
    return () => clearTimeout(t);
  }, [inTarget, ch, challenge, onStage]);

  const allDone = challenge >= config.challenges.length;
  useEffect(() => {
    if (allDone && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [allDone, onComplete]);

  const gx = config.inputs.find((i) => i.id === config.graphInput)!;
  const curve = useMemo(() => {
    const pts: [number, number][] = [];
    for (let k = 0; k <= 60; k++) {
      const x = gx.min + ((gx.max - gx.min) * k) / 60;
      pts.push([
        x,
        Math.max(
          0,
          Math.min(config.output.max, evalExpr(config.output.expr, { ...vals, [gx.id]: x })),
        ),
      ]);
    }
    return pts;
  }, [vals, gx, config.output]);

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <div className="grid gap-4 md:grid-cols-2">
        <Visual
          kind={config.visual.kind}
          emoji={config.visual.emoji}
          level={out / config.output.max}
        />
        <Graph
          curve={curve}
          x={vals[gx.id]}
          y={out}
          xLabel={`${gx.label}${gx.unit ? ` (${gx.unit})` : ''}`}
          yLabel={config.output.label}
          xMin={gx.min}
          xMax={gx.max}
          yMax={config.output.max}
          target={ch?.target}
        />
      </div>
      <div
        className="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-2"
        aria-live="polite"
      >
        <span className="font-bold text-indigo-900">{config.output.label}</span>
        <span className="text-2xl font-extrabold text-indigo-700">
          {fmt(out)} <span className="text-sm">{config.output.unit}</span>
        </span>
      </div>
      {config.readouts && (
        <div className="flex flex-wrap gap-2">
          {config.readouts.map((r) => (
            <span key={r.label} className="chip bg-white py-1 ring-1 ring-black/10">
              {r.label}: <b>{fmt(evalExpr(r.expr, vals))}</b> {r.unit}
            </span>
          ))}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {config.inputs.map((i) => (
          <label
            key={i.id}
            className="flex flex-col gap-1 rounded-2xl bg-white p-3 ring-1 ring-black/10"
          >
            <span className="flex justify-between text-sm font-bold">
              <span>{i.label}</span>
              <span className="text-indigo-700">
                {fmt(vals[i.id])} {i.unit}
              </span>
            </span>
            <input
              type="range"
              min={i.min}
              max={i.max}
              step={i.step}
              value={vals[i.id]}
              onChange={(e) => setVals((v) => ({ ...v, [i.id]: Number(e.target.value) }))}
              className="h-8 w-full cursor-pointer accent-indigo-600"
              aria-valuetext={`${fmt(vals[i.id])} ${i.unit ?? ''}`}
            />
            <span className="flex justify-between text-xs text-ink-soft">
              <span>{i.min}</span>
              <span>{i.max}</span>
            </span>
          </label>
        ))}
      </div>
      {!allDone ? (
        <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
          <p className="text-xs font-extrabold text-amber-800 uppercase">
            Challenge {challenge + 1} of {config.challenges.length}
          </p>
          <p className="font-bold text-amber-950">🎯 {ch.prompt}</p>
          {inTarget && (
            <p className="text-sm font-bold text-emerald-700">That’s it — hold it there…</p>
          )}
        </div>
      ) : null}
      <Feedback text={solvedMsg} tone="good" />
      <Progress value={challenge} max={config.challenges.length} label="challenges" />
    </div>
  );
}

function Visual({
  kind,
  emoji,
  level,
}: {
  kind: SliderConfig['visual']['kind'];
  emoji: string;
  level: number;
}) {
  const reduce = useReducedMotion();
  const n = kind === 'growth' || kind === 'glow' ? 1 : Math.round(3 + level * 17);
  const seeds = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        x: (i * 37) % 100,
        y: (i * 53) % 100,
        d: 1 + ((i * 7) % 5) / 3,
      })),
    [],
  );
  return (
    <div
      className="scene-bg relative h-56 overflow-hidden rounded-3xl bg-gradient-to-b from-sky-50 to-emerald-50 ring-1 ring-black/10"
      role="img"
      aria-label={`Activity level ${Math.round(level * 100)} percent`}
    >
      {kind === 'growth' && (
        <div className="grid h-full place-items-center">
          <motion.span animate={{ scale: 0.4 + level * 1.6 }} className="text-7xl" aria-hidden>
            {emoji}
          </motion.span>
        </div>
      )}
      {kind === 'glow' && (
        <div className="grid h-full place-items-center">
          <span
            className="rounded-full p-6 text-7xl transition-all"
            style={{
              boxShadow: `0 0 ${20 + level * 80}px ${level * 40}px rgba(250,204,21,${0.2 + level * 0.6})`,
              filter: `brightness(${0.6 + level * 0.8})`,
            }}
            aria-hidden
          >
            {emoji}
          </span>
        </div>
      )}
      {(kind === 'particles' || kind === 'bubbles') &&
        seeds.slice(0, n).map((s, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            aria-hidden
            style={{ left: `${s.x}%`, top: kind === 'bubbles' ? '100%' : `${s.y}%` }}
            animate={
              reduce
                ? {}
                : kind === 'bubbles'
                  ? { top: ['100%', '-10%'], opacity: [0, 1, 0] }
                  : { x: [0, 20 * s.d, -15 * s.d, 0], y: [0, -15 * s.d, 10 * s.d, 0] }
            }
            transition={{
              repeat: Infinity,
              duration:
                kind === 'bubbles' ? (4 / (0.3 + level * 1.7)) * s.d : 3 / (0.15 + level * 2),
              delay: (i % 7) * 0.3,
              ease: 'linear',
            }}
          >
            {emoji}
          </motion.span>
        ))}
    </div>
  );
}

function Graph({
  curve,
  x,
  y,
  xLabel,
  yLabel,
  xMin,
  xMax,
  yMax,
  target,
}: {
  curve: [number, number][];
  x: number;
  y: number;
  xLabel: string;
  yLabel: string;
  xMin: number;
  xMax: number;
  yMax: number;
  target?: { min?: number; max?: number };
}) {
  const W = 300;
  const H = 180;
  const P = { l: 34, r: 10, t: 10, b: 34 };
  const sx = (v: number) => P.l + ((v - xMin) / (xMax - xMin || 1)) * (W - P.l - P.r);
  const sy = (v: number) => H - P.b - (v / (yMax || 1)) * (H - P.t - P.b);
  return (
    <figure className="rounded-3xl bg-white p-2 ring-1 ring-black/10">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Graph of ${yLabel} against ${xLabel}`}
      >
        {target && (
          <rect
            x={P.l}
            width={W - P.l - P.r}
            y={sy(target.max ?? yMax)}
            height={Math.max(0, sy(target.min ?? 0) - sy(target.max ?? yMax))}
            fill="#fef3c7"
          />
        )}
        <line x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} stroke="#94a3b8" />
        <line x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} stroke="#94a3b8" />
        <polyline
          points={curve.map(([a, b]) => `${sx(a)},${sy(b)}`).join(' ')}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <line x1={sx(x)} x2={sx(x)} y1={P.t} y2={H - P.b} stroke="#c7d2fe" strokeDasharray="3 3" />
        <circle cx={sx(x)} cy={sy(y)} r="6" fill="#f59e0b" stroke="white" strokeWidth="2" />
        <text
          x={(W + P.l) / 2}
          y={H - 8}
          fontSize="11"
          textAnchor="middle"
          fill="#4b4763"
          fontWeight="700"
        >
          {xLabel}
        </text>
        <text x={P.l - 4} y={H - P.b} fontSize="10" textAnchor="end" fill="#64748b">
          {xMin}
        </text>
        <text x={W - P.r} y={H - P.b + 12} fontSize="10" textAnchor="end" fill="#64748b">
          {xMax}
        </text>
        <text
          x={12}
          y={(H - P.b + P.t) / 2}
          fontSize="11"
          textAnchor="middle"
          fill="#4b4763"
          fontWeight="700"
          transform={`rotate(-90 12 ${(H - P.b + P.t) / 2})`}
        >
          {yLabel}
        </text>
      </svg>
    </figure>
  );
}
