import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { DndArena, Draggable, DropZone } from '../../templates/framework/dnd';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt } from '../../templates/framework/ui';
import { sfx } from '../../lib/sound';
import {
  ACTIONS,
  act,
  eat,
  FOODS,
  initialState,
  simClock,
  step,
  zoneOf,
  type InsulinMode,
  type ModelState,
} from './model';
import { GoalItem, Icon } from '../../components/Icon';

const MODES: { id: InsulinMode; label: string; blurb: string }[] = [
  {
    id: 'normal',
    label: 'Normal',
    blurb: 'A healthy pancreas makes insulin keys, and cells respond to them.',
  },
  {
    id: 'type1',
    label: 'Type 1 Diabetes',
    blurb: 'The immune system has destroyed the beta cells, so no insulin keys are made.',
  },
  {
    id: 'type2',
    label: 'Type 2 Diabetes',
    blurb: 'Insulin is made, but the locks are “rusty”: cells barely respond (insulin resistance).',
  },
];

/** Narration lines that match the concept's step cards (by index). */
const STAGE = {
  food: 1,
  insulin: 2,
  doors: 3,
  glycogen: 4,
  balance: 5,
  glucagon: 6,
  diabetes: 7,
} as const;

const VESSEL =
  'M 236 250 C 290 250 300 226 360 226 H 596 A 40 40 0 0 1 636 266 V 424 A 40 40 0 0 1 596 464 H 360 C 300 464 290 440 236 440 C 196 440 196 250 236 250 Z';

const settled = (mode: InsulinMode) => {
  let s = initialState();
  for (let i = 0; i < 400; i++) s = step(s, mode, 0.1);
  return { ...s, t: 0 };
};

export function InsulinLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<InsulinMode>('normal');
  const model = useRef<ModelState>(settled('normal'));
  const [, force] = useState(0);
  const [clock, setClock] = useState(0);
  const history = useRef<number[]>([]);
  const [message, setMessage] = useState<string | null>(
    'Drag a food onto the person (or tap a food, then tap the person).',
  );
  const [fedIn, setFedIn] = useState<Record<InsulinMode, number>>({
    normal: 0,
    type1: 0,
    type2: 0,
  });
  const [sawGlucagon, setSawGlucagon] = useState(false);
  const flags = useRef({ peaked: false, stage: 0, starvingSaid: false, renalSaid: false });
  const completed = useRef(alreadyDone);

  const say = useCallback(
    (text: string, stage?: number) => {
      setMessage(text);
      if (stage !== undefined && stage > flags.current.stage) {
        flags.current.stage = stage;
        onStage?.(stage);
      }
    },
    [onStage],
  );

  const sawGlucagonRef = useRef(false);

  // Fixed-step simulation driven by requestAnimationFrame: 1 real second = 1 simulated second.
  useEffect(() => {
    const f = flags.current;
    /** Narrate what the body is doing as thresholds are crossed. */
    const narrate = (s: ModelState) => {
      if (s.glucose > 140) f.peaked = true;
      if (s.rates.absorb > 1 && f.stage < STAGE.insulin && mode !== 'type1' && s.insulin > 6) {
        say(
          'Beta cells in the pancreas notice the extra sugar and release insulin keys.',
          STAGE.insulin,
        );
      } else if (s.rates.uptake > 1.2 && f.stage === STAGE.insulin) {
        say(
          'Insulin keys unlock the glucose doors (GLUT4) on muscle and fat cells. Glucose flows in!',
          STAGE.doors,
        );
      } else if (s.rates.liverIn > 0.35 && f.stage === STAGE.doors) {
        say(
          'The liver packs extra glucose away as glycogen — a sugar pantry for later.',
          STAGE.glycogen,
        );
      } else if (
        f.peaked &&
        s.glucose < 105 &&
        s.gut.length === 0 &&
        mode === 'normal' &&
        f.stage >= STAGE.doors &&
        f.stage < STAGE.balance
      ) {
        say(
          'Back to normal! With less sugar around, the pancreas slows insulin release. Balance restored.',
          STAGE.balance,
        );
      }
      if (s.glucagon > 0.6 && !sawGlucagonRef.current) {
        sawGlucagonRef.current = true;
        setSawGlucagon(true);
        sfx.sparkle();
        say(
          'Too low! Alpha cells release glucagon, which tells the liver to unpack its glycogen pantry.',
          STAGE.glucagon,
        );
      }
      if (mode === 'type1' && s.glucose > 170 && s.rates.uptake < 0.4 && !f.starvingSaid) {
        f.starvingSaid = true;
        say(
          'Blood is full of sugar, but with no keys the cells can’t get any. They’re starving!',
          STAGE.diabetes,
        );
      }
      if (s.rates.renal > 0.2 && !f.renalSaid) {
        f.renalSaid = true;
        say(
          'Above ~180 mg/dL, kidneys can’t hold it all — sugar spills into urine (and takes water with it).',
        );
      }
    };

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let sample = 0;
    const loop = (now: number) => {
      acc += Math.min(0.25, (now - last) / 1000);
      last = now;
      while (acc >= 0.05) {
        model.current = step(model.current, mode, 0.05);
        acc -= 0.05;
        sample += 0.05;
        if (sample >= 0.25) {
          sample = 0;
          history.current = [...history.current.slice(-239), model.current.glucose];
          narrate(model.current);
        }
      }
      setClock(now / 1000);
      force((n) => (n + 1) % 1_000_000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, say]);

  const s = model.current;
  const f = flags.current;

  const goal = {
    feeds: fedIn.normal + fedIn.type1 + fedIn.type2,
    t1: fedIn.type1 > 0,
    t2: fedIn.type2 > 0,
  };
  const goalMet = goal.feeds >= 3 && goal.t1 && goal.t2;
  useEffect(() => {
    if (goalMet && !completed.current) {
      completed.current = true;
      onComplete();
    }
  }, [goalMet, onComplete]);

  const onDrop = useCallback(
    (id: string, zone: string) => {
      if (zone !== 'person') return;
      const food = FOODS.find((x) => x.id === id);
      const action = ACTIONS.find((x) => x.id === id);
      sfx.drop();
      if (food) {
        model.current = eat(model.current, food);
        setFedIn((m) => ({ ...m, [mode]: m[mode] + 1 }));
        f.peaked = false;
        say(food.note, f.stage < STAGE.food ? STAGE.food : undefined);
      } else if (action) {
        model.current = act(model.current, action.id);
        say(action.note);
      }
    },
    [mode, say, f],
  );

  const switchMode = (m: InsulinMode) => {
    if (m === mode) return;
    setMode(m);
    model.current = settled(m);
    history.current = [];
    f.peaked = false;
    f.starvingSaid = false;
    f.renalSaid = false;
    sfx.whoosh();
    say(
      MODES.find((x) => x.id === m)!.blurb + ' Now feed the same food and compare.',
      m === 'normal' ? undefined : STAGE.diabetes,
    );
  };

  const reset = () => {
    model.current = settled(mode);
    history.current = [];
    f.peaked = false;
    say('Reset! Body back to resting.');
  };

  const zone = zoneOf(s.glucose);
  const time = reduce ? 0 : clock;

  return (
    <div className="flex flex-col gap-3">
      <Prompt>
        Feed the person and watch blood sugar. Then try the same food with Type 1 and Type 2
        diabetes.
      </Prompt>
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Body mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={mode === m.id}
            onClick={() => switchMode(m.id)}
            className={`chip py-1.5 text-sm transition ${mode === m.id ? 'bg-indigo-600 text-white shadow' : 'bg-white ring-1 ring-black/10 hover:bg-indigo-50'}`}
          >
            {m.label}
          </button>
        ))}
        <button
          onClick={reset}
          className="chip ml-auto bg-white py-1.5 text-sm ring-1 ring-black/10"
        >
          ↺ Reset
        </button>
      </div>

      <DndArena onDrop={onDrop}>
        <div className="relative">
          <BodyScene s={s} mode={mode} time={time} />
          {/* The whole person is the drop target. */}
          <DropZone
            id="person"
            label="the person"
            className="absolute rounded-[40px]"
            // Matches the person drawn at x 30–300 in the 800×520 viewBox.
            style={{ left: '3.5%', top: 0, width: '34%', height: '97%' }}
          >
            {({ isOver, armed }) => (
              <div
                className={`h-full w-full rounded-[40px] transition ${isOver ? 'bg-indigo-400/15 ring-4 ring-indigo-400' : armed ? 'ring-4 ring-indigo-300 ring-dashed' : ''}`}
              />
            )}
          </DropZone>
          <div className="pointer-events-none absolute bottom-2 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-ink-soft shadow-sm">
            <Icon name="clock" size={18} /> {simClock(s.t)}{' '}
            <span className="font-normal">(1 s ≈ 3 min)</span>
          </div>
        </div>

        <div className="mt-1 grid gap-3 md:grid-cols-[1fr_220px]">
          <div>
            <h3 className="mb-1.5 text-sm font-bold text-ink-soft">Food tray</h3>
            <div className="flex flex-wrap gap-2">
              {FOODS.map((food) => (
                <Draggable key={food.id} id={food.id} label={food.label}>
                  <span className="flex w-[4.6rem] flex-col items-center rounded-2xl bg-white px-1.5 py-1.5 shadow ring-1 ring-black/10">
                    <Icon name={food.icon} size={38} />
                    <span className="text-[11px] leading-tight font-bold">{food.label}</span>
                    <SpeedTag speed={food.speed} />
                  </span>
                </Draggable>
              ))}
              {ACTIONS.map((a) => (
                <Draggable key={a.id} id={a.id} label={a.label}>
                  <span className="flex w-[4.6rem] flex-col items-center rounded-2xl bg-sky-50 px-1.5 py-1.5 shadow ring-1 ring-sky-200">
                    <Icon name={a.icon} size={38} />
                    <span className="text-[11px] leading-tight font-bold">{a.label}</span>
                  </span>
                </Draggable>
              ))}
            </div>
          </div>
          <Sparkline values={history.current} />
        </div>
      </DndArena>

      <Feedback text={message} tone={zone === 'low' || zone === 'very-high' ? 'hint' : 'info'} />

      <ul className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Goals">
        <Goal done={goal.feeds >= 3}>Feed 3 foods ({Math.min(goal.feeds, 3)}/3)</Goal>
        <Goal done={goal.t1}>Feed someone with Type 1</Goal>
        <Goal done={goal.t2}>Feed someone with Type 2</Goal>
        <Goal done={sawGlucagon} bonus>
          Bonus: make sugar drop low enough for glucagon
        </Goal>
      </ul>
    </div>
  );
}

function Goal({ done, children }: { done: boolean; bonus?: boolean; children: React.ReactNode }) {
  return <GoalItem done={done}>{children}</GoalItem>;
}

function SpeedTag({ speed }: { speed: 'fast' | 'medium' | 'slow' | 'minimal' }) {
  const style = {
    fast: 'bg-rose-100 text-rose-700',
    medium: 'bg-amber-100 text-amber-800',
    slow: 'bg-emerald-100 text-emerald-800',
    minimal: 'bg-slate-100 text-slate-600',
  }[speed];
  const text = { fast: 'fast', medium: 'medium', slow: 'slow', minimal: 'minimal' }[speed];
  return (
    <span className={`mt-0.5 rounded-full px-1.5 text-[10px] font-extrabold ${style}`}>{text}</span>
  );
}

// ------------------------------------------------------------------ scene

function useVesselSampler() {
  return useMemo(() => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', VESSEL);
    const len = path.getTotalLength?.() ?? 0;
    const pts = Array.from({ length: 400 }, (_, i) => {
      const p = len ? path.getPointAtLength((i / 400) * len) : { x: 0, y: 0 };
      return { x: p.x, y: p.y };
    });
    return (t: number) => pts[Math.floor((((t % 1) + 1) % 1) * 400)];
  }, []);
}

function BodyScene({ s, mode, time }: { s: ModelState; mode: InsulinMode; time: number }) {
  const at = useVesselSampler();
  const nGlucose = Math.max(4, Math.min(40, Math.round(s.glucose / 8)));
  const nKeys = mode === 'type1' ? 0 : Math.min(16, Math.round(s.insulin / 2.2));
  const nGlucagon = Math.min(10, Math.round(s.glucagon * 2));
  const sens = mode === 'type2' ? 0.25 : 1;
  // Rusty (insulin-resistant) doors only creak partly open, however many keys arrive.
  const doorOpen = Math.min(
    mode === 'type2' ? 0.4 : 1,
    (s.insulin * sens) / 8 + (s.exercise > 0 ? 0.6 : 0),
  );
  const flowing = s.rates.uptake > 0.5;
  const storing = s.rates.liverIn > 0.2;
  const releasing = s.rates.liverOut > 1.25 || s.glucagon > 0.5;
  const secreting = mode !== 'type1' && s.rates.secretion > 1;
  // Cells are "hungry" when sugar is stuck in the blood (no keys) or when blood sugar is too low.
  const starving = (s.glucose > 150 && s.rates.uptake < 0.4) || s.glucose < 65;
  const zone = zoneOf(s.glucose);
  const eating = s.rates.absorb > 0.5;

  const summary = `Blood sugar ${Math.round(s.glucose)} milligrams per deciliter (${zone.replace('-', ' ')}). ${
    nKeys ? `${nKeys} insulin keys in the blood. ` : 'No insulin in the blood. '
  }Glucose doors ${doorOpen > 0.5 ? 'open' : doorOpen > 0.15 ? 'partly open' : 'closed'}. Liver glycogen ${Math.round(s.glycogen)} percent.`;

  return (
    <svg
      viewBox="0 0 800 520"
      className="w-full rounded-3xl bg-gradient-to-b from-sky-50 to-rose-50 ring-1 ring-black/10"
      role="img"
      aria-label={summary}
    >
      <defs>
        <pattern id="muscle-stripes" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#fda4af" />
          <rect width="6" height="14" fill="#fb7185" opacity="0.5" />
        </pattern>
        <radialGradient id="fat" cx="40%" cy="35%">
          <stop offset="0" stopColor="#fef9c3" />
          <stop offset="1" stopColor="#fde047" />
        </radialGradient>
        <g id="glu">
          <polygon
            points="0,-6 5.2,-3 5.2,3 0,6 -5.2,3 -5.2,-3"
            fill="#fbbf24"
            stroke="#b45309"
            strokeWidth="1.5"
          />
        </g>
        <g id="key">
          <circle cx="-5" cy="0" r="4.5" fill="#facc15" stroke="#a16207" strokeWidth="1.5" />
          <circle cx="-5" cy="0" r="1.5" fill="#a16207" />
          <path
            d="M-0.5 0 H9 M5 0 v3.5 M8 0 v3"
            stroke="#a16207"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </g>
        <g id="glucagon">
          <polygon points="0,-6 6,5 -6,5" fill="#c084fc" stroke="#6b21a8" strokeWidth="1.5" />
        </g>
      </defs>

      {/* ---------- bloodstream ---------- */}
      <path d={VESSEL} fill="none" stroke="#dc2626" strokeWidth="38" strokeLinejoin="round" />
      <path d={VESSEL} fill="none" stroke="#fca5a5" strokeWidth="28" strokeLinejoin="round" />
      {Array.from({ length: nGlucose }, (_, i) => {
        const p = at(i / nGlucose + time * 0.05);
        return (
          <use key={`g${i}`} href="#glu" x={p.x + ((i * 7) % 11) - 5} y={p.y + ((i * 5) % 9) - 4} />
        );
      })}
      {Array.from({ length: nKeys }, (_, i) => {
        const p = at(i / Math.max(1, nKeys) + 0.013 + time * 0.065);
        return <use key={`k${i}`} href="#key" x={p.x} y={p.y + 6} />;
      })}
      {Array.from({ length: nGlucagon }, (_, i) => {
        const p = at(i / Math.max(1, nGlucagon) + 0.5 + time * 0.06);
        return <use key={`c${i}`} href="#glucagon" x={p.x} y={p.y - 6} />;
      })}

      {/* ---------- person ---------- */}
      <g>
        <rect
          x="70"
          y="150"
          width="190"
          height="355"
          rx="70"
          fill="#7dd3fc"
          stroke="#0369a1"
          strokeWidth="4"
        />
        <rect
          x="150"
          y="128"
          width="30"
          height="30"
          fill="#fcd9b6"
          stroke="#9a3412"
          strokeWidth="3"
        />
        <circle cx="165" cy="84" r="58" fill="#fcd9b6" stroke="#9a3412" strokeWidth="4" />
        <path d="M110 70 C115 20 215 15 222 70 C205 48 130 48 110 70Z" fill="#5b3a29" />
        <circle cx="145" cy="86" r="6" fill="#1e1b2e" />
        <circle cx="185" cy="86" r="6" fill="#1e1b2e" />
        {zone === 'low' ? (
          <path
            d="M150 116 q15 -8 30 0"
            stroke="#9a3412"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        ) : eating ? (
          <ellipse cx="165" cy="114" rx="11" ry="8" fill="#7f1d1d" />
        ) : (
          <path
            d="M148 110 q17 14 34 0"
            stroke="#9a3412"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {zone === 'very-high' && (
          <path
            d="M224 40 q-9 13 -9 19 a9 9 0 0 0 18 0 q0 -6 -9 -19z"
            fill="#7dd3fc"
            stroke="#0369a1"
            strokeWidth="2"
          />
        )}
        {/* cutaway */}
        <rect
          x="92"
          y="172"
          width="146"
          height="312"
          rx="52"
          fill="#fff1f2"
          stroke="#be123c"
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        <path d="M165 140 V 196" stroke="#f9a8d4" strokeWidth="8" strokeLinecap="round" />
        {/* stomach */}
        <path
          d="M150 196 C 190 186 222 206 214 236 C 206 262 160 258 150 236 C 144 222 136 202 150 196Z"
          fill="#f9a8d4"
          stroke="#be185d"
          strokeWidth="2.5"
        />
        <text x="183" y="229" fontSize="11" textAnchor="middle" fontWeight="800" fill="#831843">
          stomach
        </text>
        {/* liver */}
        <path
          d="M98 238 C 104 216 150 222 158 246 C 164 268 140 290 112 284 C 96 280 92 256 98 238Z"
          fill="#b45309"
          stroke="#78350f"
          strokeWidth="2.5"
        />
        {Array.from({ length: Math.round(s.glycogen / 9) }, (_, i) => (
          <circle
            key={i}
            cx={108 + (i % 5) * 9}
            cy={250 + Math.floor(i / 5) * 9}
            r="3.4"
            fill="#fde68a"
            stroke="#92400e"
            strokeWidth="1"
          />
        ))}
        <text x="128" y="300" fontSize="11" textAnchor="middle" fontWeight="800" fill="#78350f">
          liver{storing ? ' (storing)' : ''}
        </text>
        {releasing && (
          <circle cx="106" cy="228" r="6" fill="#a855f7" stroke="#581c87" strokeWidth="2">
            <animate attributeName="r" values="5;7;5" dur="0.8s" repeatCount="indefinite" />
          </circle>
        )}
        {/* pancreas */}
        <path
          d="M150 300 C 170 286 215 290 226 304 C 214 318 172 318 150 310Z"
          fill={mode === 'type1' ? '#e5e7eb' : '#fde68a'}
          stroke="#a16207"
          strokeWidth="2.5"
        />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle
              cx={168 + i * 14}
              cy={303}
              r="4.5"
              fill={mode === 'type1' ? '#9ca3af' : secreting ? '#facc15' : '#fef3c7'}
              stroke="#a16207"
              strokeWidth="1"
            >
              {secreting && (
                <animate attributeName="r" values="4.5;6;4.5" dur="0.8s" repeatCount="indefinite" />
              )}
            </circle>
            {mode === 'type1' && (
              <path
                d={`M${165 + i * 14} 300 l6 6 m0 -6 l-6 6`}
                stroke="#b91c1c"
                strokeWidth="1.6"
              />
            )}
          </g>
        ))}
        <text x="188" y="330" fontSize="11" textAnchor="middle" fontWeight="800" fill="#713f12">
          pancreas
        </text>
        {/* kidney */}
        <path
          d="M212 336 c 14 -6 24 8 18 22 c -4 12 -20 12 -22 2 c 6 -6 -6 -14 4 -24z"
          fill="#9f1239"
          stroke="#4c0519"
          strokeWidth="2"
        />
        {s.rates.renal > 0.1 && (
          <text x="194" y="382" fontSize="10" fontWeight="800" fill="#9f1239">
            sugar in urine
          </text>
        )}
        {/* intestines */}
        <path
          d="M112 396 q 15 -18 30 0 t 30 0 t 30 0 M112 424 q 15 -18 30 0 t 30 0 t 30 0 M112 452 q 15 -18 30 0 t 30 0"
          fill="none"
          stroke="#fb923c"
          strokeWidth="9"
          strokeLinecap="round"
        />
        {eating &&
          [0, 1, 2].map((i) => {
            const p = (time * 0.7 + i / 3) % 1;
            return (
              <use
                key={i}
                href="#glu"
                x={122 + p * 80}
                y={410 + (i % 2) * 28}
                opacity={1 - p * 0.3}
              />
            );
          })}
      </g>

      {/* ---------- cells ---------- */}
      <Cell
        x={378}
        y={292}
        w={120}
        h={110}
        label="muscle cell"
        fill="url(#muscle-stripes)"
        open={doorOpen}
        rusty={mode === 'type2'}
        keyed={nKeys > 0}
        flowing={flowing}
        time={time}
        starving={starving}
        fill01={s.cellFill}
      />
      <Cell
        x={512}
        y={292}
        w={100}
        h={110}
        label="fat cell"
        fill="url(#fat)"
        open={doorOpen}
        rusty={mode === 'type2'}
        keyed={nKeys > 0}
        flowing={flowing}
        time={time}
        starving={starving}
        fill01={s.cellFill}
        round
      />

      {/* ---------- meter ---------- */}
      <Meter glucose={s.glucose} />
    </svg>
  );
}

function Cell({
  x,
  y,
  w,
  h,
  label,
  fill,
  open,
  rusty,
  keyed,
  flowing,
  time,
  starving,
  fill01,
  round,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fill: string;
  open: number;
  rusty: boolean;
  keyed: boolean;
  flowing: boolean;
  time: number;
  starving: boolean;
  fill01: number;
  round?: boolean;
}) {
  const doorX = x + w / 2;
  const doorY = y;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={round ? 50 : 22}
        fill={fill}
        stroke="#9f1239"
        strokeWidth="3"
      />
      {/* GLUT4 door on the membrane, facing the blood vessel above */}
      <rect
        x={doorX - 14}
        y={doorY - 5}
        width="28"
        height="10"
        rx="3"
        fill="#fff"
        stroke="#9f1239"
        strokeWidth="2"
      />
      <g transform={`rotate(${-open * 75} ${doorX - 13} ${doorY})`}>
        <rect
          x={doorX - 13}
          y={doorY - 4}
          width="26"
          height="8"
          rx="2"
          fill={rusty ? '#a16207' : '#22c55e'}
          stroke={rusty ? '#78350f' : '#166534'}
          strokeWidth="1.5"
        />
        {rusty && (
          <>
            <circle cx={doorX - 6} cy={doorY - 1} r="1.6" fill="#7c2d12" />
            <circle cx={doorX + 5} cy={doorY + 1} r="1.3" fill="#7c2d12" />
          </>
        )}
      </g>
      {keyed && <use href="#key" x={doorX + 24} y={doorY - 10} />}
      {flowing &&
        [0, 1, 2].map((i) => {
          const p = (time * 0.9 + i / 3) % 1;
          return <use key={i} href="#glu" x={doorX} y={doorY - 8 + p * 42} opacity={1 - p} />;
        })}
      {/* stored glucose dots */}
      {Array.from({ length: Math.round(fill01 / 14) }, (_, i) => (
        <use
          key={i}
          href="#glu"
          x={x + 18 + (i % 4) * 22}
          y={y + h - 22 - Math.floor(i / 4) * 15}
        />
      ))}
      {/* face */}
      <circle cx={x + w / 2 - 12} cy={y + 40} r="3.5" fill="#1e1b2e" />
      <circle cx={x + w / 2 + 12} cy={y + 40} r="3.5" fill="#1e1b2e" />
      <path
        d={
          starving
            ? `M${x + w / 2 - 9} ${y + 58} q9 -8 18 0`
            : `M${x + w / 2 - 9} ${y + 53} q9 9 18 0`
        }
        stroke="#1e1b2e"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <text
        x={x + w / 2}
        y={y + h + 16}
        fontSize="12"
        textAnchor="middle"
        fontWeight="800"
        fill="#4c0519"
      >
        {label}
      </text>
    </g>
  );
}

function Meter({ glucose }: { glucose: number }) {
  const top = 40;
  const bottom = 470;
  const y = (g: number) => bottom - ((Math.min(300, Math.max(40, g)) - 40) / 260) * (bottom - top);
  const zone = zoneOf(glucose);
  const color = { low: '#3b82f6', normal: '#22c55e', high: '#f59e0b', 'very-high': '#ef4444' }[
    zone
  ];
  const label = { low: 'Too low', normal: 'Normal', high: 'High', 'very-high': 'Very high' }[zone];
  return (
    <g
      role="meter"
      aria-label="Blood sugar"
      aria-valuemin={40}
      aria-valuemax={300}
      aria-valuenow={Math.round(glucose)}
    >
      <rect
        x="680"
        y={top}
        width="56"
        height={bottom - top}
        rx="28"
        fill="#f8fafc"
        stroke="#334155"
        strokeWidth="3"
      />
      <rect x="684" y={y(300)} width="48" height={y(200) - y(300)} fill="#fecaca" />
      <rect x="684" y={y(200)} width="48" height={y(140) - y(200)} fill="#fde68a" />
      <rect x="684" y={y(140)} width="48" height={y(70) - y(140)} fill="#bbf7d0" />
      <rect x="684" y={y(70)} width="48" height={y(40) - y(70) - 4} rx="20" fill="#bfdbfe" />
      <rect
        x="696"
        y={y(glucose)}
        width="24"
        height={bottom - 6 - y(glucose)}
        rx="12"
        fill={color}
        opacity="0.9"
      />
      {[70, 140, 200].map((g) => (
        <g key={g}>
          <line x1="676" x2="686" y1={y(g)} y2={y(g)} stroke="#334155" strokeWidth="2" />
          <text x="672" y={y(g) + 4} fontSize="11" textAnchor="end" fill="#334155" fontWeight="700">
            {g}
          </text>
        </g>
      ))}
      <text x="708" y="496" fontSize="22" textAnchor="middle" fontWeight="900" fill={color}>
        {Math.round(glucose)}
      </text>
      <text x="708" y="512" fontSize="10" textAnchor="middle" fill="#334155" fontWeight="700">
        mg/dL · {label}
      </text>
      <text x="708" y="28" fontSize="12" textAnchor="middle" fill="#334155" fontWeight="800">
        Blood sugar
      </text>
    </g>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 220;
  const h = 96;
  const y = (g: number) => h - ((Math.min(300, Math.max(40, g)) - 40) / 260) * h;
  const pts = values.map((v, i) => `${(i / 239) * w},${y(v)}`).join(' ');
  return (
    <figure className="rounded-2xl bg-white p-2 ring-1 ring-black/10">
      <figcaption className="mb-1 text-xs font-bold text-ink-soft">
        Blood sugar, last minute
      </figcaption>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" aria-hidden>
        <rect x="0" y={y(140)} width={w} height={y(70) - y(140)} fill="#dcfce7" />
        <polyline
          points={pts}
          fill="none"
          stroke="#e11d48"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    </figure>
  );
}
