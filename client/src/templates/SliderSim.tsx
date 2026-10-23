import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { evalExpr, type SliderConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Feedback, PanelTitle, Progress, Prompt, rangeFill } from './framework/ui';
import { useStage } from './framework/stage';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

const fmt = (v: number) =>
  Math.abs(v) >= 100 ? Math.round(v).toString() : (Math.round(v * 10) / 10).toString();

const SLIDER_COLORS: [string, string][] = [
  ['#818cf8', '#c084fc'],
  ['#34d399', '#22d3ee'],
  ['#fbbf24', '#fb7185'],
  ['#60a5fa', '#a78bfa'],
];

const HOLD_MS = 700;

/** Adjust variables and watch a live graph, gauge and animation respond. */
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
  const { immersive } = useStage();
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
    }, HOLD_MS);
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

  const level = out / config.output.max;

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <Chamber
          kind={config.visual.kind}
          emoji={config.visual.emoji}
          level={level}
          tall={immersive}
          label={config.output.label}
          value={`${fmt(out)} ${config.output.unit ?? ''}`}
        />
        <div className="flex flex-col gap-3">
          <Gauge
            value={out}
            max={config.output.max}
            target={ch?.target}
            inTarget={inTarget}
            label={config.output.label}
            unit={config.output.unit}
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
      </div>
      {config.readouts && (
        <div className="flex flex-wrap gap-2">
          {config.readouts.map((r) => (
            <span
              key={r.label}
              className="chip bg-slate-900 py-1.5 font-mono text-emerald-300 ring-1 ring-black/10"
            >
              <span className="font-sans text-slate-300">{r.label}:</span>{' '}
              <b>{fmt(evalExpr(r.expr, vals))}</b> {r.unit}
            </span>
          ))}
        </div>
      )}
      <div className="rounded-3xl bg-white p-3 ring-1 ring-black/10 sm:p-4">
        <PanelTitle icon="flask">Controls</PanelTitle>
        <div className="grid gap-x-5 gap-y-3 sm:grid-cols-2">
          {config.inputs.map((i, n) => {
            const [c1, c2] = SLIDER_COLORS[n % SLIDER_COLORS.length];
            return (
              <label key={i.id} className="flex flex-col gap-0.5">
                <span className="flex items-baseline justify-between gap-2 text-sm font-extrabold">
                  <span>{i.label}</span>
                  <span
                    className="rounded-lg px-2 py-0.5 font-mono text-white"
                    style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
                  >
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
                  className="bio-range"
                  style={
                    {
                      ...rangeFill(vals[i.id], i.min, i.max),
                      '--c1': c1,
                      '--c2': c2,
                    } as React.CSSProperties
                  }
                  aria-valuetext={`${fmt(vals[i.id])} ${i.unit ?? ''}`}
                />
                <span className="flex justify-between text-xs font-bold text-ink-soft">
                  <span>{i.min}</span>
                  <span>{i.max}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>
      <ol className="flex flex-col gap-2" aria-label="Challenges">
        {config.challenges.map((c, i) => {
          const state = i < challenge ? 'done' : i === challenge ? 'now' : 'later';
          return (
            <li
              key={i}
              className={`relative flex items-center gap-3 overflow-hidden rounded-2xl p-3 ring-2 transition ${
                state === 'done'
                  ? 'bg-emerald-50 ring-emerald-300'
                  : state === 'now'
                    ? 'bg-amber-50 ring-amber-300 shadow-md'
                    : 'bg-slate-50 opacity-60 ring-slate-200'
              }`}
            >
              {state === 'now' && inTarget && (
                <motion.span
                  key={`hold-${challenge}`}
                  className="absolute inset-y-0 left-0 bg-emerald-200/60"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: HOLD_MS / 1000, ease: 'linear' }}
                  aria-hidden
                />
              )}
              <span
                className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full font-extrabold ${
                  state === 'done'
                    ? 'bg-emerald-500 text-white'
                    : state === 'now'
                      ? 'glow-pulse bg-amber-400 text-amber-950'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {state === 'done' ? <Icon name="check" size={22} /> : i + 1}
              </span>
              <p className="relative flex-1 font-bold">
                {state === 'later' ? 'Locked challenge' : c.prompt}
                {state === 'now' && inTarget && (
                  <span className="block text-sm text-emerald-700">That’s it — hold it there…</span>
                )}
              </p>
            </li>
          );
        })}
      </ol>
      <Feedback text={solvedMsg} tone="good" />
      <Progress value={challenge} max={config.challenges.length} label="challenges" />
    </div>
  );
}

function Chamber({
  kind,
  emoji,
  level,
  tall,
  label,
  value,
}: {
  kind: SliderConfig['visual']['kind'];
  emoji: string;
  level: number;
  tall: boolean;
  label: string;
  value: string;
}) {
  const reduce = useReducedMotion();
  const n = kind === 'growth' || kind === 'glow' ? 0 : Math.round(4 + level * 24);
  const seeds = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        x: (i * 37 + 5) % 92,
        y: (i * 53 + 7) % 88,
        d: 1 + ((i * 7) % 5) / 3,
        s: 0.8 + ((i * 11) % 6) / 10,
      })),
    [],
  );
  const hue = 200 - level * 150;
  return (
    <div
      className={`relative overflow-hidden rounded-3xl ring-4 ring-slate-800 ${tall ? 'h-[26rem]' : 'h-72'}`}
      style={{
        background: `radial-gradient(circle at 50% 60%, hsla(${hue},90%,60%,${0.25 + level * 0.35}), transparent 65%), linear-gradient(180deg, #0f172a, #1e293b)`,
      }}
      role="img"
      aria-label={`${label}: ${value}`}
    >
      {/* Lab-glass reflections and a grid, like looking into a test chamber. */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <span className="pointer-events-none absolute top-0 left-6 h-full w-10 -skew-x-12 bg-white/5" />
      {kind === 'growth' && (
        <div className="grid h-full place-items-center">
          <motion.span
            animate={{ scale: 0.35 + level * 1.5 }}
            transition={{ type: 'spring', stiffness: 90, damping: 14 }}
            className="text-8xl"
            style={{ filter: `drop-shadow(0 0 ${8 + level * 24}px hsla(${hue},90%,65%,0.9))` }}
            aria-hidden
          >
            {emoji}
          </motion.span>
          <span
            className="absolute rounded-full border-2 border-dashed border-white/20"
            style={{ width: `${30 + level * 60}%`, aspectRatio: '1' }}
          />
        </div>
      )}
      {kind === 'glow' && (
        <div className="grid h-full place-items-center">
          {!reduce && (
            <motion.span
              className="absolute h-[140%] w-[140%]"
              style={{
                background: `repeating-conic-gradient(from 0deg, hsla(48,100%,70%,${0.05 + level * 0.25}) 0deg 8deg, transparent 8deg 24deg)`,
                maskImage: 'radial-gradient(circle, black 10%, transparent 60%)',
                WebkitMaskImage: 'radial-gradient(circle, black 10%, transparent 60%)',
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 30 - level * 20, ease: 'linear' }}
              aria-hidden
            />
          )}
          <span
            className="relative rounded-full p-6 text-8xl transition-all"
            style={{
              boxShadow: `0 0 ${20 + level * 90}px ${level * 45}px rgba(250,204,21,${0.15 + level * 0.6})`,
              filter: `brightness(${0.55 + level * 0.8}) saturate(${0.5 + level})`,
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
            className="absolute"
            aria-hidden
            style={{
              left: `${s.x}%`,
              top: kind === 'bubbles' ? '100%' : `${s.y}%`,
              fontSize: `${1.4 * s.s}rem`,
              filter: `drop-shadow(0 0 6px hsla(${hue},90%,70%,0.8))`,
            }}
            animate={
              reduce
                ? {}
                : kind === 'bubbles'
                  ? { top: ['100%', '-12%'], opacity: [0, 1, 0], x: [0, 8, -8, 0] }
                  : {
                      x: [0, 26 * s.d, -20 * s.d, 0],
                      y: [0, -20 * s.d, 14 * s.d, 0],
                      rotate: [0, 90, 180, 360],
                    }
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
      <div className="absolute bottom-3 left-3 rounded-xl bg-black/50 px-3 py-1.5 font-mono text-sm font-bold text-emerald-300 ring-1 ring-white/10">
        {label}: {value}
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-white/80 uppercase">
        <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" /> Live
      </div>
    </div>
  );
}

/** A dashboard dial with the target zone marked in gold. */
function Gauge({
  value,
  max,
  target,
  inTarget,
  label,
  unit,
}: {
  value: number;
  max: number;
  target?: { min?: number; max?: number };
  inTarget: boolean;
  label: string;
  unit?: string;
}) {
  const R = 80;
  const angle = (v: number) => Math.PI * (1 - Math.min(1, Math.max(0, v / (max || 1))));
  const pt = (v: number, r = R) => [100 + r * Math.cos(angle(v)), 100 - r * Math.sin(angle(v))];
  const arc = (a: number, b: number) => {
    const [x1, y1] = pt(a);
    const [x2, y2] = pt(b);
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };
  const [nx, ny] = pt(value, R - 14);
  return (
    <div className="flex items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-black/10">
      <svg viewBox="0 0 200 112" className="w-44 shrink-0" aria-hidden>
        <defs>
          <linearGradient id="gauge-g" x1="0" x2="1">
            <stop offset="0" stopColor="#60a5fa" />
            <stop offset="0.5" stopColor="#a78bfa" />
            <stop offset="1" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        {target && (
          <path
            d={arc(target.min ?? 0, target.max ?? max)}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="26"
            strokeOpacity="0.35"
          />
        )}
        <path d={arc(0, max)} fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        <path
          d={arc(0, Math.max(value, max * 0.001))}
          fill="none"
          stroke="url(#gauge-g)"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <motion.line
          x1="100"
          y1="100"
          initial={false}
          animate={{ x2: nx, y2: ny }}
          transition={{ type: 'spring', stiffness: 140, damping: 14 }}
          stroke="#1e1b2e"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="100" cy="100" r="9" fill={inTarget ? '#10b981' : '#1e1b2e'} />
      </svg>
      <div className="min-w-0" aria-live="polite">
        <p className="text-xs font-extrabold tracking-wider text-ink-soft uppercase">{label}</p>
        <p className="font-display text-4xl leading-none font-extrabold text-indigo-700">
          {fmt(value)} <span className="text-base text-ink-soft">{unit}</span>
        </p>
        {target && (
          <p
            className={`mt-1 text-sm font-extrabold ${inTarget ? 'text-emerald-600' : 'text-amber-600'}`}
          >
            <Icon name="target" size={16} className="-mt-0.5 mr-1" />
            Target{' '}
            {target.min !== undefined && target.max !== undefined
              ? `${fmt(target.min)}–${fmt(target.max)}`
              : target.min !== undefined
                ? `≥ ${fmt(target.min)}`
                : `≤ ${fmt(target.max!)}`}
          </p>
        )}
      </div>
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
  const W = 320;
  const H = 180;
  const P = { l: 34, r: 10, t: 10, b: 34 };
  const sx = (v: number) => P.l + ((v - xMin) / (xMax - xMin || 1)) * (W - P.l - P.r);
  const sy = (v: number) => H - P.b - (v / (yMax || 1)) * (H - P.t - P.b);
  const line = curve.map(([a, b]) => `${sx(a)},${sy(b)}`).join(' ');
  const area = `${sx(curve[0][0])},${H - P.b} ${line} ${sx(curve[curve.length - 1][0])},${H - P.b}`;
  return (
    <figure className="flex-1 rounded-3xl bg-white p-2 ring-1 ring-black/10">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Graph of ${yLabel} against ${xLabel}`}
      >
        <defs>
          <linearGradient id="graph-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#818cf8" stopOpacity="0.45" />
            <stop offset="1" stopColor="#818cf8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={P.l}
            x2={W - P.r}
            y1={sy(yMax * f)}
            y2={sy(yMax * f)}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
        ))}
        {target && (
          <>
            <rect
              x={P.l}
              width={W - P.l - P.r}
              y={sy(target.max ?? yMax)}
              height={Math.max(0, sy(target.min ?? 0) - sy(target.max ?? yMax))}
              fill="#fef3c7"
              stroke="#fbbf24"
              strokeDasharray="4 3"
            />
            <text
              x={W - P.r - 4}
              y={sy(target.max ?? yMax) + 11}
              fontSize="9"
              textAnchor="end"
              fill="#b45309"
              fontWeight="800"
            >
              TARGET
            </text>
          </>
        )}
        <line x1={P.l} y1={H - P.b} x2={W - P.r} y2={H - P.b} stroke="#94a3b8" />
        <line x1={P.l} y1={P.t} x2={P.l} y2={H - P.b} stroke="#94a3b8" />
        <polygon points={area} fill="url(#graph-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#6366f1"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <line x1={sx(x)} x2={sx(x)} y1={P.t} y2={H - P.b} stroke="#c7d2fe" strokeDasharray="3 3" />
        <circle cx={sx(x)} cy={sy(y)} r="10" fill="#f59e0b" opacity="0.25">
          <animate attributeName="r" values="7;13;7" dur="1.6s" repeatCount="indefinite" />
        </circle>
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
