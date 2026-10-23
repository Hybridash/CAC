import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { SceneElement, TimelineConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Feedback, Progress, Prompt, rangeFill, type FeedbackTone } from './framework/ui';
import { Scene } from './framework/Scene';
import { sfx } from '../lib/sound';
import { Icon } from '../components/Icon';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Blend two frames: shared elements glide, others fade in/out. */
function blend(a: SceneElement[], b: SceneElement[], t: number): SceneElement[] {
  const out: SceneElement[] = [];
  const bById = new Map(b.map((e) => [e.id, e]));
  for (const ea of a) {
    const eb = bById.get(ea.id);
    if (eb) {
      out.push({
        ...(t < 0.5 ? ea : eb),
        x: lerp(ea.x, eb.x, t),
        y: lerp(ea.y, eb.y, t),
        size: lerp(ea.size ?? 1, eb.size ?? 1, t),
        rotate: lerp(ea.rotate ?? 0, eb.rotate ?? 0, t),
        opacity: lerp(ea.opacity ?? 1, eb.opacity ?? 1, t),
      });
    } else out.push({ ...ea, opacity: (ea.opacity ?? 1) * (1 - t) });
  }
  const aIds = new Set(a.map((e) => e.id));
  for (const eb of b) if (!aIds.has(eb.id)) out.push({ ...eb, opacity: (eb.opacity ?? 1) * t });
  return out;
}

/** Drag through time to watch a process unfold, like scrubbing through a film. */
export function Timeline({
  config,
  onComplete,
  onStage,
  alreadyDone,
}: TemplateProps<TimelineConfig>) {
  const { frames } = config;
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [cp, setCp] = useState(0);
  const [flash, setFlash] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const completed = useRef(alreadyDone);
  const idx = Math.round(pos);
  const frame = frames[idx];
  const last = frames.length - 1;

  useEffect(() => {
    setVisited((v) => (v.has(idx) ? v : new Set(v).add(idx)));
    onStage?.(Math.min(3, Math.floor((idx / Math.max(1, last)) * 3)));
  }, [idx, last, onStage]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPos((p) => {
        const next = Math.round((p + 0.05) * 100) / 100;
        if (next >= last) {
          setPlaying(false);
          return last;
        }
        return next;
      });
    }, 60);
    return () => clearInterval(t);
  }, [playing, last]);

  const elements = useMemo(() => {
    const i = Math.floor(pos);
    const t = pos - i;
    if (i >= last) return frames[last].elements;
    return blend(frames[i].elements, frames[i + 1].elements, t);
  }, [pos, frames, last]);

  const allVisited = visited.size === frames.length;
  const cpDone = cp >= config.checkpoints.length;
  useEffect(() => {
    if (allVisited && cpDone && !completed.current) {
      completed.current = true;
      sfx.fanfare();
      onComplete();
    }
  }, [allVisited, cpDone, onComplete]);

  const checkpoint = config.checkpoints[cp];
  const answer = () => {
    if (!checkpoint) return;
    setFlash(Date.now());
    if (frame.id === checkpoint.frame) {
      sfx.correct();
      setFeedback({ text: `Snap! Yes — that’s ${frame.label}.`, tone: 'good' });
      setCp((c) => c + 1);
    } else {
      sfx.nope();
      const target = frames.findIndex((f) => f.id === checkpoint.frame);
      setFeedback({
        text: `Not quite — that’s ${frame.label}. Try ${target < idx ? 'earlier' : 'later'}.`,
        tone: 'hint',
      });
    }
  };

  const togglePlay = () => {
    sfx.pop();
    if (pos >= last) {
      setPos(0);
      setPlaying(true);
    } else setPlaying(!playing);
  };

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      {/* The "screen" */}
      <div className="rounded-[1.75rem] bg-slate-900 p-2 shadow-xl sm:p-2.5">
        <div className="relative">
          <Scene
            elements={elements}
            background={config.background ?? '#f5f3ff'}
            height={320}
            label={`${frame.label}: ${frame.text}`}
          >
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full bg-slate-900/85 px-3 py-1 font-mono text-sm font-bold text-white shadow">
              <span
                className={`h-2 w-2 rounded-full ${playing ? 'animate-pulse bg-rose-500' : 'bg-slate-400'}`}
              />
              {frame.time ?? `Stage ${idx + 1}`}
            </div>
            <div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold text-fuchsia-800 shadow">
              {idx + 1} / {frames.length}
            </div>
            <AnimatePresence>
              {flash > 0 && (
                <motion.div
                  key={flash}
                  className="pointer-events-none absolute inset-0 bg-white"
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  aria-hidden
                />
              )}
            </AnimatePresence>
          </Scene>
        </div>
        <div className="mt-2 min-h-16 rounded-2xl bg-slate-800 px-4 py-2.5" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={frame.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="font-semibold text-slate-100"
            >
              <span className="mr-2 font-display text-lg font-extrabold text-fuchsia-300">
                {frame.label}
              </span>
              {frame.text}
            </motion.p>
          </AnimatePresence>
        </div>
        {/* Transport controls */}
        <div className="mt-2 flex items-center gap-3 px-1 pb-1">
          <button
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-b from-fuchsia-500 to-violet-600 text-white shadow-[0_4px_0_#4c1d95] transition active:translate-y-0.5"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            <Icon name={playing ? 'pause' : 'play'} size={30} label={playing ? 'Pause' : 'Play'} />
          </button>
          <div className="relative flex-1">
            <div
              className="pointer-events-none absolute inset-x-[1rem] top-0 flex justify-between"
              aria-hidden
            >
              {frames.map((f, i) => (
                <span
                  key={f.id}
                  className={`h-2 w-2 rounded-full ${i === idx ? 'bg-white' : visited.has(i) ? 'bg-fuchsia-400' : 'bg-slate-600'}`}
                />
              ))}
            </div>
            <label>
              <span className="sr-only">Timeline position</span>
              <input
                type="range"
                min={0}
                max={last}
                step={0.01}
                value={pos}
                onChange={(e) => {
                  setPlaying(false);
                  setPos(Number(e.target.value));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPos((p) => Math.min(last, Math.floor(p) + 1));
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPos((p) => Math.max(0, Math.ceil(p) - 1));
                  }
                }}
                aria-valuetext={frame.label}
                className="bio-range mt-1"
                style={
                  {
                    ...rangeFill(pos, 0, last),
                    '--c1': '#e879f9',
                    '--c2': '#8b5cf6',
                  } as React.CSSProperties
                }
              />
            </label>
          </div>
        </div>
      </div>

      {/* Filmstrip */}
      <div className="flex gap-2 overflow-x-auto pb-1" aria-hidden>
        {frames.map((f, i) => (
          <button
            key={f.id}
            tabIndex={-1}
            onClick={() => {
              setPlaying(false);
              setPos(i);
            }}
            className={`flex min-w-28 shrink-0 flex-col items-start rounded-2xl border-2 px-3 py-2 text-left transition ${
              i === idx
                ? 'border-fuchsia-500 bg-fuchsia-600 text-white shadow-lg'
                : visited.has(i)
                  ? 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-950'
                  : 'border-dashed border-slate-300 bg-white text-slate-500'
            }`}
          >
            <span className="text-[10px] font-extrabold tracking-wider uppercase opacity-75">
              {f.time ?? `Stage ${i + 1}`}
            </span>
            <span className="text-sm leading-tight font-extrabold">{f.label}</span>
            <span className="mt-1 flex gap-0.5 text-base leading-none">
              {f.elements
                .filter((e) => e.emoji)
                .slice(0, 4)
                .map((e) => (
                  <span key={e.id}>{e.emoji}</span>
                ))}
            </span>
          </button>
        ))}
      </div>

      {checkpoint && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-3 ring-2 ring-amber-300">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-200">
            <Icon name="target" size={24} />
          </span>
          <p className="flex-1 font-bold text-amber-950">
            <span className="block text-xs font-extrabold tracking-wider text-amber-700 uppercase">
              Spot the moment {cp + 1} / {config.checkpoints.length}
            </span>
            {checkpoint.prompt}
          </p>
          <button className="btn-primary py-2" onClick={answer}>
            <span aria-hidden>📸</span> This moment!
          </button>
        </div>
      )}
      <Feedback text={feedback?.text ?? null} tone={feedback?.tone} />
      <div className="flex flex-wrap gap-4">
        <Progress value={visited.size} max={frames.length} label="stages seen" />
        {config.checkpoints.length > 0 && (
          <Progress value={cp} max={config.checkpoints.length} label="found" />
        )}
      </div>
    </div>
  );
}
