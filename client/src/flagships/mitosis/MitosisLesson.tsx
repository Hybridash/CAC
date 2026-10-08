import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DndArena, Draggable, DropZone } from '../../templates/framework/dnd';
import type { TemplateProps } from '../../templates/framework/types';
import { Feedback, Prompt, type FeedbackTone } from '../../templates/framework/ui';
import { sfx } from '../../lib/sound';

type Phase = 'interphase' | 'prophase' | 'metaphase' | 'anaphase' | 'telophase' | 'done';

const PHASES: { id: Phase; label: string; task: string }[] = [
  { id: 'interphase', label: 'Interphase', task: 'Tap each chromosome to copy its DNA.' },
  {
    id: 'prophase',
    label: 'Prophase',
    task: 'Coil up the chromosomes and break down the nucleus.',
  },
  {
    id: 'metaphase',
    label: 'Metaphase',
    task: 'Drag every chromosome onto the middle line (the metaphase plate).',
  },
  {
    id: 'anaphase',
    label: 'Anaphase',
    task: 'Pull the spindle fibers to split each chromosome into two.',
  },
  { id: 'telophase', label: 'Telophase', task: 'Pinch the cell in the middle to make two cells.' },
  { id: 'done', label: 'Two cells!', task: 'Compare the daughter cells with the parent.' },
];

interface Chromo {
  id: string;
  color: string;
  long: boolean;
  /** Interphase position (viewBox 700×360). */
  x: number;
  y: number;
}

const CHROMOS: Chromo[] = [
  { id: 'A1', color: '#ef4444', long: true, x: 290, y: 140 },
  { id: 'A2', color: '#3b82f6', long: true, x: 405, y: 150 },
  { id: 'B1', color: '#ef4444', long: false, x: 310, y: 222 },
  { id: 'B2', color: '#3b82f6', long: false, x: 400, y: 225 },
];
const PLATE_Y = [96, 148, 206, 258];
const W = 700;
const H = 360;

export function MitosisLesson({
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<{ component: string }>) {
  const [phase, setPhase] = useState<Phase>('interphase');
  const [copied, setCopied] = useState<Set<string>>(new Set());
  const [plate, setPlate] = useState<string[]>([]);
  const [pull, setPull] = useState(0);
  const [pinch, setPinch] = useState(0);
  const [cancer, setCancer] = useState(false);
  const [cells, setCells] = useState(2);
  const [msg, setMsg] = useState<{ text: string; tone: FeedbackTone } | null>({
    text: PHASES[0].task,
    tone: 'info',
  });
  const completed = useRef(alreadyDone);
  const idx = PHASES.findIndex((p) => p.id === phase);

  const go = (p: Phase, text: string, tone: FeedbackTone = 'good') => {
    setPhase(p);
    onStage?.(PHASES.findIndex((x) => x.id === p));
    setMsg({ text, tone });
  };

  useEffect(() => {
    if (phase === 'done' && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [phase, onComplete]);

  // Out-of-control division when checkpoints fail.
  useEffect(() => {
    if (!cancer) return;
    const t = setInterval(() => setCells((n) => (n >= 128 ? n : n * 2)), 900);
    return () => clearInterval(t);
  }, [cancer]);

  const copy = (id: string) => {
    if (phase !== 'interphase' || copied.has(id)) return;
    sfx.pop();
    const next = new Set(copied).add(id);
    setCopied(next);
    if (next.size === CHROMOS.length) {
      sfx.correct();
      go(
        'prophase',
        'DNA copied! Each chromosome is now an X: two identical sister chromatids joined in the middle.',
      );
    } else
      setMsg({
        text: `Copied! ${next.size} of ${CHROMOS.length} chromosomes doubled.`,
        tone: 'info',
      });
  };

  const onDrop = (id: string, zone: string) => {
    if (zone !== 'plate' || plate.includes(id)) return;
    sfx.drop();
    const next = [...plate, id];
    setPlate(next);
    if (next.length === CHROMOS.length) {
      sfx.correct();
      go(
        'anaphase',
        'All lined up in single file! A checkpoint now makes sure every chromosome is attached to spindle fibers from BOTH sides.',
      );
    } else
      setMsg({
        text: 'Lined up on the plate. Spindle fibers from both poles grab its middle.',
        tone: 'info',
      });
  };

  const onPull = (v: number) => {
    setPull(v);
    if (v >= 100 && phase === 'anaphase') {
      sfx.whoosh();
      go(
        'telophase',
        'Split! Sister chromatids are pulled to opposite ends. Each end now has one copy of every chromosome.',
      );
    }
  };
  const onPinch = (v: number) => {
    setPinch(v);
    if (v >= 100 && phase === 'telophase') {
      go(
        'done',
        'Two daughter cells, each with the exact same 4 chromosomes as the parent. That’s mitosis! 🎉',
      );
    }
  };

  // ---------- geometry ----------
  const split = phase === 'telophase' || phase === 'done';
  const t = split ? 1 : phase === 'anaphase' ? pull / 100 : 0;
  const pinchT = phase === 'done' ? 1 : phase === 'telophase' ? pinch / 100 : 0;
  const showNucleus =
    phase === 'interphase' || phase === 'done' || (phase === 'telophase' && pinch > 60);
  const spindle =
    phase === 'metaphase' || phase === 'anaphase' || (phase === 'telophase' && pinch < 50);

  const posOf = (c: Chromo, i: number) => {
    if (phase === 'interphase' || phase === 'prophase') return { x: c.x, y: c.y };
    const slot = plate.indexOf(c.id);
    if (phase === 'metaphase') return slot >= 0 ? { x: 350, y: PLATE_Y[slot] } : { x: c.x, y: c.y };
    return { x: 350, y: PLATE_Y[slot >= 0 ? slot : i] };
  };

  return (
    <div className="flex flex-col gap-3">
      <Prompt>{PHASES[idx].task}</Prompt>
      <ol className="flex flex-wrap gap-1" aria-label="Phases">
        {PHASES.map((p, i) => (
          <li
            key={p.id}
            className={`chip py-0.5 text-xs ${i === idx ? 'bg-emerald-600 text-white' : i < idx ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}
            aria-current={i === idx ? 'step' : undefined}
          >
            {i < idx ? '✓ ' : ''}
            {p.label}
          </li>
        ))}
      </ol>
      <DndArena onDrop={onDrop}>
        <div className="relative">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-100 ring-1 ring-black/10"
            role="img"
            aria-label={`Cell in ${PHASES[idx].label}.`}
          >
            <CellOutline pinch={pinchT} stretch={t} />
            {showNucleus &&
              (split && pinchT > 0.6 ? (
                <>
                  <circle
                    cx="200"
                    cy="180"
                    r="62"
                    fill="#ccfbf1"
                    stroke="#0f766e"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                  <circle
                    cx="500"
                    cy="180"
                    r="62"
                    fill="#ccfbf1"
                    stroke="#0f766e"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                  />
                </>
              ) : (
                <circle
                  cx="350"
                  cy="182"
                  r="105"
                  fill="#ccfbf1"
                  stroke="#0f766e"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
              ))}
            {spindle && (
              <g stroke="#94a3b8" strokeWidth="1.5" opacity="0.8">
                {PLATE_Y.map((y) => (
                  <g key={y}>
                    <line x1="150" y1="180" x2={350 - 160 * t} y2={y} />
                    <line x1="550" y1="180" x2={350 + 160 * t} y2={y} />
                  </g>
                ))}
                <circle cx="150" cy="180" r="9" fill="#64748b" />
                <circle cx="550" cy="180" r="9" fill="#64748b" />
              </g>
            )}
            {phase === 'metaphase' && (
              <line
                x1="350"
                x2="350"
                y1="70"
                y2="290"
                stroke="#f59e0b"
                strokeWidth="4"
                strokeDasharray="8 6"
              />
            )}
            {CHROMOS.map((c, i) => {
              const p = posOf(c, i);
              if (phase === 'metaphase' && !plate.includes(c.id)) return null;
              if (phase === 'interphase' && !copied.has(c.id)) return <Thread key={c.id} c={c} />;
              if (t > 0) {
                const dx = 170 * t;
                // After the split, each daughter nucleus holds a neat 2×2 cluster.
                const slot = Math.max(0, plate.indexOf(c.id));
                const ox = slot % 2 ? 20 : -20;
                const oy = slot < 2 ? -22 : 24;
                const lx = split ? 200 + ox : p.x - dx;
                const rx = split ? 500 + ox : p.x + dx;
                const yy = split ? 180 + oy : p.y;
                return (
                  <g key={c.id}>
                    <Chromatid x={lx} y={yy} c={c} />
                    <Chromatid x={rx} y={yy} c={c} />
                  </g>
                );
              }
              return (
                <XChromosome key={c.id} x={p.x} y={p.y} c={c} condensed={phase !== 'interphase'} />
              );
            })}
          </svg>

          {/* Tap targets for copying DNA */}
          {phase === 'interphase' &&
            CHROMOS.map((c) => (
              <button
                key={c.id}
                onClick={() => copy(c.id)}
                disabled={copied.has(c.id)}
                aria-label={`Copy chromosome ${c.id}${copied.has(c.id) ? ' (copied)' : ''}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-extrabold shadow ${copied.has(c.id) ? 'bg-emerald-100 text-emerald-800' : 'animate-pulse bg-amber-300 text-amber-950'}`}
                style={{ left: `${(c.x / W) * 100}%`, top: `${((c.y - 44) / H) * 100}%` }}
              >
                {copied.has(c.id) ? '✓' : '📋 copy'}
              </button>
            ))}

          {/* Draggable chromosomes + the plate drop zone */}
          {phase === 'metaphase' && (
            <>
              <DropZone
                id="plate"
                label="the metaphase plate"
                className="absolute rounded-2xl"
                style={{ left: '44%', top: '15%', width: '12%', height: '70%' }}
              >
                {({ isOver, armed }) => (
                  <div
                    className={`h-full w-full rounded-2xl ${isOver ? 'bg-amber-300/40 ring-4 ring-amber-400' : armed ? 'bg-amber-200/30 ring-2 ring-amber-300' : ''}`}
                  />
                )}
              </DropZone>
              {CHROMOS.filter((c) => !plate.includes(c.id)).map((c) => (
                <div
                  key={c.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${(c.x / W) * 100}%`, top: `${(c.y / H) * 100}%` }}
                >
                  <Draggable
                    id={c.id}
                    label={`${c.long ? 'Long' : 'Short'} ${c.color === '#ef4444' ? 'red' : 'blue'} chromosome`}
                  >
                    <svg width="56" height="64" viewBox="-28 -32 56 64" className="drop-shadow">
                      <XShape c={c} />
                    </svg>
                  </Draggable>
                </div>
              ))}
            </>
          )}
        </div>
      </DndArena>

      {phase === 'prophase' && (
        <button
          className="btn-primary self-start"
          onClick={() =>
            go(
              'metaphase',
              'Chromosomes coiled up tight, the nucleus dissolved, and spindle fibers grew from both ends.',
            )
          }
        >
          🧶 Condense chromosomes & dissolve nucleus
        </button>
      )}
      {phase === 'anaphase' && (
        <label className="flex flex-col gap-1 rounded-2xl bg-white p-3 ring-1 ring-black/10">
          <span className="text-sm font-bold">🪢 Pull the spindle fibers ({pull}%)</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pull}
            onChange={(e) => onPull(Number(e.target.value))}
            className="h-8 accent-emerald-600"
          />
        </label>
      )}
      {phase === 'telophase' && (
        <label className="flex flex-col gap-1 rounded-2xl bg-white p-3 ring-1 ring-black/10">
          <span className="text-sm font-bold">🤏 Pinch the cell in two ({pinch}%)</span>
          <input
            type="range"
            min={0}
            max={100}
            value={pinch}
            onChange={(e) => onPinch(Number(e.target.value))}
            className="h-8 accent-emerald-600"
          />
        </label>
      )}

      {phase === 'done' && (
        <div className="grid gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/10 sm:grid-cols-[1fr_auto]">
          <div>
            <h3 className="font-extrabold">🔬 Checkpoint check</h3>
            <p className="text-sm text-ink-soft">
              Parent cell: 2 long + 2 short chromosomes. Each daughter: 2 long + 2 short. Identical
              copies ✓
            </p>
            {!cancer ? (
              <button
                className="btn-ghost mt-2 text-sm"
                onClick={() => {
                  setCancer(true);
                  onStage?.(6);
                  sfx.nope();
                  setMsg({
                    text: 'Checkpoints broken! These cells ignore “stop” signals and keep dividing. That’s how a tumor forms.',
                    tone: 'hint',
                  });
                }}
              >
                ⚠️ What if the checkpoints break?
              </button>
            ) : (
              <button
                className="btn-ghost mt-2 text-sm"
                onClick={() => {
                  setCancer(false);
                  setCells(2);
                }}
              >
                🩹 Repair the checkpoints
              </button>
            )}
          </div>
          <AnimatePresence>
            {cancer && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex max-w-xs flex-wrap content-start gap-0.5"
                aria-label={`${cells} cells`}
              >
                {Array.from({ length: cells }, (_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-4 w-4 rounded-full bg-rose-400 ring-1 ring-rose-700"
                  />
                ))}
                <span className="w-full text-xs font-bold text-rose-700">
                  {cells} cells and counting…
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Feedback text={msg?.text ?? null} tone={msg?.tone} />
    </div>
  );
}

function CellOutline({ pinch, stretch }: { pinch: number; stretch: number }) {
  const rx = 220 + stretch * 40;
  // The waist narrows as the cell pinches (cleavage furrow); at 1 it splits into two circles.
  if (pinch >= 1) {
    return (
      <g fill="#ecfeff" stroke="#0f766e" strokeWidth="5">
        <ellipse cx="200" cy="180" rx="140" ry="130" />
        <ellipse cx="500" cy="180" rx="140" ry="130" />
      </g>
    );
  }
  const waist = 140 * (1 - pinch * 0.92);
  const d = `M ${350 - rx} 180 C ${350 - rx} 40, 350 ${180 - 140}, 350 ${180 - waist} C 350 ${180 - 140}, ${350 + rx} 40, ${350 + rx} 180 C ${350 + rx} 320, 350 ${180 + 140}, 350 ${180 + waist} C 350 ${180 + 140}, ${350 - rx} 320, ${350 - rx} 180 Z`;
  return <path d={d} fill="#ecfeff" stroke="#0f766e" strokeWidth="5" />;
}

function Thread({ c }: { c: Chromo }) {
  const len = c.long ? 36 : 24;
  return (
    <path
      d={`M ${c.x - len} ${c.y} q ${len / 2} -14 ${len} 0 t ${len} 0`}
      fill="none"
      stroke={c.color}
      strokeWidth="5"
      strokeLinecap="round"
    />
  );
}

function XShape({ c }: { c: Chromo }) {
  const h = c.long ? 26 : 17;
  return (
    <g>
      <rect
        x="-13"
        y={-h}
        width="10"
        height={h * 2}
        rx="5"
        fill={c.color}
        stroke="#1e1b2e"
        strokeWidth="1.5"
        transform="rotate(-14)"
      />
      <rect
        x="3"
        y={-h}
        width="10"
        height={h * 2}
        rx="5"
        fill={c.color}
        stroke="#1e1b2e"
        strokeWidth="1.5"
        transform="rotate(14)"
      />
      <circle r="4.5" fill="#1e1b2e" />
    </g>
  );
}

function XChromosome({
  x,
  y,
  c,
  condensed,
}: {
  x: number;
  y: number;
  c: Chromo;
  condensed: boolean;
}) {
  return (
    <motion.g
      initial={false}
      animate={{ x, y, scale: condensed ? 1 : 0.85 }}
      transition={{ type: 'spring', stiffness: 140, damping: 18 }}
    >
      <XShape c={c} />
    </motion.g>
  );
}

function Chromatid({ x, y, c }: { x: number; y: number; c: Chromo }) {
  const h = c.long ? 24 : 16;
  return (
    <motion.g
      initial={false}
      animate={{ x, y }}
      transition={{ type: 'spring', stiffness: 160, damping: 20 }}
    >
      <rect
        x="-5"
        y={-h}
        width="10"
        height={h * 2}
        rx="5"
        fill={c.color}
        stroke="#1e1b2e"
        strokeWidth="1.5"
      />
    </motion.g>
  );
}
