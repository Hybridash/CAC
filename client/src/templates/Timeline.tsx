import { useEffect, useMemo, useRef, useState } from 'react';
import type { SceneElement, TimelineConfig } from '@bioplay/shared';
import type { TemplateProps } from './framework/types';
import { Feedback, Progress, Prompt, type FeedbackTone } from './framework/ui';
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

/** Drag through time to watch a process unfold. */
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
  const [feedback, setFeedback] = useState<{ text: string; tone: FeedbackTone } | null>(null);
  const completed = useRef(alreadyDone);
  const idx = Math.round(pos);
  const frame = frames[idx];

  useEffect(() => {
    setVisited((v) => (v.has(idx) ? v : new Set(v).add(idx)));
    onStage?.(Math.min(3, Math.floor((idx / Math.max(1, frames.length - 1)) * 3)));
  }, [idx, frames.length, onStage]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setPos((p) => {
        const next = Math.round((p + 0.05) * 100) / 100;
        if (next >= frames.length - 1) {
          setPlaying(false);
          return frames.length - 1;
        }
        return next;
      });
    }, 60);
    return () => clearInterval(t);
  }, [playing, frames.length]);

  const elements = useMemo(() => {
    const i = Math.floor(pos);
    const t = pos - i;
    if (i >= frames.length - 1) return frames[frames.length - 1].elements;
    return blend(frames[i].elements, frames[i + 1].elements, t);
  }, [pos, frames]);

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
    if (frame.id === checkpoint.frame) {
      sfx.correct();
      setFeedback({ text: `Yes! That’s ${frame.label}.`, tone: 'good' });
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

  return (
    <div className="flex flex-col gap-4">
      <Prompt>{config.prompt}</Prompt>
      <Scene
        elements={elements}
        background={config.background ?? '#f5f3ff'}
        height={300}
        label={`${frame.label}: ${frame.text}`}
      >
        <div className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-sm font-extrabold shadow-sm">
          {frame.time && <span className="text-ink-soft">{frame.time} · </span>}
          {frame.label}
        </div>
      </Scene>
      <p
        className="min-h-12 rounded-2xl bg-white p-3 font-semibold ring-1 ring-black/10"
        aria-live="polite"
      >
        {frame.text}
      </p>
      <div className="flex items-center gap-3">
        <button
          className="btn-ghost shrink-0 px-3"
          onClick={() =>
            pos >= frames.length - 1 ? (setPos(0), setPlaying(true)) : setPlaying(!playing)
          }
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <Icon name={playing ? 'pause' : 'play'} size={22} label={playing ? 'Pause' : 'Play'} />
        </button>
        <label className="flex-1">
          <span className="sr-only">Timeline position</span>
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            step={0.01}
            value={pos}
            onChange={(e) => {
              setPlaying(false);
              setPos(Number(e.target.value));
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault();
                setPos((p) => Math.min(frames.length - 1, Math.floor(p) + 1));
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault();
                setPos((p) => Math.max(0, Math.ceil(p) - 1));
              }
            }}
            aria-valuetext={frame.label}
            className="h-8 w-full cursor-pointer accent-fuchsia-600"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-1" aria-hidden>
        {frames.map((f, i) => (
          <button
            key={f.id}
            tabIndex={-1}
            onClick={() => setPos(i)}
            className={`chip py-0.5 text-xs ${i === idx ? 'bg-fuchsia-600 text-white' : visited.has(i) ? 'bg-fuchsia-100 text-fuchsia-900' : 'bg-slate-100 text-slate-500'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {checkpoint && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
          <p className="flex-1 font-bold text-amber-950">
            <Icon name="target" size={20} className="mr-1" /> {checkpoint.prompt}
          </p>
          <button className="btn-primary py-1.5 text-sm" onClick={answer}>
            This moment!
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
