import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { DndArena, Draggable, DropZone } from '../../templates/framework/dnd';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt, type FeedbackTone } from '../../templates/framework/ui';
import { shuffled } from '../../templates/framework/shuffle';
import { sfx } from '../../lib/sound';
import { feed, initialEtc, MAX_GRADIENT, stepEtc, type EtcState, type Poisons } from './model';
import { GoalItem, Icon } from '../../components/Icon';

/** Electron-path stations in order, with x positions in the 900×430 viewBox. */
const PARTS = [
  {
    id: 'c1',
    label: 'Complex I',
    short: 'I',
    x: 130,
    color: '#f97316',
    hint: 'NADH hands its electrons to Complex I first.',
  },
  {
    id: 'q',
    label: 'Ubiquinone (Q)',
    short: 'Q',
    x: 240,
    color: '#facc15',
    hint: 'Q is a small mobile carrier that ferries electrons inside the membrane.',
  },
  {
    id: 'c3',
    label: 'Complex III',
    short: 'III',
    x: 350,
    color: '#22c55e',
    hint: 'Complex III takes electrons from Q and passes them to cytochrome c.',
  },
  {
    id: 'cytc',
    label: 'Cytochrome c',
    short: 'cyt c',
    x: 460,
    color: '#ef4444',
    hint: 'Cytochrome c is a tiny protein carrier on the outer face of the membrane.',
  },
  {
    id: 'c4',
    label: 'Complex IV',
    short: 'IV',
    x: 570,
    color: '#3b82f6',
    hint: 'Complex IV is last: it hands electrons to oxygen, making water.',
  },
];
const DISTRACTORS = [
  {
    id: 'hemo',
    label: 'Hemoglobin',
    hint: 'Hemoglobin carries oxygen in the blood — it isn’t part of the chain inside mitochondria.',
  },
  {
    id: 'chloro',
    label: 'Chlorophyll',
    hint: 'Chlorophyll runs a different electron chain — in chloroplasts, for photosynthesis.',
  },
];
const SYNTHASE_X = 770;
const MEM_TOP = 175;
const MEM_BOT = 245;

type Phase = 'build' | 'run';

export function EtcLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('build');
  const [placed, setPlaced] = useState<string[]>([]);
  const [poisons, setPoisons] = useState<Poisons>({
    cyanide: false,
    oligomycin: false,
    dnp: false,
  });
  const [auto, setAuto] = useState(false);
  const [triedPoison, setTriedPoison] = useState(false);
  const sim = useRef<EtcState>(initialEtc());
  const [, force] = useState(0);
  const [msg, setMsg] = useState<{ text: string; tone: FeedbackTone } | null>({
    text: 'First, build the chain: drag the carriers into the membrane in the order electrons travel.',
    tone: 'info',
  });
  const completed = useRef(alreadyDone);
  const tray = useMemo(
    () =>
      shuffled([...PARTS.map((p) => ({ id: p.id, label: p.label, hint: p.hint })), ...DISTRACTORS]),
    [],
  );
  const say = (text: string, tone: FeedbackTone = 'info') => setMsg({ text, tone });
  const madeTen = sim.current.atp >= 10;

  useEffect(() => {
    if (madeTen && triedPoison && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [madeTen, triedPoison, onComplete]);

  // Simulation loop.
  useEffect(() => {
    if (phase !== 'run') return;
    let raf = 0;
    let last = performance.now();
    let feedTimer = 0;
    let lastAtp = sim.current.atp;
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (auto) {
        feedTimer += dt;
        if (feedTimer > 1.1) {
          feedTimer = 0;
          sim.current = feed(sim.current, 'NADH');
        }
      }
      for (let t = 0; t < dt; t += 0.02) sim.current = stepEtc(sim.current, poisons, 0.02);
      if (sim.current.atp > lastAtp) {
        lastAtp = sim.current.atp;
        sfx.coin();
        if (sim.current.atp === 1) {
          onStage?.(4);
          say(
            'ATP! Protons rushing back through ATP synthase spin it like a water wheel, snapping phosphate onto ADP.',
            'good',
          );
        }
        if (sim.current.atp === 10)
          say('10 ATP made! Now try a poison to see what each part does.', 'good');
      }
      force((n) => (n + 1) % 1e6);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, poisons, auto, onStage]);

  const onDrop = useCallback(
    (id: string, zone: string) => {
      if (phase === 'build') {
        const slot = Number(zone.replace('slot-', ''));
        if (Number.isNaN(slot)) return;
        const part = PARTS[slot];
        if (placed.length !== slot) {
          say('Fill the slots from left to right, following the electrons.', 'hint');
          return;
        }
        if (part.id === id) {
          sfx.correct();
          const next = [...placed, id];
          setPlaced(next);
          onStage?.(Math.min(2, next.length));
          if (next.length === PARTS.length) {
            setPhase('run');
            onStage?.(2);
            say(
              'Chain built! Now drag NADH (from the Krebs cycle) onto Complex I and follow the electrons.',
              'good',
            );
          } else say(part.hint, 'good');
        } else {
          sfx.nope();
          const item = tray.find((t) => t.id === id);
          say(
            DISTRACTORS.some((d) => d.id === id)
              ? item!.hint
              : `Not quite — slot ${slot + 1} needs something else. ${PARTS[slot].hint.split('.')[0]}?`,
            'hint',
          );
        }
        return;
      }
      if (id === 'nadh' && zone === 'entry-1') {
        sim.current = feed(sim.current, 'NADH');
        sfx.drop();
        onStage?.(3);
        say(
          'NADH drops off 2 high-energy electrons. Each complex they pass uses that energy to pump H⁺ ions up into the space above.',
        );
      } else if (id === 'fadh2' && zone === 'entry-2') {
        sim.current = feed(sim.current, 'FADH2');
        sfx.drop();
        say(
          'FADH₂ enters through Complex II, straight to Q — it skips Complex I, so it pumps fewer protons and makes less ATP.',
        );
      } else if (id === 'nadh' || id === 'fadh2') {
        sfx.nope();
        say(
          id === 'nadh'
            ? 'NADH delivers its electrons to Complex I.'
            : 'FADH₂ delivers its electrons through Complex II (the side door to Q).',
          'hint',
        );
      }
    },
    [phase, placed, tray, onStage],
  );

  const togglePoison = (k: keyof Poisons) => {
    const on = !poisons[k];
    setPoisons((p) => ({ ...p, [k]: on }));
    if (!on) return;
    setTriedPoison(true);
    onStage?.(5);
    sfx.nope();
    say(
      {
        cyanide:
          'Cyanide jams Complex IV. Electrons can’t reach oxygen, the whole chain backs up, pumping stops — and ATP production crashes. That’s why cyanide is so deadly.',
        oligomycin:
          'Oligomycin plugs ATP synthase. Protons pile up until the pumps can’t push any more, and the chain grinds to a halt.',
        dnp: 'DNP pokes holes for protons to leak back without ATP synthase. Energy escapes as HEAT. (Brown fat does this on purpose to keep you warm!)',
      }[k],
      'hint',
    );
  };

  const s = sim.current;
  const time = reduce ? 0 : performance.now() / 1000;
  const built = (i: number) => placed.length > i;

  return (
    <div className="flex flex-col gap-3">
      <Prompt>
        {phase === 'build'
          ? 'Build the electron transport chain inside the inner mitochondrial membrane.'
          : 'Feed electrons in and keep the proton gradient flowing. Can you make 10 ATP? Then sabotage it!'}
      </Prompt>
      <DndArena onDrop={onDrop}>
        <div className="relative">
          <svg
            viewBox="0 0 900 430"
            className="w-full rounded-3xl ring-1 ring-black/10"
            role="img"
            aria-label={`Electron transport chain. ${s.gradient.toFixed(0)} protons in the gradient. ${s.atp} ATP made.`}
          >
            <rect width="900" height={MEM_TOP} fill="#fdf2f8" />
            <rect y={MEM_BOT} width="900" height={430 - MEM_BOT} fill="#fefce8" />
            <text x="12" y="22" fontSize="13" fontWeight="800" fill="#9d174d">
              INTERMEMBRANE SPACE (high H⁺)
            </text>
            <text x="12" y="418" fontSize="13" fontWeight="800" fill="#854d0e">
              MATRIX (inside the mitochondrion)
            </text>
            {/* bilayer */}
            {Array.from({ length: 46 }, (_, i) => (
              <g key={i}>
                <circle cx={10 + i * 20} cy={MEM_TOP + 8} r="7" fill="#fcd34d" />
                <circle cx={10 + i * 20} cy={MEM_BOT - 8} r="7" fill="#fcd34d" />
                <path
                  d={`M${10 + i * 20} ${MEM_TOP + 15} v 22 M${10 + i * 20} ${MEM_BOT - 15} v -22`}
                  stroke="#f59e0b"
                  strokeWidth="2"
                />
              </g>
            ))}
            {/* protons in the intermembrane space */}
            {Array.from({ length: Math.round(s.gradient) }, (_, i) => (
              <text
                key={i}
                x={30 + ((i * 53) % 840)}
                y={45 + ((i * 37) % 115)}
                fontSize="13"
                fontWeight="900"
                fill="#db2777"
              >
                H⁺
              </text>
            ))}
            {/* electron path */}
            {phase === 'run' && (
              <path
                d={`M 130 230 L 240 215 L 350 200 L 460 160 L 570 200 L 570 280`}
                stroke="#a5b4fc"
                strokeWidth="3"
                strokeDasharray="6 5"
                fill="none"
              />
            )}
            {/* complexes */}
            {PARTS.map((p, i) =>
              built(i) ? (
                <motion.g
                  key={p.id}
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {p.id === 'q' ? (
                    <circle
                      cx={p.x}
                      cy="212"
                      r="22"
                      fill={p.color}
                      stroke="#1e1b2e"
                      strokeWidth="2.5"
                    />
                  ) : p.id === 'cytc' ? (
                    <circle
                      cx={p.x}
                      cy="155"
                      r="20"
                      fill={p.color}
                      stroke="#1e1b2e"
                      strokeWidth="2.5"
                    />
                  ) : (
                    <rect
                      x={p.x - 38}
                      y="140"
                      width="76"
                      height="140"
                      rx="26"
                      fill={p.color}
                      stroke="#1e1b2e"
                      strokeWidth="3"
                      opacity={poisons.cyanide && p.id === 'c4' ? 0.45 : 1}
                    />
                  )}
                  <text
                    x={p.x}
                    y={p.id === 'cytc' ? 160 : p.id === 'q' ? 217 : 215}
                    textAnchor="middle"
                    fontSize={p.short.length > 2 ? 11 : 16}
                    fontWeight="900"
                    fill="#1e1b2e"
                  >
                    {p.short}
                  </text>
                  {poisons.cyanide && p.id === 'c4' && (
                    <Icon name="skull" size={26} x={p.x + 14} y={128} />
                  )}
                </motion.g>
              ) : (
                <rect
                  key={p.id}
                  x={p.x - 38}
                  y="140"
                  width="76"
                  height="140"
                  rx="26"
                  fill="white"
                  fillOpacity="0.6"
                  stroke="#94a3b8"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                />
              ),
            )}
            {/* complex II side entrance */}
            {phase === 'run' && (
              <g>
                <rect
                  x="205"
                  y="250"
                  width="70"
                  height="48"
                  rx="16"
                  fill="#a78bfa"
                  stroke="#1e1b2e"
                  strokeWidth="2.5"
                />
                <text x="240" y="279" textAnchor="middle" fontSize="14" fontWeight="900">
                  II
                </text>
              </g>
            )}
            {/* water at IV */}
            {phase === 'run' && (
              <text x="600" y="300" fontSize="13" fontWeight="800" fill="#1d4ed8">
                ½O₂ + 2H⁺ → H₂O ×{s.water}
              </text>
            )}
            {/* ATP synthase */}
            <g opacity={phase === 'run' ? 1 : 0.35}>
              <rect
                x={SYNTHASE_X - 30}
                y="150"
                width="60"
                height="120"
                rx="14"
                fill="#14b8a6"
                stroke="#1e1b2e"
                strokeWidth="3"
              />
              <rect x={SYNTHASE_X - 7} y="265" width="14" height="45" fill="#0f766e" />
              <g transform={`rotate(${s.rotor} ${SYNTHASE_X} 340)`}>
                <circle
                  cx={SYNTHASE_X}
                  cy="340"
                  r="38"
                  fill="#5eead4"
                  stroke="#1e1b2e"
                  strokeWidth="3"
                />
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <rect
                    key={a}
                    x={SYNTHASE_X - 4}
                    y="304"
                    width="8"
                    height="18"
                    fill="#0f766e"
                    transform={`rotate(${a} ${SYNTHASE_X} 340)`}
                  />
                ))}
              </g>
              <text
                x={SYNTHASE_X}
                y="216"
                textAnchor="middle"
                fontSize="12"
                fontWeight="900"
                fill="white"
              >
                ATP
              </text>
              <text
                x={SYNTHASE_X}
                y="232"
                textAnchor="middle"
                fontSize="12"
                fontWeight="900"
                fill="white"
              >
                synthase
              </text>
              {poisons.oligomycin && <Icon name="noEntry" size={26} x={SYNTHASE_X + 18} y={138} />}
              {/* protons flowing down through it */}
              {phase === 'run' &&
                !poisons.oligomycin &&
                s.gradient > 1 &&
                [0, 1, 2].map((i) => {
                  const p = (time * 1.5 + i / 3) % 1;
                  return (
                    <text
                      key={i}
                      x={SYNTHASE_X - 6}
                      y={140 + p * 160}
                      fontSize="12"
                      fontWeight="900"
                      fill="#db2777"
                      opacity={1 - p * 0.6}
                    >
                      H⁺
                    </text>
                  );
                })}
            </g>
            {/* DNP leaks */}
            {poisons.dnp &&
              [412, 676].map((x) => (
                <g key={x}>
                  <rect
                    x={x - 8}
                    y={MEM_TOP}
                    width="16"
                    height={MEM_BOT - MEM_TOP}
                    fill="#fecaca"
                    opacity="0.8"
                  />
                  <Icon name="flame" size={22} x={x - 11} y={MEM_BOT + 6} />
                </g>
              ))}
            {/* electrons */}
            {s.electrons.map((e) => {
              const pts = [
                [130, 230],
                [240, 215],
                [350, 200],
                [460, 160],
                [570, 200],
                [570, 280],
              ];
              const i = Math.min(4, Math.floor(e.pos));
              const f = Math.min(1, e.pos - i);
              const x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f;
              const y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
              return (
                <g key={e.id}>
                  <circle cx={x} cy={y} r="11" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="900">
                    e⁻
                  </text>
                </g>
              );
            })}
          </svg>

          {phase === 'build' &&
            PARTS.map((p, i) => (
              <DropZone
                key={p.id}
                id={`slot-${i}`}
                label={`slot ${i + 1}`}
                className="absolute rounded-3xl"
                style={{
                  left: `${((p.x - 40) / 900) * 100}%`,
                  top: `${(135 / 430) * 100}%`,
                  width: `${(80 / 900) * 100}%`,
                  height: `${(150 / 430) * 100}%`,
                }}
              >
                {({ isOver, armed }) => (
                  <div
                    className={`grid h-full w-full place-items-center rounded-3xl text-lg font-black ${isOver ? 'bg-indigo-300/40' : armed && placed.length === i ? 'bg-indigo-200/40' : ''} ${placed.length === i ? 'text-indigo-700' : 'text-transparent'}`}
                  >
                    {placed.length === i ? i + 1 : ''}
                  </div>
                )}
              </DropZone>
            ))}
          {phase === 'run' && (
            <>
              <DropZone
                id="entry-1"
                label="Complex I"
                className="absolute rounded-3xl"
                style={{
                  left: `${(90 / 900) * 100}%`,
                  top: `${(135 / 430) * 100}%`,
                  width: `${(80 / 900) * 100}%`,
                  height: `${(150 / 430) * 100}%`,
                }}
              >
                {({ isOver, armed }) => (
                  <div
                    className={`h-full w-full rounded-3xl ${isOver ? 'ring-4 ring-indigo-400' : armed ? 'ring-2 ring-indigo-300' : ''}`}
                  />
                )}
              </DropZone>
              <DropZone
                id="entry-2"
                label="Complex II"
                className="absolute rounded-2xl"
                style={{
                  left: `${(200 / 900) * 100}%`,
                  top: `${(248 / 430) * 100}%`,
                  width: `${(80 / 900) * 100}%`,
                  height: `${(55 / 430) * 100}%`,
                }}
              >
                {({ isOver, armed }) => (
                  <div
                    className={`h-full w-full rounded-2xl ${isOver ? 'ring-4 ring-indigo-400' : armed ? 'ring-2 ring-indigo-300' : ''}`}
                  />
                )}
              </DropZone>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-2">
          {phase === 'build' ? (
            tray
              .filter((t) => !placed.includes(t.id))
              .map((t) => (
                <Draggable key={t.id} id={t.id} label={t.label}>
                  <span className="block rounded-xl bg-white px-3 py-2 text-sm font-bold shadow ring-1 ring-black/10">
                    {t.label}
                  </span>
                </Draggable>
              ))
          ) : (
            <>
              <Draggable id="nadh" label="NADH">
                <span className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 font-bold shadow ring-1 ring-black/10">
                  <Icon name="battery" size={18} /> NADH
                </span>
              </Draggable>
              <Draggable id="fadh2" label="FADH2">
                <span className="flex items-center gap-1 rounded-xl bg-white px-3 py-2 font-bold shadow ring-1 ring-black/10">
                  <Icon name="battery" size={18} /> FADH₂
                </span>
              </Draggable>
              <button
                className={`chip py-1.5 text-sm ${auto ? 'bg-amber-300 text-amber-950' : 'bg-white ring-1 ring-black/10'}`}
                aria-pressed={auto}
                onClick={() => setAuto(!auto)}
              >
                Krebs cycle auto-feed {auto ? 'on' : 'off'}
              </button>
              <span className="ml-auto flex flex-wrap gap-2">
                <PoisonBtn on={poisons.cyanide} onClick={() => togglePoison('cyanide')}>
                  Cyanide
                </PoisonBtn>
                <PoisonBtn on={poisons.oligomycin} onClick={() => togglePoison('oligomycin')}>
                  Oligomycin
                </PoisonBtn>
                <PoisonBtn on={poisons.dnp} onClick={() => togglePoison('dnp')}>
                  DNP
                </PoisonBtn>
              </span>
            </>
          )}
        </div>
      </DndArena>

      {phase === 'run' && (
        <div className="grid gap-2 sm:grid-cols-3">
          <Stat
            label="Proton gradient"
            value={`${Math.round(s.gradient)} / ${MAX_GRADIENT} H⁺`}
            pct={s.gradient / MAX_GRADIENT}
            color="#db2777"
          />
          <Stat label="ATP made" value={`${s.atp}`} pct={Math.min(1, s.atp / 10)} color="#f59e0b" />
          <Stat
            label="Heat released"
            value={`${Math.round(s.heat)}`}
            pct={Math.min(1, s.heat / 60)}
            color="#ef4444"
          />
        </div>
      )}
      <Feedback text={msg?.text ?? null} tone={msg?.tone} />
      <ul className="flex flex-wrap gap-2 text-sm font-bold" aria-label="Goals">
        <Goal done={phase === 'run'}>Build the chain</Goal>
        <Goal done={madeTen}>Make 10 ATP ({s.atp}/10)</Goal>
        <Goal done={triedPoison}>Try a poison</Goal>
      </ul>
    </div>
  );
}

function PoisonBtn({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`chip py-1.5 text-sm ${on ? 'bg-rose-600 text-white' : 'bg-white text-ink ring-1 ring-black/10'}`}
    >
      {children}
    </button>
  );
}

function Stat({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-2.5 ring-1 ring-black/10">
      <div className="flex justify-between text-sm font-bold">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(100, pct * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

function Goal({ done, children }: { done: boolean; children: React.ReactNode }) {
  return <GoalItem done={done}>{children}</GoalItem>;
}
