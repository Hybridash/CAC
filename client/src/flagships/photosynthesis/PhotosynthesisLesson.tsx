import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt, type FeedbackTone } from '../../templates/framework/ui';
import { sfx } from '../../lib/sound';
import { photosynthesis, type Factor, type LightColor, type PhotoInputs } from './model';

const COLORS: { id: LightColor; label: string; hex: string }[] = [
  { id: 'white', label: 'White', hex: '#fef9c3' },
  { id: 'red', label: 'Red', hex: '#f87171' },
  { id: 'blue', label: 'Blue', hex: '#60a5fa' },
  { id: 'green', label: 'Green', hex: '#4ade80' },
];

const FACTOR_LABEL: Record<Factor, string> = {
  light: 'Light',
  co2: 'CO₂',
  temperature: 'Temperature',
};

/** Scene geometry (viewBox 800×420): beaker sits at x 560–740; lamp slides along y = 150. */
const BEAKER_X = 560;
const CM_PX = 6; // pixels per cm of lamp distance

interface Bubble {
  id: number;
  x: number;
  y: number;
  r: number;
}

export function PhotosynthesisLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const reduce = useReducedMotion();
  const [inputs, setInputs] = useState<PhotoInputs>({
    distance: 70,
    co2: 0,
    temp: 22,
    color: 'white',
    lampOn: true,
  });
  const out = photosynthesis(inputs);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [counted, setCounted] = useState(0);
  const [msg, setMsg] = useState<{ text: string; tone: FeedbackTone } | null>({
    text: 'The lamp is far away and the water has little CO₂. Count the oxygen bubbles, then start experimenting!',
    tone: 'info',
  });
  const [goals, setGoals] = useState({ fast: false, co2Limit: false, dark: false, green: false });
  const completed = useRef(alreadyDone);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const rateRef = useRef(out.bubbles);
  rateRef.current = out.bubbles;
  const lastLimiting = useRef(out.limiting);

  // Bubble particles: spawn at the current rate (time-lapse ×3), float up, pop at the surface.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let id = 0;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += (rateRef.current / 60) * 3 * dt;
      setBubbles((bs) => {
        const next = bs
          .map((b) => ({
            ...b,
            y: b.y - (reduce ? 0 : 38 * dt),
            x: b.x + Math.sin(b.y / 12) * 0.3,
          }))
          .filter((b) => b.y > 164);
        while (acc >= 1) {
          acc -= 1;
          const tip = [604, 640, 676][id % 3];
          next.push({
            id: id++,
            x: tip + ((id * 7) % 9) - 4,
            y: 250 - ((id * 13) % 30),
            r: 4.5 + (id % 3) * 1.5,
          });
        }
        return next.slice(-60);
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  // Count bubbles produced over time for the readout.
  useEffect(() => {
    const t = setInterval(() => setCounted((c) => c + rateRef.current / 60), 1000);
    return () => clearInterval(t);
  }, []);

  const goalMet = goals.fast && goals.co2Limit && goals.green && goals.dark;
  useEffect(() => {
    if (goalMet && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [goalMet, onComplete]);

  // React to what the player has set up.
  useEffect(() => {
    if (out.bubbles >= 40 && !goals.fast) {
      setGoals((g) => ({ ...g, fast: true }));
      sfx.correct();
      onStage?.(3);
      setMsg({
        text: `Fizzing! ${out.bubbles} bubbles a minute. Each bubble is mostly oxygen made by splitting water.`,
        tone: 'good',
      });
    } else if (!inputs.lampOn && !goals.dark) {
      setGoals((g) => ({ ...g, dark: true }));
      setMsg({
        text: 'Lights out — bubbles stop. No light, no energy to split water.',
        tone: 'hint',
      });
    } else if (inputs.color === 'green' && inputs.lampOn && !goals.green) {
      setGoals((g) => ({ ...g, green: true }));
      onStage?.(2);
      setMsg({
        text: 'Green light barely works! Chlorophyll reflects most green light — that’s exactly why plants look green.',
        tone: 'good',
      });
    } else if (out.limiting !== lastLimiting.current) {
      setMsg({
        text: `Now ${FACTOR_LABEL[out.limiting]} is the limiting factor — the ingredient in shortest supply sets the pace.`,
        tone: 'info',
      });
      onStage?.(5);
    }
    lastLimiting.current = out.limiting;
  }, [out.bubbles, out.limiting, inputs.lampOn, inputs.color, goals, onStage]);

  const set = (patch: Partial<PhotoInputs>) => setInputs((i) => ({ ...i, ...patch }));

  const addSoda = () => {
    if (inputs.co2 >= 4) return;
    sfx.drop();
    if (out.limiting === 'co2') {
      setGoals((g) => ({ ...g, co2Limit: true }));
      onStage?.(4);
      setMsg({
        text: 'CO₂ was holding it back! Adding baking soda gives the Calvin cycle more carbon to build sugar.',
        tone: 'good',
      });
    } else {
      setMsg({
        text: 'More CO₂ added… but CO₂ wasn’t the limiting factor, so not much changed. What’s really holding it back?',
        tone: 'hint',
      });
    }
    set({ co2: inputs.co2 + 1 });
  };

  // Drag the lamp along its track with any pointer.
  const onPointer = (e: React.PointerEvent) => {
    if (!dragging.current || !svgRef.current) return;
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svgRef.current.getScreenCTM()!.inverse());
    const d = Math.round(Math.min(80, Math.max(10, (BEAKER_X - p.x) / CM_PX)));
    set({ distance: d });
  };

  const lampX = BEAKER_X - inputs.distance * CM_PX;
  const color = COLORS.find((c) => c.id === inputs.color)!;
  const beamOpacity = inputs.lampOn ? 0.15 + (out.intensity / 100) * 0.55 : 0;

  return (
    <div className="flex flex-col gap-3">
      <Prompt>
        Drag the lamp, add baking soda, change the light color. How fast can you make the pondweed
        fizz?
      </Prompt>
      <div className="grid gap-3 lg:grid-cols-[3fr_2fr]">
        <svg
          ref={svgRef}
          viewBox="0 0 800 420"
          className="w-full touch-none rounded-3xl bg-gradient-to-b from-slate-100 to-slate-200 ring-1 ring-black/10"
          onPointerMove={onPointer}
          onPointerUp={() => (dragging.current = false)}
          onPointerLeave={() => (dragging.current = false)}
          role="img"
          aria-label={`Lamp ${inputs.distance} centimeters from the beaker, ${inputs.lampOn ? `${color.label} light` : 'off'}. ${out.bubbles} oxygen bubbles per minute.`}
        >
          {/* bench */}
          <rect x="0" y="380" width="800" height="40" fill="#a16207" />
          <line
            x1="60"
            x2={BEAKER_X}
            y1="372"
            y2="372"
            stroke="#78350f"
            strokeWidth="4"
            strokeDasharray="2 10"
          />
          {Array.from({ length: 8 }, (_, i) => (
            <text
              key={i}
              x={BEAKER_X - (i + 1) * 10 * CM_PX}
              y="398"
              fontSize="11"
              fill="#fef3c7"
              textAnchor="middle"
            >
              {(i + 1) * 10}
            </text>
          ))}
          <text x="70" y="414" fontSize="11" fill="#fef3c7">
            cm from beaker
          </text>
          {/* light beam */}
          <polygon
            points={`${lampX + 40},128 ${lampX + 40},172 ${BEAKER_X + 10},300 ${BEAKER_X + 10},150`}
            fill={color.hex}
            opacity={beamOpacity}
          />
          {/* lamp */}
          <g
            transform={`translate(${lampX} 0)`}
            className="cursor-grab"
            onPointerDown={(e) => {
              dragging.current = true;
              (e.target as Element).setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={onPointer}
            onPointerUp={() => (dragging.current = false)}
          >
            {/* Generous invisible grab area so the lamp is easy to drag on touch screens. */}
            <rect x="-40" y="90" width="110" height="295" fill="transparent" />
            <rect x="-6" y="150" width="12" height="225" fill="#475569" />
            <rect x="-30" y="368" width="60" height="12" rx="4" fill="#334155" />
            <path d="M-20 110 h50 l18 30 v20 l-18 30 h-50 z" fill="#334155" />
            <circle
              cx="40"
              cy="150"
              r="18"
              fill={inputs.lampOn ? color.hex : '#94a3b8'}
              stroke="#1e293b"
              strokeWidth="3"
            />
            <text x="2" y="104" fontSize="12" fontWeight="800" fill="#334155" textAnchor="middle">
              ↔ drag
            </text>
          </g>
          {/* beaker */}
          <rect
            x={BEAKER_X}
            y="140"
            width="180"
            height="236"
            rx="10"
            fill="#bae6fd"
            opacity="0.55"
            stroke="#64748b"
            strokeWidth="4"
          />
          <rect
            x={BEAKER_X + 3}
            y="160"
            width="174"
            height="213"
            fill="#7dd3fc"
            opacity={0.25 + inputs.co2 * 0.05}
          />
          {/* pondweed */}
          {[604, 640, 676].map((x) => (
            <g key={x}>
              <path
                d={`M${x} 372 C ${x - 14} 330, ${x + 14} 300, ${x} 250`}
                stroke="#15803d"
                strokeWidth="5"
                fill="none"
              />
              {Array.from({ length: 6 }, (_, j) => (
                <ellipse
                  key={j}
                  cx={x + (j % 2 ? 10 : -10)}
                  cy={360 - j * 19}
                  rx="11"
                  ry="4"
                  fill="#22c55e"
                  transform={`rotate(${j % 2 ? -30 : 30} ${x} ${360 - j * 19})`}
                />
              ))}
              <circle cx={x} cy="250" r="3" fill="#166534" />
            </g>
          ))}
          {/* bubbles */}
          {bubbles.map((b) => (
            <g key={b.id}>
              <circle cx={b.x} cy={b.y} r={b.r} fill="#f0f9ff" stroke="#0369a1" strokeWidth="2" />
              <circle cx={b.x - b.r / 3} cy={b.y - b.r / 3} r={b.r / 3} fill="white" />
            </g>
          ))}
          {/* thermometer */}
          <rect
            x={BEAKER_X + 150}
            y="110"
            width="10"
            height="200"
            rx="5"
            fill="white"
            stroke="#64748b"
            strokeWidth="2"
          />
          <rect
            x={BEAKER_X + 152}
            y={300 - ((inputs.temp - 5) / 45) * 180}
            width="6"
            height={((inputs.temp - 5) / 45) * 180 + 8}
            rx="3"
            fill="#ef4444"
          />
          <text
            x={BEAKER_X + 155}
            y="102"
            textAnchor="middle"
            fontSize="12"
            fontWeight="800"
            fill="#334155"
          >
            {inputs.temp}°C
          </text>
          {/* counter */}
          <g>
            <rect
              x="20"
              y="18"
              width="210"
              height="64"
              rx="16"
              fill="white"
              stroke="#0ea5e9"
              strokeWidth="3"
            />
            <text x="125" y="48" textAnchor="middle" fontSize="26" fontWeight="900" fill="#0369a1">
              {out.bubbles} / min
            </text>
            <text x="125" y="70" textAnchor="middle" fontSize="12" fontWeight="700" fill="#334155">
              O₂ bubbles · {Math.floor(counted)} so far
            </text>
          </g>
          {inputs.co2 > 0 && (
            <text x={BEAKER_X + 10} y="132" fontSize="12" fontWeight="800" fill="#334155">
              🥄×{inputs.co2} baking soda
            </text>
          )}
        </svg>

        <Chloroplast factors={out.factors} limiting={out.limiting} lampOn={inputs.lampOn} />
      </div>

      <div className="grid gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/10 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="flex justify-between text-sm font-bold">
            💡 Lamp distance <span className="text-indigo-700">{inputs.distance} cm</span>
          </span>
          <input
            type="range"
            min={10}
            max={80}
            value={inputs.distance}
            onChange={(e) => set({ distance: Number(e.target.value) })}
            className="h-8 accent-amber-500"
            aria-valuetext={`${inputs.distance} centimeters`}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="flex justify-between text-sm font-bold">
            🌡️ Water temperature <span className="text-indigo-700">{inputs.temp} °C</span>
          </span>
          <input
            type="range"
            min={5}
            max={50}
            value={inputs.temp}
            onChange={(e) => set({ temp: Number(e.target.value) })}
            className="h-8 accent-rose-500"
            aria-valuetext={`${inputs.temp} degrees`}
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold">Light:</span>
          {COLORS.map((c) => (
            <button
              key={c.id}
              onClick={() => set({ color: c.id, lampOn: true })}
              aria-pressed={inputs.color === c.id && inputs.lampOn}
              className={`chip py-1 text-sm ring-2 ${inputs.color === c.id && inputs.lampOn ? 'ring-indigo-500' : 'ring-transparent'}`}
              style={{ background: c.hex }}
            >
              {c.label}
            </button>
          ))}
          <button
            onClick={() => set({ lampOn: !inputs.lampOn })}
            aria-pressed={!inputs.lampOn}
            className="chip bg-slate-800 py-1 text-sm text-white"
          >
            {inputs.lampOn ? '🌙 Lights off' : '💡 Lights on'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-ghost py-1.5 text-sm" onClick={addSoda} disabled={inputs.co2 >= 4}>
            🥄 Add baking soda (+CO₂)
          </button>
          <button
            className="btn-ghost py-1.5 text-sm"
            onClick={() => set({ co2: 0 })}
            disabled={inputs.co2 === 0}
          >
            🚰 Fresh water
          </button>
        </div>
      </div>

      <Feedback text={msg?.text ?? null} tone={msg?.tone} />
      <ul className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Goals">
        <Goal done={goals.fast}>Reach 40+ bubbles/min</Goal>
        <Goal done={goals.co2Limit}>Fix a CO₂ shortage (bright lamp, then baking soda)</Goal>
        <Goal done={goals.green}>Try green light</Goal>
        <Goal done={goals.dark}>Turn the lights off</Goal>
      </ul>
    </div>
  );
}

function Goal({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li
      className={`chip py-1 ${done ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-ink-soft'}`}
    >
      {done ? '✅' : '⬜'} {children}
    </li>
  );
}

function Chloroplast({
  factors,
  limiting,
  lampOn,
}: {
  factors: Record<Factor, number>;
  limiting: Factor;
  lampOn: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
      <h3 className="text-sm font-extrabold text-emerald-900">Inside a chloroplast</h3>
      <svg viewBox="0 0 300 120" className="w-full" aria-hidden>
        <ellipse
          cx="150"
          cy="60"
          rx="140"
          ry="52"
          fill="#bbf7d0"
          stroke="#15803d"
          strokeWidth="4"
        />
        {[70, 120, 170, 220].map((x) => (
          <g key={x}>
            {[0, 1, 2, 3].map((j) => (
              <ellipse
                key={j}
                cx={x}
                cy={38 + j * 12}
                rx="18"
                ry="5"
                fill={lampOn ? '#16a34a' : '#4d7c0f'}
                stroke="#14532d"
                strokeWidth="1.5"
              />
            ))}
          </g>
        ))}
        <text x="150" y="112" textAnchor="middle" fontSize="11" fontWeight="800" fill="#14532d">
          thylakoid stacks: chlorophyll catches light
        </text>
      </svg>
      <p className="text-center font-mono text-sm font-bold text-emerald-950">
        light + 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂
      </p>
      {(Object.keys(factors) as Factor[]).map((f) => (
        <div key={f} className="flex items-center gap-2 text-sm">
          <span className="w-24 font-bold">{FACTOR_LABEL[f]}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${Math.round(factors[f] * 100)}%` }}
            />
          </div>
          <span
            className={`w-20 text-right text-xs font-extrabold ${limiting === f ? 'text-rose-600' : 'text-transparent'}`}
            aria-hidden={limiting !== f}
          >
            {limiting === f ? 'LIMITING' : '·'}
          </span>
        </div>
      ))}
      <p className="text-xs text-emerald-900">
        The scarcest ingredient sets the speed, like the slowest worker on an assembly line.
      </p>
    </div>
  );
}
