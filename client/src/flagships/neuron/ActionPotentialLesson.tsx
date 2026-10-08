import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt, type FeedbackTone } from '../../templates/framework/ui';
import { sfx } from '../../lib/sound';
import { initialNeuron, stepNeuron, stimulate, THRESHOLD, type NeuronState } from './model';

/** Neuron milliseconds that pass per real second (the lesson is in slow motion). */
const SLOWMO = 4;
const WINDOW_MS = 14;
const AXON = { x0: 236, x1: 796, y: 130 };
const NODES = [236, 330, 424, 518, 612, 706, 796];

const STAGE = { small: 1, rising: 2, falling: 3, refractory: 4, travel: 5, extras: 6 } as const;

export function ActionPotentialLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const reduce = useReducedMotion();
  const [strength, setStrength] = useState(10);
  const [myelin, setMyelin] = useState(true);
  const [ttx, setTtx] = useState(false);
  const neuron = useRef<NeuronState>(initialNeuron());
  const history = useRef<{ t: number; v: number }[]>([]);
  const [, force] = useState(0);
  const [msg, setMsg] = useState<{ text: string; tone: FeedbackTone } | null>({
    text: 'The neuron is resting at −70 mV. Give it a small zap first.',
    tone: 'info',
  });
  const [goals, setGoals] = useState({
    fizzle: false,
    fire: false,
    refractory: false,
    extra: false,
  });
  const [zapFlash, setZapFlash] = useState(0);
  const [release, setRelease] = useState(0);
  const completed = useRef(alreadyDone);
  const lastPhase = useRef(neuron.current.phase);
  const lastArrivals = useRef(0);

  const stage = useCallback((i: number) => onStage?.(i), [onStage]);
  const say = (text: string, tone: FeedbackTone = 'info') => setMsg({ text, tone });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const realDt = Math.min(0.1, (now - last) / 1000);
      last = now;
      let ms = realDt * SLOWMO;
      const speed = myelin ? 0.55 : 0.09;
      while (ms > 0) {
        const dt = Math.min(0.02, ms);
        neuron.current = stepNeuron(neuron.current, dt, speed);
        ms -= dt;
      }
      const s = neuron.current;
      history.current.push({ t: s.t, v: s.v });
      while (history.current.length && history.current[0].t < s.t - WINDOW_MS)
        history.current.shift();
      if (s.phase !== lastPhase.current) {
        if (s.phase === 'falling') {
          stage(STAGE.falling);
          setMsg({
            text: 'Peak! Na⁺ channels slam shut, and K⁺ channels open — positive potassium rushes OUT.',
            tone: 'info',
          });
        } else if (s.phase === 'undershoot') {
          stage(STAGE.refractory);
          setMsg({
            text: 'It overshoots below −70 mV. For a moment the neuron can’t fire again: the refractory period.',
            tone: 'info',
          });
        }
        lastPhase.current = s.phase;
      }
      if (s.arrivals !== lastArrivals.current) {
        lastArrivals.current = s.arrivals;
        setRelease(Date.now());
        sfx.sparkle();
        stage(STAGE.travel);
        setMsg({
          text: myelin
            ? 'The signal leapt from gap to gap along the myelin and reached the end — releasing neurotransmitters to the next cell!'
            : 'Without myelin the signal crawls along the whole axon. It got there… eventually.',
          tone: 'good',
        });
      }
      force((n) => (n + 1) % 1e6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [myelin, stage]);

  const goalMet = goals.fizzle && goals.fire && goals.refractory && goals.extra;
  useEffect(() => {
    if (goalMet && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [goalMet, onComplete]);

  const zap = () => {
    const { s, result } = stimulate(neuron.current, strength, ttx);
    neuron.current = s;
    setZapFlash(Date.now());
    sfx.pop();
    if (result === 'subthreshold') {
      setGoals((g) => ({ ...g, fizzle: true }));
      stage(STAGE.small);
      say(
        `A ${strength} mV nudge… not enough to reach the −55 mV threshold. It just fades away.`,
        'hint',
      );
    } else if (result === 'fired') {
      setGoals((g) => ({ ...g, fire: true }));
      stage(STAGE.rising);
      sfx.correct();
      say(
        'Threshold reached! Na⁺ channels fly open and positive sodium floods IN. The inside turns positive!',
        'good',
      );
    } else if (result === 'refractory') {
      setGoals((g) => ({ ...g, refractory: true }));
      stage(STAGE.refractory);
      say(
        'Nothing! The neuron is in its refractory period, so it ignores you. This keeps signals moving one way.',
        'hint',
      );
    } else {
      setGoals((g) => ({ ...g, extra: true }));
      stage(STAGE.extras);
      say(
        'Pufferfish toxin (TTX) blocks the Na⁺ channels. Even a huge zap can’t fire a signal — that’s why it paralyzes.',
        'hint',
      );
    }
  };

  const s = neuron.current;
  const time = reduce ? 0 : performance.now() / 1000;
  const vColor = s.v > 0 ? '#f97316' : s.v > THRESHOLD ? '#facc15' : '#60a5fa';
  const waveX =
    s.wave === null
      ? null
      : myelin
        ? NODES[Math.min(NODES.length - 1, Math.floor(s.wave * (NODES.length - 1) + 0.5))]
        : AXON.x0 + s.wave * (AXON.x1 - AXON.x0);
  const releasing = Date.now() - release < 1500;

  return (
    <div className="flex flex-col gap-3">
      <Prompt>
        Zap the neuron with different strengths. Can you make it fire? Can you make it fail?
      </Prompt>

      <svg
        viewBox="0 0 900 250"
        className="w-full rounded-3xl bg-gradient-to-b from-indigo-950 to-slate-900 ring-1 ring-black/20"
        role="img"
        aria-label={`Neuron. Membrane voltage ${Math.round(s.v)} millivolts, ${s.phase}. ${s.wave !== null ? 'A signal is travelling down the axon.' : ''}`}
      >
        <defs>
          <radialGradient id="glow">
            <stop offset="0" stopColor="#fde047" />
            <stop offset="1" stopColor="#fde047" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* dendrites */}
        <g stroke="#a5b4fc" strokeWidth="9" strokeLinecap="round" fill="none">
          <path d="M140 120 L80 70 L40 60 M80 70 L70 30" />
          <path d="M140 135 L60 140 L20 120 M60 140 L30 175" />
          <path d="M150 155 L100 205 L60 215 M100 205 L105 240" />
        </g>
        {/* soma */}
        <circle
          cx="180"
          cy="130"
          r="56"
          fill={vColor}
          stroke="#e0e7ff"
          strokeWidth="5"
          style={{ transition: 'fill .15s' }}
        />
        <circle cx="172" cy="122" r="18" fill="#312e81" opacity=".55" />
        <text x="180" y="200" textAnchor="middle" fill="#c7d2fe" fontSize="13" fontWeight="800">
          cell body
        </text>
        {/* axon */}
        <path d={`M230 130 H${AXON.x1}`} stroke="#a5b4fc" strokeWidth="10" />
        {myelin &&
          NODES.slice(0, -1).map((x, i) => (
            <rect
              key={x}
              x={x + 9}
              y="114"
              width={NODES[i + 1] - x - 18}
              height="32"
              rx="16"
              fill="#fef3c7"
              stroke="#f59e0b"
              strokeWidth="3"
            />
          ))}
        {myelin && NODES.map((x) => <circle key={x} cx={x} cy="130" r="4" fill="#e0e7ff" />)}
        <text x="516" y="98" textAnchor="middle" fill="#c7d2fe" fontSize="13" fontWeight="800">
          {myelin ? 'axon wrapped in myelin (gaps = nodes of Ranvier)' : 'bare axon (no myelin)'}
        </text>
        {/* terminal */}
        <g stroke="#a5b4fc" strokeWidth="8" strokeLinecap="round" fill="none">
          <path d="M796 130 L840 95 M796 130 L850 130 M796 130 L840 168" />
        </g>
        {[
          [846, 92],
          [858, 130],
          [846, 170],
        ].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="12" fill={releasing ? '#fde047' : '#818cf8'} />
        ))}
        {releasing &&
          Array.from({ length: 12 }, (_, i) => {
            const p = Math.min(1, (Date.now() - release) / 1200);
            return (
              <circle
                key={i}
                cx={862 + p * 30 + (i % 3) * 6}
                cy={92 + (i % 4) * 26 + Math.sin(i + p * 6) * 6}
                r="3.5"
                fill="#fde047"
                opacity={1 - p}
              />
            );
          })}
        {/* travelling spike */}
        {waveX !== null && (
          <g>
            <circle cx={waveX} cy="130" r="34" fill="url(#glow)" />
            <circle cx={waveX} cy="130" r="9" fill="#fff7ae" />
          </g>
        )}
        {/* electrode */}
        <motion.g
          key={zapFlash}
          initial={{ x: 0 }}
          animate={{ x: [0, 6, 0] }}
          transition={{ duration: 0.25 }}
        >
          <path d="M120 10 L160 74" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
          <circle cx="118" cy="8" r="8" fill="#94a3b8" />
          {Date.now() - zapFlash < 300 && (
            <text x="150" y="70" fontSize="26">
              ⚡
            </text>
          )}
        </motion.g>
      </svg>

      <div className="grid gap-3 md:grid-cols-[3fr_2fr]">
        <Scope history={history.current} now={s.t} />
        <Membrane na={s.na} k={s.k} time={time} ttx={ttx} />
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/10">
        <label className="flex min-w-48 flex-1 flex-col gap-1">
          <span className="flex justify-between text-sm font-bold">
            Zap strength <span className="text-indigo-700">+{strength} mV</span>
          </span>
          <input
            type="range"
            min={2}
            max={30}
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
            className="h-8 accent-indigo-600"
            aria-valuetext={`${strength} millivolts`}
          />
        </label>
        <button className="btn-primary px-6 text-lg" onClick={zap}>
          ⚡ Zap!
        </button>
        <button
          className={`chip py-1.5 text-sm ${myelin ? 'bg-amber-200 text-amber-950' : 'bg-slate-100 text-ink-soft'}`}
          aria-pressed={myelin}
          onClick={() => {
            setMyelin(!myelin);
            setGoals((g) => ({ ...g, extra: true }));
            say(
              myelin
                ? 'Myelin removed (as in multiple sclerosis). Watch how slowly the signal travels now.'
                : 'Myelin back on: signals jump between gaps, up to 100× faster.',
            );
          }}
        >
          🧈 Myelin {myelin ? 'on' : 'off'}
        </button>
        <button
          className={`chip py-1.5 text-sm ${ttx ? 'bg-rose-600 text-white' : 'bg-slate-100 text-ink-soft'}`}
          aria-pressed={ttx}
          onClick={() => {
            setTtx(!ttx);
            if (!ttx)
              say('You added pufferfish toxin. It plugs the sodium channels. Try zapping now…');
          }}
        >
          🐡 Pufferfish toxin {ttx ? 'on' : 'off'}
        </button>
      </div>

      <Feedback text={msg?.text ?? null} tone={msg?.tone} />
      <ul className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Goals">
        <Goal done={goals.fizzle}>Make a zap that fizzles</Goal>
        <Goal done={goals.fire}>Fire an action potential</Goal>
        <Goal done={goals.refractory}>Zap during the refractory period</Goal>
        <Goal done={goals.extra}>Try myelin or the toxin</Goal>
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

function Scope({ history, now }: { history: { t: number; v: number }[]; now: number }) {
  const W = 420;
  const H = 200;
  const y = (v: number) => 14 + ((50 - v) / 150) * (H - 34);
  const x = (t: number) => 40 + ((t - (now - WINDOW_MS)) / WINDOW_MS) * (W - 50);
  const pts = history.map((p) => `${x(p.t)},${y(p.v)}`).join(' ');
  return (
    <figure className="rounded-2xl bg-slate-900 p-2 ring-1 ring-black/20">
      <figcaption className="px-1 text-xs font-bold text-emerald-300">
        Oscilloscope · membrane voltage (mV)
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Voltage trace">
        {[40, 0, -55, -70, -90].map((v) => (
          <g key={v}>
            <line
              x1="40"
              x2={W - 10}
              y1={y(v)}
              y2={y(v)}
              stroke={v === -55 ? '#f59e0b' : '#334155'}
              strokeDasharray={v === -55 ? '6 4' : undefined}
            />
            <text
              x="34"
              y={y(v) + 4}
              textAnchor="end"
              fontSize="11"
              fill={v === -55 ? '#fbbf24' : '#94a3b8'}
            >
              {v}
            </text>
          </g>
        ))}
        <text
          x={W - 12}
          y={y(-55) - 5}
          textAnchor="end"
          fontSize="11"
          fill="#fbbf24"
          fontWeight="700"
        >
          threshold
        </text>
        <polyline
          points={pts}
          fill="none"
          stroke="#34d399"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
    </figure>
  );
}

function Membrane({ na, k, time, ttx }: { na: number; k: number; time: number; ttx: boolean }) {
  const ions = (n: number, kind: 'na' | 'k') =>
    Array.from({ length: n }, (_, i) => {
      const flowing = kind === 'na' ? na > 0.3 : k > 0.3;
      const gateX = kind === 'na' ? 70 : 190;
      const phase = (time * 1.4 + i / n) % 1;
      // Na+ starts outside (top) and flows in; K+ starts inside (bottom) and flows out.
      const restX = kind === 'na' ? 18 + ((i * 37) % 110) : 140 + ((i * 41) % 100);
      const restY = kind === 'na' ? 18 + ((i * 13) % 40) : 140 + ((i * 17) % 40);
      let cx = restX;
      let cy = restY;
      if (flowing && i < 5) {
        cx = gateX;
        cy = kind === 'na' ? 30 + phase * 130 : 170 - phase * 130;
      }
      return (
        <circle
          key={`${kind}${i}`}
          cx={cx}
          cy={cy}
          r="6"
          fill={kind === 'na' ? '#fb923c' : '#a78bfa'}
          stroke="#1e1b2e"
          strokeWidth="1"
        />
      );
    });
  return (
    <figure className="rounded-2xl bg-sky-50 p-2 ring-1 ring-black/10">
      <figcaption className="px-1 text-xs font-bold text-ink-soft">
        Close-up of the membrane
      </figcaption>
      <svg
        viewBox="0 0 260 200"
        className="w-full"
        role="img"
        aria-label={`Sodium channels ${na > 0.3 ? 'open' : 'closed'}${ttx ? ' and blocked by toxin' : ''}; potassium channels ${k > 0.3 ? 'open' : 'closed'}.`}
      >
        <text x="6" y="12" fontSize="10" fontWeight="800" fill="#475569">
          OUTSIDE
        </text>
        <text x="6" y="196" fontSize="10" fontWeight="800" fill="#475569">
          INSIDE
        </text>
        <rect x="0" y="82" width="260" height="36" fill="#fde68a" />
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={5 + i * 10} cy="86" r="4" fill="#f59e0b" />
        ))}
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={5 + i * 10} cy="114" r="4" fill="#f59e0b" />
        ))}
        {/* Na+ channel */}
        <rect
          x="56"
          y="76"
          width="28"
          height="48"
          rx="6"
          fill="#fdba74"
          stroke="#9a3412"
          strokeWidth="2"
        />
        <rect
          x={na > 0.3 ? 58 : 62}
          y="76"
          width={na > 0.3 ? 4 : 16}
          height="48"
          fill="#9a3412"
          opacity={na > 0.3 ? 0.4 : 0.9}
        />
        {ttx && (
          <text x="58" y="76" fontSize="18">
            🐡
          </text>
        )}
        <text x="70" y="140" textAnchor="middle" fontSize="10" fontWeight="800" fill="#9a3412">
          Na⁺ channel
        </text>
        {/* K+ channel */}
        <rect
          x="176"
          y="76"
          width="28"
          height="48"
          rx="6"
          fill="#c4b5fd"
          stroke="#5b21b6"
          strokeWidth="2"
        />
        <rect
          x={k > 0.3 ? 178 : 182}
          y="76"
          width={k > 0.3 ? 4 : 16}
          height="48"
          fill="#5b21b6"
          opacity={k > 0.3 ? 0.4 : 0.9}
        />
        <text x="190" y="70" textAnchor="middle" fontSize="10" fontWeight="800" fill="#5b21b6">
          K⁺ channel
        </text>
        {ions(14, 'na')}
        {ions(12, 'k')}
      </svg>
    </figure>
  );
}
